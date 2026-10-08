import { TIMELINE } from '../data'
export default function Experience() {
  return (
    <section id="decade" className="decade">
      <div id="big10" aria-hidden="true">10</div>
      <p className="meta rel">10+ YEARS</p>
      <h2 className="ti rel">A decade of leadership</h2>
      <div className="tl rel">
        {TIMELINE.map((s, i) => <div className="st" key={i}><h3>{s.t}</h3><p>{s.d}</p></div>)}
      </div>
    </section>
  )
}
