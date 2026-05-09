import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const [post] = await sql`SELECT * FROM blog_posts WHERE id = ${Number(params.id)}`
  if (!post) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  await sql`UPDATE blog_posts SET read_count = read_count + 1 WHERE id = ${Number(params.id)}`
  return NextResponse.json({ post })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role === 'dispatcher') {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const id = Number(params.id)
    const publishedAt = body.status === 'published' ? 'NOW()' : null

    const [updated] = await sql`
      UPDATE blog_posts SET
        title = COALESCE(${body.title ?? null}, title),
        title_bn = COALESCE(${body.title_bn ?? null}, title_bn),
        category = COALESCE(${body.category ?? null}, category),
        author_name = COALESCE(${body.author_name ?? null}, author_name),
        excerpt = COALESCE(${body.excerpt ?? null}, excerpt),
        content = COALESCE(${body.content ?? null}, content),
        status = COALESCE(${body.status ?? null}, status),
        scheduled_at = COALESCE(${body.scheduled_at ?? null}, scheduled_at),
        published_at = CASE WHEN ${body.status ?? null} = 'published' AND published_at IS NULL THEN NOW() ELSE published_at END,
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    if (!updated) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
    return NextResponse.json({ ok: true, post: updated })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || (session.role !== 'admin' && session.role !== 'editor')) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }
  await sql`DELETE FROM blog_posts WHERE id = ${Number(params.id)}`
  return NextResponse.json({ ok: true })
}
