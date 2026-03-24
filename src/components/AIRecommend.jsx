import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, Loader2, RefreshCw } from 'lucide-react'
import { useEventsStore, useTicketStore } from '../store/store'
import { Link } from 'react-router-dom'
import { GoogleGenAI } from '@google/genai'

export default function AIRecommend() {
    const { events } = useEventsStore()
    const { userTickets } = useTicketStore()
    const [recommendation, setRecommendation] = useState('')
    const [eventName, setEventName] = useState('')
    const [loading, setLoading] = useState(false)

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY

    const generateRecommendation = async () => {
        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
            setRecommendation('Please add your VITE_GEMINI_API_KEY in the .env file to unlock AI recommendations!')
            return
        }

        setLoading(true)
        setRecommendation('')
        setEventName('')
        try {
            const ai = new GoogleGenAI({ apiKey })

            const bookedTitles = userTickets
                .map(t => t.events?.title)
                .filter(Boolean)

            const bookedContext = bookedTitles.length > 0
                ? 'User has already booked: ' + bookedTitles.join(', ') + '.'
                : 'User has not booked any events yet.'

            const available = events
                .filter(e => !bookedTitles.includes(e.title))
                .map(e => '- ' + e.title + ' (' + e.category + '): ' + (e.description || 'A great event'))
                .join('\n')

            const prompt = [
                'You are an AI event matchmaker for Samskruthi 2026.',
                bookedContext,
                'Available events the user has not booked yet:',
                available,
                '',
                'Suggest exactly ONE event they should attend.',
                'Respond in this format only:',
                'EVENT: <event title>',
                'REASON: <one exciting sentence why they should attend>',
            ].join('\n')

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            })

            const text = response.text || ''
            const eventMatch = text.match(/EVENT:\s*(.+)/i)
            const reasonMatch = text.match(/REASON:\s*(.+)/i)

            setEventName(eventMatch ? eventMatch[1].trim() : '')
            setRecommendation(reasonMatch ? reasonMatch[1].trim() : text.trim())
        } catch (error) {
            console.error('AI Recommend error:', error)
            setRecommendation('Having trouble connecting right now. Try again in a moment!')
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
