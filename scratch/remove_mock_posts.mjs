import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// We'll use service role if available for deletion, otherwise we might need RLS bypass.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase URL or Key");
  process.exit(1);
}

// Prefer service key if we have it so we bypass RLS for deletion
const client = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log("Fetching community posts to delete mock static data...");
  const { data: posts, error } = await client
    .from('community_posts')
    .select('*');

  if (error) {
    console.error("Error fetching posts:", error);
    return;
  }

  const staticAuthors = ["Arq. Mayara Costa", "Eng. Magno Santos"];
  const toDelete = posts.filter(p => staticAuthors.includes(p.author_name) || (p.author_name === "Membro Executivo"));

  console.log(`Found ${toDelete.length} mock posts to delete.`);

  for (const post of toDelete) {
    console.log(`Deleting post ID: ${post.id}, Author: ${post.author_name}`);
    const { error: delErr } = await client
      .from('community_posts')
      .delete()
      .eq('id', post.id);

    if (delErr) {
      console.error(`Failed to delete post ${post.id}:`, delErr);
    } else {
      console.log(`Deleted ${post.id}`);
    }
  }

  console.log("Done.");
}

run();
