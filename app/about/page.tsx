import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import WhatsAppFloat from '@/components/WhatsAppFloat'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About — E-Vangariwala',
}

export default function AboutPage() {
  return (
    <>
      <Nav dark />

      <header className="page-hero">
        <p className="micro fadein">// About E-Vangariwala</p>
        <h1 className="fadein">A scrap industry, finally digitised.</h1>
        <div className="bn-h bn fadein">আপনার বর্জ্য, আমাদের দায়িত্ব।</div>
        <p className="lead fadein">
          We&apos;re rebuilding the relationship between Bangladeshi households and the people who
          collect their scrap — with published prices, certified scales, and zero haggling.
        </p>
      </header>

      {/* STATS */}
      <section className="about-stats">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="micro-tag">// By the numbers</span>
              <h2>Small team. Real impact.</h2>
            </div>
            <div className="right">
              Every metric below is verified — pulled from our pickup logs and digital receipts
              since launch in early 2024.
            </div>
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="v">2,400+</div>
              <div className="l">Pickups completed across Dhaka</div>
            </div>
            <div className="stat-item">
              <div className="v">৳18L+</div>
              <div className="l">Paid to households for their scrap</div>
            </div>
            <div className="stat-item">
              <div className="v">42T</div>
              <div className="l">Material diverted from landfill</div>
            </div>
            <div className="stat-item">
              <div className="v">12</div>
              <div className="l">Service areas in Dhaka</div>
            </div>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="story">
        <div className="container">
          <div className="story-grid">
            <div className="story-image">
              <span className="ph">// founder portrait — Basaboo HQ</span>
              <span className="badge">Founded 2024</span>
            </div>
            <div className="story-text">
              <span className="micro-tag">// Our Story</span>
              <h2>From a single van in Basaboo to all of Dhaka.</h2>
              <div className="bn bn">এক ভ্যান থেকে শুরু, পুরো ঢাকা পর্যন্ত।</div>
              <p>
                E-Vangariwala started with one observation: the traditional scrap collector — the
                roadside Vangariwala — was relied upon by every household in Bangladesh, yet operated
                on guesswork. No published prices. No certified scales. No accountability.
              </p>
              <p>
                We built the alternative. Trained crews, certified weighing scales, transparent rate
                cards, digital receipts, and a WhatsApp-first booking flow. Households get a fair
                deal. The environment gets a chain of custody. And one of Bangladesh&apos;s largest
                informal industries gets a path to formalisation.
              </p>
              <div className="quote">
                <blockquote>
                  E-Vangariwala is here to change Bangladesh&apos;s scrap industry, InshaAllah. Our
                  goal is simple: digitize and organize this fragmented industry. We have a long way
                  to go — this is just the beginning.
                </blockquote>
                <div className="who">— The E-Vangariwala Team</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="values">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="micro-tag">// What we stand for</span>
              <h2>Three values, audited at every pickup.</h2>
            </div>
            <div className="right">
              If we ever fall short on any of these, we want to hear about it. Send us a WhatsApp;
              we read every message.
            </div>
          </div>
          <div className="values-grid">
            <div className="value-card">
              <div className="icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <h3>Transparency</h3>
              <p>
                Published rate cards. Certified scales. Digital receipts. Every weight, every taka,
                accountable.
              </p>
            </div>
            <div className="value-card">
              <div className="icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v6m0 8v6M2 12h6m8 0h6" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <h3>Convenience</h3>
              <p>
                Doorstep pickup, scheduled within 24 hours. WhatsApp-first. No phone trees, no
                awkward negotiations.
              </p>
            </div>
            <div className="value-card">
              <div className="icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L4 7v10l8 5 8-5V7l-8-5z" />
                  <path d="M12 22V12M4 7l8 5 8-5" />
                </svg>
              </div>
              <h3>Responsibility</h3>
              <p>
                Every kilogram traced. Every electronic processed by certified recyclers. We close
                the loop, properly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="team">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="micro-tag" style={{ color: 'rgba(255,255,255,.6)' }}>
                // The crew
              </span>
              <h2>Trained. Trusted. On time.</h2>
            </div>
            <div className="right">
              Every crew member wears an ID, carries a certified scale, and is trained on
              respectful, safe collection.
            </div>
          </div>
          <div className="team-grid">
            {[
              {
                initials: 'GF',
                name: 'Gazi Fardin Haque',
                role: 'Founder & CEO',
                bio: 'Leading the strategic vision to scale and modernise Bangladesh\'s doorstep recycling network.',
                ph: '// CEO portrait',
              },
              {
                initials: 'YF',
                name: 'Yousuf H Faysal',
                role: 'Co-Founder & CTO',
                bio: 'Architect of the digital booking systems, smart routing logs, and data pipelines.',
                ph: '// CTO portrait',
                linkedin: 'https://www.linkedin.com/in/yusuf-faysal/',
              },
              {
                initials: 'FR',
                name: 'Farhana Rahman',
                role: 'Operations Lead',
                bio: 'Owns dispatch and quality. If your pickup runs late, she calls you herself.',
                ph: '// operations lead',
              },
              {
                initials: 'NJ',
                name: 'Nusrat Jahan',
                role: 'Customer Support',
                bio: 'Replies on WhatsApp. Speaks Bangla and English. Responds within minutes during business hours.',
                ph: '// support',
              },
            ].map((member) => (
              <div key={member.name} className="person">
                <div className="av">{member.ph}</div>
                <h4>{member.name}</h4>
                <div className="role">{member.role}</div>
                <p>{member.bio}</p>
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="person-ln"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginTop: '12px',
                      fontSize: '13px',
                      color: 'var(--lime)',
                      fontWeight: 500,
                      textDecoration: 'none',
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '16px', height: '16px' }}>
                      <path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3zM10 9h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21H18v-5.5c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21H10z" />
                    </svg>
                    Connect on LinkedIn
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="timeline">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="micro-tag">// Milestones</span>
              <h2>The road so far.</h2>
            </div>
            <div className="right">
              Two years, twelve neighbourhoods, one mission. Here&apos;s how we got here.
            </div>
          </div>
          <div className="tl">
            {[
              {
                yr: 'JAN 2024',
                title: 'Founded in Basaboo, Dhaka.',
                body: 'One van, one certified scale, one rate card. First pickup completed in February.',
              },
              {
                yr: 'JUN 2024',
                title: 'Crossed 500 pickups.',
                body: 'Expanded coverage from Basaboo to Khilgaon, Rampura, and Malibagh.',
              },
              {
                yr: 'DEC 2024',
                title: 'Launched WhatsApp-first booking.',
                body: '90% of bookings now arrive via WhatsApp. Average response time: under 4 minutes.',
              },
              {
                yr: 'MAR 2025',
                title: 'Gulshan, Bashundhara, Baridhara live.',
                body: 'Expanded to premium northern neighbourhoods. Donation pickups exceed 20% of volume.',
              },
              {
                yr: 'NOW',
                title: '2,400+ pickups, 12 areas, growing weekly.',
                body: 'This is the beginning. Next: a customer app, a fleet of three vans, and full city coverage by 2027.',
              },
            ].map((item) => (
              <div key={item.yr} className="tl-item">
                <div className="yr">{item.yr}</div>
                <h4>{item.title}</h4>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppFloat />
    </>
  )
}
