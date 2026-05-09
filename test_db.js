const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
try {
  const envContent = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      process.env[key] = val;
    }
  });
} catch (e) {
  console.log('Could not load .env.local file', e.message);
}

const sql = neon(process.env.DATABASE_URL);

async function run() {
  try {
    console.log('Connecting to Neon Database...');
    console.log('DATABASE_URL is set:', !!process.env.DATABASE_URL);
    
    // Test simple select
    const now = await sql`SELECT NOW()`;
    console.log('Database time:', now[0].now);

    // Test inserting a test contact message
    console.log('Attempting insert into contact_messages...');
    const result = await sql`
      INSERT INTO contact_messages (full_name, phone, email, reason, message)
      VALUES ('Test User', '01711223344', 'test@test.com', 'General enquiry', 'Test message from scratch script')
      RETURNING id, created_at
    `;
    console.log('Insert successful! Row inserted:', result[0]);

    // Read contact_messages
    const rows = await sql`SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 5`;
    console.log('Latest 5 contact messages:', rows);

  } catch (error) {
    console.error('Database connection or query failed:', error);
  }
}

run();
