import fs from 'fs';

async function run() {
  const sql = fs.readFileSync('supabase/migrations/20260601000400_update_feed_likes.sql', 'utf8');
  
  const projectId = process.env.SUPABASE_PROJECT_ID || 'mqpmdethfoisgazwuxsa';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('Set SUPABASE_SERVICE_ROLE_KEY environment variable (see .env.example)');

  const res = await fetch(`https://api.supabase.com/v1/projects/${projectId}/database/query`, {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sql })
  });
  
  const text = await res.text();
  try {
      console.log(JSON.parse(text));
  } catch (e) {
      console.log(text);
  }
}

run();
