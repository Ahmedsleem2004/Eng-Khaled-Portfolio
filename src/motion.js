import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { world, reduce } from './store'
gsap.registerPlugin(ScrollTrigger)

// Scroll → camera travel + scrubbed section reveals. Returns a context to revert on unmount.
export function initMotion() {
  return gsap.context(() => {
    ScrollTrigger.create({ trigger: 'main', start: 'top top', end: 'bottom bottom', scrub: 1.2, onUpdate: s => (world.p = s.progress) })
    if (reduce) return
    const sc = (trigger, start, end) => ({ trigger, start, end, scrub: true })
    gsap.utils.toArray('section:not(.hero) h2').forEach(h =>
      gsap.fromTo(h, { y: 70, opacity: 0, letterSpacing: '.06em' }, { y: 0, opacity: 1, letterSpacing: '-.01em', ease: 'none', scrollTrigger: sc(h, 'top 95%', 'top 55%') }))
    gsap.fromTo('#portrait', { clipPath: 'inset(100% 0 0 0)', scale: 1.08 }, { clipPath: 'inset(0% 0 0 0)', scale: 1, ease: 'none', scrollTrigger: sc('#portrait', 'top 90%', 'top 35%') })
    gsap.fromTo('#profBody', { x: -60, opacity: 0 }, { x: 0, opacity: 1, ease: 'none', scrollTrigger: sc('#profBody', 'top 95%', 'top 60%') })
    gsap.fromTo('#big10', { scale: .6, x: '30vw', opacity: .2 }, { scale: 1.05, x: 0, opacity: 1, ease: 'none', scrollTrigger: sc('#decade', 'top bottom', 'bottom top') })
    gsap.from('.tl .st', { opacity: 0, x: 40, stagger: .3, ease: 'none', scrollTrigger: sc('.tl', 'top 85%', 'bottom 70%') })
    gsap.from('.slot .lab', { y: 60, opacity: 0, stagger: .12, ease: 'none', scrollTrigger: sc('.ex', 'top 95%', 'top 45%') })
    gsap.utils.toArray('.fr').forEach((f, i) =>
      gsap.from(f, { y: 140 + i * 40, rotateY: i === 1 ? 0 : i ? -22 : 22, opacity: 0, ease: 'none', scrollTrigger: sc(f, 'top 100%', 'top 55%') }))
    gsap.from('.pd', { opacity: 0, y: 50, ease: 'none', scrollTrigger: sc('.pd', 'top 95%', 'top 60%') })
    gsap.from('#contact .who, #contact .btns', { opacity: 0, y: 30, ease: 'none', scrollTrigger: sc('#contact .who', 'top 100%', 'top 70%') })
  })
}
