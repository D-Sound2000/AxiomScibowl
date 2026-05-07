import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LiquidButton } from './ui/liquid-glass-button.tsx'
import questionsData from '../fixtures/scibowl_questions.json'
import {
  CAT_ABBR,
  CATEGORIES,
  PRACTICE_SUBSETS,
  enrichQuestionsWithSubsets,
} from '../utils/questionSubsets.js'

const MODES = [
  { id: 'tossup', label: 'Tossup', detail: '4 points, 10 seconds' },
  { id: 'bonus', label: 'Bonus', detail: '7 points, 25 seconds' },
  { id: 'cycle', label: 'Tossup -> Bonus', detail: 'Bonus unlocks on correct tossup' },
  { id: 'game', label: 'Game Simulation', detail: '18 tossups, balanced topics' },
]

const FORMAT_OPTIONS = ['All', 'Multiple Choice', 'Short Answer']
const TOSSUP_TIME = 10
const BONUS_TIME = 25
const DEFAULT_WPM = 220
const MIN_WPM = 80
const MAX_WPM = 420

function shuffle(items) {
  return [...items]
    .map(item => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(entry => entry.item)
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/^[wxyz]\s*\)\s*/, '')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function answerCandidates(answer) {
  const answerText = String(answer || '')
  const letter = answerText.match(/^\s*([WXYZ])\s*\)/i)?.[1]?.toLowerCase()
  const acceptMatches = [...answerText.matchAll(/\(\s*ACCEPT\s*:\s*([^)]+)\)/gi)].map(match => match[1])
  const primary = answerText.split(/\(\s*ACCEPT/i)[0]

  return [letter, primary, ...acceptMatches]
    .filter(Boolean)
    .flatMap(candidate => String(candidate).split(/\s+OR\s+|;|,/i))
    .map(normalizeText)
    .filter(Boolean)
}

function checkAnswer(userAnswer, answerline) {
  const user = normalizeText(userAnswer)
  if (!user) return false

  return answerCandidates(answerline).some(candidate => (
    user === candidate ||
    (user.length >= 4 && candidate.includes(user)) ||
    (candidate.length >= 4 && user.includes(candidate))
  ))
}

function matchingQuestions(questions, { mode, category, subset, format }) {
  return questions.filter(question => {
    if (category !== 'All' && question.category !== category) return false
    if (subset !== 'All' && question.subsetId !== subset) return false
    if (format !== 'All' && question.format !== format) return false
    if (mode === 'bonus') return question.type === 'Bonus'
    return question.type === 'Tossup'
  })
}

function buildBalancedGameDeck(questions, format) {
  const selected = CATEGORIES.flatMap(category => {
    const pool = questions.filter(question =>
      question.type === 'Tossup' &&
      question.category === category &&
      (format === 'All' || question.format === format)
    )

    return shuffle(pool).slice(0, 3)
  })

  const remaining = selected.reduce((groups, question) => {
    groups[question.category] = [...(groups[question.category] || []), question]
    return groups
  }, {})

  const ordered = []
  while (ordered.length < selected.length) {
    const previous = ordered[ordered.length - 1]
    const nextCategory = Object.entries(remaining)
      .filter(([category, items]) => items.length && category !== previous?.category)
      .sort((a, b) => b[1].length - a[1].length)[0]?.[0]

    if (!nextCategory) break
    ordered.push(remaining[nextCategory].pop())
  }

  return ordered
}

function findBonusFor(question, questions, usedBonusIds) {
  const exactSubset = questions.filter(candidate =>
    candidate.type === 'Bonus' &&
    candidate.category === question.category &&
    candidate.subsetId === question.subsetId &&
    !usedBonusIds.has(candidate.id)
  )
  const sameCategory = questions.filter(candidate =>
    candidate.type === 'Bonus' &&
    candidate.category === question.category &&
    !usedBonusIds.has(candidate.id)
  )

  return shuffle(exactSubset.length ? exactSubset : sameCategory)[0] || null
}

function formatModeLabel(mode) {
  return MODES.find(item => item.id === mode)?.label || mode
}

function isTextEntryTarget(target) {
  const tagName = target?.tagName?.toLowerCase()
  return tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target?.isContentEditable
}

export default function GameView({ onBack, onTraining }) {
  const answerInputRef = useRef(null)
  const allQuestions = useMemo(() => enrichQuestionsWithSubsets(questionsData.questions), [])
  const [mode, setMode] = useState('tossup')
  const [category, setCategory] = useState('All')
  const [subset, setSubset] = useState('All')
  const [format, setFormat] = useState('All')
  const [deck, setDeck] = useState([])
  const [index, setIndex] = useState(0)
  const [activeBonus, setActiveBonus] = useState(null)
  const [usedBonusIds, setUsedBonusIds] = useState(new Set())
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState(null)
  const [score, setScore] = useState(0)
  const [seen, setSeen] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [running, setRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TOSSUP_TIME)
  const [readerWpm, setReaderWpm] = useState(DEFAULT_WPM)
  const [wordIndex, setWordIndex] = useState(0)
  const [readingComplete, setReadingComplete] = useState(false)
  const [buzzed, setBuzzed] = useState(false)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const visibleSubsets = useMemo(() => {
    const counts = {}
    allQuestions.forEach(question => {
      if (category !== 'All' && question.category !== category) return
      counts[question.subsetId] = (counts[question.subsetId] || 0) + 1
    })

    return PRACTICE_SUBSETS
      .filter(item => category === 'All' || item.category === category)
      .map(item => ({ ...item, count: counts[item.id] || 0 }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
  }, [allQuestions, category])

  const currentQuestion = activeBonus || deck[index] || null
  const currentKind = currentQuestion?.type || (mode === 'bonus' ? 'Bonus' : 'Tossup')
  const currentLimit = currentKind === 'Bonus' ? BONUS_TIME : TOSSUP_TIME
  const gameComplete = mode === 'game' && index >= deck.length && !activeBonus && deck.length > 0
  const questionWords = useMemo(() => (
    currentQuestion?.question ? currentQuestion.question.trim().split(/\s+/).filter(Boolean) : []
  ), [currentQuestion?.id])
  const readerProgress = questionWords.length ? Math.min(wordIndex + 1, questionWords.length) : 0
  const visibleReaderText = questionWords.slice(0, readerProgress).join(' ')
  const canBuzz = currentQuestion?.type === 'Tossup' && running && !readingComplete && !result
  const displayedQuestion = buzzed ? visibleReaderText : currentQuestion?.question
  const remainingQuestions = Math.max(deck.length - Math.min(index, deck.length), 0)
  const remainingByCategory = useMemo(() => {
    return deck.slice(index).reduce((counts, question) => {
      counts[question.category] = (counts[question.category] || 0) + 1
      return counts
    }, {})
  }, [deck, index])

  const startDeck = () => {
    const nextDeck = mode === 'game'
      ? buildBalancedGameDeck(allQuestions, format)
      : shuffle(matchingQuestions(allQuestions, { mode, category, subset, format })).slice(0, 60)

    setDeck(nextDeck)
    setIndex(0)
    setActiveBonus(null)
    setUsedBonusIds(new Set())
    setScore(0)
    setSeen(0)
    setCorrect(0)
    setAnswer('')
    setResult(null)
    setRunning(nextDeck.length > 0)
    setSessionStarted(true)
    setTimeLeft(nextDeck[0]?.type === 'Bonus' ? BONUS_TIME : TOSSUP_TIME)
    setWordIndex(0)
    setReadingComplete(false)
    setBuzzed(false)
    setFiltersOpen(false)
  }

  const nextQuestion = () => {
    const nextIndex = Math.min(index + 1, deck.length)
    setAnswer('')
    setResult(null)
    setActiveBonus(null)
    setIndex(nextIndex)
    setTimeLeft(mode === 'bonus' ? BONUS_TIME : TOSSUP_TIME)
    setRunning(nextIndex < deck.length)
    setWordIndex(0)
    setReadingComplete(false)
    setBuzzed(false)
  }

  const buzzIn = () => {
    if (!canBuzz) return
    setBuzzed(true)
    setReadingComplete(true)
    setTimeLeft(TOSSUP_TIME)
    window.requestAnimationFrame(() => {
      answerInputRef.current?.focus()
    })
  }

  const submitAnswer = () => {
    if (!currentQuestion || result || !readingComplete) return

    const isCorrect = checkAnswer(answer, currentQuestion.answer)
    const points = currentQuestion.type === 'Bonus' ? 7 : 4
    setResult(isCorrect ? 'correct' : 'incorrect')
    setSeen(value => value + 1)

    if (isCorrect) {
      setCorrect(value => value + 1)
      setScore(value => value + points)
    }

    if (isCorrect && currentQuestion.type === 'Tossup' && (mode === 'cycle' || mode === 'game')) {
      const bonus = findBonusFor(currentQuestion, allQuestions, usedBonusIds)
      if (bonus) {
        setUsedBonusIds(prev => new Set([...prev, bonus.id]))
        setTimeout(() => {
          setActiveBonus(bonus)
          setAnswer('')
          setResult(null)
          setTimeLeft(BONUS_TIME)
          setRunning(true)
          setWordIndex(0)
          setReadingComplete(false)
          setBuzzed(false)
        }, 450)
      }
    }
  }

  useEffect(() => {
    setDeck([])
    setIndex(0)
    setActiveBonus(null)
    setRunning(false)
    setResult(null)
    setAnswer('')
    setWordIndex(0)
    setReadingComplete(false)
    setBuzzed(false)
    setSessionStarted(false)
  }, [mode, category, subset, format])

  useEffect(() => {
    if (mode === 'game') {
      setCategory('All')
      setSubset('All')
    }
  }, [mode])

  useEffect(() => {
    if (!running || !currentQuestion || result || !readingComplete) return undefined
    if (timeLeft <= 0) {
      setResult('timeout')
      setSeen(value => value + 1)
      return undefined
    }

    const timer = window.setTimeout(() => setTimeLeft(value => value - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [running, currentQuestion, result, readingComplete, timeLeft])

  useEffect(() => {
    setTimeLeft(currentLimit)
    setWordIndex(0)
    setReadingComplete(!currentQuestion)
  }, [currentQuestion?.id, currentLimit])

  useEffect(() => {
    if (!running || !currentQuestion || result || readingComplete) return undefined
    if (!questionWords.length) {
      setReadingComplete(true)
      return undefined
    }

    const delay = Math.max(80, Math.round(60000 / readerWpm))
    const timer = window.setTimeout(() => {
      if (wordIndex >= questionWords.length - 1) {
        setReadingComplete(true)
      } else {
        setWordIndex(value => Math.min(value + 1, questionWords.length - 1))
      }
    }, delay)

    return () => window.clearTimeout(timer)
  }, [running, currentQuestion, result, readingComplete, questionWords.length, wordIndex, readerWpm])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (isTextEntryTarget(event.target)) return

      if ((event.code === 'Space' || event.key.toLowerCase() === 'b') && canBuzz) {
        event.preventDefault()
        buzzIn()
        return
      }

      if ((event.key === 'ArrowRight' || event.key.toLowerCase() === 'n') && result) {
        event.preventDefault()
        nextQuestion()
        return
      }

      if (event.key.toLowerCase() === 's' && currentQuestion) {
        event.preventDefault()
        nextQuestion()
        return
      }

      if (event.key.toLowerCase() === 'r') {
        event.preventDefault()
        startDeck()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [result, index, deck.length, canBuzz, currentQuestion, mode, category, subset, format])

  return (
    <div className="game-bg">
      <header className="training-top-bar">
        <button className="training-back-btn" onClick={onBack}>AXIOM</button>
        <span className="font-mono" style={{ fontSize: 12, letterSpacing: '4px', color: 'rgba(244,239,229,0.72)' }}>
          SCIENCE BOWL READER
        </span>
        <button className="training-back-btn" onClick={onTraining}>FLASHCARDS</button>
      </header>

      <main className="game-shell">
        <section className="game-panel game-setup-panel">
          <div className="panel-heading">
            <span className="font-mono">SINGLE PLAYER</span>
            <strong>{formatModeLabel(mode)}</strong>
          </div>

          <button
            className="game-filter-toggle axiom-button-secondary"
            onClick={() => setFiltersOpen(value => !value)}
            aria-expanded={filtersOpen}
            aria-controls="reader-session-controls"
          >
            {filtersOpen ? 'Hide Setup' : 'Show Setup'}
          </button>

          <div id="reader-session-controls" className={filtersOpen ? 'game-filter-drawer is-open' : 'game-filter-drawer'}>
            <div className="game-mode-grid">
              {MODES.map(item => (
                <button
                  key={item.id}
                  className={mode === item.id ? 'game-mode-card is-active' : 'game-mode-card'}
                  onClick={() => setMode(item.id)}
                  aria-pressed={mode === item.id}
                >
                  <b>{item.label}</b>
                  <span>{item.detail}</span>
                </button>
              ))}
            </div>

            <div className="filter-group">
              <span className="filter-label">Category</span>
              <div className="segmented-wrap">
                {['All', ...CATEGORIES].map(item => (
                  <button
                    key={item}
                    className={category === item ? 'is-active' : ''}
                    onClick={() => { setCategory(item); setSubset('All') }}
                    disabled={mode === 'game' && item !== 'All'}
                  >
                    {item === 'All' ? 'All' : CAT_ABBR[item]}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <span className="filter-label">Subcategory</span>
              <div className="subset-row">
                <button className={subset === 'All' ? 'is-active' : ''} onClick={() => setSubset('All')}>All</button>
                {visibleSubsets.slice(0, 12).map(item => (
                  <button
                    key={item.id}
                    className={subset === item.id ? 'is-active' : ''}
                    onClick={() => setSubset(item.id)}
                    disabled={mode === 'game'}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <span className="filter-label">Format</span>
              <div className="segmented-wrap">
                {FORMAT_OPTIONS.map(item => (
                  <button key={item} className={format === item ? 'is-active' : ''} onClick={() => setFormat(item)}>
                    {item === 'Multiple Choice' ? 'MCQ' : item === 'Short Answer' ? 'Short' : 'All'}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group reader-speed-control">
              <span className="filter-label">Reader speed</span>
              <div className="wpm-row">
                <input
                  aria-label="Reader words per minute"
                  type="range"
                  min={MIN_WPM}
                  max={MAX_WPM}
                  step="10"
                  value={readerWpm}
                  onChange={event => setReaderWpm(Number(event.target.value))}
                />
                <output>{readerWpm} WPM</output>
              </div>
            </div>
          </div>

          <LiquidButton onClick={startDeck} size="xl" className="game-start-button axiom-button-primary">
            {deck.length ? 'RESTART SESSION' : 'START SESSION'}
          </LiquidButton>
        </section>

        <section className="game-panel game-reader-panel">
          <div className="reader-topline">
            <div className="practice-card-tags">
              <span>{currentQuestion ? CAT_ABBR[currentQuestion.category] : 'READY'}</span>
              <span>{currentKind}</span>
              <span>{currentQuestion?.format || format}</span>
              {currentQuestion && <span>{buzzed ? 'Interrupt' : readingComplete ? 'Answer' : `${readerProgress}/${questionWords.length}`}</span>}
              {currentQuestion?.subsetLabel && <span>{currentQuestion.subsetLabel}</span>}
            </div>
            <div className={timeLeft <= 5 ? 'reader-timer is-low' : 'reader-timer'}>
              {currentQuestion && !readingComplete ? 'READ' : `${timeLeft}s`}
            </div>
          </div>

          <div className="reader-card">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion?.id || (gameComplete ? 'complete' : 'empty')}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.2 }}
              >
                {!currentQuestion ? (
                  <div className="reader-empty">
                    {!sessionStarted ? (
                      <div className="reader-onboarding">
                        <span className="font-mono">HOW IT WORKS</span>
                        <h2>Build a round, then read like match day.</h2>
                        <div className="reader-steps">
                          <p><b>1</b><span>Choose a mode</span></p>
                          <p><b>2</b><span>Pick subjects/subtopics</span></p>
                          <p><b>3</b><span>Start a timed reader session</span></p>
                        </div>
                        <div className="ghost-question-card" aria-hidden="true">
                          <small>Sample preview</small>
                          <p>TOSSUP: Which organelle is the primary site of ATP production in eukaryotic cells?</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="font-mono">{gameComplete ? 'COMPLETE' : 'READY'}</span>
                        <p>{gameComplete ? 'Session complete. Restart for a fresh randomized set.' : 'No questions match this setup. Adjust filters or restart with a broader set.'}</p>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    <span className="font-mono reader-label">{currentKind.toUpperCase()}</span>
                    {readingComplete ? (
                      <p>{displayedQuestion}</p>
                    ) : (
                      <div className="reader-word-stage">
                        <p className="reader-cumulative-text">{visibleReaderText}</p>
                        <small>{readerWpm} WPM</small>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="answer-row">
            <input
              ref={answerInputRef}
              value={answer}
              onChange={event => setAnswer(event.target.value)}
              onKeyDown={event => event.key === 'Enter' && submitAnswer()}
              placeholder={readingComplete ? 'Type your answer...' : 'Press BUZZ, Space, or B to interrupt'}
              disabled={!currentQuestion || !!result || !readingComplete}
            />
            <LiquidButton onClick={buzzIn} size="lg" disabled={!canBuzz} className="reader-buzz-button">
              BUZZ
            </LiquidButton>
            <LiquidButton onClick={submitAnswer} size="lg" disabled={!currentQuestion || !!result || !readingComplete} className="axiom-button-primary">
              SUBMIT
            </LiquidButton>
          </div>

          {result && currentQuestion && (
            <div className={`reader-result ${result}`}>
              <b>{result === 'correct' ? 'Correct' : result === 'timeout' ? 'Time' : 'Incorrect'}</b>
              <span>{currentQuestion.answer}</span>
              <button onClick={nextQuestion}>
                {gameComplete ? 'Finish' : activeBonus ? 'Continue' : 'Next'}
              </button>
            </div>
          )}
        </section>

        <aside className="game-panel game-score-panel">
          <div className="score-grid">
            <motion.div key={`score-${score}`} className="stat-tile" initial={{ scale: 0.985 }} animate={{ scale: 1 }} transition={{ duration: 0.18 }}><b>{score}</b><span>Points</span></motion.div>
            <motion.div key={`correct-${correct}`} className="stat-tile" initial={{ scale: 0.985 }} animate={{ scale: 1 }} transition={{ duration: 0.18 }}><b>{correct}</b><span>Correct</span></motion.div>
            <motion.div key={`seen-${seen}`} className="stat-tile" initial={{ scale: 0.985 }} animate={{ scale: 1 }} transition={{ duration: 0.18 }}><b>{seen}</b><span>Seen</span></motion.div>
            <motion.div key={`progress-${index}-${activeBonus?.id || 'base'}`} className="stat-tile" initial={{ scale: 0.985 }} animate={{ scale: 1 }} transition={{ duration: 0.18 }}><b>{mode === 'game' ? `${Math.min(index + 1, 18)}/18` : `${Math.min(index + 1, deck.length)}/${deck.length}`}</b><span>Progress</span></motion.div>
          </div>
          <div className="game-rules">
            <span className="font-mono">RULES</span>
            <p>Tossups give 4 points and use a 10 second answer window. Bonuses give 7 points and use a 25 second window.</p>
            <p>Game simulation uses 18 tossups: 3 per category, shuffled without adjacent duplicate categories. Correct tossups unlock a same-subject bonus.</p>
          </div>
        </aside>

        <aside className="game-panel game-history-panel">
          <div className="panel-heading compact">
            <span className="font-mono">LIVE CONTROLS</span>
            <strong>{remainingQuestions}</strong>
          </div>
          <div className="game-control-panel">
            <div className="control-status-card">
              <span className="font-mono">STATUS</span>
              <b>{!currentQuestion ? 'Idle' : buzzed ? 'Interrupted' : readingComplete ? 'Answering' : 'Reading'}</b>
              <p>{!currentQuestion ? 'Start a session to load a hidden randomized set.' : 'Upcoming questions stay hidden until they are reached.'}</p>
            </div>
            <div className="control-action-row">
              <button onClick={buzzIn} disabled={!canBuzz} aria-label="Buzz in now">Buzz</button>
              <button onClick={nextQuestion} disabled={!currentQuestion} aria-label="Skip current question">Skip</button>
            </div>
            <div className="shortcut-list">
              <span className="font-mono">SHORTCUTS</span>
              <p><kbd>Space</kbd><kbd>B</kbd><span>Buzz</span></p>
              <p><kbd>Enter</kbd><span>Submit answer</span></p>
              <p><kbd>N</kbd><kbd>Right</kbd><span>Next after result</span></p>
              <p><kbd>S</kbd><span>Skip current</span></p>
              <p><kbd>R</kbd><span>Restart session</span></p>
            </div>
            <div className="hidden-queue-summary">
              <span className="font-mono">HIDDEN SET</span>
              <div>
                {CATEGORIES.map(item => (
                  <p key={item}><b>{CAT_ABBR[item]}</b><span>{remainingByCategory[item] || 0}</span></p>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}
