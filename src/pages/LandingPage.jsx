import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import ParticleBackground from '../components/ui/ParticleBackground'

const LandingPage = () => {
    const navigate = useNavigate()

    return (
        <div className="relative min-h-screen bg-black overflow-hidden flex flex-col items-center justify-center">
            {/* Background Layer */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-mesh opacity-50" />
                <div className="absolute inset-0 bg-grid animate-grid opacity-20" />
                <ParticleBackground />
            </div>

            {/* Content Layer */}
            <main className="relative z-10 w-full max-w-7xl px-6 py-20 flex flex-col items-center text-center">
                {/* Top Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-12"
                >
                    <span className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase">
                        Live Interactive Experience
                    </span>
                </motion.div>

                {/* Hero Title */}
                <div className="relative mb-8">
                    <motion.h1
                        initial={{ opacity: 0, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, filter: 'blur(0px)' }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="display-large text-white tracking-tighter"
                    >
                        REVERSE <br />
                        <span className="text-accent">ENGINEERING</span>
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="mt-2 text-3xl md:text-5xl font-light tracking-tight text-white/60"
                    >
                        AI INTELLIGENCE
                    </motion.div>
                </div>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1.2 }}
                    className="max-w-2xl text-lg md:text-xl text-white/40 mb-16 leading-relaxed font-light"
                >
                    “Before machines learned patterns, you did.”
                    <br />
                    Explore the architecture of thought.
                </motion.p>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.5 }}
                >
                    <Button
                        size="xl"
                        onClick={() => navigate('/experiment/1')}
                        className="relative group"
                    >
                        START EXPERIMENT 01
                        <div className="absolute inset-0 bg-white group-hover:blur-xl opacity-0 group-hover:opacity-20 transition-all duration-500 rounded-full" />
                    </Button>
                </motion.div>

                {/* Footer Metrics */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 2 }}
                    className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-white/5 pt-12"
                >
                    {[
                        { label: 'SUPERVISED', value: 'PATTERN' },
                        { label: 'UNSUPERVISED', value: 'STRUCTURE' },
                        { label: 'ATTENTION', value: 'CONTEXT' },
                        { label: 'GENERATIVE', value: 'DIFFUSION' }
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-start gap-1">
                            <span className="text-[10px] font-bold text-white/20 tracking-widest uppercase">{item.label}</span>
                            <span className="text-sm font-medium text-white/60 tracking-tight">{item.value}</span>
                        </div>
                    ))}
                </motion.div>
            </main>

            {/* Decorative side text */}
            <div className="fixed left-8 bottom-8 z-20 hidden lg:block">
                <div className="flex items-center gap-4 origin-left -rotate-90">
                    <div className="w-12 h-[1px] bg-white/20" />
                    <span className="text-[10px] font-medium text-white/20 tracking-[0.3em] uppercase">Architecture of intelligence</span>
                </div>
            </div>
        </div>
    )
}

export default LandingPage
