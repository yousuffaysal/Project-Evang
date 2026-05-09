import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  try {
    const body = await req.json()
    const { status, assigned_crew, estimated_value, notes } = body
    const id = Number(params.id)

    const [updated] = await sql`
      UPDATE pickups SET
        status = COALESCE(${status ?? null}, status),
        assigned_crew = COALESCE(${assigned_crew ?? null}, assigned_crew),
        estimated_value = COALESCE(${estimated_value ?? null}, estimated_value),
        notes = COALESCE(${notes ?? null}, notes),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    if (!updated) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
    return NextResponse.json({ ok: true, pickup: updated })
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

  const id = Number(params.id)
  await sql`DELETE FROM pickups WHERE id = ${id}`
  return NextResponse.json({ ok: true })
}
