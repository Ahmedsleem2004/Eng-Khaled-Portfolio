// Copies the 3D-text typeface from three.js into /public so Text3D can load it by URL.
import { mkdirSync, copyFileSync, existsSync } from 'node:fs'
const src = 'node_modules/three/examples/fonts/droid/droid_serif_bold.typeface.json'
if (existsSync(src)) {
  mkdirSync('public/fonts', { recursive: true })
  copyFileSync(src, 'public/fonts/droid_serif_bold.typeface.json')
  console.log('✓ 3D font copied to public/fonts')
} else console.warn('⚠ Font not found. Copy any *.typeface.json to public/fonts/droid_serif_bold.typeface.json')
