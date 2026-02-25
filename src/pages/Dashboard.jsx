import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Ticket, Calendar, User, Download, QrCode, LogOut } from 'lucide-react'
import { useAuthStore, useTicketStore } from '../store/store'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const MOCK_TICKETS = [
    { id: 't1', ticket_code: 'SKR-MTB3X2-A1QP', status: 'confirmed', created_at: '2026-07-10T10:30:00', events: { title: 'Battle of Bands', event_date: '2026-08-15T18:00:00', venue: 'Main Stage', category: 'Music', emoji: '🎸' } },
    { id: 't2', ticket_code: 'SKR-N8KP2F-B2RQ', status: 'confirmed', created_at: '2026-07-11T14:20:00', events: { title: 'Code Storm', event_date: '2026-08-16T09:00:00', venue: 'Tech Hub', category: 'Tech', emoji: '💻' } },
]

function TicketCard({ ticket }) {
    const event = ticket.events || {}

    const handleDownload = () => {
        toast.success('Ticket downloaded to your device!')
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: 20,
                overflow: 'hidden',
                backdropFilter: 'blur(20px)',
            }}
        >
            {/* Top stripe */}
            <div style={{
                height: 6,
                background: 'linear-gradient(90deg, #00bcd4, #00e5ff, #7c4dff)',
            }} />

            <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ fontSize: '2.5rem' }}>{event.emoji || '🎫'}</div>
                        <div>
                            <div className="tag-chip" style={{ marginBottom: 6 }}>{event.category || 'Event'}</div>
                            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-secondary)' }}>
                                {event.title || 'Event'}
                            </h3>
                        </div>
                    </div>
                    <span className={`status-badge ${ticket.status === 'confirmed' ? 'status-success' : 'status-pending'}`}>
                        {ticket.status === 'confirmed' ? '✓ Confirmed' : 'Pending'}
                    </span>
                </div>

                {/* Dashed divider */}
                <div style={{
                    borderTop: '2px dashed rgba(0,229,255,0.15)',
                    margin: '16px 0',
                }} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                    <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 1 }}>Date</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                            {event.event_date ? new Date(event.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 1 }}>Time</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                            {event.event_date ? new Date(event.event_date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 1 }}>Venue</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>{event.venue || '—'}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 1 }}>Ticket Code</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--teal-glow)', fontWeight: 700, fontFamily: 'monospace' }}>
                            {ticket.ticket_code}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                    <button
                        onClick={handleDownload}
                        className="btn btn-ghost"
                        style={{ flex: 1, justifyContent: 'center', gap: 8, padding: '10px 16px', fontSize: '0.88rem' }}
                    >
                        <Download size={15} /> Download
                    </button>
                    <button
                        className="btn btn-secondary"
                        style={{ flex: 1, justifyContent: 'center', gap: 8, padding: '10px 16px', fontSize: '0.88rem' }}
                    >
                        <QrCode size={15} /> Show QR
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

export default function Dashboard() {
    const { user, profile, signOut, logActivity } = useAuthStore()
    const { userTickets, fetchUserTickets, loading } = useTicketStore()
    const navigate = useNavigate()

    const tickets = userTickets.length > 0 ? userTickets : MOCK_TICKETS

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
                                background: 'linear-gradient(135deg, #00bcd4, #7c4dff)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.6rem', fontWeight: 700, color: 'white',
                                border: '3px solid rgba(0,229,255,0.4)',
                                boxShadow: '0 0 20px rgba(0,229,255,0.3)',
                                overflow: 'hidden',
                            }}>
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    (profile?.name || user?.email)?.[0]?.toUpperCase() || 'U'
                                )}
                            </div>
                            <div>
                                <h1 style={{ fontFamily: 'var(--font-secondary)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                                    My Dashboard
                                </h1>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    Welcome back, <strong style={{ color: 'var(--teal-glow)' }}>{profile?.name || user?.email || 'User'}</strong>!
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="btn btn-ghost"
                            style={{ gap: 8, color: '#ff5252', borderColor: 'rgba(255,82,82,0.3)' }}
                        >
                            <LogOut size={16} /> Sign Out
                        </button>
                    </motion.div>

                    {/* Overview Stats */}
                    <div className="grid-4" style={{ marginBottom: 48 }}>
                        {[
                            { icon: <Ticket size={22} />, val: tickets.length, label: 'My Tickets', color: '#00e5ff' },
                            { icon: <Calendar size={22} />, val: tickets.filter(t => t.status === 'confirmed').length, label: 'Confirmed', color: '#00e676' },
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
                                    background: `${s.color}18`,
                                    border: `1px solid ${s.color}40`,
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

                    {/* Tickets */}
                    <h2 style={{ fontFamily: 'var(--font-secondary)', color: 'var(--text-primary)', fontSize: '1.4rem', marginBottom: 24 }}>
                        My Tickets ({tickets.length})
                    </h2>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px 0' }}>
                            <div className="loader" />
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
                            <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎫</div>
                            <h3 style={{ color: 'var(--text-primary)', marginBottom: 10 }}>No tickets yet</h3>
                            <p style={{ color: 'var(--text-dim)', marginBottom: 24 }}>Head over to Events and book your free spots!</p>
                            <button onClick={() => navigate('/events')} className="btn btn-primary">Browse Events</button>
                        </div>
                    ) : (
                        <div className="grid-2">
                            {tickets.map((ticket) => (
                                <TicketCard key={ticket.id} ticket={ticket} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
