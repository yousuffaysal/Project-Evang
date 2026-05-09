'use client'

import { useState } from 'react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import WhatsAppFloat from '@/components/WhatsAppFloat'

const POSTS = [
  {
    cat: 'income',
    bg: 'bg-2',
    img: '/blog_scrap_income.png',
    tag: 'Income',
    bn: 'স্ক্র্যাপ বিক্রি করে মাসে কত আয় সম্ভব?',
    title: 'How much can a household earn from scrap each month?',
    desc: 'We crunched 8 weeks of pickup data across Basaboo, Khilgaon, and Gulshan.',
    date: 'APR 28, 2026 · 6 MIN',
  },
  {
    cat: 'office',
    bg: 'bg-3',
    img: '/blog_office_clutter.png',
    tag: 'Office',
    bn: 'আপনার অফিস কি ক্লাটারমুক্ত?',
    title: 'Is your office clutter-free? A simple audit guide.',
    desc: 'A five-question framework for facilities managers to identify what to keep, sell, or remove.',
    date: 'APR 22, 2026 · 5 MIN',
  },
  {
    cat: 'industry',
    bg: 'bg-1',
    img: '/blog_recycling_future.png',
    tag: 'Industry',
    bn: 'রিসাইক্লিং ইন্ডাস্ট্রির ভবিষ্যৎ',
    title: "The future of Bangladesh's recycling industry.",
    desc: "Why digitisation isn't optional anymore — and what the next decade looks like.",
    date: 'APR 15, 2026 · 7 MIN',
  },
  {
    cat: 'guide',
    bg: 'bg-4',
    img: '/blog_hoarding_danger.png',
    tag: 'Guide',
    bn: 'কেন পুরনো জিনিস রাখা বিপজ্জনক?',
    title: 'Why hoarding old items can be dangerous.',
    desc: 'Fire risk, dust mites, lost productivity — and what a one-day clearance actually feels like.',
    date: 'APR 08, 2026 · 4 MIN',
  },
  {
    cat: 'ewaste',
    bg: 'bg-5',
    img: '/blog_selling_ac.png',
    tag: 'E-Waste',
    bn: 'পুরনো এসি বিক্রি করার সঠিক উপায়',
    title: 'Selling an old AC: what to expect, what to avoid.',
    desc: 'Compressor weight, gas reclamation, and why piece-pricing beats per-kilo for appliances.',
    date: 'APR 02, 2026 · 5 MIN',
  },
  {
    cat: 'industry',
    bg: 'bg-6',
    img: '/blog_vangari_economy.png',
    tag: 'Industry',
    bn: 'ভাঙ্গারিওয়ালার কাজ কীভাবে কাজ করে?',
    title: "How the Vangariwala economy actually works.",
    desc: "From your doorstep to the recycling plant — every link in Dhaka's informal scrap chain, mapped.",
    date: 'MAR 26, 2026 · 9 MIN',
  },
]

const FILTERS = [
  { id: 'all', label: 'All Posts' },
  { id: 'ewaste', label: 'E-Waste' },
  { id: 'income', label: 'Income' },
  { id: 'office', label: 'Office' },
  { id: 'industry', label: 'Industry' },
  { id: 'guide', label: 'Guides' },
]

export default function BlogPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [email, setEmail] = useState('')

  const visiblePosts =
    activeFilter === 'all' ? POSTS : POSTS.filter((p) => p.cat === activeFilter)

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'blog' }),
      })
    } catch {
      // silent
    }
    setEmail('')
    alert('Subscribed!')
  }

  return (
    <>
      <Nav dark />

      <header className="page-hero">
        <p className="micro fadein">// Awareness & Stories</p>
        <h1 className="fadein">
          Recycling, decluttering, and the future of waste in Bangladesh.
        </h1>
        <div className="bn-h bn fadein">পুনর্ব্যবহার, পরিচ্ছন্নতা, ও ভবিষ্যৎ।</div>
        <p className="lead fadein">
          Practical guides, environmental reporting, and the people behind every pickup. Written by
          our team in the field.
        </p>
      </header>

      <section className="blog-page">
        <div className="container">
          {/* Filters */}
          <div className="filters">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                className={`filter${activeFilter === f.id ? ' active' : ''}`}
                onClick={() => setActiveFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Featured post — show only when "all" or "ewaste" filter */}
          {(activeFilter === 'all' || activeFilter === 'ewaste') && (
            <article className="feature">
              <div className="feature-img">
                <span className="tag">E-Waste</span>
                <img src="/blog_ewaste_dhaka.png" alt="E-Waste Dhaka Recycling" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="feature-text">
                <div className="meta">FEATURED · MAY 02, 2026 · 8 MIN READ</div>
                <div className="bn bn">ই-বর্জ্য: ঢাকার লুকানো পরিবেশ সংকট</div>
                <h2>E-Waste — Dhaka&apos;s Hidden Environmental Crisis.</h2>
                <p>
                  From discarded laptops to broken ACs, the capital generates thousands of tons of
                  e-waste annually. We trace where it actually ends up — and what responsible
                  disposal looks like.
                </p>
                <a href="#" className="btn btn-lime">
                  Read full story
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </a>
              </div>
            </article>
          )}

          {/* Post grid */}
          <div className="posts">
            {visiblePosts.map((p, i) => (
              <article key={i} className="pcard">
                <div className={`img ${p.bg}`} style={{ overflow: 'hidden', position: 'relative' }}>
                  <span className="tag">{p.tag}</span>
                  {p.img && (
                    <img src={p.img} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                  )}
                </div>
                <div className="bn-h bn">{p.bn}</div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
                <div className="date">{p.date}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter">
        <div className="container">
          <p className="micro" style={{ opacity: 0.7, fontFamily: 'monospace' }}>
            // Stay in the loop
          </p>
          <h2>Monthly recycling and decluttering insights, delivered to your inbox.</h2>
          <p>One email a month. No spam. Unsubscribe in one click.</p>
          <form className="nl-form" onSubmit={handleNewsletter}>
            <input
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </section>

      <Footer />
      <WhatsAppFloat />
    </>
  )
}
