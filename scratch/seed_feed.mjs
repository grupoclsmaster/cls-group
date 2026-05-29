import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mqpmdethfoisgazwuxsa.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY;
if (!SUPABASE_KEY) throw new Error('Set SUPABASE_KEY environment variable (see .env.example)');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  console.log("Iniciando seed de posts da comunidade...");

  // Limpar anteriores
  await supabase.from('community_posts').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const postsData = [
    {
      author_name: "Arq. Mayara Costa",
      author_role: "Mentor Sênior",
      author_avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
      content: "Olá pessoal! Acabei de disponibilizar o novo modelo de Dossiê de Apresentação Executiva para captação de recursos com investidores na área de Recursos. Esse material tem sido fundamental para os roadshows de incorporação residencial de luxo. Deixem suas dúvidas aqui nos comentários!",
      image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
      likes_count: 8,
      liked_by_users: [],
      saved_by_users: [],
      comments: [
        {
          id: "c1",
          author_name: "Gustavo Rocha",
          author_avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200",
          author_role: "Sócio Sênior",
          content: "Excelente Mayara! Já baixei e vamos aplicar no nosso próximo empreendimento em Curitiba. O layout ficou fantástico.",
          created_at: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
        }
      ],
      created_at: new Date(Date.now() - 3600000 * 5).toISOString() // 5 hours ago
    },
    {
      author_name: "Eng. Magno Santos",
      author_role: "Mentor Sênior",
      author_avatar: "/magno.jpg",
      content: "Finalizamos hoje a concretagem da laje de transição no Residencial Horizon. Utilizarmos um concreto autoadensável de 50 MPa para vencer os grandes vãos sem comprometer a estética arquitetônica do pilotis. Próxima semana faremos a visita técnica presencial com o grupo!",
      image_url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=800",
      likes_count: 12,
      liked_by_users: [],
      saved_by_users: [],
      comments: [
        {
          id: "c2",
          author_name: "Camila T.",
          author_avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
          author_role: "Sócia Plena",
          content: "Sensacional Magno! A logística para bombear esse volume de concreto em condomínio residencial sempre é um desafio. Parabéns pelo controle de qualidade.",
          created_at: new Date(Date.now() - 3600000 * 3).toISOString() // 3 hours ago
        }
      ],
      created_at: new Date(Date.now() - 3600000 * 8).toISOString() // 8 hours ago
    }
  ];

  const { data, error } = await supabase
    .from('community_posts')
    .insert(postsData)
    .select();

  if (error) {
    console.error("Erro ao inserir posts:", error);
  } else {
    console.log("Posts inseridos com sucesso:", data.length);
  }

  console.log("Seed de posts finalizado!");
}

run().catch(console.error);
