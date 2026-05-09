import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || 'published'
  const category = searchParams.get('category')

  let rows
  if (category && category !== 'all') {
    rows = await sql`
      SELECT id, title, title_bn, category, author_name, excerpt, status, published_at, read_count, created_at
      FROM blog_posts WHERE status = ${status} AND category = ${category}
      ORDER BY published_at DESC NULLS LAST
    `
  } else {
    rows = await sql`
      SELECT id, title, title_bn, category, author_name, excerpt, status, published_at, read_count, created_at
      FROM blog_posts WHERE status = ${status}
      ORDER BY published_at DESC NULLS LAST
    `
  }

  return NextResponse.json({ posts: rows })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role === 'dispatcher') {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const [post] = await sql`
      INSERT INTO blog_posts (title, title_bn, category, author_name, excerpt, content, status, scheduled_at)
      VALUES (${body.title}, ${body.title_bn ?? null}, ${body.category}, ${body.author_name ?? session.name},
              ${body.excerpt ?? null}, ${body.content ?? null}, ${body.status ?? 'draft'}, ${body.scheduled_at ?? null})
      RETURNING *
    `
    return NextResponse.json({ ok: true, post }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
