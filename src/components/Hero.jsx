import { useEffect, useState } from 'react'
import ShaderBackground from '../webgl/ShaderBackground.jsx'

const HEADLINE_LINES = ['KNOW', 'YOUR', 'GAPS.']
// Flat string for indexing
const HEADLINE_FLAT = HEADLINE_LINES.join('')

export default function Hero({ velocity, mousePos, theme }) {
  const [revealedCount, setRevealedCount] = useState(0)
  const totalChars = HEADLINE_FLAT.length

  useEffect(() => {
    let count = 0
    const duration = 700 // ms total for reveal
    const intervalMs = duration / totalChars

    const tick = () => {
      count++
      setRevealedCount(count)
      if (count < totalChars) {
        setTimeout(tick, intervalMs)
      }
    }

    const t = setTimeout(tick, 400)
    return () => clearTimeout(t)
  }, [totalChars])

  // Compute global char index offset for each line
  let globalOffset = 0

  return (
    <section
      style={{
        height: 'calc(100vh - 72px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--bg-1)',
      }}
      aria-label="Hero section"
    >
      <ShaderBackground velocity={velocity} mousePos={mousePos} theme={theme} />

      {/* Dot matrix overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, var(--text-1) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.04,
        }}
        aria-hidden="true"
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          padding: '0 var(--gap-lg)',
        }}
      >
        <h1
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 'clamp(64px, 12vw, 128px)',
            fontWeight: 900,
            lineHeight: 0.9,
            letterSpacing: '-4px',
            margin: 0,
            color: 'var(--text-1)',
          }}
          aria-label={HEADLINE_LINES.join(' ')}
        >
          {HEADLINE_LINES.map((line, li) => {
            const lineOffset = globalOffset
            globalOffset += line.length

            return (
              <span key={li} style={{ display: 'block' }}>
                {line.split('').map((ch, ci) => {
                  const charGlobalIndex = lineOffset + ci
                  return (
                    <span
                      key={ci}
                      aria-hidden="true"
                      style={{
                        opacity: charGlobalIndex < revealedCount ? 1 : 0,
                        transition: 'opacity 0.12s ease',
                        display: 'inline-block',
                      }}
                    >
                      {ch}
                    </span>
                  )
                })}
              </span>
            )
          })}
        </h1>

        <p
          className="font-mono"
          style={{
            marginTop: 32,
            fontSize: 13,
            letterSpacing: '3px',
            color: 'var(--muted)',
            maxWidth: 520,
            margin: '32px auto 0',
            lineHeight: 1.6,
          }}
        >
          CROSS-REFERENCE YOUR CHEAT SHEETS AGAINST THE SUPABASE TEST BANK.
          SURFACE MISSING TOPICS INSTANTLY.
        </p>

        <div
          style={{
            marginTop: 40,
            display: 'flex',
            gap: 'var(--gap-md)',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            className="btn-solid font-mono"
            onClick={() => {
              const section = document.getElementById('upload-section')
              if (section) section.scrollIntoView({ behavior: 'smooth' })
            }}
            style={{ minWidth: 160 }}
          >
            GET STARTED →
          </button>
          <button
            className="btn-outlined font-mono"
            style={{ minWidth: 160 }}
          >
            VIEW DOCS
          </button>
        </div>

        {/* Scroll indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            opacity: 0.4,
          }}
          aria-hidden="true"
        >
          <span className="font-mono" style={{ fontSize: 9, letterSpacing: '2px' }}>SCROLL</span>
          <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
            <path
              d="M6 0v12M1 7l5 5 5-5"
              stroke="var(--text-1)"
              strokeWidth="1.5"
              style={{ animation: 'blink 2s infinite' }}
            />
          </svg>
        </div>
      </div>
    </section>
  )
}
