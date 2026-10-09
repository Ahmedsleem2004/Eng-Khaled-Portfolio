import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { reduce } from '../store'

const FLOORS = 14, FH = 0.62, W = 3.2, D = 2.4
const GOLD = 0xb8975a

export default function Loader({ onDone }) {
  const root = useRef(), mount = useRef(), num = useRef()
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const k = reduce ? 0.01 : 1
    const el = root.current, box = mount.current
    const q = s => el.querySelectorAll(s)
    document.body.style.overflow = 'hidden'

    /* ---------- renderer / scene ---------- */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    box.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x0b0b0d, 22, 48)
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)

    scene.add(new THREE.AmbientLight(0xffffff, 0.55))
    const key = new THREE.DirectionalLight(0xffe2b0, 2.4); key.position.set(6, 12, 8); scene.add(key)
    const rim = new THREE.DirectionalLight(0x7f9bff, 0.9); rim.position.set(-8, 5, -6); scene.add(rim)
    const glow = new THREE.PointLight(GOLD, 0, 14, 2); glow.position.set(0, FLOORS * FH * 0.5, 0); scene.add(glow)

    /* ---------- helpers ---------- */
    const mk = o => new THREE.MeshStandardMaterial(o)
    const lineM = op => new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: op })
    const edges = (geo, op) => new THREE.LineSegments(new THREE.EdgesGeometry(geo), lineM(op))
    const segs = arr => new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(arr, 3))
    const goldMat = mk({ color: GOLD, metalness: 0.8, roughness: 0.35 })
    const concrete = mk({ color: 0x3a3b3f, roughness: 0.85 })

    /* ---------- ground: grid + rings + foundation ---------- */
    const grid = new THREE.GridHelper(40, 40, GOLD, GOLD)
    grid.position.y = -0.2
    grid.material.transparent = true; grid.material.opacity = 0
    scene.add(grid)
    ;[7, 11, 15].forEach(r => {
      const g = new THREE.RingGeometry(r, r + 0.025, 96); g.rotateX(-Math.PI / 2)
      const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.18, side: THREE.DoubleSide }))
      m.position.y = -0.19; scene.add(m)
    })
    const fGeo = new THREE.BoxGeometry(W + 1.2, 0.2, D + 1.2); fGeo.translate(0, -0.1, 0)
    const found = new THREE.Mesh(fGeo, mk({ color: 0x1c1d20, roughness: 0.9 }))
    found.add(edges(fGeo, 0.6)); found.scale.set(0.01, 1, 0.01); scene.add(found)

    /* ---------- building floors ---------- */
    const colPos = [[-W / 2, -D / 2], [W / 2, -D / 2], [-W / 2, D / 2], [W / 2, D / 2], [0, -D / 2], [0, D / 2]]
    const cGeo = new THREE.BoxGeometry(0.1, FH, 0.1); cGeo.translate(0, FH / 2, 0)
    const sGeo = new THREE.BoxGeometry(W + 0.2, 0.07, D + 0.2)
    const gGeo = new THREE.BoxGeometry(W - 0.04, FH - 0.07, D - 0.04)
    const mp = []
    for (let x = -W / 2 + 0.4; x < W / 2; x += 0.4)
      mp.push(x, 0.035, D / 2 - 0.02, x, FH - 0.035, D / 2 - 0.02, x, 0.035, -D / 2 + 0.02, x, FH - 0.035, -D / 2 + 0.02)
    for (let z = -D / 2 + 0.4; z < D / 2; z += 0.4)
      mp.push(W / 2 - 0.02, 0.035, z, W / 2 - 0.02, FH - 0.035, z, -W / 2 + 0.02, 0.035, z, -W / 2 + 0.02, FH - 0.035, z)
    const mGeo = segs(mp)

    const floors = []
    for (let i = 0; i < FLOORS; i++) {
      const g = new THREE.Group(); g.position.y = i * FH
      const cols = colPos.map(([x, z]) => {
        const m = new THREE.Mesh(cGeo, concrete); m.position.set(x, 0, z); m.scale.y = 0.001; g.add(m); return m
      })
      const sm = mk({ color: 0x2c2d31, roughness: 0.7, metalness: 0.2, transparent: true, opacity: 0 })
      const slab = new THREE.Mesh(sGeo, sm); slab.position.y = FH - 0.035 + 1.4
      const se = edges(sGeo, 0); slab.add(se); g.add(slab)
      const gm = mk({ color: 0x9db2c6, metalness: 0.85, roughness: 0.12, transparent: true, opacity: 0, depthWrite: false })
      const glass = new THREE.Mesh(gGeo, gm); glass.position.y = FH / 2
      const ge = edges(gGeo, 0); glass.add(ge); g.add(glass)
      const gl = new THREE.LineSegments(mGeo, lineM(0)); g.add(gl)
      scene.add(g)
      floors.push({ cols, slab, sm, se, gm, ge, gl })
    }

    /* ---------- crown (spire) ---------- */
    const H = FLOORS * FH
    const spGeo = new THREE.CylinderGeometry(0.02, 0.05, 1.6, 8); spGeo.translate(0, 0.8, 0)
    const spire = new THREE.Mesh(spGeo, goldMat); spire.position.y = H; spire.scale.y = 0.001; scene.add(spire)

    /* ---------- tower crane ---------- */
    const CH = H + 2.2, TX = W / 2 + 1.4
    const crane = new THREE.Group(); crane.position.set(TX, 0, 0); scene.add(crane)
    const s = 0.5, seg = 0.5, cr = [[-s / 2, -s / 2], [s / 2, -s / 2], [s / 2, s / 2], [-s / 2, s / 2]]
    const lat = []
    cr.forEach(([x, z]) => lat.push(x, 0, z, x, CH, z))
    for (let y = 0; y < CH - 0.01; y += seg)
      for (let c = 0; c < 4; c++) {
        const a = cr[c], b = cr[(c + 1) % 4], y2 = Math.min(y + seg, CH)
        lat.push(a[0], y, a[1], b[0], y, b[1], a[0], y, a[1], b[0], y2, b[1])
      }
    const mast = new THREE.LineSegments(segs(lat), lineM(0.95)); mast.scale.y = 0.001; crane.add(mast)
    const base = new THREE.Mesh(new THREE.BoxGeometry(1, 0.3, 1), concrete); base.position.y = 0.15; crane.add(base)

    const jib = new THREE.Group(); jib.position.y = CH; jib.scale.setScalar(0.001); crane.add(jib)
    const j = []
    for (const z of [-0.12, 0.12]) {
      j.push(-1.5, 0, z, 4.7, 0, z, -1.5, 0.4, z, 4.7, 0.4, z)
      for (let x = -1.5; x < 4.69; x += 0.4) j.push(x, 0, z, x + 0.4, 0.4, z, x, 0.4, z, x, 0, z)
    }
    for (let x = -1.5; x <= 4.7; x += 0.8) j.push(x, 0, -0.12, x, 0, 0.12)
    j.push(0, 0.4, 0, 0, 1.2, 0, 0, 1.2, 0, -1.5, 0.4, 0, 0, 1.2, 0, 4.7, 0.4, 0)
    jib.add(new THREE.LineSegments(segs(j), lineM(0.95)))
    const cw = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.3), concrete); cw.position.set(-1.3, -0.15, 0); jib.add(cw)
    const cab = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.24, 0.24), goldMat); cab.position.set(0.35, -0.2, 0.2); jib.add(cab)
    const trolley = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.3), goldMat); trolley.position.set(TX, -0.05, 0); jib.add(trolley)
    const cable = new THREE.Line(segs([0, 0, 0, 0, -1, 0]), lineM(0.8)); cable.position.x = TX; jib.add(cable)
    const load = new THREE.Group(); load.position.x = TX; jib.add(load)
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.07, 0.12), goldMat); load.add(beam)
    load.add(new THREE.LineSegments(segs([0, 0.4, 0, -0.45, 0.03, 0, 0, 0.4, 0, 0.45, 0.03, 0]), lineM(0.8)))

    /* ---------- camera + sizing ---------- */
    const cam = { a: -0.9, y: 12, zoom: 1.2 }
    const prog = { h: 0 }
    let fitR = 21
    const size = () => {
      const w = box.clientWidth || 1, h = box.clientHeight || 1
      renderer.setSize(w, h, false)
      camera.aspect = w / h; camera.updateProjectionMatrix()
      fitR = Math.max(21, 9.5 / (camera.aspect * 0.6887))
    }
    size()
    const ro = new ResizeObserver(size); ro.observe(box)

    const tick = t => {
      jib.rotation.y = Math.PI + Math.sin(t * 0.55) * 0.55
      const target = Math.max(prog.h + 1.0, 1.4) + Math.sin(t * 1.3) * 0.25
      const L = CH - target
      cable.scale.y = L; load.position.y = -L
      const r = fitR * cam.zoom
      camera.position.set(Math.sin(cam.a) * r, cam.y, Math.cos(cam.a) * r)
      camera.lookAt(0, 6.4, 0)
      renderer.render(scene, camera)
    }
    gsap.ticker.add(tick)

    /* ---------- timeline ---------- */
    const c = { v: 0 }
    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: () => { document.body.style.overflow = ''; setGone(true) }
    })
    tl.to(c, { v: 100, duration: 5.6 * k, ease: 'power1.inOut',
        onUpdate: () => { num.current.textContent = String(Math.round(c.v)).padStart(3, '0') } }, 0)
      .to(cam, { a: 0.6, duration: 6.4 * k, ease: 'none' }, 0)
      .to(cam, { y: 7, zoom: 1, duration: 5.5 * k }, 0)
      .to(grid.material, { opacity: 0.16, duration: 1 * k }, 0)
      .to(found.scale, { x: 1, z: 1, duration: 0.9 * k }, 0.1 * k)
      .to(mast.scale, { y: 1, duration: 1.3 * k, ease: 'power2.inOut' }, 0.5 * k)
      .to(jib.scale, { x: 1, y: 1, z: 1, duration: 0.7 * k }, 1.5 * k)

    floors.forEach((f, i) => {
      const t0 = (1.3 + i * 0.25) * k
      tl.to(prog, { h: (i + 1) * FH, duration: 0.4 * k, ease: 'none' }, t0)
        .to(f.cols.map(x => x.scale), { y: 1, duration: 0.4 * k, stagger: 0.03 * k }, t0)
        .to(f.slab.position, { y: FH - 0.035, duration: 0.5 * k, ease: 'power3.out' }, t0 + 0.25 * k)
        .to(f.sm, { opacity: 1, duration: 0.3 * k }, t0 + 0.25 * k)
        .to(f.se.material, { opacity: 0.8, duration: 0.3 * k }, t0 + 0.25 * k)
        .to(f.gm, { opacity: 0.3, duration: 0.6 * k }, t0 + 0.5 * k)
        .to(f.ge.material, { opacity: 0.6, duration: 0.6 * k }, t0 + 0.5 * k)
        .to(f.gl.material, { opacity: 0.35, duration: 0.6 * k }, t0 + 0.5 * k)
    })

    const tEnd = (1.3 + FLOORS * 0.25) * k
    tl.to(spire.scale, { y: 1, duration: 0.7 * k }, tEnd)
      .to(glow, { intensity: 40, duration: 1.2 * k }, tEnd)

      /* الاسم يتكتب فوق المشهد */
      .fromTo(q('.name span'), { opacity: 0, y: 30, filter: 'blur(12px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1 * k, stagger: 0.1 * k }, 3.4 * k)
      .fromTo(q('.rule'), { scaleX: 0 }, { scaleX: 1, duration: 1.2 * k, ease: 'power3.inOut' }, 4.4 * k)
      .fromTo(q('.tag'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 1 * k }, 4.8 * k)

      /* خروج: الستارة تتفتح */
      .to(q('.stage'), { opacity: 0, y: -20, duration: 0.6 * k }, 6.4 * k)
      .add(() => onDone?.(), 6.7 * k)
      .to(q('.pt'), { yPercent: -100, duration: 1.3 * k, ease: 'power4.inOut' }, 6.8 * k)
      .to(q('.pb'), { yPercent: 100, duration: 1.3 * k, ease: 'power4.inOut' }, 6.8 * k)
      .to(q('.line-mid'), { scaleX: 0, duration: 0.6 * k }, 6.7 * k)

    return () => {
      tl.kill(); gsap.ticker.remove(tick); ro.disconnect()
      scene.traverse(o => {
        o.geometry?.dispose()
        const m = o.material
        Array.isArray(m) ? m.forEach(x => x.dispose()) : m?.dispose()
      })
      renderer.dispose(); renderer.domElement.remove()
      document.body.style.overflow = ''
    }
  }, [])

  if (gone) return null
  return (
    <div ref={root} className="loader">
      <div className="pt" /><div className="pb" />
      <div className="line-mid" />
      <div className="stage">
        <div ref={mount} className="gl3d" />
        <div className="title">
          <div className="name" aria-label="El Dagal">
            {'EL DAGAL'.split('').map((ch, i) => <span key={i}>{ch === ' ' ? '\u00A0' : ch}</span>)}
          </div>
          <div className="rule" />
          <div className="tag">CONTRACTING &amp; DEVELOPMENT</div>
        </div>
        <div className="count"><span ref={num}>000</span><i>%</i></div>
      </div>
    </div>
  )
}