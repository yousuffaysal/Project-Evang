import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const rows = await sql`SELECT * FROM service_areas ORDER BY pickups_30d DESC`
  return NextResponse.json({ areas: rows })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role === 'editor') {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  try {
    const { name_en, name_bn, crews_assigned } = await req.json()
    const [row] = await sql`
      INSERT INTO service_areas (name_en, name_bn, crews_assigned) VALUES (${name_en}, ${name_bn ?? null}, ${crews_assigned ?? 1}) RETURNING *
    `
    return NextResponse.json({ ok: true, area: row }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
