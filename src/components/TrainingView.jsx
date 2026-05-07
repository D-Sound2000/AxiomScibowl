import { useEffect, useMemo, useState } from 'react'
import PracticeDeck from './PracticeDeck.jsx'
import ResultsDashboard from './ResultsDashboard.jsx'
import { BentoItem, CyberneticBentoGrid } from './ui/cybernetic-bento-grid.tsx'
import questionsData from '../fixtures/scibowl_questions.json'
import {
  CAT_ABBR,
  CATEGORIES,
  PRACTICE_SUBSETS,
  enrichQuestionsWithSubsets,
} from '../utils/questionSubsets.js'

const TYPE_OPTIONS = ['All', 'Tossup', 'Bonus']
const FORMAT_OPTIONS = ['All', 'Multiple Choice', 'Short Answer']
const DECK_LIMIT = 500
const TOTAL_QUESTIONS = questionsData.questions.length

function seededShuffle(items, seed) {
  if (!seed) return items
  return [...items]
    .map((item, index) => {
      const value = Math.sin((index + 1) * 9301 + seed * 49297) * 10000
      return { item, sort: value - Math.floor(value) }
    })
    .sort((a, b) => a.sort - b.sort)
    .map(entry => entry.item)
}

function getSubsetCounts(questions) {
  const counts = {}
  questions.forEach(question => {
    counts[question.subsetId] = (counts[question.subsetId] || 0) + 1
  })
  return counts
}

export default function TrainingView({ onBack }) {
  const allQuestions = useMemo(() => enrichQuestionsWithSubsets(questionsData.questions), [])
  const [category, setCategory] = useState('All')
  const [type, setType] = useState('All')
  const [format, setFormat] = useState('All')
  const [subset, setSubset] = useState('All')
  const [index, setIndex] = useState(0)
  const [shuffleSeed, setShuffleSeed] = useState(0)
  const [pendingQuestionId, setPendingQuestionId] = useState(null)

  const baseDeck = useMemo(() => {
    return allQuestions.filter(question => {
      const matchCategory = category === 'All' || question.category === category
      const matchType = type === 'All' || question.type === type
      const matchFormat = format === 'All' || question.format === format
      return matchCategory && matchType && matchFormat
    })
  }, [allQuestions, category, type, format])

  const subsetCounts = useMemo(() => getSubsetCounts(baseDeck), [baseDeck])
  const visibleSubsets = useMemo(() => {
    return PRACTICE_SUBSETS
      .filter(item => category === 'All' || item.category === category)
      .map(item => ({ ...item, count: subsetCounts[item.id] || 0 }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
  }, [category, subsetCounts])

  const filteredDeck = useMemo(() => {
    const deck = subset === 'All'
      ? baseDeck
      : baseDeck.filter(question => question.subsetId === subset)
    return seededShuffle(deck, shuffleSeed).slice(0, DECK_LIMIT)
  }, [baseDeck, subset, shuffleSeed])

  const activeQuestion = filteredDeck[index] || null

  useEffect(() => {
    setIndex(0)
  }, [category, type, format, subset, shuffleSeed])

  useEffect(() => {
    if (index >= filteredDeck.length) {
      setIndex(0)
    }
  }, [filteredDeck.length, index])

  useEffect(() => {
    if (!pendingQuestionId) return
    const nextIndex = filteredDeck.findIndex(question => question.id === pendingQuestionId)
    if (nextIndex >= 0) {
      setIndex(nextIndex)
      setPendingQuestionId(null)
    }
  }, [filteredDeck, pendingQuestionId])

  const resetDeck = () => {
    setCategory('All')
    setType('All')
    setFormat('All')
    setSubset('All')
    setShuffleSeed(0)
    setIndex(0)
  }

  const jumpToQuestion = (question) => {
    const enriched = allQuestions.find(item => item.id === question.id) || question
    setCategory(enriched.category)
    setType(enriched.type)
    setFormat(enriched.format)
    setSubset(enriched.subsetId || 'All')
    setPendingQuestionId(enriched.id)
  }

  const deckTitle = subset === 'All'
    ? category === 'All' ? 'All Science Bowl' : `${category} Review`
    : visibleSubsets.find(item => item.id === subset)?.label || 'Custom Deck'
  const deckKey = `${category}|${type}|${format}|${subset}|${shuffleSeed}`

  return (
    <div className="training-bg">
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.032) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <header className="training-top-bar">
        <button className="training-back-btn" onClick={onBack} aria-label="Back to home">
          AXIOM
        </button>

        <span
          className="font-mono"
          style={{ fontSize: 12, letterSpacing: '4px', color: 'rgba(244,239,229,0.72)' }}
        >
          FLASHCARD TRAINING
        </span>

        <div className="training-status-pill">
          <span
            className="training-status-dot"
            style={{ background: activeQuestion ? '#d8c6a0' : 'rgba(216,198,160,0.56)' }}
          />
          <span
            className="font-mono"
            style={{ fontSize: 11, letterSpacing: '2px', color: 'rgba(244,239,229,0.76)' }}
          >
            {filteredDeck.length ? `${filteredDeck.length} CARD DECK` : 'NO DECK'}
          </span>
        </div>
      </header>

      <CyberneticBentoGrid className="training-practice">
        <BentoItem className="training-bento-setup">
          <div className="panel-heading">
            <span className="font-mono">BUILD A DECK</span>
            <strong>{deckTitle}</strong>
          </div>

          <div className="filter-group">
            <span className="filter-label">Topic</span>
            <div className="segmented-wrap">
              {['All', ...CATEGORIES].map(option => (
                <button
                  key={option}
                  className={category === option ? 'is-active' : ''}
                  onClick={() => { setCategory(option); setSubset('All') }}
                >
                  {option === 'All' ? 'All' : CAT_ABBR[option]}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-row">
            <div className="filter-group">
              <span className="filter-label">Question Type</span>
              <div className="segmented-wrap">
                {TYPE_OPTIONS.map(option => (
                  <button
                    key={option}
                    className={type === option ? 'is-active' : ''}
                    onClick={() => setType(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <span className="filter-label">Answer Format</span>
              <div className="segmented-wrap">
                {FORMAT_OPTIONS.map(option => (
                  <button
                    key={option}
                    className={format === option ? 'is-active' : ''}
                    onClick={() => setFormat(option)}
                  >
                    {option === 'Multiple Choice' ? 'MCQ' : option === 'Short Answer' ? 'Short' : 'All'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="deck-actions">
            <button className="axiom-button-secondary" onClick={() => setShuffleSeed(Date.now())}>Shuffle Deck</button>
            <button className="axiom-button-secondary" onClick={resetDeck}>Reset</button>
          </div>
        </BentoItem>

        <BentoItem className="training-bento-deck">
          <PracticeDeck
            deck={filteredDeck}
            index={index}
            onIndexChange={setIndex}
            onResetFilters={resetDeck}
            deckKey={deckKey}
          />
        </BentoItem>

        <BentoItem className="training-bento-subsets">
          <div className="panel-heading compact">
            <span className="font-mono">PRACTICE SUBSETS</span>
            <strong>{visibleSubsets.length}</strong>
          </div>
          <div className="subset-list">
            <button
              className={subset === 'All' ? 'subset-chip is-active' : 'subset-chip'}
              onClick={() => setSubset('All')}
            >
              <span>All matching cards</span>
              <b>{baseDeck.length}</b>
            </button>
            {visibleSubsets.slice(0, 30).map(item => (
              <button
                key={item.id}
                className={subset === item.id ? 'subset-chip is-active' : 'subset-chip'}
                onClick={() => setSubset(item.id)}
              >
                <span>{item.label}</span>
                <b>{item.count}</b>
              </button>
            ))}
          </div>
        </BentoItem>

        <BentoItem className="training-bento-progress">
          <div>
            <div className="stat-number">{TOTAL_QUESTIONS.toLocaleString()}</div>
            <div className="stat-label">Questions Loaded</div>
          </div>
          <div>
            <div className="stat-number">{filteredDeck.length.toLocaleString()}</div>
            <div className="stat-label">Active Deck</div>
          </div>
        </BentoItem>

        <BentoItem className="training-bento-queue">
          <div className="panel-heading compact">
            <span className="font-mono">UP NEXT</span>
            <strong>{activeQuestion ? `${index + 1}/${filteredDeck.length}` : '-'}</strong>
          </div>
          <div className="queue-list">
            {filteredDeck.slice(index, index + 5).map((question, offset) => (
              <button
                key={question.id}
                className={offset === 0 ? 'queue-item is-active' : 'queue-item'}
                onClick={() => setIndex(index + offset)}
              >
                <span>{question.subsetLabel}</span>
                <p>{question.question}</p>
              </button>
            ))}
          </div>
        </BentoItem>

        <BentoItem className="training-bento-analysis">
          <div style={{ padding: 'var(--gap-lg)', height: '100%', boxSizing: 'border-box', overflowY: 'auto' }}>
            <ResultsDashboard onDrillQuestion={jumpToQuestion} />
          </div>
        </BentoItem>
      </CyberneticBentoGrid>
    </div>
  )
}
