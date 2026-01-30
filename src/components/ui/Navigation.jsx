import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Button from './Button'

const MENU_ITEMS = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/experiment/1', label: 'Pattern Predictor', icon: '🔮' },
    { path: '/experiment/2', label: 'Fix The Model', icon: '🔧' },
    { path: '/experiment/3', label: 'Group The Data', icon: '🔴' },
    { path: '/experiment/4', label: 'Context Switch', icon: '📝' },
    { path: '/experiment/5', label: 'Attention', icon: '🔦' },
    { path: '/experiment/6', label: 'Diffusion', icon: '🌫️' },
    { path: '/reflection', label: 'Reflection', icon: '🧠' },
    { path: '/bonus', label: 'Neural Playground', icon: '🎮' },
]

const Navigation = () => {
    const [isOpen, setIsOpen] = useState(false)
    const location = useLocation()

    return (
        <>
            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed top-6 right-6 z-50 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all hover:scale-105 active:scale-95 shadow-lg group"
            >
                <div className="space-y-1.5 p-3">
                    <span className="block w-5 h-0.5 bg-white group-hover:w-6 transition-all" />
                    <span className="block w-4 h-0.5 bg-white group-hover:w-6 transition-all ml-auto" />
                    <span className="block w-3 h-0.5 bg-white group-hover:w-6 transition-all ml-auto" />
                </div>
            </button>

            {/* Menu overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-80 bg-gray-900 border-l border-white/10 z-50 p-6 shadow-2xl overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <h2 className="text-xl font-bold font-mono tracking-widest text-cyan-400">MISSION LOG</h2>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 text-white/50 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>

                            <nav className="space-y-4">
                                {MENU_ITEMS.map((item) => {
                                    const isActive = location.pathname === item.path
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setIsOpen(false)}
                                            className={`block p-4 rounded-xl border transition-all duration-300 flex items-center gap-4 group
                                                ${isActive 
                                                    ? 'bg-cyan-900/40 border-cyan-500/50 text-white' 
                                                    : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/10'
                                                }
                                            `}
                                        >
                                            <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                                            <span className="font-medium text-sm">{item.label}</span>
                                        </Link>
                                    )
                                })}
                            </nav>

                            <div className="mt-12 pt-8 border-t border-white/10 text-center">
                                <p className="text-xs text-gray-600 font-mono">
                                    ML SEMINAR v1.0
                                    <br/>
                                    SYSTEM READY
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}

export default Navigation
