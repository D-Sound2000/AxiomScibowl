import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function MissingTopicsAccordion({ topics = [] }) {
  const [open, setOpen] = useState(null)

  const defaultTopics = [
    {
      topicId: 'ANT-047',
      eventTag: 'ANATOMY',
      title: 'Lymphatic System Drainage',
      desc: 'Thoracic duct, right lymphatic duct, cisterna chyli pathways',
      sampleTestIds: ['2023-INV-Q14', '2022-ST-Q07', '2021-NAT-Q23'],
    },
    {
      topicId: 'DYN-012',
      eventTag: 'DYNAMIC PLANET',
      title: 'Glacial Erosion Landforms',
      desc: 'Cirques, arêtes, drumlins, eskers formation mechanisms',
      sampleTestIds: ['2023-REG-Q08', '2022-INV-Q15'],
    },
    {
      topicId: 'CHM-089',
      eventTag: 'CHEMISTRY',
      title: 'Coordination Chemistry',
      desc: 'Crystal field theory, CFSE calculations, spectrochemical series',
      sampleTestIds: ['2023-ST-Q11', '2022-NAT-Q19', '2021-INV-Q06'],
    },
    {
      topicId: 'AST-034',
      eventTag: 'ASTRONOMY',
      title: 'Variable Star Classification',
      desc: 'Cepheid, RR Lyrae, Mira variables and period-luminosity relations',
      sampleTestIds: ['2023-NAT-Q03'],
    },
    {
      topicId: 'ANT-098',
      eventTag: 'ANATOMY',
      title: 'Cardiac Conduction System',
      desc: 'SA node, AV node, Bundle of His, Purkinje fibers timing',
      sampleTestIds: ['2023-INV-Q22', '2022-ST-Q18', '2021-REG-Q09', '2020-NAT-Q14'],
    },
  ]

  const data = topics.length > 0 ? topics : defaultTopics

  const handleCopy = (id) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(id).catch(() => {})
    }
  }

  return (
    <div
      className="card"
      style={{ gridArea: 'missing' }}
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
        MISSING TOPICS — {data.length} FOUND
      </span>

      <div
        style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
        role="list"
      >
        {data.map((topic, i) => (
          <div
            key={topic.topicId}
            style={{ border: '1px solid var(--border)' }}
            role="listitem"
          >
            <button
              id={`accordion-btn-${i}`}
              aria-expanded={open === i}
              aria-controls={`accordion-panel-${i}`}
              onClick={() => setOpen(open === i ? null : i)}
              style={{
                width: '100%',
                background: open === i ? 'var(--bg-1)' : 'transparent',
                border: 'none',
                padding: '10px 12px',
                cursor: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                textAlign: 'left',
                transition: 'background var(--anim-fast)',
              }}
            >
              <span
                className="font-mono"
                style={{
                  fontSize: 9,
                  padding: '2px 6px',
                  letterSpacing: '1px',
                  border: '1px solid var(--border)',
                  background: open === i ? 'var(--text-1)' : 'transparent',
                  color: open === i ? 'var(--bg-1)' : 'var(--text-1)',
                  flexShrink: 0,
                  transition: 'background var(--anim-fast), color var(--anim-fast)',
                }}
              >
                {topic.eventTag}
              </span>
              <span
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 13,
                  fontWeight: 600,
                  flex: 1,
                  color: 'var(--text-1)',
                }}
              >
                {topic.title}
              </span>
              <span
                className="font-mono"
                style={{ fontSize: 9, color: 'var(--muted)', flexShrink: 0 }}
              >
                {topic.topicId}
              </span>
              <span
                style={{
                  width: 16,
                  height: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: open === i ? 'rotate(45deg)' : 'rotate(0)',
                  transition: 'transform var(--anim-fast) cubic-bezier(0.16,1,0.3,1)',
                  flexShrink: 0,
                }}
                aria-hidden="true"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M5 0v10M0 5h10" stroke="var(--text-1)" strokeWidth="1.5" />
                </svg>
              </span>
            </button>

            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div
                  id={`accordion-panel-${i}`}
                  role="region"
                  aria-labelledby={`accordion-btn-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: 'auto',
                    opacity: 1,
                    transition: {
                      height: { type: 'spring', stiffness: 220, damping: 18 },
                      opacity: { duration: 0.2 },
                    },
                  }}
                  exit={{
                    height: 0,
                    opacity: 0,
                    transition: {
                      height: { type: 'spring', stiffness: 220, damping: 18 },
                      opacity: { duration: 0.15 },
                    },
                  }}
                  style={{ overflow: 'hidden' }}
                >
                  <div
                    style={{
                      padding: '8px 12px 12px',
                      borderTop: '1px solid var(--border)',
                    }}
                  >
                    <p
                      className="font-mono"
                      style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8, lineHeight: 1.6 }}
                    >
                      {topic.desc}
                    </p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span
                        className="font-mono"
                        style={{ fontSize: 9, color: 'var(--muted)' }}
                      >
                        SAMPLE TESTS:
                      </span>
                      {topic.sampleTestIds.map(id => (
                        <button
                          key={id}
                          className="font-mono"
                          onClick={() => handleCopy(id)}
                          title={`Click to copy ${id}`}
                          style={{
                            fontSize: 9,
                            padding: '3px 6px',
                            border: '1px solid var(--border)',
                            background: 'var(--bg-1)',
                            color: 'var(--text-1)',
                            cursor: 'none',
                            letterSpacing: '0.5px',
                            transition: 'background var(--anim-fast), color var(--anim-fast)',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'var(--text-1)'
                            e.currentTarget.style.color = 'var(--bg-1)'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'var(--bg-1)'
                            e.currentTarget.style.color = 'var(--text-1)'
                          }}
                        >
                          {id}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  )
}
