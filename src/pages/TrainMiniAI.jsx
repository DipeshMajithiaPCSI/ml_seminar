import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import Button from '../components/ui/Button'
import useGameStore from '../stores/gameStore'
import confetti from 'canvas-confetti'
import GameFeedback from '../components/ui/GameFeedback'

const TrainMiniAI = () => {
    const navigate = useNavigate()
    const canvasRef = useRef(null)
    
    // Controls
    const [complexity, setComplexity] = useState(1) // 1 = Linear, 2 = MLP, 3 = Deep
    const [trainingStep, setTrainingStep] = useState(0)
    const [isTraining, setIsTraining] = useState(false)
    const [loss, setLoss] = useState(1.0)
    const [showFeedback, setShowFeedback] = useState(false)
    const requestRef = useRef()

    const DATA_SIZE = 80
    const [points, setPoints] = useState([])

    // Generate Spiral Data
    useEffect(() => {
        const pts = []
        for(let i=0; i<DATA_SIZE; i++) {
             // Class 0: Inner
             const angle = (i / DATA_SIZE) * Math.PI * 3.5
             const r = 5 + (i/DATA_SIZE) * 35
             const x0 = 50 + r * Math.cos(angle)
             const y0 = 50 + r * Math.sin(angle)
             pts.push({ x: x0, y: y0, label: 0 })
             
             // Class 1: Outer
             const x1 = 50 + (r+10) * Math.cos(angle + Math.PI)
             const y1 = 50 + (r+10) * Math.sin(angle + Math.PI)
             pts.push({ x: x1, y: y1, label: 1 })
        }
        setPoints(pts)
    }, [])

    // Simulation Loop
    const animate = () => {
        setTrainingStep(prev => {
            const next = prev + 1
            if(next >= 100) {
                setIsTraining(false)
                if (complexity === 3) { // Only Deep model wins
                    setTimeout(() => setShowFeedback(true), 500)
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
                }
                return 100
            }
            
            // Simulate Loss calculation
            // Low complexity = High Loss stuck
            // High complexity = Low Loss
            let targetLoss = 0.5 // Default linear fail
            if(complexity === 2) targetLoss = 0.2
            if(complexity === 3) targetLoss = 0.01
            
            setLoss(l => l - (l - targetLoss) * 0.05)
            
            return next
        })
        if(isTraining) {
            requestRef.current = requestAnimationFrame(animate)
        }
    }

    useEffect(() => {
        if(isTraining) {
            requestRef.current = requestAnimationFrame(animate)
        } else {
            cancelAnimationFrame(requestRef.current)
        }
        return () => cancelAnimationFrame(requestRef.current)
    }, [isTraining])

    const startTraining = () => {
        setTrainingStep(0)
        setLoss(1.0)
        setIsTraining(true)
    }

    // Canvas Render
    useEffect(() => {
        const canvas = canvasRef.current
        if(!canvas) return
        const ctx = canvas.getContext('2d')
        const w = canvas.width = 400
        const h = canvas.height = 400

        ctx.fillStyle = '#111827' // Gray 900
        ctx.fillRect(0,0,w,h)

        // Draw Decision Boundary
        if(trainingStep > 0) {
            const imageData = ctx.createImageData(w, h)
            const data = imageData.data
            
            const time = trainingStep / 100

            for(let py=0; py<h; py+=4) {
                for(let px=0; px<w; px+=4) {
                    const nx = px/w * 100
                    const ny = py/h * 100
                    
                    // Linear Model (Base)
                    // Simple linear separator y = -x
                    let val = (nx - 50) + (ny - 50) 
                    
                    if (complexity >= 2) {
                        // Add some curve (Quadratic-ish)
                        val += Math.sin(nx * 0.1) * 20 * time
                    }
                    if (complexity >= 3) {
                        // Full Spiral Capability (Deep Learning simulation)
                        const angle = Math.atan2(ny - 50, nx - 50)
                        const dist = Math.sqrt(Math.pow(nx-50, 2) + Math.pow(ny-50, 2))
                        // Spiral formula: r = a*theta
                        const spiral = Math.sin(dist * 0.2 + angle * 2.0) * 50
                        
                        // Blend from linear to spiral based on training time
                        val = val * (1-time) + spiral * time
                    }

                    const isBlue = val > 0
                    const idx = (py * w + px) * 4
                    // Blue or Red tint
                    const r = isBlue ? 59 : 239
                    const g = isBlue ? 130 : 68
                    const b = isBlue ? 246 : 68
                    
                    // Fill block
                    for(let dy=0; dy<4; dy++) for(let dx=0; dx<4; dx++) {
                        if(px+dx < w && py+dy < h) {
                            const i = ((py+dy)*w + (px+dx))*4
                            data[i] = r; data[i+1] = g; data[i+2] = b; data[i+3] = 40 // Alpha
                        }
                    }
                }
            }
            ctx.putImageData(imageData, 0, 0)
        }

        // Draw Points
        points.forEach(p => {
             const cx = (p.x / 100) * w
             const cy = (p.y / 100) * h
             ctx.beginPath()
             ctx.arc(cx, cy, 3, 0, Math.PI*2)
             ctx.fillStyle = p.label === 0 ? '#ef4444' : '#3b82f6'
             ctx.fill()
        })

    }, [points, trainingStep, complexity])

    return (
        <PageWrapper>
            <GameFeedback 
                isOpen={showFeedback}
                isSuccess={true}
                gifUrl="https://media.giphy.com/media/26AHONTmuXD2WDV6g/giphy.gif"
                title="Architecture Mastered"
                description="Deep Learning Solved It!"
                explanation="Simple linear models can't handle spirals. By adding 'Depth' (Complexity), you gave the model the power to bend space and fit the data perfectly."
                onNext={() => navigate('/')}
                nextLabel="Return to Start"
            />

            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-white max-w-6xl mx-auto">
                <div className="absolute top-8 left-8">
                     <div className="text-xs font-mono text-purple-400 mb-1">EXP_07 // THE_ARCHITECT</div>
                     <h1 className="text-3xl font-bold">Training Playground</h1>
                </div>

                <div className="flex flex-col md:flex-row gap-12 items-center w-full">
                    {/* Visualizer */}
                    <div className="w-full md:w-1/2 aspect-square bg-slate-900 rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative group">
                        <canvas ref={canvasRef} className="w-full h-full object-cover" />
                        
                        {/* Stats Overlay */}
                        <div className="absolute top-4 right-4 space-y-2 text-right">
                            <div className="bg-black/60 px-3 py-1 rounded-full font-mono text-xs border border-white/10 text-cyan-400">
                                EPOCH: {Math.floor(trainingStep)}
                            </div>
                            <div className="bg-black/60 px-3 py-1 rounded-full font-mono text-xs border border-white/10 text-red-400">
                                LOSS: {loss.toFixed(4)}
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="w-full md:w-1/2 space-y-8">
                        <div>
                            <h2 className="text-3xl font-bold mb-4">Can you fit the spiral?</h2>
                            <p className="text-gray-400 text-lg">
                                This dataset is difficult. A simple model will fail.
                                <br/>
                                Increase the <b>Model Complexity</b> to give it a "Deep Brain".
                            </p>
                        </div>

                        <div className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10">
                            <div>
                                <div className="flex justify-between text-sm mb-4 font-bold tracking-widest text-purple-400">
                                    MODEL COMPLEXITY (LAYERS)
                                </div>
                                <div className="flex gap-4">
                                    {[1, 2, 3].map(level => (
                                        <button
                                            key={level}
                                            onClick={() => !isTraining && setComplexity(level)}
                                            className={`
                                                flex-1 py-4 rounded-xl font-bold transition-all border-2
                                                ${complexity === level 
                                                    ? 'bg-purple-600 border-purple-400 scale-105 shadow-lg shadow-purple-500/20' 
                                                    : 'bg-white/5 border-transparent hover:bg-white/10 text-gray-500'}
                                            `}
                                        >
                                            {level === 1 && "Simple (1)"}
                                            {level === 2 && "Hidden (3)"}
                                            {level === 3 && "Deep (10)"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-black/20 text-sm text-gray-400 border border-white/5 min-h-[5rem] flex items-center">
                                {complexity === 1 && "Level 1: Linear Model. Draws straight lines. Good for simple tasks, fails here."}
                                {complexity === 2 && "Level 2: One Hidden Layer. Can bend slightly, but struggles with spirals."}
                                {complexity === 3 && "Level 3: Deep Neural Network. Capable of learning any complex shape (Universal Approximation)."}
                            </div>
                        </div>

                        <Button 
                            onClick={startTraining} 
                            size="xl" 
                            className={`w-full ${isTraining ? 'opacity-50 cursor-not-allowed' : 'animate-pulse-glow'}`}
                            disabled={isTraining}
                        >
                            {isTraining ? "Training..." : "Start Training Run"}
                        </Button>
                    </div>
                </div>
            </div>
        </PageWrapper>
    )
}

export default TrainMiniAI
