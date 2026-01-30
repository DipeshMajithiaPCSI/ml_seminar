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
        words: ["I", "went", "to", "the", "bank", "to", "deposit", "a", "check."],
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
        winGif: "https://media.giphy.com/media/26AHONTmuXD2WDV6g/giphy.gif",
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
        detailed: "Birds don't lift steel beams. You used 'Common Sense'—Transformers learn this via massive training on internet text.",
        winGif: "https://media.giphy.com/media/l2JdTa0yMdbqqM264/giphy.gif",
        lossGif: "https://media.giphy.com/media/xT5LMzIK1AdZJ4cYW4/giphy.gif"
    }
]

const ContextSwitch = () => {
    const navigate = useNavigate()
    const { completeExperiment, setScore } = useGameStore()
    
    const [levelIndex, setLevelIndex] = useState(0)
    const [step, setStep] = useState('find_context') // 'find_context' | 'predict' | 'success'
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
        if(levelIndex < SENTENCES.length - 1) {
            setLevelIndex(prev => prev + 1)
        } else {
             completeExperiment('context-switch')
             setScore('context-switch', 100)
             navigate('/experiment/5') 
        }
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
                                <motion.p initial={{opacity:0}} animate={{opacity:1}} className="text-xl md:text-2xl text-cyan-300 font-bold">
                                    Tap the word that explains "<span className="text-yellow-400 underline">{level.words[level.ambiguousIndex]}</span>"
                                </motion.p>
                            )}
                            {step === 'predict' && (
                                <motion.p initial={{opacity:0}} animate={{opacity:1}} className="text-xl md:text-2xl text-white font-bold">
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
                </AnimatePresence>
            </div>
        </PageWrapper>
    )
}

export default ContextSwitch

