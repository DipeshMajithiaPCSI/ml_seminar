import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import Button from '../components/ui/Button'
import useGameStore from '../stores/gameStore'
import confetti from 'canvas-confetti'

// Simple implementation of K-Means for the demo
const useKMeans = (points, k) => {
    const [centroids, setCentroids] = useState([])
    const [clusters, setClusters] = useState([])
    
    // Run k-means when triggered
    const run = () => {
        // 1. Initialize centroids randomly (or pick k points)
        let newCentroids = []
        // Heuristic: Pick points far apart or just random
        for(let i=0; i<k; i++) {
             newCentroids.push({ 
                 x: Math.random() * 100, 
                 y: Math.random() * 100,
                 color: i === 0 ? '#ef4444' : i === 1 ? '#3b82f6' : '#22c55e'
             })
        }
        
        // 2. Iterate (simplified to one pass or animation steps normally, but here instant for simplicity)
        let finalClusters = []
        for(let iter=0; iter<10; iter++) {
             // Assign points to nearest centroid
             const assignments = points.map(p => {
                 let minDist = Infinity
                 let clusterIndex = 0
                 newCentroids.forEach((c, idx) => {
                     const dist = Math.sqrt(Math.pow(c.x - p.x, 2) + Math.pow(c.y - p.y, 2))
                     if(dist < minDist) {
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
                 if(clusterPoints.length === 0) return c
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
    
    // Steps: 'intro' -> 'drawing' -> 'reveal' -> 'completed'
    const [step, setStep] = useState('intro') 
    const [points, setPoints] = useState([])
    
    // User Interaction
    const [userGroups, setUserGroups] = useState([]) // Array of paths/circles drawn by user
    const [isDrawing, setIsDrawing] = useState(false)
    const svgRef = useRef(null)
    const currentPath = useRef([])
    
    const { run: runAI, centroids, clusters } = useKMeans(points, 3)

    // Generate random points on mount
    useEffect(() => {
        const pts = []
        // Generate 3 distinct blobs for clearer visuals (Reduced overlap)
        const centers = [{x: 20, y: 20}, {x: 80, y: 20}, {x: 50, y: 80}] 
        centers.forEach(c => {
            for(let i=0; i<8; i++) {
                // Use polar coordinates to push points away from the absolute center
                // This ensures the "Centroid" revealed later is clearly visible
                const angle = Math.random() * Math.PI * 2
                const radius = 5 + Math.random() * 8 // Random radius between 5% and 13%
                
                pts.push({
                    x: c.x + Math.cos(angle) * radius,
                    y: c.y + Math.sin(angle) * radius,
                    id: Math.random()
                })
            }
        })
        setPoints(pts)
    }, [])

    const handleStart = () => {
        setStep('drawing')
    }

    const handleReveal = () => {
        runAI()
        setStep('reveal')
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        })
        completeExperiment('group-the-data')
        setScore('group-the-data', 100)
    }

    // --- Drawing Logic for User Grouping ---
    /* 
       Simplified for standard web: instead of complex drawing, 
       click points to toggle their "User Group" color? 
       OR just drag a lasso? Lasso is cooler but harder.
       Alternative: "Click to Select" -> Assign Group 1, Group 2...
    */
    const [selectedGroup, setSelectedGroup] = useState(0)
    const [pointAssignments, setPointAssignments] = useState({}) // pointId -> groupIndex

    const togglePoint = (pId) => {
        if(step !== 'drawing') return
        setPointAssignments(prev => ({
            ...prev,
            [pId]: selectedGroup
        }))
    }

    return (
        <PageWrapper>
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-white max-w-6xl mx-auto">
                
                {/* Header */}
                <div className="absolute top-8 left-8">
                     <div className="text-xs font-mono text-cyan-400 mb-1">EXP_03 // UNSUPERVISED_LEARNING</div>
                     <h1 className="text-3xl font-bold">Group the Data</h1>
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
                                <br/>
                                Intelligence is the ability to find <b>structure</b> in chaos.
                            </p>
                            <Button onClick={handleStart} size="xl">
                                Start Clustering Task
                            </Button>
                        </motion.div>
                    )}

                    {/* GAME / REVEAL */}
                    {(step === 'drawing' || step === 'reveal') && (
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
                                        // Drawing Phase: User color
                                        // Reveal Phase: AI color
                                        let fill = '#ffffff'
                                        let opacity = 0.5
                                        
                                        if (step === 'drawing') {
                                            const group = pointAssignments[p.id]
                                            if (group === 0) fill = '#ef4444' // Red
                                            if (group === 1) fill = '#3b82f6' // Blue
                                            if (group === 2) fill = '#22c55e' // Green
                                            if (group !== undefined) opacity = 1
                                        } else {
                                            const cluster = clusters[i]
                                            if (cluster === 0) fill = '#ef4444'
                                            if (cluster === 1) fill = '#3b82f6'
                                            if (cluster === 2) fill = '#22c55e'
                                            opacity = 1
                                        }

                                        return (
                                            <motion.circle
                                                key={p.id}
                                                cx={p.x} cy={p.y} r={step === 'reveal' ? 3 : 2}
                                                fill={fill}
                                                opacity={opacity}
                                                className="cursor-pointer transition-all duration-300"
                                                onClick={() => togglePoint(p.id)}
                                                animate={{ scale: step === 'reveal' ? 1.5 : 1 }}
                                                filter={step === 'reveal' ? "url(#glow)" : ""}
                                            />
                                        )
                                    })}

                                    {/* Centroids (Reveal only) */}
                                    {step === 'reveal' && centroids.map((c, i) => (
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
                                            <div className="flex gap-4">
                                                {[
                                                    { color: 'bg-red-500', name: 'Group A' },
                                                    { color: 'bg-blue-500', name: 'Group B' },
                                                    { color: 'bg-green-500', name: 'Group C' }
                                                ].map((g, i) => (
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
                                            Try to find the natural clusters. There is no right answer, only structure.
                                        </div>

                                        <Button onClick={handleReveal} size="lg" className="w-full">
                                            Reveal Machine Logic
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-xl font-bold mb-2 text-cyan-400">Machine Intelligence</h3>
                                            <h1 className="text-4xl font-bold mb-4">K-Means Clustering</h1>
                                            <p className="text-gray-300 leading-relaxed">
                                                The algorithm identified 3 distinct centers of gravity. It didn't need to know <i>what</i> the data was—it just measured distance.
                                            </p>
                                        </div>
                                        
                                        <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-white/10">
                                            <div className="text-xs font-mono text-cyan-400 mb-2">KEY TAKEAWAY</div>
                                            <p className="text-lg font-light text-white italic">
                                                "Intelligence can emerge without instructions."
                                            </p>
                                        </div>

                                        <Button onClick={() => navigate('/experiment/4')} size="xl" className="w-full">
                                            Next: Context & Language → 
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </PageWrapper>
    )
}

export default GroupTheData
