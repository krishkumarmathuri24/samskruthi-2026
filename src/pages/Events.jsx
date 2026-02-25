import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, MapPin, Users, Ticket, Filter, Search } from 'lucide-react'
import { useEventsStore, useAuthStore, useTicketStore } from '../store/store'
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
    { id: '8', title: 'Cricket Clash', category: 'Sports', description: 'Inter-college T20 cricket tournament with massive prize money.', event_date: '2026-08-15T08:00:00', venue: 'Sports Ground', capacity: 5000, tickets_booked: 2300, duration: '8 hours', emoji: '🏏' },
]

function EventCard({ event, onBook, userTickets, loading }) {
    const pct = Math.round((event.tickets_booked / event.capacity) * 100)
    const hasTicket = userTickets?.some(t => t.event_id === event.id)
    const isFull = event.tickets_booked >= event.capacity

    return (
        <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ fontSize: '3rem' }}>{event.emoji}</div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <span className="tag-chip">{event.category}</span>
                    {hasTicket && (
                        <span className="status-badge status-success" style={{ fontSize: '0.7rem' }}>✓ Registered</span>
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

            {/* Capacity bar */}
            <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        <Users size={13} />
                        {event.tickets_booked} / {event.capacity} booked
                    </div>
                    <span style={{ fontSize: '0.8rem', color: pct > 80 ? '#ff5252' : 'var(--teal-glow)', fontWeight: 600 }}>
                        {pct}%
                    </span>
                </div>
                <div style={{ height: 6, background: 'rgba(0,229,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: pct > 80
                            ? 'linear-gradient(90deg, #ff5252, #ff6e6e)'
                            : 'linear-gradient(90deg, #00bcd4, #00e5ff)',
                        borderRadius: 3, transition: 'width 0.5s ease',
                    }} />
                </div>
            </div>

            {/* Book Button */}
            <button
                onClick={() => onBook(event.id)}
                disabled={hasTicket || isFull || loading}
                className="btn"
                style={{
                    width: '100%',
                    justifyContent: 'center',
                    background: hasTicket
                        ? 'rgba(0,230,118,0.15)'
                        : isFull
                            ? 'rgba(255,82,82,0.15)'
                            : 'linear-gradient(135deg, #00bcd4, #0097a7)',
                    color: hasTicket ? '#00e676' : isFull ? '#ff5252' : 'white',
                    border: hasTicket
                        ? '1px solid rgba(0,230,118,0.3)'
                        : isFull
                            ? '1px solid rgba(255,82,82,0.3)'
                            : 'none',
                    cursor: hasTicket || isFull ? 'default' : 'pointer',
                    gap: 8,
                }}
            >
                <Ticket size={16} />
                {hasTicket ? 'Ticket Booked ✓' : isFull ? 'Fully Booked' : 'Book Free Ticket'}
            </button>
        </motion.div>
    )
}

export default function Events() {
    const { events, fetchEvents } = useEventsStore()
    const { user, logActivity } = useAuthStore()
    const { userTickets, fetchUserTickets, bookTicket, loading } = useTicketStore()
    const navigate = useNavigate()
    const [category, setCategory] = useState('All')
    const [search, setSearch] = useState('')

    const allEvents = events.length > 0 ? events : MOCK_EVENTS

    useEffect(() => {
        fetchEvents()
        if (user) fetchUserTickets(user.id)
    }, [user])

    const filtered = allEvents.filter(e => {
        const matchCat = category === 'All' || e.category === category
        const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
            e.category.toLowerCase().includes(search.toLowerCase())
        return matchCat && matchSearch
    })

    const handleBook = async (eventId) => {
        if (!user) {
            toast.error('Please sign in to book a ticket')
            navigate('/login')
            return
        }
        try {
            const ticket = await bookTicket(eventId, user.id)
            await logActivity('TICKET_BOOKED', { event_id: eventId, ticket_code: ticket?.ticket_code })
            toast.success(`🎟️ Ticket booked! Code: ${ticket?.ticket_code || 'SKR-XXXX'}`)
        } catch (err) {
            toast.error(err.message || 'Booking failed. Please try again.')
        }
    }

    return (
        <div style={{ paddingTop: 'var(--nav-height)' }}>
            {/* Header */}
            <div style={{
                background: 'var(--gradient-hero)',
                padding: '80px 0 60px',
                position: 'relative', zIndex: 10,
            }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <span className="badge" style={{ marginBottom: 20 }}>
                            <span className="notif-dot" /> &nbsp; {allEvents.length} Events
                        </span>
                        <h1 className="section-title" style={{ marginBottom: 16 }}>Upcoming Events</h1>
                        <p className="section-subtitle" style={{ marginBottom: 0 }}>
                            Choose your events and book free tickets instantly. Limited spots available!
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="section" style={{ position: 'relative', zIndex: 10, paddingTop: 40 }}>
                <div className="container">
                    {/* Filters */}
                    <div style={{ marginBottom: 36, display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Search */}
                        <div style={{ position: 'relative', maxWidth: 480 }}>
                            <Search size={18} style={{
                                position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                                color: 'var(--text-dim)',
                            }} />
                            <input
                                className="form-input"
                                style={{ paddingLeft: 48 }}
                                placeholder="Search events..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Category Chips */}
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                            <Filter size={16} color="var(--text-dim)" />
                            {CATEGORIES.map(c => (
                                <button
                                    key={c}
                                    onClick={() => setCategory(c)}
                                    style={{
                                        padding: '6px 16px',
                                        borderRadius: 50,
                                        fontSize: '0.85rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        border: '1px solid',
                                        transition: 'all 0.2s',
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
                    <AnimatePresence mode="wait">
                        {filtered.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-dim)' }}
                            >
                                <div style={{ fontSize: '4rem', marginBottom: 16 }}>🔍</div>
                                <h3 style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>No events found</h3>
                                <p>Try adjusting your search or filters</p>
                            </motion.div>
                        ) : (
                            <motion.div key="grid" className="grid-3">
                                {filtered.map(event => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        onBook={handleBook}
                                        userTickets={userTickets}
                                        loading={loading}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
