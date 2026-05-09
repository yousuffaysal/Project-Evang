import { neon } from '@neondatabase/serverless'

// Use a fallback connection string during build time if DATABASE_URL is not set
const sql = neon(process.env.DATABASE_URL || 'postgres://build-time-mock:mock@localhost:5432/mock')

export default sql
