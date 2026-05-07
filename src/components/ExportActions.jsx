import { useState } from 'react'

export default function ExportActions() {
  const [exportStatus, setExportStatus] = useState(null)

  const handleExport = (action) => {
    setExportStatus(action)
    setTimeout(() => setExportStatus(null), 2000)
  }

  return (
    <div
      className="card"
      style={{
        gridArea: 'actions',
        display: 'flex',
        gap: 'var(--gap-md)',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}
    >
      <span
        className="font-mono"
        style={{ fontSize: 10, letterSpacing: '2px', color: 'var(--muted)', width: '100%' }}
      >
        EXPORT & SYNC
      </span>

      <button
        className="btn-solid font-mono"
        onClick={() => handleExport('export')}
        aria-label="Export missing topics as JSON"
      >
        {exportStatus === 'export' ? 'EXPORTED ✓' : 'EXPORT MISSING TOPICS'}
      </button>

      <button
        className="btn-outlined font-mono"
        onClick={() => handleExport('sync')}
        aria-label="Sync results with Supabase database"
      >
        {exportStatus === 'sync' ? 'SYNCED ✓' : 'SYNC WITH SUPABASE'}
      </button>

      <button
        className="btn-ghost font-mono"
        onClick={() => handleExport('viewer')}
        aria-label="Open cheat sheet viewer"
      >
        {exportStatus === 'viewer' ? 'OPENING...' : 'OPEN CHEAT SHEET VIEWER'}
      </button>
    </div>
  )
}
