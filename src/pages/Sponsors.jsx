import React from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Star } from 'lucide-react'

const SPONSORS = {
    Platinum: [
        { name: 'TechNova Corp', logo: '🔷', tagline: 'Powering Innovation', tier: 'Platinum', url: '#' },
        { name: 'AquaFlow Systems', logo: '💎', tagline: 'Fluid Technology Solutions', tier: 'Platinum', url: '#' },
    ],
    Gold: [
        { name: 'ByteWave Labs', logo: '🌊', tagline: 'Surf the Digital Ocean', tier: 'Gold', url: '#' },
        { name: 'Neon Dynamics', logo: '✨', tagline: 'Bright Future Ahead', tier: 'Gold', url: '#' },
        { name: 'CloudBase India', logo: '☁️', tagline: 'Sky is the Limit', tier: 'Gold', url: '#' },
    ],
    Silver: [
        { name: 'DataPulse', logo: '📊', tagline: 'Data-Driven Decisions', tier: 'Silver', url: '#' },
        { name: 'CrystalNet', logo: '🔮', tagline: 'Clear Connections', tier: 'Silver', url: '#' },
        { name: 'IdeaForge', logo: '💡', tagline: 'Forge Your Ideas', tier: 'Silver', url: '#' },
        { name: 'SwiftCode', logo: '⚡', tagline: 'Build Fast, Ship Faster', tier: 'Silver', url: '#' },
    ],
    Community: [
        { name: 'StartupHub BLR', logo: '🚀', tier: 'Community', url: '#' },
        { name: "Maker's Guild", logo: '🛠️', tier: 'Community', url: '#' },
        { name: 'DevCircle', logo: '👾', tier: 'Community', url: '#' },
        { name: 'YouthVentures', logo: '🌱', tier: 'Community', url: '#' },
    ],
}

const TIER_CONFIG = {
    Platinum: { color: '#e0f7fa', accent: '#00e5ff', border: 'rgba(0,229,255,0.4)', size: 'large', stars: 5 },
    Gold: { color: '#ffd600', accent: '#ffab00', border: 'rgba(255,214,0,0.4)', size: 'medium', stars: 4 },
    Silver: { color: '#90a4ae', accent: '#b0bec5', border: 'rgba(144,164,174,0.4)', size: 'normal', stars: 3 },
    Community: { color: '#80deea', accent: '#4dd0e1', border: 'rgba(0,188,212,0.2)', size: 'small', stars: 2 },
}

function SponsorCard({ sponsor, config, index }) {
    const isLarge = config.size === 'large'
    const isMedium = config.size === 'medium'

    return (
        <motion.a
            href={sponsor.url}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                textDecoration: 'none',
                borderColor: config.border,
                padding: isLarge ? '40px' : isMedium ? '32px' : '24px',
                gap: 12,
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Glow */}
            <div style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(circle at center, ${config.accent}08 0%, transparent 70%)`,
                pointerEvents: 'none',
            }} />

            {/* Tier badge */}
            <div style={{ display: 'flex', gap: 2, marginBottom: 4 }}>
                {Array.from({ length: config.stars }).map((_, i) => (
                    <Star key={i} size={12} fill={config.color} color="transparent" />
                ))}
            </div>

            <div style={{ fontSize: isLarge ? '4rem' : isMedium ? '3rem' : '2.5rem' }}>
                {sponsor.logo}
            </div>
            <h3 style={{
                color: config.color,
                fontSize: isLarge ? '1.3rem' : '1rem',
                fontWeight: 800,
                fontFamily: 'var(--font-secondary)',
            }}>
                {sponsor.name}
            </h3>
            {sponsor.tagline && (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', margin: 0 }}>
                    {sponsor.tagline}
                </p>
            )}
            <ExternalLink size={14} color="var(--text-dim)" style={{ marginTop: 4 }} />
        </motion.a>
    )
}

export default function Sponsors() {
    return (
        <div style={{ paddingTop: 'var(--nav-height)' }}>
            {/* Header */}
            <div style={{ background: 'var(--gradient-hero)', padding: '80px 0 60px', position: 'relative', zIndex: 10 }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <span className="badge" style={{ marginBottom: 20 }}>Our Partners</span>
                        <h1 className="section-title">Sponsors & Partners</h1>
                        <p className="section-subtitle">
                            Samskruthi 2026 is made possible by the incredible support of our sponsors.
                            Together, we create memories that last a lifetime.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="section" style={{ position: 'relative', zIndex: 10 }}>
                <div className="container">
                    {Object.entries(SPONSORS).map(([tier, sponsors]) => {
                        const config = TIER_CONFIG[tier]
                        return (
                            <div key={tier} style={{ marginBottom: 64 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 36 }}>
                                    <div style={{
                                        height: 2, flex: 1,
                                        background: `linear-gradient(90deg, ${config.accent}60, transparent)`,
                                    }} />
                                    <div style={{
                                        padding: '8px 24px',
                                        borderRadius: 50,
                                        border: `1px solid ${config.border}`,
                                        background: `${config.accent}10`,
                                        color: config.color,
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        letterSpacing: 2,
                                        textTransform: 'uppercase',
                                        display: 'flex', alignItems: 'center', gap: 8,
                                    }}>
                                        <Star size={14} fill={config.color} color="transparent" />
                                        {tier} Sponsors
                                    </div>
                                    <div style={{
                                        height: 2, flex: 1,
                                        background: `linear-gradient(270deg, ${config.accent}60, transparent)`,
                                    }} />
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: tier === 'Platinum'
                                        ? 'repeat(2, 1fr)'
                                        : tier === 'Gold'
                                            ? 'repeat(3, 1fr)'
                                            : 'repeat(4, 1fr)',
                                    gap: 20,
                                }}>
                                    {sponsors.map((s, i) => (
                                        <SponsorCard key={s.name} sponsor={s} config={config} index={i} />
                                    ))}
                                </div>
                            </div>
                        )
                    })}

                    {/* Become a Sponsor CTA */}
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{
                            textAlign: 'center',
                            background: 'linear-gradient(135deg, rgba(0,188,212,0.1), rgba(124,77,255,0.1))',
                            borderColor: 'rgba(0,229,255,0.3)',
                            padding: '60px 40px',
                        }}
                    >
                        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🤝</div>
                        <h2 style={{
                            fontSize: '2rem', fontWeight: 800,
                            fontFamily: 'var(--font-secondary)',
                            color: 'var(--text-primary)', marginBottom: 16,
                        }}>
                            Become a Sponsor
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
                            Partner with Samskruthi 2026 to reach 20,000+ students, professionals,
                            and industry leaders from across India.
                        </p>
                        <a
                            href="mailto:samskruthi@college.edu?subject=Sponsorship Inquiry"
                            className="btn btn-primary"
                            style={{ fontSize: '1rem', display: 'inline-flex', gap: 8 }}
                        >
                            Contact Us for Sponsorship
                        </a>
                    </motion.div>
                </div>
            </div>

            <style>{`
        @media (max-width: 768px) {
          .sponsor-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .sponsor-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
        </div>
    )
}
