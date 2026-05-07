import { useEffect, useRef, useState } from 'react'

// Simple spring physics hook
export function useSpring(target, { stiffness = 220, damping = 18, mass = 1 } = {}) {
  const [value, setValue] = useState(target)
  const state = useRef({ pos: target, vel: 0 })
  const rafRef = useRef(null)
  const targetRef = useRef(target)

  useEffect(() => {
    targetRef.current = target
  }, [target])

  useEffect(() => {
    const animate = () => {
      const { pos, vel } = state.current
      const t = targetRef.current
      const spring = -stiffness * (pos - t)
      const damper = -damping * vel
      const acc = (spring + damper) / mass
      const newVel = vel + acc * 0.016
      const newPos = pos + newVel * 0.016
      state.current = { pos: newPos, vel: newVel }
      setValue(newPos)
      if (Math.abs(newPos - t) > 0.001 || Math.abs(newVel) > 0.001) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [stiffness, damping, mass])

  return value
}
