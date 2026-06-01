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
  console.log("Iniciando seed de Masterclasses focadas em Engenharia e Empreendedorismo...");

  // 1. Limpar dados anteriores de progresso de aulas para evitar violações de foreign key
  console.log("Limpando progresso de aulas anterior...");
  const { error: deleteProgressError } = await supabase
    .from('user_lesson_progress')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  
  if (deleteProgressError) {
    console.warn("Aviso ao limpar progresso:", deleteProgressError.message);
  }

  // 2. Limpar aulas anteriores
  console.log("Limpando aulas anteriores...");
  const { error: deleteLessonsError } = await supabase
    .from('lessons')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (deleteLessonsError) {
    console.warn("Aviso ao limpar aulas:", deleteLessonsError.message);
  }

  // 3. Limpar módulos anteriores
  console.log("Limpando módulos anteriores...");
  const { error: deleteModulesError } = await supabase
    .from('modules')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (deleteModulesError) {
    console.warn("Aviso ao limpar módulos:", deleteModulesError.message);
  }

  // 4. Limpar cursos anteriores
  console.log("Limpando cursos anteriores...");
  const { error: deleteCoursesError } = await supabase
    .from('courses')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (deleteCoursesError) {
    console.warn("Aviso ao limpar cursos:", deleteCoursesError.message);
  }

  // 5. Inserir Cursos (Masterclasses)
  console.log("Inserindo novos Cursos (Masterclasses)...");
  const coursesData = [
    {
      id: 'a0a0a0a0-0000-0000-0000-000000000001',
      title: 'Incorporação Imobiliária e SPE/SCP',
      description: 'Aprenda as principais estruturas societárias, aspectos jurídicos e viabilidade financeira aplicados a projetos imobiliários sob regimes de SPE e SCP.',
      cover_image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800',
      status: 'publicado',
      sequence_order: 1,
      slug: 'incorporacao-spe-scp'
    },
    {
      id: 'a0a0a0a0-0000-0000-0000-000000000002',
      title: 'Engenharia de Custos e Planejamento',
      description: 'Técnicas avançadas de orçamento base, curva ABC de insumos, planejamento físico-financeiro e controle de suprimentos em canteiros de obras.',
      cover_image_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800',
      status: 'publicado',
      sequence_order: 2,
      slug: 'engenharia-de-custos-e-planejamento'
    },
    {
      id: 'a0a0a0a0-0000-0000-0000-000000000003',
      title: 'Empreendedorismo e Captação de Equity',
      description: 'Como formatar novos negócios imobiliários, construir pitch decks de alto impacto e negociar captação de recursos com Family Offices e fundos de investimento.',
      cover_image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
      status: 'publicado',
      sequence_order: 3,
      slug: 'empreendedorismo-e-equity'
    }
  ];

  const { data: insertedCourses, error: coursesError } = await supabase
    .from('courses')
    .insert(coursesData)
    .select();

  if (coursesError) {
    console.error("Erro ao inserir cursos:", coursesError);
    return;
  }
  console.log("Cursos inseridos com sucesso:", insertedCourses.length);

  // 6. Inserir Módulos
  console.log("Inserindo novos Módulos...");
  const modulesData = [
    // Curso 1
    {
      id: 'b0b0b0b0-0000-0000-0000-000000000101',
      course_id: 'a0a0a0a0-0000-0000-0000-000000000001',
      title: 'Estruturação Societária e SPE/SCP',
      description: 'Entenda as principais estruturas societárias utilizadas na incorporação imobiliária.',
      sequence_order: 1,
      slug: 'estruturacao-societaria-spe-scp',
      status: 'publicado'
    },
    {
      id: 'b0b0b0b0-0000-0000-0000-000000000102',
      course_id: 'a0a0a0a0-0000-0000-0000-000000000001',
      title: 'Viabilidade Financeira de Empreendimentos',
      description: 'O passo a passo para calcular e simular a rentabilidade do empreendimento imobiliário.',
      sequence_order: 2,
      slug: 'viabilidade-financeira-empreendimentos',
      status: 'publicado'
    },
    // Curso 2
    {
      id: 'b0b0b0b0-0000-0000-0000-000000000201',
      course_id: 'a0a0a0a0-0000-0000-0000-000000000002',
      title: 'Orçamentação e Curva ABC',
      description: 'Planejando os custos de materiais e serviços com foco em alta eficiência e produtividade.',
      sequence_order: 1,
      slug: 'orcamentacao-e-curva-abc',
      status: 'publicado'
    },
    {
      id: 'b0b0b0b0-0000-0000-0000-000000000202',
      course_id: 'a0a0a0a0-0000-0000-0000-000000000002',
      title: 'Planejamento Físico-Financeiro e Lean',
      description: 'Acompanhamento de cronograma e ferramentas de valor enxuto (Lean Construction).',
      sequence_order: 2,
      slug: 'planejamento-e-lean',
      status: 'publicado'
    },
    // Curso 3
    {
      id: 'b0b0b0b0-0000-0000-0000-000000000301',
      course_id: 'a0a0a0a0-0000-0000-0000-000000000003',
      title: 'Pitch Deck e Proposta de Valor',
      description: 'A narrativa ideal para apresentar seu projeto a grandes investidores e parceiros estratégicos.',
      sequence_order: 1,
      slug: 'pitch-deck-e-proposta',
      status: 'publicado'
    },
    {
      id: 'b0b0b0b0-0000-0000-0000-000000000302',
      course_id: 'a0a0a0a0-0000-0000-0000-000000000003',
      title: 'Processos de Captação e Negociação',
      description: 'Relacionamento, due diligence e governança corporativa no pós-captação.',
      sequence_order: 2,
      slug: 'processos-de-captacao',
      status: 'publicado'
    }
  ];

  const { data: insertedModules, error: modulesError } = await supabase
    .from('modules')
    .insert(modulesData)
    .select();

  if (modulesError) {
    console.error("Erro ao inserir módulos:", modulesError);
    return;
  }
  console.log("Módulos inseridos com sucesso:", insertedModules.length);

  // 7. Inserir Aulas
  console.log("Inserindo novas Aulas...");
  const sharedVideoUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuAf8QRwe3gf1pFcxu20L92dp2HUlE8A82l7fKjDzScmBTrxfFHwpkRnxBekcMm2N1gb0rMVWJWEN51WGe-0X_Bxa13yX4QlwmLABq0DdohaNdMJ1M8vpShyK3aQbZqTNtvqjLFXc7hDjey2ZdBwOyg1yOPhj0BBs_C1SdhSJ0lAuFtn3RfD1r1DWoHgYpoI4KZhDmJHIqqzyr6lAsbIUDaV8I9hBOqt9ai6CaIs6Cz4QJSv0fUH3PDIHyRJWesPpQrqbsvqzW6A0r0H";

  const lessonsData = [
    // Curso 1, Módulo 1
    {
      id: 'c0c0c0c0-0000-0000-0000-000000000111',
      module_id: 'b0b0b0b0-0000-0000-0000-000000000101',
      title: "Diferenças Cruciais entre SPE e SCP",
      description: "Como escolher o modelo societário ideal para seu negócio e a segurança dos investidores.",
      long_description: "Nesta aula, analisamos as vantagens, desvantagens e os riscos jurídicos ao optar entre Sociedade de Propósito Específico (SPE) e Sociedade em Conta de Participação (SCP) na estruturação de projetos.",
      duration: "18:40",
      video_url: sharedVideoUrl,
      thumbnail_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400",
      cover_image_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400",
      instructor_name: "GABRIEL EVANGELISTA",
      instructor_role: "Especialista em SPE/SCP",
      instructor_avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
      sequence_order: 1,
      slug: "spe-vs-scp",
      status: 'publicado'
    },
    {
      id: 'c0c0c0c0-0000-0000-0000-000000000112',
      module_id: 'b0b0b0b0-0000-0000-0000-000000000101',
      title: "Cláusulas Vitais no Acordo de Sócios",
      description: "Regras de saída, diluição de participação e resolução de conflitos em contratos imobiliários.",
      long_description: "O acordo de sócios é a peça-chave para evitar litígios futuros. Descubra as cláusulas obrigatórias de drag-along, tag-along e direito de preferência aplicados ao mercado de incorporação.",
      duration: "22:15",
      video_url: sharedVideoUrl,
      thumbnail_url: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=400",
      cover_image_url: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=400",
      instructor_name: "GABRIEL EVANGELISTA",
      instructor_role: "Especialista em SPE/SCP",
      instructor_avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
      sequence_order: 2,
      slug: "acordo-de-socios",
      status: 'publicado'
    },
    // Curso 1, Módulo 2
    {
      id: 'c0c0c0c0-0000-0000-0000-000000000121',
      module_id: 'b0b0b0b0-0000-0000-0000-000000000102',
      title: "Modelagem de VGV e Margens",
      description: "Como calcular o Valor Geral de Venda e estruturar margens de lucro líquidas.",
      long_description: "Aprenda o passo a passo para estimar o VGV com base em pesquisas mercadológicas realistas e calcular a margem de contribuição deduzindo impostos, taxas e comissões.",
      duration: "25:10",
      video_url: sharedVideoUrl,
      thumbnail_url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=400",
      cover_image_url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=400",
      instructor_name: "Arq. Mayara Costa",
      instructor_role: "Mentora de Viabilidade",
      instructor_avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
      sequence_order: 1,
      slug: "calculo-vgv-margem",
      status: 'publicado'
    },
    {
      id: 'c0c0c0c0-0000-0000-0000-000000000122',
      module_id: 'b0b0b0b0-0000-0000-0000-000000000102',
      title: "TIR, VPL e Payback Descontado",
      description: "Análise aprofundada dos principais indicadores financeiros exigidos por investidores.",
      long_description: "Compreenda a diferença entre TIR nominal e real, como calcular o Valor Presente Líquido (VPL) e analisar o tempo de retorno do capital investido corrigido pela taxa de atratividade.",
      duration: "30:05",
      video_url: sharedVideoUrl,
      thumbnail_url: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=400",
      cover_image_url: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=400",
      instructor_name: "Arq. Mayara Costa",
      instructor_role: "Mentora de Viabilidade",
      instructor_avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
      sequence_order: 2,
      slug: "tir-vpl-payback",
      status: 'publicado'
    },

    // Curso 2, Módulo 1
    {
      id: 'c0c0c0c0-0000-0000-0000-000000000211',
      module_id: 'b0b0b0b0-0000-0000-0000-000000000201',
      title: "Orçamento Paramétrico vs Executivo",
      description: "Como estimar custos na fase de estudo de viabilidade e detalhar no projeto executivo.",
      long_description: "Diferencie a estimativa paramétrica baseada em CUB do orçamento detalhado por composições de custos. Veja como mitigar desvios e erros de quantificação na fase inicial.",
      duration: "19:50",
      video_url: sharedVideoUrl,
      thumbnail_url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=400",
      cover_image_url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=400",
      instructor_name: "Eng. Magno Santos",
      instructor_role: "Mentor de Engenharia",
      instructor_avatar: "/magno.jpg",
      sequence_order: 1,
      slug: "orcamento-basico-vs-executivo",
      status: 'publicado'
    },
    {
      id: 'c0c0c0c0-0000-0000-0000-000000000212',
      module_id: 'b0b0b0b0-0000-0000-0000-000000000201',
      title: "Gestão Estratégica com Curva ABC",
      description: "Foco nos 20% dos insumos que determinam 80% do custo final da sua obra.",
      long_description: "Aprenda a aplicar a Curva ABC para negociar compras de insumos críticos de forma inteligente, evitando aumentos imprevistos e otimizando o fluxo financeiro da obra.",
      duration: "24:12",
      video_url: sharedVideoUrl,
      thumbnail_url: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&q=80&w=400",
      cover_image_url: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&q=80&w=400",
      instructor_name: "Eng. Magno Santos",
      instructor_role: "Mentor de Engenharia",
      instructor_avatar: "/magno.jpg",
      sequence_order: 2,
      slug: "gestao-curva-abc",
      status: 'publicado'
    },
    // Curso 2, Módulo 2
    {
      id: 'c0c0c0c0-0000-0000-0000-000000000221',
      module_id: 'b0b0b0b0-0000-0000-0000-000000000202',
      title: "Curva S e Linha de Balanço",
      description: "Acompanhamento integrado do avanço físico e despesas financeiras programadas.",
      long_description: "Construa a Linha de Balanço para planejar a repetição de atividades (ritmo de pavimentos) e utilize a Curva S para comparar o planejado com o executado.",
      duration: "21:05",
      video_url: sharedVideoUrl,
      thumbnail_url: "https://images.unsplash.com/photo-1503387762-592dedb8c260?auto=format&fit=crop&q=80&w=400",
      cover_image_url: "https://images.unsplash.com/photo-1503387762-592dedb8c260?auto=format&fit=crop&q=80&w=400",
      instructor_name: "Eng. Magno Santos",
      instructor_role: "Mentor de Engenharia",
      instructor_avatar: "/magno.jpg",
      sequence_order: 1,
      slug: "curva-s-linha-balanco",
      status: 'publicado'
    },
    {
      id: 'c0c0c0c0-0000-0000-0000-000000000222',
      module_id: 'b0b0b0b0-0000-0000-0000-000000000202',
      title: "Metodologia Last Planner no Canteiro",
      description: "Construção enxuta para redução de desperdícios e cumprimento de metas semanais.",
      long_description: "Entenda a aplicação prática do Lean Construction através do planejamento em três níveis (longo, médio e curto prazo) e o controle do Percentual de Planos Concluídos (PPC).",
      duration: "22:15",
      video_url: sharedVideoUrl,
      thumbnail_url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600",
      cover_image_url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600",
      instructor_name: "Eng. Magno Santos",
      instructor_role: "Mentor de Engenharia",
      instructor_avatar: "/magno.jpg",
      sequence_order: 2,
      slug: "lean-last-planner",
      status: 'publicado'
    },

    // Curso 3, Módulo 1
    {
      id: 'c0c0c0c0-0000-0000-0000-000000000311',
      module_id: 'b0b0b0b0-0000-0000-0000-000000000301',
      title: "Estrutura Lógica de um Pitch Deck",
      description: "Como criar uma apresentação de alto impacto que capta a atenção do investidor.",
      long_description: "Abordamos a ordem ideal dos slides para projetos imobiliários: da oportunidade de mercado, passando pelo EVTL, até as estimativas de retorno financeiro e chamada para aporte.",
      duration: "15:45",
      video_url: sharedVideoUrl,
      thumbnail_url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=400",
      cover_image_url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=400",
      instructor_name: "GABRIEL EVANGELISTA",
      instructor_role: "Especialista em Captação",
      instructor_avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
      sequence_order: 1,
      slug: "estrutura-pitch-deck",
      status: 'publicado'
    },
    {
      id: 'c0c0c0c0-0000-0000-0000-000000000312',
      module_id: 'b0b0b0b0-0000-0000-0000-000000000301',
      title: "Valuation e Proposta de Investimento",
      description: "Como precificar o terreno e propor a divisão societária (Equity) ideal.",
      long_description: "Entenda as metodologias de fluxo de caixa descontado e múltiplos de mercado para definir o valuation pré-money da incorporadora e os percentuais de participação dos investidores.",
      duration: "28:50",
      video_url: sharedVideoUrl,
      thumbnail_url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=400",
      cover_image_url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=400",
      instructor_name: "GABRIEL EVANGELISTA",
      instructor_role: "Especialista em Captação",
      instructor_avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
      sequence_order: 2,
      slug: "valuation-equity",
      status: 'publicado'
    },
    // Curso 3, Módulo 2
    {
      id: 'c0c0c0c0-0000-0000-0000-000000000321',
      module_id: 'b0b0b0b0-0000-0000-0000-000000000302',
      title: "Negociando com Family Offices",
      description: "A mentalidade de preservação de patrimônio e as expectativas de grandes fortunas.",
      long_description: "Saiba o que buscam os gestores de Family Offices antes de investir. Entenda como criar relatórios de transparência e manter canais de comunicação corporativos profissionais.",
      duration: "22:30",
      video_url: sharedVideoUrl,
      thumbnail_url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600",
      cover_image_url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600",
      instructor_name: "GABRIEL EVANGELISTA",
      instructor_role: "Especialista em Captação",
      instructor_avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
      sequence_order: 1,
      slug: "negociacao-family-offices",
      status: 'publicado'
    },
    {
      id: 'c0c0c0c0-0000-0000-0000-000000000322',
      module_id: 'b0b0b0b0-0000-0000-0000-000000000302',
      title: "Processo de Due Diligence e Fechamento",
      description: "Os principais documentos e auditorias que precedem a assinatura do contrato.",
      long_description: "Uma visão minuciosa sobre a due diligence jurídica, contábil e técnica do terreno e da SPE, desmistificando os requisitos contratuais mais comuns de fechamento.",
      duration: "17:15",
      video_url: sharedVideoUrl,
      thumbnail_url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=400",
      cover_image_url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=400",
      instructor_name: "GABRIEL EVANGELISTA",
      instructor_role: "Especialista em Captação",
      instructor_avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
      sequence_order: 2,
      slug: "due-diligence-fechamento",
      status: 'publicado'
    }
  ];

  const { data: insertedLessons, error: lessonsError } = await supabase
    .from('lessons')
    .insert(lessonsData)
    .select();

  if (lessonsError) {
    console.error("Erro ao inserir aulas:", lessonsError);
    return;
  }
  console.log("Aulas inseridas com sucesso:", insertedLessons.length);
  console.log("Seeding de Masterclasses concluído com sucesso!");
}

run().catch(err => {
  console.error("Erro catastrófico no processo de seed:", err);
});
