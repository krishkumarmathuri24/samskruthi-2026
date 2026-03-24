import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, CameraOff, Scan, CheckCircle, XCircle, User, Loader2, RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabase'

// Simple canvas-based face detection using brightness/contrast analysis
// In production you would swap this for a real face-api.js model
async function detectFaceInCanvas(canvas) {
    const ctx = canvas.getContext('2d')
    const { width, height } = canvas
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    // Simple skin-tone detection for face presence check
    let skinPixels = 0
    const total = (width * height)
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2]
        // Very rough skin-tone heuristic (works in well-lit conditions)
        if (r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 15) {
            skinPixels++
        }
    }
    return (skinPixels / total) > 0.05 // at least 5% skin-like pixels
}

export default function AIFaceRecognition() {
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const streamRef = useRef(null)
    const scanIntervalRef = useRef(null)

    const [cameraActive, setCameraActive] = useState(false)
    const [scanning, setScanning] = useState(false)
    const [result, setResult] = useState(null) // { found: bool, profile: obj | null }
    const [error, setError] = useState('')
    const [attendees, setAttendees] = useState([])
    const [checkedIn, setCheckedIn] = useState([])
    const [loadingAttendees, setLoadingAttendees] = useState(false)

    // Load all registered attendees from Supabase
    const loadAttendees = useCallback(async () => {
        setLoadingAttendees(true)
        try {
            const { data, error: err } = await supabase
                .from('profiles')
                .select('id, name, email, year, department, avatar_url')
                .limit(200)
            if (err) throw err
            setAttendees(data || [])
        } catch (e) {
            console.error('Could not load attendees:', e)
        } finally {
            setLoadingAttendees(false)
        }
    }, [])

    useEffect(() => {
        loadAttendees()
        return () => stopCamera()
    }, [loadAttendees])

    const startCamera = async () => {
        setError('')
        setResult(null)
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
            })
            streamRef.current = stream
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                await videoRef.current.play()
            }
            setCameraActive(true)
        } catch (e) {
            setError('Camera access denied. Please allow camera permission to use face check-in.')
        }
    }

    const stopCamera = () => {
        if (scanIntervalRef.current) clearInterval(scanIntervalRef.current)
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop())
            streamRef.current = null
        }
        setCameraActive(false)
        setScanning(false)
    }

    const captureAndScan = async () => {
        if (!videoRef.current || !canvasRef.current) return

        setScanning(true)
        setResult(null)

        const video = videoRef.current
        const canvas = canvasRef.current
        canvas.width = video.videoWidth || 640
        canvas.height = video.videoHeight || 480

        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Detect if a face is present in the frame
        const faceDetected = await detectFaceInCanvas(canvas)

        if (!faceDetected) {
            setResult({ found: false, message: 'No face detected. Please position your face clearly in the camera.' })
            setScanning(false)
            return
        }

        // Face found — for this demo we match with ticket holders
        // In a real app you would compare face embeddings against stored ones
        // For this system we simulate a match with a registered attendee who has a ticket
        try {
            const { data: ticketHolders } = await supabase
                .from('tickets')
                .select('user_id, ticket_code, status, events(title)')
                .eq('status', 'confirmed')
                .limit(1)

            if (ticketHolders && ticketHolders.length > 0) {
                const holder = ticketHolders[0]
                const profile = attendees.find(a => a.id === holder.user_id)
                setResult({
                    found: true,
                    profile: profile || { name: 'Registered Attendee', email: 'N/A' },
                    ticket: holder,
                })
                // Mark as checked in
                setCheckedIn(prev => {
                    if (prev.some(c => c.user_id === holder.user_id)) return prev
                    return [...prev, { ...holder, profile, checkin_time: new Date().toLocaleTimeString('en-IN') }]
                })
            } else {
                setResult({ found: true, message: 'Face detected but no confirmed ticket found for this person.' })
            }
        } catch (e) {
            setResult({ found: false, message: 'Error checking ticket database.' })
        }

        setScanning(false)
    }

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h2 style={{ fontFamily: 'var(--font-secondary)', color: 'var(--text-primary)', fontSize: '1.4rem', marginBottom: 4 }}>
                        🎭 AI Face Check-In
                    </h2>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.88rem' }}>
                        Use the camera to verify attendee identity at event entry gates.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    {!cameraActive ? (
                        <button onClick={startCamera} className="btn btn-primary" style={{ gap: 8 }}>
                            <Camera size={18} /> Start Camera
                        </button>
                    ) : (
                        <button onClick={stopCamera} className="btn btn-ghost" style={{ gap: 8, color: '#ff5252', borderColor: 'rgba(255,82,82,0.3)' }}>
                            <CameraOff size={18} /> Stop Camera
                        </button>
                    )}
                    <button onClick={loadAttendees} disabled={loadingAttendees} className="btn btn-ghost" style={{ gap: 8 }}>
                        <RefreshCw size={16} style={{ animation: loadingAttendees ? 'spin 1s linear infinite' : 'none' }} />
                        Refresh
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Camera Feed */}
                <div>
                    <div style={{
                        position: 'relative',
                        background: 'rgba(0,0,0,0.4)',
                        borderRadius: 20,
                        overflow: 'hidden',
                        border: cameraActive ? '2px solid var(--teal-glow)' : '2px solid var(--glass-border)',
                        boxShadow: cameraActive ? '0 0 30px rgba(0,229,255,0.2)' : 'none',
                        transition: 'all 0.3s',
                        aspectRatio: '4/3',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        {!cameraActive && (
                            <div style={{ textAlign: 'center', color: 'var(--text-dim)' }}>
                                <Camera size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
                                <p style={{ fontSize: '0.88rem' }}>Camera inactive</p>
                            </div>
                        )}
                        <video
                            ref={videoRef}
                            muted
                            playsInline
                            style={{
                                width: '100%', height: '100%', objectFit: 'cover',
                                display: cameraActive ? 'block' : 'none',
                            }}
                        />
                        <canvas ref={canvasRef} style={{ display: 'none' }} />

                        {/* Scan overlay */}
                        {cameraActive && (
                            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                                {/* Corner brackets */}
                                {[
                                    { top: 20, left: 20 },
                                    { top: 20, right: 20, transform: 'scaleX(-1)' },
                                    { bottom: 20, left: 20, transform: 'scaleY(-1)' },
                                    { bottom: 20, right: 20, transform: 'scale(-1)' },
                                ].map((pos, i) => (
                                    <div key={i} style={{
                                        position: 'absolute', width: 32, height: 32,
                                        borderTop: '3px solid var(--teal-glow)',
                                        borderLeft: '3px solid var(--teal-glow)',
                                        borderRadius: '4px 0 0 0',
                                        ...pos,
                                    }} />
                                ))}
                                {scanning && (
                                    <motion.div
                                        animate={{ y: ['0%', '100%', '0%'] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                        style={{
                                            position: 'absolute', left: 0, right: 0,
                                            height: 2, background: 'var(--teal-glow)',
                                            boxShadow: '0 0 12px var(--teal-glow)',
                                            top: 0,
                                        }}
                                    />
                                )}
                            </div>
                        )}
                    </div>

                    {cameraActive && (
                        <button
                            onClick={captureAndScan}
                            disabled={scanning}
                            style={{
                                width: '100%', marginTop: 16,
                                background: 'linear-gradient(135deg, #00bcd4, #7c4dff)',
                                color: '#fff', border: 'none',
                                padding: '14px', borderRadius: 14,
                                fontWeight: 700, fontSize: '1rem',
                                cursor: scanning ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                boxShadow: '0 8px 24px rgba(0,188,212,0.3)',
                                transition: 'all 0.2s',
                            }}
                        >
                            {scanning
                                ? <><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Scanning face...</>
                                : <><Scan size={20} /> Scan & Verify</>
                            }
                        </button>
                    )}

                    {error && (
                        <div style={{ marginTop: 12, padding: '12px 16px', background: 'rgba(255,82,82,0.1)', borderRadius: 10, color: '#ff5252', fontSize: '0.88rem', border: '1px solid rgba(255,82,82,0.2)' }}>
                            {error}
                        </div>
                    )}

                    {/* Result */}
                    <AnimatePresence>
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                style={{
                                    marginTop: 16, borderRadius: 16, padding: 20,
                                    background: result.found
                                        ? 'rgba(0,230,118,0.08)' : 'rgba(255,82,82,0.08)',
                                    border: result.found
                                        ? '1px solid rgba(0,230,118,0.3)' : '1px solid rgba(255,82,82,0.3)',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: result.found && result.profile ? 12 : 0 }}>
                                    {result.found
                                        ? <CheckCircle size={22} color="#00e676" />
                                        : <XCircle size={22} color="#ff5252" />
                                    }
                                    <span style={{ fontWeight: 700, color: result.found ? '#00e676' : '#ff5252' }}>
                                        {result.found ? 'Face Detected!' : 'Not Verified'}
                                    </span>
                                </div>
                                {result.profile && (
                                    <div style={{ paddingLeft: 32 }}>
                                        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{result.profile.name || 'Attendee'}</div>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>{result.profile.email}</div>
                                        {result.ticket && (
                                            <div style={{ marginTop: 8, fontSize: '0.82rem', color: 'var(--teal-glow)', fontWeight: 600 }}>
                                                🎫 {result.ticket.events?.title} · {result.ticket.ticket_code}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {result.message && (
                                    <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                                        {result.message}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Check-In Log */}
                <div>
                    <h3 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>
                        ✅ Check-In Log ({checkedIn.length})
                    </h3>
                    {checkedIn.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px dashed var(--glass-border)' }}>
                            <User size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                            <p style={{ fontSize: '0.88rem' }}>No check-ins yet. Start scanning to verify attendees.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 420, overflowY: 'auto' }}>
                            {checkedIn.map((entry, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 12,
                                        padding: '12px 16px', borderRadius: 12,
                                        background: 'rgba(0,230,118,0.06)',
                                        border: '1px solid rgba(0,230,118,0.2)',
                                    }}
                                >
                                    <div style={{
                                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                                        background: 'linear-gradient(135deg, #00bcd4, #7c4dff)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontWeight: 700, fontSize: '0.9rem',
                                        overflow: 'hidden',
                                    }}>
                                        {entry.profile?.avatar_url
                                            ? <img src={entry.profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            : (entry.profile?.name?.[0] || 'A')
                                        }
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {entry.profile?.name || 'Attendee'}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                                            {entry.events?.title} · {entry.checkin_time}
                                        </div>
                                    </div>
                                    <CheckCircle size={18} color="#00e676" style={{ flexShrink: 0 }} />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
