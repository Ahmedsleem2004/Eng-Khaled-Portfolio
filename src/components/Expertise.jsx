import { useState } from 'react'
import { EXPERTISE } from '../data'
import { world } from '../store'

// No cards. Each .zone is an empty anchor; ExpertiseObjects (inside the WebGL canvas) tracks it every frame.
export default function Expertise() {
  const [on, setOn] = useState(-1)
  const set = i => { world.hover = i; setOn(i) }
  const tilt = e => {
    const r = e.currentTarget.getBoundingClientRect()
    world.zx = (e.clientX - r.left) / r.width - .5; world.zy = (e.clientY - r.top) / r.height - .5
  }
  return (
    <section id="expertise">
      <p className="meta">CORE EXPERTISE</p>
      <h2 className="ti">What drives the vision</h2>
      <div className="ex">
        {EXPERTISE.map((o, i) => (
          <div key={o.t} className={'slot' + (on === i ? ' on' : '')}
            onPointerEnter={() => set(i)} onPointerDown={() => set(i)}
            onPointerLeave={e => e.pointerType !== 'touch' && set(-1)} onPointerMove={tilt}>
            <div className="zone" data-zone />
            <div className="lab"><h3>{o.t}</h3><p>{o.d}</p></div>
          </div>
        ))}
      </div>
    </section>
  )
}
