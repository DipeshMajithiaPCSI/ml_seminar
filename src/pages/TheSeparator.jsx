import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import Button from '../components/ui/Button'
import useGameStore from '../stores/gameStore'

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
        name: "The Containment",
        description: "Isolate the anomaly. The Red dots are the target; keep them INSIDE.",
        type: "CIRCLE",
        points: [
            { x: 50, y: 50, type: 'red' }, { x: 45, y: 55, type: 'red' }, { x: 55, y: 45, type: 'red' },
            { x: 20, y: 20, type: 'blue' }, { x: 80, y: 80, type: 'blue' }, { x: 20, y: 80, type: 'blue' }, { x: 80, y: 20, type: 'blue' }
        ]
    },
    {
        id: 3,
        name: "The Exclusion",
        description: "Sometimes the 'safe' zone is inside. Keep Blue INSIDE and Red OUTSIDE.",
        type: "CIRCLE_INVERT", // Same logic, just inverted win condition logic visually
        points: [
            { x: 50, y: 50, type: 'blue' }, { x: 45, y: 55, type: 'blue' }, { x: 55, y: 45, type: 'blue' },
            { x: 20, y: 20, type: 'red' }, { x: 80, y: 80, type: 'red' }, { x: 20, y: 80, type: 'red' }, { x: 80, y: 20, type: 'red' }
        ]
    }
]

// Helper to determine color based on position and current classifier
const predictPoint = (x, y, type, line, curve) => {
    if (type === 'LINE') {
        // Line eq: (y2-y1)x - (x2-x1)y + x2y1 - y2x1
        const val = (line.y2 - line.y1) * x - (line.x2 - line.x1) * y + line.x2 * line.y1 - line.y2 * line.x1
        return val > 0 ? 'red' : 'blue' // Arbitrary assignment, will be relative
    } else {
        // Circle
        const dist = Math.sqrt(Math.pow(x - curve.x, 2) + Math.pow(y - curve.y, 2))
        if (type === 'CIRCLE_INVERT') {
             return dist < curve.r ? 'blue' : 'red'
        }
        return dist < curve.r ? 'red' : 'blue'
    }
}

const ClassifierCanvas = ({ points, type, onWin }) => {
    const [line, setLine] = useState({ x1: 0, y1: 100, x2: 100, y2: 0 })
    const [curve, setCurve] = useState({ x: 50, y: 50, r: 25 })
    
    const canvasRef = useRef(null)

    // --- 1. Heatmap Visualization ---
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        const width = canvas.width
        const height = canvas.height
        
        // Clear
        ctx.clearRect(0, 0, width, height)
        
        // Low-res scan for performance (calculate every 4th pixel)
        const step = 4 
        for (let x = 0; x < width; x += step) {
            for (let y = 0; y < height; y += step) {
                // Map screen coords (px) to logic coords (0-100)
                const logicX = (x / width) * 100
                const logicY = (y / height) * 100
                
                const prediction = predictPoint(logicX, logicY, type, line, curve)
                
                ctx.fillStyle = prediction === 'red' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)'
                ctx.fillRect(x, y, step, step)
            }
        }
    }, [line, curve, type])


    // --- 2. Win Condition Logic ---
    useEffect(() => {
        let allCorrect = false

        if (type === 'LINE') {
            const checkSide = (p) => {
                return (line.y2 - line.y1) * p.x - (line.x2 - line.x1) * p.y + line.x2 * line.y1 - line.y2 * line.x1
            }
            const redSide = points.filter(p => p.type === 'red').map(checkSide).every(v => v > 0)
            const blueSide = points.filter(p => p.type === 'blue').map(checkSide).every(v => v < 0)
            const redSideInv = points.filter(p => p.type === 'red').map(checkSide).every(v => v < 0)
            const blueSideInv = points.filter(p => p.type === 'blue').map(checkSide).every(v => v > 0)

            if ((redSide && blueSide) || (redSideInv && blueSideInv)) allCorrect = true
        } else {
            // Circle & Circle Invert
            const checkInside = (p) => {
                const dist = Math.sqrt(Math.pow(p.x - curve.x, 2) + Math.pow(p.y - curve.y, 2))
                return dist < curve.r
            }

            if (type === 'CIRCLE') {
                // Red inside, Blue outside
                const redCorrect = points.filter(p => p.type === 'red').every(checkInside)
                const blueCorrect = points.filter(p => p.type === 'blue').every(p => !checkInside(p))
                if (redCorrect && blueCorrect) allCorrect = true
            } else if (type === 'CIRCLE_INVERT') {
                 // Blue inside, Red outside
                const blueCorrect = points.filter(p => p.type === 'blue').every(checkInside)
                const redCorrect = points.filter(p => p.type === 'red').every(p => !checkInside(p))
                if (redCorrect && blueCorrect) allCorrect = true
            }
        }

        onWin(allCorrect)
    }, [line, curve, points, type, onWin])


    // --- Drag Handlers (Simplified) ---
    const handleDragMove = (e, control) => {
         // Simple mouse tracking relative to SVG would go here
         // For now, let's rely on the sliders for precision as requested in plan, 
         // BUT implemented better Draggable SVG elements is better.
         // Let's stick to the previous simple implementation + Sliders for now to ensure robustness.
    }


    return (
        <div className="w-full h-96 bg-black/40 rounded-xl border border-white/10 relative overflow-hidden select-none group">
            
            {/* 1. Heatmap Layer */}
            <canvas 
                ref={canvasRef} 
                width={800} height={800} 
                className="absolute inset-0 w-full h-full opacity-50 pointer-events-none"
            />

            {/* 2. Interactive SVG Layer */}
            <svg viewBox="0 0 100 100" className="w-full h-full p-4 relative z-10" preserveAspectRatio="none">
                 {/* Grid */}
                <defs>
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />

                {/* Classifier Shape */}
                {type === 'LINE' ? (
                    <line
                        x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                        stroke="white" strokeWidth="1.5" strokeDasharray="5 5"
                    />
                ) : (
                    <circle
                        cx={curve.x} cy={curve.y} r={curve.r}
                        fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="5 5"
                    />
                )}

                {/* Points */}
                {points.map((p, i) => (
                     <circle
                        key={i} cx={p.x} cy={p.y} r="3"
                        fill={p.type === 'red' ? '#ef4444' : '#3b82f6'}
                        stroke="white" strokeWidth="1.5"
                        className="transition-all duration-300"
                    />
                ))}
            </svg>

            {/* 3. Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-3 p-4 bg-black/80 backdrop-blur rounded-lg border border-white/10 w-48 transition-opacity opacity-80 hover:opacity-100">
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Adjust Model</span>
                
                {type === 'LINE' ? (
                    <>
                        <div className='flex flex-col gap-1'>
                            <label className="text-[10px] text-cyan-400">Point A</label>
                            <input type="range" min="0" max="100" value={line.x1} onChange={(e) => setLine({ ...line, x1: parseInt(e.target.value) })} className="accent-cyan-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                            <input type="range" min="0" max="100" value={line.y1} onChange={(e) => setLine({ ...line, y1: parseInt(e.target.value) })} className="accent-cyan-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                        </div>
                        <div className='flex flex-col gap-1 mt-2'>
                            <label className="text-[10px] text-purple-400">Point B</label>
                            <input type="range" min="0" max="100" value={line.x2} onChange={(e) => setLine({ ...line, x2: parseInt(e.target.value) })} className="accent-purple-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                            <input type="range" min="0" max="100" value={line.y2} onChange={(e) => setLine({ ...line, y2: parseInt(e.target.value) })} className="accent-purple-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                        </div>
                    </>
                ) : (
                    <>
                         <div className='flex flex-col gap-1'>
                            <label className="text-[10px] text-cyan-400">Position X / Y</label>
                            <input type="range" min="0" max="100" value={curve.x} onChange={(e) => setCurve({ ...curve, x: parseInt(e.target.value) })} className="accent-cyan-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                            <input type="range" min="0" max="100" value={curve.y} onChange={(e) => setCurve({ ...curve, y: parseInt(e.target.value) })} className="accent-cyan-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                        </div>
                        <div className='flex flex-col gap-1 mt-2'>
                            <label className="text-[10px] text-white/60">Radius</label>
                            <input type="range" min="5" max="60" value={curve.r} onChange={(e) => setCurve({ ...curve, r: parseInt(e.target.value) })} className="accent-white h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                        </div>
                    </>
                )}
            </div>

            {/* Instruction */}
            <div className="absolute bottom-4 left-4 right-4 text-center pointer-events-none">
                 <span className="inline-block px-3 py-1 rounded-full bg-black/60 backdrop-blur border border-white/10 text-[10px] text-white/50 tracking-widest font-mono">
                    ADJUST PARAMETERS TO SEPARATE DATA
                 </span>
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
                            className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-center"
                        >
                            <div className="lg:col-span-2 space-y-6">
                                <motion.div 
                                    key={level.id}
                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                    className="border-b border-white/10 pb-4"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-bold tracking-wider text-cyan-300">
                                            LEVEL 0{level.id}
                                        </div>
                                        <div className="text-xs font-mono text-gray-500">CLASSIFICATION TASK</div>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{level.name}</h1>
                                    <p className="text-gray-400 mt-2 max-w-xl">{level.description}</p>
                                </motion.div>

                                <ClassifierCanvas points={level.points} type={level.type} onWin={setIsWin} />
                            </div>

                            <div className="flex flex-col justify-center gap-6 p-8 bg-white/5 rounded-2xl border border-white/10 min-h-[300px]">
                                <div>
                                    <h3 className="text-gray-400 font-mono text-xs tracking-widest mb-4">SYSTEM STATUS</h3>
                                    
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className={`w-3 h-3 rounded-full ${isWin ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]'} transition-all`} />
                                        <span className={`text-2xl font-bold ${isWin ? 'text-white' : 'text-white/40'} transition-colors`}>
                                            {isWin ? "OPTIMIZED" : "TRAINING..."}
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-3 rounded bg-black/20 text-xs text-gray-400 border border-white/5">
                                            <span className="block text-[10px] text-gray-600 uppercase mb-1">Objective</span>
                                            Separate the <span className="text-red-400 font-bold">RED</span> and <span className="text-blue-400 font-bold">BLUE</span> data points using the decision boundary.
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleNext}
                                    disabled={!isWin}
                                    className={`w-full mt-auto py-4 text-base ${isWin ? 'animate-pulse-glow' : 'opacity-30'}`}
                                >
                                    {levelIndex === LEVELS.length - 1 ? "FINALIZE MODEL" : "NEXT DATASET"}
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="reveal"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="text-center max-w-4xl"
                        >
                            <h1 className="text-6xl md:text-7xl font-bold mb-8 tracking-tighter">
                                DECISION <br/>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">BOUNDARY</span>
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-400 mb-12 font-light max-w-2xl mx-auto leading-relaxed">
                                You just manually performed what a single <b>Neuron</b> does: drawing a line (or circle) to categorize reality.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 text-left">
                                <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                    <h3 className="text-xl font-bold text-white mb-3">The "Hidden" Space</h3>
                                    <p className="text-gray-400 leading-relaxed">
                                        When a straight line isn't enough (like an XOR problem), AI folds the space itself using "Hidden Layers" until a straight line *can* cut through.
                                    </p>
                                </div>
                                <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                    <h3 className="text-xl font-bold text-white mb-3">Classification</h3>
                                    <p className="text-gray-400 leading-relaxed">
                                        This simple mechanic is the root of almost all AI. Is this pixel a cat? Is this transaction fraud? It's all just high-dimensional geometry.
                                    </p>
                                </div>
                            </div>

                            <Button onClick={() => navigate('/')} size="xl" className="tracking-widest">
                                RETURN TO TERMINAL
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </PageWrapper>
    )
}

export default TheSeparator
