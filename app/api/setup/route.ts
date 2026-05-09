import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Create tables
    await sql`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('admin','dispatcher','editor')),
        title TEXT,
        avatar_initials TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS pickups (
        id SERIAL PRIMARY KEY,
        booking_ref TEXT UNIQUE NOT NULL,
        customer_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        preferred_date DATE,
        time_slot TEXT,
        scrap_types TEXT[],
        purpose TEXT DEFAULT 'sell',
        notes TEXT,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','in_progress','completed','cancelled')),
        assigned_crew TEXT,
        estimated_value NUMERIC(10,2),
        area TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS prices (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        name_bn TEXT,
        category TEXT NOT NULL,
        price NUMERIC(10,2) NOT NULL,
        unit TEXT NOT NULL DEFAULT 'kg',
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS service_areas (
        id SERIAL PRIMARY KEY,
        name_en TEXT NOT NULL,
        name_bn TEXT,
        crews_assigned INT DEFAULT 1,
        is_active BOOLEAN DEFAULT TRUE,
        pickups_30d INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        title_bn TEXT,
        category TEXT NOT NULL,
        author_name TEXT NOT NULL,
        excerpt TEXT,
        content TEXT,
        status TEXT DEFAULT 'draft' CHECK (status IN ('draft','scheduled','published')),
        scheduled_at TIMESTAMPTZ,
        published_at TIMESTAMPTZ,
        read_count INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        full_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        reason TEXT,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS subscribers (
        id SERIAL PRIMARY KEY,
        phone TEXT,
        email TEXT,
        source TEXT DEFAULT 'newsletter',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS subscribers_phone_idx ON subscribers (phone) WHERE phone IS NOT NULL
    `
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS subscribers_email_idx ON subscribers (email) WHERE email IS NOT NULL
    `

    // Seed admin users
    const existingAdmins = await sql`SELECT COUNT(*) as count FROM admin_users`
    if (Number(existingAdmins[0].count) === 0) {
      const adminHash = await bcrypt.hash('admin123', 10)
      const dispatcherHash = await bcrypt.hash('dispatch123', 10)
      const editorHash = await bcrypt.hash('editor123', 10)

      await sql`
        INSERT INTO admin_users (email, password_hash, full_name, role, title, avatar_initials) VALUES
        ('admin@evangariwala.com', ${adminHash}, 'Yusuf Rahman', 'admin', 'Founder & CEO', 'YR'),
        ('dispatcher@evangariwala.com', ${dispatcherHash}, 'Karim Hossain', 'dispatcher', 'Operations Lead', 'KH'),
        ('editor@evangariwala.com', ${editorHash}, 'Fatema Begum', 'editor', 'Content Manager', 'FB')
      `
    }

    // Seed prices
    const existingPrices = await sql`SELECT COUNT(*) as count FROM prices`
    if (Number(existingPrices[0].count) === 0) {
      await sql`
        INSERT INTO prices (name, name_bn, category, price, unit, sort_order) VALUES
        ('Newspapers & Books', 'পত্রিকা ও বই', 'paper', 12, 'kg', 1),
        ('Cardboard / Carton', 'কার্টন', 'paper', 8, 'kg', 2),
        ('White Office Paper', 'অফিস পেপার', 'paper', 15, 'kg', 3),
        ('PET Bottles (crushed)', 'পেট বোতল', 'plastic', 18, 'kg', 4),
        ('Hard Plastic (buckets, chairs)', 'হার্ড প্লাস্টিক', 'plastic', 10, 'kg', 5),
        ('Copper Wire', 'তামার তার', 'metal', 850, 'kg', 6),
        ('Aluminium', 'অ্যালুমিনিয়াম', 'metal', 140, 'kg', 7),
        ('Cast Iron', 'কাস্ট আয়রন', 'metal', 35, 'kg', 8),
        ('Mixed Steel', 'মিক্সড স্টিল', 'metal', 28, 'kg', 9),
        ('Laptop / Desktop', 'ল্যাপটপ / ডেস্কটপ', 'electronics', 1200, 'piece', 10),
        ('CRT Monitor', 'সিআরটি মনিটর', 'electronics', 300, 'piece', 11),
        ('Mobile Phone', 'মোবাইল ফোন', 'electronics', 250, 'piece', 12),
        ('Air Conditioner (split)', 'এসি (স্প্লিট)', 'appliances', 3500, 'piece', 13),
        ('Refrigerator', 'ফ্রিজ', 'appliances', 2200, 'piece', 14)
      `
    }

    // Seed service areas
    const existingAreas = await sql`SELECT COUNT(*) as count FROM service_areas`
    if (Number(existingAreas[0].count) === 0) {
      await sql`
        INSERT INTO service_areas (name_en, name_bn, crews_assigned, pickups_30d) VALUES
        ('Basaboo', 'বাসাবো', 3, 47),
        ('Khilgaon', 'খিলগাঁও', 2, 38),
        ('Rampura', 'রামপুরা', 2, 34),
        ('Gulshan', 'গুলশান', 2, 29),
        ('Bashundhara', 'বসুন্ধরা', 2, 26),
        ('Baridhara', 'বারিধারা', 1, 18),
        ('Banani', 'বনানী', 1, 15),
        ('Mirpur', 'মিরপুর', 2, 22),
        ('Uttara', 'উত্তরা', 1, 12),
        ('Mohammadpur', 'মোহাম্মদপুর', 2, 19),
        ('Dhanmondi', 'ধানমন্ডি', 1, 11),
        ('Wari', 'ওয়ারী', 1, 9)
      `
    }

    // Seed some demo pickups
    const existingPickups = await sql`SELECT COUNT(*) as count FROM pickups`
    if (Number(existingPickups[0].count) === 0) {
      await sql`
        INSERT INTO pickups (booking_ref, customer_name, phone, address, preferred_date, time_slot, scrap_types, purpose, status, assigned_crew, estimated_value, area) VALUES
        ('EVG-2026-0041', 'Rahim Uddin', '01711-234567', 'House 12, Road 4, Basaboo', '2026-05-10', 'morning', ARRAY['newspaper','aluminium'], 'sell', 'confirmed', 'Team A', 340.00, 'Basaboo'),
        ('EVG-2026-0040', 'Salma Khatun', '01812-345678', 'Flat 3B, Green View, Khilgaon', '2026-05-09', 'afternoon', ARRAY['ac','fridge'], 'sell', 'in_progress', 'Team B', 5700.00, 'Khilgaon'),
        ('EVG-2026-0039', 'Mosharraf Ali', '01913-456789', 'Block C, Bashundhara R/A', '2026-05-08', 'morning', ARRAY['laptop','mobile','copper'], 'donate', 'completed', 'Team A', 0.00, 'Bashundhara'),
        ('EVG-2026-0038', 'Nusrat Jahan', '01614-567890', 'Road 11, Gulshan-2', '2026-05-07', 'evening', ARRAY['cardboard','plastic'], 'sell', 'completed', 'Team C', 120.00, 'Gulshan'),
        ('EVG-2026-0037', 'Kamal Hossain', '01515-678901', 'Mirpur DOHS, Road 7', '2026-05-06', 'morning', ARRAY['iron','steel'], 'sell', 'completed', 'Team B', 280.00, 'Mirpur')
      `
    }

    // Seed blog posts
    const existingPosts = await sql`SELECT COUNT(*) as count FROM blog_posts`
    if (Number(existingPosts[0].count) === 0) {
      await sql`
        INSERT INTO blog_posts (title, title_bn, category, author_name, excerpt, status, published_at, read_count) VALUES
        ('E-Waste — Dhaka''s Hidden Environmental Crisis', 'ই-বর্জ্য: ঢাকার লুকানো পরিবেশ সংকট', 'ewaste', 'Yusuf Rahman', 'From discarded laptops to broken ACs, the capital generates thousands of tons of e-waste annually.', 'published', NOW() - INTERVAL '6 days', 1240),
        ('How much can a household earn from scrap each month?', 'স্ক্র্যাপ বিক্রি করে মাসে কত আয় সম্ভব?', 'income', 'Fatema Begum', 'We crunched 8 weeks of pickup data across Basaboo, Khilgaon, and Gulshan.', 'published', NOW() - INTERVAL '10 days', 890),
        ('Is your office clutter-free? A simple audit guide.', 'আপনার অফিস কি ক্লাটারমুক্ত?', 'office', 'Fatema Begum', 'A five-question framework for facilities managers to identify what to keep, sell, or remove.', 'published', NOW() - INTERVAL '16 days', 567),
        ('The future of Bangladesh''s recycling industry.', 'রিসাইক্লিং ইন্ডাস্ট্রির ভবিষ্যৎ', 'industry', 'Yusuf Rahman', 'Why digitisation isn''t optional anymore — and what the next decade looks like.', 'published', NOW() - INTERVAL '23 days', 1102),
        ('Why hoarding old items can be dangerous.', 'কেন পুরনো জিনিস রাখা বিপজ্জনক?', 'guide', 'Fatema Begum', 'Fire risk, dust mites, lost productivity — and what a one-day clearance actually feels like.', 'scheduled', NOW() + INTERVAL '2 days', 0),
        ('Selling an old AC: what to expect, what to avoid.', 'পুরনো এসি বিক্রি করার সঠিক উপায়', 'ewaste', 'Karim Hossain', 'Compressor weight, gas reclamation, and why piece-pricing beats per-kilo for appliances.', 'draft', NULL, 0)
      `
    }

    return NextResponse.json({ ok: true, message: 'Database schema created and seeded successfully.' })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
