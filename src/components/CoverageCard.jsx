import { useEffect, useRef, useState } from 'react'

function RadarChart({ data }) {
  const size = 160
  const center = size / 2
  const radius = 55
  const labels = data.map(d => d.label)
  const values = data.map(d => d.value / 100)
  const n = labels.length

  const getPoint = (index, r) => {
    const angle = (index / n) * Math.PI * 2 - Math.PI / 2
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    }
  }

  const gridPoints = (level) =>
    Array.from({ length: n })
      .map((_, i) => {
        const p = getPoint(i, radius * level)
        return `${p.x},${p.y}`
      })
      .join(' ')

  const dataPath =
    values
      .map((v, i) => {
        const p = getPoint(i, radius * v)
        return `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
      })
      .join(' ') + ' Z'

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label="Radar chart showing topic coverage by subject"
      role="img"
    >
      <title>Topic Coverage Radar</title>
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map(l => (
        <polygon
          key={l}
          points={gridPoints(l)}
          fill="none"
          stroke="var(--muted)"
          strokeWidth="0.5"
          opacity="0.4"
        />
      ))}
      {/* Axis lines */}
      {Array.from({ length: n }).map((_, i) => {
        const outer = getPoint(i, radius)
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={outer.x}
            y2={outer.y}
            stroke="var(--muted)"
            strokeWidth="0.5"
            opacity="0.4"
          />
        )
      })}
      {/* Data area */}
      <path
        d={dataPath}
        fill="var(--text-1)"
        fillOpacity="0.15"
        stroke="var(--text-1)"
        strokeWidth="1.5"
      />
      {/* Data points */}
      {values.map((v, i) => {
        const p = getPoint(i, radius * v)
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={2}
            fill="var(--text-1)"
          />
        )
      })}
      {/* Labels */}
      {labels.map((label, i) => {
        const p = getPoint(i, radius + 14)
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--muted)"
            fontSize="7"
            fontFamily="JetBrains Mono, monospace"
          >
            {label}
          </text>
        )
      })}
    </svg>
  )
}

export default function CoverageCard({ coverage = 78, radarData }) {
  const [displayed, setDisplayed] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    const start = performance.now()
    const duration = 900
    const startVal = 0

    const animate = (now) => {
      const t = Math.min((now - start) / duration, 1)
      // Cubic ease-out
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplayed(Math.round(startVal + eased * (coverage - startVal)))
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [coverage])

  const defaultRadar = [
    { label: 'ANATOMY', value: 82 },
    { label: 'PHYSICS', value: 65 },
    { label: 'CHEM', value: 71 },
    { label: 'PLANET', value: 90 },
    { label: 'ASTRO', value: 58 },
    { label: 'BIO', value: 78 },
  ]

  const chartData = radarData || defaultRadar

  return (
    <div
      className="card"
      style={{
        gridArea: 'coverage',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--gap-md)',
      }}
    >
      <span
        className="font-mono"
        style={{ fontSize: 10, letterSpacing: '2px', color: 'var(--muted)' }}
      >
        COVERAGE SCORE
      </span>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--gap-lg)',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{ position: 'relative', lineHeight: 1 }}
          aria-label={`Coverage score: ${coverage} percent`}
          role="status"
        >
          <span
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 72,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: '-4px',
              color: 'var(--text-1)',
            }}
          >
            {displayed}
          </span>
          <span
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 32,
              fontWeight: 700,
              verticalAlign: 'top',
              lineHeight: 1.2,
            }}
          >
            %
          </span>
        </div>
        <RadarChart data={chartData} />
      </div>

      {/* Subject breakdown tags */}
      <div style={{ display: 'flex', gap: 'var(--gap-sm)', flexWrap: 'wrap' }}>
        {chartData.map(d => (
          <div
            key={d.label}
            className="font-mono"
            style={{
              fontSize: 10,
              padding: '3px 6px',
              border: '1px solid var(--border)',
              display: 'flex',
              gap: 6,
            }}
          >
            <span>{d.label}</span>
            <span style={{ color: 'var(--muted)' }}>{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
