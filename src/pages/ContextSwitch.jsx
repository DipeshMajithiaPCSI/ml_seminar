import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import Button from '../components/ui/Button'
import useGameStore from '../stores/gameStore'
import confetti from 'canvas-confetti'
import GameFeedback from '../components/ui/GameFeedback'


const SENTENCES = [
    {
        id: 1,
        // "I went to the bank to deposit a check"
        words: ["I", "went", "to", "the", "bank", "to", "deposit", "a", "cheque"],
        ambiguousIndex: 4, // bank
        contextIndices: [6, 8], // deposit, check
        options: [
            { id: 'finance', label: "Financial Bank", icon: "💰" },
            { id: 'river', label: "River Bank", icon: "🌊" }
        ],
        correct: 'finance',
        detailed: "You found 'deposit'! In deep learning, this discovery process is called 'Self-Attention'. The model attends to 'deposit' to understand 'bank'.",
        winGif: "https://media.giphy.com/media/l0HlO3BJ8LALPW4sE/giphy.gif",
        lossGif: "https://media.giphy.com/media/3o7btUg31OCi0NXdkY/giphy.gif"
    },
    {
        id: 2,
        // "I went to the bank of the river"
        words: ["I", "went", "to", "the", "bank", "of", "the", "river."],
        ambiguousIndex: 4,
        contextIndices: [7], // river
        options: [
            { id: 'finance', label: "Financial Bank", icon: "💰" },
            { id: 'river', label: "River Bank", icon: "🌊" }
        ],
        correct: 'river',
        detailed: "Context changes everything. A naive model might always guess 'Money' for 'Bank', but a Transformer looks at 'River' first.",
        winGif: "https://media.tenor.com/e9gAN0zG7g8AAAAm/quby-hyper.webp",
        lossGif: "https://media.giphy.com/media/l41lXkx9x8OTM1rwY/giphy.gif"
    },
    {
        id: 3,
        // "The crane lifted the heavy steel beam"
        words: ["The", "crane", "lifted", "the", "heavy", "steel", "beam."],
        ambiguousIndex: 1, // crane
        contextIndices: [2, 5, 6], // lifted, steel, beam
        options: [
            { id: 'bird', label: "The Bird", icon: "🦩" },
            { id: 'machine', label: "The Machine", icon: "🏗️" }
        ],
        correct: 'machine',
        detailed: "Birds don't lift steel beams. You used 'Common Sense'-Transformers learn this via massive training on internet text.",
        winGif: "https://media.tenor.com/uo6y8vuwoZIAAAAM/happy-happy-happy.gif",
        lossGif: "https://media.giphy.com/media/xT5LMzIK1AdZJ4cYW4/giphy.gif"
    }
]

const ContextSwitch = () => {
    const navigate = useNavigate()
    const { completeExperiment, setScore } = useGameStore()

    const [levelIndex, setLevelIndex] = useState(0)

    const [step, setStep] = useState('find_context') // 'find_context' | 'predict' | 'success' | 'explanation'
    const [foundContext, setFoundContext] = useState([])
    const [userChoice, setUserChoice] = useState(null)
    const [showFeedback, setShowFeedback] = useState(false)
    const [shakeWord, setShakeWord] = useState(null)

    const level = SENTENCES[levelIndex]

    // Reset state on level change
    useEffect(() => {
        setStep('find_context')
        setFoundContext([])
        setUserChoice(null)
        setShowFeedback(false)
    }, [levelIndex])

    const handleWordClick = (index) => {
        if (step !== 'find_context') return
        if (index === level.ambiguousIndex) return // Can't use the word itself as context

        if (level.contextIndices.includes(index)) {
            // Correct context found!
            if (!foundContext.includes(index)) {
                const newFound = [...foundContext, index]
                setFoundContext(newFound)
                // If any context is found, we allow prediction (simplified from finding ALL)
                confetti({
                    particleCount: 30,
                    spread: 40,
                    origin: { y: 0.5 },
                    colors: ['#22d3ee']
                })
                setTimeout(() => setStep('predict'), 800)
            }
        } else {
            // Wrong word
            setShakeWord(index)
            setTimeout(() => setShakeWord(null), 500)
        }
    }

    const handleChoice = (choiceId) => {
        setUserChoice(choiceId)

        if (choiceId === level.correct) {
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
            // Wrong choice logic could go here, but let's just show feedback immediately for fail
            setStep('success') // Technically 'fail' but reusing state
            setTimeout(() => {
                setShowFeedback(true)
            }, 1000)
        }
    }

    const handleNext = () => {
        setShowFeedback(false)
        if (levelIndex < SENTENCES.length - 1) {
            setLevelIndex(prev => prev + 1)
        } else {
            setStep('explanation')
        }
    }

    const handleFinish = () => {
        setStep('explanation_attention')
    }

    const handleRealFinish = () => {
        completeExperiment('context-switch')
        setScore('context-switch', 100)
        navigate('/experiment/5')
    }

    return (
        <PageWrapper>
            <GameFeedback
                isOpen={showFeedback}
                isSuccess={userChoice === level.correct}
                gifUrl={userChoice === level.correct ? level.winGif : level.lossGif}
                title={userChoice === level.correct ? "Context Connected!" : "Context Missed!"}
                description={userChoice === level.correct ? "You successfully used the clue." : "Not quite!"}
                explanation={level.detailed}
                onNext={handleNext}
                nextLabel={levelIndex < SENTENCES.length - 1 ? "Next Sentence" : "Next Module: Attention"}
            />

            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-white max-w-5xl mx-auto">
                <div className="absolute top-8 left-8">
                    <div className="text-xs font-mono text-cyan-400 mb-1">EXP_04 // TRANSFORMERS</div>
                    <h1 className="text-3xl font-bold">Context Hunter</h1>
                </div>

                <AnimatePresence mode="wait">
                    {step !== 'explanation' && (
                        <motion.div
                            key={levelIndex}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full text-center"
                        >
                            {/* Instruction */}
                            <div className="mb-12 min-h-[4rem]">
                                {step === 'find_context' && (
                                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl md:text-2xl text-cyan-300 font-bold">
                                        Tap the word that explains "<span className="text-yellow-400 underline">{level.words[level.ambiguousIndex]}</span>"
                                    </motion.p>
                                )}
                                {step === 'predict' && (
                                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl md:text-2xl text-white font-bold">
                                        Now, what does it mean?
                                    </motion.p>
                                )}
                            </div>

                            {/* Sentence Display */}
                            <div className="flex flex-wrap justify-center gap-3 mb-16 px-4">
                                {level.words.map((word, i) => {
                                    const isAmbiguous = i === level.ambiguousIndex
                                    const isFound = foundContext.includes(i)
                                    const isShake = shakeWord === i

                                    return (
                                        <motion.span
                                            key={i}
                                            onClick={() => handleWordClick(i)}
                                            animate={isShake ? { x: [-5, 5, -5, 5, 0] } : {}}
                                            className={`
                                            text-3xl md:text-5xl font-serif px-3 py-2 rounded-xl transition-all duration-300 select-none
                                            ${isAmbiguous ? 'text-yellow-400 bg-yellow-500/20 border-b-2 border-yellow-400' : ''}
                                            ${isFound ? 'text-cyan-200 bg-cyan-900/60 shadow-[0_0_15px_rgba(34,211,238,0.5)] scale-110' : ''}
                                            ${!isAmbiguous && !isFound && step === 'find_context' ? 'cursor-pointer hover:bg-white/10 hover:text-cyan-200' : ''}
                                            ${step === 'predict' && !isFound && !isAmbiguous ? 'opacity-30 blur-sm' : ''} 
                                        `}
                                        >
                                            {word}
                                        </motion.span>
                                    )
                                })}
                            </div>

                            {/* Options Area */}
                            <div className="h-48">
                                {step === 'predict' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex gap-6 justify-center"
                                    >
                                        {level.options.map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => handleChoice(opt.id)}
                                                className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-105 hover:border-cyan-400 transition-all group min-w-[200px]"
                                            >
                                                <div className="text-6xl mb-4 grayscale group-hover:grayscale-0 transition-all">{opt.icon}</div>
                                                <div className="text-lg font-bold">{opt.label}</div>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}


                    {/* EXPLANATION SCREEN */}
                    {step === 'explanation' && (
                        <motion.div
                            key="explanation"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="max-w-4xl w-full text-center space-y-12"
                        >
                            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                                How Transformers Work
                            </h2>

                            <div className="grid md:grid-cols-2 gap-8 text-left">
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                    <h3 className="text-xl font-bold text-red-400 mb-4">🚫 The Old Way (RNNs)</h3>
                                    <p className="text-gray-400 mb-4">
                                        Computers used to read one word at a time, left to right.
                                    </p>
                                    <div className="flex gap-2 font-mono text-sm opacity-60">
                                        <span>I</span> → <span>went</span> → <span>to</span>... <span className="text-red-500">(Forgot "I" by the end)</span>
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-cyan-900/20 border border-cyan-500/30">
                                    <h3 className="text-xl font-bold text-cyan-400 mb-4">⚡ The Transformer Way</h3>
                                    <p className="text-gray-300 mb-4">
                                        Transformers read the <b>entire sentence at once</b> ("Parallel Processing").
                                    </p>
                                    <p className="text-gray-300">
                                        They use <b>Self-Attention</b> to find connections between ANY words, no matter how far apart.
                                    </p>
                                </div>
                            </div>

                            <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/10">
                                <p className="text-2xl font-light italic text-white/90">
                                    "Attention is all you need."
                                </p>
                                <p className="text-sm text-gray-500 mt-2">- The paper that changed everything (2017)</p>
                            </div>

                            <div className="pt-8">
                                <Button onClick={handleFinish} size="xl" className="shadow-2xl shadow-cyan-500/20">
                                    Next Module: Visualize Attention →
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* NEW: ATTENTION ANIMATION EXPLANATION */}
                    {step === 'explanation_attention' && (
                        <AttentionExplanation onComplete={handleRealFinish} />
                    )}
                </AnimatePresence>
            </div>
        </PageWrapper>
    )
}

const AttentionExplanation = ({ onComplete }) => {
    // Phases: 
    // 0: Query (Bank asks?)
    // 1: Scan (Beam moves)
    // 2: Attend (Lock on River)
    // 3: Value (Data transfer)
    // 4: Update (Meaning changed)
    const [phase, setPhase] = useState(0)

    useEffect(() => {
        const sequence = async () => {
            await new Promise(r => setTimeout(r, 1000))
            setPhase(1) // Start Scanning
            await new Promise(r => setTimeout(r, 4000)) // Scan longer
            setPhase(2) // Lock on River
            await new Promise(r => setTimeout(r, 2000))
            setPhase(3) // Transfer Value
            await new Promise(r => setTimeout(r, 2000))
            setPhase(4) // Update
        }
        sequence()
    }, [])

    return (
        <motion.div key="att-expl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl w-full text-center mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-cyan-300">Inside the "Attention Head"</h2>

            {/* Stage */}
            <div className="relative h-[300px] flex items-center justify-center mb-8 bg-black/20 rounded-3xl border border-white/5 overflow-hidden">

                {/* Words Container */}
                <div className="flex gap-8 relative z-10 px-12">
                    {["The", "Bank", "of", "the", "River"].map((word, i) => {
                        const isBank = i === 1
                        const isRiver = i === 4

                        return (
                            <div key={i} className="relative group">
                                {/* The Word Box */}
                                <motion.div
                                    animate={
                                        isBank && phase === 0 ? { scale: [1, 1.1, 1], boxShadow: "0 0 20px rgba(234, 179, 8, 0.5)" } :
                                            isRiver && phase === 2 ? { scale: 1.1, borderColor: "#22d3ee", color: "#22d3ee" } :
                                                isBank && phase === 4 ? { backgroundColor: "rgba(34, 211, 238, 0.2)", borderColor: "#22d3ee" } : {}
                                    }
                                    transition={{ duration: 0.5 }}
                                    className={`
                                        text-4xl font-serif px-6 py-4 rounded-xl border-2 border-white/10 bg-black/40 backdrop-blur-sm relative
                                        \${isBank ? 'border-yellow-500/50' : ''}
                                    `}
                                >
                                    {word}

                                    {/* Q/K/V Labels */}
                                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-mono font-bold opacity-0 transition-opacity duration-300"
                                        style={{ opacity: (isBank && phase >= 0) || (isRiver && phase >= 2) ? 1 : 0 }}>
                                        {isBank ? (phase >= 4 ? "UPDATED" : "QUERY") : isRiver ? "KEY" : ""}
                                    </div>

                                    {/* Icons appearing */}
                                    {isBank && phase === 0 && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-6 right-0 text-3xl">❓</motion.div>
                                    )}
                                    {isRiver && phase === 2 && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-6 right-0 text-3xl">🔑</motion.div>
                                    )}
                                    {isBank && phase === 4 && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-6 right-0 text-3xl">🌊</motion.div>
                                    )}
                                </motion.div>
                            </div>
                        )
                    })}
                </div>

                {/* Scanning Beam Animation */}
                {phase === 1 && (
                    <motion.div
                        initial={{ left: "20%", opacity: 0 }}
                        animate={{ left: ["25%", "85%"], opacity: [0, 1, 1, 0] }}
                        transition={{ duration: 3.5, times: [0, 0.1, 0.9, 1] }}
                        className="absolute top-1/2 -translate-y-1/2 w-32 h-[200px] pointer-events-none z-0"
                        style={{ background: "linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.2), transparent)" }}
                    />
                )}

                {/* Connection Line (Arc) */}
                {phase >= 2 && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-cyan-400 overflow-visible z-20">
                        {/* Draw arc from Bank (approx 30%) to River (approx 80%) */}
                        <motion.path
                            d="M 230 150 Q 450 50 670 150"
                            fill="none" strokeWidth="3"
                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                        />
                        {/* Data Particle flowing back */}
                        {phase === 3 && (
                            <motion.circle r="6" fill="#ffff00"
                                initial={{ offsetDistance: "100%" }}
                                animate={{ offsetDistance: "0%" }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                                style={{ offsetPath: "path('M 230 150 Q 450 50 670 150')" }}
                            />
                        )}
                    </svg>
                )}
            </div>

            {/* Narrative */}
            <div className="h-32 text-center">
                <AnimatePresence mode="wait">
                    {phase === 0 && (
                        <motion.div key="0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <h3 className="text-xl font-bold text-yellow-400">1. The Query</h3>
                            <p className="text-gray-400">"Bank" asks: "What kind of bank am I?"</p>
                        </motion.div>
                    )}
                    {phase === 1 && (
                        <motion.div key="1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <h3 className="text-xl font-bold text-cyan-400">2. The Attention Sweep</h3>
                            <p className="text-gray-400">The model scans every other word in the sentence for clues.</p>
                        </motion.div>
                    )}
                    {phase === 2 && (
                        <motion.div key="2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <h3 className="text-xl font-bold text-green-400">3. Match Found!</h3>
                            <p className="text-gray-400">"River" fits the context perfectly. It has the Key.</p>
                        </motion.div>
                    )}
                    {phase >= 3 && (
                        <motion.div key="3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <h3 className="text-xl font-bold text-purple-400">4. Context Update</h3>
                            <p className="text-gray-400">"River" sends its meaning (Value) to "Bank". <br /> Now "Bank" knows it means "River Bank"!</p>
                            {phase >= 4 && (
                                <Button onClick={onComplete} className="mt-4 animate-bounce">
                                    Continue to Training →
                                </Button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}

export default ContextSwitch
