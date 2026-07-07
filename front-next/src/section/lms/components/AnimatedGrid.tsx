'use client'

import { motion, Variants } from 'motion/react'
import { ReactNode } from 'react'

/** Variants para entrada escalonada (stagger) de los hijos de un grid. */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05
    }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 220, damping: 22 }
  }
}

type Props = {
  children: ReactNode
  className?: string
}

/** Grid con entrada animada en cascada. Sus hijos deben ser <AnimatedItem>. */
export function AnimatedGrid({ children, className }: Props) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial='hidden'
      animate='visible'
    >
      {children}
    </motion.div>
  )
}

/** Elemento individual dentro de un AnimatedGrid. */
export function AnimatedItem({ children, className }: Props) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  )
}
