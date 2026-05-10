import { neon } from '@neondatabase/serverless'

const getDb = () => {
  const url = process.env.DATABASE_URL
  if (!url) {
    return (...args: any[]) => {
      throw new Error(
        'Database connection URL (DATABASE_URL) is missing. Please add this environment variable in your Vercel project settings, then trigger a redeploy.'
      )
    }
  }
  return neon(url)
}

const sql = getDb()

export default sql
