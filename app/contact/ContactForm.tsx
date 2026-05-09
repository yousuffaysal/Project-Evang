'use client'

import { useState } from 'react'

const FAQS = [
  {
    q: 'How is the price determined for my scrap?',
    a: 'We publish a public rate card per kilogram and per piece. The team weighs your items in front of you on a certified scale. The total is calculated transparently — there are no hidden deductions.',
  },
  {
    q: 'Is there a minimum quantity for pickup?',
    a: 'For general scrap, we recommend at least 5 kg combined. For electronics (AC, fridge, laptop), even a single piece qualifies. WhatsApp us a photo if unsure — we\'ll confirm in minutes.',
  },
  {
    q: 'How quickly can you arrive after I book?',
    a: 'Most pickups are scheduled within 24 hours. For urgent clearance — moving day, office shift — we can often arrive same-day if you contact us before 11 AM.',
  },
  {
    q: 'Do you cover my area?',
    a: 'We currently operate across 12 neighbourhoods of Dhaka including Basaboo, Khilgaon, Rampura, Gulshan, Bashundhara, and Baridhara. If you\'re outside this list, message us — we may still be able to help, especially for bulk pickups.',
  },
  {
    q: 'Can I get a tax receipt for donated items?',
    a: 'Yes. For every donation we issue a digital receipt over WhatsApp and email, including weight, item type, and date. Useful for record-keeping and corporate CSR reports.',
  },
  {
    q: 'What happens to my e-waste after pickup?',
    a: 'All electronics are processed through certified recyclers in Dhaka. Hazardous components are isolated; recoverable materials are reintroduced to the supply chain. We never landfill electronics.',
  },
]

export default function ContactForm() {
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', reason: 'General enquiry', message: '' })
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.ok) {
        setForm({ full_name: '', phone: '', email: '', reason: 'General enquiry', message: '' })
        alert("Thanks! We'll respond within 24 hours.")
      } else {
        alert(data.error || 'Something went wrong.')
      }
    } catch {
      alert('Network error. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <section className="contact-wrap">
        <div className="container">
          <div className="contact-grid">
            {/* Left — info cards + map */}
            <div>
              <div className="contact-cards">
                <div className="ccard">
                  <div className="icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2" />
                    </svg>
                  </div>
                  <h4>Phone</h4>
                  <p>01537-395293</p>
                  <small>Mon–Sat, 9 AM – 8 PM</small>
                </div>

                <div className="ccard">
                  <div className="icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-1 1.1-.2.2-.4.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.4.1-.6.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.2 3 .1.2 2 3.1 4.9 4.4 2.9 1.2 2.9.8 3.4.8.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.4z" />
                    </svg>
                  </div>
                  <h4>WhatsApp (24/7)</h4>
                  <p>01759-251523</p>
                  <small>Reply within minutes</small>
                </div>

                <div className="ccard">
                  <div className="icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="M3 7l9 6 9-6" />
                    </svg>
                  </div>
                  <h4>Email</h4>
                  <p>hello@evangariwala.com</p>
                  <small>Reply within 24 hours</small>
                </div>

                <div className="ccard">
                  <div className="icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" />
                      <circle cx="12" cy="9" r="2.5" />
                    </svg>
                  </div>
                  <h4>HQ Address</h4>
                  <p>Dakkhingoan 1 No. Road</p>
                  <small>Basaboo, Dhaka-1214</small>
                </div>
              </div>

              <div className="map-wrap">
                <span className="pin" />
                <span className="label">📍 Basaboo HQ — Dhaka-1214</span>
              </div>
            </div>

            {/* Right — contact form */}
            <form className="contact-form" onSubmit={handleSubmit}>
              <span className="micro-tag">// Send a message</span>
              <h2
                style={{
                  fontSize: 32,
                  letterSpacing: '-0.02em',
                  fontWeight: 500,
                  lineHeight: 1.15,
                  margin: '8px 0 24px',
                }}
              >
                Tell us how we can help.
              </h2>
              <div className="field-row">
                <div className="field">
                  <label>Full name / নাম</label>
                  <input required placeholder="Your name"
                    value={form.full_name} onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Phone</label>
                  <input type="tel" required placeholder="01XXX-XXXXXX"
                    value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
              </div>
              <div className="field">
                <label>Email</label>
                <input type="email" placeholder="you@example.com"
                  value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="field">
                <label>Reason</label>
                <select value={form.reason} onChange={(e) => setForm(f => ({ ...f, reason: e.target.value }))}>
                  <option>General enquiry</option>
                  <option>Pickup booking</option>
                  <option>Bulk / corporate clearance</option>
                  <option>Donation enquiry</option>
                  <option>Partnership</option>
                  <option>Feedback or complaint</option>
                </select>
              </div>
              <div className="field">
                <label>Message</label>
                <textarea rows={5} required placeholder="Tell us what's on your mind…"
                  value={form.message} onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))} />
              </div>
              <button
                type="submit"
                className="btn btn-lime"
                style={{ width: '100%', justifyContent: 'center', padding: 16 }}
                disabled={sending}
              >
                {sending ? 'Sending…' : 'Send Message'}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="micro-tag">// Frequently asked</span>
              <h2>Common questions, answered honestly.</h2>
            </div>
            <div className="right">
              Can&apos;t find your question? WhatsApp us — we&apos;ll get back to you within
              minutes.
            </div>
          </div>
          <div className="faq-list">
            {FAQS.map((faq, i) => (
              <details key={i} className="faq-item">
                <summary>{faq.q}</summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
