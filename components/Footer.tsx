import Link from 'next/link'

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="foot-top">
          <div className="foot-brand">
            <div className="brand" style={{ marginBottom: 24 }}>
              <img src="/logo.png" alt="E-Vangariwala Logo" style={{ height: 48, width: 'auto', objectFit: 'contain' }} />
              <span style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-unbounded), sans-serif', color: '#fff', marginLeft: '12px', letterSpacing: '-0.04em' }}>E-Vangariwala</span>
            </div>
            <p>
              Digitizing Bangladesh&apos;s scrap industry, one pickup at a time. Sell, donate, or
              simply clear your space — we come to you.
            </p>
            <div className="socials">
              <a href="https://www.facebook.com/share/1BNf7mRWFm/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0022 12z" />
                </svg>
              </a>
              <a href="https://www.instagram.com/reel/DXdgdq1gBrY/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/posts/evangariwala_activity-7453758283028402176-B4nf?utm_source=share&utm_medium=member_android&rcm=ACoAADNn6Z4BZREs4PA7NAITpw4Dk2Qh5SAN8io" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3zM10 9h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21H18v-5.5c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21H10z" />
                </svg>
              </a>
              <a href="https://wa.me/8801759251523" aria-label="WhatsApp">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.4c1.4.8 3 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h5>Quick Links</h5>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/#prices">Prices</Link></li>
              <li><Link href="/#book">Book Pickup</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h5>Service Areas</h5>
            <ul>
              <li><Link href="/#areas">Bansree · বনশ্রী</Link></li>
              <li><Link href="/#areas">Rampura · রামপুরা</Link></li>
              <li><Link href="/#areas">Basaboo · বাসাবো</Link></li>
              <li><Link href="/#areas">Gulshan · গুলশান</Link></li>
              <li><Link href="/#areas">Bashundhara · বসুন্ধরা</Link></li>
              <li><Link href="/#areas">Baridhara · বারিধারা</Link></li>
            </ul>
          </div>

          <div>
            <h5>Get in Touch</h5>
            <ul>
              <li><a href="tel:01537395293">📞 01537-395293</a></li>
              <li><a href="https://wa.me/8801759251523">💬 01759-251523 (WA)</a></li>
              <li><a href="https://wa.me/8801883144539">💬 01883-144539 (WA)</a></li>
              <li style={{ color: 'rgba(255,255,255,.6)', fontSize: 14, lineHeight: 1.5, marginTop: 8 }}>
                Dakkhingoan 1 No. Road, Basaboo, Dhaka-1214
              </li>
            </ul>
          </div>
        </div>

        <div className="foot-bottom">
          <span>© 2026 E-Vangariwala. All rights reserved.</span>
          <span>Making Bangladesh cleaner, one scrap at a time.</span>
        </div>
      </div>
    </footer>
  )
}
