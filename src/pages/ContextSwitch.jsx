import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import Button from '../components/ui/Button'
import useGameStore from '../stores/gameStore'

const SENTENCES = [
    {
        id: 1,
        part1: "I went to the",
        ambiguousWord: "bank",
        options: [
            { id: 'finance', label: "Financial Bank", icon: "💰" },
            { id: 'river', label: "River Bank", icon: "🌊" }
        ],
        reveal: "to deposit a check.",
        correct: 'finance'
    },
    {
        id: 2,
        part1: "I went to the",
        ambiguousWord: "bank",
        options: [
            { id: 'finance', label: "Financial Bank", icon: "💰" },
            { id: 'river', label: "River Bank", icon: "🌊" }
        ],
        reveal: "of the river and sat down.",
        correct: 'river'
    },
    {
        id: 3,
        part1: "The crane",
        ambiguousWord: "lifted",
        options: [
            { id: 'bird', label: "The Bird", icon: "🦩" },
            { id: 'machine', label: "The Machine", icon: "🏗️" }
        ],
        reveal: "the heavy steel beam.",
        correct: 'machine'
    }
]

const ContextSwitch = () => {
    const navigate = useNavigate()
    const { completeExperiment, setScore } = useGameStore()
    
    const [levelIndex, setLevelIndex] = useState(0)
    const [step, setStep] = useState('predict') // 'predict' | 'reveal' | 'explanation'
    const [userChoice, setUserChoice] = useState(null)
    
    const level = SENTENCES[levelIndex]
    
    const handleChoice = (choiceId) => {
        setUserChoice(choiceId)
        setStep('reveal')
    }
    
    const handleNext = () => {
        if(levelIndex < SENTENCES.length - 1) {
            setLevelIndex(prev => prev + 1)
            setStep('predict')
            setUserChoice(null)
        } else {
             // Finish
             completeExperiment('context-switch')
             setScore('context-switch', 100)
             navigate('/experiment/5') // Go to next experiment directly or via menu? User wants "Complete other games", assuming linear flow
        }
    }

    return (
        <PageWrapper>
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-white max-w-4xl mx-auto">
                <div className="absolute top-8 left-8">
                     <div className="text-xs font-mono text-cyan-400 mb-1">EXP_04 // TRANSFORMERS</div>
                     <h1 className="text-3xl font-bold">Context Switch</h1>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div 
                        key={levelIndex + step}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full text-center"
                    >
                        {/* The Sentence Display */}
                        <div className="bg-white/5 border border-white/10 p-12 rounded-3xl mb-12 relative overflow-hidden">
                            <div className="text-4xl md:text-6xl font-serif leading-tight">
                                <span className="opacity-50">{level.part1}</span>
                                <span className="mx-3 px-2 bg-yellow-500/20 text-yellow-200 rounded-lg">{level.ambiguousWord}</span>
                                {step === 'reveal' && (
                                    <motion.span 
                                        initial={{ opacity: 0, filter: 'blur(10px)' }}
                                        animate={{ opacity: 1, filter: 'blur(0px)' }}
                                        transition={{ duration: 0.8 }}
                                        className="text-cyan-400 font-bold"
                                    >
                                        {level.reveal}
                                    </motion.span>
                                )}
                                {step === 'predict' && (
                                    <span className="opacity-20">...</span>
                                )}
                            </div>
                        </div>

                        {/* Interaction Area */}
                        {step === 'predict' ? (
                            <div className="max-w-xl mx-auto">
                                <p className="text-xl text-gray-400 mb-8">What does "<b className="text-white">{level.ambiguousWord}</b>" mean here?</p>
                                <div className="grid grid-cols-2 gap-6">
                                    {level.options.map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => handleChoice(opt.id)}
                                            className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-105 transition-all group"
                                        >
                                            <div className="text-6xl mb-4 grayscale group-hover:grayscale-0 transition-all">{opt.icon}</div>
                                            <div className="text-lg font-bold">{opt.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-xl mx-auto">
                                <div className={`p-6 rounded-xl mb-8 border ${userChoice === level.correct ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                                    <p className="text-xl">
                                        {userChoice === level.correct ? (
                                            <>✅ Correct! The context <i>"{level.reveal}"</i> confirms it.</>
                                        ) : (
                                            <>❌ Oops! The context comes <i>after</i>.</>
                                        )}
                                    </p>
                                </div>
                                <Button onClick={handleNext} size="xl">
                                    {levelIndex < SENTENCES.length - 1 ? "Next Example" : "Unlock Attention Mechanism"}
                                </Button>
                            </div>
                        )}
                        
                        {/* Key Takeaway (Only on last level) */}
                        {levelIndex === SENTENCES.length - 1 && step === 'reveal' && (
                             <motion.div 
                                initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: 1}}
                                className="mt-12 p-6 bg-cyan-900/20 border border-cyan-500/20 rounded-xl max-w-lg mx-auto"
                             >
                                <p className="text-cyan-400 font-mono text-sm mb-2">TRANSFORMER INSIGHT</p>
                                <p className="text-xl italic">"Meaning comes from relationships, not position."</p>
                             </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </PageWrapper>
    )
}

export default ContextSwitch
