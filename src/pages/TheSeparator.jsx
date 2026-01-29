import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import Button from '../components/ui/Button'
import useGameStore from '../stores/gameStore'
import confetti from 'canvas-confetti'

const LEVELS = [
    {
        id: 1,
        name: "Linear Separation",
        description: "Draw a straight line to separate the Blue dots from the Red dots.",
        type: "LINE",
        points: [
            { x: 20, y: 80, type: 'red' }, { x: 30, y: 90, type: 'red' }, { x: 10, y: 70, type: 'red' },
            { x: 80, y: 20, type: 'blue' }, { x: 70, y: 30, type: 'blue' }, { x: 90, y: 10, type: 'blue' }
        ]
    },
    {
        id: 2,
        name: "The XOR Problem",
        description: "A single straight line cannot separate these. You need a curve (Non-Linearity).",
        type: "CURVE",
        points: [
            { x: 20, y: 20, type: 'red' }, { x: 80, y: 80, type: 'red' },
            { x: 20, y: 80, type: 'blue' }, { x: 80, y: 20, type: 'blue' }
        ]
    },
    {
        id: 3,
        name: "The Cluster",
        description: "Encircle the anomaly. This is how models detect fraud or cancer cells.",
        type: "CIRCLE",
        points: [
            { x: 50, y: 50, type: 'red' }, { x: 45, y: 55, type: 'red' }, { x: 55, y: 45, type: 'red' },
            { x: 20, y: 20, type: 'blue' }, { x: 80, y: 80, type: 'blue' }, { x: 20, y: 80, type: 'blue' }, { x: 80, y: 20, type: 'blue' }
        ]
    }
]

// Draggable Classification Component
const ClassifierCanvas = ({ points, type, onWin }) => {
    const [line, setLine] = useState({ x1: 0, y1: 100, x2: 100, y2: 0 }) // For Line
    const [curve, setCurve] = useState({ x: 50, y: 50, r: 30 }) // For Circle/Curve

    // Checking logic (simplified collision detection)
    useEffect(() => {
        let allCorrect = false

        if (type === 'LINE') {
            // Check if all reds are on one side and blues on the other
            // Line eq: (y2-y1)x - (x2-x1)y + x2y1 - y2x1 = 0
            const checkSide = (p) => {
                return (line.y2 - line.y1) * p.x - (line.x2 - line.x1) * p.y + line.x2 * line.y1 - line.y2 * line.x1
            }

            const redSide = points.filter(p => p.type === 'red').map(checkSide).every(v => v > 0)
            const blueSide = points.filter(p => p.type === 'blue').map(checkSide).every(v => v < 0)
            const redSideinv = points.filter(p => p.type === 'red').map(checkSide).every(v => v < 0)
            const blueSideinv = points.filter(p => p.type === 'blue').map(checkSide).every(v => v > 0)

            if ((redSide && blueSide) || (redSideinv && blueSideinv)) allCorrect = true
        } else if (type === 'CURVE' || type === 'CIRCLE') {
            // Check Distance from center (Circle Logic for simplicity in prototype)
            const checkInside = (p) => {
                const dist = Math.sqrt(Math.pow(p.x - curve.x, 2) + Math.pow(p.y - curve.y, 2))
                return dist < curve.r
            }

            const redInside = points.filter(p => p.type === 'red').every(checkInside)
            const blueOutside = points.filter(p => p.type === 'blue').every(p => !checkInside(p))

            if (redInside && blueOutside) allCorrect = true
        }

        if (allCorrect) onWin(true)
        else onWin(false)

    }, [line, curve, points, type])

    return (
        <div className="w-full h-96 bg-black/40 rounded-xl border border-white/10 relative overflow-hidden select-none">
            <svg viewBox="0 0 100 100" className="w-full h-full p-4" preserveAspectRatio="none">
                {/* Background Grid */}
                <defs>
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />

                {/* The Classifier Boundary (Draggable) */}
                {type === 'LINE' ? (
                    <line
                        x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                        stroke="white" strokeWidth="1" strokeDasharray="5 5"
                        className="cursor-move"
                    />
                ) : (
                    <circle
                        cx={curve.x} cy={curve.y} r={curve.r}
                        fill="rgba(255,255,255,0.1)" stroke="white" strokeWidth="1" strokeDasharray="5 5"
                        className="cursor-move"
                    />
                )}

                {/* Draggable Handles */}
                {type === 'LINE' ? (
                    <>
                        <circle cx={line.x1} cy={line.y1} r="5" fill="#06b6d4" className="cursor-pointer hover:r-6 transition-all" />
                        <circle cx={line.x2} cy={line.y2} r="5" fill="#a855f7" className="cursor-pointer hover:r-6 transition-all" />
                    </>
                ) : (
                    <circle cx={curve.x} cy={curve.y} r={curve.r} fill="transparent" stroke="cyan" strokeWidth="2" className="cursor-move" />
                )}

                {/* Data Points */}
                {points.map((p, i) => (
                    <circle
                        key={i} cx={p.x} cy={p.y} r="4"
                        fill={p.type === 'red' ? '#ef4444' : '#3b82f6'}
                        stroke="white" strokeWidth="1"
                        className="drop-shadow-lg"
                    />
                ))}
            </svg>

            {/* Instruction Overlay */}
            <div className="absolute bottom-4 left-4 text-xs font-mono text-gray-500 bg-black/50 p-2 rounded">
                {type === 'LINE' ? "DRAG ENDPOINTS TO MOVE LINE" : "DRAG CIRCLE TO RESIZE/MOVE"}
            </div>

            {/* Sliders for manual control if drag is hard */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 w-32">
                {type === 'LINE' ? (
                    <>
                        <input type="range" min="0" max="100" value={line.x1} onChange={(e) => setLine({ ...line, x1: parseInt(e.target.value) })} className="h-1 accent-cyan-500" />
                        <input type="range" min="0" max="100" value={line.y1} onChange={(e) => setLine({ ...line, y1: parseInt(e.target.value) })} className="h-1 accent-cyan-500" />
                        <input type="range" min="0" max="100" value={line.x2} onChange={(e) => setLine({ ...line, x2: parseInt(e.target.value) })} className="h-1 accent-purple-500" />
                        <input type="range" min="0" max="100" value={line.y2} onChange={(e) => setLine({ ...line, y2: parseInt(e.target.value) })} className="h-1 accent-purple-500" />
                    </>
                ) : (
                    <>
                        <input type="range" min="0" max="100" value={curve.x} onChange={(e) => setCurve({ ...curve, x: parseInt(e.target.value) })} className="h-1 accent-cyan-500" />
                        <input type="range" min="0" max="100" value={curve.y} onChange={(e) => setCurve({ ...curve, y: parseInt(e.target.value) })} className="h-1 accent-cyan-500" />
                        <input type="range" min="5" max="50" value={curve.r} onChange={(e) => setCurve({ ...curve, r: parseInt(e.target.value) })} className="h-1 accent-white" />
                    </>
                )}
            </div>
        </div>
    )
}

const TheSeparator = () => {
    const navigate = useNavigate()
    const { completeExperiment, setScore } = useGameStore()

    const [levelIndex, setLevelIndex] = useState(0)
    const [step, setStep] = useState('game')
    const [isWin, setIsWin] = useState(false)

    const level = LEVELS[levelIndex]

    // Reset when level changes
    useEffect(() => {
        setIsWin(false)
    }, [levelIndex])

    const handleNext = () => {
        if (levelIndex < LEVELS.length - 1) {
            setLevelIndex(prev => prev + 1)
        } else {
            setStep('reveal')
            completeExperiment('the-separator')
            setScore('the-separator', 100)
        }
    }

    return (
        <PageWrapper>
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-white max-w-6xl mx-auto">
                <AnimatePresence mode="wait">
                    {step === 'game' ? (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8"
                        >
                            <div className="lg:col-span-2 space-y-6">
                                <div className="border-b border-white/10 pb-4">
                                    <div className="text-xs font-mono text-cyan-400 mb-1">EXP_03 // CLASSIFICATION</div>
                                    <h1 className="text-4xl font-bold">{level.name}</h1>
                                    <p className="text-gray-400 mt-2">{level.description}</p>
                                </div>

                                <ClassifierCanvas points={level.points} type={level.type} onWin={setIsWin} />
                            </div>

                            <div className="flex flex-col justify-center gap-6 p-6 bg-white/5 rounded-2xl border border-white/10">
                                <div>
                                    <h3 className="text-gray-400 font-mono text-sm mb-2">STATUS</h3>
                                    <div className={`text-3xl font-bold ${isWin ? 'text-green-400' : 'text-red-400'} transition-colors`}>
                                        {isWin ? "SEPARATED" : "MIXED"}
                                    </div>

                                    <div className="mt-4 text-sm text-gray-500">
                                        Tasks:
                                        <ul className="list-disc pl-5 mt-2 space-y-1">
                                            <li>Keep RED dots inside/one side</li>
                                            <li>Keep BLUE dots outside/other side</li>
                                        </ul>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleNext}
                                    disabled={!isWin}
                                    className={`w-full mt-auto ${isWin ? 'animate-pulse-glow' : 'opacity-50'}`}
                                >
                                    {levelIndex === LEVELS.length - 1 ? "Unlock Neural Network" : "Next Challenge"}
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="reveal"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="text-center max-w-4xl"
                        >
                            <h1 className="text-6xl font-bold mb-6">
                                You just built a <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-blue-500">Classifier</span>.
                            </h1>
                            <p className="text-xl text-gray-400 mb-12">
                                Drawing lines to separate data is how AI makes decisions (Spam vs Not Spam, Cat vs Dog, Cancer vs Benign).
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 text-left">
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                    <h3 className="text-xl font-bold text-cyan-400 mb-2">Linear vs Non-Linear</h3>
                                    <p className="text-gray-400">
                                        Simple problems can be solved with a straight line. Complex ones (like the XOR problem or the Circle) require "Non-Linearity" - curving the decision boundary.
                                    </p>
                                </div>
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                    <h3 className="text-xl font-bold text-purple-400 mb-2">Hidden Layers</h3>
                                    <p className="text-gray-400">
                                        In deep learning, "hidden layers" are basically folding space so that a straight line *can* cut through complex data.
                                    </p>
                                </div>
                            </div>

                            <Button onClick={() => navigate('/')} size="xl" className="shadow-2xl shadow-cyan-500/20">
                                Return to Base (More Experiments Coming Soon)
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </PageWrapper>
    )
}

export default TheSeparator
