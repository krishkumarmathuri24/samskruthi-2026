import React, { useState, useEffect, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Ticket, ArrowRight, Music, Trophy, Users, Sparkles, ChevronDown } from 'lucide-react'
import Scene3D from '../components/Scene3D'
import { useEventsStore } from '../store/store'

const FEST_DATE = new Date('2026-08-15T09:00:00')

function useCountdown(target) {
    const [timeLeft, setTimeLeft] = useState({})
    useEffect(() => {
        const calc = () => {
            const diff = target - Date.now()
            if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
            setTimeLeft({
                days: Math.floor(diff / 86400000),
                hours: Math.floor((diff % 86400000) / 3600000),
                minutes: Math.floor((diff % 3600000) / 60000),
                seconds: Math.floor((diff % 60000) / 1000),
            })
        }
        calc()
        const id = setInterval(calc, 1000)
        return () => clearInterval(id)
    }, [target])
    return timeLeft
}

const STATS = [
    { icon: <Users size={24} />, label: 'Attendees', value: '20,000+' },
    { icon: <Music size={24} />, label: 'Events', value: '100+' },
    { icon: <Trophy size={24} />, label: 'Prize Pool', value: '₹10 Lakhs' },
    { icon: <Sparkles size={24} />, label: 'Performers', value: '50+' },
]

const HIGHLIGHTS = [
    { title: 'Battle of Bands', category: 'Music', emoji: '🎸', color: '#00bcd4' },
    { title: 'Fashion Fiesta', category: 'Fashion', emoji: '👗', color: '#7c4dff' },
    { title: 'Code Storm', category: 'Tech', emoji: '💻', color: '#00e5ff' },
    { title: 'Dance War', category: 'Dance', emoji: '💃', color: '#0097a7' },
    { title: 'Rangoli Royale', category: 'Art', emoji: '🎨', color: '#448aff' },
    { title: 'Stand-up Nite', category: 'Comedy', emoji: '🎤', color: '#00bcd4' },
]

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
}

export default function Home() {
    const { days, hours, minutes, seconds } = useCountdown(FEST_DATE)
    const { events, fetchEvents } = useEventsStore()

    useEffect(() => { fetchEvents() }, [])

    return (
        <div style={{ paddingTop: 'var(--nav-height)' }}>
            {/* ── HERO ── */}
            <section style={{
                position: 'relative',
                minHeight: 'calc(100vh - var(--nav-height))',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
            }}>
                {/* 3D Scene background */}
                <div style={{
                    position: 'absolute',
                    inset: 0, zIndex: 1,
                    opacity: 0.9,
                }}>
                    <Suspense fallback={null}>
                        <Scene3D />
                    </Suspense>
                </div>

                {/* Gradient overlay */}
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 2,
                    background: 'linear-gradient(90deg, rgba(2,11,24,0.85) 40%, rgba(2,11,24,0.2) 100%)',
                }} />

                <div className="container" style={{ position: 'relative', zIndex: 3, paddingTop: 40, paddingBottom: 80 }}>
                    <motion.div
                        initial="hidden" animate="visible"
                        variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
                        style={{ maxWidth: 650 }}
                    >
                        <motion.div variants={fadeUp}>
                            <span className="badge" style={{ marginBottom: 24, display: 'inline-flex' }}>
                                <span className="notif-dot" /> &nbsp; August 15–17, 2026
                            </span>
                        </motion.div>

                        <motion.h1 variants={fadeUp} style={{
                            fontSize: 'clamp(3rem, 7vw, 5.5rem)',
                            fontWeight: 900,
                            lineHeight: 1.05,
                            marginBottom: 24,
                            fontFamily: 'var(--font-secondary)',
                        }}>
                            <span style={{ color: 'var(--text-primary)' }}>The Grand</span>
                            <br />
                            <span style={{
                                background: 'linear-gradient(135deg, #00e5ff, #00bcd4, #7c4dff)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                textShadow: 'none',
                            }}>SAMSKRUTHI</span>
                            <br />
                            <span style={{ color: 'var(--text-primary)', fontSize: '0.7em' }}>2026 Festival</span>
                        </motion.h1>

                        <motion.p variants={fadeUp} style={{
                            fontSize: '1.15rem',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.8,
                            marginBottom: 40,
                            maxWidth: 520,
                        }}>
                            Immerse yourself in three days of extraordinary culture, breathtaking
                            performances, and unforgettable memories. Where tradition meets tomorrow.
                        </motion.p>

                        <motion.div variants={fadeUp} style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                            <Link to="/events" className="btn btn-primary" style={{ gap: 10 }}>
                                <Ticket size={18} />
                                Book Free Tickets
                            </Link>
                            <Link to="/events" className="btn btn-secondary" style={{ gap: 10 }}>
                                Explore Events <ArrowRight size={16} />
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Scroll indicator */}
                <div style={{
                    position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)',
                    zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    animation: 'bounce 2s ease infinite',
                }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', letterSpacing: 2, textTransform: 'uppercase' }}>Scroll</span>
                    <ChevronDown size={20} color="var(--teal-glow)" />
                </div>
                <style>{`@keyframes bounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(8px)} }`}</style>
            </section>

            {/* ── COUNTDOWN ── */}
            <section style={{
                position: 'relative', zIndex: 10,
                background: 'rgba(4,22,40,0.8)',
                borderTop: '1px solid var(--glass-border)',
                borderBottom: '1px solid var(--glass-border)',
                padding: '48px 0',
                backdropFilter: 'blur(20px)',
            }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 24 }}>
                        Fest begins in
                    </p>
                    <div className="countdown-grid">
                        {[
                            { val: days, label: 'Days' },
                            { val: hours, label: 'Hours' },
                            { val: minutes, label: 'Minutes' },
                            { val: seconds, label: 'Seconds' },
                        ].map(({ val, label }) => (
                            <div key={label} className="countdown-item" style={{
                                background: 'var(--glass-bg)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: 16, padding: '20px 24px',
                                minWidth: 100,
                            }}>
                                <div className="countdown-number">
                                    {String(val ?? 0).padStart(2, '0')}
                                </div>
                                <div className="countdown-label">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── STATS ── */}
            <section className="section" style={{ position: 'relative', zIndex: 10 }}>
                <div className="container">
                    <div className="grid-4">
                        {STATS.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                className="glass-card"
                                style={{ textAlign: 'center' }}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div style={{
                                    width: 56, height: 56,
                                    background: 'linear-gradient(135deg, rgba(0,188,212,0.2), rgba(0,150,167,0.2))',
                                    borderRadius: 14,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--aqua-400)',
                                    margin: '0 auto 16px',
                                    border: '1px solid rgba(0,188,212,0.3)',
                                }}>
                                    {stat.icon}
                                </div>
                                <div style={{
                                    fontSize: '2rem', fontWeight: 800,
                                    fontFamily: 'var(--font-secondary)',
                                    background: 'var(--gradient-aqua)',
                                    WebkitBackgroundClip: 'text', backgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    marginBottom: 6,
                                }}>
                                    {stat.value}
                                </div>
                                <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── HIGHLIGHTS ── */}
            <section className="section" style={{ position: 'relative', zIndex: 10, paddingTop: 0 }}>
                <div className="container">
                    <h2 className="section-title">Event Highlights</h2>
                    <p className="section-subtitle">From electrifying music to mind-bending tech challenges, there's something for everyone.</p>
                    <div className="divider" />

                    <div className="grid-3">
                        {HIGHLIGHTS.map((h, i) => (
                            <motion.div
                                key={h.title}
                                className="glass-card"
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                                style={{ cursor: 'pointer', textAlign: 'center' }}
                            >
                                <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>{h.emoji}</div>
                                <div className="tag-chip" style={{ marginBottom: 12, background: `${h.color}20`, borderColor: `${h.color}40`, color: h.color }}>
                                    {h.category}
                                </div>
                                <h3 style={{ color: 'var(--text-primary)', fontSize: '1.15rem', fontWeight: 700 }}>
                                    {h.title}
                                </h3>
                            </motion.div>
                        ))}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: 48 }}>
                        <Link to="/events" className="btn btn-primary">
                            View All Events <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── CTA BANNER ── */}
            <section style={{
                position: 'relative', zIndex: 10,
                background: 'linear-gradient(135deg, rgba(0,188,212,0.15), rgba(124,77,255,0.1))',
                border: '1px solid var(--glass-border)',
                margin: '0 0 0 0',
                padding: '80px 0',
            }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 style={{
                            fontSize: 'clamp(2rem, 4vw, 3rem)',
                            fontWeight: 900,
                            fontFamily: 'var(--font-secondary)',
                            color: 'var(--text-primary)',
                            marginBottom: 16,
                        }}>
                            Ready to be part of the<br />
                            <span style={{ background: 'var(--gradient-aqua)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                Legacy?
                            </span>
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: 36, maxWidth: 500, margin: '0 auto 36px' }}>
                            Grab your free ticket now before spots run out.
                            No registration fee — just pure celebration!
                        </p>
                        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/login" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '16px 36px' }}>
                                <Ticket size={20} /> Get My Free Ticket
                            </Link>
                            <Link to="/history" className="btn btn-ghost" style={{ fontSize: '1rem' }}>
                                View Past Fests
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}
