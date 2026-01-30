import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageWrapper from '../components/layout/PageWrapper'
import Button from '../components/ui/Button'
import useGameStore from '../stores/gameStore'

const CHECKLIST = [
    { id: 'pattern', label: "Pattern Extraction", desc: "Prediction is just finding the function.", completed: true },
    { id: 'error', label: "Error Minimization", desc: "Learning is reducing the distance to truth.", completed: true },
    { id: 'structure', label: "Structure Discovery", desc: "Intelligence creates order from chaos.", completed: true },
    { id: 'context', label: "Context Weighting", desc: "Meaning depends on relationships.", completed: true },
    { id: 'noise', label: "Noise Removal", desc: "Creativity is controlled randomness.", completed: true },
]

const TheReflection = () => {
    const navigate = useNavigate()
    
    return (
        <PageWrapper>
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-white max-w-4xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ duration: 1 }}
                    className="w-full"
                >
                    <h1 className="text-5xl md:text-6xl font-bold mb-12 text-center">
                        Reverse Engineering <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Intelligence</span>
                    </h1>

                    <div className="space-y-4 mb-16">
                        {CHECKLIST.map((item, i) => (
                            <motion.div 
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.2 }}
                                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-lg">
                                    ✓
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl">{item.label}</h3>
                                    <p className="text-gray-400">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        transition={{ delay: 2 }}
                        className="text-center"
                    >
                        <p className="text-3xl md:text-4xl font-light italic text-gray-200 mb-12 leading-relaxed">
                            "AI is not intelligent like us — <br/>
                            it is intelligent <span className="font-bold text-white">because of us</span>."
                        </p>

                        <Button onClick={() => navigate('/bonus')} size="xl" className="shadow-2xl shadow-purple-500/20">
                            Bonus: Train Your Own Mini-AI →
                        </Button>
                    </motion.div>
                </motion.div>
            </div>
        </PageWrapper>
    )
}

export default TheReflection
