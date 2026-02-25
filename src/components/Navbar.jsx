import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore, useNotifStore } from '../store/store'
import { Bell, Menu, X, User, LogOut, LayoutDashboard, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

const NAV_LINKS = [
    { to: '/', label: 'Home' },
    { to: '/events', label: 'Events' },
    { to: '/sponsors', label: 'Sponsors' },
    { to: '/history', label: 'History' },
    { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
    const { user, profile, isAdmin, signOut } = useAuthStore()
    const { notifications, unreadCount, fetchNotifications, markRead, subscribe } = useNotifStore()
    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [notifOpen, setNotifOpen] = useState(false)
    const [userOpen, setUserOpen] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const notifRef = useRef(null)
    const userRef = useRef(null)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    useEffect(() => {
        if (user) {
            fetchNotifications(user.id)
            const unsub = subscribe(user.id)
            return unsub
        }
    }, [user])

    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
            if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    useEffect(() => {
        setMenuOpen(false)
    }, [location.pathname])

    const handleSignOut = async () => {
        await signOut()
        toast.success('Signed out successfully')
        navigate('/')
    }

    const isActive = (path) =>
        path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

    return (
        <nav style={{
            position: 'fixed',
            top: 0, left: 0, right: 0,
            zIndex: 1000,
            height: 'var(--nav-height)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 32px',
            transition: 'all 0.3s ease',
            background: scrolled
                ? 'rgba(2, 11, 24, 0.92)'
                : 'transparent',
            backdropFilter: scrolled ? 'blur(20px)' : 'none',
            borderBottom: scrolled ? '1px solid rgba(0,229,255,0.1)' : 'none',
            boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.3)' : 'none',
        }}>
            {/* Logo */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginRight: 'auto' }}>
                <div style={{
                    width: 42, height: 42,
                    background: 'linear-gradient(135deg, #00bcd4, #0097a7)',
                    borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, fontWeight: 900,
                    color: 'white',
                    boxShadow: '0 0 20px rgba(0,188,212,0.4)',
                    fontFamily: 'var(--font-secondary)',
                }}>S</div>
                <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--teal-glow)', fontFamily: 'var(--font-secondary)', lineHeight: 1 }}>
                        SAMSKRUTHI
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: 3, textTransform: 'uppercase' }}>
                        2026
                    </div>
                </div>
            </Link>

            {/* Desktop Links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
                {NAV_LINKS.map((link) => (
                    <Link key={link.to} to={link.to} style={{
                        padding: '8px 18px',
                        borderRadius: 50,
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        color: isActive(link.to) ? 'var(--teal-glow)' : 'var(--text-secondary)',
                        background: isActive(link.to) ? 'rgba(0,229,255,0.1)' : 'transparent',
                        border: isActive(link.to) ? '1px solid rgba(0,229,255,0.2)' : '1px solid transparent',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                    }}>
                        {link.label}
                    </Link>
                ))}
            </div>

            {/* Right side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 24 }}>
                {user ? (
                    <>
                        {/* Notifications */}
                        <div ref={notifRef} style={{ position: 'relative' }}>
                            <button onClick={() => setNotifOpen(!notifOpen)} style={{
                                position: 'relative',
                                width: 42, height: 42,
                                background: 'var(--glass-bg)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--text-primary)',
                                transition: 'all 0.2s',
                                cursor: 'pointer',
                            }}>
                                <Bell size={18} />
                                {unreadCount > 0 && (
                                    <span style={{
                                        position: 'absolute', top: 6, right: 6,
                                        width: 14, height: 14,
                                        background: 'var(--teal-glow)',
                                        borderRadius: '50%',
                                        fontSize: '0.6rem', fontWeight: 700,
                                        color: '#020b18',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 0 8px var(--teal-glow)',
                                    }}>
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {notifOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '110%', right: 0,
                                    width: 340,
                                    background: 'rgba(4,22,40,0.97)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: 16,
                                    backdropFilter: 'blur(20px)',
                                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                                    zIndex: 100,
                                    overflow: 'hidden',
                                }}>
                                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Notifications</span>
                                        {unreadCount > 0 && <span className="badge">{unreadCount} new</span>}
                                    </div>
                                    <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                                        {notifications.length === 0 ? (
                                            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-dim)' }}>
                                                No notifications yet
                                            </div>
                                        ) : (
                                            notifications.map((n) => (
                                                <div key={n.id} onClick={() => markRead(n.id)} style={{
                                                    padding: '14px 20px',
                                                    borderBottom: '1px solid rgba(0,229,255,0.05)',
                                                    cursor: 'pointer',
                                                    background: n.read ? 'transparent' : 'rgba(0,229,255,0.05)',
                                                    transition: 'background 0.2s',
                                                }}>
                                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 4 }}>{n.message}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                                                        {new Date(n.created_at).toLocaleString()}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Avatar */}
                        <div ref={userRef} style={{ position: 'relative' }}>
                            <button onClick={() => setUserOpen(!userOpen)} style={{
                                width: 42, height: 42,
                                borderRadius: '50%',
                                overflow: 'hidden',
                                border: '2px solid rgba(0,229,255,0.4)',
                                background: 'linear-gradient(135deg, #00bcd4, #7c4dff)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 0 15px rgba(0,229,255,0.3)',
                            }}>
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span style={{ fontWeight: 700, color: 'white', fontSize: '1rem' }}>
                                        {(profile?.name || user.email)?.[0]?.toUpperCase() || 'U'}
                                    </span>
                                )}
                            </button>

                            {userOpen && (
                                <div style={{
                                    position: 'absolute', top: '110%', right: 0,
                                    width: 220,
                                    background: 'rgba(4,22,40,0.97)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: 16,
                                    backdropFilter: 'blur(20px)',
                                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                                    zIndex: 100,
                                    overflow: 'hidden',
                                }}>
                                    <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--glass-border)' }}>
                                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                                            {profile?.name || 'User'}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: 2 }}>
                                            {user.email || user.phone}
                                        </div>
                                        {isAdmin && <div className="badge" style={{ marginTop: 8 }}>Admin</div>}
                                    </div>
                                    {[
                                        { icon: <User size={15} />, label: 'Dashboard', to: '/dashboard' },
                                        ...(isAdmin ? [{ icon: <Shield size={15} />, label: 'Admin Panel', to: '/admin' }] : []),
                                    ].map((item) => (
                                        <Link key={item.to} to={item.to} onClick={() => setUserOpen(false)} style={{
                                            display: 'flex', alignItems: 'center', gap: 10,
                                            padding: '12px 18px',
                                            color: 'var(--text-secondary)',
                                            textDecoration: 'none',
                                            fontSize: '0.9rem',
                                            transition: 'background 0.2s',
                                        }}>
                                            {item.icon} {item.label}
                                        </Link>
                                    ))}
                                    <button onClick={handleSignOut} style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                                        padding: '12px 18px',
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#ff5252',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        borderTop: '1px solid var(--glass-border)',
                                        textAlign: 'left',
                                    }}>
                                        <LogOut size={15} /> Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <Link to="/login" className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '0.9rem' }}>
                        Sign In
                    </Link>
                )}

                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    style={{
                        display: 'none',
                        width: 42, height: 42,
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '50%',
                        alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                    }}
                    className="mobile-menu-btn"
                >
                    {menuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile Drawer */}
            {menuOpen && (
                <div style={{
                    position: 'fixed',
                    top: 'var(--nav-height)', left: 0, right: 0, bottom: 0,
                    background: 'rgba(2,11,24,0.97)',
                    backdropFilter: 'blur(20px)',
                    zIndex: 999,
                    display: 'flex', flexDirection: 'column',
                    padding: '24px',
                    gap: 8,
                }}>
                    {NAV_LINKS.map((link) => (
                        <Link key={link.to} to={link.to} style={{
                            padding: '16px 20px',
                            borderRadius: 12,
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            color: isActive(link.to) ? 'var(--teal-glow)' : 'var(--text-primary)',
                            background: isActive(link.to) ? 'rgba(0,229,255,0.1)' : 'transparent',
                            textDecoration: 'none',
                        }}>
                            {link.label}
                        </Link>
                    ))}
                    {!user && (
                        <Link to="/login" className="btn btn-primary" style={{ marginTop: 16, justifyContent: 'center' }}>
                            Sign In
                        </Link>
                    )}
                </div>
            )}

            <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
        </nav>
    )
}
