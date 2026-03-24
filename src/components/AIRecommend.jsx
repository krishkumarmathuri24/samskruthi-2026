import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, Loader2, RefreshCw } from 'lucide-react'
import { useEventsStore, useTicketStore } from '../store/store'
import { Link } from 'react-router-dom'
import { GoogleGenAI } from '@google/genai'
import { supabase } from '../lib/supabase'

export default function AIRecommend() {
    const { events, fetchEvents } = useEventsStore()
    const { userTickets } = useTicketStore()
    const [recommendation, setRecommendation] = useState('')
    const [eventName, setEventName] = useState('')
    const [loading, setLoading] = useState(false)

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY

    const generateRecommendation = async () => {
        if (!apiKey || apiKey.length < 20) {
            setRecommendation('Gemini API key not configured on Vercel yet. Add VITE_GEMINI_API_KEY in Vercel → Settings → Environment Variables and redeploy.')
            return
        }

        setLoading(true)
        setRecommendation('')
        setEventName('')

        try {
            // Ensure we definitely have the events
            let currentEvents = events
            if (!currentEvents || currentEvents.length === 0) {
                // Fetch directly from database with a timeout
                const fetchPromise = supabase.from('events').select('*')
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase timeout')), 8000))
                const { data, error } = await Promise.race([fetchPromise, timeoutPromise])
                
                if (!error && data && data.length > 0) {
                    currentEvents = data
                }
            }

            // Get available events — if all booked, recommend from all events anyway
            const tickets = userTickets || []
            const bookedTitles = tickets.map(t => t.events?.title).filter(Boolean)
            const availableEvents = currentEvents && currentEvents.length > 0 ? currentEvents : []

            if (availableEvents.length === 0) {
                setRecommendation('No events found right now. Check back soon!')
                return
            }

            const unbooked = availableEvents.filter(e => !bookedTitles.includes(e.title))
            const poolToRecommendFrom = unbooked.length > 0 ? unbooked : availableEvents

            const ai = new GoogleGenAI({ apiKey })

            // Build a numbered EXACT title list — AI must choose only from this
            const numberedList = poolToRecommendFrom
                .map((e, i) => (i + 1) + '. ' + e.title)
                .join('\n')

            const bookedContext = bookedTitles.length > 0
                ? 'The user has already booked: ' + bookedTitles.join(', ') + '. Recommend which event they should attend first or enjoy most.'
                : 'The user has not booked any events yet.'

            const prompt = [
                'You are an AI assistant for Samskruthi 2026 college fest.',
                bookedContext,
                '',
                'Here is the COMPLETE list of events available on the website:',
                numberedList,
                '',
                'STRICT RULES:',
                '- You MUST only choose from the events listed above.',
                '- Do NOT invent, guess, or suggest any event not in the list above.',
                '- Copy the event title EXACTLY as written — same spelling, same capitalization.',
                '',
                'Respond in EXACTLY this format and nothing else:',
                'EVENT: <copy exact title from the list above>',
                'REASON: <one exciting sentence about why this event is unmissable>',
            ].join('\n')

            const aiPromise = ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            })
            const aiTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Gemini timeout')), 15000))
            const response = await Promise.race([aiPromise, aiTimeout])

            const text = response.text || ''
            const eventMatch = text.match(/EVENT:\s*(.+)/i)
            const reasonMatch = text.match(/REASON:\s*(.+)/i)
            const suggestedTitle = eventMatch ? eventMatch[1].trim() : ''

            // Validate: check if the AI's suggestion actually exists in our pool
            const validEvent = poolToRecommendFrom.find(
                e => e.title.toLowerCase() === suggestedTitle.toLowerCase()
            ) || poolToRecommendFrom.find(
                e => e.title.toLowerCase().includes(suggestedTitle.toLowerCase())
                    || suggestedTitle.toLowerCase().includes(e.title.toLowerCase())
            )

            if (validEvent) {
                setEventName(validEvent.title)
                setRecommendation(reasonMatch ? reasonMatch[1].trim() : 'This is a must-attend event at Samskruthi 2026!')
            } else {
                // AI hallucinated — fall back to first event in pool
                const fallback = poolToRecommendFrom[0]
                setEventName(fallback.title)
                setRecommendation('This event is a top pick at Samskruthi 2026 — grab your free ticket before it fills up!')
            }
        } catch (error) {
            console.error('AI Recommend error:', error)
            setRecommendation('Having trouble connecting right now. Try again locally or slowly.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                background: 'linear-gradient(135deg, rgba(124,77,255,0.1), rgba(0,229,255,0.08))',
                borderRadius: 20,
                padding: 28,
                marginBottom: 48,
                border: '1px solid rgba(124,77,255,0.3)',
                boxShadow: '0 10px 40px rgba(124,77,255,0.15)',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#b388ff', fontSize: '1.15rem', fontWeight: 700, marginBottom: 8 }}>
                        <Sparkles size={20} /> AI Event Recommendation
                    </h3>
                    {eventName && (
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--teal-glow)', marginBottom: 6 }}>
                            🎯 {eventName}
                        </div>
                    )}
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: 560 }}>
                        {recommendation || 'Not sure what to attend next? Let AI analyze your bookings and suggest the perfect event for you!'}
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    {recommendation && (
                        <Link
                            to="/events"
                            style={{
                                color: 'var(--teal-glow)', textDecoration: 'none',
                                fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
                                fontSize: '0.9rem',
                            }}
                        >
                            Browse Events <ArrowRight size={16} />
                        </Link>
                    )}
                    <button
                        onClick={generateRecommendation}
                        disabled={loading}
                        style={{
                            background: recommendation ? 'rgba(124,77,255,0.15)' : 'var(--teal-glow)',
                            color: recommendation ? '#b388ff' : '#000',
                            border: recommendation ? '1px solid rgba(124,77,255,0.4)' : 'none',
                            padding: '10px 20px',
                            borderRadius: 12,
                            fontWeight: 700,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontSize: '0.9rem',
                            transition: 'all 0.2s',
                        }}
                    >
                        {loading
                            ? <Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} />
                            : recommendation ? <RefreshCw size={17} /> : <Sparkles size={17} />
                        }
                        {loading ? 'Analyzing...' : recommendation ? 'Try Again' : 'Get AI Suggestion'}
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
