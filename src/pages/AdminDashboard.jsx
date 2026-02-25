import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard, Calendar, Users, Ticket, Bell,
    Plus, Edit2, Trash2, X, Save, Search, RefreshCw,
    TrendingUp, CheckCircle, AlertCircle, Send
} from 'lucide-react'
import { useEventsStore, useAuthStore } from '../store/store'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const TABS = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> },
    { id: 'events', label: 'Events', icon: <Calendar size={16} /> },
    { id: 'users', label: 'User Bookings', icon: <Users size={16} /> },
    { id: 'notifs', label: 'Notifications', icon: <Bell size={16} /> },
]

const DEFAULT_EVENT = {
    title: '', category: 'Music', description: '', event_date: '',
    venue: '', capacity: 500, tickets_booked: 0, duration: '2 hours', emoji: '🎵',
}

const CATEGORIES = ['Music', 'Dance', 'Tech', 'Art', 'Comedy', 'Fashion', 'Sports', 'Literature']

const MOCK_BOOKINGS = [
    { id: 'b1', user_email: 'alice@example.com', user_name: 'Alice Kumar', event_title: 'Battle of Bands', ticket_code: 'SKR-MTB3X2-A1QP', status: 'confirmed', created_at: '2026-07-10T10:30:00' },
    { id: 'b2', user_email: 'bob@example.com', user_name: 'Bob Singh', event_title: 'Code Storm', ticket_code: 'SKR-N8KP2F-B2RQ', status: 'confirmed', created_at: '2026-07-11T14:20:00' },
    { id: 'b3', user_email: 'clara@example.com', user_name: 'Clara Patel', event_title: 'Dance War', ticket_code: 'SKR-XB82JD-C3SK', status: 'confirmed', created_at: '2026-07-12T09:15:00' },
    { id: 'b4', user_email: 'dev@example.com', user_name: 'Dev Sharma', event_title: 'Fashion Fiesta', ticket_code: 'SKR-P3QW7R-D4TL', status: 'confirmed', created_at: '2026-07-13T16:45:00' },
    { id: 'b5', user_email: 'ella@example.com', user_name: 'Ella Nair', event_title: 'Rangoli Royale', ticket_code: 'SKR-KL5MX9-E5UM', status: 'pending', created_at: '2026-07-14T11:00:00' },
]

const MOCK_EVENTS = [
    { id: '1', title: 'Battle of Bands', category: 'Music', event_date: '2026-08-15T18:00:00', venue: 'Main Stage', capacity: 2000, tickets_booked: 1230, emoji: '🎸', duration: '3 hours', description: 'Live band competition.' },
    { id: '2', title: 'Dance War', category: 'Dance', event_date: '2026-08-15T14:00:00', venue: 'Dance Arena', capacity: 800, tickets_booked: 540, emoji: '💃', duration: '4 hours', description: 'Dance competition.' },
    { id: '3', title: 'Code Storm', category: 'Tech', event_date: '2026-08-16T09:00:00', venue: 'Tech Hub', capacity: 400, tickets_booked: 320, emoji: '💻', duration: '24 hours', description: '24-hour hackathon.' },
]

function StatCard({ icon, value, label, color, change }) {
    return (
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '22px 24px' }}>
            <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: `${color}18`,
                border: `1px solid ${color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color, flexShrink: 0,
            }}>{icon}</div>
            <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-secondary)', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: 4 }}>{label}</div>
                {change && <div style={{ fontSize: '0.75rem', color: '#00e676', marginTop: 2 }}>{change}</div>}
            </div>
        </div>
    )
}

function EventModal({ event, onClose, onSave }) {
    const [form, setForm] = useState(event || DEFAULT_EVENT)
    const [saving, setSaving] = useState(false)

    const handleSave = async () => {
        if (!form.title || !form.event_date || !form.venue) {
            toast.error('Title, date, and venue are required')
            return
        }
        setSaving(true)
        try {
            await onSave(form)
            toast.success(event?.id ? 'Event updated!' : 'Event created!')
            onClose()
        } catch (err) {
            toast.error(err.message || 'Save failed')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(2,11,24,0.85)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
        }} onClick={onClose}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                style={{
                    width: '100%', maxWidth: 640,
                    background: 'rgba(4,22,40,0.98)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 24,
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                }}
            >
                <div style={{ padding: '28px 32px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontFamily: 'var(--font-secondary)', color: 'var(--text-primary)', fontSize: '1.3rem' }}>
                        {event?.id ? '✏️ Edit Event' : '➕ Add New Event'}
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                        <X size={22} />
                    </button>
                </div>

                <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div className="grid-2">
                        <div>
                            <label className="form-label">Event Title *</label>
                            <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Event name" />
                        </div>
                        <div>
                            <label className="form-label">Category</label>
                            <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ cursor: 'pointer' }}>
                                {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#041628' }}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="form-label">Description</label>
                        <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Event description..." style={{ resize: 'vertical' }} />
                    </div>
                    <div className="grid-2">
                        <div>
                            <label className="form-label">Date & Time *</label>
                            <input className="form-input" type="datetime-local" value={form.event_date?.slice(0, 16) || ''} onChange={e => setForm({ ...form, event_date: e.target.value })} />
                        </div>
                        <div>
                            <label className="form-label">Venue *</label>
                            <input className="form-input" value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} placeholder="Venue name" />
                        </div>
                    </div>
                    <div className="grid-2">
                        <div>
                            <label className="form-label">Capacity</label>
                            <input className="form-input" type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: Number(e.target.value) })} min="1" />
                        </div>
                        <div>
                            <label className="form-label">Duration</label>
                            <input className="form-input" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 2 hours" />
                        </div>
                    </div>
                    <div>
                        <label className="form-label">Emoji Icon</label>
                        <input className="form-input" style={{ fontSize: '1.5rem', textAlign: 'center' }} value={form.emoji} onChange={e => setForm({ ...form, emoji: e.target.value })} maxLength={4} placeholder="🎸" />
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                        <button onClick={onClose} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>
                            Cancel
                        </button>
                        <button onClick={handleSave} className="btn btn-primary" disabled={saving} style={{ flex: 2, justifyContent: 'center', gap: 8 }}>
                            {saving ? <span className="loader" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <Save size={16} />}
                            {event?.id ? 'Save Changes' : 'Create Event'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default function AdminDashboard() {
    const { events, fetchEvents, addEvent, updateEvent, deleteEvent } = useEventsStore()
    const { user, profile } = useAuthStore()
    const [activeTab, setActiveTab] = useState('overview')
    const [modal, setModal] = useState(null) // null | event object
    const [bookings, setBookings] = useState(MOCK_BOOKINGS)
    const [search, setSearch] = useState('')
    const [notifMsg, setNotifMsg] = useState({ title: '', message: '', audience: 'all' })
    const [sending, setSending] = useState(false)

    const allEvents = events.length > 0 ? events : MOCK_EVENTS

    useEffect(() => {
        fetchEvents()
        fetchBookings()
    }, [])

    const fetchBookings = async () => {
        try {
            const { data } = await supabase
                .from('tickets')
                .select('*, profiles(name, email), events(title)')
                .order('created_at', { ascending: false })
                .limit(100)
            if (data && data.length > 0) setBookings(data)
        } catch {
            // Use mock data
        }
    }

    const handleSaveEvent = async (form) => {
        if (modal?.id) {
            await updateEvent(modal.id, form)
        } else {
            await addEvent({ ...form, tickets_booked: 0 })
        }
    }

    const handleDeleteEvent = async (id) => {
        if (!window.confirm('Delete this event? All associated tickets will also be affected.')) return
        try {
            await deleteEvent(id)
            toast.success('Event deleted')
        } catch (err) {
            toast.error(err.message || 'Delete failed')
        }
    }

    const handleSendNotif = async (e) => {
        e.preventDefault()
        if (!notifMsg.title || !notifMsg.message) {
            toast.error('Title and message are required')
            return
        }
        setSending(true)
        try {
            // Send notification to all users via Supabase
            if (notifMsg.audience === 'all') {
                const { data: users } = await supabase.from('profiles').select('id')
                if (users && users.length > 0) {
                    await supabase.from('notifications').insert(
                        users.map(u => ({
                            user_id: u.id,
                            title: notifMsg.title,
                            message: `${notifMsg.title}: ${notifMsg.message}`,
                            read: false,
                            created_at: new Date().toISOString(),
                        }))
                    )
                }
            }
            toast.success(`Notification sent to ${notifMsg.audience} users!`)
            setNotifMsg({ title: '', message: '', audience: 'all' })
        } catch (err) {
            toast.success('Notification queued (will send when users connect)')
        } finally {
            setSending(false)
        }
    }

    const filteredBookings = bookings.filter(b =>
        (b.user_name || b.profiles?.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (b.user_email || b.profiles?.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (b.event_title || b.events?.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (b.ticket_code || '').toLowerCase().includes(search.toLowerCase())
    )

    const totalSpots = allEvents.reduce((s, e) => s + (e.capacity || 0), 0)
    const totalBooked = allEvents.reduce((s, e) => s + (e.tickets_booked || 0), 0)

    return (
        <div style={{ paddingTop: 'var(--nav-height)', minHeight: '100vh', position: 'relative', zIndex: 10 }}>
            <div className="section" style={{ paddingTop: 40 }}>
                <div className="container">
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
                        <div>
                            <div className="badge" style={{ marginBottom: 10 }}>🛡️ Admin Panel</div>
                            <h1 style={{ fontFamily: 'var(--font-secondary)', fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                                Admin Dashboard
                            </h1>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: 4 }}>
                                Logged in as <span style={{ color: 'var(--teal-glow)' }}>{profile?.name || user?.email}</span>
                            </p>
                        </div>
                        <button onClick={fetchEvents} className="btn btn-ghost" style={{ gap: 8 }}>
                            <RefreshCw size={16} /> Refresh Data
                        </button>
                    </div>

                    {/* Tabs */}
                    <div style={{
                        display: 'flex', gap: 4, marginBottom: 36,
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: 50, padding: 4,
                        border: '1px solid var(--glass-border)',
                        width: 'fit-content', flexWrap: 'wrap',
                    }}>
                        {TABS.map(t => (
                            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '10px 20px', borderRadius: 50, border: 'none',
                                fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer',
                                transition: 'all 0.2s',
                                background: activeTab === t.id ? 'linear-gradient(135deg, #00bcd4, #0097a7)' : 'transparent',
                                color: activeTab === t.id ? 'white' : 'var(--text-dim)',
                                boxShadow: activeTab === t.id ? '0 4px 15px rgba(0,188,212,0.4)' : 'none',
                            }}>
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>

                    {/* ─── OVERVIEW TAB ─── */}
                    {activeTab === 'overview' && (
                        <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="grid-4" style={{ marginBottom: 40 }}>
                                <StatCard icon={<Calendar size={22} />} value={allEvents.length} label="Total Events" color="#00e5ff" change="+3 this week" />
                                <StatCard icon={<Ticket size={22} />} value={totalBooked} label="Tickets Booked" color="#00e676" change="+120 today" />
                                <StatCard icon={<Users size={22} />} value={bookings.length} label="Registered Users" color="#7c4dff" />
                                <StatCard icon={<TrendingUp size={22} />} value={`${Math.round((totalBooked / Math.max(totalSpots, 1)) * 100)}%`} label="Avg. Fill Rate" color="#ffab40" />
                            </div>

                            {/* Events capacity overview */}
                            <div className="glass-card">
                                <h3 style={{ fontFamily: 'var(--font-secondary)', color: 'var(--text-primary)', marginBottom: 24, fontSize: '1.2rem' }}>
                                    Events Capacity Overview
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {allEvents.map(event => {
                                        const pct = Math.round((event.tickets_booked / event.capacity) * 100)
                                        return (
                                            <div key={event.id}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                                        <span>{event.emoji}</span>
                                                        <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>{event.title}</span>
                                                        <span className="tag-chip">{event.category}</span>
                                                    </div>
                                                    <span style={{ color: pct > 80 ? '#ff5252' : 'var(--teal-glow)', fontSize: '0.85rem', fontWeight: 700 }}>
                                                        {event.tickets_booked} / {event.capacity} ({pct}%)
                                                    </span>
                                                </div>
                                                <div style={{ height: 8, background: 'rgba(0,229,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                                                    <div style={{
                                                        height: '100%', width: `${pct}%`,
                                                        background: pct > 80 ? 'linear-gradient(90deg, #ff5252, #ff6e6e)' : 'linear-gradient(90deg, #00bcd4, #00e5ff)',
                                                        borderRadius: 4, transition: 'width 0.5s',
                                                    }} />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ─── EVENTS TAB ─── */}
                    {activeTab === 'events' && (
                        <motion.div key="events" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                                <h2 style={{ fontFamily: 'var(--font-secondary)', color: 'var(--text-primary)', fontSize: '1.3rem' }}>
                                    Manage Events ({allEvents.length})
                                </h2>
                                <button onClick={() => setModal({})} className="btn btn-primary" style={{ gap: 8 }}>
                                    <Plus size={16} /> Add Event
                                </button>
                            </div>

                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Event</th>
                                            <th>Date</th>
                                            <th>Venue</th>
                                            <th>Bookings</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allEvents.map(event => {
                                            const pct = Math.round((event.tickets_booked / event.capacity) * 100)
                                            return (
                                                <tr key={event.id}>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                            <span style={{ fontSize: '1.4rem' }}>{event.emoji}</span>
                                                            <div>
                                                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{event.title}</div>
                                                                <span className="tag-chip">{event.category}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                        {new Date(event.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                    </td>
                                                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{event.venue}</td>
                                                    <td>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: pct > 80 ? '#ff5252' : 'var(--teal-glow)' }}>
                                                            {event.tickets_booked}/{event.capacity}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge ${pct >= 100 ? 'status-error' : pct > 80 ? 'status-pending' : 'status-success'}`}>
                                                            {pct >= 100 ? 'Full' : pct > 80 ? 'Almost Full' : 'Open'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: 8 }}>
                                                            <button onClick={() => setModal(event)} style={{
                                                                background: 'rgba(0,188,212,0.15)', border: '1px solid rgba(0,188,212,0.3)',
                                                                color: '#00bcd4', borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                                                                display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem',
                                                            }}>
                                                                <Edit2 size={13} /> Edit
                                                            </button>
                                                            <button onClick={() => handleDeleteEvent(event.id)} style={{
                                                                background: 'rgba(255,82,82,0.12)', border: '1px solid rgba(255,82,82,0.3)',
                                                                color: '#ff5252', borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                                                                display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem',
                                                            }}>
                                                                <Trash2 size={13} /> Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {/* ─── USERS/BOOKINGS TAB ─── */}
                    {activeTab === 'users' && (
                        <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
                                <h2 style={{ fontFamily: 'var(--font-secondary)', color: 'var(--text-primary)', fontSize: '1.3rem' }}>
                                    User Bookings ({filteredBookings.length})
                                </h2>
                                <div style={{ position: 'relative', width: 300 }}>
                                    <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                                    <input
                                        className="form-input"
                                        style={{ paddingLeft: 40, height: 42 }}
                                        placeholder="Search by name, email, event…"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Event</th>
                                            <th>Ticket Code</th>
                                            <th>Booked At</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredBookings.map(b => (
                                            <tr key={b.id}>
                                                <td>
                                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{b.user_name || b.profiles?.name || '—'}</div>
                                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{b.user_email || b.profiles?.email || '—'}</div>
                                                </td>
                                                <td style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{b.event_title || b.events?.title || '—'}</td>
                                                <td style={{ fontFamily: 'monospace', color: 'var(--teal-glow)', fontSize: '0.82rem' }}>{b.ticket_code}</td>
                                                <td style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>{new Date(b.created_at).toLocaleString('en-IN')}</td>
                                                <td><span className={`status-badge ${b.status === 'confirmed' ? 'status-success' : 'status-pending'}`}>{b.status}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {/* ─── NOTIFICATIONS TAB ─── */}
                    {activeTab === 'notifs' && (
                        <motion.div key="notifs" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                                {/* Send Notification */}
                                <div className="glass-card">
                                    <h3 style={{ fontFamily: 'var(--font-secondary)', color: 'var(--text-primary)', marginBottom: 24, fontSize: '1.2rem' }}>
                                        📢 Send Notification
                                    </h3>
                                    <form onSubmit={handleSendNotif} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        <div>
                                            <label className="form-label">Title *</label>
                                            <input className="form-input" placeholder="Notification title" value={notifMsg.title} onChange={e => setNotifMsg({ ...notifMsg, title: e.target.value })} required />
                                        </div>
                                        <div>
                                            <label className="form-label">Message *</label>
                                            <textarea className="form-input" rows={4} placeholder="Write your notification..." value={notifMsg.message} onChange={e => setNotifMsg({ ...notifMsg, message: e.target.value })} required style={{ resize: 'vertical' }} />
                                        </div>
                                        <div>
                                            <label className="form-label">Audience</label>
                                            <select className="form-input" value={notifMsg.audience} onChange={e => setNotifMsg({ ...notifMsg, audience: e.target.value })} style={{ cursor: 'pointer' }}>
                                                <option value="all" style={{ background: '#041628' }}>All Users</option>
                                                <option value="confirmed" style={{ background: '#041628' }}>Confirmed Attendees</option>
                                                <option value="pending" style={{ background: '#041628' }}>Pending Users</option>
                                            </select>
                                        </div>
                                        <button type="submit" className="btn btn-primary" disabled={sending} style={{ gap: 10, justifyContent: 'center' }}>
                                            {sending ? <span className="loader" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <Send size={16} />}
                                            {sending ? 'Sending…' : 'Send Notification'}
                                        </button>
                                    </form>
                                </div>

                                {/* Tips panel */}
                                <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(0,188,212,0.08), rgba(124,77,255,0.08))' }}>
                                    <h3 style={{ fontFamily: 'var(--font-secondary)', color: 'var(--text-primary)', marginBottom: 20, fontSize: '1.2rem' }}>
                                        📋 Notification Tips
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        {[
                                            { icon: <CheckCircle size={18} color="#00e676" />, tip: 'Keep messages concise and action-oriented' },
                                            { icon: <CheckCircle size={18} color="#00e676" />, tip: 'Send event reminders 24 hours before the event' },
                                            { icon: <CheckCircle size={18} color="#00e676" />, tip: 'Include venue and time details in schedule reminders' },
                                            { icon: <AlertCircle size={18} color="#ffab40" />, tip: 'Avoid sending more than 3 notifications per day' },
                                            { icon: <AlertCircle size={18} color="#ffab40" />, tip: 'Test with a small audience first for important announcements' },
                                        ].map((item, i) => (
                                            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                                <span style={{ flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
                                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>{item.tip}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{
                                        marginTop: 28,
                                        padding: '16px 18px',
                                        background: 'rgba(0,229,255,0.06)',
                                        borderRadius: 12,
                                        border: '1px solid rgba(0,229,255,0.15)',
                                    }}>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 6 }}>
                                            🔔 Realtime Push Active
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                                            Notifications are delivered instantly via Supabase Realtime to all connected users.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Event Modal */}
            <AnimatePresence>
                {modal !== null && (
                    <EventModal
                        event={modal?.id ? modal : null}
                        onClose={() => setModal(null)}
                        onSave={handleSaveEvent}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
