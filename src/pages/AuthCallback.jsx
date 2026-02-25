import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/store'
import toast from 'react-hot-toast'

export default function AuthCallback() {
    const navigate = useNavigate()
    const { fetchProfile, setUser } = useAuthStore()

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()
                if (error) throw error

                if (session?.user) {
                    setUser(session.user)
                    await fetchProfile(session.user)
                    toast.success(`Welcome, ${session.user.user_metadata?.full_name || 'User'}! 🎉`)
                    navigate('/', { replace: true })
                } else {
                    navigate('/login', { replace: true })
                }
            } catch (err) {
                toast.error('Authentication failed. Please try again.')
                navigate('/login', { replace: true })
            }
        }
        handleCallback()
    }, [])

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
            position: 'relative', zIndex: 10,
        }}>
            <div className="loader" style={{ width: 56, height: 56, borderWidth: 4 }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                Completing sign in…
            </p>
        </div>
    )
}
