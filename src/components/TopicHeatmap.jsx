import { useState, useMemo } from 'react'

function generateHeatmapData() {
  const data = []
  const now = new Date()
  // Generate 52 weeks × 7 days = 364 cells
  for (let week = 51; week >= 0; week--) {
    for (let day = 0; day < 7; day++) {
      const d = new Date(now)
      d.setDate(d.getDate() - week * 7 - day)
      data.push({
        date: d.toISOString().split('T')[0],
        value: Math.floor(Math.random() * 5),
        week: 51 - week,
        dayOfWeek: day,
      })
    }
  }
  return data
}

const GRAY_LEVELS = ['#f0f0f0', '#c0c0c0', '#808080', '#404040', '#000000']
const GRAY_LEVELS_DARK = ['#1a1a1a', '#333333', '#555555', '#888888', '#ffffff']
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function TopicHeatmap({ theme }) {
  const [tooltip, setTooltip] = useState(null)
  // Memoize so data doesn't regenerate on re-renders
  const data = useMemo(() => generateHeatmapData(), [])
  const levels = theme === 'dark' ? GRAY_LEVELS_DARK : GRAY_LEVELS

  const CELL_SIZE = 8
  const CELL_GAP = 2
  const TOTAL_CELL = CELL_SIZE + CELL_GAP

  return (
    <div
      className="card"
      style={{ gridArea: 'heatmap' }}
    >
      <span
        className="font-mono"
        style={{
          fontSize: 10,
          letterSpacing: '2px',
          color: 'var(--muted)',
          display: 'block',
          marginBottom: 'var(--gap-md)',
        }}
      >
        TOPIC FREQUENCY MAP
      </span>

      <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
        <div style={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
          {/* Day labels */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: CELL_GAP,
              paddingTop: 0,
              flexShrink: 0,
            }}
          >
            {DAY_LABELS.map((d, i) => (
              <div
                key={i}
                className="font-mono"
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  fontSize: 6,
                  color: 'var(--muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                }}
              >
                {i % 2 === 1 ? d : ''}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(52, ${CELL_SIZE}px)`,
              gridTemplateRows: `repeat(7, ${CELL_SIZE}px)`,
              gap: CELL_GAP,
              width: 'fit-content',
            }}
            role="grid"
            aria-label="Topic frequency heatmap, 52 weeks × 7 days"
          >
            {data.map((cell, i) => (
              <div
                key={i}
                role="gridcell"
                tabIndex={0}
                aria-label={`${cell.date}: frequency level ${cell.value} out of 4`}
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  background: levels[cell.value],
                  cursor: 'none',
                  outline: 'none',
                  transition: 'transform 80ms',
                  gridColumn: cell.week + 1,
                  gridRow: cell.dayOfWeek + 1,
                }}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  setTooltip({
                    x: rect.left + rect.width / 2,
                    y: rect.top,
                    ...cell,
                  })
                }}
                onMouseLeave={() => setTooltip(null)}
                onFocus={(e) => {
                  const rect = e.target.getBoundingClientRect()
                  setTooltip({
                    x: rect.left + rect.width / 2,
                    y: rect.top,
                    ...cell,
                  })
                }}
                onBlur={() => setTooltip(null)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          alignItems: 'center',
          marginTop: 8,
        }}
      >
        <span className="font-mono" style={{ fontSize: 9, color: 'var(--muted)' }}>
          LESS
        </span>
        {levels.map((c, i) => (
          <div
            key={i}
            style={{ width: CELL_SIZE, height: CELL_SIZE, background: c }}
            aria-hidden="true"
          />
        ))}
        <span className="font-mono" style={{ fontSize: 9, color: 'var(--muted)' }}>
          MORE
        </span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="font-mono"
          style={{
            position: 'fixed',
            left: tooltip.x + 8,
            top: tooltip.y - 36,
            background: 'var(--text-1)',
            color: 'var(--bg-1)',
            padding: '4px 8px',
            fontSize: 10,
            pointerEvents: 'none',
            zIndex: 1000,
            border: '1px solid var(--border)',
            whiteSpace: 'nowrap',
          }}
          role="tooltip"
        >
          {tooltip.date} — LEVEL {tooltip.value}
        </div>
      )}
    </div>
  )
}
