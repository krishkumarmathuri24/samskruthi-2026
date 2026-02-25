import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Users, Music, Star, ChevronDown, ChevronUp } from 'lucide-react'

const HISTORY = [
    {
        year: 2025,
        theme: 'Neon Horizons',
        tagline: 'Where Future Meets Culture',
        attendees: 18000,
        events: 85,
        prizePool: '₹8 Lakhs',
        highlight: 'AR/VR Experience Zone debuted, drawing 5000+ visitors',
        winners: [
            { event: 'Dance War', winner: 'Alpha Dance Academy', college: 'RV College' },
            { event: 'Code Storm', winner: 'Team Vertex', college: 'NITK' },
            { event: 'Battle of Bands', winner: 'The Frequency', college: 'Christ University' },
        ],
        color: '#00e5ff',
        emoji: '🌊',
    },
    {
        year: 2024,
        theme: 'Echoes of Tomorrow',
        tagline: 'Celebrating the Digital Renaissance',
        attendees: 15500,
        events: 72,
        prizePool: '₹6 Lakhs',
        highlight: 'Introduced AI & Robotics events for the first time in college fest history',
        winners: [
            { event: 'Fashion Fiesta', winner: 'Studio Apsara', college: 'Symbiosis' },
            { event: 'Rangoli Royale', winner: 'Kalakaar Team', college: 'BMS College' },
            { event: 'Stand-up Nite', winner: 'Ravi Krishnamurthy', college: 'PES University' },
        ],
        color: '#7c4dff',
        emoji: '🔮',
    },
    {
        year: 2023,
        theme: 'Roots & Wings',
        tagline: 'Heritage Reimagined',
        attendees: 13200,
        events: 65,
        prizePool: '₹5 Lakhs',
        highlight: 'Celebrity performance by national award-winning folk artist Anuradha Krishnan',
        winners: [
            { event: 'Battle of Bands', winner: 'Desert Storm', college: 'IIIT Bangalore' },
            { event: 'Poetry Slam', winner: 'Aisha Mehta', college: 'St. Joseph\'s College' },
            { event: 'Dance War', winner: 'Natyam Academy', college: 'JSS College' },
        ],
        color: '#00bcd4',
        emoji: '🌟',
    },
    {
        year: 2022,
        theme: 'Phoenix Rising',
        tagline: 'Back Stronger After the Pandemic',
        attendees: 10000,
        events: 55,
        prizePool: '₹4 Lakhs',
        highlight: 'First hybrid edition combining in-person and virtual participation from 12 countries',
        winners: [
            { event: 'Hackathon', winner: 'Team Cipher', college: 'IISc' },
            { event: 'Fashion Show', winner: 'Threads & Hues', college: 'MIT Manipal' },
            { event: 'Songs Night', winner: 'Melodic Voices', college: 'Bangalore University' },
        ],
        color: '#ff6e6e',
        emoji: '🦅',
    },
    {
        year: 2021,
        theme: 'Virtual Vibes',
        tagline: 'Digital Celebration of Culture',
        attendees: 8000,
        events: 40,
        prizePool: '₹2 Lakhs',
        highlight: 'First fully virtual edition of Samskruthi — reached audiences in 20+ cities across India',
        winners: [
            { event: 'Online Music Battle', winner: 'BeatDrop Crew', college: 'VIT Vellore' },
            { event: 'Digital Art', winner: 'Pixel Weavers', college: 'CEPT Ahmedabad' },
        ],
        color: '#ffab40',
        emoji: '💻',
    },
]

function HistoryCard({ edition, index }) {
    const [expanded, setExpanded] = useState(false)

    return (
        <motion.div
            initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ display: 'flex', gap: 32, alignItems: 'flex-start', marginBottom: 0 }}
        >
            {/* Timeline connector */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                    width: 56, height: 56,
                    background: `${edition.color}20`,
                    border: `2px solid ${edition.color}60`,
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem',
                    boxShadow: `0 0 20px ${edition.color}30`,
                }}>
                    {edition.emoji}
                </div>
            </div>

            {/* Card */}
            <div className="glass-card" style={{ flex: 1, borderColor: `${edition.color}30` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: edition.color, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
                            Samskruthi {edition.year}
                        </div>
                        <h2 style={{
                            fontSize: '1.6rem', fontWeight: 800,
                            fontFamily: 'var(--font-secondary)',
                            color: 'var(--text-primary)',
                        }}>
                            {edition.theme}
                        </h2>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: 4 }}>{edition.tagline}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                        {[
                            { icon: <Users size={16} />, label: edition.attendees.toLocaleString(), sub: 'Attendees' },
                            { icon: <Star size={16} />, label: edition.events, sub: 'Events' },
                            { icon: <Trophy size={16} />, label: edition.prizePool, sub: 'Prize Pool' },
                        ].map((stat, i) => (
                            <div key={i} style={{ textAlign: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: edition.color, marginBottom: 2, justifyContent: 'center' }}>
                                    {stat.icon}
                                </div>
                                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{stat.label}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{stat.sub}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{
                    padding: '12px 16px',
                    background: `${edition.color}10`,
                    borderRadius: 10,
                    borderLeft: `3px solid ${edition.color}60`,
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    marginBottom: 16,
                }}>
                    ⭐ {edition.highlight}
                </div>

                {/* Expand winners */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: edition.color,
                        display: 'flex', alignItems: 'center', gap: 8,
                        fontSize: '0.88rem', fontWeight: 600,
                        cursor: 'pointer', padding: 0,
                    }}
                >
                    {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {expanded ? 'Hide' : 'Show'} Event Winners
                </button>

                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: 'hidden', marginTop: 16 }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {edition.winners.map((w, i) => (
                                    <div key={i} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '10px 16px',
                                        background: 'rgba(0,229,255,0.03)',
                                        borderRadius: 10,
                                        border: '1px solid rgba(0,229,255,0.08)',
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{w.event}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{w.college}</div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <Trophy size={14} color="#ffd600" />
                                            <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.88rem' }}>{w.winner}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}

export default function History() {
    return (
        <div style={{ paddingTop: 'var(--nav-height)' }}>
            {/* Header */}
            <div style={{ background: 'var(--gradient-hero)', padding: '80px 0 60px', position: 'relative', zIndex: 10 }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <span className="badge" style={{ marginBottom: 20 }}>
                            <Music size={14} /> &nbsp; Est. 2018
                        </span>
                        <h1 className="section-title">A Legacy of Excellence</h1>
                        <p className="section-subtitle">
                            Eight years of unforgettable celebrations. Explore the journey of Samskruthi
                            through each remarkable edition.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="section" style={{ position: 'relative', zIndex: 10 }}>
                <div className="container">
                    {/* Summary Stats */}
                    <div className="grid-4" style={{ marginBottom: 80 }}>
                        {[
                            { val: '8+', label: 'Years of Celebration' },
                            { val: '80K+', label: 'Total Attendees' },
                            { val: '500+', label: 'Events Hosted' },
                            { val: '35+', label: 'Lakhs in Prizes' },
                        ].map((s, i) => (
                            <motion.div
                                key={s.label}
                                className="glass-card"
                                style={{ textAlign: 'center' }}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div style={{
                                    fontSize: '2.5rem', fontWeight: 900,
                                    fontFamily: 'var(--font-secondary)',
                                    background: 'var(--gradient-aqua)',
                                    WebkitBackgroundClip: 'text', backgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    marginBottom: 8,
                                }}>{s.val}</div>
                                <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>{s.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Timeline */}
                    <h2 className="section-title" style={{ marginBottom: 16 }}>Past Editions</h2>
                    <div className="divider" style={{ marginBottom: 60 }} />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
                        {HISTORY.map((edition, i) => (
                            <HistoryCard key={edition.year} edition={edition} index={i} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
