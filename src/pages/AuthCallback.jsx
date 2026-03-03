import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/store'
import toast from 'react-hot-toast'

export default function AuthCallback() {
    const navigate = useNavigate()
    const { fetchProfile, setUser } = useAuthStore()
    const [status, setStatus] = useState('Completing sign in…')
    const [errMsg, setErrMsg] = useState(null)

    useEffect(() => {
        let handled = false

        const finish = async (session) => {
            if (handled) return
            handled = true
            if (session?.user) {
                setUser(session.user)
                await fetchProfile(session.user)
                toast.success(`Welcome, ${session.user.user_metadata?.full_name || 'User'}! 🎉`)
                navigate('/', { replace: true })
            } else {
                setErrMsg('No session found. Please try again.')
                setTimeout(() => navigate('/login', { replace: true }), 2000)
            }
        }

        const run = async () => {
            // Check for OAuth errors in URL
            const params = new URLSearchParams(window.location.search)
            const errDesc = params.get('error_description') || params.get('error')
            if (errDesc) {
                toast.error(decodeURIComponent(errDesc))
                navigate('/login', { replace: true })
                return
            }

            // With implicit flow, detectSessionInUrl auto-processes the #access_token hash.
            // Give it a moment then just call getSession().
            setStatus('Signing you in…')

            // Small delay to let detectSessionInUrl store the session
            await new Promise(r => setTimeout(r, 800))

            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
                await finish(session)
                return
            }

            // Fallback: listen for the auth state change
            setStatus('Waiting for Google…')
            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, sess) => {
                if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && sess) {
                    subscription.unsubscribe()
                    await finish(sess)
                }
            })

            // Safety net — give up after 12s
            setTimeout(() => {
                if (!handled) {
                    subscription.unsubscribe()
                    setErrMsg('Sign in timed out. Please try again.')
                    setTimeout(() => navigate('/login', { replace: true }), 2000)
                }
            }, 12000)
        }

        run().catch((err) => {
            console.error('AuthCallback error:', err)
            if (!handled) {
                toast.error('Sign in failed: ' + err.message)
                navigate('/login', { replace: true })
            }
        })
    }, [])

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 20, position: 'relative', zIndex: 10,
            background: 'var(--deep-navy)', padding: 24,
        }}>
            <div style={{
                width: 72, height: 72,
                background: 'linear-gradient(135deg, #00bcd4, #0097a7)',
                borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, fontWeight: 900, color: 'white',
                fontFamily: 'var(--font-secondary)',
                boxShadow: '0 0 40px rgba(0,188,212,0.5)', marginBottom: 8,
            }}>S</div>

            {errMsg ? (
                <>
                    <div style={{ fontSize: '2rem' }}>⚠️</div>
                    <p style={{ color: '#ff5252', fontSize: '1rem', textAlign: 'center', maxWidth: 320 }}>{errMsg}</p>
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
