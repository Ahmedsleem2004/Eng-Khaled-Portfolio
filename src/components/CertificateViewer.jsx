import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { X } from 'lucide-react'
import { world, bus, reduce } from '../store'

// Shows the real certificate image if /public/assets/certificate-N.jpg exists,
// otherwise falls back to a typeset version built from the data.
export function CertFace({ c }) {
  const [hasImg, setHasImg] = useState(true)
  return hasImg ? (
    <img src={`/assets/certificate-${c.id}.jpg`} alt={`${c.title} — ${c.org}`} onError={() => setHasImg(false)} />
  ) : (
    <>
      <small>{c.org.toUpperCase()}</small>
      <div>
        <h4>{c.title}</h4>
        <span>Presented to<br /><b>{c.to}</b><br />{c.text}{c.extra && <><br />{c.extra}</>}</span>
      </div>
    </>
  )
}

// Opening: the 3D camera dollies in, clouds dim, the certificate swings into focus. ESC / ✕ / backdrop closes.
export default function CertificateViewer({ cert, onClose }) {
  const root = useRef(), card = useRef(), closing = useRef(false)
  const close = () => {
    if (closing.current) return; closing.current = true
    gsap.to(world, { focus: 0, duration: .8 })
    gsap.to(root.current, { opacity: 0, duration: .4, onComplete: onClose })
  }
  useEffect(() => {
    bus.lenis?.stop(); document.body.style.overflow = 'hidden'
    gsap.to(world, { focus: 1, duration: reduce ? .01 : 1.2, ease: 'power2.out' })
    gsap.to(root.current, { opacity: 1, duration: .6 })
    gsap.fromTo(card.current, { scale: .7, rotateY: -30, rotateX: 8, y: 40 }, { scale: 1, rotateY: 0, rotateX: 0, y: 0, duration: reduce ? .01 : 1.1, ease: 'power3.out' })
    const key = e => e.key === 'Escape' && close()
    addEventListener('keydown', key)
    root.current.querySelector('button').focus()
    return () => { removeEventListener('keydown', key); document.body.style.overflow = ''; bus.lenis?.start() }
  }, [])
  const tilt = e => { if (!reduce) gsap.to(card.current, { rotateY: (e.clientX / innerWidth - .5) * 14, rotateX: -(e.clientY / innerHeight - .5) * 10, duration: .8, overwrite: 'auto' }) }
  return (
    <div className="view" ref={root} role="dialog" aria-modal="true" aria-label={cert.title}
      onClick={e => e.target === root.current && close()} onPointerMove={tilt}>
      <button className="x" onClick={close} aria-label="Close"><X size={18} strokeWidth={1.2} /></button>
      <div className="cert big" ref={card}><CertFace c={cert} /></div>
    </div>
  )
}
