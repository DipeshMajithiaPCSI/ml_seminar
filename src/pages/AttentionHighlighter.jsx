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
        text: "The animal didn't cross the street because it was too tired.",
        words: ["The", "animal", "didn't", "cross", "the", "street", "because", "it", "was", "too", "tired."],
        sourceIndex: 7, // it
        correctTargetIndex: 1, // animal
        distractors: [5, 10], // street, tired
        explanation: "Great job! By giving more weight to 'Animal', the model understands that 'Tired' usually applies to living things, not streets.",
        winGif: "https://media.tenor.com/bNVdnCOu_kYAAAAM/happy-dance.gif"
    },
    {
        id: 2,
        text: "The animal didn't cross the street because it was too wide.",
        words: ["The", "animal", "didn't", "cross", "the", "street", "because", "it", "was", "too", "wide."],
        sourceIndex: 7, // it
        correctTargetIndex: 5, // street
        distractors: [1, 10], // animal, wide
        explanation: "Correct! 'Wide' connects better to 'Street' than 'Animal'. You just trained the model to understand context!",
        winGif: "https://media.tenor.com/8ST06-zWW9YAAAAM/dancing-so.gif"
    },
    {
        id: 3,
        text: "The trophy didn't fit in the suitcase because it was too big.",
        words: ["The", "trophy", "didn't", "fit", "in", "the", "suitcase", "because", "it", "was", "too", "big."],
        sourceIndex: 8, // it
        correctTargetIndex: 1, // trophy
        distractors: [6, 11], // suitcase, big
        explanation: "Exactly! If it didn't fit, the 'object' (Trophy) must be the big thing.",
        winGif: "https://media.tenor.com/Cw_mf8ScHLcAAAA1/funny.webp"
    }
]

const AttentionHighlighter = () => {
    const navigate = useNavigate()
    const { completeExperiment, setScore } = useGameStore()

    const [levelIndex, setLevelIndex] = useState(0)
    const [step, setStep] = useState('intro') // 'intro' | 'train' | 'success' | 'fail' | 'explanation'
    const [weights, setWeights] = useState({}) // { wordIndex: 0-100 }
    const [showFeedback, setShowFeedback] = useState(false)
    const [wordRefs, setWordRefs] = useState({})

    // For drawing lines
    const containerRef = useRef(null)
    const [lines, setLines] = useState([]) // Array of calculated SVG paths

    const level = LEVELS[levelIndex]

    // Reset weights on level change
    useEffect(() => {
        setStep('intro')
        const initialWeights = {}
        // Initialize distractors and correct target with random or zero weights
        level.words.forEach((_, i) => {
            if (i === level.correctTargetIndex || level.distractors.includes(i)) {
                initialWeights[i] = 30 // Start with equal low weights
            }
        })
        setWeights(initialWeights)
        setShowFeedback(false)
    }, [levelIndex])

    // Update lines based on weights
    useEffect(() => {
        if (!containerRef.current) return

        const newLines = []
        const containerRect = containerRef.current.getBoundingClientRect()
        const sourceEl = wordRefs[level.sourceIndex]

        if (!sourceEl) return

        const sourceRect = sourceEl.getBoundingClientRect()
        const x1 = sourceRect.left + sourceRect.width / 2 - containerRect.left
        const y1 = sourceRect.top + sourceRect.height / 2 - containerRect.top

        Object.keys(weights).forEach(targetIdx => {
            const targetEl = wordRefs[targetIdx]
            if (targetEl) {
                const targetRect = targetEl.getBoundingClientRect()
                const x2 = targetRect.left + targetRect.width / 2 - containerRect.left
                const y2 = targetRect.top + targetRect.height / 2 - containerRect.top

                // Curve logic
                const cx = (x1 + x2) / 2
                const cy = Math.min(y1, y2) - 50 - (weights[targetIdx] || 0) // Curve goes higher with weight? Or stay fixed?

                newLines.push({
                    path: `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`,
                    weight: weights[targetIdx],
                    color: weights[targetIdx] > 50 ? '#22d3ee' : '#94a3b8' // Cyan if high, Gray if low
                })
            }
        })
        setLines(newLines)
    }, [weights, wordRefs, levelIndex])

    const handleWeightChange = (index, val) => {
        setWeights(prev => ({ ...prev, [index]: parseInt(val) }))
    }

    const handleRunTraining = () => {
        // Check if correct index has the HIGHEST weight
        const correctWeight = weights[level.correctTargetIndex] || 0
        let maxWeight = 0
        let maxIndex = -1

        Object.keys(weights).forEach(key => {
            if (weights[key] > maxWeight) {
                maxWeight = weights[key]
                maxIndex = parseInt(key)
            }
        })

        if (maxIndex === level.correctTargetIndex && correctWeight > 50) {
            setStep('success')
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            })
            setTimeout(() => {
                setShowFeedback(true)
            }, 1000)
        } else {
            console.log("Fail: Max", maxIndex, "Correct", level.correctTargetIndex)
            setStep('fail')
            setTimeout(() => setStep('train'), 2000)
        }
    }

    const handleNext = () => {
        setShowFeedback(false)
        if (levelIndex < LEVELS.length - 1) {
            setLevelIndex(prev => prev + 1)
        } else {
            setStep('explanation')
        }
    }

    const handleFinish = () => {
        completeExperiment('attention')
        setScore('attention', 100)
        navigate('/experiment/6')
    }

    const registerRef = (index, el) => {
        if (el) {
            wordRefs[index] = el
        }
    }

    return (
        <PageWrapper>
            <GameFeedback
                isOpen={showFeedback}
                isSuccess={true}
                gifUrl={level.winGif}
                title="Weights Optimized!"
                description="The model now knows where to look."
                explanation={level.explanation}
                onNext={handleNext}
                nextLabel={levelIndex < LEVELS.length - 1 ? "Next Training Set" : "See How It Works"}
            />

            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-white max-w-6xl mx-auto">
                <div className="absolute top-8 left-8">
                    <div className="text-xs font-mono text-cyan-400 mb-1">EXP_05 // TRAINER_MODE</div>
                    <h1 className="text-3xl font-bold">Attention Trainer</h1>
                </div>

                <AnimatePresence mode="wait">
                    {step !== 'explanation' ? (
                        <motion.div
                            key="game"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="max-w-4xl w-full text-center relative"
                        >
                            <h2 className="text-2xl mb-8 text-gray-300">
                                Train the model to understand: <br /> Where should <span className="text-yellow-400 font-bold">"it"</span> look?
                            </h2>

                            {step === 'intro' && (
                                <motion.div className="mb-8">
                                    <Button onClick={() => setStep('train')} className="animate-pulse">Start Training Iteration</Button>
                                </motion.div>
                            )}

                            <div
                                ref={containerRef}
                                className="relative bg-white/5 border border-white/10 p-12 rounded-3xl flex flex-wrap justify-center gap-x-4 gap-y-20 leading-loose z-10 min-h-[400px]"
                            >
                                {/* SVG Overlay */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                                    {lines.map((line, i) => (
                                        <motion.path
                                            key={i}
                                            d={line.path}
                                            fill="none"
                                            stroke={line.color}
                                            strokeWidth={Math.max(2, line.weight / 10)} // Dynamic width
                                            strokeOpacity={Math.max(0.2, line.weight / 100)}
                                            strokeLinecap="round"
                                            animate={{ d: line.path }}
                                        />
                                    ))}
                                </svg>

                                {level.words.map((word, i) => {
                                    const isSource = i === level.sourceIndex
                                    const isTarget = weights[i] !== undefined

                                    return (
                                        <div key={i} className="relative flex flex-col items-center group">
                                            <span
                                                ref={(el) => registerRef(i, el)}
                                                className={`
                                                    relative px-4 py-2 rounded-xl text-3xl md:text-5xl font-serif transition-all duration-200 select-none z-10
                                                    ${isSource ? 'border-b-4 border-yellow-400 text-yellow-100 font-bold' : ''}
                                                    ${isTarget ? 'text-white' : 'opacity-50'}
                                                `}
                                            >
                                                {word}
                                            </span>

                                            {/* Sliders for Targets */}
                                            {isTarget && step === 'train' && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="absolute top-16 w-32 bg-black/80 p-2 rounded-lg border border-white/20 z-20"
                                                >
                                                    <div className="text-xs text-gray-400 mb-1">Attention Weight</div>
                                                    <input
                                                        type="range" min="0" max="100"
                                                        value={weights[i]}
                                                        onChange={(e) => handleWeightChange(i, e.target.value)}
                                                        className="w-full accent-cyan-400 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                                    />
                                                    <div className="text-right text-cyan-400 font-mono text-xs mt-1">{weights[i]}%</div>
                                                </motion.div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Controls */}
                            {step === 'train' && (
                                <div className="mt-12 flex justify-center items-center gap-8">
                                    <div className="text-left text-sm text-gray-400 max-w-xs">
                                        <p>💡 Hint: Increase the slider for the word that "it" refers to. Decrease others.</p>
                                    </div>
                                    <Button onClick={handleRunTraining} size="xl" className="shadow-lg shadow-cyan-500/20">
                                        RUN FORWARD PASS ▶
                                    </Button>
                                </div>
                            )}

                            {step === 'fail' && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-4 bg-red-900/50 border border-red-500 rounded-xl text-red-200">
                                    <p className="font-bold text-xl">High Logic Loss Detected! 📉</p>
                                    <p>The model is paying too much attention to the wrong word. Adjust the weights!</p>
                                </motion.div>
                            )}

                        </motion.div>
                    ) : (
                        <motion.div
                            key="explanation"
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="max-w-5xl w-full text-center space-y-12"
                        >
                            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-red-500">
                                Training Complete!
                            </h2>

                            <div className="p-8 bg-white/5 rounded-3xl border border-white/10 text-xl leading-relaxed text-gray-300">
                                <p className="mb-6">
                                    You just acted as the <span className="text-cyan-400 font-bold">Optimizer</span>.
                                </p>
                                <p className="mb-6">
                                    In real AI training, we don't manually set sliders. We give the model millions of sentences, and <span className="text-purple-400 font-bold">Gradient Descent</span> automatically nudges these weights up or down until the "Loss" is zero.
                                </p>
                                <p>
                                    The result? A model that "pays attention" to the right words.
                                </p>
                            </div>

                            <div className="pt-8">
                                <Button onClick={handleFinish} size="xl" className="shadow-2xl shadow-yellow-500/20">
                                    Next: Generative AI (Diffusion) →
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </PageWrapper>
    )
}

export default AttentionHighlighter
