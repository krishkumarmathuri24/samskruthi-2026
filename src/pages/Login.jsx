import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/store'
import toast from 'react-hot-toast'
import { Chrome, Phone, ArrowRight, Shield } from 'lucide-react'

export default function Login() {
    const { signInWithGoogle, signInWithPhone, verifyOtp, loading } = useAuthStore()
    const navigate = useNavigate()

    const [tab, setTab] = useState('google') // 'google' | 'phone'
    const [phone, setPhone] = useState('')
    const [otp, setOtp] = useState('')
    const [step, setStep] = useState('phone') // 'phone' | 'otp'
    const [sending, setSending] = useState(false)

    const handleGoogle = () => {
        // Direct synchronous navigation — Safari compatible
        signInWithGoogle()
    }

    const handleSendOtp = async (e) => {
        e.preventDefault()
        if (!phone || phone.replace(/\D/g, '').length < 10) {
            toast.error('Enter a valid phone number')
            return
        }
        setSending(true)
        try {
            const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`
            await signInWithPhone(formattedPhone)
            setStep('otp')
            toast.success('OTP sent to ' + formattedPhone)
        } catch (err) {
            toast.error(err.message || 'Failed to send OTP')
        } finally {
            setSending(false)
        }
    }

    const handleVerifyOtp = async (e) => {
        e.preventDefault()
        if (otp.length < 6) {
            toast.error('Enter the 6-digit OTP')
            return
        }
        setSending(true)
        try {
            const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`
            await verifyOtp(formattedPhone, otp)
            toast.success('Signed in successfully! 🎉')
            navigate('/')
        } catch (err) {
            toast.error(err.message || 'OTP verification failed')
        } finally {
            setSending(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            paddingTop: 'calc(var(--nav-height) + 24px)',
            position: 'relative',
            zIndex: 10,
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ width: '100%', maxWidth: 460 }}
            >
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    {/* Logo */}
                    <div style={{
                        width: 72, height: 72,
                        background: 'linear-gradient(135deg, #00bcd4, #0097a7)',
                        borderRadius: 20,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 34, fontWeight: 900, color: 'white',
                        fontFamily: 'var(--font-secondary)',
                        boxShadow: '0 0 30px rgba(0,188,212,0.4)',
                        margin: '0 auto 24px',
                    }}>S</div>

                    <h1 style={{
                        fontFamily: 'var(--font-secondary)',
                        fontSize: '1.8rem', fontWeight: 800,
                        color: 'var(--text-primary)', marginBottom: 8,
                    }}>
                        Welcome to Samskruthi
                    </h1>
                    <p style={{ color: 'var(--text-dim)', marginBottom: 36, fontSize: '0.9rem' }}>
                        Sign in to book tickets and explore events
                    </p>

                    {/* Tab switcher */}
                    <div style={{
                        display: 'flex',
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: 50,
                        padding: 4,
                        marginBottom: 32,
                        border: '1px solid var(--glass-border)',
                    }}>
                        {[
                            { id: 'google', icon: <Chrome size={16} />, label: 'Google' },
                            { id: 'phone', icon: <Phone size={16} />, label: 'Phone OTP' },
                        ].map((t) => (
                            <button key={t.id} onClick={() => { setTab(t.id); setStep('phone'); setOtp('') }} style={{
                                flex: 1, padding: '10px 20px',
                                borderRadius: 50, border: 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                fontSize: '0.9rem', fontWeight: 600,
                                cursor: 'pointer', transition: 'all 0.2s',
                                background: tab === t.id
                                    ? 'linear-gradient(135deg, #00bcd4, #0097a7)'
                                    : 'transparent',
                                color: tab === t.id ? 'white' : 'var(--text-dim)',
                                boxShadow: tab === t.id ? '0 4px 15px rgba(0,188,212,0.4)' : 'none',
                            }}>
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Google Sign In */}
                    {tab === 'google' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div style={{
                                padding: '20px',
                                background: 'rgba(0,229,255,0.04)',
                                border: '1px solid rgba(0,229,255,0.1)',
                                borderRadius: 12,
                                marginBottom: 24,
                                fontSize: '0.88rem',
                                color: 'var(--text-dim)',
                                lineHeight: 1.7,
                            }}>
                                🔐 We use Google OAuth for secure authentication. Your data is never shared with third parties.
                            </div>
                            <button
                                id="google-signin-btn"
                                onClick={handleGoogle}
                                disabled={loading}
                                className="btn"
                                style={{
                                    width: '100%',
                                    justifyContent: 'center',
                                    background: 'white',
                                    color: '#1a1a1a',
                                    fontWeight: 600,
                                    gap: 12,
                                    fontSize: '1rem',
                                    padding: '14px 24px',
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 48 48">
                                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                                </svg>
                                Continue with Google
                            </button>
                        </motion.div>
                    )}

                    {/* Phone OTP */}
                    {tab === 'phone' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            {step === 'phone' ? (
                                <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <div style={{ textAlign: 'left' }}>
                                        <label className="form-label">Phone Number</label>
                                        <div style={{ position: 'relative' }}>
                                            <span style={{
                                                position: 'absolute', left: 16,
                                                top: '50%', transform: 'translateY(-50%)',
                                                color: 'var(--text-secondary)',
                                                fontSize: '0.9rem', fontWeight: 600,
                                            }}>+91</span>
                                            <input
                                                id="phone-input"
                                                className="form-input"
                                                style={{ paddingLeft: 52 }}
                                                type="tel"
                                                placeholder="98765 43210"
                                                value={phone}
                                                onChange={e => setPhone(e.target.value)}
                                                maxLength={14}
                                                required
                                            />
                                        </div>
                                        <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: 8 }}>
                                            We'll send a 6-digit OTP to verify your number
                                        </p>
                                    </div>
                                    <button
                                        id="send-otp-btn"
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={sending}
                                        style={{ width: '100%', justifyContent: 'center', gap: 10 }}
                                    >
                                        {sending ? (
                                            <><span className="loader" style={{ width: 18, height: 18, borderWidth: 2 }} /> Sending OTP…</>
                                        ) : (
                                            <>Send OTP <ArrowRight size={16} /></>
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <div style={{
                                        padding: '14px 18px',
                                        background: 'rgba(0,230,118,0.08)',
                                        border: '1px solid rgba(0,230,118,0.2)',
                                        borderRadius: 10,
                                        fontSize: '0.88rem',
                                        color: '#00e676',
                                        textAlign: 'left',
                                    }}>
                                        ✅ OTP sent to +91{phone}
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <label className="form-label">Enter 6-digit OTP</label>
                                        <input
                                            id="otp-input"
                                            className="form-input"
                                            style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: 8, fontWeight: 700 }}
                                            type="text"
                                            placeholder="– – – – – –"
                                            value={otp}
                                            onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            maxLength={6}
                                            required
                                        />
                                    </div>
                                    <button
                                        id="verify-otp-btn"
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={sending || otp.length < 6}
                                        style={{ width: '100%', justifyContent: 'center', gap: 10 }}
                                    >
                                        {sending ? (
                                            <><span className="loader" style={{ width: 18, height: 18, borderWidth: 2 }} /> Verifying…</>
                                        ) : (
                                            <><Shield size={16} /> Verify & Sign In</>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setStep('phone'); setOtp('') }}
                                        style={{ background: 'none', border: 'none', color: 'var(--teal-glow)', cursor: 'pointer', fontSize: '0.88rem' }}
                                    >
                                        ← Change number
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    )}

                    <p style={{ marginTop: 28, fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
                        By signing in, you agree to our{' '}
                        <span style={{ color: 'var(--teal-glow)', cursor: 'pointer' }}>Terms of Service</span>
                        {' '}and{' '}
                        <span style={{ color: 'var(--teal-glow)', cursor: 'pointer' }}>Privacy Policy</span>.
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
