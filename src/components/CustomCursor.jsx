import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const cursorRef = useRef(null)
  const pos = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0 })
  const hovering = useRef(false)
  const rafRef = useRef(null)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    // Don't show custom cursor on touch devices
    if (!window.matchMedia('(pointer: fine)').matches) {
      cursor.style.display = 'none'
      return
    }

    cursor.style.opacity = '0'

    const move = (e) => {
      pos.current = { x: e.clientX, y: e.clientY }
      if (cursor.style.opacity === '0') {
        current.current = { x: e.clientX, y: e.clientY }
        cursor.style.opacity = '1'
      }
    }

    const onHoverIn = () => { hovering.current = true }
    const onHoverOut = () => { hovering.current = false }

    window.addEventListener('pointermove', move)

    // Add hover listeners to interactive elements
    const addListeners = () => {
      document.querySelectorAll('a, button, [role="button"], input, label, [tabindex]').forEach(el => {
        el.addEventListener('mouseenter', onHoverIn)
        el.addEventListener('mouseleave', onHoverOut)
      })
    }
    addListeners()

    // Observe DOM changes to add listeners to new interactive elements
    const observer = new MutationObserver(addListeners)
    observer.observe(document.body, { childList: true, subtree: true })

    const animate = () => {
      current.current.x += (pos.current.x - current.current.x) * 0.25
      current.current.y += (pos.current.y - current.current.y) * 0.25
      const scale = hovering.current ? 1.4 : 1
      cursor.style.transform = `translate(${current.current.x - 9}px, ${current.current.y - 9}px) scale(${scale})`
      rafRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('pointermove', move)
      cancelAnimationFrame(rafRef.current)
      observer.disconnect()
    }
  }, [])

  return <div ref={cursorRef} className="cursor" aria-hidden="true" />
}
