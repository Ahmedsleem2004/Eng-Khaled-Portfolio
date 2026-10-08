import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ArrowDown } from 'lucide-react'
import { world, reduce } from '../store'

// The 3D name lives in CloudScene. This drives the 8-second film-style intro + HTML subtitle.
export default function Hero({ ready }) {
  const b = useRef(), em = useRef(), cta = useRef()
  useEffect(() => {
    if (!ready) return
    const k = reduce ? .01 : 1
    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } })
    tl.to(world, { intro: 1, duration: 5.5 * k })
      .to(world, { reveal: 1, duration: 3 * k }, 1.2 * k)
      .to(world, { k1: 1, duration: 2.2 * k, ease: 'power3.out' }, 3 * k)
      .to(world, { k2: 1, duration: 2.4 * k, ease: 'power3.out' }, 4.5 * k)
      .fromTo(b.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1.6 * k }, 6 * k)
      .fromTo(em.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1.6 * k }, 6.9 * k)
      .to(cta.current, { opacity: .85, duration: 1.4 * k }, 7.6 * k)
    return () => tl.kill()
  }, [ready])
  return (
    <section id="hero" className="hero">
      <h1 className="sr">Khaled Saleem</h1>
      <div className="sub">
        <b ref={b}>CHIEF EXECUTIVE OFFICER</b>
        <em ref={em}>10+ YEARS OF LEADERSHIP &amp; DEVELOPMENT</em>
      </div>
      <a ref={cta} className="cta" href="#profile"
        onClick={e => { e.preventDefault(); document.getElementById('profile').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }) }}>
        ENTER THE VISION <ArrowDown size={14} strokeWidth={1.2} />
      </a>
    </section>
  )
}
