import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role === 'editor') {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const id = Number(params.id)
    const [updated] = await sql`
      UPDATE service_areas SET
        name_en = COALESCE(${body.name_en ?? null}, name_en),
        name_bn = COALESCE(${body.name_bn ?? null}, name_bn),
        crews_assigned = COALESCE(${body.crews_assigned ?? null}, crews_assigned),
        is_active = COALESCE(${body.is_active ?? null}, is_active)
      WHERE id = ${id}
      RETURNING *
    `
    if (!updated) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
    return NextResponse.json({ ok: true, area: updated })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }
  await sql`DELETE FROM service_areas WHERE id = ${Number(params.id)}`
  return NextResponse.json({ ok: true })
}
