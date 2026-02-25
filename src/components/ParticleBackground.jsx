import React, { useRef, useEffect } from 'react'

export default function ParticleBackground() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        resize()
        window.addEventListener('resize', resize)

        const particles = Array.from({ length: 80 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 2.5 + 0.5,
            dx: (Math.random() - 0.5) * 0.4,
            dy: -Math.random() * 0.6 - 0.2,
            opacity: Math.random() * 0.6 + 0.2,
            hue: Math.random() > 0.7 ? 280 : 190 + Math.random() * 30,
        }))

        let animId
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            particles.forEach((p) => {
                p.x += p.dx
                p.y += p.dy
                p.opacity -= 0.001

                if (p.y < -10 || p.opacity <= 0) {
                    p.x = Math.random() * canvas.width
                    p.y = canvas.height + 10
                    p.opacity = Math.random() * 0.6 + 0.2
                    p.r = Math.random() * 2.5 + 0.5
                    p.hue = Math.random() > 0.7 ? 280 : 190 + Math.random() * 30
                }

                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3)
                gradient.addColorStop(0, `hsla(${p.hue}, 100%, 70%, ${p.opacity})`)
                gradient.addColorStop(1, `hsla(${p.hue}, 100%, 70%, 0)`)

                ctx.beginPath()
                ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2)
                ctx.fillStyle = gradient
                ctx.fill()
            })

            animId = requestAnimationFrame(animate)
        }
        animate()

        return () => {
            cancelAnimationFrame(animId)
            window.removeEventListener('resize', resize)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 0,
                pointerEvents: 'none',
                opacity: 0.7,
            }}
        />
    )
}
