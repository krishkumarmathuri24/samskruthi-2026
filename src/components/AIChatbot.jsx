import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { useEventsStore } from '../store/store';
import { GoogleGenAI } from '@google/genai';

export default function AIChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hi there! I am the Samskruthi AI. Ask me anything about the fest, events, or schedules!' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const { events } = useEventsStore();

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        if (!apiKey || apiKey === 'your_gemini_api_key') {
            setTimeout(() => {
                setMessages(prev => [...prev, { role: 'assistant', content: 'Oops! The Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env file.' }]);
                setIsLoading(false);
            }, 1000);
            return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey });
            
            // Build context from events
            const eventContext = events.map(e => `- ${e.title} (${e.category}): ${e.duration} at ${e.venue}. Booked: ${e.tickets_booked}/${e.capacity}.`).join('\n');
            
            const systemPrompt = `You are Samskruthi AI, the official virtual assistant for the Samskruthi 2026 college fest. 
You are friendly, hype, and helpful. Answer strictly about the fest. Keep it short and concise.
Here is the current live event data:
${eventContext}`;

            const history = messages.map(m => `${m.role === 'assistant' ? 'model' : 'user'}: ${m.content}`).join('\n');
            const prompt = `${systemPrompt}\n\nConversation History:\n${history}\nuser: ${userMsg}\nmodel:`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            setMessages(prev => [...prev, { role: 'assistant', content: response.text }]);
        } catch (error) {
            console.error('AI Error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I am having trouble connecting to my AI brain right now. Try again later!' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Chat Flow Button */}
            <motion.button
                onClick={() => setIsOpen(true)}
                initial={{ scale: 0 }}
                animate={{ scale: isOpen ? 0 : 1 }}
                style={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00bcd4, #7c4dff)',
                    border: 'none',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 10px 30px rgba(0, 188, 212, 0.4)',
                    zIndex: 999
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <MessageSquare size={28} />
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        style={{
                            position: 'fixed',
                            bottom: 24,
                            right: 24,
                            width: 360,
                            height: 500,
                            background: 'rgba(2, 8, 18, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: 24,
                            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            zIndex: 1000
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '16px 20px',
                            background: 'rgba(0, 229, 255, 0.1)',
                            borderBottom: '1px solid var(--glass-border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: '50%',
                                    background: 'var(--teal-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000'
                                }}>
                                    <Bot size={18} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Samskruthi AI</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--teal-glow)' }}>Online</div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {messages.map((msg, idx) => (
                                <div key={idx} style={{
                                    display: 'flex',
                                    gap: 12,
                                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '85%',
                                }}>
                                    {msg.role === 'assistant' && (
                                        <div style={{
                                            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                                            background: 'rgba(0, 229, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal-glow)'
                                        }}>
                                            <Bot size={14} />
                                        </div>
                                    )}
                                    <div style={{
                                        padding: '12px 16px',
                                        background: msg.role === 'user' ? 'linear-gradient(135deg, #00bcd4, #0097a7)' : 'rgba(255,255,255,0.05)',
                                        color: msg.role === 'user' ? '#fff' : 'var(--text-secondary)',
                                        borderRadius: 16,
                                        borderTopRightRadius: msg.role === 'user' ? 4 : 16,
                                        borderTopLeftRadius: msg.role === 'assistant' ? 4 : 16,
                                        fontSize: '0.9rem',
                                        lineHeight: 1.5,
                                    }}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div style={{ display: 'flex', gap: 12, alignSelf: 'flex-start' }}>
                                    <div style={{
                                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                                        background: 'rgba(0, 229, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal-glow)'
                                    }}>
                                        <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                                    </div>
                                    <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: 16, borderTopLeftRadius: 4 }}>
                                        <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Thinking...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div style={{ padding: 16, borderTop: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)' }}>
                            <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    placeholder="Ask about events..."
                                    style={{
                                        flex: 1,
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: 24,
                                        padding: '10px 16px',
                                        color: '#fff',
                                        outline: 'none',
                                    }}
                                />
                                <button type="submit" disabled={isLoading || !input.trim()} style={{
                                    width: 40, height: 40, borderRadius: '50%',
                                    background: input.trim() ? 'var(--teal-glow)' : 'rgba(255,255,255,0.1)',
                                    color: input.trim() ? '#000' : 'rgba(255,255,255,0.3)',
                                    border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: input.trim() ? 'pointer' : 'default',
                                    transition: 'all 0.2s'
                                }}>
                                    <Send size={16} style={{ marginLeft: -2 }} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
