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
        distractorIndex: 5, // street
        explanation: "Because it was 'tired', 'it' must be the Animal. Streets don't get tired.",
        winGif: "https://media.giphy.com/media/26AHONTmuXD2WDV6g/giphy.gif"
    },
    {
        id: 2,
        text: "The animal didn't cross the street because it was too wide.",
        words: ["The", "animal", "didn't", "cross", "the", "street", "because", "it", "was", "too", "wide."],
        sourceIndex: 7, // it
        correctTargetIndex: 5, // street
        distractorIndex: 1, // animal
        explanation: "Because it was 'wide', 'it' refers to the Street. Animals aren't typically described as 'wide' in this context.",
        winGif: "https://media.giphy.com/media/l0MYt5jPR6tTcPtq8/giphy.gif"
    },
    {
        id: 3,
        text: "The trophy didn't fit in the suitcase because it was too big.",
        words: ["The", "trophy", "didn't", "fit", "in", "the", "suitcase", "because", "it", "was", "too", "big."],
        sourceIndex: 8, // it
        correctTargetIndex: 1, // trophy
        distractorIndex: 6, // suitcase
        explanation: "If valid logic holds, for something to not fit, the object (Trophy) must be big.",
        winGif: "https://media.giphy.com/media/3o7qDSOvfaCO9b3MlO/giphy.gif"
    }
]

const AttentionHighlighter = () => {
    const navigate = useNavigate()
    const { completeExperiment, setScore } = useGameStore()
    
    const [levelIndex, setLevelIndex] = useState(0)
    const [step, setStep] = useState('connect') // 'connect' | 'success' | 'fail'
    const [connection, setConnection] = useState(null) // { from: index, to: index }
    const [showFeedback, setShowFeedback] = useState(false)
    const [wordRefs, setWordRefs] = useState({}) 
    
    // For drawing lines
    const containerRef = useRef(null)
    const [svgPath, setSvgPath] = useState("")

    const level = LEVELS[levelIndex]
    
    // Reset on level change
    useEffect(() => {
        setStep('connect')
        setConnection(null)
        setSvgPath("")
        setShowFeedback(false)
    }, [levelIndex])

    // Update SVG line when connection changes
    useEffect(() => {
        if (connection && wordRefs[connection.from] && wordRefs[connection.to] && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect()
            const fromRect = wordRefs[connection.from].getBoundingClientRect()
            const toRect = wordRefs[connection.to].getBoundingClientRect()
            
            // Calculate relative coordinates
            const x1 = fromRect.left + fromRect.width / 2 - containerRect.left
            const y1 = fromRect.top + fromRect.height / 2 - containerRect.top
            const x2 = toRect.left + toRect.width / 2 - containerRect.left
            const y2 = toRect.top + toRect.height / 2 - containerRect.top

            // Draw a nice curved bezier
            const cx = (x1 + x2) / 2
            const cy = Math.min(y1, y2) - 80 // Control point above text
            
            setSvgPath(`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`)
        } else {
            setSvgPath("")
        }
    }, [connection, wordRefs, levelIndex])

    const handleWordClick = (index) => {
        if (step !== 'connect') return
        if (index === level.sourceIndex) return // Can't connect to itself

        // Must connect source to something
        setConnection({ from: level.sourceIndex, to: index })
        
        if (index === level.correctTargetIndex) {
            setStep('success')
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.6 }
            })
            setTimeout(() => {
                setShowFeedback(true)
            }, 1000)
        } else {
            // Wrong target
            setStep('fail')
            setTimeout(() => {
                setStep('connect')
                setConnection(null)
            }, 1500)
        }
    }

    const handleNext = () => {
        setShowFeedback(false)
        if (levelIndex < LEVELS.length - 1) {
            setLevelIndex(prev => prev + 1)
        } else {
            completeExperiment('attention')
            setScore('attention', 100)
            navigate('/experiment/6')
        }
    }

    const registerRef = (index, el) => {
        if(el) { // Only set if not null
             // We need to mutate the state or object without triggering re-renders loop
             // Using a temp object isn't reactive, but using the callback ref is standard
             wordRefs[index] = el
        }
    }

    return (
        <PageWrapper>
            <GameFeedback 
                isOpen={showFeedback}
                isSuccess={true}
                gifUrl={level.winGif}
                title="Attention Connected"
                description="You solved the reference."
                explanation={level.explanation}
                onNext={handleNext}
                nextLabel={levelIndex < LEVELS.length - 1 ? "Next Challenge" : "Next: Generative AI (Diffusion)"}
            />

            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-white max-w-6xl mx-auto">
                <div className="absolute top-8 left-8">
                     <div className="text-xs font-mono text-cyan-400 mb-1">EXP_05 // SELF_ATTENTION</div>
                     <h1 className="text-3xl font-bold">Attention Mechanism</h1>
                </div>

                <div className="max-w-4xl w-full text-center relative">
                    <h2 className="text-2xl mb-16 text-gray-300">
                        Connect the word <span className="text-yellow-400 font-bold border-b-2 border-yellow-400">"it"</span> to what it refers to.
                    </h2>

                    <div 
                        ref={containerRef}
                        className="relative bg-white/5 border border-white/10 p-12 rounded-3xl flex flex-wrap justify-center gap-x-4 gap-y-8 leading-loose z-10"
                    >
                         {/* SVG Overlay for Line */}
                         <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                            <AnimatePresence>
                                {step !== 'connect' && svgPath && (
                                    <motion.path
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        d={svgPath}
                                        fill="none"
                                        stroke={step === 'success' ? '#22c55e' : '#ef4444'}
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        className="drop-shadow-lg"
                                    />
                                )}
                            </AnimatePresence>
                         </svg>

                        {level.words.map((word, i) => {
                            const isSource = i === level.sourceIndex
                            const isSelected = connection?.to === i
                            const isCorrect = i === level.correctTargetIndex

                            // Interactive styling
                            let styleClass = "hover:bg-white/10"
                            if (isSource) styleClass = "border-b-4 border-yellow-400 text-yellow-100 font-bold cursor-default"
                            else if (isSelected) {
                                styleClass = step === 'success' 
                                    ? "bg-green-500/20 text-green-200 border border-green-500/50" 
                                    : "bg-red-500/20 text-red-200 border border-red-500/50"
                            }
                            
                            return (
                                <span
                                    key={i}
                                    ref={(el) => registerRef(i, el)}
                                    // Only clickable if not source and we are in connect mode
                                    onClick={() => !isSource && handleWordClick(i)}
                                    className={`
                                        relative px-4 py-2 rounded-xl text-3xl md:text-5xl font-serif transition-all duration-200 select-none z-10
                                        ${!isSource ? 'cursor-pointer active:scale-95' : ''}
                                        ${styleClass}
                                    `}
                                >
                                    {word}
                                    {isSource && (
                                        <motion.div 
                                            animate={{ scale: [1, 1.2, 1] }} 
                                            transition={{ repeat: Infinity, duration: 2 }}
                                            className="absolute -top-3 left-1/2 -translate-x-1/2 w-2 h-2 bg-yellow-400 rounded-full"
                                        />
                                    )}
                                </span>
                            )
                        })}
                    </div>
                    
                    {step === 'fail' && (
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="mt-8 text-red-400 font-bold text-xl">
                            Incorrect. Read the sentence again logicially.
                        </motion.div>
                    )}
                </div>
            </div>
        </PageWrapper>
    )
}

export default AttentionHighlighter
