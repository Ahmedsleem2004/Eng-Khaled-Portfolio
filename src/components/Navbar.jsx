import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Menu, X } from 'lucide-react'
import { bus, reduce } from '../store'

const LINKS = [
  ['profile', 'Profile'], ['decade', 'Leadership'], ['expertise', 'Expertise'],
  ['recognition', 'Recognition'], ['contact', 'Contact']
]

// Appears after the hero sequence, turns into a blurred bar on scroll, full-screen sheet on mobile.
export default function Navbar({ ready }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')
  const [solid, setSolid] = useState(false)
  const bar = useRef()

  useEffect(() => {
    if (ready) gsap.to(bar.current, { opacity: 1, duration: reduce ? .01 : 1.4, delay: reduce ? 0 : 6.8, ease: 'power2.out' })
  }, [ready])

  useEffect(() => {
    const onScroll = () => setSolid(scrollY > 80)
    onScroll(); addEventListener('scroll', onScroll, { passive: true })
    return () => removeEventListener('scroll', onScroll)
  }, [])

  // highlight the section currently crossing the middle of the screen
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && setActive(e.target.id === 'hero' ? '' : e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' })
    ;['hero', ...LINKS.map(l => l[0])].forEach(id => { const el = document.getElementById(id); el && io.observe(el) })
    return () => io.disconnect()
  }, [])

  // mobile sheet: lock scroll, close with ESC
  useEffect(() => {
    if (!open) return
    bus.lenis?.stop(); document.body.style.overflow = 'hidden'
    const key = e => e.key === 'Escape' && setOpen(false)
    addEventListener('keydown', key)
    return () => { removeEventListener('keydown', key); document.body.style.overflow = ''; bus.lenis?.start() }
  }, [open])

  const go = (e, id) => {
    e.preventDefault()
    const wasOpen = open; setOpen(false)
    setTimeout(() => {
      const el = document.getElementById(id); if (!el) return
      bus.lenis ? bus.lenis.scrollTo(el, { duration: 1.8 }) : el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })
    }, wasOpen ? 250 : 0)
  }

  return (
    <>
      <header ref={bar} className={'nav' + (solid && !open ? ' solid' : '')}>
        <a className="brand" href="#hero" onClick={e => go(e, 'hero')}>KHALED SALEEM</a>
        <nav className="links" aria-label="Primary">
          {LINKS.map(([id, label]) => (
            <a key={id} href={`#${id}`} className={active === id ? 'on' : ''} aria-current={active === id ? 'true' : undefined} onClick={e => go(e, id)}>{label}</a>
          ))}
        </nav>
        <button className="burger" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(o => !o)}>
          {open ? <X size={22} strokeWidth={1.2} /> : <Menu size={22} strokeWidth={1.2} />}
        </button>
      </header>
      <div className={'sheet' + (open ? ' open' : '')} aria-hidden={!open}>
        {LINKS.map(([id, label], i) => (
          <a key={id} href={`#${id}`} tabIndex={open ? 0 : -1} style={{ transitionDelay: open ? `${i * 70}ms` : '0ms' }} onClick={e => go(e, id)}>{label}</a>
        ))}
        <a className="mail" href="mailto:K.saleem@masdevco.com" tabIndex={open ? 0 : -1}>K.saleem@masdevco.com</a>
      </div>
    </>
  )
}
