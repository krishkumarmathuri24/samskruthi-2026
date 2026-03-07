import { create } from 'zustand'
import { supabase } from '../lib/supabase'

// ─── Auth Store ───────────────────────────────────────────────────────────────
export const useAuthStore = create((set, get) => ({
    user: null,
    profile: null,
    loading: true,
    isAdmin: false,

    setUser: (user) => set({ user }),
    setProfile: (profile) => {
        if (profile?.id) {
            try { localStorage.setItem('sk_profile_' + profile.id, JSON.stringify(profile)) } catch (_) { }
        }
        set({ profile })
    },
    setLoading: (loading) => set({ loading }),

    initialize: async () => {
        set({ loading: true })
        const timeout = new Promise((resolve) => setTimeout(resolve, 5000))
        const work = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (session?.user) {
                    // Load cache FIRST for instant display
                    try {
                        const cached = localStorage.getItem('sk_profile_' + session.user.id)
                        if (cached) {
                            const p = JSON.parse(cached)
                            set({ profile: p, isAdmin: p.role === 'admin', user: session.user })
                        }
                    } catch (_) { }
                    await get().fetchProfile(session.user)
                    set({ user: session.user })
                }
            } catch (err) {
                console.warn('Auth init skipped:', err.message)
            }
        }
        await Promise.race([work(), timeout])
        set({ loading: false })
    },

    fetchProfile: async (user) => {
        const KEY = 'sk_profile_' + user.id
        let cachedProfile = null
        try { const c = localStorage.getItem(KEY); if (c) cachedProfile = JSON.parse(c) } catch (_) { }

        try {
            const { data, error } = await supabase
                .from('profiles').select('*').eq('id', user.id).single()

            if (!error && data) {
                // Use whichever is newer — cache wins if user edited recently
                const dbTime = data.updated_at || data.created_at || ''
                const cacheTime = cachedProfile?.updated_at || ''
                const profile = (cachedProfile && cacheTime > dbTime) ? cachedProfile : data
                try { localStorage.setItem(KEY, JSON.stringify(profile)) } catch (_) { }
                set({ profile, isAdmin: profile.role === 'admin' })
            } else if (cachedProfile) {
                // DB read failed — protect cached data, never overwrite with 'User'
                set({ profile: cachedProfile, isAdmin: cachedProfile.role === 'admin' })
            } else {
                // First-ever login — create fresh profile
                const newProfile = {
                    id: user.id,
                    email: user.email || null,
                    name: user.user_metadata?.full_name || user.email?.split('@')[0] || null,
                    avatar_url: user.user_metadata?.avatar_url || null,
                    role: 'user',
                    created_at: new Date().toISOString(),
                    updated_at: new Date(0).toISOString(), // epoch — any edit will be newer
                }
                try { await supabase.from('profiles').upsert(newProfile) } catch (_) { }
                try { localStorage.setItem(KEY, JSON.stringify(newProfile)) } catch (_) { }
                set({ profile: newProfile, isAdmin: false })
            }
        } catch (err) {
            // Network failed — cached data already loaded, leave it
            if (cachedProfile) set({ profile: cachedProfile, isAdmin: cachedProfile.role === 'admin' })
            console.error('fetchProfile error:', err.message)
        }
    },

    signInWithGoogle: async () => {
        // supabase.auth.signInWithOAuth handles PKCE automatically:
        // generates code_verifier → stores in localStorage → redirects to Google
        // Works in ALL browsers including Safari private mode
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                queryParams: { access_type: 'offline', prompt: 'select_account' },
            },
        })
        if (error) {
            console.error('Google sign in error:', error)
            throw error
        }
    },

    signInWithPhone: async (phone) => {
        const { error } = await supabase.auth.signInWithOtp({
            phone,
            options: { channel: 'sms' },
        })
        if (error) throw error
    },

    verifyOtp: async (phone, token) => {
        const { data, error } = await supabase.auth.verifyOtp({
            phone,
            token,
            type: 'sms',
        })
        if (error) throw error
        if (data?.user) {
            await get().fetchProfile(data.user)
            set({ user: data.user })
        }
        return data
    },

    signOut: async () => {
        // Clear local caches FIRST (before network call)
        try {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('sk_profile_') || key.startsWith('sb-')) {
                    localStorage.removeItem(key)
                }
            })
        } catch (_) {}

        // Clear auth state immediately so UI updates
        set({ user: null, profile: null, isAdmin: false })

        // Sign out from Supabase (best-effort)
        try {
            await supabase.auth.signOut()
        } catch (err) {
            console.warn('Sign out warning:', err)
        }
    },

    logActivity: async (action, metadata = {}) => {
        const { user } = get()
        if (!user) return
        try {
            await supabase.from('user_activity_logs').insert({
                user_id: user.id,
                action,
                metadata,
                created_at: new Date().toISOString(),
            })
        } catch (err) {
            console.error('Log activity error:', err)
        }
    },
}))

// ─── Ticket Store ─────────────────────────────────────────────────────────────
export const useTicketStore = create((set, get) => ({
    tickets: [],
    userTickets: [],
    loading: false,      // fetching tickets
    booking: false,      // actively booking a ticket

    fetchUserTickets: async (userId) => {
        set({ loading: true })
        try {
            const query = supabase
                .from('tickets')
                .select('*, events(*)')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
            const timeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('timeout')), 8000)
            )
            const { data, error } = await Promise.race([query, timeout])
            if (!error && data) set({ userTickets: data })
            else if (error) console.warn('fetchUserTickets DB error:', error.message)
        } catch (err) {
            console.warn('fetchUserTickets failed:', err.message)
        } finally {
            set({ loading: false })  // ALWAYS clears — no more infinite spinner
        }
    },

    bookTicket: async (eventId, userId) => {
        set({ booking: true })
        try {
            // 1. Check capacity
            const { data: ev, error: evErr } = await supabase
                .from('events').select('capacity, tickets_booked, title, event_date, venue').eq('id', eventId).single()
            if (evErr) throw new Error('Could not load event: ' + evErr.message)
            if (!ev) throw new Error('Event not found')
            if (ev.tickets_booked >= ev.capacity) throw new Error('Event is fully booked')

            // 2. Check duplicate
            const { data: dup } = await supabase
                .from('tickets').select('id').eq('event_id', eventId).eq('user_id', userId).maybeSingle()
            if (dup) throw new Error('You already have a ticket for this event')

            // 3. Insert ticket (without events join to avoid any RLS join issues)
            const ticketCode = `SKR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
            const { data: newTicket, error: insErr } = await supabase
                .from('tickets')
                .insert({ event_id: eventId, user_id: userId, ticket_code: ticketCode, status: 'confirmed', created_at: new Date().toISOString() })
                .select('*')
                .single()
            if (insErr) throw new Error('Booking failed: ' + insErr.message)

            // 4. Build the ticket object with event data we already have
            const ticket = { ...newTicket, events: ev }

            // 5. Fire-and-forget side effects (NEVER block the ticket)
            setTimeout(() => {
                supabase.rpc('increment_tickets', { event_id: eventId }).catch(() => { })
                supabase.from('notifications').insert({
                    user_id: userId,
                    title: `🎫 Ticket Confirmed — ${ev.title}`,
                    message: `Code: ${ticketCode}`,
                    read: false, created_at: new Date().toISOString(),
                }).catch(() => { })
            }, 100)

            set((state) => ({ userTickets: [ticket, ...state.userTickets] }))
            return ticket
        } finally {
            set({ booking: false })
        }
    },


    cancelTicket: async (ticketId, eventId) => {
        const { error } = await supabase.from('tickets').delete().eq('id', ticketId)
        if (error) throw error

        // Decrement seat count — use try-catch since rpc() doesn't support .catch()
        try {
            await supabase.rpc('decrement_tickets', { event_id: eventId })
        } catch (_) {
            // Fallback: manual decrement if RPC fails
            try {
                const { data } = await supabase.from('events').select('tickets_booked').eq('id', eventId).single()
                if (data) {
                    await supabase.from('events').update({ tickets_booked: Math.max(0, data.tickets_booked - 1) }).eq('id', eventId)
                }
            } catch (_2) { /* ignore */ }
        }

        set((state) => ({ userTickets: state.userTickets.filter(t => t.id !== ticketId) }))
    },

}))

// ─── Events Store ─────────────────────────────────────────────────────────────
export const useEventsStore = create((set) => ({
    events: [],
    loading: false,

    setEvents: (events) => set({ events }),

    fetchEvents: async () => {
        set({ loading: true })
        try {
            const fetchPromise = supabase.from('events').select('*').order('event_date', { ascending: true })
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 6000))
            const { data, error } = await Promise.race([fetchPromise, timeoutPromise])
            if (!error && data) set({ events: data })
        } catch (_) {
            // Network failed or timed out — UI will use mock events fallback
        } finally {
            set({ loading: false })
        }
    },

    addEvent: async (eventData) => {
        const { data, error } = await supabase
            .from('events')
            .insert(eventData)
            .select()
            .single()
        if (error) throw error
        set((state) => ({ events: [...state.events, data] }))
        return data
    },

    updateEvent: async (id, updates) => {
        const { data, error } = await supabase
            .from('events')
            .update(updates)
            .eq('id', id)
            .select()
            .single()
        if (error) throw error
        set((state) => ({
            events: state.events.map((e) => (e.id === id ? data : e)),
        }))
        return data
    },

    deleteEvent: async (id) => {
        const { error } = await supabase.from('events').delete().eq('id', id)
        if (error) throw error
        set((state) => ({ events: state.events.filter((e) => e.id !== id) }))
    },
}))

// ─── Notification Store ────────────────────────────────────────────────────────
export const useNotifStore = create((set, get) => ({
    notifications: [],
    unreadCount: 0,

    fetchNotifications: async (userId) => {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(20)
            if (!error && data) {
                set({
                    notifications: data,
                    unreadCount: data.filter((n) => !n.read).length,
                })
            }
        } catch (err) {
            console.warn('fetchNotifications failed:', err.message)
        }
    },

    markRead: async (notifId) => {
        await supabase.from('notifications').update({ read: true }).eq('id', notifId)
        set((state) => ({
            notifications: state.notifications.map((n) =>
                n.id === notifId ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
        }))
    },

    subscribe: (userId) => {
        const channel = supabase
            .channel(`notifications:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    set((state) => ({
                        notifications: [payload.new, ...state.notifications],
                        unreadCount: state.unreadCount + 1,
                    }))
                }
            )
            .subscribe()
        return () => supabase.removeChannel(channel)
    },
}))
