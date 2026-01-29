import { motion } from 'framer-motion'

const Button = ({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    ...props
}) => {
    const baseStyles = "relative inline-flex items-center justify-center font-bold transition-all duration-300 rounded-full overflow-hidden group"

    const variants = {
        primary: "bg-white text-black hover:bg-opacity-90",
        outline: "bg-transparent border-2 border-white/20 text-white hover:border-white/50",
        ghost: "bg-white/5 text-white hover:bg-white/10"
    }

    const sizes = {
        sm: "px-6 py-2 text-sm",
        md: "px-8 py-3 text-base",
        lg: "px-10 py-4 text-lg",
        xl: "px-12 py-5 text-xl"
    }

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Content */}
            <span className="relative z-10 flex items-center gap-2">
                {children}
            </span>

            {/* Animated Border Beam (Optional style) */}
            {variant === 'primary' && (
                <div className="absolute inset-0 rounded-full border border-white/20 pointer-events-none" />
            )}
        </motion.button>
    )
}

export default Button
