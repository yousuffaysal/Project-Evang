import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import WhatsAppFloat from '@/components/WhatsAppFloat'
import ContactForm from './ContactForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact — E-Vangariwala',
}

export default function ContactPage() {
  return (
    <>
      <Nav dark />

      <header className="page-hero">
        <p className="micro fadein">// Get in touch</p>
        <h1 className="fadein">Talk to us. We reply fast.</h1>
        <div className="bn-h bn fadein">আমাদের সাথে যোগাযোগ করুন।</div>
        <p className="lead fadein">
          WhatsApp is fastest. Email if you prefer something written. Or just walk into our HQ in
          Basaboo — we always have tea on.
        </p>
      </header>

      <ContactForm />

      <Footer />
      <WhatsAppFloat />
    </>
  )
}
