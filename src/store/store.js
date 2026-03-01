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

    signInWithGoogle: () => {
        // Direct navigation — no async, no API call, not blocked by Safari ITP or popup blocker
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const redirectTo = encodeURIComponent(`${window.location.origin}/auth/callback`)
        const authUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${redirectTo}`
        window.location.href = authUrl
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
        await supabase.auth.signOut()
        set({ user: null, profile: null, isAdmin: false })
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
    loading: false,

    fetchUserTickets: async (userId) => {
        set({ loading: true })
        const { data, error } = await supabase
            .from('tickets')
            .select('*, events(*)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
        if (!error) set({ userTickets: data || [] })
        set({ loading: false })
    },

    bookTicket: async (eventId, userId) => {
        set({ loading: true })
        try {
            const { data: event } = await supabase.from('events').select('capacity, tickets_booked').eq('id', eventId).single()
            if (!event) throw new Error('Event not found')
            if (event.tickets_booked >= event.capacity) throw new Error('Event is fully booked')

            const { data: existing } = await supabase.from('tickets').select('id').eq('event_id', eventId).eq('user_id', userId).maybeSingle()
            if (existing) throw new Error('You already have a ticket for this event')

            const ticketCode = `SKR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
            const { data: ticket, error } = await supabase
                .from('tickets')
                .insert({ event_id: eventId, user_id: userId, ticket_code: ticketCode, status: 'confirmed', created_at: new Date().toISOString() })
                .select('*, events(*)')
                .single()
            if (error) throw error

            // Increment booked count (fire and forget)
            supabase.rpc('increment_tickets', { event_id: eventId }).then(() => { })

            set((state) => ({ userTickets: [ticket, ...state.userTickets] }))
            return ticket
        } finally {
            set({ loading: false })
        }
    },

    cancelTicket: async (ticketId, eventId) => {
        const { error } = await supabase.from('tickets').delete().eq('id', ticketId)
        if (error) throw error
        // Decrement count
        await supabase.rpc('decrement_tickets', { event_id: eventId }).catch(() => {
            // Fallback: manual decrement
            supabase.from('events').select('tickets_booked').eq('id', eventId).single().then(({ data }) => {
                if (data) supabase.from('events').update({ tickets_booked: Math.max(0, data.tickets_booked - 1) }).eq('id', eventId).then(() => { })
            })
        })
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
        const { data, error } = await supabase.from('events').select('*').order('event_date', { ascending: true })
        if (!error && data) set({ events: data })
        set({ loading: false })
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
        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20)

        if (data) {
            set({
                notifications: data,
                unreadCount: data.filter((n) => !n.read).length,
            })
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
