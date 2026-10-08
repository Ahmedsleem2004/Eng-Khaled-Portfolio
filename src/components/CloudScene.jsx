import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, Text3D, Center } from '@react-three/drei'
import * as THREE from 'three'
import { world, mobile, reduce } from '../store'
import ExpertiseObjects from './ExpertiseObjects'

const SPAN = 190

function puffTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128
  const g = c.getContext('2d')
  for (let i = 0; i < 9; i++) {
    const x = 64 + (Math.random() - .5) * 44, y = 64 + (Math.random() - .5) * 44, r = 30 + Math.random() * 26
    const gr = g.createRadialGradient(x, y, 0, x, y, r)
    gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128)
  }
  return new THREE.CanvasTexture(c)
}

/* Layered soft sprites = atmospheric cloud bank. Recycled around the camera. */
function Clouds() {
  const { tex, sprites } = useMemo(() => {
    const tex = puffTexture(), n = mobile ? 34 : 84, sprites = []
    for (let i = 0; i < n; i++) {
      const m = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false,
        opacity: .14 + Math.random() * .1, color: Math.random() < .2 ? 0x9a8460 : 0x8d9298, rotation: Math.random() * 6.28 })
      const s = new THREE.Sprite(m)
      s.position.set((Math.random() - .5) * 70, (Math.random() - .5) * 34, -Math.random() * SPAN)
      s.scale.setScalar(26 + Math.random() * 34)
      s.userData = { b: m.opacity, sp: (Math.random() - .5) * .1, ph: Math.random() * 9 }
      sprites.push(s)
    }
    return { tex, sprites }
  }, [])
  useEffect(() => () => { tex.dispose(); sprites.forEach(s => s.material.dispose()) }, [tex, sprites])
  useFrame(({ camera, clock }) => {
    const t = clock.elapsedTime, p = world.p
    const open = Math.min(1, p * 9), back = Math.max(0, (p - .9) * 10)
    const dens = reduce ? .5 : (1 - .78 * open + .8 * back) * Math.min(1, .15 + world.intro * 1.2) * (1 - .6 * world.focus)
    for (const s of sprites) {
      s.material.opacity = s.userData.b * dens * (1 + Math.sin(t * .3 + s.userData.ph) * .15)
      s.material.rotation += s.userData.sp * .01
      s.position.x += (reduce ? 0 : .004) * Math.sin(t * .2 + s.userData.ph) - world.mx * .004
      if (s.position.z > camera.position.z + 15) s.position.z -= SPAN
      else if (s.position.z < camera.position.z - (SPAN - 15)) s.position.z += SPAN
    }
  })
  return <>{sprites.map((s, i) => <primitive key={i} object={s} />)}</>
}

/* Dust reacts when an expertise object is hovered (world.hv: 0..1) */
function Dust() {
  const ref = useRef(), mat = useRef()
  const n = mobile ? 260 : 700
  const geo = useMemo(() => {
    const a = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) a.set([(Math.random() - .5) * 60, (Math.random() - .5) * 34, -Math.random() * SPAN], i * 3)
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(a, 3)); return g
  }, [n])
  useEffect(() => () => geo.dispose(), [geo])
  useFrame(({ camera }) => {
    const p = geo.attributes.position
    for (let i = 0; i < n; i++) {
      const z = p.getZ(i)
      if (z > camera.position.z + 15) p.setZ(i, z - SPAN)
      else if (z < camera.position.z - (SPAN - 15)) p.setZ(i, z + SPAN)
    }
    p.needsUpdate = true
    const hv = world.hv || 0
    ref.current.rotation.y = world.mx * .05 + performance.now() * .00008 * hv
    mat.current.opacity = .55 + hv * .35
    mat.current.size = .14 + hv * .06
  })
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial ref={mat} size={.14} color="#c9b48a" transparent opacity={.55} depthWrite={false} />
    </points>
  )
}

/* Light that appears behind the clouds */
function Backlight() {
  const sp = useRef(), pl = useRef()
  const tex = useMemo(puffTexture, [])
  useEffect(() => () => tex.dispose(), [tex])
  useFrame(({ camera }) => {
    const open = Math.min(1, world.p * 9)
    sp.current.material.opacity = world.reveal * .5 * (1 - open * .9)
    sp.current.position.set(0, 2, camera.position.z - 30)
    pl.current.position.set(0, 0, camera.position.z - 14)
    pl.current.intensity = 40 * world.reveal
  })
  return <>
    <sprite ref={sp} scale={[90, 90, 1]}><spriteMaterial map={tex} color="#f1e6cf" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
    <pointLight ref={pl} color="#b8975a" distance={60} />
  </>
}

/* Floating titanium forms — scattered along the journey */
function Solids() {
  const refs = useRef([])
  const items = useMemo(() => Array.from({ length: mobile ? 4 : 7 }, (_, i) => ({
    x: (i % 2 ? 1 : -1) * (6 + Math.random() * 9), y: (Math.random() - .5) * 10, z: -45 - i * 18, k: i % 3,
    r: [Math.random() * .004 + .001, Math.random() * .004 + .001]
  })), [])
  useFrame(() => refs.current.forEach((m, i) => { if (m) { m.rotation.x += items[i].r[0]; m.rotation.y += items[i].r[1] } }))
  return items.map((o, i) => (
    <mesh key={i} ref={el => (refs.current[i] = el)} position={[o.x, o.y, o.z]}>
      {o.k === 0 ? <octahedronGeometry args={[1.4]} /> : o.k === 1 ? <torusGeometry args={[1.2, .12, 12, 60]} /> : <icosahedronGeometry args={[1.1]} />}
      <meshStandardMaterial color="#9ea3a9" metalness={1} roughness={.28} />
    </mesh>
  ))
}

/* THE MONUMENT: real extruded metal type that rides in front of the camera */
function Title() {
  const g = useRef(), a = useRef(), b = useRef(), m1 = useRef(), m2 = useRef(), rim = useRef()
  const { camera, size } = useThree()
  useFrame(() => {
    const fov = camera.fov * Math.PI / 180
    const w = 2 * 6 * Math.tan(fov / 2) * (size.width / size.height)
    g.current.scale.setScalar(Math.min(1.7, (w * .84) / 4.9))
    const rec = Math.min(1, world.p * 10)
    g.current.position.set(-world.mx * .3, 0, camera.position.z - 6 - rec * 30)
    g.current.rotation.set(world.my * .1, world.mx * .15, 0)
    a.current.position.z = -(1 - world.k1) * 3
    b.current.position.z = -(1 - world.k2) * 5
    m1.current.opacity = world.k1 * (1 - rec)
    m2.current.opacity = world.k2 * (1 - rec)
    g.current.visible = rec < 1
    rim.current.intensity = 6 * world.reveal
  })
  const text = (t, y, ref, mref) => (
    <group ref={ref} position={[0, y, 0]}>
      <Center>
        <Text3D font="/fonts/droid_serif_bold.typeface.json" size={1} height={.3} curveSegments={mobile ? 3 : 8}
          bevelEnabled bevelSize={.014} bevelThickness={.035} bevelSegments={mobile ? 1 : 3} letterSpacing={.02}>
          {t}
          <meshStandardMaterial ref={mref} color="#b9bdc2" metalness={1} roughness={.22} envMapIntensity={1.7} transparent opacity={0} />
        </Text3D>
      </Center>
    </group>
  )
  return (
    <group ref={g}>
      {text('KHALED', .66, a, m1)}
      {text('SALEEM', -.66, b, m2)}
      <pointLight ref={rim} position={[0, 1.2, -1.8]} color="#b8975a" distance={14} intensity={0} />
    </group>
  )
}

/* Camera rig: intro push + scroll travel + elegant pointer parallax */
function Rig() {
  useFrame(({ camera }) => {
    world.mx += (world.tx - world.mx) * .04
    world.my += (world.ty - world.my) * .04
    const travel = world.intro * 10 + world.p * 150 + world.focus * 1.5
    camera.position.set(world.mx * 2.2, -world.my * 1.4, -travel)
    camera.rotation.set(-world.my * .07, -world.mx * .1, 0)
  })
  return null
}

export default function CloudScene() {
  useEffect(() => {
    const move = e => { world.tx = e.clientX / innerWidth - .5; world.ty = e.clientY / innerHeight - .5 }
    const tilt = e => {
      if (e.gamma == null) return
      world.tx = Math.max(-.5, Math.min(.5, e.gamma / 60)); world.ty = Math.max(-.5, Math.min(.5, (e.beta - 45) / 90))
    }
    addEventListener('pointermove', move, { passive: true })
    if (mobile) addEventListener('deviceorientation', tilt)
    return () => { removeEventListener('pointermove', move); removeEventListener('deviceorientation', tilt) }
  }, [])
  return (
    <Canvas className="gl" dpr={[1, mobile ? 1.5 : 2]} camera={{ fov: 60, near: .1, far: 260, position: [0, 0, 0] }}
      gl={{ antialias: !mobile, powerPreference: 'high-performance' }} aria-hidden="true">
      <color attach="background" args={['#050505']} />
      <fogExp2 attach="fog" args={['#050505', .018]} />
      <ambientLight intensity={.5} color="#404048" />
      <directionalLight position={[4, 6, 5]} intensity={2} color="#ffe2b0" />
      <Suspense fallback={null}>
        <Environment resolution={256}>
          <Lightformer form="rect" intensity={4} position={[0, 5, -8]} scale={[20, 3, 1]} color="#fff3dc" />
          <Lightformer intensity={2} position={[-8, 0, 2]} scale={[3, 10, 1]} color="#b8975a" rotation-y={Math.PI / 2} />
          <Lightformer intensity={1.2} position={[8, 0, 2]} scale={[3, 10, 1]} color="#cfd4da" rotation-y={-Math.PI / 2} />
        </Environment>
        <Title />
      </Suspense>
      <Clouds /><Dust /><ExpertiseObjects /><Backlight /><Solids /><Rig />
    </Canvas>
  )
}
