import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mqpmdethfoisgazwuxsa.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY;
if (!SUPABASE_KEY) throw new Error('Set SUPABASE_KEY environment variable (see .env.example)');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  console.log("Iniciando seed de progresso...");

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
  await supabase.from('user_lesson_progress').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const progressData = [];

  for (const member of members) {
    // Progresso Aula 1.1: 53%
    progressData.push({
      user_id: member.id,
      lesson_id: '11111111-1111-1111-1111-111111111111',
      watched_seconds: 600,
      total_seconds: 1125,
      percent_complete: 53,
      completed: false
    });

    // Progresso Aula 2.1: 100% (Concluída)
    progressData.push({
      user_id: member.id,
      lesson_id: '22222222-2222-2222-2222-222222222221',
      watched_seconds: 1125,
      total_seconds: 1125,
      percent_complete: 100,
      completed: true
    });

    // Progresso Aula 2.2: 15% (Assistindo atualmente)
    progressData.push({
      user_id: member.id,
      lesson_id: '22222222-2222-2222-2222-222222222222',
      watched_seconds: 216,
      total_seconds: 1450,
      percent_complete: 15,
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

  console.log("Seed de progresso finalizado!");
}

run().catch(console.error);
