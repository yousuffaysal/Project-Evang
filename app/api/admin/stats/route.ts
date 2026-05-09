import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const [totalPickups] = await sql`SELECT COUNT(*)::int as count FROM pickups`
  const [pendingPickups] = await sql`SELECT COUNT(*)::int as count FROM pickups WHERE status = 'pending'`
  const [completedThisMonth] = await sql`
    SELECT COUNT(*)::int as count FROM pickups
    WHERE status = 'completed' AND created_at >= date_trunc('month', NOW())
  `
  const [revenueThisMonth] = await sql`
    SELECT COALESCE(SUM(estimated_value), 0)::numeric as total FROM pickups
    WHERE status = 'completed' AND created_at >= date_trunc('month', NOW())
  `
  const [unreadMessages] = await sql`SELECT COUNT(*)::int as count FROM contact_messages WHERE is_read = FALSE`
  const [subscribers] = await sql`SELECT COUNT(*)::int as count FROM subscribers`

  // Pickups per day for the last 7 days (for chart)
  const chartData = await sql`
    SELECT
      TO_CHAR(d::date, 'Dy') as label,
      COUNT(p.id)::int as value
    FROM generate_series(NOW() - INTERVAL '6 days', NOW(), '1 day') d
    LEFT JOIN pickups p ON p.created_at::date = d::date
    GROUP BY d ORDER BY d
  `

  // Area breakdown
  const areas = await sql`
    SELECT area, COUNT(*)::int as count FROM pickups
    WHERE area IS NOT NULL
    GROUP BY area ORDER BY count DESC LIMIT 6
  `

  const recentPickups = await sql`
    SELECT id, booking_ref, customer_name, phone, area, status, estimated_value, created_at
    FROM pickups ORDER BY created_at DESC LIMIT 5
  `

  return NextResponse.json({
    kpis: {
      total_pickups: totalPickups.count,
      pending_pickups: pendingPickups.count,
      completed_this_month: completedThisMonth.count,
      revenue_this_month: Number(revenueThisMonth.total),
      unread_messages: unreadMessages.count,
      subscribers: subscribers.count,
    },
    chart: chartData,
    areas,
    recent_pickups: recentPickups,
  })
}
