import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/store'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import {
    Camera, User, BookOpen, GraduationCap, Phone, Mail,
    Save, Edit3, X, Check, Hash, Linkedin, Instagram, Globe,
} from 'lucide-react'

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Alumni', 'Faculty']

// ⚠️ Field MUST be defined outside Profile so React doesn't remount inputs on every keystroke
function Field({ icon, label, name, placeholder, type = 'text', as: As = 'input', editing, form, setForm }) {
    return (
        <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                {icon} {label}
            </label>
            {editing ? (
                As === 'textarea' ? (
                    <textarea
                        rows={3}
                        className="form-input"
                        placeholder={placeholder}
                        value={form[name]}
                        onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                        style={{ resize: 'vertical', minHeight: 80 }}
                    />
                ) : (
                    <input
                        type={type}
                        className="form-input"
                        placeholder={placeholder}
                        value={form[name]}
                        onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                    />
                )
            ) : (
                <div style={{
                    padding: '12px 16px',
                    background: 'rgba(0,229,255,0.04)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 8,
                    color: form[name] ? 'var(--text-primary)' : 'var(--text-dim)',
                    fontSize: '0.95rem',
                    minHeight: 44,
                    display: 'flex', alignItems: 'center',
                }}>
                    {form[name] || <span style={{ fontStyle: 'italic', fontSize: '0.85rem' }}>Not set</span>}
                </div>
            )}
        </div>
    )
}

export default function Profile() {
    const { user, profile, setProfile } = useAuthStore()
    const navigate = useNavigate()
    const fileRef = useRef(null)
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [avatarPreview, setAvatarPreview] = useState(null)
    const [avatarFile, setAvatarFile] = useState(null)

    const [form, setForm] = useState({
        name: '',
        bio: '',
        college: '',
        department: '',
        year: '',
        roll_number: '',
        phone: '',
        linkedin: '',
        instagram: '',
        website: '',
    })

    useEffect(() => {
        if (profile) {
            setForm({
                name: profile.name || '',
                bio: profile.bio || '',
                college: profile.college || '',
                department: profile.department || '',
                year: profile.year || '',
                roll_number: profile.roll_number || '',
                phone: profile.phone || user?.phone || '',
                linkedin: profile.linkedin || '',
                instagram: profile.instagram || '',
                website: profile.website || '',
            })
        }
    }, [profile, user])

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 5 * 1024 * 1024) { toast.error('Photo must be under 5MB'); return }
        if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return }
        setAvatarFile(file)
        setAvatarPreview(URL.createObjectURL(file))
    }

    const uploadAvatar = async () => {
        if (!avatarFile || !user) return null
        setUploading(true)
        try {
            const ext = avatarFile.name.split('.').pop()
            const path = `${user.id}/avatar.${ext}`
            const { error } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
            if (error) throw error
            const { data } = supabase.storage.from('avatars').getPublicUrl(path)
            return data.publicUrl
        } catch (err) {
            toast.error('Photo upload failed: ' + err.message)
            return null
        } finally {
            setUploading(false)
        }
    }

    const handleSave = async () => {
        if (!form.name.trim()) { toast.error('Name cannot be empty'); return }
        setSaving(true)

        try {
            // Use local preview URL immediately so avatar shows right away
            const localAvatarUrl = avatarPreview || profile?.avatar_url || null
            const updated = { id: user.id, ...form, avatar_url: localAvatarUrl, updated_at: new Date().toISOString() }

            // ✅ Update UI INSTANTLY — no waiting for network at all
            setProfile({ ...profile, ...updated })
            setEditing(false)
            setAvatarFile(null)
            setAvatarPreview(null)
            toast.success('Profile saved! ✅')
            navigate('/')
            setSaving(false)

            // Background: upload image + save to DB (non-blocking)
            let finalAvatarUrl = localAvatarUrl
            if (avatarFile) {
                try {
                    const ext = avatarFile.name.split('.').pop()
                    const path = `${user.id}/avatar.${ext}`
                    const uploadPromise = supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
                    const uploadTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
                    const { error: uploadErr } = await Promise.race([uploadPromise, uploadTimeout])
                    if (!uploadErr) {
                        const { data } = supabase.storage.from('avatars').getPublicUrl(path)
                        finalAvatarUrl = data.publicUrl
                        // Update store with real URL
                        setProfile(prev => ({ ...prev, avatar_url: finalAvatarUrl }))
                    }
                } catch (_) {
                    // Image upload failed silently — local preview still shows
                }
            }

            // Save text fields to DB with timeout
            const dbUpdate = { ...updated, avatar_url: finalAvatarUrl }
            const savePromise = supabase.from('profiles').upsert(dbUpdate)
            const saveTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000))
            const { error } = await Promise.race([savePromise, saveTimeout])
            if (error) console.error('DB sync failed:', error.message)

        } catch (err) {
            console.error('Save error:', err)
            setSaving(false)
        }
    }

    const handleCancel = () => {
        setEditing(false); setAvatarFile(null); setAvatarPreview(null)
        if (profile) setForm({ name: profile.name || '', bio: profile.bio || '', college: profile.college || '', department: profile.department || '', year: profile.year || '', roll_number: profile.roll_number || '', phone: profile.phone || user?.phone || '', linkedin: profile.linkedin || '', instagram: profile.instagram || '', website: profile.website || '' })
    }

    const avatarSrc = avatarPreview || profile?.avatar_url || null
    const displayName = profile?.name || form.name || 'User'
    const initials = displayName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

    // Shared props passed to every Field so they can read/write form state
    const fp = { editing, form, setForm }



    return (
        <div style={{ paddingTop: 'var(--nav-height)', minHeight: '100vh', position: 'relative', zIndex: 10 }}>
            <div className="container" style={{ maxWidth: 800, padding: '48px 24px' }}>
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>

                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                        <div>
                            <h1 style={{
                                fontSize: '2rem', fontWeight: 800,
                                fontFamily: 'var(--font-secondary)',
                                background: 'var(--gradient-aqua)',
                                WebkitBackgroundClip: 'text', backgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                marginBottom: 4,
                            }}>My Profile</h1>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                                Manage your personal information
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            {editing ? (
                                <>
                                    <button onClick={handleCancel} className="btn btn-ghost" style={{ padding: '10px 20px', gap: 8 }}>
                                        <X size={16} /> Cancel
                                    </button>
                                    <button onClick={handleSave} className="btn btn-primary" disabled={saving || uploading} style={{ padding: '10px 20px', gap: 8 }}>
                                        {saving || uploading
                                            ? <><span className="loader" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving…</>
                                            : <><Check size={16} /> Save</>
                                        }
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => setEditing(true)} className="btn btn-primary" style={{ padding: '10px 20px', gap: 8 }}>
                                    <Edit3 size={16} /> Edit Profile
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Avatar + Basic Info Card */}
                    <div className="glass-card" style={{ marginBottom: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 32, flexWrap: 'wrap' }}>
                            {/* Avatar */}
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                                <div style={{
                                    width: 110, height: 110,
                                    borderRadius: '50%',
                                    border: '3px solid rgba(0,229,255,0.4)',
                                    background: avatarSrc ? 'transparent' : 'linear-gradient(135deg, #00bcd4, #7c4dff)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    overflow: 'hidden',
                                    boxShadow: '0 0 30px rgba(0,229,255,0.3)',
                                    fontSize: '2rem', fontWeight: 800,
                                    color: 'white', fontFamily: 'var(--font-secondary)',
                                }}>
                                    {avatarSrc
                                        ? <img src={avatarSrc} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        : initials
                                    }
                                </div>
                                {editing && (
                                    <button
                                        onClick={() => fileRef.current?.click()}
                                        style={{
                                            position: 'absolute', bottom: 4, right: 4,
                                            width: 32, height: 32,
                                            background: 'linear-gradient(135deg, #00bcd4, #0097a7)',
                                            border: '2px solid var(--deep-navy)',
                                            borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer', color: 'white',
                                        }}
                                    >
                                        <Camera size={14} />
                                    </button>
                                )}
                                <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                            </div>

                            {/* Name + meta */}
                            <div style={{ flex: 1, minWidth: 200 }}>
                                {editing ? (
                                    <div style={{ marginBottom: 12 }}>
                                        <label className="form-label">Full Name *</label>
                                        <input
                                            className="form-input"
                                            placeholder="Your full name"
                                            value={form.name}
                                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        />
                                    </div>
                                ) : (
                                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-secondary)', marginBottom: 8 }}>
                                        {displayName}
                                    </h2>
                                )}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                                    {user?.email && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                                            <Mail size={14} /> {user.email}
                                        </span>
                                    )}
                                    {(form.phone || user?.phone) && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                                            <Phone size={14} /> {form.phone || user?.phone}
                                        </span>
                                    )}
                                    {form.college && !editing && (
                                        <span className="badge">{form.college}</span>
                                    )}
                                    {form.year && !editing && (
                                        <span className="tag-chip">{form.year}</span>
                                    )}
                                </div>
                                {form.bio && !editing && (
                                    <p style={{ marginTop: 12, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                        {form.bio}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Fields Grid */}
                    <div className="grid-2" style={{ gap: 20, marginBottom: 24 }}>
                        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <h3 style={{ color: 'var(--teal-glow)', fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>📚 Academic Info</h3>
                            <Field {...fp} icon={<GraduationCap size={14} />} label="College / Institution" name="college" placeholder="e.g. EAST POINT COLLEGE OF ENGINEERING AND TECHNOLOGY" />
                            <Field {...fp} icon={<BookOpen size={14} />} label="Department / Branch" name="department" placeholder="e.g. Computer Science" />
                            {editing ? (
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                                        <GraduationCap size={14} /> Year of Study
                                    </label>
                                    <select
                                        className="form-input"
                                        value={form.year}
                                        onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                                    >
                                        <option value="">Select year</option>
                                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                            ) : (
                                <Field {...fp} icon={<GraduationCap size={14} />} label="Year of Study" name="year" placeholder="e.g. 2nd Year" />
                            )}
                            <Field {...fp} icon={<Hash size={14} />} label="USN Number" name="roll_number" placeholder="e.g. 1EP24CS061" />
                        </div>

                        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <h3 style={{ color: 'var(--teal-glow)', fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>👤 Personal Info</h3>
                            <Field {...fp} icon={<User size={14} />} label="Bio" name="bio" placeholder="Tell us about yourself…" as="textarea" />
                            <Field {...fp} icon={<Phone size={14} />} label="Phone Number" name="phone" placeholder="+91 98765 43210" type="tel" />
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="glass-card">
                        <h3 style={{ color: 'var(--teal-glow)', fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>🔗 Social Links</h3>
                        <div className="grid-3" style={{ gap: 16 }}>
                            <Field {...fp} icon={<Linkedin size={14} />} label="LinkedIn" name="linkedin" placeholder="linkedin.com/in/yourname" />
                            <Field {...fp} icon={<Instagram size={14} />} label="Instagram" name="instagram" placeholder="@yourhandle" />
                            <Field {...fp} icon={<Globe size={14} />} label="Website / Portfolio" name="website" placeholder="yoursite.com" />
                        </div>
                    </div>

                    {/* Account Info */}
                    <div className="glass-card" style={{ marginTop: 20, background: 'rgba(0,229,255,0.03)' }}>
                        <h3 style={{ color: 'var(--text-dim)', fontSize: '0.85rem', fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 2 }}>
                            Account Info
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                            <div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: 4 }}>User ID</div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{user?.id?.slice(0, 16)}…</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: 4 }}>Login Method</div>
                                <div className="badge" style={{ fontSize: '0.75rem' }}>
                                    {user?.app_metadata?.provider === 'phone' ? '📱 Phone OTP' : '🔵 Google OAuth'}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: 4 }}>Account Created</div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                                </div>
                            </div>
                        </div>
                    </div>

                </motion.div>
            </div>
        </div>
    )
}
