import { motion } from 'framer-motion'
import Button from './Button'

const GameFeedback = ({ 
    isOpen, 
    isSuccess = true, 
    gifUrl, 
    title, 
    description, 
    explanation, 
    onNext, 
    nextLabel = "Next Level" 
}) => {
    if (!isOpen) return null

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
            <div className="bg-gray-900 border border-white/20 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative">
                {/* Header Image/GIF */}
                <div className="h-64 w-full bg-black relative">
                    <img 
                        src={gifUrl || (isSuccess ? "https://media.giphy.com/media/11ISwbgCxEzMyY/giphy.gif" : "https://media.giphy.com/media/8L0Pky6C83SzkzU55a/giphy.gif")} 
                        alt="Reaction" 
                        className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
                    
                    <div className="absolute bottom-4 left-6">
                        <h2 className={`text-3xl font-bold ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>
                            {title || (isSuccess ? "Nailed It!" : "Oof, Close!")}
                        </h2>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div>
                        <p className="text-xl font-medium text-white mb-2">{description}</p>
                        <div className="p-4 bg-white/5 rounded-xl border-l-4 border-cyan-500">
                            <h4 className="text-xs font-mono text-cyan-400 uppercase mb-1">Concept Explained</h4>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                {explanation}
                            </p>
                        </div>
                    </div>

                    <Button onClick={onNext} size="lg" className="w-full">
                        {nextLabel} →
                    </Button>
                </div>
            </div>
        </motion.div>
    )
}

export default GameFeedback
