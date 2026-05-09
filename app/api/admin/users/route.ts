import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import bcrypt from 'bcryptjs'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  const users = await sql`
    SELECT id, email, full_name, role, title, avatar_initials, created_at FROM admin_users ORDER BY id
  `
  return NextResponse.json({ users })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  try {
    const { email, password, full_name, role, title } = await req.json()
    if (!email || !password || !full_name || !role) {
      return NextResponse.json({ error: 'All fields required.' }, { status: 400 })
    }
    const hash = await bcrypt.hash(password, 10)
    const initials = full_name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    const [user] = await sql`
      INSERT INTO admin_users (email, password_hash, full_name, role, title, avatar_initials)
      VALUES (${email}, ${hash}, ${full_name}, ${role}, ${title ?? null}, ${initials})
      RETURNING id, email, full_name, role, title, avatar_initials
    `
    return NextResponse.json({ ok: true, user }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  try {
    const { id, role } = await req.json()
    await sql`UPDATE admin_users SET role = ${role} WHERE id = ${id}`
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
