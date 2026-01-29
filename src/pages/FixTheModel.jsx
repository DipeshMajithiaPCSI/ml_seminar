import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import Button from '../components/ui/Button'
import useGameStore from '../stores/gameStore'
import confetti from 'canvas-confetti'

const LEVELS = [
    {
        id: 1,
        name: "The Offset (Bias)",
        description: "The slope is perfect, but the line is too low. Adjust the Bias (b) to fix it.",
        points: [{ x: 10, y: 30 }, { x: 20, y: 40 }, { x: 50, y: 70 }],
        targetSlope: 1,
        targetBias: 20,
        startSlope: 1,
        startBias: -10,
        lockedSlope: true
    },
    {
        id: 2,
        name: "The Angle (Weight)",
        description: "The starting point is fine, but the angle is wrong. Adjust the Weight (m).",
        points: [{ x: 0, y: 10 }, { x: 20, y: 50 }, { x: 40, y: 90 }],
        targetSlope: 2,
        targetBias: 10,
        startSlope: 0.5,
        startBias: 10,
        lockedBias: true
    },
    {
        id: 3,
        name: "The Combo",
        description: "Everything is wrong. You need to find the perfect balance.",
        points: [{ x: 10, y: 25 }, { x: 30, y: 65 }, { x: 50, y: 105 }],
        targetSlope: 2,
        targetBias: 5,
        startSlope: 0.5,
        startBias: 50,
        lockedSlope: false,
        lockedBias: false
    }
]

// Interactive Graph Component
const InteractiveGraph = ({ points, slope, bias }) => {
    const minX = 0, maxX = 60
    const width = 100, height = 100

    const scaleX = (x) => (x / maxX) * width
    const scaleY = (y) => height - (y / 120) * height

    const x1 = minX, x2 = maxX
    const y1 = slope * x1 + bias, y2 = slope * x2 + bias

    return (
        <div className="w-full h-80 bg-black/40 rounded-xl border border-white/10 relative overflow-hidden select-none">
            <svg viewBox="0 0 100 100" className="w-full h-full p-8" preserveAspectRatio="none">
                <defs>
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />
                <line x1="0" y1="100" x2="100" y2="100" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
                <line x1="0" y1="0" x2="0" y2="100" stroke="white" strokeOpacity="0.2" strokeWidth="1" />

                {points.map((p, i) => {
                    const predictedY = slope * p.x + bias
                    return (
                        <line
                            key={`err-${i}`}
                            x1={scaleX(p.x)} y1={scaleY(p.y)}
                            x2={scaleX(p.x)} y2={scaleY(predictedY)}
                            stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.6"
                        />
                    )
                })}

                <line
                    x1={scaleX(x1)} y1={scaleY(y1)}
                    x2={scaleX(x2)} y2={scaleY(y2)}
                    stroke="#06b6d4" strokeWidth="2"
                    className="drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                />

                {points.map((p, i) => (
                    <circle
                        key={i} cx={scaleX(p.x)} cy={scaleY(p.y)} r="2"
                        fill="white" className="drop-shadow-md"
                    />
                ))}
            </svg>
            <div className="absolute top-4 right-4 text-xs font-mono text-cyan-500">
                y = {slope.toFixed(2)}x + {bias.toFixed(1)}
            </div>
        </div>
    )
}

const FixTheModel = () => {
    const navigate = useNavigate()
    const { completeExperiment, setScore } = useGameStore()

    const [levelIndex, setLevelIndex] = useState(0)
    const [step, setStep] = useState('game') // 'game' | 'reveal'
    const [slope, setSlope] = useState(1)
    const [bias, setBias] = useState(0)
    const [error, setError] = useState(100)
    const [isWin, setIsWin] = useState(false)

    const level = LEVELS[levelIndex]

    // Initialize Level
    useEffect(() => {
        if (step === 'game') {
            setSlope(level.startSlope)
            setBias(level.startBias)
            setIsWin(false)
        }
    }, [levelIndex, step])

    // Calculate Error Loop
    useEffect(() => {
        let totalError = 0
        level.points.forEach(p => {
            const prediction = slope * p.x + bias
            totalError += Math.abs(prediction - p.y)
        })
        const avgError = totalError / level.points.length
        setError(avgError)

        if (avgError < 2.0 && !isWin) {
            setIsWin(true)
            confetti({
                particleCount: 50,
                spread: 40,
                origin: { y: 0.7 },
                colors: ['#06b6d4', '#a855f7']
            })
        } else if (avgError >= 2.0 && isWin) {
            setIsWin(false)
        }
    }, [slope, bias, level])

    const handleNext = () => {
        if (levelIndex < LEVELS.length - 1) {
            setLevelIndex(prev => prev + 1)
        } else {
            setStep('reveal')
            completeExperiment('fix-the-model')
            setScore('fix-the-model', 100)
        }
    }

    return (
        <PageWrapper>
            <AnimatePresence mode="wait">
                {step === 'game' ? (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="min-h-screen flex flex-col items-center justify-center p-6 text-white max-w-6xl mx-auto"
                    >
                        {/* Game UI */}
                        <div className="w-full flex justify-between items-end mb-8 border-b border-white/10 pb-4">
                            <div>
                                <div className="text-xs font-mono text-cyan-400 mb-1">EXP_02 // FIX_THE_MODEL</div>
                                <h1 className="text-4xl font-bold">{level.name}</h1>
                                <p className="text-gray-400 mt-2">{level.description}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-mono text-gray-500 mb-1">LEVEL</div>
                                <div className="text-2xl font-bold">{levelIndex + 1}/{LEVELS.length}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
                            <div className="lg:col-span-2">
                                <InteractiveGraph points={level.points} slope={slope} bias={bias} />
                            </div>

                            <div className="flex flex-col gap-6 p-6 bg-white/5 rounded-2xl border border-white/10">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-xs font-mono text-gray-400">TOTAL ERROR (LOSS)</span>
                                        <span className={`text-xl font-mono font-bold ${error < 2 ? 'text-green-400' : 'text-red-400'}`}>
                                            {error.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="h-4 bg-gray-900 rounded-full overflow-hidden border border-white/10">
                                        <motion.div
                                            initial={{ width: '100%' }}
                                            animate={{
                                                width: `${Math.min(error * 4, 100)}%`,
                                                backgroundColor: error < 2 ? '#4ade80' : '#ef4444'
                                            }}
                                            className="h-full transition-all duration-300"
                                        />
                                    </div>
                                </div>

                                <hr className="border-white/10" />

                                <div className="space-y-6">
                                    <div className={level.lockedSlope ? 'opacity-30 pointer-events-none' : ''}>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-sm font-bold text-cyan-400">Weight (Slope)</label>
                                            <span className="font-mono">{slope.toFixed(2)}</span>
                                        </div>
                                        <input
                                            type="range" min="0" max="4" step="0.1" value={slope}
                                            onChange={(e) => setSlope(parseFloat(e.target.value))}
                                            className="w-full accent-cyan-500 bg-gray-800 h-2 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>

                                    <div className={level.lockedBias ? 'opacity-30 pointer-events-none' : ''}>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-sm font-bold text-purple-400">Bias (Offset)</label>
                                            <span className="font-mono">{bias.toFixed(1)}</span>
                                        </div>
                                        <input
                                            type="range" min="-50" max="50" step="1" value={bias}
                                            onChange={(e) => setBias(parseFloat(e.target.value))}
                                            className="w-full accent-purple-500 bg-gray-800 h-2 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div className="mt-auto pt-4">
                                    <Button
                                        onClick={handleNext} disabled={!isWin}
                                        className={`w-full ${isWin ? 'animate-pulse-glow' : 'opacity-50'}`}
                                    >
                                        {levelIndex === LEVELS.length - 1 ? 'Analyze Results' : 'Next Level'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="reveal"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="min-h-screen flex flex-col items-center justify-center p-6 text-white max-w-7xl mx-auto"
                    >
                        <div className="text-center mb-16">
                            <motion.h1
                                initial={{ y: 20 }} animate={{ y: 0 }}
                                className="text-5xl md:text-7xl font-bold mb-6"
                            >
                                You just performed <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Gradient Descent</span>.
                            </motion.h1>
                            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
                                Training a model isn't magic. It's just tweaking sliders to make the error bar go down.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full px-4">
                            {/* Concept 1: Loss Function */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                                className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-red-500/30 transition-colors"
                            >
                                <div className="h-4 bg-gray-900 rounded-full overflow-hidden border border-white/10 mb-6">
                                    <div className="h-full w-1/4 bg-red-500" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2 text-red-400">The Error Meter</h3>
                                <div className="text-gray-300">
                                    In AI, this is called the <span className="text-white font-bold">Loss Function</span>.
                                    It calculates exactly how "wrong" the model is. The goal of training is simply to get this number to zero.
                                </div>
                            </motion.div>

                            {/* Concept 2: Optimization */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                                className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-colors"
                            >
                                <div className="flex gap-4 mb-6">
                                    <div className="w-1/2 h-2 bg-cyan-500 rounded-full" />
                                    <div className="w-1/2 h-2 bg-purple-500 rounded-full" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2 text-cyan-400">The Sliders</h3>
                                <div className="text-gray-300">
                                    Adjusting weights and biases to reduce error is called <span className="text-white font-bold">Optimization</span>.
                                    Computers do exactly what you just did, but they use calculus (Gradient Descent) to find the perfect setting instantly.
                                </div>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                            className="mt-16"
                        >
                            <Button onClick={() => navigate('/experiment/3')} size="xl" className="shadow-2xl shadow-cyan-500/20">
                                Next: The Separator (Classification) →
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </PageWrapper>
    )
}

export default FixTheModel
