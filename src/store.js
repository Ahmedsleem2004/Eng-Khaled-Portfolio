// Shared mutable state read every frame by the 3D scene (no React re-renders).
export const mobile = matchMedia('(max-width:900px)').matches || /Mobi|Android/i.test(navigator.userAgent)
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
export const world = { intro: 0, reveal: 0, k1: 0, k2: 0, p: 0, tx: 0, ty: 0, mx: 0, my: 0, focus: 0, hover: -1, hv: 0, zx: 0, zy: 0 }
export const bus = { lenis: null }
