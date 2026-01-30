import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import Button from '../components/ui/Button'
import useGameStore from '../stores/gameStore'
import confetti from 'canvas-confetti'

const DenoiseImage = () => {
    const navigate = useNavigate()
    const { completeExperiment, setScore } = useGameStore()
    
    // 0 (Pure Noise) -> 100 (Clean Image)
    const [denoiseLevel, setDenoiseLevel] = useState(0)
    const [step, setStep] = useState('denoise') // 'denoise' | 'reveal'
    const canvasRef = useRef(null)

    // The "Seed" image (simulated) - normally a real image, here we generate noise on top
    // For simplicity, let's assume we want to reveal a "cat" or "galaxy" but we can simulate it with Canvas
    // Actually, let's use a placeholder image URL that is visually interesting
    const TARGET_IMAGE_URL = "https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=1200&auto=format&fit=crop" // Cat
    const imageRef = useRef(null)

    useEffect(() => {
        const img = new Image()
        img.crossOrigin = "Anonymous"
        img.src = TARGET_IMAGE_URL
        img.onload = () => {
            imageRef.current = img
            renderCanvas()
        }
    }, [])

    useEffect(() => {
        renderCanvas()
    }, [denoiseLevel])

    const renderCanvas = () => {
        const canvas = canvasRef.current
        const img = imageRef.current
        if (!canvas || !img) return

        const ctx = canvas.getContext('2d')
        const w = canvas.width = 600
        const h = canvas.height = 400

        // 1. Draw Image
        // Maintain aspect ratio cover
        const scale = Math.max(w / img.width, h / img.height)
        const x = (w - img.width * scale) / 2
        const y = (h - img.height * scale) / 2
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale)

        // 2. Add Noise based on denoiseLevel
        // Level 0 = 100% Noise intensity
        // Level 100 = 0% Noise intensity
        const noiseIntensity = 1 - (denoiseLevel / 100)
        
        if (noiseIntensity > 0.01) {
            const imageData = ctx.getImageData(0, 0, w, h)
            const data = imageData.data
            for (let i = 0; i < data.length; i += 4) {
                // Simple static noise
                const noise = (Math.random() - 0.5) * 500 * noiseIntensity
                data[i] = data[i] + noise
                data[i+1] = data[i+1] + noise
                data[i+2] = data[i+2] + noise
            }
            ctx.putImageData(imageData, 0, 0)
        }
    }

    const handleComplete = () => {
        setStep('reveal')
        completeExperiment('diffusion')
        setScore('diffusion', 100)
        confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#ffffff', '#06b6d4'] // White/Cyan theme
        })
    }

    return (
        <PageWrapper>
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-white max-w-6xl mx-auto">
                <div className="absolute top-8 left-8">
                     <div className="text-xs font-mono text-cyan-400 mb-1">EXP_06 // GENERATIVE_AI</div>
                     <h1 className="text-3xl font-bold">Diffusion (Denoising)</h1>
                </div>

                <div className="flex flex-col md:flex-row gap-12 items-center w-full">
                    {/* Visualizer */}
                    <div className="relative w-full md:w-2/3 max-w-[700px] aspect-video bg-black rounded-3xl border border-white/10 overflow-hidden shadow-2xl group">
                        <canvas ref={canvasRef} className="w-full h-full object-cover" />
                        
                        {/* Overlay text for drama */}
                        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-xs font-mono border border-white/10">
                            NOISE_LEVEL: <span className="text-red-400">{(100 - denoiseLevel)}%</span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="w-full md:w-1/3 space-y-8">
                        {step === 'denoise' ? (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-3xl font-bold mb-4">Sculpting from Chaos</h2>
                                    <p className="text-gray-400 text-lg leading-relaxed mb-6">
                                        Generative AI doesn't "draw" like a human. It starts with static (noise), and hallucinates a pattern into existence.
                                    </p>
                                </div>

                                <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                                    <label className="flex justify-between text-sm font-bold text-cyan-400 mb-4">
                                        <span>RANDOM NOISE</span>
                                        <span>CLEAR IMAGE</span>
                                    </label>
                                    <input 
                                        type="range" 
                                        min="0" max="100" 
                                        value={denoiseLevel} 
                                        onChange={(e) => setDenoiseLevel(parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                    />
                                </div>

                                <Button 
                                    onClick={handleComplete} 
                                    size="xl" 
                                    disabled={denoiseLevel < 90}
                                    className={`w-full ${denoiseLevel >= 90 ? 'animate-pulse-glow' : 'opacity-50'}`}
                                >
                                    Finalize Creation
                                </Button>
                            </div>
                        ) : (
                             <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-6">
                                <div>
                                    <h1 className="text-4xl font-bold mb-4 text-cyan-400">Creation Complete</h1>
                                    <p className="text-gray-300 leading-relaxed">
                                        You just acted as a <b>Diffusion Model</b> (like Stable Diffusion or Midjourney). You took pure randomness and guided it into a specific form.
                                    </p>
                                </div>
                                
                                <div className="p-6 rounded-2xl border border-white/10 text-center">
                                    <div className="text-xs font-mono text-gray-500 uppercase mb-2">Key Takeaway</div>
                                    <p className="text-2xl font-light italic text-white">
                                        "Generation is controlled randomness."
                                    </p>
                                </div>

                                <Button onClick={() => navigate('/reflection')} size="xl" className="w-full shadow-2xl shadow-cyan-500/20">
                                    Final Reflection → 
                                </Button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </PageWrapper>
    )
}

export default DenoiseImage
