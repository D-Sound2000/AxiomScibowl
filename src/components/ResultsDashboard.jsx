import { useState, useMemo } from 'react'
import questionsData from '../fixtures/scibowl_questions.json'

const CATEGORIES = ['Biology', 'Earth & Space', 'Chemistry', 'Energy', 'Math', 'Physics']
const CAT_ABBR = {
  'Biology': 'BIO', 'Chemistry': 'CHEM', 'Earth & Space': 'EARTH',
  'Energy': 'ENGY', 'Math': 'MATH', 'Physics': 'PHYS',
}
const ANSWER_LIMIT = 140
const GENERIC_FREQUENCY_ANSWERS = new Set([
  'ALL',
  'NONE',
  'BOTH',
  'NEITHER',
  'TRUE',
  'FALSE',
  'YES',
  'NO',
  'ALL OF THE ABOVE',
  'ALL OF THEM',
  'NONE OF THE ABOVE',
  'BOTH OF THE ABOVE',
  'CANNOT BE DETERMINED',
  'ZERO',
  'ONE',
  'TWO',
  'THREE',
  'FOUR',
  'FIVE',
  'SIX',
  'SEVEN',
  'EIGHT',
  'NINE',
  'TEN',
])

function normalizeFrequencyAnswer(answer) {
  const primary = answer
    .split(/\(\s*ACCEPT/i)[0]
    .replace(/^[WXYZ]\s*\)\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim()

  const normalized = primary
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[~_]+/g, '')
    .replace(/\s+([,.;:)])/g, '$1')
    .trim()

  const upper = normalized.toUpperCase()
  if (!normalized || GENERIC_FREQUENCY_ANSWERS.has(upper)) return null

  const numericLike = upper
    .replace(/\b(AND|OR|TO|TIMES|PLUS|MINUS|OVER)\b/g, '')
    .replace(/[X×]/g, '')
    .trim()

  if (/^[\d\s,.;:+\-−*/^=()<>%°]+$/.test(numericLike)) return null
  if (/^(?:[WXYZ]\s*\)?\s*)+$/.test(upper)) return null

  return normalized
}

function computeFrequency(questions) {
  const catCounts = {}
  const answerMap = {}

  questions.forEach(q => {
    catCounts[q.category] = (catCounts[q.category] || 0) + 1
    const answer = normalizeFrequencyAnswer(q.answer)
    if (!answer) return
    const key = answer.toUpperCase()
    if (!answerMap[key]) {
      answerMap[key] = { answer, sourceAnswer: q.answer, count: 0, category: q.category }
    }
    answerMap[key].count++
  })

  const categoryData = CATEGORIES.map(name => ({
    name,
    count: catCounts[name] || 0,
  }))

  const topAnswers = Object.entries(answerMap)
    .sort((a, b) => b[1].count - a[1].count || a[1].answer.localeCompare(b[1].answer))
    .map(([, { answer, sourceAnswer, count, category }]) => ({ answer, sourceAnswer, count, category }))

  return { categoryData, topAnswers }
}

export default function ResultsDashboard({ onDrillQuestion }) {
  const [selectedCat, setSelectedCat] = useState('All')
  const questions = questionsData.questions

  const { categoryData, topAnswers } = useMemo(() => computeFrequency(questions), [questions])

  const maxCount = Math.max(...categoryData.map(c => c.count))

  const filteredAnswers = selectedCat === 'All'
    ? topAnswers
    : topAnswers.filter(a => a.category === selectedCat)

  const visibleAnswers = filteredAnswers.slice(0, ANSWER_LIMIT)

  const handleDrill = (answer, sourceAnswer) => {
    const q = questions.find(q => q.answer === sourceAnswer || normalizeFrequencyAnswer(q.answer) === answer)
    if (q && onDrillQuestion) onDrillQuestion(q)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)', width: '100%' }}>

      {/* Category distribution */}
      <div className="card">
        <span className="font-mono" style={{
          fontSize: 13, letterSpacing: '2px',
          color: 'rgba(216,198,160,0.78)',
          display: 'block',
          marginBottom: 'var(--gap-md)',
        }}>
          QUESTIONS BY SUBJECT
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {categoryData.map(({ name, count }) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="font-mono" style={{
                fontSize: 11,
                color: 'rgba(244,239,229,0.78)',
                width: 44,
                letterSpacing: '0.5px',
                flexShrink: 0,
              }}>
                {CAT_ABBR[name]}
              </span>
              <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.08)', position: 'relative' }}>
                <div style={{
                  height: '100%',
                  width: `${(count / maxCount) * 100}%`,
                  background: 'rgba(216,198,160,0.72)',
                  transition: 'width 0.9s cubic-bezier(0.16,1,0.3,1)',
                }} />
              </div>
              <span className="font-mono" style={{
                fontSize: 11,
                color: 'rgba(216,198,160,0.74)',
                width: 20,
                textAlign: 'right',
                flexShrink: 0,
              }}>
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* High-yield answers */}
      <div className="card" style={{ flex: 1 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--gap-md)',
          flexWrap: 'wrap',
          gap: 8,
        }}>
          <span className="font-mono" style={{ fontSize: 13, letterSpacing: '2px', color: 'rgba(216,198,160,0.78)' }}>
            HIGH-YIELD ANSWERS
          </span>
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {['All', ...CATEGORIES].map(c => (
              <button
                key={c}
                onClick={() => setSelectedCat(c)}
                className="font-mono"
                style={{
                  padding: '5px 8px',
                  fontSize: 10,
                  letterSpacing: '0.5px',
                  background: selectedCat === c ? 'rgba(216,198,160,0.16)' : 'transparent',
                  color: selectedCat === c ? 'rgba(255,255,255,0.96)' : 'rgba(244,239,229,0.64)',
                  border: `1px solid ${selectedCat === c ? 'rgba(216,198,160,0.38)' : 'rgba(255,255,255,0.14)'}`,
                  cursor: 'none',
                  transition: 'all var(--anim-fast)',
                }}
              >
                {c === 'All' ? 'ALL' : CAT_ABBR[c]}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {visibleAnswers.map(({ answer, sourceAnswer, count, category }, i) => (
            <button
              key={answer}
              onClick={() => handleDrill(answer, sourceAnswer)}
              aria-label={`Drill ${answer}`}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(216,198,160,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.035)' }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 10px',
                background: 'rgba(255,255,255,0.035)',
                border: '1px solid rgba(255,255,255,0.09)',
                cursor: 'none',
                textAlign: 'left',
                transition: 'all var(--anim-fast)',
                width: '100%',
              }}
            >
              <span className="font-mono" style={{
                fontSize: 11, color: 'rgba(216,198,160,0.64)',
                width: 24, flexShrink: 0, textAlign: 'right',
              }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 15,
                fontWeight: 500,
                color: 'rgba(244,239,229,0.88)',
                flex: 1,
              }}>
                {answer}
              </span>
              <span className="font-mono" style={{
                fontSize: 10, padding: '3px 6px',
                border: '1px solid rgba(216,198,160,0.28)',
                color: 'rgba(216,198,160,0.72)',
                flexShrink: 0, letterSpacing: '0.5px',
              }}>
                {CAT_ABBR[category] || category.slice(0, 4).toUpperCase()}
              </span>
              <span className="font-mono" style={{
                fontSize: 11, color: 'rgba(216,198,160,0.68)',
                flexShrink: 0, letterSpacing: '1px',
              }}>
                {count}×
              </span>
            </button>
          ))}
          {filteredAnswers.length > ANSWER_LIMIT && (
            <div className="font-mono" style={{
              fontSize: 11,
              color: 'rgba(216,198,160,0.62)',
              textAlign: 'center',
              padding: '10px 0',
              letterSpacing: '1px',
            }}>
              TOP {ANSWER_LIMIT} OF {filteredAnswers.length} ANSWERS
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
