import { motion } from 'framer-motion'

const Card = ({
    children,
    className = '',
    hover = true,
    glow = false,
    glowColor = 'cyan',
    padding = 'md',
    ...props
}) => {
    const baseStyles = `
    relative
    bg-white/[0.03]
    backdrop-blur-xl
    border border-white/10
    rounded-2xl
    overflow-hidden
  `

    const paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10'
    }

    const glowColors = {
        cyan: 'shadow-cyan-500/20 hover:shadow-cyan-500/40',
        purple: 'shadow-purple-500/20 hover:shadow-purple-500/40',
        mixed: 'shadow-[0_0_30px_rgba(6,182,212,0.2),0_0_30px_rgba(168,85,247,0.2)]'
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={hover ? {
                y: -4,
                transition: { duration: 0.2 }
            } : {}}
            className={`
        ${baseStyles} 
        ${paddings[padding]}
        ${glow ? `shadow-2xl ${glowColors[glowColor]}` : ''}
        ${hover ? 'transition-shadow duration-300' : ''}
        ${className}
      `}
            {...props}
        >
            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    )
}

export default Card
