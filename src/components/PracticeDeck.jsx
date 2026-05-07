import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LiquidButton } from './ui/liquid-glass-button.tsx'
import { CAT_ABBR } from '../utils/questionSubsets.js'

export default function PracticeDeck({ deck, index, onIndexChange, onResetFilters, deckKey }) {
  const [revealed, setRevealed] = useState(false)
  const [stats, setStats] = useState({ seen: 0, gotIt: 0, missed: 0 })
  const [seenIds, setSeenIds] = useState(new Set())
  const [ratedIds, setRatedIds] = useState(new Set())
  const question = deck[index] || null
  const total = deck.length
  const progress = total > 0 ? ((index + 1) / total) * 100 : 0
  const activeDeckKey = useMemo(() => deckKey || deck.map(item => item.id).join('|'), [deck, deckKey])

  useEffect(() => {
    setRevealed(false)
  }, [question?.id])

  useEffect(() => {
    setRevealed(false)
    setStats({ seen: 0, gotIt: 0, missed: 0 })
    setSeenIds(new Set())
    setRatedIds(new Set())
  }, [activeDeckKey])

  const goPrevious = () => {
    if (!total) return
    onIndexChange((index - 1 + total) % total)
  }

  const goNext = () => {
    if (!total) return
    onIndexChange((index + 1) % total)
  }

  const revealAnswer = () => {
    if (!question) return
    setRevealed(true)
    setSeenIds(prev => {
      if (prev.has(question.id)) return prev
      const next = new Set(prev)
      next.add(question.id)
      setStats(value => ({ ...value, seen: value.seen + 1 }))
      return next
    })
  }

  const markCard = (outcome) => {
    if (!question) return
    setRevealed(true)
    setRatedIds(prev => {
      if (prev.has(question.id)) return prev
      const next = new Set(prev)
      next.add(question.id)
      setSeenIds(seenPrev => {
        if (seenPrev.has(question.id)) return seenPrev
        const nextSeen = new Set(seenPrev)
        nextSeen.add(question.id)
        return nextSeen
      })
      setStats(value => ({
        seen: value.seen + (seenIds.has(question.id) ? 0 : 1),
        gotIt: value.gotIt + (outcome === 'gotIt' ? 1 : 0),
        missed: value.missed + (outcome === 'missed' ? 1 : 0),
      }))
      return next
    })
  }

  const markAndNext = (outcome) => {
    markCard(outcome)
    window.setTimeout(goNext, 140)
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target instanceof HTMLInputElement) return
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'n') {
        event.preventDefault()
        goNext()
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goPrevious()
      }
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
        if (revealed) {
          goNext()
        } else {
          revealAnswer()
        }
      }
      if (event.key.toLowerCase() === 'g' && revealed) {
        event.preventDefault()
        markAndNext('gotIt')
      }
      if (event.key.toLowerCase() === 'm' && revealed) {
        event.preventDefault()
        markAndNext('missed')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [index, total, revealed, question?.id, ratedIds])

  if (!question) {
    return (
      <div className="practice-empty">
        <span className="font-mono">NO MATCHING CARDS</span>
        <h3>Nothing matches this deck.</h3>
        <p>Try widening the topic, question type, format, or subset filters.</p>
        {onResetFilters && (
          <button className="axiom-button axiom-button-secondary" onClick={onResetFilters}>
            Reset Filters
          </button>
        )}
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

      <div className="practice-review-stats" aria-label="Flashcard review stats">
        <span><b>{stats.seen}</b> Seen</span>
        <span><b>{stats.gotIt}</b> Got it</span>
        <span><b>{stats.missed}</b> Missed</span>
      </div>

      <button
        className={revealed ? 'practice-card is-revealed' : 'practice-card'}
        onClick={() => revealed ? undefined : revealAnswer()}
        aria-label={revealed ? 'Flashcard answer revealed' : 'Reveal flashcard answer'}
      >
        <AnimatePresence mode="wait">
          {!revealed ? (
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

      <div className={revealed ? 'practice-actions is-reviewing' : 'practice-actions'}>
        {!revealed ? (
          <>
            <LiquidButton size="lg" className="axiom-button-secondary" onClick={goPrevious} aria-label="Previous flashcard">
              Previous
            </LiquidButton>
            <LiquidButton size="xl" className="practice-flip-btn axiom-button-primary" onClick={revealAnswer}>
              Reveal Answer
            </LiquidButton>
            <LiquidButton size="lg" className="axiom-button-secondary" onClick={goNext} aria-label="Next flashcard">
              Next
            </LiquidButton>
          </>
        ) : (
          <>
            <LiquidButton size="lg" className="axiom-button-secondary" onClick={() => markAndNext('missed')}>
              Missed it
            </LiquidButton>
            <LiquidButton size="lg" className="axiom-button-primary" onClick={() => markAndNext('gotIt')}>
              Got it
            </LiquidButton>
            <LiquidButton size="lg" className="axiom-button-secondary" onClick={goNext}>
              Next
            </LiquidButton>
          </>
        )}
      </div>
    </section>
  )
}
