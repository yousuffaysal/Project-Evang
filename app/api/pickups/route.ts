import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const area = searchParams.get('area')
  const page = Math.max(1, Number(searchParams.get('page') || 1))
  const limit = 20
  const offset = (page - 1) * limit

  let rows
  if (status && area) {
    rows = await sql`
      SELECT * FROM pickups WHERE status = ${status} AND area = ${area}
      ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
    `
  } else if (status) {
    rows = await sql`
      SELECT * FROM pickups WHERE status = ${status}
      ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
    `
  } else if (area) {
    rows = await sql`
      SELECT * FROM pickups WHERE area = ${area}
      ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
    `
  } else {
    rows = await sql`
      SELECT * FROM pickups ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
    `
  }

  const [{ count }] = await sql`SELECT COUNT(*)::int as count FROM pickups`

  return NextResponse.json({ pickups: rows, total: count, page, limit })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, phone, address, date, slot, types, purpose, notes, area } = body

    if (!name || !phone || !address) {
      return NextResponse.json({ error: 'Name, phone and address are required.' }, { status: 400 })
    }

    const year = new Date().getFullYear()
    const [{ nextval }] = await sql`SELECT nextval('pickups_id_seq')::int as nextval`
    const ref = `EVG-${year}-${String(nextval).padStart(4, '0')}`

    const [pickup] = await sql`
      INSERT INTO pickups
        (booking_ref, customer_name, phone, address, preferred_date, time_slot, scrap_types, purpose, notes, area, status)
      VALUES
        (${ref}, ${name}, ${phone}, ${address}, ${date || null}, ${slot || null},
         ${types || []}, ${purpose || 'sell'}, ${notes || null}, ${area || null}, 'pending')
      RETURNING *
    `

    return NextResponse.json({ ok: true, pickup, ref }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
