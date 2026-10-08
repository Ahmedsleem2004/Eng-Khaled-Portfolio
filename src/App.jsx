import { useCallback, useEffect, useState, lazy, Suspense } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import Loader from './components/Loader'
import Hero from './components/Hero'
import ExecutiveProfile from './components/ExecutiveProfile'
import Experience from './components/Experience'
import Expertise from './components/Expertise'
import Recognition from './components/Recognition'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Navbar from './components/Navbar'

import { initMotion } from './motion'
import { bus, reduce } from './store'

const CloudScene = lazy(() => import('./components/CloudScene'))

export default function App() {
  const [ready, setReady] = useState(false)
  const [mount, setMount] = useState(false)

  /*
    Mount the heavy WebGL scene near the end of the loader.

    The old 1.1s mount caused Three.js to compete with the
    cinematic loader for CPU/GPU time.
  */
  useEffect(() => {
    const id = setTimeout(() => {
      setMount(true)
    }, 4300)

    return () => clearTimeout(id)
  }, [])

  /*
    Loader completion.
  */
  const done = useCallback(() => {
    setReady(true)
    setMount(true)
  }, [])

  /*
    Safety fallback.

    The loader normally finishes around 4.8s.
    This only protects against a completely unexpected failure.
  */
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setReady(true)
      setMount(true)
    }, 7000)

    return () => clearTimeout(safetyTimer)
  }, [])

  /*
    Lenis + GSAP ticker.
  */
  useEffect(() => {
    let lenis = null
    let tick = null

    if (!reduce) {
      lenis = new Lenis({
        lerp: 0.09,
        smoothWheel: true,
      })

      bus.lenis = lenis

      // Lock scrolling while loader is visible.
      lenis.stop()

      // Keep ScrollTrigger synced with Lenis.
      lenis.on('scroll', ScrollTrigger.update)

      tick = time => {
        lenis.raf(time * 1000)
      }

      gsap.ticker.add(tick)

      /*
        Keep GSAP responsive without forcing unnecessary frame skipping.
      */
      gsap.ticker.lagSmoothing(500, 33)
    }

    const ctx = initMotion()

    return () => {
      ctx?.revert?.()

      if (tick) {
        gsap.ticker.remove(tick)
      }

      lenis?.destroy?.()
      bus.lenis = null
    }
  }, [])

  /*
    Unlock scrolling after the loader.
  */
  useEffect(() => {
    if (!ready) return

    if (bus.lenis) {
      bus.lenis.start()
    }

    requestAnimationFrame(() => {
      ScrollTrigger.refresh()
    })

    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh()
    }, 500)

    return () => clearTimeout(refreshTimer)
  }, [ready])

  return (
    <>
      {!ready && <Loader onDone={done} />}

      <Navbar ready={ready} />

      {mount && (
        <Suspense fallback={null}>
          <CloudScene />
        </Suspense>
      )}

      <main>
        <Hero ready={ready} />

        <ExecutiveProfile />

        <Experience />

        <Expertise />

        <Recognition />

        <Contact />
      </main>

      <Footer />
    </>
  )
}