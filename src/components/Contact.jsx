import { Mail, Phone } from 'lucide-react'
export default function Contact() {
  return (
    <section id="contact">
      <h2 className="ti">Let's build<br />what's next.</h2>
      <div className="who">
        <strong>Khaled Saleem</strong>Chief Executive Officer<br />
        <a href="mailto:K.saleem@masdevco.com">K.saleem@masdevco.com</a><br />
        <a href="tel:+966599992975">+966 59 999 2975</a>
      </div>
      <div className="btns">
        <a className="btn" href="mailto:K.saleem@masdevco.com"><Mail size={14} strokeWidth={1.2} /> EMAIL KHALED</a>
        <a className="btn" href="tel:+966599992975"><Phone size={14} strokeWidth={1.2} /> CALL KHALED</a>
      </div>
    </section>
  )
}
