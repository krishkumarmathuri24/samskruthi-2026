import React from 'react'
import { Link } from 'react-router-dom'
import { Github, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react'

const LINKS = {
    Pages: [
        { to: '/', label: 'Home' },
        { to: '/events', label: 'Events' },
        { to: '/sponsors', label: 'Sponsors' },
        { to: '/history', label: 'History' },
        { to: '/contact', label: 'Contact' },
    ],
    Account: [
        { to: '/login', label: 'Sign In' },
        { to: '/dashboard', label: 'My Tickets' },
    ],
}

const SOCIALS = [
    { icon: <Instagram size={18} />, href: '#', label: 'Instagram' },
    { icon: <Twitter size={18} />, href: '#', label: 'Twitter' },
    { icon: <Youtube size={18} />, href: '#', label: 'YouTube' },
    { icon: <Github size={18} />, href: '#', label: 'GitHub' },
]

export default function Footer() {
    return (
        <footer style={{
            position: 'relative',
            zIndex: 10,
            background: 'rgba(2, 8, 18, 0.95)',
            borderTop: '1px solid rgba(0,229,255,0.1)',
            padding: '60px 0 30px',
        }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr', gap: 40, marginBottom: 48 }}>
                    {/* Brand */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                            <div style={{
                                width: 48, height: 48,
                                background: 'linear-gradient(135deg, #00bcd4, #0097a7)',
                                borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 24, fontWeight: 900, color: 'white',
                                fontFamily: 'var(--font-secondary)',
                                boxShadow: '0 0 20px rgba(0,188,212,0.4)',
                            }}>S</div>
                            <div>
                                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--teal-glow)', fontFamily: 'var(--font-secondary)' }}>
                                    SAMSKRUTHI
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: 3 }}>2026 · GRAND CULTURAL FEST</div>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', lineHeight: 1.8, maxWidth: 300 }}>
                            India's most vibrant college cultural festival. Celebrating art, culture,
                            music, and innovation for the youth of tomorrow.
                        </p>
                        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                            {SOCIALS.map((s) => (
                                <a key={s.label} href={s.href} aria-label={s.label} style={{
                                    width: 38, height: 38,
                                    background: 'var(--glass-bg)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--text-secondary)',
                                    transition: 'all 0.2s',
                                    textDecoration: 'none',
                                }} onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = 'var(--teal-glow)'
                                    e.currentTarget.style.color = 'var(--teal-glow)'
                                    e.currentTarget.style.boxShadow = '0 0 12px rgba(0,229,255,0.3)'
                                }} onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = 'var(--glass-border)'
                                    e.currentTarget.style.color = 'var(--text-secondary)'
                                    e.currentTarget.style.boxShadow = 'none'
                                }}>
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Nav Links */}
                    {Object.entries(LINKS).map(([title, links]) => (
                        <div key={title}>
                            <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700, marginBottom: 20, fontFamily: 'var(--font-secondary)' }}>
                                {title}
                            </h4>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {links.map((link) => (
                                    <li key={link.to}>
                                        <Link to={link.to} style={{
                                            fontSize: '0.9rem', color: 'var(--text-dim)', textDecoration: 'none', transition: 'color 0.2s',
                                        }} onMouseEnter={e => e.currentTarget.style.color = 'var(--teal-glow)'}
                                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Contact */}
                    <div>
                        <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700, marginBottom: 20, fontFamily: 'var(--font-secondary)' }}>
                            Get In Touch
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {[
                                { icon: <Mail size={16} />, text: 'samskruthi@college.edu' },
                                { icon: <Phone size={16} />, text: '+91 82108 68501' },
                                { icon: <MapPin size={16} />, text: 'Main Campus, Bengaluru, Karnataka' },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-dim)', fontSize: '0.88rem' }}>
                                    <span style={{ color: 'var(--aqua-500)', flexShrink: 0 }}>{item.icon}</span>
                                    {item.text}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{
                    borderTop: '1px solid rgba(0,229,255,0.08)',
                    paddingTop: 24,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
                }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                        © 2026 Samskruthi. All rights reserved. Crafted with ❤️ by the Fest Committee.
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                        Powered by <span style={{ color: 'var(--teal-glow)' }}>Supabase</span> & <span style={{ color: 'var(--teal-glow)' }}>React</span>
                    </p>
                </div>
            </div>

            <style>{`
        @media (max-width: 768px) {
          footer .container > div:first-child { grid-template-columns: 1fr !important; }
          footer .container > div:last-child { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
        </footer>
    )
}
