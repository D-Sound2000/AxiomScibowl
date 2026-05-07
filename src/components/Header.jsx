import AxiomLogo from './AxiomLogo.jsx'

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <AxiomLogo />
        <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-md)' }}>
          <span
            className="font-mono"
            style={{ fontSize: 10, letterSpacing: '2px', color: 'var(--muted)' }}
          >
            SCIENCE BOWL ANALYZER
          </span>
          <button
            aria-label="Menu"
            style={{
              width: 36,
              height: 36,
              background: 'transparent',
              border: '1px solid var(--border)',
              cursor: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 4,
              padding: 0,
            }}
          >
            {[0, 1, 2].map(i => (
              <span
                key={i}
                style={{
                  width: 16,
                  height: 1.5,
                  background: 'var(--text-1)',
                  display: 'block',
                }}
              />
            ))}
          </button>
        </nav>
      </div>
    </header>
  )
}
