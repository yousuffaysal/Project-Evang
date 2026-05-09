import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const rows = await sql`
    SELECT * FROM prices WHERE is_active = TRUE ORDER BY sort_order, id
  `
  return NextResponse.json({ prices: rows })
}

export async function PUT(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role === 'dispatcher') {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  try {
    const { prices } = await req.json()
    for (const p of prices) {
      await sql`
        UPDATE prices SET
          name = ${p.name},
          name_bn = ${p.name_bn ?? null},
          price = ${p.price},
          unit = ${p.unit},
          category = ${p.category},
          is_active = ${p.is_active ?? true},
          updated_at = NOW()
        WHERE id = ${p.id}
      `
    }
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role === 'dispatcher') {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  try {
    const { name, name_bn, category, price, unit } = await req.json()
    const [row] = await sql`
      INSERT INTO prices (name, name_bn, category, price, unit) VALUES (${name}, ${name_bn ?? null}, ${category}, ${price}, ${unit ?? 'kg'}) RETURNING *
    `
    return NextResponse.json({ ok: true, price: row }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
