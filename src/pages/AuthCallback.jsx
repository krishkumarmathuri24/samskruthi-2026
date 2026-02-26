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
                setStatus('No session found, redirecting…')
                setTimeout(() => navigate('/login', { replace: true }), 1500)
            }
        }

        // Method 1: Listen to auth state change (catches hash-based tokens on mobile)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' && session) {
                    await handleSession(session)
                } else if (event === 'SIGNED_OUT') {
                    navigate('/login', { replace: true })
                }
            }
        )

        // Method 2: Also try getSession as fallback (in case event already fired)
        const tryGetSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (session?.user) {
                    await handleSession(session)
                }
            } catch (err) {
                console.error('getSession error:', err)
            }
        }

        tryGetSession()

        // Timeout safety net — if nothing happens in 8s, redirect to login
        const timeout = setTimeout(() => {
            if (!handled) {
                setStatus('Taking too long, redirecting…')
                navigate('/login', { replace: true })
            }
        }, 8000)

        return () => {
            subscription.unsubscribe()
            clearTimeout(timeout)
        }
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
            {/* Animated logo */}
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
