
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import Button from '../components/ui/Button'
import useGameStore from '../stores/gameStore'
import confetti from 'canvas-confetti'
import GameFeedback from '../components/ui/GameFeedback'

const LEVELS = [
    {
        id: 1,
        name: "Linear Regression (ML)",
        description: "Standard Machine Learning fits a straight line. Adjust Slope (m) and Bias (b).",
        points: [{ x: 10, y: 30 }, { x: 30, y: 70 }, { x: 50, y: 110 }],
        targetSlope: 2,
        targetBias: 10,
        targetCurvature: 0,
        startSlope: 0.5,
        startBias: 50,
        startCurvature: 0,
        lockedSlope: false,
        lockedBias: false,
        lockedCurvature: true, // ML can't bend
        detailed: "This is Linear Regression. It minimizes the error by finding the best straight line. It works great for simple trends.",
        winGif: "https://media.giphy.com/media/l3q2Z5667uYoJ2LLy/giphy.gif"
    },
    {
        id: 2,
        name: "Deep Learning (Non-Linear)",
        description: "The data is curved! A straight line can't fit this. You need to add 'Complexity'.",
        points: [{ x: 10, y: 90 }, { x: 30, y: 30 }, { x: 50, y: 90 }], // Parabola
        targetSlope: 0,
        targetBias: 30,
        targetCurvature: 0.15, // Positive curvature
        startSlope: 0,
        startBias: 60,
        startCurvature: 0,
        lockedSlope: false,
        lockedBias: false,
        lockedCurvature: false, // DL power unlocked
        detailed: "Deep Learning introduces 'Non-Linearity' (like ReLU or Sigmoid functions). This allows the model to bend and fit complex, real-world data.",
        winGif: "https://media.giphy.com/media/26AHONTmuXD2WDV6g/giphy.gif"
    }
]

// Interactive Graph Component
const InteractiveGraph = ({ points, slope, bias, curvature }) => {
    const minX = 0, maxX = 60
    const width = 100, height = 100

    const scaleX = (x) => (x / maxX) * width
    const scaleY = (y) => height - (y / 120) * height

    // Generate path for the curve/line
    const generatePath = () => {
        let d = `M ${scaleX(0)} ${scaleY(bias + curvature * Math.pow(0 - 30, 2))}`
        for(let x=1; x<=60; x++) {
            // y = mx + b + c*(x-center)^2
            // We center the curve at x=30 for intuitive control
            const y = slope * x + bias + curvature * Math.pow(x - 30, 2)
            d += ` L ${scaleX(x)} ${scaleY(y)}`
        }
        return d
    }

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
                    const predictedY = slope * p.x + bias + curvature * Math.pow(p.x - 30, 2)
                    return (
                        <line
                            key={`err-${i}`}
                            x1={scaleX(p.x)} y1={scaleY(p.y)}
                            x2={scaleX(p.x)} y2={scaleY(predictedY)}
                            stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.6"
                        />
                    )
                })}

                <path
                    d={generatePath()}
                    fill="none"
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
                Error: {points.reduce((acc, p) => acc + Math.abs((slope * p.x + bias + curvature * Math.pow(p.x - 30, 2)) - p.y), 0).toFixed(1)}
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
    const [curvature, setCurvature] = useState(0)
    const [error, setError] = useState(100)
    const [isWin, setIsWin] = useState(false)
    const [showFeedback, setShowFeedback] = useState(false)

    const level = LEVELS[levelIndex]

    // Initialize Level
    useEffect(() => {
        if (step === 'game') {
            setSlope(level.startSlope)
            setBias(level.startBias)
            setCurvature(level.startCurvature)
            setIsWin(false)
            setShowFeedback(false)
        }
    }, [levelIndex, step])

    // Calculate Error Loop
    useEffect(() => {
        let totalError = 0
        level.points.forEach(p => {
            const prediction = slope * p.x + bias + curvature * Math.pow(p.x - 30, 2)
            totalError += Math.abs(prediction - p.y)
        })
        const avgError = totalError / level.points.length
        setError(avgError)

        if (avgError < 5.0 && !isWin) { // Eased threshold for curve
            setIsWin(true)
            confetti({
                particleCount: 50,
                spread: 40,
                origin: { y: 0.7 },
                colors: ['#06b6d4', '#a855f7']
            })
            setTimeout(() => {
                setShowFeedback(true)
            }, 500)
        } else if (avgError >= 5.0 && isWin) {
            setIsWin(false)
        }
    }, [slope, bias, curvature, level])

    const handleNext = () => {
        setShowFeedback(false)
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
            <GameFeedback 
                isOpen={showFeedback}
                isSuccess={true}
                gifUrl={level.winGif}
                title="Pattern Matched!"
                description="You minimized the Loss."
                explanation={level.detailed}
                onNext={handleNext}
                nextLabel={levelIndex === LEVELS.length - 1 ? "See the Big Picture" : "Next Parameter"}
            />

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
                                <InteractiveGraph points={level.points} slope={slope} bias={bias} curvature={curvature} />
                            </div>

                            <div className="flex flex-col gap-6 p-6 bg-white/5 rounded-2xl border border-white/10">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-xs font-mono text-gray-400">TOTAL ERROR (LOSS)</span>
                                        <span className={`text-xl font-mono font-bold ${error < 5 ? 'text-green-400' : 'text-red-400'}`}>
                                            {error.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="h-4 bg-gray-900 rounded-full overflow-hidden border border-white/10">
                                        <motion.div
                                            initial={{ width: '100%' }}
                                            animate={{
                                                width: `${Math.min(error * 4, 100)}%`,
                                                backgroundColor: error < 5 ? '#4ade80' : '#ef4444'
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
                                            type="range" min="-2" max="2" step="0.1" value={slope}
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
                                            type="range" min="0" max="100" step="1" value={bias}
                                            onChange={(e) => setBias(parseFloat(e.target.value))}
                                            className="w-full accent-purple-500 bg-gray-800 h-2 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>

                                    <div className={level.lockedCurvature ? 'opacity-30 pointer-events-none grayscale' : ''}>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-sm font-bold text-yellow-400">Complexity (Non-Linearity)</label>
                                            <span className="font-mono">{curvature.toFixed(2)}</span>
                                        </div>
                                        <input
                                            type="range" min="-0.2" max="0.2" step="0.01" value={curvature}
                                            onChange={(e) => setCurvature(parseFloat(e.target.value))}
                                            className="w-full accent-yellow-500 bg-gray-800 h-2 rounded-lg appearance-none cursor-pointer"
                                        />
                                        {level.lockedCurvature && (
                                            <div className="text-xs text-red-400 mt-1">Locked (Need Deep Learning)</div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-auto pt-4">
                                    <Button
                                        onClick={handleNext} disabled={!isWin}
                                        className={`w-full ${isWin ? 'animate-pulse-glow' : 'opacity-50'}`}
                                    >
                                        {levelIndex === LEVELS.length - 1 ? 'Analyze Results' : 'Next Level'}
                                    </Button>
                                    {!isWin && levelIndex === 1 && error > 10 && (
                                        <div className="text-xs text-center mt-2 text-yellow-400/60 animate-pulse">
                                            Tip: Try bending the line with Complexity!
                                        </div>
                                    )}
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

