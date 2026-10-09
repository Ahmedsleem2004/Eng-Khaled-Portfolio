import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ArrowDown } from 'lucide-react'
import { reduce } from '../store'

const NAME = ['KHALED', 'SALEEM']

export default function Hero({ ready }) {
  const root = useRef()

  useEffect(() => {
    if (!ready) return
    const k = reduce ? 0.01 : 1
    const q = s => root.current.querySelectorAll(s)
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.fromTo(q('.h-name i'), { yPercent: 110 }, { yPercent: 0, duration: 1.3 * k, stagger: 0.06 * k })
      .fromTo(q('.h-line'), { scaleX: 0 }, { scaleX: 1, duration: 1.2 * k, ease: 'power3.inOut' }, 0.7 * k)
      .fromTo(q('.h-sub'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 1 * k }, 1.2 * k)
      .to(q('.cta'), { opacity: 0.8, duration: 1 * k }, 1.8 * k)
    return () => tl.kill()
  }, [ready])

  return (
    <section id="hero" className="hero" ref={root}>
      <h1 className="h-name" aria-label="Khaled Saleem">
        {NAME.map((word, w) => (
          <span className="w" key={w} aria-hidden="true">
            {word.split('').map((c, i) => (
              <span className="c" key={i}><i>{c}</i></span>
            ))}
          </span>
        ))}
      </h1>
      <div className="h-line" />
      <p className="h-sub">CHIEF EXECUTIVE OFFICER</p>
      <a className="cta" href="#profile" aria-label="Scroll to profile"
        onClick={e => {
          e.preventDefault()
          document.getElementById('profile').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })
        }}>
        <ArrowDown size={16} strokeWidth={1} />
      </a>
    </section>
  )
}