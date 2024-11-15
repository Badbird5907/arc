'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export default function AnimatedCheckMark({ className }: { className?: string }) {
  const circleVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 0.8, ease: "easeInOut" },
        opacity: { duration: 0.01 }
      }
    }
  }

  const checkVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 0.6, ease: "easeInOut", delay: 0.2 },
        opacity: { duration: 0.01 }
      }
    }
  }

  return (
    <div className={cn("bg-background p-4 rounded-full", className)}>
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width="96"
        height="96"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial="hidden"
        animate="visible"
        className={className}
      >
        <motion.path
          d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
          variants={circleVariants}
        />
        <motion.path
          d="M8 12l3 3 5-5"
          variants={checkVariants}
        />
      </motion.svg>
    </div>
  )
}