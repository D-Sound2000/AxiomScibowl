import { useRef, useState } from 'react'

export default function GlassCard({ children, style }) {
  const ref = useRef(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [shine, setShine] = useState({ x: 50, y: 50 })
  const [hovered, setHovered] = useState(false)

  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    setTilt({ x: (y - 0.5) * -7, y: (x - 0.5) * 7 })
    setShine({ x: x * 100, y: y * 100 })
  }

  const onLeave = () => {
    setHovered(false)
    setTilt({ x: 0, y: 0 })
    setShine({ x: 50, y: 50 })
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onLeave}
      style={{
        transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(${hovered ? 12 : 0}px)`,
        transition: hovered
          ? 'transform 0.08s ease, box-shadow 0.2s ease'
          : 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease',
        willChange: 'transform',
        borderRadius: 18,
        boxShadow: hovered
          ? '0 40px 100px rgba(0,0,0,0.7), 0 12px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(200,180,160,0.15)'
          : '0 16px 48px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.3), 0 0 0 1px rgba(200,180,160,0.08)',
        position: 'relative',
        ...style,
      }}
    >
      {/* Moving shine highlight */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(200,180,160,0.13) 0%, transparent 55%)`,
          pointerEvents: 'none',
          zIndex: 10,
          opacity: hovered ? 1 : 0,
          transition: hovered ? 'none' : 'opacity 0.4s ease',
        }}
      />
      {/* Top-edge glass refraction line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(200,180,160,0.35), transparent)',
          borderRadius: 'inherit',
          pointerEvents: 'none',
          zIndex: 11,
        }}
      />
      {children}
    </div>
  )
}
