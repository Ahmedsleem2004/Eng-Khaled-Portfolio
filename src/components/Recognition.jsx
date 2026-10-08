import { useState } from 'react'
import { CERTS } from '../data'
import { mobile } from '../store'
import CertificateViewer, { CertFace } from './CertificateViewer'

export default function Recognition() {
  const [open, setOpen] = useState(null)
  const move = e => {
    if (mobile) return
    const el = e.currentTarget, r = el.getBoundingClientRect()
    el.style.transform = `rotateY(${((e.clientX - r.left) / r.width - .5) * 14}deg) rotateX(${(.5 - (e.clientY - r.top) / r.height) * 10}deg) translateZ(20px)`
  }
  return (
    <section id="recognition">
      <p className="meta">RECOGNITION</p>
      <h2 className="ti">Recognition &amp; impact</h2>
      <div className="gal">
        {CERTS.map(c => (
          <button className="fr" key={c.id} onClick={() => setOpen(c)} onPointerMove={move}
            onPointerLeave={e => (e.currentTarget.style.transform = '')} aria-label={`Open certificate: ${c.org}`}>
            <div className="cert"><CertFace c={c} /></div>
            <div className="cap">0{c.id} — {c.org.toUpperCase()}</div>
          </button>
        ))}
      </div>
      <div id="profdev" className="pd">
        <h3 className="ti">Diploma in Operations Management</h3>
        <p>Alison<br />CPD Certified<br />2023</p>
      </div>
      {open && <CertificateViewer cert={open} onClose={() => setOpen(null)} />}
    </section>
  )
}
