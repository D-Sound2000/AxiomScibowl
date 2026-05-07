import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LiquidButton } from './ui/liquid-glass-button.tsx'
import { CAT_ABBR } from '../utils/questionSubsets.js'

export default function PracticeDeck({ deck, index, onIndexChange }) {
  const [flipped, setFlipped] = useState(false)
  const question = deck[index] || null
  const total = deck.length
  const progress = total > 0 ? ((index + 1) / total) * 100 : 0

  useEffect(() => {
    setFlipped(false)
  }, [question?.id])

  const goPrevious = () => {
    if (!total) return
    onIndexChange((index - 1 + total) % total)
  }

  const goNext = () => {
    if (!total) return
    onIndexChange((index + 1) % total)
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target instanceof HTMLInputElement) return
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        goNext()
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goPrevious()
      }
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
        setFlipped(value => !value)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [index, total])

  if (!question) {
    return (
      <div className="practice-empty">
        <span className="font-mono">NO MATCHING CARDS</span>
        <p>Adjust the deck filters or pick another subset.</p>
      </div>
    )
  }

  return (
    <section className="practice-deck" aria-label="Flashcard practice deck">
      <div className="practice-deck-top">
        <div className="practice-card-tags">
          <span>{CAT_ABBR[question.category] || question.category}</span>
          <span>{question.type}</span>
          <span>{question.format === 'Multiple Choice' ? 'MCQ' : 'Short Answer'}</span>
          <span>{question.subsetLabel}</span>
        </div>
        <span className="font-mono practice-count">
          {String(index + 1).padStart(3, '0')} / {total}
        </span>
      </div>

      <button className="practice-card" onClick={() => setFlipped(value => !value)}>
        <AnimatePresence mode="wait">
          {!flipped ? (
            <motion.div
              key="front"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18 }}
              className="practice-face"
            >
              <span className="font-mono practice-face-label">QUESTION</span>
              <p>{question.question}</p>
            </motion.div>
          ) : (
            <motion.div
              key="back"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18 }}
              className="practice-face practice-answer"
            >
              <span className="font-mono practice-face-label">ANSWER</span>
              <p>{question.answer}</p>
              <div className="practice-keywords">
                {(question.keywords || []).slice(0, 5).map(keyword => (
                  <span key={keyword}>{keyword.toUpperCase()}</span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <div className="practice-progress" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="practice-actions">
        <LiquidButton size="lg" onClick={goPrevious} aria-label="Previous flashcard">
          ← Previous
        </LiquidButton>
        <LiquidButton size="xl" className="practice-flip-btn" onClick={() => setFlipped(value => !value)}>
          {flipped ? 'Show Question' : 'Reveal Answer'}
        </LiquidButton>
        <LiquidButton size="lg" onClick={goNext} aria-label="Next flashcard">
          Next →
        </LiquidButton>
      </div>
    </section>
  )
}
