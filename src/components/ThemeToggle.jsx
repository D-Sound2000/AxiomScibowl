export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'

  return (
    <button
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      onClick={onToggle}
      style={{
        width: 48,
        height: 28,
        background: isDark ? 'var(--text-1)' : 'var(--bg-2)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        cursor: 'none',
        position: 'relative',
        transition: 'background var(--anim-fast)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 4px',
      }}
    >
      <span
        style={{
          width: 20,
          height: 20,
          background: isDark ? 'var(--bg-1)' : 'var(--text-1)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: isDark ? 'translateX(20px)' : 'translateX(0)',
          transition: 'transform var(--anim-medium) cubic-bezier(0.16,1,0.3,1)',
          flexShrink: 0,
        }}
      >
        {isDark ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="var(--text-1)">
            <path d="M10.5 7.5A4.5 4.5 0 0 1 4.5 1.5 4.5 4.5 0 1 0 10.5 7.5z" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="var(--bg-1)">
            <circle cx="6" cy="6" r="2.5" />
            <line x1="6" y1="0" x2="6" y2="1.5" stroke="var(--bg-1)" strokeWidth="1.5" />
            <line x1="6" y1="10.5" x2="6" y2="12" stroke="var(--bg-1)" strokeWidth="1.5" />
            <line x1="0" y1="6" x2="1.5" y2="6" stroke="var(--bg-1)" strokeWidth="1.5" />
            <line x1="10.5" y1="6" x2="12" y2="6" stroke="var(--bg-1)" strokeWidth="1.5" />
            <line x1="1.76" y1="1.76" x2="2.82" y2="2.82" stroke="var(--bg-1)" strokeWidth="1.5" />
            <line x1="9.18" y1="9.18" x2="10.24" y2="10.24" stroke="var(--bg-1)" strokeWidth="1.5" />
            <line x1="1.76" y1="10.24" x2="2.82" y2="9.18" stroke="var(--bg-1)" strokeWidth="1.5" />
            <line x1="9.18" y1="2.82" x2="10.24" y2="1.76" stroke="var(--bg-1)" strokeWidth="1.5" />
          </svg>
        )}
      </span>
    </button>
  )
}
