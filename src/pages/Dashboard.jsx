import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Ticket, Calendar, MapPin, Clock, User, QrCode, LogOut, ExternalLink, Trash2 } from 'lucide-react'
import { useAuthStore, useTicketStore } from '../store/store'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'

// ─── Ticket Card ──────────────────────────────────────────────────────────────
function TicketCard({ ticket, onCancel }) {
    const event = ticket.events || {}
    const statusColor = ticket.status === 'confirmed' ? '#00e676' : '#ffab40'

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: 20,
                overflow: 'hidden',
                backdropFilter: 'blur(20px)',
            }}
        >
            {/* Color stripe */}
            <div style={{ height: 5, background: 'linear-gradient(90deg, #00bcd4, #00e5ff, #7c4dff)' }} />

            <div style={{ padding: '24px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ fontSize: '2.5rem' }}>{event.emoji || '🎫'}</div>
                        <div>
                            <span className="tag-chip" style={{ marginBottom: 6 }}>{event.category || 'Event'}</span>
                            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-secondary)' }}>
                                {event.title || 'Event'}
                            </h3>
                        </div>
                    </div>
                    <span style={{
                        padding: '4px 12px', borderRadius: 50, fontSize: '0.72rem',
                        fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
                        background: `${statusColor}15`, color: statusColor,
                        border: `1px solid ${statusColor}30`,
                    }}>
                        {ticket.status === 'confirmed' ? '✓ Confirmed' : '⏳ Pending'}
                    </span>
                </div>

                {/* Dashed divider */}
                <div style={{ borderTop: '2px dashed rgba(0,229,255,0.15)', margin: '16px 0' }} />

                {/* Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                    {[
                        { label: 'Date', val: event.event_date ? new Date(event.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
                        { label: 'Time', val: event.event_date ? new Date(event.event_date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—' },
                        { label: 'Venue', val: event.venue || '—' },
                        { label: 'Booked On', val: new Date(ticket.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) },
                    ].map(({ label, val }) => (
                        <div key={label}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>{label}</div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>{val}</div>
                        </div>
                    ))}
                </div>

                {/* Ticket Code */}
                <div style={{
                    background: 'rgba(0,229,255,0.05)', border: '1px dashed rgba(0,229,255,0.2)',
                    borderRadius: 12, padding: '14px 18px', marginBottom: 16,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>Ticket Code</div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--teal-glow)', fontFamily: 'monospace', letterSpacing: 2 }}>
                            {ticket.ticket_code}
                        </div>
                    </div>
                    <QrCode size={36} color="rgba(0,229,255,0.4)" />
                </div>

                {/* Cancel */}
                <button
                    onClick={() => onCancel(ticket.id, ticket.event_id)}
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '9px 16px', borderRadius: 10,
                        background: 'rgba(255,82,82,0.06)', border: '1px solid rgba(255,82,82,0.2)',
                        color: '#ff5252', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,82,82,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,82,82,0.06)'}
                >
                    <Trash2 size={14} /> Cancel Registration
                </button>
            </div>
        </motion.div>
    )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
    const { user, profile, signOut, logActivity } = useAuthStore()
    const { userTickets, fetchUserTickets, cancelTicket, loading } = useTicketStore()
    const navigate = useNavigate()

    useEffect(() => {
        if (user) {
            fetchUserTickets(user.id)
            logActivity('DASHBOARD_VISIT')
        }
    }, [user])

    const handleSignOut = async () => {
        await signOut()
        toast.success('Signed out successfully')
        navigate('/')
    }

    const handleCancel = async (ticketId, eventId) => {
        if (!window.confirm('Cancel your registration for this event?')) return
        try {
            await cancelTicket(ticketId, eventId)
            toast.success('Registration cancelled')
        } catch (err) {
            toast.error(err.message || 'Could not cancel')
        }
    }

    const confirmedTickets = userTickets.filter(t => t.status === 'confirmed')
    const avatarSrc = profile?.avatar_url

    return (
        <div style={{ paddingTop: 'var(--nav-height)', minHeight: '100vh', position: 'relative', zIndex: 10 }}>
            <div className="section">
                <div className="container">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                            <div style={{
                                width: 64, height: 64, borderRadius: '50%',
                                background: avatarSrc ? 'transparent' : 'linear-gradient(135deg, #00bcd4, #7c4dff)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.6rem', fontWeight: 700, color: 'white',
                                border: '3px solid rgba(0,229,255,0.4)',
                                boxShadow: '0 0 20px rgba(0,229,255,0.3)',
                                overflow: 'hidden',
                            }}>
                                {avatarSrc
                                    ? <img src={avatarSrc} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    : (profile?.name || user?.email)?.[0]?.toUpperCase() || 'U'
                                }
                            </div>
                            <div>
                                <h1 style={{ fontFamily: 'var(--font-secondary)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                                    My Dashboard
                                </h1>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    Welcome back, <strong style={{ color: 'var(--teal-glow)' }}>{profile?.name || user?.email?.split('@')[0] || user?.phone || 'User'}</strong>!
                                </p>
                            </div>
                        </div>
                        <button onClick={handleSignOut} className="btn btn-ghost" style={{ gap: 8, color: '#ff5252', borderColor: 'rgba(255,82,82,0.3)' }}>
                            <LogOut size={16} /> Sign Out
                        </button>
                    </motion.div>

                    {/* Stats */}
                    <div className="grid-4" style={{ marginBottom: 48 }}>
                        {[
                            { icon: <Ticket size={22} />, val: userTickets.length, label: 'My Tickets', color: '#00e5ff' },
                            { icon: <Calendar size={22} />, val: confirmedTickets.length, label: 'Confirmed', color: '#00e676' },
                            { icon: <User size={22} />, val: profile?.role === 'admin' ? 'Admin' : 'Attendee', label: 'My Role', color: '#7c4dff' },
                            { icon: <QrCode size={22} />, val: '3 Days', label: 'Fest Duration', color: '#ffab40' },
                        ].map((s, i) => (
                            <motion.div
                                key={s.label}
                                className="glass-card"
                                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20 }}
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                            >
                                <div style={{
                                    width: 48, height: 48, borderRadius: 12,
                                    background: `${s.color}18`, border: `1px solid ${s.color}40`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: s.color, flexShrink: 0,
                                }}>{s.icon}</div>
                                <div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-secondary)', lineHeight: 1 }}>{s.val}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: 3 }}>{s.label}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Tickets Section */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <h2 style={{ fontFamily: 'var(--font-secondary)', color: 'var(--text-primary)', fontSize: '1.4rem' }}>
                            My Tickets {userTickets.length > 0 && <span style={{ color: 'var(--teal-glow)' }}>({userTickets.length})</span>}
                        </h2>
                        <Link to="/events" className="btn btn-ghost" style={{ gap: 8, fontSize: '0.88rem' }}>
                            <ExternalLink size={14} /> Browse Events
                        </Link>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px 0' }}>
                            <div className="loader" style={{ margin: '0 auto 12px' }} />
                            <p style={{ color: 'var(--text-dim)' }}>Loading your tickets…</p>
                        </div>
                    ) : userTickets.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="glass-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
                            <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎫</div>
                            <h3 style={{ color: 'var(--text-primary)', marginBottom: 10 }}>No tickets yet</h3>
                            <p style={{ color: 'var(--text-dim)', marginBottom: 24 }}>
                                Head over to Events and book your free spots!
                            </p>
                            <Link to="/events" className="btn btn-primary">Browse Events</Link>
                        </motion.div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            <div className="grid-2">
                                {userTickets.map((ticket) => (
                                    <TicketCard key={ticket.id} ticket={ticket} onCancel={handleCancel} />
                                ))}
                            </div>
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    )
}
