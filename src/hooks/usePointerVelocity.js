import { useEffect, useRef, useState } from 'react'

export function usePointerVelocity() {
  const [velocity, setVelocity] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const lastPos = useRef({ x: 0, y: 0, t: 0 })

  useEffect(() => {
    const handler = (e) => {
      const now = performance.now()
      const dx = e.clientX - lastPos.current.x
      const dy = e.clientY - lastPos.current.y
      const dt = now - lastPos.current.t || 1
      const v = Math.sqrt(dx * dx + dy * dy) / dt
      setVelocity(Math.min(v, 2))
      setPosition({ x: e.clientX, y: e.clientY })
      lastPos.current = { x: e.clientX, y: e.clientY, t: now }
    }
    window.addEventListener('pointermove', handler)
    return () => window.removeEventListener('pointermove', handler)
  }, [])

  return { velocity, position }
}
