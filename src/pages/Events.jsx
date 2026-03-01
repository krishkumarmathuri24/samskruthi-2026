import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, MapPin, Users, Ticket, Filter, Search, X, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { useEventsStore, useAuthStore, useTicketStore } from '../store/store'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const CATEGORIES = ['All', 'Music', 'Dance', 'Tech', 'Art', 'Comedy', 'Fashion', 'Sports', 'Literature']

const MOCK_EVENTS = [
    { id: '1', title: 'Battle of Bands', category: 'Music', description: 'Live band competition with top college bands from across the country.', event_date: '2026-08-15T18:00:00', venue: 'Main Stage', capacity: 2000, tickets_booked: 1230, duration: '3 hours', emoji: '🎸' },
    { id: '2', title: 'Dance War', category: 'Dance', description: 'Solo, duo, and group dance competition across classical and contemporary styles.', event_date: '2026-08-15T14:00:00', venue: 'Dance Arena', capacity: 800, tickets_booked: 540, duration: '4 hours', emoji: '💃' },
    { id: '3', title: 'Code Storm', category: 'Tech', description: '24-hour hackathon with exciting problem statements and industry mentors.', event_date: '2026-08-16T09:00:00', venue: 'Tech Hub', capacity: 400, tickets_booked: 320, duration: '24 hours', emoji: '💻' },
    { id: '4', title: 'Rangoli Royale', category: 'Art', description: 'Traditional art competition showcasing intricate designs and creativity.', event_date: '2026-08-16T10:00:00', venue: 'Art Pavilion', capacity: 200, tickets_booked: 87, duration: '3 hours', emoji: '🎨' },
    { id: '5', title: 'Stand-up Nite', category: 'Comedy', description: 'Comedy night featuring student comedians and special celebrity guest.', event_date: '2026-08-16T20:00:00', venue: 'Comedy Club', capacity: 600, tickets_booked: 590, duration: '2 hours', emoji: '🎤' },
    { id: '6', title: 'Fashion Fiesta', category: 'Fashion', description: 'Runway fashion show celebrating cultural couture and modern design.', event_date: '2026-08-17T16:00:00', venue: 'Fashion Hall', capacity: 1000, tickets_booked: 720, duration: '2 hours', emoji: '👗' },
    { id: '7', title: 'Slam Poetry', category: 'Literature', description: 'Express yourself through powerful spoken word performances.', event_date: '2026-08-15T16:00:00', venue: 'Literary Lounge', capacity: 300, tickets_booked: 120, duration: '2 hours', emoji: '📖' },
    { id: '8', title: 'Cricket Clash', category: 'Sports', description: 'Inter-college T20 cricket tournament with massive prize money.', event_date: '2026-08-15T08:00:00', venue: 'Sports Ground', capacity: 5000, tickets_booked: 2300, duration: '8 hours', emoji: '🏑' },
]

// ─── Booking Modal ────────────────────────────────────────────────────────────
function BookingModal({ event, onConfirm, onClose, booking }) {
    const pct = Math.round((event.tickets_booked / event.capacity) * 100)
    const spotsLeft = event.capacity - event.tickets_booked

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 24,
                }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.85, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: 40 }}
                    transition={{ type: 'spring', damping: 20 }}
                    onClick={e => e.stopPropagation()}
                    style={{
                        background: 'var(--deep-navy)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 24,
                        overflow: 'hidden',
                        width: '100%',
                        maxWidth: 480,
                        boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
                    }}
                >
                    {/* Top gradient stripe */}
                    <div style={{ height: 6, background: 'linear-gradient(90deg, #00bcd4, #00e5ff, #7c4dff)' }} />

                    <div style={{ padding: 32 }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ fontSize: '3rem' }}>{event.emoji}</div>
                                <div>
                                    <span className="tag-chip" style={{ marginBottom: 6 }}>{event.category}</span>
                                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-secondary)' }}>
                                        {event.title}
                                    </h2>
                                </div>
                            </div>
                            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 4 }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Event Details */}
                        <div style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: 20, marginBottom: 24 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                {[
                                    { label: 'Date', val: new Date(event.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
                                    { label: 'Time', val: new Date(event.event_date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) },
                                    { label: 'Venue', val: event.venue },
                                    { label: 'Duration', val: event.duration },
                                ].map(({ label, val }) => (
                                    <div key={label}>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>{label}</div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{val}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Availability */}
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    <Users size={13} style={{ display: 'inline', marginRight: 4 }} />
                                    {event.tickets_booked} / {event.capacity} registered
                                </span>
                                <span style={{
                                    fontSize: '0.85rem', fontWeight: 700,
                                    color: spotsLeft < 50 ? '#ff5252' : spotsLeft < 200 ? '#ffab40' : '#00e676'
                                }}>
                                    {spotsLeft < 1 ? 'FULL' : `${spotsLeft} spots left`}
                                </span>
                            </div>
                            <div style={{ height: 8, background: 'rgba(0,229,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                    style={{
                                        height: '100%',
                                        background: pct > 80 ? 'linear-gradient(90deg, #ff5252, #ff6e6e)' : 'linear-gradient(90deg, #00bcd4, #00e5ff)',
                                        borderRadius: 4,
                                    }}
                                />
                            </div>
                        </div>

                        {/* Confirm Button */}
                        <button
                            onClick={onConfirm}
                            disabled={booking}
                            className="btn btn-primary"
                            style={{ width: '100%', justifyContent: 'center', gap: 10, padding: '14px 24px', fontSize: '1rem', fontWeight: 700 }}
                        >
                            {booking ? (
                                <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Booking…</>
                            ) : (
                                <><Ticket size={18} /> Confirm Free Booking</>
                            )}
                        </button>
                        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: 12 }}>
                            Free of charge · Instant confirmation · No payment needed
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

// ─── Success Modal ────────────────────────────────────────────────────────────
function SuccessModal({ ticket, event, onClose }) {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
                }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', damping: 16 }}
                    onClick={e => e.stopPropagation()}
                    style={{
                        background: 'var(--deep-navy)',
                        border: '1px solid rgba(0,230,118,0.3)',
                        borderRadius: 24, overflow: 'hidden',
                        width: '100%', maxWidth: 420,
                        textAlign: 'center',
                        boxShadow: '0 0 60px rgba(0,230,118,0.2)',
                    }}
                >
                    <div style={{ height: 6, background: 'linear-gradient(90deg, #00e676, #69f0ae)' }} />
                    <div style={{ padding: '40px 32px' }}>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', damping: 10 }}
                        >
                            <CheckCircle size={72} color="#00e676" style={{ marginBottom: 16 }} />
                        </motion.div>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#00e676', fontFamily: 'var(--font-secondary)', marginBottom: 8 }}>
                            Ticket Booked!
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                            You're registered for <strong style={{ color: 'var(--text-primary)' }}>{event?.title}</strong>
                        </p>
                        <div style={{
                            background: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.2)',
                            borderRadius: 12, padding: '16px 24px', marginBottom: 24,
                        }}>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Your Ticket Code</div>
                            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#00e676', fontFamily: 'monospace', letterSpacing: 3 }}>
                                {ticket?.ticket_code}
                            </div>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: 24 }}>
                            View your ticket in <strong style={{ color: 'var(--teal-glow)' }}>My Dashboard</strong>
                        </p>
                        <button onClick={onClose} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                            Continue Browsing
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

// ─── Event Card ───────────────────────────────────────────────────────────────
function EventCard({ event, onBook, onCancel, userTickets, bookingId }) {
    const pct = Math.round((event.tickets_booked / event.capacity) * 100)
    const myTicket = userTickets?.find(t => t.event_id === event.id)
    const isFull = event.tickets_booked >= event.capacity
    const isBooking = bookingId === event.id
    const spotsLeft = event.capacity - event.tickets_booked

    return (
        <motion.div
            className="glass-card"
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'visible' }}
        >
            {myTicket && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                        position: 'absolute', top: -10, right: -10,
                        background: 'linear-gradient(135deg, #00e676, #00c853)',
                        borderRadius: '50%', width: 28, height: 28,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 15px rgba(0,230,118,0.5)',
                        zIndex: 10,
                    }}
                >
                    <CheckCircle size={16} color="white" />
                </motion.div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ fontSize: '3rem' }}>{event.emoji}</div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <span className="tag-chip">{event.category}</span>
                    {spotsLeft <= 50 && spotsLeft > 0 && (
                        <span style={{ fontSize: '0.7rem', color: '#ff9800', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <AlertCircle size={11} /> Only {spotsLeft} left!
                        </span>
                    )}
                </div>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, fontFamily: 'var(--font-secondary)' }}>
                {event.title}
            </h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: 20, flex: 1 }}>
                {event.description}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {[
                    { icon: <Calendar size={14} />, text: new Date(event.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                    { icon: <Clock size={14} />, text: `${new Date(event.event_date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} · ${event.duration}` },
                    { icon: <MapPin size={14} />, text: event.venue },
                ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-dim)', fontSize: '0.82rem' }}>
                        <span style={{ color: 'var(--aqua-500)' }}>{item.icon}</span> {item.text}
                    </div>
                ))}
            </div>

            {/* Realtime capacity bar */}
            <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        <Users size={13} />
                        <motion.span key={event.tickets_booked} initial={{ scale: 1.3 }} animate={{ scale: 1 }}>
                            {event.tickets_booked}
                        </motion.span> / {event.capacity}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: pct > 80 ? '#ff5252' : 'var(--teal-glow)', fontWeight: 600 }}>
                        {isFull ? 'FULL' : `${pct}%`}
                    </span>
                </div>
                <div style={{ height: 6, background: 'rgba(0,229,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                    <motion.div
                        animate={{ width: `${Math.min(pct, 100)}%` }}
                        transition={{ duration: 0.6 }}
                        style={{
                            height: '100%',
                            background: pct > 80 ? 'linear-gradient(90deg, #ff5252, #ff6e6e)' : 'linear-gradient(90deg, #00bcd4, #00e5ff)',
                            borderRadius: 3,
                        }}
                    />
                </div>
            </div>

            {/* Book / Cancel Button */}
            {myTicket ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        padding: '12px 20px', borderRadius: 10,
                        background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.3)',
                        color: '#00e676', fontWeight: 700, fontSize: '0.9rem',
                    }}>
                        <CheckCircle size={16} /> Registered · {myTicket.ticket_code}
                    </div>
                    <button
                        onClick={() => onCancel(myTicket.id, event.id)}
                        className="btn btn-ghost"
                        style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem', color: '#ff5252', borderColor: 'rgba(255,82,82,0.2)', padding: '8px 16px' }}
                    >
                        Cancel Registration
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => onBook(event)}
                    disabled={isFull || isBooking}
                    className="btn"
                    style={{
                        width: '100%', justifyContent: 'center', gap: 8,
                        background: isFull ? 'rgba(255,82,82,0.15)' : 'linear-gradient(135deg, #00bcd4, #0097a7)',
                        color: isFull ? '#ff5252' : 'white',
                        border: isFull ? '1px solid rgba(255,82,82,0.3)' : 'none',
                        cursor: isFull ? 'default' : 'pointer',
                    }}
                >
                    {isBooking ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Booking…</> :
                        isFull ? 'Fully Booked' : <><Ticket size={16} /> Book Free Ticket</>
                    }
                </button>
            )}
        </motion.div>
    )
}

// ─── Main Events Page ─────────────────────────────────────────────────────────
export default function Events() {
    const { events, fetchEvents } = useEventsStore()
    const { user, logActivity } = useAuthStore()
    const { userTickets, fetchUserTickets, bookTicket, cancelTicket, loading } = useTicketStore()
    const navigate = useNavigate()
    const [category, setCategory] = useState('All')
    const [search, setSearch] = useState('')
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [successData, setSuccessData] = useState(null)
    const [bookingId, setBookingId] = useState(null)
    const [eventsLoading, setEventsLoading] = useState(true)

    useEffect(() => {
        setEventsLoading(true)
        // Timeout fallback: if Supabase takes >5s, show mock events
        const timeout = setTimeout(() => setEventsLoading(false), 5000)
        fetchEvents().finally(() => {
            clearTimeout(timeout)
            setEventsLoading(false)
        })
        if (user) fetchUserTickets(user.id)
    }, [user])

    // Use real events from DB, fallback to mock if fetch fails
    const allEvents = events.length > 0 ? events : (eventsLoading ? [] : MOCK_EVENTS)

    // ─── Supabase Realtime — live ticket count updates ────────────────────────
    useEffect(() => {
        const channel = supabase
            .channel('events-realtime')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'events' }, (payload) => {
                // Update just that event's count in store
                useEventsStore.setState(state => ({
                    events: state.events.map(e => e.id === payload.new.id ? { ...e, tickets_booked: payload.new.tickets_booked } : e)
                }))
            })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [])

    const filtered = allEvents.filter(e => {
        const matchCat = category === 'All' || e.category === category
        const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
            e.category.toLowerCase().includes(search.toLowerCase())
        return matchCat && matchSearch
    })

    const handleBookOpen = (event) => {
        if (!user) {
            toast.error('Please sign in to book a ticket')
            navigate('/login')
            return
        }
        setSelectedEvent(event)
    }

    const handleConfirmBooking = async () => {
        if (!selectedEvent || !user) return
        setBookingId(selectedEvent.id)
        const eventForSuccess = { ...selectedEvent }
        setSelectedEvent(null)
        try {
            const ticket = await bookTicket(selectedEvent.id, user.id)
            await fetchUserTickets(user.id)
            setSuccessData({ ticket, event: eventForSuccess })
            logActivity('TICKET_BOOKED', { event_id: selectedEvent.id })
        } catch (err) {
            toast.error(err.message || 'Booking failed. Try again.')
        } finally {
            setBookingId(null)
        }
    }

    const handleCancel = async (ticketId, eventId) => {
        if (!window.confirm('Cancel your registration for this event?')) return
        try {
            await cancelTicket(ticketId, eventId)
            await fetchUserTickets(user.id)
            await fetchEvents()
            toast.success('Registration cancelled')
        } catch (err) {
            toast.error(err.message || 'Could not cancel. Try again.')
        }
    }

    return (
        <div style={{ paddingTop: 'var(--nav-height)' }}>
            {/* Booking Modal */}
            {selectedEvent && (
                <BookingModal
                    event={selectedEvent}
                    onConfirm={handleConfirmBooking}
                    onClose={() => setSelectedEvent(null)}
                    booking={bookingId === selectedEvent?.id}
                />
            )}

            {/* Success Modal */}
            {successData && (
                <SuccessModal
                    ticket={successData.ticket}
                    event={successData.event}
                    onClose={() => setSuccessData(null)}
                />
            )}

            {/* Header */}
            <div style={{ background: 'var(--gradient-hero)', padding: '80px 0 60px', position: 'relative', zIndex: 10 }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <span className="badge" style={{ marginBottom: 20 }}>
                            <span className="notif-dot" />&nbsp; {allEvents.length} Events · Live Updates
                        </span>
                        <h1 className="section-title" style={{ marginBottom: 16 }}>Upcoming Events</h1>
                        <p className="section-subtitle" style={{ marginBottom: 0 }}>
                            Book free tickets instantly. Seat counts update in real-time!
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="section" style={{ position: 'relative', zIndex: 10, paddingTop: 40 }}>
                <div className="container">
                    {/* Filters */}
                    <div style={{ marginBottom: 36, display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div style={{ position: 'relative', maxWidth: 480 }}>
                            <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                            <input
                                className="form-input"
                                style={{ paddingLeft: 48 }}
                                placeholder="Search events..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                            <Filter size={16} color="var(--text-dim)" />
                            {CATEGORIES.map(c => (
                                <button
                                    key={c}
                                    onClick={() => setCategory(c)}
                                    style={{
                                        padding: '6px 16px', borderRadius: 50, fontSize: '0.85rem', fontWeight: 500,
                                        cursor: 'pointer', border: '1px solid', transition: 'all 0.2s',
                                        background: category === c ? 'linear-gradient(135deg, #00bcd4, #0097a7)' : 'transparent',
                                        borderColor: category === c ? 'transparent' : 'var(--glass-border)',
                                        color: category === c ? 'white' : 'var(--text-secondary)',
                                        boxShadow: category === c ? '0 4px 15px rgba(0,188,212,0.3)' : 'none',
                                    }}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Events Grid */}
                    {eventsLoading ? (
                        <div style={{ textAlign: 'center', padding: '80px 0' }}>
                            <div className="loader" style={{ margin: '0 auto 16px' }} />
                            <p style={{ color: 'var(--text-dim)' }}>Loading events…</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-dim)' }}>
                            <div style={{ fontSize: '4rem', marginBottom: 16 }}>🔍</div>
                            <h3 style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>No events found</h3>
                            <p>Try adjusting your search or filters</p>
                        </motion.div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            <motion.div key="grid" className="grid-3">
                                {filtered.map(event => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        onBook={handleBookOpen}
                                        onCancel={handleCancel}
                                        userTickets={userTickets}
                                        bookingId={bookingId}
                                    />
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    )
}
