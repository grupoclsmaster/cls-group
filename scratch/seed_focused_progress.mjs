import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env.local to load environment variables
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || '';
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
          } else if (value.startsWith("'") && value.endsWith("'")) {
            value = value.substring(1, value.length - 1);
          }
          if (key === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = value;
          if (key === 'SUPABASE_SERVICE_ROLE_KEY') serviceRoleKey = value;
        }
      });
    }
  } catch (err) {
    console.error('Erro ao ler .env.local:', err);
  }
}

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Supabase URL ou Service Role Key não encontrada em process.env ou .env.local');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function run() {
  console.log("Iniciando seed de progresso para os novos cursos...");

  // 1. Obter todos os membros
  const { data: members, error: membersError } = await supabase
    .from('members')
    .select('id');

  if (membersError) {
    console.error("Erro ao carregar membros:", membersError);
    return;
  }

  console.log(`Encontrados ${members.length} membros. Inserindo progresso para cada um...`);

  // Limpar progresso anterior para evitar erros de unique constraint
  const { error: deleteError } = await supabase
    .from('user_lesson_progress')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (deleteError) {
    console.error("Erro ao limpar progresso anterior:", deleteError);
    return;
  }

  const progressData = [];

  for (const member of members) {
    // Curso 1, Aula 1.1.1 (Concluída)
    progressData.push({
      user_id: member.id,
      lesson_id: 'c0c0c0c0-0000-0000-0000-000000000111',
      watched_seconds: 1120,
      total_seconds: 1120,
      percent_complete: 100,
      completed: true
    });

    // Curso 1, Aula 1.1.2 (Em progresso - 50%)
    progressData.push({
      user_id: member.id,
      lesson_id: 'c0c0c0c0-0000-0000-0000-000000000112',
      watched_seconds: 667,
      total_seconds: 1335,
      percent_complete: 50,
      completed: false
    });

    // Curso 2, Aula 2.1.1 (Concluída)
    progressData.push({
      user_id: member.id,
      lesson_id: 'c0c0c0c0-0000-0000-0000-000000000211',
      watched_seconds: 1190,
      total_seconds: 1190,
      percent_complete: 100,
      completed: true
    });

    // Curso 2, Aula 2.1.2 (Em progresso - 25%)
    progressData.push({
      user_id: member.id,
      lesson_id: 'c0c0c0c0-0000-0000-0000-000000000212',
      watched_seconds: 363,
      total_seconds: 1452,
      percent_complete: 25,
      completed: false
    });

    // Curso 3, Aula 3.1.1 (Concluída)
    progressData.push({
      user_id: member.id,
      lesson_id: 'c0c0c0c0-0000-0000-0000-000000000311',
      watched_seconds: 945,
      total_seconds: 945,
      percent_complete: 100,
      completed: true
    });

    // Curso 3, Aula 3.1.2 (Em progresso - 10%)
    progressData.push({
      user_id: member.id,
      lesson_id: 'c0c0c0c0-0000-0000-0000-000000000312',
      watched_seconds: 173,
      total_seconds: 1730,
      percent_complete: 10,
      completed: false
    });
  }

  const { data: insertedProgress, error: progressError } = await supabase
    .from('user_lesson_progress')
    .insert(progressData)
    .select();

  if (progressError) {
    console.error("Erro ao inserir progresso:", progressError);
  } else {
    console.log("Progresso inserido com sucesso:", insertedProgress.length);
  }

  console.log("Seed de progresso finalizado com sucesso!");
}

run().catch(err => {
  console.error("Erro catastrófico no processo de seed de progresso:", err);
});
