import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const unread = searchParams.get('unread')
  const page = Math.max(1, Number(searchParams.get('page') || 1))
  const limit = 20
  const offset = (page - 1) * limit

  let rows
  if (unread === 'true') {
    rows = await sql`
      SELECT * FROM contact_messages WHERE is_read = FALSE ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
    `
  } else {
    rows = await sql`
      SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
    `
  }

  const [{ count }] = await sql`SELECT COUNT(*)::int as count FROM contact_messages WHERE is_read = FALSE`
  return NextResponse.json({ messages: rows, unread_count: count })
}

export async function POST(req: NextRequest) {
  try {
    const { full_name, phone, email, reason, message } = await req.json()
    console.log(`📩 [Contact API] Message received from "${full_name}" (${phone}) | Reason: "${reason || 'General'}"`)

    if (!full_name || !phone || !message) {
      return NextResponse.json({ error: 'Name, phone and message are required.' }, { status: 400 })
    }

    const [row] = await sql`
      INSERT INTO contact_messages (full_name, phone, email, reason, message)
      VALUES (${full_name}, ${phone}, ${email ?? null}, ${reason ?? null}, ${message})
      RETURNING id
    `

    return NextResponse.json({ ok: true, id: row.id }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  try {
    const { id, is_read } = await req.json()
    await sql`UPDATE contact_messages SET is_read = ${is_read} WHERE id = ${id}`
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
