import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { vertexShader, fragmentShader } from './shaders.js'

export default function ShaderBackground({ velocity, mousePos, theme }) {
  const mountRef = useRef(null)
  const rendererRef = useRef(null)
  const uniformsRef = useRef(null)
  const rafRef = useRef(null)
  const initializedRef = useRef(false)

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (prefersReducedMotion) return

    const mount = mountRef.current
    if (!mount) return

    let renderer = null

    try {
      // Scene setup
      const scene = new THREE.Scene()
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(mount.clientWidth || window.innerWidth, mount.clientHeight || window.innerHeight)
      mount.appendChild(renderer.domElement)
      rendererRef.current = renderer
      initializedRef.current = true

      const uniforms = {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(mount.clientWidth, mount.clientHeight) },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uVelocity: { value: 0 },
        uDarkMode: { value: 0 },
      }
      uniformsRef.current = uniforms

      const geometry = new THREE.PlaneGeometry(2, 2)
      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
      })
      scene.add(new THREE.Mesh(geometry, material))

      const animate = () => {
        rafRef.current = requestAnimationFrame(animate)
        uniforms.uTime.value += 0.01
        renderer.render(scene, camera)
      }
      animate()

      const handleResize = () => {
        if (!mount || !renderer) return
        const w = mount.clientWidth || window.innerWidth
        const h = mount.clientHeight || window.innerHeight
        renderer.setSize(w, h)
        uniforms.uResolution.value.set(w, h)
      }
      window.addEventListener('resize', handleResize)

      return () => {
        cancelAnimationFrame(rafRef.current)
        window.removeEventListener('resize', handleResize)
        geometry.dispose()
        material.dispose()
        renderer.dispose()
        if (mount.contains(renderer.domElement)) {
          mount.removeChild(renderer.domElement)
        }
        initializedRef.current = false
      }
    } catch (err) {
      console.warn('ShaderBackground: WebGL initialization failed', err)
      if (renderer) renderer.dispose()
    }
  }, [prefersReducedMotion])

  useEffect(() => {
    if (!uniformsRef.current) return
    uniformsRef.current.uVelocity.value = velocity || 0
    if (mousePos) {
      uniformsRef.current.uMouse.value.set(mousePos.x, mousePos.y)
    }
  }, [velocity, mousePos])

  useEffect(() => {
    if (!uniformsRef.current) return
    uniformsRef.current.uDarkMode.value = theme === 'dark' ? 1 : 0
  }, [theme])

  if (prefersReducedMotion) {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, var(--muted) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          opacity: 0.15,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />
    )
  }

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
      aria-hidden="true"
    >
      <span className="sr-only" aria-live="polite">
        Interactive shader background active
      </span>
    </div>
  )
}
