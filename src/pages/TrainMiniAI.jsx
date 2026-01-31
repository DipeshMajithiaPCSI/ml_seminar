import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import Button from '../components/ui/Button'
import useGameStore from '../stores/gameStore'
import confetti from 'canvas-confetti'
import GameFeedback from '../components/ui/GameFeedback'

const MODULES = [
    {
        id: 'linear',
        title: "Stage 1: Linear Regression",
        quiz: {
            question: "To predict Ice Cream Sales based on Temperature, what shape fits best?",
            options: [
                { id: 'random', label: "Connect every dot perfectly (Zig-Zag)", correct: false },
                { id: 'linear', label: "A straight 'Line of Best Fit'", correct: true }
            ]
        }
    },
    {
        id: 'multiple',
        title: "Stage 2: Multiple Regression",
        quiz: {
            question: "We have Temperature, Price, and Day. How do we predict Sales?",
            options: [
                { id: 'single', label: "Only look at Temperature", correct: false },
                { id: 'multi', label: "Combine all 3 with weights", correct: true }
            ]
        }
    },
    {
        id: 'self_attn',
        title: "Stage 3: Self-Attention",
        quiz: {
            question: "'The robot ate the apple because IT was hungry.' What does IT refer to?",
            options: [
                { id: 'apple', label: "The Apple", correct: false },
                { id: 'robot', label: "The Robot", correct: true }
            ]
        }
    },
    {
        id: 'attn_mech',
        title: "Stage 4: Attention Mechanism",
        quiz: {
            question: "We need to find the answer in a massive book.",
            options: [
                { id: 'flood', label: "Highlight every single word", correct: false },
                { id: 'spot', label: "Spotlight only keywords", correct: true }
            ]
        }
    },
    {
        id: 'diffusion',
        title: "Stage 5: Diffusion",
        quiz: {
            question: "How do we generate a new image from pure noise?",
            options: [
                { id: 'glitch', label: "Just randomize the pixels", correct: false },
                { id: 'denoise', label: "Gradually remove the noise", correct: true }
            ]
        }
    }
]

const TrainMiniAI = () => {
    const navigate = useNavigate()
    const { completeExperiment, setScore } = useGameStore()

    const [currentModule, setCurrentModule] = useState(0)
    const [step, setStep] = useState('quiz') // quiz, training, visual
    const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false)
    const [progress, setProgress] = useState(0)
    const [logs, setLogs] = useState([])
    const [completedModules, setCompletedModules] = useState([])
    const [showFeedback, setShowFeedback] = useState(false)

    const activeModule = MODULES[currentModule]

    // Training Sim
    useEffect(() => {
        if (step === 'training') {
            let p = 0
            setLogs([])
            const interval = setInterval(() => {
                p += 5
                setProgress(p)
                if (Math.random() > 0.6) {
                    const l = ["Optimizing Weights...", "Calculating Gradients...", "Fitting Model...", "Reducing Error..."]
                    setLogs(prev => [l[Math.floor(Math.random() * l.length)], ...prev.slice(0, 1)])
                }
                if (p >= 100) {
                    clearInterval(interval)
                    setTimeout(() => {
                        if (lastAnswerCorrect && !completedModules.includes(currentModule)) {
                            setCompletedModules(prev => [...prev, currentModule])
                        }
                        setStep('visual')
                        if (lastAnswerCorrect) confetti({ particleCount: 50, origin: { y: 0.8 } })
                    }, 300)
                }
            }, 30)
            return () => clearInterval(interval)
        }
    }, [step, currentModule, lastAnswerCorrect])

    const handleAnswer = (isCorrect) => {
        setLastAnswerCorrect(isCorrect)
        if (isCorrect) {
            setStep('training') // Show training only for correct? Or both? User said "If they answer incorrect, that should also generate wrong graph". 
            // Let's Skip training for incorrect to make retry faster, or show a 'Failed Training' bar?
            // "If they answer Incorrect... generate wrong graph."
            // Let's skip training for wrong answers to get to the visual "Failure" faster.
            // Actually, let's keep it consistent: Training -> Unlocks Model -> Model sucks (if wrong).
            // But immediate feedback is better for wrong.
            // Let's do: Correct -> Training -> Success Visual. Wrong -> Fail Visual -> Retry.
        } else {
            setStep('visual')
        }
    }

    const handleFinalFinish = () => {
        completeExperiment('mini_ai')
        setScore('mini_ai', 100)
        setShowFeedback(true)
    }

    // VISUAL COMPONENTS
    const renderVisual = () => {
        switch (activeModule.id) {
            case 'linear':
                return (
                    <div className="h-64 relative bg-slate-900 border border-white/10 rounded-xl overflow-hidden p-4">
                        <div className="absolute top-2 left-2 text-xs text-gray-500">Ice Cream Sales vs Temp</div>
                        {/* Use SVG for precise coordinates */}
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <line x1="0" y1="90" x2="100" y2="90" stroke="#334155" strokeWidth="0.5" />
                            <line x1="10" y1="0" x2="10" y2="100" stroke="#334155" strokeWidth="0.5" />

                            {/* Data Points (Added significant noise to show Zig-Zag) */}
                            {[
                                { x: 15, y: 85 },
                                { x: 35, y: 45 }, // High outlier
                                { x: 55, y: 75 }, // Low outlier
                                { x: 75, y: 35 }, // High outlier
                                { x: 93, y: 15 }
                            ].map((p, i) => (
                                <circle key={i} cx={p.x} cy={p.y} r="3" fill="white" />
                            ))}

                            {lastAnswerCorrect ? (
                                // Correct: Line of Best Fit (Smoothly averages the noise)
                                <motion.line
                                    x1="10" y1="90" x2="95" y2="15"
                                    stroke="#22d3ee" strokeWidth="2" strokeDasharray="5,5"
                                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                                    transition={{ duration: 1 }}
                                />
                            ) : (
                                // Wrong: Overfitting Zig Zag (Connects every chaotic dot)
                                <motion.path
                                    d="M 15 85 L 35 45 L 55 75 L 75 35 L 93 15"
                                    fill="none" stroke="#ef4444" strokeWidth="2"
                                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                                    transition={{ duration: 0.5 }}
                                />
                            )}
                        </svg>

                        <div className={`absolute bottom-2 right-2 font-mono font-bold ${lastAnswerCorrect ? 'text-cyan-400' : 'text-red-500'}`}>
                            {lastAnswerCorrect ? "y = mx + b (Generalizes)" : "Overfitting (Memorizes Noise)"}
                        </div>
                    </div>
                )

            case 'multiple':
                return (
                    <div className="h-64 flex items-center justify-center gap-12 bg-slate-900 rounded-xl border border-white/10 relative overflow-hidden">
                        <div className="flex flex-col gap-4 z-10">
                            {['Temp', 'Price', 'Day'].map((t, i) => (
                                <div key={i} className={`px-4 py-2 rounded text-sm font-bold transition-colors ${lastAnswerCorrect || i === 0 ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-600'}`}>
                                    {t}
                                </div>
                            ))}
                        </div>

                        {/* Connections */}
                        <div className="flex flex-col gap-6 justify-center w-24 relative">
                            {/* Top Line */}
                            <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} className={`h-1 absolute top-[15%] ${lastAnswerCorrect ? 'bg-cyan-500' : 'bg-gray-800'}`} style={{ transformOrigin: 'left', transform: 'rotate(20deg)' }} />
                            {/* Mid Line (Always connected in wrong example as 'Temp' is i=0) */}
                            <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} className="h-1 bg-cyan-500 absolute top-[50%]" />
                            {/* Bot Line */}
                            <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} className={`h-1 absolute top-[85%] ${lastAnswerCorrect ? 'bg-cyan-500' : 'bg-gray-800'}`} style={{ transformOrigin: 'left', transform: 'rotate(-20deg)' }} />
                        </div>

                        <div className={`w-20 h-20 rounded-full flex items-center justify-center font-bold z-10 border-4 ${lastAnswerCorrect ? 'bg-green-500 border-green-400' : 'bg-red-500 border-red-400'}`}>
                            {lastAnswerCorrect ? "Sales" : "Error"}
                        </div>

                        {!lastAnswerCorrect && (
                            <div className="absolute bottom-2 text-red-400 font-mono text-xs">Failed: Ignored Price & Day</div>
                        )}
                    </div>
                )

            case 'self_attn':
                return (
                    <div className="p-8 text-2xl font-mono leading-loose text-center bg-slate-900 rounded-xl border border-white/10 h-64 flex flex-col justify-center relative">
                        <div>
                            The <span className="text-cyan-200">robot</span> ate the <span className="text-red-200">apple</span>...
                        </div>
                        <div className="mt-8">
                            because <span className="font-bold underline text-yellow-400">IT</span> was hungry.
                        </div>

                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            {/* Correct Arrow: It -> Robot */}
                            {lastAnswerCorrect && (
                                <motion.path d="M 300 130 Q 150 180, 150 70" fill="none" stroke="#facc15" strokeWidth="3" markerEnd="url(#arrow)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
                            )}
                            {/* Wrong Arrow: It -> Apple */}
                            {!lastAnswerCorrect && (
                                <motion.path d="M 300 130 Q 300 90, 360 70" fill="none" stroke="#ef4444" strokeWidth="3" markerEnd="url(#arrow-red)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
                            )}
                            <defs>
                                <marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
                                    <path d="M0,0 L0,6 L9,3 z" fill="#facc15" />
                                </marker>
                                <marker id="arrow-red" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
                                    <path d="M0,0 L0,6 L9,3 z" fill="#ef4444" />
                                </marker>
                            </defs>
                        </svg>

                        <div className={`mt-4 text-sm font-bold ${lastAnswerCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            {lastAnswerCorrect ? "IT == ROBOT (Correct Context)" : "IT == APPLE? (Apples don't eat!)"}
                        </div>
                    </div>
                )

            case 'attn_mech':
                return (
                    <div className="h-64 grid grid-cols-6 gap-2 p-4 bg-slate-900 rounded-xl border border-white/10">
                        {Array.from({ length: 24 }).map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{
                                    opacity: lastAnswerCorrect
                                        ? ([7, 8, 14, 15].includes(i) ? 1 : 0.1) // Spotlight
                                        : 1 // Floodlight
                                }}
                                className={`rounded transition-all duration-500 ${lastAnswerCorrect
                                    ? ([7, 8, 14, 15].includes(i) ? 'bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)]' : 'bg-gray-800')
                                    : 'bg-white shadow-[0_0_10px_white]'
                                    }`}
                            />
                        ))}
                        <div className={`col-span-6 text-center font-mono text-sm mt-2 ${lastAnswerCorrect ? 'text-yellow-400' : 'text-red-400'}`}>
                            {lastAnswerCorrect ? "Start 'Spotlight' Mode" : "System Overload: Reading Everything"}
                        </div>
                    </div>
                )

            case 'diffusion':
                return (
                    <div className="h-64 relative bg-black rounded-xl overflow-hidden border border-white/10 flex items-center justify-center">
                        {/* Base Image */}
                        <img
                            src="https://images.unsplash.com/photo-1535905557558-afc4877a26fc?q=80&w=600"
                            className="absolute inset-0 w-full h-full object-cover"
                            style={{ filter: lastAnswerCorrect ? 'none' : 'hue-rotate(90deg) contrast(200%)' }} // Weird filter for wrong
                        />

                        {/* Noise Overlay */}
                        <motion.div
                            initial={{ opacity: 1 }}
                            animate={{ opacity: lastAnswerCorrect ? 0 : 0.8 }} // Clear noise if correct, keep if wrong
                            transition={{ duration: 2 }}
                            className="absolute inset-0 bg-noise z-10 mixing-blend-hard-light"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${lastAnswerCorrect ? 0.65 : 2.0}' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}
                        />

                        {/* Wrong Glitch Effect */}
                        {!lastAnswerCorrect && (
                            <div className="absolute inset-0 flex flex-wrap z-20 opacity-50">
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <div key={i} className="w-full h-4 bg-red-500/50 mix-blend-color-dodge transform translate-x-4 skew-x-12 mt-4" />
                                ))}
                            </div>
                        )}

                        <div className={`absolute bottom-4 px-4 py-2 rounded-full font-bold backdrop-blur z-30 ${lastAnswerCorrect ? 'bg-black/60 text-purple-400' : 'bg-red-900/80 text-white'}`}>
                            {lastAnswerCorrect ? "Beautiful Image Generated" : "Output: Pure Noise / Glitch"}
                        </div>
                    </div>
                )
        }
    }

    return (
        <PageWrapper>
            <GameFeedback
                isOpen={showFeedback}
                isSuccess={true}
                gifUrl="https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif"
                title="Grandmaster Architect"
                description="You have mastered the curriculum."
                explanation="You understand how Linear Logic, Deep Networks, Attention, and Diffusion combine to create modern AI."
                onNext={() => navigate('/reflection')}
                nextLabel="Final Reflection →"
            />

            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-white max-w-5xl mx-auto">

                {/* NAV DOTS */}
                <div className="flex gap-4 mb-12">
                    {MODULES.map((m, i) => (
                        <button
                            key={m.id}
                            onClick={() => { setCurrentModule(i); setStep('quiz'); }}
                            className={`w-4 h-4 rounded-full transition-all hover:scale-125 
                                ${currentModule === i ? 'ring-2 ring-white scale-125' : ''}
                                ${completedModules.includes(i) ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-gray-700'}
                            `}
                        />
                    ))}
                </div>

                <AnimatePresence mode="wait">

                    {/* QUIZ STEP */}
                    {step === 'quiz' && (
                        <motion.div key="quiz" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-2xl text-center">
                            <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">{activeModule.title}</h1>
                            <div className="h-1 w-24 bg-gray-700 mx-auto rounded-full mb-8" />

                            <h2 className="text-2xl mb-8 font-light">{activeModule.quiz.question}</h2>

                            <div className="space-y-4">
                                {activeModule.quiz.options.map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => opt.correct ? handleAnswer(true) : handleAnswer(false)}
                                        className="w-full p-6 text-left bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-cyan-400 transition-all group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-lg">{opt.label}</span>
                                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">➜</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* TRAINING STEP (Only for Correct) */}
                    {step === 'training' && (
                        <motion.div key="training" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center w-full max-w-xl">
                            <h2 className="text-2xl font-bold mb-8 animate-pulse">Training Model...</h2>
                            <div className="w-full h-6 bg-gray-900 rounded-full overflow-hidden mb-8 border border-white/20">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-600"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="h-20 bg-black/40 rounded-lg p-4 font-mono text-xs text-green-400 text-left overflow-hidden">
                                {logs.map((l, i) => <div key={i}>> {l}</div>)}
                            </div>
                        </motion.div>
                    )}

                    {/* VISUAL STEP (Success or Fail) */}
                    {step === 'visual' && (
                        <motion.div key="visual" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-3xl text-center">
                            <div className="mb-8 p-1">
                                {renderVisual()}
                            </div>

                            <h2 className={`text-3xl font-bold mb-2 ${lastAnswerCorrect ? 'text-green-400' : 'text-red-500'}`}>
                                {lastAnswerCorrect ? "Excellent!" : "System Error"}
                            </h2>
                            <p className="text-gray-400 mb-8">
                                {lastAnswerCorrect
                                    ? `You successfully deployed ${activeModule.title.split(':')[1]}.`
                                    : "The model failed to converge. Review the visual and try again."}
                            </p>

                            <Button
                                onClick={() => {
                                    if (lastAnswerCorrect) {
                                        if (currentModule < 4) {
                                            setCurrentModule(prev => prev + 1)
                                            setStep('quiz')
                                        } else {
                                            handleFinalFinish()
                                        }
                                    } else {
                                        setStep('quiz') // Retry
                                    }
                                }}
                                size="xl"
                                className={lastAnswerCorrect ? "shadow-2xl shadow-cyan-500/20" : "bg-red-500/20 hover:bg-red-500/30 border-red-500/50"}
                            >
                                {lastAnswerCorrect
                                    ? (currentModule < 4 ? "Next Challenge →" : "Finish Seminar 🎓")
                                    : "Try Again ↺"}
                            </Button>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </PageWrapper>
    )
}

export default TrainMiniAI
