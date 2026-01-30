import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import Button from '../components/ui/Button'
import useGameStore from '../stores/gameStore'

const SENTENCE = [
    { id: 0, word: "The" },
    { id: 1, word: "animal" },
    { id: 2, word: "didn't" },
    { id: 3, word: "cross" },
    { id: 4, word: "the" },
    { id: 5, word: "street" },
    { id: 6, word: "because" },
    { id: 7, word: "it" },
    { id: 8, word: "was" },
    { id: 9, word: "too" },
    { id: 10, word: "tired" },
    { id: 11, word: "." }
]

// "It" refers to "animal". So AI should attend strongly to "animal" and "tired".
const AI_ATTENTION = {
    7: [ // "it"
        { target: 1, strength: 1.0 }, // animal (Critical)
        { target: 10, strength: 0.8 }, // tired (Context)
        { target: 5, strength: 0.1 }, // street (Irrelevant)
    ]
}

const AttentionHighlighter = () => {
    const navigate = useNavigate()
    const { completeExperiment, setScore } = useGameStore()
    
    // 'highlight' | 'reveal'
    const [step, setStep] = useState('highlight')
    const [selectedWords, setSelectedWords] = useState([])
    
    const toggleWord = (id) => {
        if(step !== 'highlight') return
        if(selectedWords.includes(id)) {
            setSelectedWords(prev => prev.filter(w => w !== id))
        } else {
            setSelectedWords(prev => [...prev, id])
        }
    }

    const handleReveal = () => {
        setStep('reveal')
        completeExperiment('attention')
        setScore('attention', 100)
    }

    return (
        <PageWrapper>
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-white max-w-5xl mx-auto">
                <div className="absolute top-8 left-8">
                     <div className="text-xs font-mono text-cyan-400 mb-1">EXP_05 // SELF_ATTENTION</div>
                     <h1 className="text-3xl font-bold">Attention Mechanism</h1>
                </div>

                <div className="max-w-3xl w-full text-center">
                    <h2 className="text-2xl mb-8 text-gray-300">
                        In the sentence below, what does the word <span className="text-yellow-400 font-bold border-b-2 border-yellow-400">"it"</span> refer to?
                        <br/>
                        <span className="text-sm text-gray-500 mt-2 block">Highlight the words that give "it" its meaning.</span>
                    </h2>

                    <div className="bg-white/5 border border-white/10 p-10 rounded-2xl flex flex-wrap justify-center gap-4 transition-all mb-12">
                        {SENTENCE.map((item) => {
                            const isSelected = selectedWords.includes(item.id)
                            const isAttentionTarget = step === 'reveal' && (item.id === 1 || item.id === 10) // Hardcoded visual for demo logic
                            
                            return (
                                <motion.span
                                    key={item.id}
                                    onClick={() => toggleWord(item.id)}
                                    layout
                                    className={`
                                        relative px-3 py-1 rounded-lg text-3xl font-serif cursor-pointer transition-all duration-300
                                        ${isSelected ? 'bg-cyan-500/30 text-cyan-200' : 'hover:bg-white/5'}
                                        ${item.word === "it" ? 'border-b-2 border-yellow-400 text-yellow-100' : ''}
                                    `}
                                >
                                    {item.word}
                                    
                                    {/* AI Attention Arc (Visualized as simple underline/glow for now) */}
                                    {step === 'reveal' && item.id === 7 && (
                                        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-yellow-500 font-mono whitespace-nowrap">
                                            Focus
                                        </motion.div>
                                    )}
                                    
                                    {step === 'reveal' && isAttentionTarget && (
                                        <motion.div 
                                            initial={{opacity:0, scale: 0}} 
                                            animate={{opacity:1, scale: 1}} 
                                            className="absolute -top-3 -right-3 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-[10px] shadow-lg z-10"
                                        >
                                            {(item.id === 1 ? '98%' : '75%')}
                                        </motion.div>
                                    )}
                                </motion.span>
                            )
                        })}
                    </div>

                    {step === 'highlight' ? (
                        <div className="space-y-4">
                             <Button onClick={handleReveal} size="xl" disabled={selectedWords.length === 0}>
                                Compute Attention Weights
                            </Button>
                        </div>
                    ) : (
                        <motion.div initial={{opacity:0, y: 20}} animate={{opacity:1, y: 0}} className="space-y-8">
                            <div className="p-6 bg-purple-900/20 border border-purple-500/30 rounded-xl text-left">
                                <h3 className="text-purple-400 font-bold mb-2">AI ATTENTION MAP</h3>
                                <p className="text-gray-300">
                                    The model assigned <b>98% attention</b> to "animal" because "tired" interacts with "animal", not "street".
                                    <br/>
                                    If the sentence ended with "...because it was too <span className="text-white">wide</span>", the attention would flip to "street".
                                </p>
                            </div>

                            <div className="p-4 rounded-xl border border-white/10 text-center">
                                <span className="text-xs font-mono text-gray-500 uppercase">Key Takeaway</span>
                                <p className="text-2xl mt-2 italic font-light">"Attention is importance, not awareness."</p>
                            </div>

                            <Button onClick={() => navigate('/experiment/6')} size="xl" className="w-full">
                                Next: Generative AI (Diffusion) →
                            </Button>
                        </motion.div>
                    )}
                </div>
            </div>
        </PageWrapper>
    )
}

export default AttentionHighlighter
