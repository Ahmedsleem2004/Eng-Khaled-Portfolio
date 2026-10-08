
import { useCallback, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { reduce } from '../store'

export default function Loader({ onDone }) {
  const rootRef = useRef(null)
  const leftCloudRef = useRef(null)
  const rightCloudRef = useRef(null)
  const backCloudRef = useRef(null)

  const logoRef = useRef(null)
  const subtitleRef = useRef(null)
  const lineRef = useRef(null)
  const counterRef = useRef(null)

  const finishedRef = useRef(false)

  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true

    const tl = gsap.timeline({
      onComplete: () => {
        onDone?.()
      },
    })

    tl.to(leftCloudRef.current, {
      x: '-120%',
      scale: 1.3,
      opacity: 0,
      duration: 1,
      ease: 'power4.inOut',
    }, 0)

    tl.to(rightCloudRef.current, {
      x: '120%',
      scale: 1.3,
      opacity: 0,
      duration: 1,
      ease: 'power4.inOut',
    }, 0)

    tl.to(backCloudRef.current, {
      scale: 2,
      opacity: 0,
      duration: 1,
      ease: 'power3.in',
    }, 0)

    tl.to(logoRef.current, {
      scale: 1.08,
      y: -20,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.in',
    }, 0)

    tl.to(subtitleRef.current, {
      y: -15,
      opacity: 0,
      duration: 0.4,
    }, 0)

    tl.to(lineRef.current, {
      scaleX: 0,
      opacity: 0,
      duration: 0.4,
    }, 0)

    tl.to(counterRef.current, {
      y: 15,
      opacity: 0,
      duration: 0.3,
    }, 0)

    tl.to(rootRef.current, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.inOut',
    }, 0.55)
  }, [onDone])

  useEffect(() => {
    if (!rootRef.current) return

    const ctx = gsap.context(() => {
      gsap.set(leftCloudRef.current, {
        x: '-35%',
        opacity: 0,
        scale: 1.15,
      })

      gsap.set(rightCloudRef.current, {
        x: '35%',
        opacity: 0,
        scale: 1.15,
      })

      gsap.set(backCloudRef.current, {
        scale: 0.6,
        opacity: 0,
      })

      gsap.set(logoRef.current, {
        y: 50,
        scale: 0.85,
        opacity: 0,
      })

      gsap.set(subtitleRef.current, {
        y: 20,
        opacity: 0,
      })

      gsap.set(lineRef.current, {
        scaleX: 0,
        opacity: 0,
      })

      gsap.set(counterRef.current, {
        y: 15,
        opacity: 0,
      })

      const tl = gsap.timeline()

      tl.to(backCloudRef.current, {
        scale: 1,
        opacity: 0.85,
        duration: 1.4,
        ease: 'power3.out',
      }, 0)

      tl.to(leftCloudRef.current, {
        x: '-5%',
        opacity: 0.85,
        scale: 1,
        duration: 1.5,
        ease: 'power3.out',
      }, 0.15)

      tl.to(rightCloudRef.current, {
        x: '5%',
        opacity: 0.85,
        scale: 1,
        duration: 1.5,
        ease: 'power3.out',
      }, 0.15)

      tl.to(logoRef.current, {
        y: 0,
        scale: 1,
        opacity: 1,
        duration: 1,
        ease: 'power4.out',
      }, 0.8)

      tl.to(subtitleRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'power3.out',
      }, 1.35)

      tl.to(lineRef.current, {
        scaleX: 1,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.inOut',
      }, 1.5)

      tl.to(counterRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.4,
      }, 1.6)

      const counter = {
        value: 0,
      }

      tl.to(counter, {
        value: 100,
        duration: 2.1,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (!counterRef.current) return

          counterRef.current.textContent =
            `${Math.round(counter.value)}%`
        },
      }, 1.7)

      tl.to(logoRef.current, {
        scale: 1.025,
        duration: 0.5,
        yoyo: true,
        repeat: 1,
        ease: 'sine.inOut',
      }, 3.25)

      tl.call(finish, [], 3.85)

      gsap.to(leftCloudRef.current, {
        y: -20,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      gsap.to(rightCloudRef.current, {
        y: 20,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      gsap.to(backCloudRef.current, {
        scale: 1.08,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
    }, rootRef)

    return () => {
      ctx.revert()
    }
  }, [finish])

  return (
    <div
      ref={rootRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        overflow: 'hidden',
        background: '#030405',
        perspective: '1200px',
        width: '100vw',
        height: '100vh',
      }}
    >

      {/* BACK ATMOSPHERE */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(
              circle at center,
              rgba(184,151,90,0.10),
              transparent 55%
            )
          `,
        }}
      />

      {/* BACK CLOUD */}
      <div
        ref={backCloudRef}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '90vw',
          height: '90vh',
          transform: 'translate(-50%, -50%)',
          background: `
            radial-gradient(
              ellipse at center,
              rgba(210,215,220,.20) 0%,
              rgba(120,130,140,.13) 30%,
              transparent 70%
            )
          `,
          filter: 'blur(45px)',
        }}
      />

      {/* LEFT CLOUD */}
      <div
        ref={leftCloudRef}
        style={{
          position: 'absolute',
          left: '-20vw',
          top: '-10vh',
          width: '80vw',
          height: '120vh',
          background: `
            radial-gradient(
              ellipse at 70% 50%,
              rgba(220,224,228,.28) 0%,
              rgba(145,152,160,.18) 25%,
              rgba(70,75,82,.08) 50%,
              transparent 72%
            )
          `,
          filter: 'blur(32px)',
        }}
      />

      {/* RIGHT CLOUD */}
      <div
        ref={rightCloudRef}
        style={{
          position: 'absolute',
          right: '-20vw',
          top: '-10vh',
          width: '80vw',
          height: '120vh',
          background: `
            radial-gradient(
              ellipse at 30% 50%,
              rgba(220,224,228,.28) 0%,
              rgba(145,152,160,.18) 25%,
              rgba(70,75,82,.08) 50%,
              transparent 72%
            )
          `,
          filter: 'blur(32px)',
        }}
      />

      {/* GOLD LIGHT */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 320,
          height: 320,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(184,151,90,.14), transparent 68%)',
          filter: 'blur(30px)',
        }}
      />

      {/* CENTER */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            zIndex: 5,
          }}
        >

          {/* LOGO */}
          <div
            ref={logoRef}
            style={{
              fontFamily: 'Georgia, Times New Roman, serif',
              fontSize: 'clamp(30px, 6vw, 72px)',
              fontWeight: 400,
              letterSpacing: '.25em',
              color: '#d9dadd',
              textShadow: `
                0 1px 0 #ffffff,
                0 2px 0 #9a9da1,
                0 4px 12px rgba(0,0,0,.8),
                0 0 35px rgba(184,151,90,.12)
              `,
              paddingLeft: '.25em',
              whiteSpace: 'nowrap',
            }}
          >
            KHALED SALEEM
          </div>

          {/* SUBTITLE */}
          <div
            ref={subtitleRef}
            style={{
              marginTop: 20,
              fontSize: 8,
              textTransform: 'uppercase',
              letterSpacing: '.65em',
              paddingLeft: '.65em',
              color: '#b8975a',
              fontFamily: 'Manrope, Arial, sans-serif',
            }}
          >
            EXECUTIVE PORTFOLIO
          </div>

          {/* PROGRESS */}
          <div
            style={{
              marginTop: 48,
              width: 'min(420px, 65vw)',
            }}
          >
            <div
              ref={lineRef}
              style={{
                height: 1,
                width: '100%',
                transformOrigin: 'center',
                background:
                  'linear-gradient(90deg, transparent, #b8975a, transparent)',
                boxShadow: '0 0 18px rgba(184,151,90,.45)',
              }}
            />

            <div
              style={{
                marginTop: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
              }}
            >
              <span
                style={{
                  fontSize: 7,
                  textTransform: 'uppercase',
                  letterSpacing: '.45em',
                  color: 'rgba(255,255,255,.3)',
                  fontFamily: 'Manrope, Arial, sans-serif',
                }}
              >
                ENTERING EXPERIENCE
              </span>

              <span
                ref={counterRef}
                style={{
                  fontSize: 9,
                  fontVariantNumeric: 'tabular-nums',
                  color: '#b8975a',
                  fontFamily: 'Manrope, Arial, sans-serif',
                }}
              >
                0%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CORNERS */}
      <div
        style={{
          position: 'absolute',
          left: 32,
          top: 32,
          fontSize: 7,
          letterSpacing: '.4em',
          color: 'rgba(255,255,255,.2)',
        }}
      >
        KS / 001
      </div>

      <div
        style={{
          position: 'absolute',
          right: 32,
          top: 32,
          fontSize: 7,
          letterSpacing: '.4em',
          color: 'rgba(255,255,255,.2)',
        }}
      >
        ALOROBAH
      </div>

      <div
        style={{
          position: 'absolute',
          left: 32,
          bottom: 32,
          fontSize: 7,
          letterSpacing: '.4em',
          color: 'rgba(255,255,255,.2)',
        }}
      >
        MADINAH · KSA
      </div>

      <div
        style={{
          position: 'absolute',
          right: 32,
          bottom: 32,
          fontSize: 7,
          letterSpacing: '.4em',
          color: 'rgba(255,255,255,.2)',
        }}
      >
        2026
      </div>

      {reduce && (
        <style>{`
          * {
            animation: none !important;
            transition: none !important;
          }
        `}</style>
      )}
    </div>
  )
}

