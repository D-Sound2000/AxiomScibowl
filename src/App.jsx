import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from './hooks/useTheme.js'
import { usePointerVelocity } from './hooks/usePointerVelocity.js'
import Header from './components/Header.jsx'
import { Component as Hero } from './components/ui/hero-section.jsx'
import TrainingView from './components/TrainingView.jsx'
import GameView from './components/GameView.jsx'
import CustomCursor from './components/CustomCursor.jsx'

export default function App() {
  const { theme, toggle } = useTheme()
  const { velocity, position } = usePointerVelocity()
  const [view, setView] = useState('home')

  return (
    <>
      <CustomCursor />
      <AnimatePresence mode="wait">
        {view === 'home' ? (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97, filter: 'blur(4px)' }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
          >
            <Header theme={theme} onToggleTheme={toggle} />
            <main>
              <Hero onEnter={() => setView('training')} onPlay={() => setView('game')} />
            </main>
          </motion.div>
        ) : view === 'training' ? (
          <motion.div
            key="training"
            initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
            transition={{ duration: 0.38, ease: [0, 0, 0.2, 1] }}
          >
            <TrainingView onBack={() => setView('home')} theme={theme} />
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
            transition={{ duration: 0.38, ease: [0, 0, 0.2, 1] }}
          >
            <GameView onBack={() => setView('home')} onTraining={() => setView('training')} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
