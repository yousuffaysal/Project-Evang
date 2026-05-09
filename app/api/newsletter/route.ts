import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { email, phone, source } = await req.json()

    if (!email && !phone) {
      return NextResponse.json({ error: 'Email or phone required.' }, { status: 400 })
    }

    // Upsert by email or phone to avoid duplicates
    if (email) {
      await sql`
        INSERT INTO subscribers (email, phone, source)
        VALUES (${email}, ${phone ?? null}, ${source ?? 'newsletter'})
        ON CONFLICT (email) WHERE email IS NOT NULL DO NOTHING
      `
    } else {
      await sql`
        INSERT INTO subscribers (phone, source)
        VALUES (${phone}, ${source ?? 'newsletter'})
        ON CONFLICT (phone) WHERE phone IS NOT NULL DO NOTHING
      `
    }

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
