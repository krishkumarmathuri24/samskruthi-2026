import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/store'
import toast from 'react-hot-toast'

export default function AuthCallback() {
    const navigate = useNavigate()
    const { fetchProfile, setUser } = useAuthStore()
    const [status, setStatus] = useState('Completing sign in…')

    useEffect(() => {
        let handled = false

        const handleSession = async (session) => {
            if (handled) return
            handled = true

            if (session?.user) {
                setUser(session.user)
                await fetchProfile(session.user)
                toast.success(`Welcome, ${session.user.user_metadata?.full_name || 'User'}! 🎉`)
                navigate('/', { replace: true })
            } else {
                setStatus('Sign in failed, redirecting…')
                setTimeout(() => navigate('/login', { replace: true }), 1500)
            }
        }

        const run = async () => {
            try {
                // PKCE flow: exchange the code from URL for a session
                const params = new URLSearchParams(window.location.search)
                const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'))

                const code = params.get('code')
                const accessToken = hashParams.get('access_token') || params.get('access_token')
                const errorDesc = params.get('error_description') || hashParams.get('error_description')

                if (errorDesc) {
                    toast.error(decodeURIComponent(errorDesc))
                    navigate('/login', { replace: true })
                    return
                }

                if (code) {
                    // PKCE flow — exchange auth code for session
                    setStatus('Verifying with Google…')
                    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
                    if (error) throw error
                    await handleSession(data.session)
                    return
                }

                if (accessToken) {
                    // Implicit flow fallback
                    const { data: { session } } = await supabase.auth.getSession()
                    await handleSession(session)
                    return
                }

                // Listen for auth state change (catches all cases)
                const { data: { subscription } } = supabase.auth.onAuthStateChange(
                    async (event, session) => {
                        if (event === 'SIGNED_IN' && session) {
                            await handleSession(session)
                        }
                    }
                )

                // Also try getSession as immediate fallback
                const { data: { session } } = await supabase.auth.getSession()
                if (session?.user) {
                    await handleSession(session)
                } else {
                    // Timeout safety net
                    setTimeout(() => {
                        subscription.unsubscribe()
                        if (!handled) {
                            setStatus('Session not found, redirecting…')
                            navigate('/login', { replace: true })
                        }
                    }, 8000)
                }

            } catch (err) {
                console.error('Auth callback error:', err)
                toast.error('Authentication failed: ' + err.message)
                navigate('/login', { replace: true })
            }
        }

        run()
    }, [])

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
            position: 'relative',
            zIndex: 10,
            background: 'var(--deep-navy)',
        }}>
            <div style={{
                width: 72, height: 72,
                background: 'linear-gradient(135deg, #00bcd4, #0097a7)',
                borderRadius: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, fontWeight: 900, color: 'white',
                fontFamily: 'var(--font-secondary)',
                boxShadow: '0 0 40px rgba(0,188,212,0.5)',
                animation: 'pulse 1.5s ease infinite',
                marginBottom: 8,
            }}>S</div>

            <div className="loader" style={{ width: 48, height: 48, borderWidth: 3 }} />

            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', textAlign: 'center' }}>
                {status}
            </p>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                Please wait, don't close this page…
            </p>
        </div>
    )
}
