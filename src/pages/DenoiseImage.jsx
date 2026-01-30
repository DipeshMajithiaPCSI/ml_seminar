import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import Button from '../components/ui/Button'
import useGameStore from '../stores/gameStore'
import confetti from 'canvas-confetti'
import GameFeedback from '../components/ui/GameFeedback'



const DenoiseImage = () => {
    const navigate = useNavigate()
    const { completeExperiment, setScore } = useGameStore()
    
    // States: 'training_intro', 'forward_diffusion', 'training_sim', 'reverse_intro', 'reverse_diffusion'
    const [step, setStep] = useState('training_intro')
    const [noiseLevel, setNoiseLevel] = useState(0) // 0 = Clean, 100 = Pure Noise
    const [showFeedback, setShowFeedback] = useState(false)
    const [isTraining, setIsTraining] = useState(false)

    const canvasRef = useRef(null)
    const imageRef = useRef(null)
    const TARGET_IMAGE_URL = "https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=1200&auto=format&fit=crop"

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
    }, [noiseLevel])

    const renderCanvas = () => {
        const canvas = canvasRef.current
        const img = imageRef.current
        if (!canvas || !img) return

        const ctx = canvas.getContext('2d')
        const w = canvas.width = 600
        const h = canvas.height = 400

        // 1. Draw Image
        const scale = Math.max(w / img.width, h / img.height)
        const x = (w - img.width * scale) / 2
        const y = (h - img.height * scale) / 2
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale)

        // 2. Add Noise
        // noiseLevel 0 = Clean, 100 = Noisy
        const intensity = noiseLevel / 100
        
        if (intensity > 0.01) {
            const imageData = ctx.getImageData(0, 0, w, h)
            const data = imageData.data
            for (let i = 0; i < data.length; i += 4) {
                const noise = (Math.random() - 0.5) * 500 * intensity
                data[i] = data[i] + noise
                data[i+1] = data[i+1] + noise
                data[i+2] = data[i+2] + noise
            }
            ctx.putImageData(imageData, 0, 0)
        }
    }

    const runTrainingSim = () => {
        setIsTraining(true)
        setTimeout(() => {
            setIsTraining(false)
            setStep('reverse_intro')
            setNoiseLevel(100) // Start reverse from noise
        }, 3000)
    }

    const handleComplete = () => {
        completeExperiment('diffusion')
        setScore('diffusion', 100)
        confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#ffffff', '#06b6d4']
        })
        setTimeout(() => {
            setShowFeedback(true)
        }, 1000)
    }

    return (
        <PageWrapper>
            <GameFeedback 
                isOpen={showFeedback}
                isSuccess={true}
                gifUrl="https://media.giphy.com/media/RiGmF093b1QjL7V17f/giphy.gif"
                title="Creation Complete"
                description="You trained a model to reverse entropy."
                explanation="Diffusion models learn by destroying images (Forward Process) and then learning to predict and subtract that noise (Reverse Process) to create something new."
                onNext={() => navigate('/reflection')}
                nextLabel="Final Reflection →"
            />
            
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-white max-w-6xl mx-auto">
                <div className="absolute top-8 left-8">
                     <div className="text-xs font-mono text-cyan-400 mb-1">EXP_06 // GENERATIVE_AI</div>
                     <h1 className="text-3xl font-bold">Diffusion Training</h1>
                </div>

                <div className="flex flex-col md:flex-row gap-12 items-center w-full">
                    {/* Visualizer */}
                    <div className="relative w-full md:w-2/3 max-w-[700px] aspect-video bg-black rounded-3xl border border-white/10 overflow-hidden shadow-2xl group">
                        <canvas ref={canvasRef} className="w-full h-full object-cover" />
                        
                        {/* Training Overlay */}
                        <AnimatePresence>
                            {isTraining && (
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center font-mono text-cyan-400"
                                >
                                    <div className="mb-4 text-2xl animate-pulse">TRAINING NEURAL NETWORK...</div>
                                    <div className="space-y-2 text-sm opacity-70">
                                        <div>Prediction Error: 0.842...</div>
                                        <div>Optimizing Weights...</div>
                                        <div>Noise Pattern Learned.</div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Controls */}
                    <div className="w-full md:w-1/3 space-y-8">
                        
                        {/* Phase 1: Training Intro */}
                        {step === 'training_intro' && (
                            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-6">
                                <h2 className="text-3xl font-bold text-yellow-400">Step 1: The Teacher</h2>
                                <p className="text-gray-300 text-lg">
                                    Before AI can create, it must learn how images are destroyed.
                                    <br/><br/>
                                    We call this <b>Forward Diffusion</b>.
                                </p>
                                <Button onClick={() => setStep('forward_diffusion')} size="xl" className="w-full">
                                    Start Training Process
                                </Button>
                            </motion.div>
                        )}

                        {/* Phase 2: Forward Diffusion (Add Noise) */}
                        {step === 'forward_diffusion' && (
                            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-6">
                                <h2 className="text-2xl font-bold text-red-400">Destroy the Data</h2>
                                <p className="text-gray-400">
                                    Add noise until the image is unrecognizable. This creates "Question (Noise) -> Answer (Image)" pairs for the AI.
                                </p>
                                <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                                    <label className="flex justify-between text-sm font-bold text-red-500 mb-4">
                                        <span>CLEAN</span>
                                        <span>NOISE</span>
                                    </label>
                                    <input 
                                        type="range" min="0" max="100" value={noiseLevel} 
                                        onChange={(e) => setNoiseLevel(parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                                    />
                                </div>
                                <Button 
                                    onClick={() => setStep('training_sim')} 
                                    size="lg" disabled={noiseLevel < 95}
                                    className={`w-full ${noiseLevel >= 95 ? 'animate-pulse-glow' : 'opacity-50'}`}
                                >
                                    Teach Model
                                </Button>
                            </motion.div>
                        )}

                        {/* Phase 3: Training Sim */}
                        {step === 'training_sim' && (
                            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-6">
                                <h2 className="text-2xl font-bold text-white">Learning the Pattern</h2>
                                <p className="text-gray-300">
                                    The AI looks at the noisy image and tries to guess what noise was added.
                                </p>
                                <Button onClick={runTrainingSim} size="xl" className="w-full">
                                    Run Optimizer
                                </Button>
                            </motion.div>
                        )}

                        {/* Phase 4: Reverse Intro */}
                        {step === 'reverse_intro' && (
                            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-6">
                                <h2 className="text-3xl font-bold text-cyan-400">Step 2: The Creator</h2>
                                <p className="text-gray-300 text-lg">
                                    Now the AI knows how to remove noise.
                                    <br/><br/>
                                    We give it pure random static, and it hallucinates a cat.
                                </p>
                                <Button onClick={() => setStep('reverse_diffusion')} size="xl" className="w-full">
                                    Start Generation
                                </Button>
                            </motion.div>
                        )}

                        {/* Phase 5: Reverse Diffusion (Remove Noise) */}
                        {step === 'reverse_diffusion' && (
                             <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-6">
                                <h2 className="text-2xl font-bold text-cyan-400">Reverse Diffusion</h2>
                                <p className="text-gray-400">
                                    Remove the noise to reveal the creation.
                                </p>
                                <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                                    <label className="flex justify-between text-sm font-bold text-cyan-500 mb-4">
                                        <span>PURE NOISE</span>
                                        <span>CREATION</span>
                                    </label>
                                    <input 
                                        type="range" min="0" max="100" 
                                        value={100 - noiseLevel} // Invert for UX: Slider moves right to clean
                                        onChange={(e) => setNoiseLevel(100 - parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                    />
                                </div>
                                <Button 
                                    onClick={handleComplete} 
                                    size="lg" disabled={noiseLevel > 10}
                                    className={`w-full ${noiseLevel <= 10 ? 'animate-pulse-glow' : 'opacity-50'}`}
                                >
                                    Finalize Creation
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
