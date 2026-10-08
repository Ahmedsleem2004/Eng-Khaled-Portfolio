import { useRef } from 'react'
import { mobile } from '../store'

export default function ExecutiveProfile() {
  const pr = useRef()

  const tilt = e => {
    if (mobile || !pr.current) return

    const r = pr.current.getBoundingClientRect()

    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5

    pr.current.style.transform = `
      perspective(1200px)
      rotateY(${x * 8}deg)
      rotateX(${y * -5}deg)
      scale(1.015)
    `
  }

  const resetTilt = () => {
    if (pr.current) {
      pr.current.style.transform = ''
    }
  }

  return (
    <section id="profile" className="prof">
      <div>
        <p className="meta">EXECUTIVE PROFILE</p>

        <h2 className="ti">
          The man behind the vision
        </h2>

        <p className="body" id="profBody">
          Khaled Saleem is a CEO and executive leader with more than 10 years
          of experience in development, leadership, and operational management.
        </p>
      </div>

      <div
        className="portrait"
        id="portrait"
        ref={pr}
        onPointerMove={tilt}
        onPointerLeave={resetTilt}
      >
        <img
          src="/assets/khaled.jpg"
          alt="Khaled Saleem"
        />

        <div className="portrait-light" aria-hidden="true" />
      </div>
    </section>
  )
}