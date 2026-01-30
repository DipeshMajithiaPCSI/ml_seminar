import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import PageWrapper from '../components/layout/PageWrapper'
import Button from '../components/ui/Button'
import useGameStore from '../stores/gameStore'
import GameFeedback from '../components/ui/GameFeedback'

const LEVELS = [
    {
        id: 1,
        name: "Weight (The Doubler)",
        training: [{ x: 10, y: 20 }, { x: 5, y: 10 }, { x: 50, y: 100 }],
        test: { x: 25, target: 50 },
        rule: "y = 2x",
        fn: (x) => 2 * x,
        domain: [0, 60],
        concept: "WEIGHT",
        detailed: "In Machine Learning, a 'Weight' determines the importance of an input. Here, the input is multiplied by 2, scaling its value linearly.",
        winGif: "https://media.giphy.com/media/26u4lOMA8JKSnL9Uk/giphy.gif" // Smart guy
    },
    {
        id: 2,
        name: "Bias (The Offset)",
        training: [{ x: 10, y: 20 }, { x: 20, y: 30 }, { x: 100, y: 110 }],
        test: { x: 50, target: 60 },
        rule: "y = x + 10",
        fn: (x) => x + 10,
        domain: [0, 110],
        concept: "BIAS",
        detailed: "A 'Bias' allows models to shift their activation positive or negative. It ensures that even if the input is 0, the neuron can still fire (output 10).",
        winGif: "https://media.giphy.com/media/dIaM6m6MjY1dS/giphy.gif" // Math
    },
    {
        id: 3,
        name: "Linearity (The Combo)",
        training: [{ x: 2, y: 5 }, { x: 4, y: 9 }, { x: 10, y: 21 }],
        test: { x: 5, target: 11 },
        rule: "y = 2x + 1",
        fn: (x) => 2 * x + 1,
        domain: [0, 15],
        concept: "LINEAR REGRESSION",
        detailed: "Combining Weight (slope) and Bias (intercept) creates a line. This is the fundamental equation of Linear Regression and a single artificial neuron: y = wx + b.",
        winGif: "https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif" // Calculation
    },
    {
        id: 4,
        name: "Non-Linearity (The Curve)",
        training: [{ x: 2, y: 4 }, { x: 3, y: 9 }, { x: 10, y: 100 }],
        test: { x: 5, target: 25 },
        rule: "y = x²",
        fn: (x) => x * x,
        domain: [0, 12],
        concept: "ACTIVATION FUNCTION",
        detailed: "Real-world data is messy and curved. Deep Learning uses 'Non-linear' functions (like ReLU or Sigmoid) to bend the lines and fit complex patterns.",
        winGif: "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif" // Mind blown
    }
]

// Smooth Function Graph Component
const MiniGraph = ({ fn, domain, data, rule, type }) => {
    const [minX, maxX] = domain
    const maxY = fn(maxX)

    const width = 100
    const height = 100

    const scaleX = (x) => (x / maxX) * width
    const scaleY = (y) => height - (y / maxY) * height

    const pathPoints = []
    const steps = 40
    for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * maxX
        const y = fn(x)
        pathPoints.push(`${scaleX(x)},${scaleY(y)}`)
    }
    const pathD = `M ${pathPoints.join(' L ')}`

    return (
        <div className="w-full h-48 bg-black/40 rounded-xl border border-white/10 relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
            <svg viewBox="0 0 100 100" className="w-full h-full p-4">
                <line x1="0" y1="100" x2="100" y2="100" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
                <line x1="0" y1="0" x2="0" y2="100" stroke="white" strokeOpacity="0.2" strokeWidth="1" />

                <path
                    d={pathD}
                    fill="none"
                    stroke={type === 'ACTIVATION FUNCTION' ? '#a855f7' : '#06b6d4'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                />

                {data.map((p, i) => (
                    <circle
                        key={i}
                        cx={scaleX(p.x)}
                        cy={scaleY(p.y)}
                        r="3"
                        className="fill-white stroke-black stroke-1 hover:r-4 transition-all"
                    />
                ))}
            </svg>
            <div className="absolute top-3 right-3 text-xs font-mono font-bold text-cyan-200 bg-cyan-900/40 px-3 py-1 rounded-full border border-cyan-500/20">
                {rule}
            </div>
        </div>
    )
}

const PatternPredictor = () => {
    const navigate = useNavigate()
    const { completeExperiment, setScore } = useGameStore()

    const [levelIndex, setLevelIndex] = useState(0)
    const [step, setStep] = useState('intro')
    const [dataIndex, setDataIndex] = useState(0)
    const [userGuess, setUserGuess] = useState('')
    const [errorStatus, setErrorStatus] = useState(null)
    const inputRef = useRef(null)
    const [showFeedback, setShowFeedback] = useState(false)

    const currentLevel = LEVELS[levelIndex]
    const isFinalLevel = levelIndex === LEVELS.length - 1

    useEffect(() => {
        if (step === 'testing' && inputRef.current) {
            inputRef.current.focus()
        }
    }, [step])

    const handleStartLevel = () => {
        setStep('training')
        setDataIndex(0)
        setErrorStatus(null)
        setUserGuess('')
        setShowFeedback(false)

        let current = 0
        const interval = setInterval(() => {
            current++
            if (current <= currentLevel.training.length) {
                setDataIndex(current)
            } else {
                clearInterval(interval)
                setTimeout(() => setStep('testing'), 800)
            }
        }, 1200)
    }

    const handleNextLevel = () => {
        setShowFeedback(false)
        if (levelIndex < LEVELS.length - 1) {
            setLevelIndex(prev => prev + 1)
            setStep('intro')
        } else {
            setStep('grand_reveal')
            completeExperiment('pattern-predictor')
            setScore('pattern-predictor', 100)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const guess = parseInt(userGuess)
        if (isNaN(guess)) return

        if (guess === currentLevel.test.target) {
            setErrorStatus('correct')
            confetti({
                particleCount: 80,
                spread: 60,
                origin: { y: 0.7 },
                colors: ['#06b6d4', '#a855f7']
            })
            setTimeout(() => {
                setShowFeedback(true)
            }, 1000)
        } else {
            setErrorStatus('wrong')
        }
    }

    return (
        <PageWrapper>
            <div className="min-h-screen flex flex-col items-center justify-center p-6 relative z-10">

                <GameFeedback 
                    isOpen={showFeedback}
                    isSuccess={true}
                    gifUrl={currentLevel.winGif}
                    title="Pattern Decoded!"
                    description={`You found the rule: ${currentLevel.rule}`}
                    explanation={currentLevel.detailed}
                    onNext={handleNextLevel}
                    nextLabel={isFinalLevel ? "Finish Experiment" : "Next Challenge"}
                />

                {/* Header - Hidden during Reveal */}
                {step !== 'grand_reveal' && (
                    <div className="absolute top-8 left-0 w-full px-8 flex justify-between items-center text-white/40">
                        <span className="text-xs font-mono tracking-widest text-cyan-400">
                            EXP_01 // PATTERN_RECOGNITION
                        </span>
                        <span className="text-xs font-mono">
                            LEVEL {levelIndex + 1}/{LEVELS.length}
                        </span>
                    </div>
                )}

                <div className="max-w-6xl w-full">
                    <AnimatePresence mode="wait">

                        {/* --- PHASE 1: INTRO --- */}
                        {step === 'intro' && (
                            <motion.div
                                key={`intro-${levelIndex}`}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="text-center max-w-lg mx-auto"
                            >
                                <div className="mb-8">
                                    {/* Intro Logic: First level cat, others use previous win GIF for continuity */}
                                    <img
                                        src={levelIndex === 0 ? "https://media.giphy.com/media/unQ3IJU2RG7XMjJKqj/giphy.gif" : LEVELS[levelIndex - 1].winGif}
                                        className="w-48 h-48 object-cover rounded-2xl mx-auto opacity-80 border-2 border-white/10"
                                    />
                                </div>
                                <h1 className="text-5xl md:text-6xl font-bold mb-4">
                                    Level 0{levelIndex + 1}
                                </h1>
                                <p className="text-2xl text-cyan-400 font-light mb-12">
                                    {currentLevel.name}
                                </p>
                                <Button onClick={handleStartLevel} size="lg">
                                    Initialize Sequence
                                </Button>
                            </motion.div>
                        )}

                        {/* --- PHASE 2: GAME --- */}
                        {(step === 'training' || step === 'testing') && (
                            <motion.div
                                key={`game-${levelIndex}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid gap-8 max-w-xl mx-auto"
                            >
                                {/* Training Data Stream */}
                                <div className="space-y-4">
                                    {currentLevel.training.map((data, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -50 }}
                                            animate={{
                                                opacity: idx < dataIndex ? 1 : 0,
                                                x: idx < dataIndex ? 0 : -50
                                            }}
                                            className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5"
                                        >
                                            <div className="flex gap-4"><span className="text-cyan-500 font-mono">IN</span> <span className="text-xl font-bold">{data.x}</span></div>
                                            <div className="w-full h-[1px] bg-white/5 mx-4" />
                                            <div className="flex gap-4"><span className="text-xl font-bold">{data.y}</span> <span className="text-purple-500 font-mono">OUT</span></div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Input Area */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: step === 'testing' ? 1 : 0 }}
                                    className="mt-8 p-8 rounded-2xl bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border border-white/10 flex items-center justify-between"
                                >
                                    <div className="text-center">
                                        <div className="text-xs text-cyan-400 font-mono mb-2">INPUT</div>
                                        <div className="text-5xl font-bold">{currentLevel.test.x}</div>
                                    </div>

                                    <div className="text-2xl text-white/20">➔</div>

                                    <div className="flex flex-col items-end">
                                        <div className="text-xs text-purple-400 font-mono mb-2">PREDICT</div>
                                        <form onSubmit={handleSubmit} className="flex gap-3">
                                            <input
                                                ref={inputRef}
                                                type="number"
                                                value={userGuess}
                                                onChange={(e) => {
                                                    setUserGuess(e.target.value)
                                                    setErrorStatus(null)
                                                }}
                                                className={`w-32 bg-black/50 border-2 rounded-xl px-4 py-3 text-4xl font-bold text-right text-white focus:outline-none transition-all
                          ${errorStatus === 'wrong' ? 'border-red-500 shake' : 'border-white/20 focus:border-cyan-500'}
                          ${errorStatus === 'correct' ? 'border-green-500 text-green-400' : ''}
                        `}
                                            />
                                            <Button size="icon" type="submit" disabled={!userGuess} className='p-4'>↵</Button>
                                        </form>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}


                        {/* --- PHASE 4: THE GRAND REVEAL --- */}
                        {step === 'grand_reveal' && (
                            <motion.div
                                key="reveal"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="max-w-7xl mx-auto w-full"
                            >
                                <div className="text-center mb-16">
                                    <motion.h1
                                        initial={{ y: 20 }} animate={{ y: 0 }}
                                        className="text-5xl md:text-7xl font-bold mb-6"
                                    >
                                        You trained a <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">ML Model</span>.
                                    </motion.h1>
                                    <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
                                        Machine learning isn't magic. It's just finding the best line to fit the data points.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
                                    {LEVELS.map((lvl, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.15 + 0.3 }}
                                            className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-cyan-500/50 transition-all hover:bg-white/[0.07] flex flex-col h-full"
                                        >
                                            <div className="flex justify-between items-center mb-6">
                                                <span className="text-sm font-mono text-cyan-400 tracking-widest uppercase">
                                                    Level 0{i + 1}: {lvl.concept}
                                                </span>
                                            </div>

                                            {/* Bigger Graph Container */}
                                            <div className="mb-8 w-full">
                                                <MiniGraph
                                                    fn={lvl.fn}
                                                    domain={lvl.domain}
                                                    data={[...lvl.training, lvl.test]}
                                                    rule={lvl.rule}
                                                    type={lvl.concept}
                                                />
                                            </div>

                                            <div className="mt-auto">
                                                <h3 className="text-2xl font-bold text-white mb-3">{lvl.name}</h3>
                                                <p className="text-base text-gray-300 leading-relaxed">
                                                    {lvl.detailed}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.5 }}
                                    className="mt-20 text-center pb-12"
                                >
                                    <div className="inline-block p-8 rounded-2xl bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border border-white/10 backdrop-blur-sm mb-12 max-w-2xl">
                                        <p className="text-2xl text-white font-light italic">
                                            "Prediction is just finding the function that fits the points."
                                        </p>
                                    </div>
                                    <br />
                                    <Button onClick={() => navigate('/experiment/2')} size="xl" className="shadow-2xl shadow-cyan-500/20">
                                        Start Experiment 02: Fix The Error →
                                    </Button>
                                </motion.div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
        </PageWrapper>
    )
}

export default PatternPredictor
