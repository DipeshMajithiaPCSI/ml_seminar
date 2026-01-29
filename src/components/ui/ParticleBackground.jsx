import { useEffect, useRef } from 'react'

const ParticleBackground = () => {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        let animationId
        let particles = []
        let connections = []

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }

        const createParticles = () => {
            particles = []
            const particleCount = Math.floor((canvas.width * canvas.height) / 15000)

            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    radius: Math.random() * 2 + 1,
                    color: Math.random() > 0.5 ? '#06b6d4' : '#a855f7'
                })
            }
        }

        const drawParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Draw connections
            const connectionDistance = 150

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x
                    const dy = particles[i].y - particles[j].y
                    const distance = Math.sqrt(dx * dx + dy * dy)

                    if (distance < connectionDistance) {
                        const opacity = (1 - distance / connectionDistance) * 0.3
                        ctx.beginPath()
                        ctx.strokeStyle = `rgba(6, 182, 212, ${opacity})`
                        ctx.lineWidth = 1
                        ctx.moveTo(particles[i].x, particles[i].y)
                        ctx.lineTo(particles[j].x, particles[j].y)
                        ctx.stroke()
                    }
                }
            }

            // Draw and update particles
            particles.forEach(particle => {
                // Draw particle
                ctx.beginPath()
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
                ctx.fillStyle = particle.color
                ctx.globalAlpha = 0.6
                ctx.fill()
                ctx.globalAlpha = 1

                // Add glow
                ctx.beginPath()
                ctx.arc(particle.x, particle.y, particle.radius * 2, 0, Math.PI * 2)
                const gradient = ctx.createRadialGradient(
                    particle.x, particle.y, 0,
                    particle.x, particle.y, particle.radius * 3
                )
                gradient.addColorStop(0, particle.color + '40')
                gradient.addColorStop(1, 'transparent')
                ctx.fillStyle = gradient
                ctx.fill()

                // Update position
                particle.x += particle.vx
                particle.y += particle.vy

                // Bounce off edges
                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1
            })
        }

        const animate = () => {
            drawParticles()
            animationId = requestAnimationFrame(animate)
        }

        resize()
        createParticles()
        animate()

        window.addEventListener('resize', () => {
            resize()
            createParticles()
        })

        return () => {
            cancelAnimationFrame(animationId)
            window.removeEventListener('resize', resize)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ opacity: 0.6 }}
        />
    )
}

export default ParticleBackground
