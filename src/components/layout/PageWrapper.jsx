import { motion, AnimatePresence } from 'framer-motion'
import ParticleBackground from '../ui/ParticleBackground'

const PageWrapper = ({ children, className = '' }) => {
    return (
        <>
            {/* Background Layer (reusing the one from LandingPage concept or standard) */}
            <div className="fixed inset-0 z-0 bg-black">
                <div className="absolute inset-0 bg-mesh opacity-50" />
                <div className="absolute inset-0 bg-grid animate-grid opacity-20" />
                <ParticleBackground />
            </div>

            {/* Main content */}
            <AnimatePresence mode="wait">
                <motion.main
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`relative z-10 min-h-screen ${className}`}
                >
                    {children}
                </motion.main>
            </AnimatePresence>
        </>
    )
}

export default PageWrapper
