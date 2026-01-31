import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageWrapper from '../components/layout/PageWrapper'
import Button from '../components/ui/Button'
import confetti from 'canvas-confetti'
import { useEffect } from 'react'

const CHECKLIST = [
    { id: 'pattern', label: "1. The Neuron", desc: "Inputs + Weights + Bias = Reaction (Spicy Food)", icon: "🌶️" },
    { id: 'error', label: "2. The Learning", desc: "Gradient Descent is just hiking down a mountain.", icon: "📉" },
    { id: 'data', label: "3. The Data", desc: "Normalization helps us compare apples to apples.", icon: "📊" },
    { id: 'context', label: "4. The Context", desc: "Transformers don't forget the past.", icon: "🧠" },
    { id: 'attention', label: "5. The Attention", desc: "Focusing on what matters (The Spotlight).", icon: "🔦" },
    { id: 'creativity', label: "6. The Creativity", desc: "Diffusion is sculpting art from random noise.", icon: "🎨" },
    { id: 'arch', label: "7. The Architecture", desc: "You are now a Certified AI Engineer.", icon: "🏗️" },
]

const TheReflection = () => {
    const navigate = useNavigate()

    useEffect(() => {
        const timer = setTimeout(() => {
            confetti({
                particleCount: 200,
                spread: 160,
                origin: { y: 0.6 },
                colors: ['#a855f7', '#06b6d4', '#ec4899']
            })
        }, 1000)
        return () => clearTimeout(timer)
    }, [])

    return (
        <PageWrapper>
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-white max-w-5xl mx-auto py-20">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="w-full text-center"
                >
                    <div className="text-sm font-mono text-gray-500 mb-4 tracking-widest uppercase">Seminar Complete</div>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6">
                        The Black Box <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-500">
                            Is Now Open.
                        </span>
                    </h1>

                    <p className="text-xl text-gray-400 mb-16 max-w-2xl mx-auto leading-relaxed">
                        You started with simple dots and ended by architecting a Generative AI.
                        The "Magic" of AI is just math, engineered by people like you.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16 text-left max-w-4xl mx-auto">
                        {CHECKLIST.map((item, i) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.15 }}
                                className={`flex items-center gap-4 p-4 rounded-2xl border border-white/5 hover:bg-white/5 transition-all
                                    ${i === 6 ? 'md:col-span-2 bg-gradient-to-r from-purple-900/20 to-cyan-900/20 border-purple-500/30' : 'bg-black/20'}
                                `}
                            >
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl shadow-lg">
                                    {item.icon}
                                </div>
                                <div>
                                    <h3 className={`font-bold text-lg ${i === 6 ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400' : 'text-gray-200'}`}>
                                        {item.label}
                                    </h3>
                                    <p className="text-sm text-gray-500">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.5 }}
                        className="space-y-8"
                    >
                        <div className="p-8 bg-white/5 rounded-3xl border border-white/10 max-w-2xl mx-auto backdrop-blur-sm">
                            <p className="text-2xl font-light italic text-gray-200 leading-relaxed">
                                "The best way to predict the future is to <span className="font-bold text-white border-b-2 border-purple-500">build it</span>."
                            </p>
                        </div>

                        <div className="flex justify-center gap-4">
                            <Button onClick={() => navigate('/')} size="xl" className="bg-transparent border border-white/20 hover:bg-white/10">
                                🏠 Return Home
                            </Button>
                            <Button onClick={() => window.open('https://github.com/DipeshMajithia/ml_seminar', '_blank')} size="xl" className="shadow-2xl shadow-cyan-500/20 bg-gradient-to-r from-cyan-600 to-blue-600">
                                ⭐ Star project on GitHub
                            </Button>
                        </div>
                    </motion.div>

                    <div className="mt-24 text-gray-600 text-sm font-mono">
                        Engineered with ❤️ for the Seminar
                    </div>
                </motion.div>
            </div>
        </PageWrapper>
    )
}

export default TheReflection
