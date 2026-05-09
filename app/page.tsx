'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import WhatsAppFloat from '@/components/WhatsAppFloat'

/* ---- TYPES ---- */
type PriceRow = {
  id: number
  name: string
  name_bn: string
  category: string
  price: number
  unit: string
}

const CAT_LABEL: Record<string, string> = {
  paper: 'Paper',
  plastic: 'Plastic',
  metal: 'Metal',
  electronics: 'Electronics',
  appliances: 'Appliances',
}

const COMPARE = [
  { f: 'Price Transparency', bn: 'মূল্য স্বচ্ছতা', evw: 'Yes — published openly', old: 'No' },
  { f: 'Doorstep Pickup', bn: 'বাড়ির সামনে পিকআপ', evw: 'Always', old: 'Sometimes' },
  { f: 'On-the-spot Payment', bn: 'হাতে হাতে পেমেন্ট', evw: 'Always', old: 'Sometimes' },
  { f: 'Donation Option', bn: 'দানের সুযোগ', evw: 'Yes', old: 'Never' },
  { f: 'Certified Weighing Scale', bn: 'সার্টিফাইড দাঁড়িপাল্লা', evw: 'Yes', old: 'No' },
  { f: 'Digital Receipt', bn: 'ডিজিটাল রসিদ', evw: 'Yes', old: 'No' },
  { f: 'Customer Support', bn: 'কাস্টমার সাপোর্ট', evw: 'WhatsApp 24/7', old: 'None' },
  { f: 'Eco-conscious Disposal', bn: 'পরিবেশ-বান্ধব নিষ্পত্তি', evw: 'Guaranteed', old: 'Unknown' },
]

const AREAS = [
  { en: 'Bansree', bn: 'বনশ্রী' },
  { en: 'Rampura', bn: 'রামপুরা' },
  { en: 'Basaboo', bn: 'বাসাবো' },
  { en: 'Malibagh', bn: 'মালিবাগ' },
  { en: 'Khilgoan', bn: 'খিলগাঁও' },
  { en: 'Motijheel', bn: 'মতিঝিল' },
  { en: 'Mugda', bn: 'মুগদা' },
  { en: 'Aftabnagar', bn: 'আফতাবনগর' },
  { en: 'Gulshan', bn: 'গুলশান' },
  { en: 'Badda', bn: 'বাড্ডা' },
  { en: 'Baridhara', bn: 'বারিধারা' },
  { en: 'Bashundhara', bn: 'বসুন্ধরা' },
]

const SCRAP_TYPES = ['Paper', 'Cardboard', 'Books', 'Plastic', 'Metal', 'Electronics', 'AC / Fridge', 'Furniture', 'Mixed lot']

export default function HomePage() {
  const [priceTab, setPriceTab] = useState('all')
  const [prices, setPrices] = useState<PriceRow[]>([])
  const [checkedItems, setCheckedItems] = useState<string[]>([])
  const [purpose, setPurpose] = useState('sell')
  const [ctaPhone, setCtaPhone] = useState('')
  const [bookingForm, setBookingForm] = useState({ name: '', phone: '', address: '', area: AREAS[0].en, date: '', slot: '9 AM – 12 PM', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [loadingPrices, setLoadingPrices] = useState(true)
  const [toastInfo, setToastInfo] = useState<{ show: boolean; message: string; ref?: string }>({ show: false, message: '' })

  /* Fetch prices from API */
  useEffect(() => {
    fetch('/api/prices')
      .then((r) => r.json())
      .then((d) => {
        setPrices(d.prices || [])
        setLoadingPrices(false)
      })
      .catch(() => setLoadingPrices(false))
  }, [])

  /* Scroll reveal */
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.01, rootMargin: '0px 0px -20px 0px' }
    )
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [loadingPrices])

  const filteredPrices = priceTab === 'all' ? prices : prices.filter((p) => p.category === priceTab)

  const toggleItem = (item: string) => {
    setCheckedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    )
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/pickups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: bookingForm.name,
          phone: bookingForm.phone,
          address: bookingForm.address,
          area: bookingForm.area,
          date: bookingForm.date,
          slot: bookingForm.slot,
          types: checkedItems,
          purpose,
          notes: bookingForm.notes,
        }),
      })
      const data = await res.json()
      if (data.ok) {
        setBookingForm({ name: '', phone: '', address: '', area: AREAS[0].en, date: '', slot: '9 AM – 12 PM', notes: '' })
        setCheckedItems([])
        setToastInfo({ show: true, message: 'Booking confirmed!', ref: data.ref })
        setTimeout(() => setToastInfo({ show: false, message: '' }), 5000)
      } else {
        alert(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      alert('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCtaSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: ctaPhone, source: 'cta' }),
      })
    } catch {
      // silent
    }
    setCtaPhone('')
    alert("Thanks! We'll WhatsApp you shortly.")
  }

  return (
    <>
      <Nav dark />

      {/* ===== HERO ===== */}
      <div className="hero-shell">
        <section className="hero" id="home">
          <div className="hero-grid" />
          <div className="hero-inner">
            <p className="hero-supporting">
              Bangladesh&apos;s modern doorstep scrap collection service. Sell, donate, or simply
              free up your space — we come to you, weigh honestly, and pay on the spot.
            </p>

            <div className="hero-display">
              <div className="top">
                <span className="ink">E—Vangariwala</span>
                <span className="lime">/26</span>
              </div>
              <div className="bottom">
                <span className="stroke">Honest. Doorstep.</span>
              </div>
            </div>

            <div className="hero-bn bn">
              আপনার বর্জ্য, <span className="lime-bn">আমাদের দায়িত্ব।</span>
            </div>

            <div className="hero-sub">
              <div className="hero-tagline">
                <span className="bn">পুরনো জিনিস? অব্যবহৃত মালামাল?</span>
                We pick it up — you get cash, or a clutter-free space. No haggling. No hassle.
              </div>
              <div className="hero-cta-row">
                <Link href="#book" className="btn btn-lime">
                  Book a Free Pickup
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
                <Link href="#prices" className="btn btn-ghost">
                  See Scrap Prices
                </Link>
              </div>
            </div>

            <div className="hero-badge">
              <div className="ring" />
              <div>
                <span className="num">2.4k+</span>
                <small>pickups</small>
              </div>
            </div>

            <div className="hero-strip">
              <p className="micro-label">// Three ways to clear your space</p>
              <span>Dhaka, Bangladesh — Est. 2024</span>
            </div>
            <div className="hairline light" style={{ marginTop: 18 }} />
            <div
              className="hero-bottom-services"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 18,
                fontSize: 18,
                color: '#fff',
              }}
            >
              <span>Sell Your Scrap</span>
              <span>Donate Responsibly</span>
              <span>Declutter Completely</span>
            </div>
          </div>
        </section>
      </div>

      {/* ===== MARQUEE ===== */}
      <div className="marquee">
        <div className="marquee-track">
          <span>★ Honest weighing</span><span>•</span>
          <span>Cash on the spot</span><span>•</span>
          <span>WhatsApp 24/7</span><span>•</span>
          <span>Eco-conscious disposal</span><span>•</span>
          <span>2,400+ pickups completed</span><span>•</span>
          <span>★ Honest weighing</span><span>•</span>
          <span>Cash on the spot</span><span>•</span>
          <span>WhatsApp 24/7</span><span>•</span>
          <span>Eco-conscious disposal</span><span>•</span>
          <span>2,400+ pickups completed</span><span>•</span>
        </div>
      </div>

      {/* ===== ACTIONS ===== */}
      <section className="actions reveal" id="services">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="micro-tag">// Three Core Actions</span>
              <h2>One service, three honest outcomes — pick the one that fits.</h2>
            </div>
            <div className="right">
              From cluttered closets to corporate offices, every pickup ends one of three ways: cash
              in hand, a digital donation receipt, or simply a cleaner room. You choose.
            </div>
          </div>

          <div className="actions-grid">
            <Link href="#book" className="action-card sell">
              <div>
                <div className="num">01 / SELL</div>
                <h3>Sell Your Scrap</h3>
                <div className="bn-tag bn">টাকা পান হাতে হাতে</div>
              </div>
              <p>
                Turn old items into instant cash. Fair, transparent prices per kg or per piece. We
                weigh in front of you — and pay on the spot.
              </p>
              <div className="arrow-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </div>
              <div className="deco" />
              <div className="deco2" />
            </Link>

            <Link href="#book" className="action-card donate">
              <div>
                <div className="num">02 / DONATE</div>
                <h3>Donate Your Scrap</h3>
                <div className="bn-tag bn">পরিবেশের জন্য দান</div>
              </div>
              <p>
                Don&apos;t need cash? Donate your scrap. We recycle it responsibly, give you a
                digital receipt, and the planet thanks you.
              </p>
              <div className="arrow-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </div>
              <div className="deco" />
              <div className="deco2" />
            </Link>

            <Link href="#book" className="action-card space">
              <div>
                <div className="num">03 / DECLUTTER</div>
                <h3>Free Up Your Space</h3>
                <div className="bn-tag bn">পরিচ্ছন্ন জায়গা, স্বস্তির শ্বাস</div>
              </div>
              <p>
                Offices, homes, warehouses — clutter is a productivity killer. One call, no
                middleman, complete clearance. Done in a single visit.
              </p>
              <div className="arrow-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </div>
              <div className="deco" />
              <div className="deco2" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== PRICES ===== */}
      <section className="prices reveal" id="prices">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="micro-tag">// Live Scrap Prices</span>
              <h2>Honest rates, published openly.</h2>
            </div>
            <div className="right">
              Prices vary by quality and current market rates. We always quote you a final price
              before pickup — never a surprise at weigh-in.
            </div>
          </div>

          <div className="price-tabs">
            {[
              { id: 'all', label: 'All Categories' },
              { id: 'paper', label: 'Paper & Cardboard' },
              { id: 'plastic', label: 'Plastics' },
              { id: 'metal', label: 'Metals' },
              { id: 'electronics', label: 'Electronics' },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`price-tab${priceTab === tab.id ? ' active' : ''}`}
                onClick={() => setPriceTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="price-grid">
            {loadingPrices ? (
              <>
                <div className="price-row skeleton" style={{ height: '70px' }} />
                <div className="price-row skeleton" style={{ height: '70px' }} />
                <div className="price-row skeleton" style={{ height: '70px' }} />
                <div className="price-row skeleton" style={{ height: '70px' }} />
                <div className="price-row skeleton" style={{ height: '70px' }} />
                <div className="price-row skeleton" style={{ height: '70px' }} />
              </>
            ) : (
              filteredPrices.map((p, i) => (
                <div key={i} className="price-row">
                  <div className="name">
                    {p.name}
                    <small className="bn">{p.name_bn}</small>
                  </div>
                  <div className="cat">{CAT_LABEL[p.category]}</div>
                  <div className="price">
                    ৳{Number(p.price).toLocaleString()}
                    <small>/ {p.unit}</small>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="price-cta">
            <h4>
              Not sure what your item is worth? Send us a photo on WhatsApp — estimate in minutes.
            </h4>
            <a href="https://wa.me/8801759251523" className="btn btn-lime">
              WhatsApp Now
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ===== GALLERY ===== */}
      <section className="gallery reveal">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="micro-tag">// Behind the scenes</span>
              <h2>What an honest pickup actually looks like.</h2>
            </div>
            <div className="right">
              From doorstep arrival to certified weigh-in to digital receipt — every step
              photographed, every kilogram accounted for.
            </div>
          </div>

          <div className="media-grid">
            <div className="media m1">
              <img src="/pickup_arrival.png" alt="E-Vangariwala delivery truck doorstep arrival" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <span className="cap">Doorstep arrival</span>
            </div>
            <div className="media m2">
              <img src="/honest_weighing.png" alt="Certified digital scale honest weighing" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <span className="cap">Honest weigh-in</span>
            </div>
            <div className="media m3">
              <img src="/cash_payout.png" alt="Instant cash payment on the spot" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <span className="cap">Cash on the spot</span>
            </div>
            <div className="media m4">
              <img src="/friendly_crew.png" alt="Happy E-Vangariwala crew member" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <span className="cap" style={{ bottom: 10, left: 10, fontSize: '11px', padding: '4px 8px' }}>Our Friendly Crew</span>
            </div>
            <div className="media m5">
              <img src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&h=400&q=80" alt="Clutter-free clean office clearance" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <span className="cap" style={{ bottom: 10, left: 10, fontSize: '11px', padding: '4px 8px' }}>Office Cleared</span>
            </div>
            <div className="media m6">
              <img src="https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&h=600&q=80" alt="Eco-friendly responsible recycling Dhaka" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <span className="cap">Responsible disposal</span>
            </div>
            <div className="media m7">
              <img src="/before_after.png" alt="Organized before and after tidy layout" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <span className="cap">Before / after</span>
            </div>
            <div className="media m8">
              <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&h=600&q=80" alt="Digital receipt on smartphone screen" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <span className="cap">Digital receipt</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="testi reveal">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="micro-tag">// What customers say</span>
              <h2>2,400+ households trust us. Here&apos;s why.</h2>
            </div>
            <div className="right">
              Real reviews from Basaboo, Gulshan, Khilgaon, and beyond. We weighed every kilogram
              in front of them.
            </div>
          </div>
          <div className="testi-grid">
            <div className="testi-card">
              <div className="stars">★★★★★</div>
              <blockquote>
                &ldquo;Booked at 9 AM, they arrived by noon. Weighed everything in front of me —
                paid in cash. No haggling, no surprises. Will use again.&rdquo;
              </blockquote>
              <div className="who">
                <div className="av">RH</div>
                <div className="meta">
                  <div className="n">Rashed Hossain</div>
                  <div className="l">Bashundhara R/A</div>
                </div>
              </div>
            </div>
            <div className="testi-card">
              <div className="stars">★★★★★</div>
              <blockquote>
                &ldquo;আমাদের অফিসের পুরো ক্লাটার একদিনে ক্লিন। ডিজিটাল রসিদ পেয়েছি, পেমেন্টও
                সঠিক। সত্যিই প্রফেশনাল সার্ভিস।&rdquo;
              </blockquote>
              <div className="who">
                <div className="av">SA</div>
                <div className="meta">
                  <div className="n">Sumaiya Akter</div>
                  <div className="l">Office Manager, Motijheel</div>
                </div>
              </div>
            </div>
            <div className="testi-card">
              <div className="stars">★★★★★</div>
              <blockquote>
                &ldquo;Donated our old electronics rather than selling. Got a proper receipt for tax
                records. The team was polite and on time.&rdquo;
              </blockquote>
              <div className="who">
                <div className="av">TK</div>
                <div className="meta">
                  <div className="n">Tanvir Khan</div>
                  <div className="l">Gulshan-2</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="how reveal" id="how">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="micro-tag">// How It Works</span>
              <h2>From clutter to clear, in three honest steps.</h2>
            </div>
            <div className="right">
              The whole process is built around one promise: no hidden deductions, no waiting, no
              haggling. You see every kilogram on the scale, in real time.
            </div>
          </div>

          <div className="steps">
            <div className="step">
              <div className="n">STEP 01</div>
              <div className="icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="4" width="18" height="18" rx="3" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </div>
              <h3>Book your pickup</h3>
              <p>
                Fill our short form or send a WhatsApp. Tell us your location, what you have, and a
                date and time that suits you.
              </p>
            </div>
            <div className="step">
              <div className="n">STEP 02</div>
              <div className="icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 7l9-4 9 4-9 4-9-4z" />
                  <path d="M3 12l9 4 9-4M3 17l9 4 9-4" />
                </svg>
              </div>
              <h3>We come to you</h3>
              <p>
                Our trained team arrives on time. We weigh your scrap with a certified scale — right
                in front of you. No hidden deductions.
              </p>
            </div>
            <div className="step">
              <div className="n">STEP 03</div>
              <div className="icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 2v20M2 12h20" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
              <h3>Get paid or feel good</h3>
              <p>
                Selling? Receive instant cash. Donating? Get a digital receipt. Either way, your
                space is clean and the environment thanks you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHY ===== */}
      <section className="why reveal">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="micro-tag" style={{ color: 'rgba(255,255,255,.6)' }}>
                // The honest difference
              </span>
              <h2>
                Why thousands choose us over the roadside Vangariwala.
              </h2>
            </div>
            <div className="right">
              Bangladesh&apos;s scrap industry has run on guesswork and trust-the-stranger for
              decades. We replaced both with published prices, certified scales, and digital
              receipts.
            </div>
          </div>

          <div className="compare">
            <div className="compare-row head">
              <div>FEATURE</div>
              <div>OLD VANGARIWALA</div>
              <div>E-VANGARIWALA</div>
            </div>
          </div>
          <div className="compare">
            {COMPARE.map((c, i) => (
              <div key={i} className="compare-row">
                <div className="feat">
                  {c.f}
                  <span className="bn">{c.bn}</span>
                </div>
                <div className="col-old">
                  <span className="x">—</span>
                  {c.old}
                </div>
                <div className="col-evw">
                  <span className="check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 12l5 5 9-11" />
                    </svg>
                  </span>
                  {c.evw}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== AREAS ===== */}
      <section className="areas reveal" id="areas">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="micro-tag">// Service Areas</span>
              <h2>Currently picking up across Dhaka.</h2>
            </div>
            <div className="right">
              We&apos;re expanding fast. If your area isn&apos;t listed, message us — we may still
              be able to help.
            </div>
          </div>

          <div className="areas-wrap">
            <div className="areas-list">
              {AREAS.map((a, i) => (
                <div key={i} className="area-item">
                  <div>
                    <div className="en">{a.en}</div>
                    <div className="bn">{a.bn}</div>
                  </div>
                  <span className="dot" />
                </div>
              ))}
            </div>

            <div className="area-info">
              <div className="map-mock">
                <span className="pin" style={{ left: '30%', top: '55%' }} />
                <span className="pin" style={{ left: '48%', top: '42%' }} />
                <span className="pin" style={{ left: '62%', top: '60%' }} />
                <span className="pin" style={{ left: '55%', top: '30%' }} />
                <span className="pin" style={{ left: '72%', top: '48%' }} />
                <span className="pin" style={{ left: '38%', top: '70%' }} />
                <span className="label" style={{ left: '45%', top: '25%' }}>Gulshan</span>
                <span className="label" style={{ left: '25%', top: '62%' }}>Basaboo</span>
                <span className="label" style={{ left: '65%', top: '54%' }}>Bashundhara</span>
              </div>
              <h3>Coverage growing weekly across the capital.</h3>
              <p className="note">
                Headquarters at Dakkhingoan 1 No. Road, Basaboo, Dhaka-1214. Pickup typically
                scheduled within 24–48 hours.
              </p>
              <Link href="#book" className="btn btn-lime">
                Request Pickup
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BOOKING ===== */}
      <section className="booking reveal" id="book">
        <div className="container">
          <div className="form-wrap">
            <div className="form-left">
              <span className="micro-tag">// Book a Pickup</span>
              <h2>Tell us what you&apos;ve got. We&apos;ll do the rest.</h2>
              <div className="bn">আপনি বুক করুন, বাকিটা আমাদের।</div>
              <p>
                Fill the form below or message us directly on WhatsApp. We&apos;ll confirm within
                minutes and arrive at your doorstep on time.
              </p>

              <div className="form-stats">
                <div className="stat">
                  <div className="v">2,400+</div>
                  <div className="l">Pickups completed across Dhaka</div>
                </div>
                <div className="stat">
                  <div className="v">24h</div>
                  <div className="l">Typical scheduling window</div>
                </div>
                <div className="stat">
                  <div className="v">৳18L+</div>
                  <div className="l">Paid out to households</div>
                </div>
                <div className="stat">
                  <div className="v">100%</div>
                  <div className="l">Honest, certified weighing</div>
                </div>
              </div>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="field-row">
                <div className="field">
                  <label>Full Name / নাম</label>
                  <input type="text" placeholder="Your full name" required
                    value={bookingForm.name} onChange={(e) => setBookingForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Phone / ফোন নম্বর</label>
                  <input type="tel" placeholder="01XXX-XXXXXX" required
                    value={bookingForm.phone} onChange={(e) => setBookingForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Address / ঠিকানা</label>
                  <input type="text" placeholder="House, road" required
                    value={bookingForm.address} onChange={(e) => setBookingForm(f => ({ ...f, address: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Area / এলাকা</label>
                  <select value={bookingForm.area} onChange={(e) => setBookingForm(f => ({ ...f, area: e.target.value }))}>
                    {AREAS.map(a => <option key={a.en} value={a.en}>{a.en} - {a.bn}</option>)}
                  </select>
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Preferred Date / তারিখ</label>
                  <input type="date" required
                    value={bookingForm.date} onChange={(e) => setBookingForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Time slot</label>
                  <select value={bookingForm.slot} onChange={(e) => setBookingForm(f => ({ ...f, slot: e.target.value }))}>
                    <option>9 AM – 12 PM</option>
                    <option>12 PM – 3 PM</option>
                    <option>3 PM – 6 PM</option>
                    <option>Anytime</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <label>What do you have? (multi-select)</label>
                <div className="chk-grid">
                  {SCRAP_TYPES.map((item) => (
                    <label
                      key={item}
                      className={`chk${checkedItems.includes(item) ? ' on' : ''}`}
                    >
                      <input type="checkbox" checked={checkedItems.includes(item)} onChange={() => toggleItem(item)} />
                      {item}
                    </label>
                  ))}
                </div>
              </div>

              <div className="field">
                <label>Purpose</label>
                <div className="radio-row">
                  <label
                    className={`chk${purpose === 'sell' ? ' on' : ''}`}
                    onClick={() => setPurpose('sell')}
                  >
                    <input type="radio" name="p" readOnly checked={purpose === 'sell'} />
                    💰 Sell for cash
                  </label>
                  <label
                    className={`chk${purpose === 'donate' ? ' on' : ''}`}
                    onClick={() => setPurpose('donate')}
                  >
                    <input type="radio" name="p" readOnly checked={purpose === 'donate'} />
                    🌱 Donate
                  </label>
                </div>
              </div>

              <div className="field">
                <label>Additional notes (optional)</label>
                <textarea
                  rows={2}
                  placeholder="Approx. quantity, building entry instructions, etc."
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm(f => ({ ...f, notes: e.target.value }))}
                />
              </div>

              <div className="submit-row">
                <button type="submit" className="btn btn-lime" disabled={submitting}>
                  {submitting ? 'Booking…' : 'Book Pickup Now'}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
                <a className="wa-btn" href="https://wa.me/8801759251523">
                  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}>
                    <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-1 1.1-.2.2-.4.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.4.1-.6.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.2 3 .1.2 2 3.1 4.9 4.4 2.9 1.2 2.9.8 3.4.8.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.4z" />
                    <path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.4c1.4.8 3 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3.2.8.9-3.1-.2-.3C3.9 14.7 3.5 13.4 3.5 12c0-4.7 3.8-8.5 8.5-8.5s8.5 3.8 8.5 8.5-3.8 8.5-8.5 8.5z" />
                  </svg>
                  WhatsApp
                </a>
              </div>
            </form>
          </div>
        </div>
      </section>



      {/* ===== CTA ===== */}
      <section className="cta-section">
        <div className="container">
          <p className="micro-label">// Ready when you are</p>
          <h2>Clear your space today.</h2>
          <span className="bn">আপনার বর্জ্য, আমাদের দায়িত্ব।</span>
          <p style={{ marginTop: 32 }}>
            Fill out our simple booking form and we will schedule your doorstep pickup.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
            <Link href="#book" className="btn btn-lime" style={{ padding: '16px 36px', fontSize: '17px', gap: '12px' }}>
              Request Pickup
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 18, height: 18 }}>
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppFloat />
      {toastInfo.show && (
        <div className="toast-wrapper">
          <div className="toast">
            <div className="toast-icon">✓</div>
            <div>
              <div style={{ fontWeight: 600 }}>{toastInfo.message}</div>
              {toastInfo.ref && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>Ref: {toastInfo.ref}</div>}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
