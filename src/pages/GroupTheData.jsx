import { useState, useEffect, useRef } from 'react'
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
        type: 'blobs',
        name: "Simple Clustering (ML)",
        description: "Standard Machine Learning handles these easily.",
        k: 3,
        explanation: "K-Means simply looks for the center of mass. Since these blobs are far apart, distance is enough to separate them.",
        winGif: "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif"
    },
    {
        id: 2,
        type: 'circles',
        name: "Complex Manifolds (DL)",
        description: "Can simple distance separate these rings?",
        k: 2,
        explanation: "Simple ML failed because it only draws straight lines (Euclidean distance). Deep Learning 'unrolls' this data into higher dimensions to separate it perfectly.",
        failGif: "https://media.giphy.com/media/11ISwbgCxEzMyY/giphy.gif", // Only for DL success really
        winGif: "https://media.giphy.com/media/Um3ljJl8jrnHy/giphy.gif" // Mind blown
    }
]

// Simple implementation of K-Means for the demo
const useKMeans = (points, k) => {
    const [centroids, setCentroids] = useState([])
    const [clusters, setClusters] = useState([])

    // Run k-means when triggered
    const run = () => {
        // 1. Initialize centroids randomly (or pick k points)
        let newCentroids = []
        // Heuristic: Pick points far apart or just random
        for (let i = 0; i < k; i++) {
            newCentroids.push({
                x: Math.random() * 100,
                y: Math.random() * 100,
                color: i === 0 ? '#ef4444' : i === 1 ? '#3b82f6' : '#22c55e'
            })
        }

        // 2. Iterate (simplified to one pass or animation steps normally, but here instant for simplicity)
        let finalClusters = []
        for (let iter = 0; iter < 10; iter++) {
            // Assign points to nearest centroid
            const assignments = points.map(p => {
                let minDist = Infinity
                let clusterIndex = 0
                newCentroids.forEach((c, idx) => {
                    const dist = Math.sqrt(Math.pow(c.x - p.x, 2) + Math.pow(c.y - p.y, 2))
                    if (dist < minDist) {
                        minDist = dist
                        clusterIndex = idx
                    }
                })
                return clusterIndex
            })

            finalClusters = assignments

            // Update centroids
            newCentroids = newCentroids.map((c, idx) => {
                const clusterPoints = points.filter((_, i) => assignments[i] === idx)
                if (clusterPoints.length === 0) return c
                const avgX = clusterPoints.reduce((sum, p) => sum + p.x, 0) / clusterPoints.length
                const avgY = clusterPoints.reduce((sum, p) => sum + p.y, 0) / clusterPoints.length
                return { ...c, x: avgX, y: avgY }
            })
        }

        setCentroids(newCentroids)
        setClusters(finalClusters)
    }

    return { run, centroids, clusters }
}

const GroupTheData = () => {
    const navigate = useNavigate()
    const { completeExperiment, setScore } = useGameStore()

    const [levelIndex, setLevelIndex] = useState(0)
    // Steps: 'intro' -> 'drawing' -> 'reveal_kmeans' -> 'reveal_dl' (only for lvl 2)
    const [step, setStep] = useState('intro')
    const [points, setPoints] = useState([])
    const [showFeedback, setShowFeedback] = useState(false)

    // User Interaction
    const [selectedGroup, setSelectedGroup] = useState(0)
    const [pointAssignments, setPointAssignments] = useState({})

    const level = LEVELS[levelIndex]
    const { run: runAI, centroids, clusters } = useKMeans(points, level.k)

    // Generate points based on level type
    useEffect(() => {
        const pts = []
        if (level.type === 'blobs') {
            const centers = [{ x: 20, y: 20 }, { x: 80, y: 20 }, { x: 50, y: 80 }]
            centers.forEach((c, idx) => {
                for (let i = 0; i < 8; i++) {
                    const angle = Math.random() * Math.PI * 2
                    const radius = 5 + Math.random() * 8
                    pts.push({
                        x: c.x + Math.cos(angle) * radius,
                        y: c.y + Math.sin(angle) * radius,
                        id: Math.random(),
                        trueGroup: idx // For cheating/verifying
                    })
                }
            })
        } else if (level.type === 'circles') {
            // Inner Circle
            for (let i = 0; i < 15; i++) {
                const angle = (i / 15) * Math.PI * 2
                const radius = 15 + Math.random() * 5
                pts.push({
                    x: 50 + Math.cos(angle) * radius,
                    y: 50 + Math.sin(angle) * radius,
                    id: Math.random(),
                    trueGroup: 0 // Inner
                })
            }
            // Outer Ring
            for (let i = 0; i < 30; i++) {
                const angle = (i / 30) * Math.PI * 2
                const radius = 35 + Math.random() * 5
                pts.push({
                    x: 50 + Math.cos(angle) * radius,
                    y: 50 + Math.sin(angle) * radius,
                    id: Math.random(),
                    trueGroup: 1 // Outer
                })
            }
        }
        setPoints(pts)
        setPointAssignments({})
        setStep('drawing') // Skip intro for subsequent levels
        if (levelIndex === 0) setStep('intro')
    }, [levelIndex])

    const handleStart = () => {
        setStep('drawing')
    }

    const handleReveal = () => {
        runAI()
        setStep('reveal_kmeans')

        if (level.type === 'blobs') {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
        }
        // For 'circles', we don't celebrate yet because K-Means fails
    }

    const handleDLReveal = () => {
        setStep('reveal_dl')
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#a855f7', '#d8b4fe'] })
    }

    const handleNext = () => {
        // Show feedback modal
        setShowFeedback(true)
    }

    const onFeedbackClose = () => {
        setShowFeedback(false)
        if (levelIndex < LEVELS.length - 1) {
            setLevelIndex(prev => prev + 1)
        } else {
            setStep('explanation')
        }
    }

    const handleFinish = () => {
        completeExperiment('group-the-data')
        setScore('group-the-data', 100)
        navigate('/experiment/4')
    }

    const togglePoint = (pId) => {
        if (step !== 'drawing') return
        setPointAssignments(prev => ({
            ...prev,
            [pId]: selectedGroup
        }))
    }

    return (
        <PageWrapper>
            <GameFeedback
                isOpen={showFeedback}
                isSuccess={true}
                gifUrl={level.winGif}
                title={levelIndex === 0 ? "Pattern Recognized" : "Deep Learning Success"}
                description={levelIndex === 0 ? "K-Means found the blobs." : "Deep Learning untangled the rings."}
                explanation={level.explanation}
                onNext={onFeedbackClose}
                nextLabel={levelIndex < LEVELS.length - 1 ? "Next Challenge: Complex Data" : "Next: Context & Language"}
            />

            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-white max-w-6xl mx-auto">

                {/* Header */}
                <div className="absolute top-8 left-8">
                    <div className="text-xs font-mono text-cyan-400 mb-1">EXP_03 // UNSUPERVISED_LEARNING</div>
                    <h1 className="text-3xl font-bold">Group the Data ({levelIndex + 1}/{LEVELS.length})</h1>
                </div>

                <AnimatePresence mode="wait">
                    {/* INTRO */}
                    {step === 'intro' && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="max-w-xl text-center"
                        >
                            <h2 className="text-5xl font-bold mb-6">No Labels. No Answers.</h2>
                            <p className="text-xl text-gray-400 mb-10 leading-relaxed">
                                In the real world, data doesn't come with name tags.
                                <br />
                                Intelligence is the ability to find <b>structure</b> in chaos.
                            </p>
                            <Button onClick={handleStart} size="xl">
                                Start Clustering Task
                            </Button>
                        </motion.div>
                    )}

                    {/* GAME / REVEAL */}
                    {(step === 'drawing' || step === 'reveal_kmeans' || step === 'reveal_dl') && (
                        <motion.div
                            key="game"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="flex flex-col md:flex-row gap-12 w-full items-center"
                        >
                            {/* Visualizer */}
                            <div className="relative w-full md:w-2/3 aspect-square max-w-[600px] bg-white/5 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                                <svg className="w-full h-full p-8" viewBox="0 0 100 100">
                                    <defs>
                                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                            <feMerge>
                                                <feMergeNode in="coloredBlur" />
                                                <feMergeNode in="SourceGraphic" />
                                            </feMerge>
                                        </filter>
                                    </defs>

                                    {/* Grid */}
                                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" />
                                    </pattern>
                                    <rect width="100" height="100" fill="url(#grid)" />

                                    {/* Points */}
                                    {points.map((p, i) => {
                                        // Color logic: 
                                        let fill = '#ffffff'
                                        let opacity = 0.5

                                        if (step === 'drawing') {
                                            const group = pointAssignments[p.id]
                                            if (group === 0) fill = '#ef4444' // Red
                                            if (group === 1) fill = '#3b82f6' // Blue
                                            if (group === 2) fill = '#22c55e' // Green
                                            if (group !== undefined) opacity = 1
                                        } else if (step === 'reveal_kmeans') {
                                            const cluster = clusters[i]
                                            if (cluster === 0) fill = '#ef4444'
                                            if (cluster === 1) fill = '#3b82f6'
                                            if (cluster === 2) fill = '#22c55e'
                                            opacity = 1
                                        } else if (step === 'reveal_dl') {
                                            // Show logical Truth
                                            if (p.trueGroup === 0) fill = '#ef4444'
                                            if (p.trueGroup === 1) fill = '#3b82f6'
                                            opacity = 1
                                        }

                                        return (
                                            <motion.circle
                                                key={p.id}
                                                cx={p.x} cy={p.y} r={step.includes('reveal') ? 3 : 2}
                                                fill={fill}
                                                opacity={opacity}
                                                className="cursor-pointer transition-all duration-300"
                                                onClick={() => togglePoint(p.id)}
                                                animate={{ scale: step.includes('reveal') ? 1.5 : 1 }}
                                                filter={step.includes('reveal') ? "url(#glow)" : ""}
                                            />
                                        )
                                    })}

                                    {/* Centroids (K-Means Reveal only) */}
                                    {step === 'reveal_kmeans' && centroids.map((c, i) => (
                                        <motion.g key={`c-${i}`} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
                                            <circle cx={c.x} cy={c.y} r="8" fill="none" stroke={c.color} strokeWidth="2" strokeDasharray="4 2" className="animate-spin-slow" />
                                            <circle cx={c.x} cy={c.y} r="2" fill={c.color} />
                                        </motion.g>
                                    ))}

                                </svg>

                                {/* Overlay Instruction */}
                                {step === 'drawing' && (
                                    <div className="absolute top-4 left-0 w-full text-center pointer-events-none">
                                        <span className="px-3 py-1 bg-black/60 rounded-full text-xs text-white/60">
                                            Select a color below, then click points to group them.
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="w-full md:w-1/3 space-y-8">
                                {step === 'drawing' ? (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-xl font-bold mb-4">Your Intelligence</h3>
                                            <p className="text-gray-400 mb-4">{level.description}</p>
                                            <div className="flex gap-4">
                                                {[
                                                    { color: 'bg-red-500', name: 'Group A' },
                                                    { color: 'bg-blue-500', name: 'Group B' },
                                                    { color: 'bg-green-500', name: 'Group C' }
                                                ].slice(0, level.k).map((g, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setSelectedGroup(i)}
                                                        className={`flex-1 p-4 rounded-xl border transition-all ${selectedGroup === i ? 'border-white bg-white/10 ring-2 ring-white/20' : 'border-white/10 opacity-60 hover:opacity-100'}`}
                                                    >
                                                        <div className={`w-6 h-6 rounded-full ${g.color} mx-auto mb-2`} />
                                                        <div className="text-xs text-center font-mono uppercase">{g.name}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-sm text-gray-400">
                                            Try to find the natural clusters.
                                        </div>

                                        <Button onClick={handleReveal} size="lg" className="w-full">
                                            Reveal Machine Logic
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-xl font-bold mb-2 text-cyan-400">
                                                {step === 'reveal_dl' ? "Deep Learning Intelligence" : "Machine Intelligence"}
                                            </h3>
                                            <h1 className="text-4xl font-bold mb-4">
                                                {step === 'reveal_dl' ? "Manifold Learning" : "K-Means Clustering"}
                                            </h1>

                                            {step === 'reveal_kmeans' && level.type === 'circles' ? (
                                                <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
                                                    <p className="text-red-300 font-bold mb-2">FAILURE DETECTED</p>
                                                    <p className="text-gray-400">
                                                        Simple ML failed. It tried to draw straight lines through circles!
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-gray-300 leading-relaxed">
                                                    {step === 'reveal_dl' ? (
                                                        <div className="space-y-4">
                                                            <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl">
                                                                <h4 className="text-purple-300 font-bold mb-2">The Secret Formula</h4>
                                                                <div className="font-mono text-xl text-center bg-black/40 p-3 rounded-lg mb-3 border border-white/10">
                                                                    y = σ(Wx + b)
                                                                </div>
                                                                <ul className="text-sm space-y-2 text-gray-300">
                                                                    <li><span className="text-cyan-400 font-bold">W (Weights):</span> Stretches the space.</li>
                                                                    <li><span className="text-pink-400 font-bold">b (Bias):</span> Shifts the space.</li>
                                                                    <li><span className="text-yellow-400 font-bold">σ (Sigma):</span> The "non-linearity" that lets us bend & fold space to separate circles.</li>
                                                                </ul>
                                                            </div>
                                                            <p className="text-gray-300 text-sm">
                                                                Traditional ML draws straight lines. Deep Learning captures the <b>shape</b> of the data by warping the coordinate system.
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        "The algorithm identified centers of gravity."
                                                    )}
                                                </p>
                                            )}
                                        </div>

                                        {step === 'reveal_kmeans' && level.type === 'circles' ? (
                                            <Button onClick={handleDLReveal} size="xl" className="w-full animate-pulse-glow">
                                                Activate Deep Learning (NNs) →
                                            </Button>
                                        ) : (
                                            <Button onClick={handleNext} size="xl" className="w-full">
                                                {levelIndex < LEVELS.length - 1 ? "Next Level: Complex Data" : "Next: Context & Language →"}
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>

                    )}

                    {/* EXPLANATION */}
                    {step === 'explanation' && (
                        <motion.div
                            key="explanation"
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="max-w-4xl text-center space-y-12"
                        >
                            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                                The "Rubber Sheet" Trick
                            </h2>

                            <div className="grid md:grid-cols-2 gap-8 items-center text-left">
                                <div className="space-y-6">
                                    <p className="text-xl text-gray-300 leading-relaxed">
                                        Imagine red marbles in the center of a rubber sheet, with blue marbles around them.
                                        You can't separate them with a single straight knife cut.
                                    </p>
                                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                                        <h4 className="font-bold text-cyan-400 mb-2">✨ The Solution</h4>
                                        <p className="text-sm text-gray-400">
                                            Just <span className="text-purple-400 font-bold">Punch the Middle UP</span>!
                                        </p>
                                        <p className="text-sm text-gray-400 mt-2">
                                            Now the red marbles are on top of a hill. You can easily slice them off with one flat cut.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-black/40 p-6 rounded-2xl border border-white/10 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[200px]">
                                        <div className="text-6xl mb-4 animate-bounce">👊 ⬆️ ⛰️</div>
                                        <p className="text-sm text-gray-400 italic">
                                            "Don't cut. Warp the space."
                                        </p>
                                        <div className="absolute top-0 right-0 p-2 text-xs text-gray-600 font-mono">
                                            z = x² + y²
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-yellow-400 font-bold">
                                            This is how AI handles complex data.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8">
                                <Button onClick={handleFinish} size="xl" className="shadow-2xl shadow-purple-500/20">
                                    Next: Context & Language (Transformers) →
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </PageWrapper >
    )
}

export default GroupTheData
