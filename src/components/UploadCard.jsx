import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import questionsData from '../fixtures/scibowl_questions.json'

const CATEGORIES = ['All', 'Biology', 'Earth & Space', 'Chemistry', 'Energy', 'Math', 'Physics']
const CAT_ABBR = {
  'All': 'ALL', 'Biology': 'BIO', 'Chemistry': 'CHEM',
  'Earth & Space': 'EARTH', 'Energy': 'ENGY', 'Math': 'MATH', 'Physics': 'PHYS',
}
const TYPES = ['All', 'Tossup', 'Bonus']
const FORMATS = ['All', 'Multiple Choice', 'Short Answer']
const FORMAT_ABBR = {
  'All': 'ALL',
  'Multiple Choice': 'MCQ',
  'Short Answer': 'SHORT',
}
const VISIBLE_LIMIT = 240

export default function UploadCard({ onSelect, activeId }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [type, setType] = useState('All')
  const [format, setFormat] = useState('All')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return questionsData.questions.filter(item => {
      const matchCat = category === 'All' || item.category === category
      const matchType = type === 'All' || item.type === type
      const matchFormat = format === 'All' || item.format === format
      const matchSearch = !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q)
      return matchCat && matchType && matchFormat && matchSearch
    })
  }, [search, category, type, format])

  const visibleQuestions = filtered.slice(0, VISIBLE_LIMIT)

  const handleRandom = () => {
    if (filtered.length > 0) {
      onSelect(filtered[Math.floor(Math.random() * filtered.length)])
    }
  }

  return (
    <section
      role="region"
      aria-labelledby="browser-title"
      className="upload-card card"
      style={{ width: '100%', position: 'relative', overflow: 'hidden' }}
    >
      <div className="border-beam" aria-hidden="true" />

      <h2
        id="browser-title"
        style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 'var(--gap-md)',
          letterSpacing: '0px',
          color: 'rgba(255,255,255,0.94)',
        }}
      >
        QUESTION BANK
      </h2>

      {/* Search */}
      <div style={{ marginBottom: 'var(--gap-sm)' }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="SEARCH QUESTIONS OR ANSWERS..."
          className="font-mono"
          aria-label="Search questions"
          style={{
            width: '100%',
            padding: '13px 14px',
            background: 'rgba(255,255,255,0.045)',
            border: '1.5px solid rgba(255,255,255,0.14)',
            color: 'rgba(255,255,255,0.92)',
            fontSize: 13,
            letterSpacing: '0.5px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Category filters */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className="font-mono"
            style={{
              padding: '6px 10px',
              fontSize: 11,
              letterSpacing: '1px',
              background: category === cat ? 'rgba(216,198,160,0.95)' : 'transparent',
              color: category === cat ? '#050505' : 'rgba(244,239,229,0.76)',
              border: `1px solid ${category === cat ? 'rgba(216,198,160,0.95)' : 'rgba(255,255,255,0.18)'}`,
              cursor: 'none',
              transition: 'all var(--anim-fast)',
            }}
          >
            {CAT_ABBR[cat]}
          </button>
        ))}
      </div>

      {/* Type filters + count */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 8 }}>
        {TYPES.map(t => (
          <button
            key={t}
            onClick={() => setType(t)}
            className="font-mono"
            style={{
              padding: '6px 10px',
              fontSize: 11,
              letterSpacing: '1px',
              background: type === t ? 'rgba(216,198,160,0.16)' : 'transparent',
              color: type === t ? 'rgba(255,255,255,0.96)' : 'rgba(244,239,229,0.68)',
              border: `1px solid ${type === t ? 'rgba(216,198,160,0.38)' : 'rgba(255,255,255,0.14)'}`,
              cursor: 'none',
              transition: 'all var(--anim-fast)',
            }}
          >
            {t.toUpperCase()}
          </button>
        ))}
        <span
          className="font-mono"
          style={{ fontSize: 11, color: 'rgba(216,198,160,0.72)', marginLeft: 'auto', letterSpacing: '1px' }}
        >
          {filtered.length} RESULTS
        </span>
      </div>

      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 'var(--gap-md)' }}>
        {FORMATS.map(f => (
          <button
            key={f}
            onClick={() => setFormat(f)}
            className="font-mono"
            style={{
              padding: '6px 10px',
              fontSize: 11,
              letterSpacing: '1px',
              background: format === f ? 'rgba(216,198,160,0.16)' : 'transparent',
              color: format === f ? 'rgba(255,255,255,0.96)' : 'rgba(244,239,229,0.68)',
              border: `1px solid ${format === f ? 'rgba(216,198,160,0.38)' : 'rgba(255,255,255,0.14)'}`,
              cursor: 'none',
              transition: 'all var(--anim-fast)',
            }}
          >
            {FORMAT_ABBR[f]}
          </button>
        ))}
      </div>

      {/* Question list */}
      <div
        style={{
          maxHeight: 260,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          marginBottom: 'var(--gap-md)',
        }}
        role="list"
        aria-label="Filtered questions"
      >
        {filtered.length === 0 && (
          <div
            className="font-mono"
            style={{
              fontSize: 12,
              color: 'rgba(244,239,229,0.42)',
              textAlign: 'center',
              padding: '20px 0',
              letterSpacing: '1px',
            }}
          >
            NO QUESTIONS MATCH
          </div>
        )}
        {visibleQuestions.map(q => (
          <button
            key={q.id}
            onClick={() => onSelect(q)}
            role="listitem"
            aria-pressed={activeId === q.id}
            style={{
              width: '100%',
              background: activeId === q.id ? 'rgba(216,198,160,0.12)' : 'rgba(255,255,255,0.035)',
              border: `1px solid ${activeId === q.id ? 'rgba(216,198,160,0.34)' : 'rgba(255,255,255,0.09)'}`,
              padding: '11px 12px',
              cursor: 'none',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              transition: 'all var(--anim-fast)',
            }}
          >
            <span
              className="font-mono"
              style={{
                fontSize: 10,
                padding: '4px 7px',
                border: '1px solid rgba(216,198,160,0.32)',
                color: 'rgba(216,198,160,0.82)',
                flexShrink: 0,
                marginTop: 1,
                letterSpacing: '0.5px',
                lineHeight: 1.4,
              }}
            >
              {CAT_ABBR[q.category] || q.category.slice(0, 4).toUpperCase()}
            </span>
            <span
              className="font-mono"
              style={{
                fontSize: 10,
                padding: '4px 7px',
                border: '1px solid rgba(255,255,255,0.16)',
                color: 'rgba(244,239,229,0.62)',
                flexShrink: 0,
                marginTop: 1,
                letterSpacing: '0.5px',
                lineHeight: 1.4,
              }}
            >
              {q.format === 'Multiple Choice' ? 'MCQ' : 'SA'}
            </span>
            <span
              className="font-mono"
              style={{
                fontSize: 13,
                color: activeId === q.id ? 'rgba(255,255,255,0.96)' : 'rgba(244,239,229,0.84)',
                lineHeight: 1.55,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                textOverflow: 'ellipsis',
              }}
            >
              {q.question}
            </span>
          </button>
        ))}
        {filtered.length > VISIBLE_LIMIT && (
          <div
            className="font-mono"
            style={{
              fontSize: 11,
              color: 'rgba(216,198,160,0.62)',
              textAlign: 'center',
              padding: '12px 0',
              letterSpacing: '1px',
            }}
          >
            SHOWING {VISIBLE_LIMIT} OF {filtered.length}. SEARCH OR FILTER TO NARROW.
          </div>
        )}
      </div>

      <motion.button
        style={{
          width: '100%',
          padding: '16px',
          background: 'rgba(216,198,160,0.96)',
          color: '#050505',
          border: 'none',
          cursor: 'none',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '2px',
          transition: 'background var(--anim-fast)',
        }}
        whileTap={{ scale: 0.98 }}
        onClick={handleRandom}
      >
        RANDOM QUESTION →
      </motion.button>
    </section>
  )
}
