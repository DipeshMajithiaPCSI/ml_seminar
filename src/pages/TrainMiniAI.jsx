import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import Button from '../components/ui/Button'
import useGameStore from '../stores/gameStore'

const TrainMiniAI = () => {
    const navigate = useNavigate()
    const canvasRef = useRef(null)
    
    // Controls
    const [noise, setNoise] = useState(20)
    const [dataSize, setDataSize] = useState(50)
    const [trainingStep, setTrainingStep] = useState(0)
    const [isTraining, setIsTraining] = useState(false)
    
    // Simulation state
    const [points, setPoints] = useState([])
    const requestRef = useRef()

    // Generate Data
    useEffect(() => {
        const pts = []
        // Generate a spiral or two curves
        for(let i=0; i<dataSize; i++) {
             // Class 0: Inner Spiral
             const angle = (i / dataSize) * Math.PI * 4
             const r = 5 + (i/dataSize) * 30
             const x0 = 50 + r * Math.cos(angle)
             const y0 = 50 + r * Math.sin(angle)
             
             // Class 1: Outer Spiral
             const x1 = 50 + (r+20) * Math.cos(angle + Math.PI)
             const y1 = 50 + (r+20) * Math.sin(angle + Math.PI)
             
             // Add Noise
             const n = (val) => val + (Math.random() - 0.5) * noise
             
             pts.push({ x: n(x0), y: n(y0), label: 0 })
             pts.push({ x: n(x1), y: n(y1), label: 1 })
        }
        setPoints(pts)
        setTrainingStep(0)
    }, [dataSize, noise])

    // Training Animation Loop
    const animate = (time) => {
        if(trainingStep < 100) {
            setTrainingStep(prev => prev + 0.5)
            requestRef.current = requestAnimationFrame(animate)
        } else {
            setIsTraining(false)
        }
    }

    const startTraining = () => {
        setTrainingStep(0)
        setIsTraining(true)
        requestRef.current = requestAnimationFrame(animate)
    }

    // Render Canvas
    useEffect(() => {
        const canvas = canvasRef.current
        if(!canvas) return
        const ctx = canvas.getContext('2d')
        const w = canvas.width = 400
        const h = canvas.height = 400
        
        // Clear
        ctx.fillStyle = '#111'
        ctx.fillRect(0,0,w,h)
        ctx.clearRect(0,0,w,h)

        // 1. Draw Decision Boundary (Visualized as heatmap)
        // Heuristic: As trainingStep increases, the boundary fits the spiral better
        // We simulate this by blending a simple linear split into a spiral split
        if (trainingStep > 0) {
            const imageData = ctx.createImageData(w, h)
            const data = imageData.data
            for(let py=0; py<h; py+=4) { // Optimization
                for(let px=0; px<w; px+=4) {
                    // Normalize
                    const nx = px/w * 100
                    const ny = py/h * 100
                    
                    // Dumb Linear Model
                    let val = (nx - 50) + (ny - 50) 
                    
                    // Smart Spiral Model (The "Goal")
                    const angle = Math.atan2(ny - 50, nx - 50)
                    const dist = Math.sqrt(Math.pow(nx-50, 2) + Math.pow(ny-50, 2))
                    const spiralVal = Math.sin(dist * 0.1 + angle * 2) 

                    // Blend based on training progress
                    // 0% -> Linear
                    // 100% -> Spiral
                    const progress = trainingStep / 100
                    const finalVal = val * (1-progress) + spiralVal * 50 * progress
                    
                    if (finalVal > 0) {
                        // Blue region
                         const i = (py * w + px) * 4
                         data[i] = 59; data[i+1] = 130; data[i+2] = 246; data[i+3] = 40 // Blue
                         // Fill 4x4 block for speed
                         for(let dy=0; dy<4; dy++) for(let dx=0; dx<4; dx++) {
                             const idx = ((py+dy)*w + (px+dx))*4
                             data[idx] = 59; data[idx+1] = 130; data[idx+2] = 246; data[idx+3] = 40
                         }
                    } else {
                        // Red region
                         const i = (py * w + px) * 4
                         data[i] = 239; data[i+1] = 68; data[i+2] = 68; data[i+3] = 40 // Red
                          for(let dy=0; dy<4; dy++) for(let dx=0; dx<4; dx++) {
                             const idx = ((py+dy)*w + (px+dx))*4
                             data[idx] = 239; data[idx+1] = 68; data[idx+2] = 68; data[idx+3] = 40
                         }
                    }
                }
            }
            ctx.putImageData(imageData, 0, 0)
        }

        // 2. Draw Points
        points.forEach(p => {
             const cx = (p.x / 100) * w
             const cy = (p.y / 100) * h
             ctx.beginPath()
             ctx.arc(cx, cy, 3, 0, Math.PI*2)
             ctx.fillStyle = p.label === 0 ? '#ef4444' : '#3b82f6'
             ctx.fill()
             ctx.strokeStyle = 'white'
             ctx.stroke()
        })
        
    }, [points, trainingStep])

    return (
        <PageWrapper>
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-white max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row gap-12 items-center w-full">
                    {/* Visualizer */}
                    <div className="w-full md:w-1/2 aspect-square bg-black rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative">
                        <canvas ref={canvasRef} className="w-full h-full object-cover" />
                        <div className="absolute top-4 right-4 bg-black/60 px-3 py-1 rounded-full font-mono text-xs border border-white/10">
                            EPOCH: {Math.floor(trainingStep)}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="w-full md:w-1/2 space-y-8">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Neural Playground</h1>
                            <p className="text-gray-400">
                                Tweak the parameters to see how model complexity affects learning.
                            </p>
                        </div>

                        <div className="space-y-6 bg-white/5 p-6 rounded-2xl border border-white/10">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-cyan-400 font-bold">Data Noise</span>
                                    <span>{noise}%</span>
                                </div>
                                <input type="range" min="0" max="50" value={noise} onChange={(e) => setNoise(parseInt(e.target.value))} className="w-full accent-cyan-500 bg-gray-700 h-2 rounded-lg appearance-none" />
                            </div>
                            
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-purple-400 font-bold">Dataset Size</span>
                                    <span>{dataSize * 2} points</span>
                                </div>
                                <input type="range" min="10" max="200" value={dataSize} onChange={(e) => setDataSize(parseInt(e.target.value))} className="w-full accent-purple-500 bg-gray-700 h-2 rounded-lg appearance-none" />
                            </div>
                        </div>

                        <div className="flex gap-4">
                             <Button onClick={startTraining} size="xl" className="flex-1" disabled={isTraining}>
                                {isTraining ? "Training..." : "Start Training Session"}
                            </Button>
                            
                            <Button onClick={() => navigate('/')} size="xl" variant="secondary">
                                Exit
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </PageWrapper>
    )
}

export default TrainMiniAI
