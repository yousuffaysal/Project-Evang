import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role === 'dispatcher') {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const id = Number(params.id)
    const [updated] = await sql`
      UPDATE prices SET
        name = COALESCE(${body.name ?? null}, name),
        name_bn = COALESCE(${body.name_bn ?? null}, name_bn),
        price = COALESCE(${body.price ?? null}, price),
        unit = COALESCE(${body.unit ?? null}, unit),
        category = COALESCE(${body.category ?? null}, category),
        is_active = COALESCE(${body.is_active ?? null}, is_active),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    if (!updated) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
    return NextResponse.json({ ok: true, price: updated })
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
  await sql`DELETE FROM prices WHERE id = ${Number(params.id)}`
  return NextResponse.json({ ok: true })
}
