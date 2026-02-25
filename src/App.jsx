import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/store'
import { supabase, isSupabaseConfigured } from './lib/supabase'

// Layout
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ParticleBackground from './components/ParticleBackground'

// Pages
import Home from './pages/Home'
import Events from './pages/Events'
import Sponsors from './pages/Sponsors'
import History from './pages/History'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import AuthCallback from './pages/AuthCallback'

function ProtectedRoute({ children, adminOnly = false }) {
    const { user, isAdmin, loading } = useAuthStore()
    const [timedOut, setTimedOut] = useState(false)

    // Safety net: never stay stuck in loading for more than 4s
    useEffect(() => {
        if (!loading) return
        const t = setTimeout(() => setTimedOut(true), 4000)
        return () => clearTimeout(t)
    }, [loading])

    if (loading && !timedOut) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', gap: 16 }}>
            <div className="loader" />
            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Loading…</p>
        </div>
    )
    if (!user) return <Navigate to="/login" replace />
    if (adminOnly && !isAdmin) return <Navigate to="/" replace />
    return children
}

export default function App() {
    const { initialize, setUser, fetchProfile } = useAuthStore()

    useEffect(() => {
        initialize()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                setUser(session.user)
                await fetchProfile(session.user)
            } else if (event === 'SIGNED_OUT') {
                useAuthStore.setState({ user: null, profile: null, isAdmin: false })
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    return (
        <BrowserRouter>
            <div style={{ position: 'relative', minHeight: '100vh' }}>
                {!isSupabaseConfigured && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
                        background: 'linear-gradient(90deg, rgba(255,171,64,0.95), rgba(255,120,0,0.95))',
                        backdropFilter: 'blur(10px)',
                        padding: '10px 20px',
                        textAlign: 'center',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#1a0a00',
                        letterSpacing: 0.2,
                    }}>
                        ⚡ DEMO MODE — Supabase not configured. Auth & DB features disabled.{' '}
                        <a href="/README.md" style={{ textDecoration: 'underline', color: '#1a0a00' }}>Setup guide →</a>
                    </div>
                )}
                <ParticleBackground />
                <div className="water-overlay" />
                <Navbar />
                <main>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/events" element={<Events />} />
                        <Route path="/sponsors" element={<Sponsors />} />
                        <Route path="/history" element={<History />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/auth/callback" element={<AuthCallback />} />
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin" element={
                            <ProtectedRoute adminOnly>
                                <AdminDashboard />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </main>
                <Footer />
                <Toaster
                    position="bottom-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: 'rgba(4, 22, 40, 0.95)',
                            color: '#e0f7fa',
                            border: '1px solid rgba(0, 229, 255, 0.3)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '12px',
                            fontFamily: "'Outfit', sans-serif",
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                        },
                        success: { iconTheme: { primary: '#00e5ff', secondary: '#020b18' } },
                        error: { iconTheme: { primary: '#ff5252', secondary: '#020b18' } },
                    }}
                />
            </div>
        </BrowserRouter>
    )
}
