import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import Button from '../components/ui/Button'
import useGameStore from '../stores/gameStore'
import confetti from 'canvas-confetti'
import GameFeedback from '../components/ui/GameFeedback'

const IMAGES = [
    {
        id: 1,
        name: "A Fluffy Cat",
        url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=600&auto=format&fit=crop",
        hint: "This pet purrs."
    },
    {
        id: 2,
        name: "A Fast Car",
        url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=600&auto=format&fit=crop",
        hint: "Vroom vroom."
    },
    {
        id: 3,
        name: "A Green Veggie Burger",
        url: "https://images.unsplash.com/photo-1520072959219-c595dc3f3a1f?q=80&w=600&auto=format&fit=crop",
        hint: "Spinach and peas!"
    }
]

const DenoiseImage = () => {
    const navigate = useNavigate()
    const { completeExperiment, setScore } = useGameStore()

    const [levelIndex, setLevelIndex] = useState(0)
    const [step, setStep] = useState('training_intro') // 'training_intro', 'forward_diffusion', 'training_sim', 'reverse_intro', 'reverse_diffusion'
    const [noiseLevel, setNoiseLevel] = useState(0) // 0 = Clean, 100 = Pure Noise
    const [showFeedback, setShowFeedback] = useState(false)
    const [isTraining, setIsTraining] = useState(false)

    const canvasRef = useRef(null)
    const imageRef = useRef(null)

    const currentImage = IMAGES[levelIndex]

    // Load Image when level changes
    useEffect(() => {
        const img = new Image()
        img.crossOrigin = "Anonymous"
        img.src = currentImage.url
        img.onload = () => {
            imageRef.current = img
            renderCanvas()
        }
    }, [levelIndex])

    useEffect(() => {
        renderCanvas()
    }, [noiseLevel, levelIndex])

    const renderCanvas = () => {
        const canvas = canvasRef.current
        const img = imageRef.current
        if (!canvas || !img) return

        const ctx = canvas.getContext('2d')
        const w = canvas.width = 600
        const h = canvas.height = 400

        // 1. Draw Image (Scaled to fit)
        ctx.fillStyle = "#000"
        ctx.fillRect(0, 0, w, h)

        const scale = Math.max(w / img.width, h / img.height)
        const x = (w - img.width * scale) / 2
        const y = (h - img.height * scale) / 2
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale)

        // 2. Add Noise
        // Intensity Multiplier increased drastically to ensure total destruction
        // At 100%, we want the original signal to be completely lost
        const intensity = (noiseLevel / 100) * 8.0

        if (intensity > 0.01) {
            const imageData = ctx.getImageData(0, 0, w, h)
            const data = imageData.data
            for (let i = 0; i < data.length; i += 4) {
                const noise = (Math.random() - 0.5) * 255 * intensity

                data[i] = Math.min(255, Math.max(0, data[i] + noise))
                data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise))
                data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise))
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
        }, 2500)
    }

    const handleLevelComplete = () => {
        if (levelIndex < IMAGES.length - 1) {
            // Next Level loop
            setStep('training_intro')
            setNoiseLevel(0)
            setLevelIndex(prev => prev + 1)
        } else {
            console.log("Switching to explanation step")
            setStep('explanation')
        }
    }

    const handleFinish = () => {
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
                gifUrl="https://media.tenor.com/0TViGuue4hEAAAAM/i-eat-success-with-skim-milk.gif"
                title="Creation Complete"
                description="You mastered the art of Diffusion."
                explanation="Diffusion models (like Dall-E & Midjourney) learn by destroying millions of images with noise, then reversing the process to create new art from nothing."
                onNext={() => navigate('/reflection')}
                nextLabel="Final Reflection →"
            />

            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-white max-w-6xl mx-auto">
                <div className="absolute top-8 left-8">
                    <div className="text-xs font-mono text-cyan-400 mb-1">EXP_06 // GENERATIVE_AI</div>
                    <h1 className="text-3xl font-bold">Diffusion Training</h1>
                </div>

                <AnimatePresence mode="wait">
                    {step === 'explanation' ? (
                        <motion.div
                            key="explanation"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full max-w-5xl mt-12"
                        >
                            <h2 className="text-5xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                                How Generative AI Actually Works
                            </h2>

                            {/* Visual Diagram */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                                {/* Forward */}
                                <div className="p-8 bg-red-900/10 rounded-3xl border border-red-500/20 backdrop-blur-sm">
                                    <h3 className="text-2xl font-bold text-red-400 mb-4">1. Forward Diffusion (Training)</h3>
                                    <p className="text-gray-400 mb-6 text-lg">We destroy millions of images to create training data.</p>
                                    <div className="flex items-center justify-between text-4xl bg-black/30 p-6 rounded-xl">
                                        <span>🖼️</span>
                                        <span className="text-base text-gray-500 font-mono">→ +Noise →</span>
                                        <span>🌫️</span>
                                    </div>
                                    <div className="mt-6 text-sm bg-black/40 p-4 rounded-xl border-l-4 border-red-500/50">
                                        <b>Task:</b> "Predict how much noise was added."
                                    </div>
                                </div>

                                {/* Reverse */}
                                <div className="p-8 bg-cyan-900/10 rounded-3xl border border-cyan-500/20 backdrop-blur-sm">
                                    <h3 className="text-2xl font-bold text-cyan-400 mb-4">2. Reverse Diffusion (Generation)</h3>
                                    <p className="text-gray-400 mb-6 text-lg">The AI starts with pure static and subtracts the predicted noise.</p>
                                    <div className="flex items-center justify-between text-4xl bg-black/30 p-6 rounded-xl">
                                        <span>🌫️</span>
                                        <span className="text-base text-gray-500 font-mono">→ -Noise →</span>
                                        <span>🖼️</span>
                                    </div>
                                    <div className="mt-6 text-sm bg-black/40 p-4 rounded-xl border-l-4 border-cyan-500/50">
                                        <b>Result:</b> A brand new image is "sculpted".
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-white/5 rounded-3xl border border-white/10 text-center max-w-3xl mx-auto mb-12">
                                <h3 className="text-2xl font-bold text-yellow-400 mb-4">💡 The "Sculptor" Analogy</h3>
                                <p className="text-xl text-gray-300 leading-relaxed font-light">
                                    "Imagine a block of marble (Random Noise). <br />
                                    The AI is the sculptor. It doesn't know exactly what it's making, but it has seen millions of statues (Training Data). <br />
                                    It chips away the 'excess marble' (Noise) bit by bit until a shape emerges."
                                </p>
                            </div>

                            <div className="flex gap-6 justify-center max-w-xl mx-auto">
                                <Button onClick={() => window.location.reload()} size="xl" className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300">
                                    ↺ Replay Game
                                </Button>
                                <Button onClick={handleFinish} size="xl" className="flex-1 shadow-2xl shadow-purple-500/20 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500">
                                    Finish Seminar →
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="flex flex-col md:flex-row gap-12 items-center w-full">
                            {/* Visualizer */}
                            <div className="relative w-full md:w-2/3 max-w-[700px] aspect-video bg-black rounded-3xl border border-white/10 overflow-hidden shadow-2xl group">
                                <canvas ref={canvasRef} className="w-full h-full object-cover" />

                                {/* Hint Overlay */}
                                <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full text-xs font-mono border border-white/20">
                                    Training Sample: {currentImage.name}
                                </div>

                                {/* Training Overlay */}
                                <AnimatePresence>
                                    {isTraining && (
                                        <motion.div
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center font-mono text-cyan-400"
                                        >
                                            <div className="mb-4 text-2xl animate-pulse">TRAINING NEURAL NETWORK...</div>
                                            <div className="space-y-2 text-sm opacity-70">
                                                <div>Prediction Error: {Math.random().toFixed(3)}</div>
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
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                        <h2 className="text-3xl font-bold text-yellow-400">Level {levelIndex + 1}: The Teacher</h2>
                                        <p className="text-gray-300 text-lg">
                                            We need to teach the AI what a <b>{currentImage.name}</b> looks like.
                                            <br /><br />
                                            First, let's destroy it.
                                        </p>
                                        <Button onClick={() => setStep('forward_diffusion')} size="xl" className="w-full">
                                            Start Forward Process
                                        </Button>
                                    </motion.div>
                                )}

                                {/* Phase 2: Forward Diffusion (Add Noise) */}
                                {step === 'forward_diffusion' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                        <h2 className="text-2xl font-bold text-red-400">Destroy the Data</h2>
                                        <p className="text-gray-400">
                                            Add noise until the image is <b>pure static</b>.
                                        </p>
                                        <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                                            <label className="flex justify-between text-sm font-bold text-red-500 mb-4">
                                                <span>CLEAN</span>
                                                <span>PURE NOISE</span>
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
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                        <h2 className="text-2xl font-bold text-white">Learning the Pattern</h2>
                                        <p className="text-gray-300">
                                            The AI is analyzing how the pixels of the {currentImage.name} behave when destroyed.
                                        </p>
                                        <Button onClick={runTrainingSim} size="xl" className="w-full" disabled={isTraining}>
                                            {isTraining ? "Optimizing..." : "Run Optimizer"}
                                        </Button>
                                    </motion.div>
                                )}

                                {/* Phase 4: Reverse Intro */}
                                {step === 'reverse_intro' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                        <h2 className="text-3xl font-bold text-cyan-400">Step 2: The Creator</h2>
                                        <p className="text-gray-300 text-lg">
                                            Now, let's reverse time.
                                            <br /><br />
                                            Starting from randomness, guide the AI to hallucinate the image back.
                                        </p>
                                        <Button onClick={() => setStep('reverse_diffusion')} size="xl" className="w-full">
                                            Start Generation
                                        </Button>
                                    </motion.div>
                                )}

                                {/* Phase 5: Reverse Diffusion (Remove Noise) */}
                                {step === 'reverse_diffusion' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                        <h2 className="text-2xl font-bold text-cyan-400">Reverse Diffusion</h2>
                                        <p className="text-gray-400">
                                            Slowly remove the noise to reveal the {currentImage.name}.
                                        </p>
                                        <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                                            <label className="flex justify-between text-sm font-bold text-cyan-500 mb-4">
                                                <span>NOISY</span>
                                                <span>CLEAN</span>
                                            </label>
                                            <input
                                                type="range" min="0" max="100"
                                                value={100 - noiseLevel} // Invert for UX
                                                onChange={(e) => setNoiseLevel(100 - parseInt(e.target.value))}
                                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                            />
                                        </div>
                                        <Button
                                            onClick={handleLevelComplete}
                                            size="lg" disabled={noiseLevel > 10}
                                            className={`w-full ${noiseLevel <= 10 ? 'animate-pulse-glow' : 'opacity-50'}`}
                                        >
                                            {levelIndex < IMAGES.length - 1 ? "Next Image →" : "Finalize Training"}
                                        </Button>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </PageWrapper>
    )
}

export default DenoiseImage
