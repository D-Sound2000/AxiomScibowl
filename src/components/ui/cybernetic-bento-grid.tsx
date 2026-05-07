import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

type BentoItemProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode
}

type CyberneticBentoGridProps = {
  children?: React.ReactNode
  className?: string
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 22, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.55, ease: [0, 0, 0.2, 1] },
  },
}

export function BentoItem({ className = '', children, ...props }: BentoItemProps) {
  const itemRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const item = itemRef.current
    if (!item) return undefined

    const handleMouseMove = (event: MouseEvent) => {
      const rect = item.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      item.style.setProperty('--mouse-x', `${x}px`)
      item.style.setProperty('--mouse-y', `${y}px`)
    }

    item.addEventListener('mousemove', handleMouseMove)

    return () => {
      item.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <motion.div
      ref={itemRef}
      variants={itemVariants}
      className={`bento-item ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function CyberneticBentoGrid({ children, className = '' }: CyberneticBentoGridProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`main-container ${className}`}
    >
      <div className="w-full max-w-6xl z-10">
        {!children && (
          <h1 className="text-4xl sm:text-5xl font-bold text-white text-center mb-8">
            Core Features
          </h1>
        )}
        <div className="bento-grid cybernetic-grid">
          {children || (
            <>
              <BentoItem className="feature-bento-primary">
                <div>
                  <h2 className="text-2xl font-bold text-white">Real-time Analytics</h2>
                  <p className="mt-2 text-gray-400">
                    Monitor your application's performance with up-to-the-second data streams and visualizations.
                  </p>
                </div>
                <div className="feature-bento-chart">
                  Chart Placeholder
                </div>
              </BentoItem>
              <BentoItem>
                <h2 className="text-xl font-bold text-white">Global CDN</h2>
                <p className="mt-2 text-gray-400 text-sm">
                  Deliver content at lightning speed, no matter where your users are.
                </p>
              </BentoItem>
              <BentoItem>
                <h2 className="text-xl font-bold text-white">Secure Auth</h2>
                <p className="mt-2 text-gray-400 text-sm">
                  Enterprise-grade authentication and user management built-in.
                </p>
              </BentoItem>
              <BentoItem className="feature-bento-tall">
                <h2 className="text-xl font-bold text-white">Automated Backups</h2>
                <p className="mt-2 text-gray-400 text-sm">
                  Your data is always safe with automated, redundant backups.
                </p>
              </BentoItem>
              <BentoItem className="feature-bento-wide">
                <h2 className="text-xl font-bold text-white">Serverless Functions</h2>
                <p className="mt-2 text-gray-400 text-sm">
                  Run your backend code without managing servers. Scale infinitely with ease.
                </p>
              </BentoItem>
              <BentoItem>
                <h2 className="text-xl font-bold text-white">CLI Tool</h2>
                <p className="mt-2 text-gray-400 text-sm">
                  Manage your entire infrastructure from the command line.
                </p>
              </BentoItem>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
