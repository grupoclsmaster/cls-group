import fs from 'fs';
import path from 'path';

// Inline environment variables loader from .env.local
function loadEnv() {
  try {
    const envPath = path.resolve('.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || '';
          // Remove surrounding quotes if present
          if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
          if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
          process.env[key] = value;
        }
      });
      console.log('Loaded environment variables from .env.local');
    }
  } catch (err) {
    console.warn('Warning: Could not read .env.local:', err.message);
  }
}

async function run() {
  loadEnv();

  const sqlFile = 'supabase/migrations/20260615000000_create_missions.sql';
  if (!fs.existsSync(sqlFile)) {
    console.error(`Error: Migration file not found at ${sqlFile}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlFile, 'utf8');
  
  const projectId = process.env.SUPABASE_PROJECT_ID || 'mqpmdethfoisgazwuxsa';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    console.error('Error: SUPABASE_SERVICE_ROLE_KEY not found in environment or .env.local');
    process.exit(1);
  }

  console.log(`Applying migration to Supabase project: ${projectId}...`);

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
      const parsed = JSON.parse(text);
      console.log('Result:', parsed);
      if (parsed.error || parsed.message) {
        console.error('Migration execution failed.');
      } else {
        console.log('Migration applied successfully!');
      }
  } catch (e) {
      console.log('Raw Result:', text);
  }
}

run();
