import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/store'
import toast from 'react-hot-toast'

export default function AuthCallback() {
    const navigate = useNavigate()
    const { fetchProfile, setUser } = useAuthStore()
    const [status, setStatus] = useState('Completing sign in…')
    const [error, setError] = useState(null)

    useEffect(() => {
        let handled = false

        const done = async (session) => {
            if (handled) return
            handled = true
            if (session?.user) {
                setUser(session.user)
                await fetchProfile(session.user)
                toast.success(`Welcome, ${session.user.user_metadata?.full_name || 'User'}! 🎉`)
                navigate('/', { replace: true })
            } else {
                setStatus('Sign in failed')
                setError('Could not retrieve your session. Please try again.')
                setTimeout(() => navigate('/login', { replace: true }), 2500)
            }
        }

        const run = async () => {
            try {
                const params = new URLSearchParams(window.location.search)
                const hash = new URLSearchParams(window.location.hash.replace('#', '?'))

                const errorMsg = params.get('error_description') || hash.get('error_description') || params.get('error')
                if (errorMsg) {
                    toast.error(decodeURIComponent(errorMsg))
                    navigate('/login', { replace: true })
                    return
                }

                const code = params.get('code')

                if (code) {
                    // ── PKCE flow: exchange code for session ──────────────────
                    setStatus('Verifying with Google…')
                    const exchangeWithTimeout = Promise.race([
                        supabase.auth.exchangeCodeForSession(code),
                        new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('Exchange timed out')), 10000)
                        )
                    ])

                    const { data, error: exchErr } = await exchangeWithTimeout
                    if (exchErr) {
                        // PKCE exchange failed — fall through to getSession check
                        console.warn('PKCE exchange failed:', exchErr.message)
                    } else if (data?.session) {
                        await done(data.session)
                        return
                    }
                }

                // ── Implicit flow OR fallback: check if session already stored ──
                setStatus('Checking session…')
                const { data: { session } } = await supabase.auth.getSession()
                if (session?.user) {
                    await done(session)
                    return
                }

                // ── Last resort: wait for auth state change (up to 8s) ──────────
                setStatus('Waiting for authentication…')
                const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, sess) => {
                    if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && sess) {
                        subscription.unsubscribe()
                        await done(sess)
                    }
                })

                setTimeout(() => {
                    if (!handled) {
                        subscription.unsubscribe()
                        setStatus('Sign in timed out')
                        setError('Authentication took too long. Please try again.')
                        setTimeout(() => navigate('/login', { replace: true }), 2000)
                    }
                }, 8000)

            } catch (err) {
                console.error('Auth callback error:', err)
                if (!handled) {
                    toast.error('Authentication failed: ' + err.message)
                    navigate('/login', { replace: true })
                }
            }
        }

        run()
    }, [])

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 20, position: 'relative', zIndex: 10,
            background: 'var(--deep-navy)',
            padding: 24,
        }}>
            {/* Logo */}
            <div style={{
                width: 72, height: 72,
                background: 'linear-gradient(135deg, #00bcd4, #0097a7)',
                borderRadius: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, fontWeight: 900, color: 'white',
                fontFamily: 'var(--font-secondary)',
                boxShadow: '0 0 40px rgba(0,188,212,0.5)',
                marginBottom: 8,
            }}>S</div>

            {error ? (
                <>
                    <div style={{ fontSize: '2rem' }}>⚠️</div>
                    <p style={{ color: '#ff5252', fontSize: '1rem', textAlign: 'center', maxWidth: 320 }}>{error}</p>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Redirecting to login…</p>
                </>
            ) : (
                <>
                    <div className="loader" style={{ width: 48, height: 48, borderWidth: 3 }} />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', textAlign: 'center' }}>{status}</p>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Please wait, don't close this page…</p>
                </>
            )}
        </div>
    )
}
