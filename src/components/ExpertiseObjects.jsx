import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Edges } from '@react-three/drei'
import * as THREE from 'three'
import { world, mobile } from '../store'

/*
  ExpertiseObjects — four construction-themed sculptures living inside the WebGL world.
  ⚠ This component uses R3F hooks, so it must render INSIDE <Canvas> (CloudScene.jsx), never in a normal section.
  Each object locks onto an empty <div data-zone> in Expertise.jsx.

    0 Executive Leadership   → a skyline: glass tower with gold spire between two titanium towers
    1 Business Development   → a building rising floor by floor (completes on hover)
    2 Operations             → a tower crane: slewing jib, travelling trolley, lowering hook
    3 Strategic Development  → a master-plan site model: blocks rise on a plot, gold marker + survey ring
*/

const D = 8
const GOLD = '#b8975a'
const TI = '#b9bdc2'
const ease = x => x * x * (3 - 2 * x)
const clamp = THREE.MathUtils.clamp

/* ---------- materials ---------- */
const Titanium = () => (
  <meshPhysicalMaterial color={TI} metalness={1} roughness={.2} clearcoat={.7} clearcoatRoughness={.2} envMapIntensity={1.6} />
)
const Gold = () => <meshStandardMaterial color={GOLD} metalness={1} roughness={.26} envMapIntensity={1.5} />
// Desktop: refractive glass (shared transmission pass). Mobile: polished metal, no extra render pass.
const Glass = () =>
  mobile ? (
    <meshStandardMaterial color="#9aa0a6" metalness={.85} roughness={.2} envMapIntensity={1.5} />
  ) : (
    <meshPhysicalMaterial color="#eef1f4" transmission={1} thickness={1.2} ior={1.45} roughness={.05}
      dispersion={.4} envMapIntensity={1.8} attenuationColor="#d9c9a3" attenuationDistance={3} />
  )
const GoldEdges = () => <Edges threshold={15} color={GOLD} scale={1.001} />
const Box = ({ s, p, m = 'ti', edges }) => (
  <mesh position={p}>
    <boxGeometry args={s} />
    {m === 'gold' ? <Gold /> : m === 'glass' ? <Glass /> : <Titanium />}
    {edges && <GoldEdges />}
  </mesh>
)
const H = (hv, i) => hv.current[i]

/* 0 · EXECUTIVE LEADERSHIP — the skyline: one tower leading the others */
function Skyline({ hv, i }) {
  const spire = useRef()
  useFrame(() => { spire.current.position.y = 1.98 + H(hv, i) * .22 })
  const B = -1.3
  return (
    <group>
      <Box s={[2.7, .12, 1.7]} p={[0, B, 0]} />
      <Box s={[2.5, .04, 1.5]} p={[0, B + .08, 0]} m="gold" />
      {/* main glass tower + setback crown */}
      <mesh position={[0, B + 1.2, 0]}><boxGeometry args={[.9, 2.4, .9]} /><Glass /><GoldEdges /></mesh>
      <Box s={[.62, .6, .62]} p={[0, B + 2.7, 0]} edges />
      {[1, 2, 3, 4, 5].map(k => <Box key={k} s={[.94, .025, .94]} p={[0, B + k * .4, 0]} m="gold" />)}
      <mesh ref={spire} position={[0, 1.98, 0]} scale={[1, .9, 1]}><cylinderGeometry args={[.012, .035, 1, 10]} /><Gold /></mesh>
      {/* flanking towers */}
      <Box s={[.5, 1.3, .5]} p={[-1.0, B + .65, .1]} />
      <Box s={[.55, 1.7, .55]} p={[1.0, B + .85, -.1]} />
      {[.4, .8, 1.2].map(y => <Box key={y} s={[.52, .02, .52]} p={[-1.0, B + y, .1]} m="gold" />)}
      {[.4, .8, 1.2, 1.6].map(y => <Box key={y} s={[.57, .02, .57]} p={[1.0, B + y, -.1]} m="gold" />)}
    </group>
  )
}

/* 1 · BUSINESS DEVELOPMENT — a structure going up, floor by floor */
function Rising({ hv, i }) {
  const floors = useRef([]), cap = useRef()
  const N = 5, FH = .5, B = -1.15
  useFrame(({ clock }) => {
    const h = H(hv, i)
    const prog = THREE.MathUtils.lerp(.5 + Math.sin(clock.elapsedTime * .5) * .08, 1, h) * N // idle: mid-build, hover: topped out
    floors.current.forEach((g, k) => {
      const s = clamp(prog - k, 0, 1)
      g.visible = s > .001; g.scale.y = Math.max(.001, s)
    })
    cap.current.scale.setScalar(Math.max(.001, clamp((prog - (N - .3)) / .3, 0, 1)))
  })
  return (
    <group>
      <Box s={[1.9, .1, 1.5]} p={[0, B - .05, 0]} />
      {Array.from({ length: N }, (_, k) => (
        <group key={k} ref={el => (floors.current[k] = el)} position={[0, B + k * FH, 0]}>
          <Box s={[1.5, .07, 1.1]} p={[0, 0, 0]} />
          {[[-.7, -.5], [.7, -.5], [-.7, .5], [.7, .5]].map(([x, z], c) => <Box key={c} s={[.06, FH, .06]} p={[x, FH / 2, z]} m="gold" />)}
          {!mobile && k < 3 && <Box s={[1.4, FH - .08, .02]} p={[0, FH / 2 + .02, .55]} m="glass" />}
        </group>
      ))}
      <group ref={cap} position={[0, B + N * FH + .04, 0]}>
        <Box s={[1.6, .06, 1.2]} p={[0, 0, 0]} m="gold" />
      </group>
    </group>
  )
}

/* 2 · OPERATIONS — a tower crane in motion */
function Crane({ hv, i }) {
  const slew = useRef(), troll = useRef(), cable = useRef(), load = useRef()
  useFrame(({ clock }, dt) => {
    const h = H(hv, i), t = clock.elapsedTime
    slew.current.rotation.y += dt * (.18 + h * .9)
    troll.current.position.x = .95 + Math.sin(t * .5) * .45
    const L = .75 + h * .55 + Math.sin(t * .7) * .08
    cable.current.scale.y = L; cable.current.position.y = -L / 2
    load.current.position.y = -L - .1
  })
  const levels = [0, 1, 2, 3, 4]
  return (
    <group scale={.62} position={[-.4, 0, 0]}>
      <Box s={[1.2, .12, 1.2]} p={[0, -1.3, 0]} />
      {[[-.14, -.14], [.14, -.14], [-.14, .14], [.14, .14]].map(([x, z], k) => <Box key={k} s={[.05, 2.4, .05]} p={[x, -.1, z]} />)}
      {levels.map(k => {
        const y = -1.15 + k * .5
        return <group key={k}>
          <Box s={[.33, .025, .025]} p={[0, y, -.14]} /><Box s={[.33, .025, .025]} p={[0, y, .14]} />
          <Box s={[.025, .025, .33]} p={[-.14, y, 0]} /><Box s={[.025, .025, .33]} p={[.14, y, 0]} />
        </group>
      })}
      <group ref={slew} position={[0, 1.15, 0]}>
        <Box s={[.34, .26, .34]} p={[0, .05, 0]} m="gold" />
        <mesh position={[0, .38, 0]}><coneGeometry args={[.1, .35, 4]} /><Titanium /></mesh>
        <Box s={[2.7, .07, .11]} p={[.95, 0, 0]} />            {/* jib */}
        <Box s={[1.0, .07, .11]} p={[-.75, 0, 0]} />           {/* counter-jib */}
        <Box s={[.34, .24, .24]} p={[-1.1, -.14, 0]} m="gold" />{/* counterweight */}
        <group ref={troll} position={[.95, -.06, 0]}>
          <Box s={[.14, .07, .14]} p={[0, 0, 0]} m="gold" />
          <mesh ref={cable}><cylinderGeometry args={[.008, .008, 1, 6]} /><Gold /></mesh>
          <group ref={load}>
            <Box s={[.1, .08, .1]} p={[0, .1, 0]} m="gold" />
            <Box s={[.5, .12, .2]} p={[0, 0, 0]} />
          </group>
        </group>
      </group>
    </group>
  )
}

/* 3 · STRATEGIC DEVELOPMENT — master-plan model of a site */
const PLAN = [ // x, z, w, d, height
  [-.8, -.7, .6, .6, 1.0], [.1, -.8, .5, .5, 1.6], [.9, -.5, .6, .6, .7], [-.7, .2, .5, .8, .6],
  [.3, .3, .7, .5, 1.1], [1.0, .5, .4, .4, .5], [-.3, 1.0, .6, .4, .45], [.7, 1.1, .4, .4, .9]
]
function MasterPlan({ hv, i }) {
  const blocks = useRef([]), pin = useRef(), ring = useRef()
  useFrame(({ clock }, dt) => {
    const h = H(hv, i), t = clock.elapsedTime
    blocks.current.forEach((g, k) => { g.scale.y = 1 + h * (.15 + k * .05) + Math.sin(t * .6 + k) * .02 })
    pin.current.position.y = -.05 + PLAN[1][4] * blocks.current[1].scale.y + .28 + Math.sin(t * 2) * .03
    ring.current.rotation.z += dt * (.12 + h * .6)
  })
  return (
    <group scale={.74} position={[0, -.2, 0]}>
      <mesh position={[0, -.1, 0]}><boxGeometry args={[3, .1, 3]} /><Titanium /><GoldEdges /></mesh>
      <mesh ref={ring} position={[0, -.04, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[2.05, .012, 8, 160]} /><Gold /></mesh>
      {PLAN.map(([x, z, w, d, hh], k) => (
        <group key={k} ref={el => (blocks.current[k] = el)} position={[x, -.05, z]}>
          <mesh position={[0, hh / 2, 0]}>
            <boxGeometry args={[w, hh, d]} />
            {k === 1 || k === 4 ? <Glass /> : k === 5 ? <Gold /> : <Titanium />}
            {k === 1 && <GoldEdges />}
          </mesh>
        </group>
      ))}
      <mesh ref={pin} rotation={[Math.PI, 0, 0]}><coneGeometry args={[.09, .24, 14]} /><Gold /></mesh>
    </group>
  )
}

const SHAPES = [Skyline, Rising, Crane, MasterPlan]

/* soft warm halo behind each object — opens on hover */
function haloTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128
  const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  gr.addColorStop(0, 'rgba(255,230,190,.9)'); gr.addColorStop(.35, 'rgba(184,151,90,.35)'); gr.addColorStop(1, 'rgba(184,151,90,0)')
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
}

export default function ExpertiseObjects() {
  const groups = useRef([]), halos = useRef([]), zones = useRef([]), light = useRef()
  const hv = useRef([0, 0, 0, 0])
  const v = useMemo(() => new THREE.Vector3(), []), lv = useMemo(() => new THREE.Vector3(), [])
  const tex = useMemo(haloTexture, [])
  useEffect(() => () => tex.dispose(), [tex])

  useFrame(({ camera, clock }, dt) => {
    if (!zones.current.length) zones.current = [...document.querySelectorAll('[data-zone]')]
    const vw = innerWidth, vh = innerHeight, t = clock.elapsedTime
    const halfH = Math.tan(camera.fov * Math.PI / 360) * D, halfW = halfH * camera.aspect, pw = (2 * halfH) / vh
    let best = -1, bestV = 0, any = 0

    zones.current.forEach((el, i) => {
      const g = groups.current[i]; if (!g) return
      const r = el.getBoundingClientRect()
      const seen = r.bottom > -120 && r.top < vh + 120
      g.visible = seen; if (!seen) return

      const cx = r.left + r.width / 2, cy = r.top + r.height / 2
      const e = ease(clamp((vh * 1.05 - cy) / (vh * .5), 0, 1)) // emerges from depth as you scroll in
      hv.current[i] += ((world.hover === i ? 1 : 0) - hv.current[i]) * Math.min(1, dt * 6)
      const h = hv.current[i]
      if (h > bestV) { bestV = h; best = i }
      any = Math.max(any, h)

      v.set((cx / vw * 2 - 1) * halfW, -(cy / vh * 2 - 1) * halfH, -D)
      camera.localToWorld(v)
      g.position.copy(v)
      g.position.y += Math.sin(t * .8 + i * 1.7) * .08

      g.scale.setScalar(Math.max(.001, Math.min(r.width, r.height) * pw * .34 * e * (1 + h * .12)))

      // architectural presentation: a slow turntable (not a spin) + pointer parallax
      g.rotation.y += dt * (.16 + h * .45)
      g.rotation.x += ((.18 + world.zy * .6 * h + world.my * .2 + (1 - e) * .9) - g.rotation.x) * .08
      g.rotation.z += ((-world.zx * .25 * h) - g.rotation.z) * .08

      const halo = halos.current[i]
      if (halo) halo.material.opacity = (.05 + h * .38) * e
    })

    world.hv = any
    const tgt = groups.current[best]
    if (tgt) light.current.position.copy(tgt.position).add(lv.set(1.5, 1.7, 2.6))
    light.current.intensity += ((best >= 0 ? 34 : 3) - light.current.intensity) * .1
  })

  return (
    <>
      <pointLight ref={light} color="#ffd9a0" distance={14} intensity={3} />
      {SHAPES.map((S, i) => (
        <group key={i} ref={el => (groups.current[i] = el)} visible={false}>
          <S hv={hv} i={i} />
          <sprite ref={el => (halos.current[i] = el)} position={[0, 0, -1.6]} scale={[5.2, 5.2, 1]}>
            <spriteMaterial map={tex} color="#ffe2b0" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
        </group>
      ))}
    </>
  )
}
