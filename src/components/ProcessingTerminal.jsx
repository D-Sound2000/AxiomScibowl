import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CAT_ABBR = {
  'Biology': 'BIO', 'Chemistry': 'CHEM', 'Earth & Space': 'EARTH',
  'Energy': 'ENGY', 'Math': 'MATH', 'Physics': 'PHYS',
}

// Text color tokens for dark glass surfaces
const T = {
  primary:   '#ffffff',
  secondary: 'rgba(244,239,229,0.94)',
  body:      'rgba(230,224,214,0.84)',
  label:     'rgba(216,198,160,0.86)',
  meta:      'rgba(202,190,168,0.74)',
  muted:     'rgba(190,184,172,0.62)',
  ghost:     'rgba(216,198,160,0.58)',
}

export default function ProcessingTerminal({ question }) {
  const [mode, setMode] = useState('flip')
  const [flipped, setFlipped] = useState(false)
  const [recallInput, setRecallInput] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [correct, setCorrect] = useState(null)

  useEffect(() => {
    setFlipped(false)
    setRecallInput('')
    setRevealed(false)
    setCorrect(null)
  }, [question?.id])

  const handleRecallSubmit = () => {
    if (!recallInput.trim()) return
    const user = recallInput.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '')
    const ans = question.answer.toLowerCase().replace(/[^a-z0-9\s]/g, '')
    const isCorrect = ans.includes(user) || user.includes(ans) ||
      ans.split(' ').filter(w => w.length > 3).some(w => user.includes(w))
    setCorrect(isCorrect)
    setRevealed(true)
  }

  const resetRecall = () => {
    setRecallInput('')
    setRevealed(false)
    setCorrect(null)
  }

  if (!question) {
    return (
      <div
        style={{
          height: '100%',
          minHeight: 380,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 32,
          padding: 36,
        }}
        aria-label="Flashcard drill — awaiting question selection"
      >
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
          <rect x="2" y="2" width="48" height="48" rx="8" stroke="rgba(216,198,160,0.34)" strokeWidth="1" />
          <line x1="2" y1="18" x2="50" y2="18" stroke="rgba(255,255,255,0.16)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="2" y1="34" x2="50" y2="34" stroke="rgba(255,255,255,0.16)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="18" y1="2" x2="18" y2="50" stroke="rgba(255,255,255,0.16)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="34" y1="2" x2="34" y2="50" stroke="rgba(255,255,255,0.16)" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="26" cy="26" r="5" stroke="rgba(216,198,160,0.58)" strokeWidth="1.5" fill="none" />
        </svg>

        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="font-mono" style={{ fontSize: 15, color: T.label, letterSpacing: '2px' }}>
            DRILL MODE
          </span>
          <span className="font-mono" style={{ fontSize: 14, color: T.muted, letterSpacing: '1px' }}>
            Select a question to begin
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 280 }}>
          {[
            ['01', 'Select a question from the bank'],
            ['02', 'Flip the card to reveal the answer'],
            ['03', 'Type your answer in recall mode'],
          ].map(([n, label]) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="font-mono" style={{ fontSize: 12, color: T.muted, letterSpacing: '2px', flexShrink: 0 }}>{n}</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
              <span className="font-mono" style={{ fontSize: 12, color: T.muted, letterSpacing: '1px', textAlign: 'right' }}>
                {label.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        height: '100%',
        minHeight: 380,
        display: 'flex',
        flexDirection: 'column',
        padding: 30,
        gap: 20,
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span
          className="font-mono"
          style={{
            fontSize: 12, padding: '5px 10px',
            border: '1px solid rgba(216,198,160,0.38)',
            color: T.label,
            letterSpacing: '1.5px',
            fontWeight: 600,
          }}
        >
          {CAT_ABBR[question.category] || question.category.toUpperCase()}
        </span>
        <span
          className="font-mono"
          style={{
            fontSize: 12, padding: '5px 10px',
            border: '1px solid rgba(255,255,255,0.18)',
            color: T.meta,
            letterSpacing: '1px',
          }}
        >
          {question.type.toUpperCase()}
        </span>
        <span
          className="font-mono"
          style={{
            fontSize: 12, padding: '5px 10px',
            border: '1px solid rgba(255,255,255,0.18)',
            color: T.meta,
            letterSpacing: '1px',
          }}
        >
          {(question.format === 'Multiple Choice' ? 'MCQ' : 'SHORT ANSWER')}
        </span>
        <span
          className="font-mono"
          style={{ fontSize: 12, color: T.meta, letterSpacing: '1px', marginLeft: 'auto' }}
        >
          {question.year} · {question.tournament}
        </span>

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: 2 }}>
          {['flip', 'recall'].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setFlipped(false); resetRecall() }}
              className="font-mono"
              style={{
                padding: '6px 12px',
                fontSize: 12,
                letterSpacing: '1px',
                fontWeight: mode === m ? 600 : 400,
                background: mode === m ? 'rgba(216,198,160,0.18)' : 'transparent',
                color: mode === m ? T.secondary : T.muted,
                border: `1px solid ${mode === m ? 'rgba(216,198,160,0.36)' : 'rgba(255,255,255,0.14)'}`,
                cursor: 'none',
                transition: 'all var(--anim-fast)',
              }}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Card area */}
      <div style={{ flex: 1 }}>
        {mode === 'flip' ? (
          <div
            role="button"
            aria-label={flipped ? 'Showing answer — click to flip back' : 'Showing question — click to reveal answer'}
            onClick={() => setFlipped(f => !f)}
            style={{
              height: '100%',
              minHeight: 200,
              border: '1.5px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.035)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 36,
              cursor: 'none',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 8,
            }}
          >
            <span
              className="font-mono"
              style={{
                position: 'absolute', top: 12, right: 14,
                fontSize: 11, color: T.ghost, letterSpacing: '1.5px',
              }}
            >
              {flipped ? 'ANSWER' : 'QUESTION'} · CLICK TO FLIP
            </span>

            <AnimatePresence mode="wait">
              {!flipped ? (
                <motion.div
                  key="question"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18, ease: [0, 0, 0.2, 1] }}
                  style={{ textAlign: 'center', width: '100%' }}
                >
                  <p style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 22,
                    lineHeight: 1.62,
                    color: T.secondary,
                    fontWeight: 400,
                    marginBottom: 18,
                  }}>
                    {question.question}
                  </p>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {question.keywords.slice(0, 3).map(kw => (
                      <span key={kw} className="font-mono" style={{
                        fontSize: 11, padding: '4px 8px',
                        border: '1px solid rgba(216,198,160,0.22)',
                        color: T.ghost,
                        letterSpacing: '0.5px',
                        borderRadius: 2,
                      }}>
                        {kw.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="answer"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18, ease: [0, 0, 0.2, 1] }}
                  style={{ textAlign: 'center', width: '100%' }}
                >
                  <p style={{
                    fontFamily: 'Chakra Petch, Space Grotesk, sans-serif',
                    fontSize: 42,
                    fontWeight: 700,
                    color: T.primary,
                    letterSpacing: '0px',
                    marginBottom: 14,
                  }}>
                    {question.answer}
                  </p>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {question.keywords.map(kw => (
                      <span key={kw} className="font-mono" style={{
                        fontSize: 11, padding: '4px 8px',
                        border: '1px solid rgba(216,198,160,0.28)',
                        color: T.meta,
                        letterSpacing: '0.5px',
                        borderRadius: 2,
                      }}>
                        {kw.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* Recall mode */
          <div style={{ height: '100%', minHeight: 200, display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
            <div style={{
              flex: 1,
              border: '1.5px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.035)',
              padding: 30,
              display: 'flex',
              alignItems: 'center',
              borderRadius: 8,
            }}>
              <p style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 21,
                lineHeight: 1.62,
                color: T.secondary,
                fontWeight: 400,
              }}>
                {question.question}
              </p>
            </div>

            {!revealed ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={recallInput}
                  onChange={e => setRecallInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleRecallSubmit()}
                  placeholder="Type your answer..."
                  className="font-mono"
                  aria-label="Type your answer"
                  style={{
                    flex: 1,
                    padding: '14px 16px',
                    background: 'rgba(255,255,255,0.055)',
                    border: '1.5px solid rgba(255,255,255,0.16)',
                    color: T.primary,
                    fontSize: 15,
                    letterSpacing: '0.3px',
                    outline: 'none',
                    borderRadius: 6,
                  }}
                />
                <motion.button
                  onClick={handleRecallSubmit}
                  whileTap={{ scale: recallInput.trim() ? 0.97 : 1 }}
                  style={{
                    padding: '14px 20px',
                    background: recallInput.trim() ? 'rgba(216,198,160,0.96)' : 'rgba(255,255,255,0.08)',
                    color: recallInput.trim() ? '#050505' : T.muted,
                    border: 'none',
                    cursor: 'none',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: '1.5px',
                    borderRadius: 6,
                    transition: 'all var(--anim-fast)',
                  }}
                >
                  CHECK
                </motion.button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: 'var(--gap-md)',
                  border: `1px solid ${correct ? 'rgba(74,222,128,0.35)' : 'rgba(248,113,113,0.35)'}`,
                  background: correct ? 'rgba(74,222,128,0.07)' : 'rgba(248,113,113,0.07)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  borderRadius: 10,
                }}
              >
                <span className="font-mono" style={{
                  fontSize: 10, letterSpacing: '2px', fontWeight: 600,
                  color: correct ? 'rgba(134,239,172,0.95)' : 'rgba(252,165,165,0.95)',
                }}>
                  {correct ? '✓ CORRECT' : '✗ INCORRECT'}
                </span>
                <span style={{
                  fontFamily: 'Chakra Petch, Space Grotesk, sans-serif',
                  fontSize: 22,
                  fontWeight: 700,
                  color: T.primary,
                }}>
                  {question.answer}
                </span>
                <button
                  onClick={resetRecall}
                  className="font-mono"
                  style={{
                    alignSelf: 'flex-start',
                    padding: '4px 10px',
                    fontSize: 10,
                    letterSpacing: '1px',
                    background: 'transparent',
                    border: '1px solid rgba(200,180,160,0.28)',
                    color: T.label,
                    cursor: 'none',
                    borderRadius: 4,
                    transition: 'all var(--anim-fast)',
                  }}
                >
                  TRY AGAIN
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
