import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mqpmdethfoisgazwuxsa.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY;
if (!SUPABASE_KEY) throw new Error('Set SUPABASE_KEY environment variable (see .env.example)');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  console.log("Iniciando seed de masterclasses...");

  // Limpar dados anteriores (opcional, mas bom para garantir consistência)
  await supabase.from('lessons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('modules').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // 1. Inserir Módulos
  const modulesData = [
    {
      id: 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
      title: "Gestão de Projetos e Planejamento de Obras",
      description: "Fundamentos essenciais de planejamento de obras, cronogramas físicos e de suprimentos.",
      sequence_order: 1,
      slug: "gestao-e-planejamento"
    },
    {
      id: 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2',
      title: "Engenharia de Custos e Viabilidade de Projetos",
      description: "Composição de custos diretos e indiretos, orçamentação avançada e análise de EVTL.",
      sequence_order: 2,
      slug: "custos-e-viabilidade"
    },
    {
      id: 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3',
      title: "Métodos Construtivos Avançados e BIM",
      description: "Adoção prática de modelagem BIM 3D/4D/5D, VDC e industrialização da construção.",
      sequence_order: 3,
      slug: "metodos-e-bim"
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

  // 2. Inserir Aulas
  const lessonsData = [
    // Módulo 1 Aulas
    {
      id: '11111111-1111-1111-1111-111111111111',
      module_id: 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
      title: "Fundamentos do Planejamento Físico-Financeiro",
      description: "Como estruturar um cronograma integrado alinhando metas físicas a desembolsos financeiros.",
      long_description: "Entenda a fundo como construir a curva S e associar tarefas físicas aos fluxos de caixa da obra. Esta aula aborda o planejamento básico que garante a saúde financeira e o ritmo de produção no canteiro.",
      duration: "18:45",
      video_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAf8QRwe3gf1pFcxu20L92dp2HUlE8A82l7fKjDzScmBTrxfFHwpkRnxBekcMm2N1gb0rMVWJWEN51WGe-0X_Bxa13yX4QlwmLABq0DdohaNdMJ1M8vpShyK3aQbZqTNtvqjLFXc7hDjey2ZdBwOyg1yOPhj0BBs_C1SdhSJ0lAuFtn3RfD1r1DWoHgYpoI4KZhDmJHIqqzyr6lAsbIUDaV8I9hBOqt9ai6CaIs6Cz4QJSv0fUH3PDIHyRJWesPpQrqbsvqzW6A0r0H",
      thumbnail_url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=600",
      instructor_name: "Eng. Magno Santos",
      instructor_role: "Mentor Sênior",
      instructor_avatar: "/magno.jpg",
      sequence_order: 1,
      slug: "planejamento-fisico-financeiro"
    },
    {
      id: '11111111-1111-1111-1111-111111111112',
      module_id: 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
      title: "Controle de Suprimentos e Logística de Canteiro",
      description: "Planejamento logístico e de suprimentos para evitar gargalos e paralisações nas frentes de trabalho.",
      long_description: "O fluxo logístico do canteiro dita o ritmo da produtividade. Aprenda como dimensionar estoques, planejar compras de longo prazo (Just In Time) e otimizar o fluxo de carga/descarga em obras de alto padrão.",
      duration: "15:20",
      video_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAf8QRwe3gf1pFcxu20L92dp2HUlE8A82l7fKjDzScmBTrxfFHwpkRnxBekcMm2N1gb0rMVWJWEN51WGe-0X_Bxa13yX4QlwmLABq0DdohaNdMJ1M8vpShyK3aQbZqTNtvqjLFXc7hDjey2ZdBwOyg1yOPhj0BBs_C1SdhSJ0lAuFtn3RfD1r1DWoHgYpoI4KZhDmJHIqqzyr6lAsbIUDaV8I9hBOqt9ai6CaIs6Cz4QJSv0fUH3PDIHyRJWesPpQrqbsvqzW6A0r0H",
      thumbnail_url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=1200",
      instructor_name: "Eng. Magno Santos",
      instructor_role: "Mentor Sênior",
      instructor_avatar: "/magno.jpg",
      sequence_order: 2,
      slug: "suprimentos-e-logistica-canteiro"
    },
    {
      id: '11111111-1111-1111-1111-111111111113',
      module_id: 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
      title: "Lean Construction e Otimização de Processos",
      description: "Adoção dos princípios da construção enxuta para redução de perdas e aumento de eficiência.",
      long_description: "Nesta aula, desvendamos como aplicar o Last Planner System para gerenciar compromissos e gargalos semanais, promovendo colaboração direta entre as equipes técnicas e reduzindo tempos ociosos.",
      duration: "22:15",
      video_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAf8QRwe3gf1pFcxu20L92dp2HUlE8A82l7fKjDzScmBTrxfFHwpkRnxBekcMm2N1gb0rMVWJWEN51WGe-0X_Bxa13yX4QlwmLABq0DdohaNdMJ1M8vpShyK3aQbZqTNtvqjLFXc7hDjey2ZdBwOyg1yOPhj0BBs_C1SdhSJ0lAuFtn3RfD1r1DWoHgYpoI4KZhDmJHIqqzyr6lAsbIUDaV8I9hBOqt9ai6CaIs6Cz4QJSv0fUH3PDIHyRJWesPpQrqbsvqzW6A0r0H",
      thumbnail_url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=600",
      instructor_name: "Arq. Mayara Santos",
      instructor_role: "Mentor Sênior",
      instructor_avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
      sequence_order: 3,
      slug: "lean-construction-otimizacao"
    },

    // Módulo 2 Aulas
    {
      id: '22222222-2222-2222-2222-222222222221',
      module_id: 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2',
      title: "Engenharia de Custos Aplicada",
      description: "Desconstruindo a composição de custos e orçamento paramétrico para obras de alto padrão.",
      long_description: "Nesta aula, o Eng. Magno Santos aborda como ultrapassar os limites tradicionais de precificação. Descubra como estruturar orçamentos de alta complexidade e precificar obras executivas sem entrar na guerra de preços de empreiteiras, utilizando princípios de engenharia de custos avançada e orçamentação por BIM.",
      duration: "18:45",
      video_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAf8QRwe3gf1pFcxu20L92dp2HUlE8A82l7fKjDzScmBTrxfFHwpkRnxBekcMm2N1gb0rMVWJWEN51WGe-0X_Bxa13yX4QlwmLABq0DdohaNdMJ1M8vpShyK3aQbZqTNtvqjLFXc7hDjey2ZdBwOyg1yOPhj0BBs_C1SdhSJ0lAuFtn3RfD1r1DWoHgYpoI4KZhDmJHIqqzyr6lAsbIUDaV8I9hBOqt9ai6CaIs6Cz4QJSv0fUH3PDIHyRJWesPpQrqbsvqzW6A0r0H",
      thumbnail_url: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=400",
      instructor_name: "Eng. Magno Santos",
      instructor_role: "Mentor Sênior",
      instructor_avatar: "/magno.jpg",
      sequence_order: 1,
      slug: "engenharia-de-custos-aplicada"
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      module_id: 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2',
      title: "Análise de Viabilidade Imobiliária",
      description: "Estratégias avançadas para estruturação financeira de terrenos e incorporação.",
      long_description: "A Arq. Mayara Santos guiará você na elaboração de Estudos de Viabilidade Técnica e Legal (EVTL) e financeira para empreendimentos de altíssimo padrão. Veja como analisar a viabilidade de landbanks e viabilizar empreendimentos corporativos de grande porte atraindo investidores qualificados.",
      duration: "24:10",
      video_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAf8QRwe3gf1pFcxu20L92dp2HUlE8A82l7fKjDzScmBTrxfFHwpkRnxBekcMm2N1gb0rMVWJWEN51WGe-0X_Bxa13yX4QlwmLABq0DdohaNdMJ1M8vpShyK3aQbZqTNtvqjLFXc7hDjey2ZdBwOyg1yOPhj0BBs_C1SdhSJ0lAuFtn3RfD1r1DWoHgYpoI4KZhDmJHIqqzyr6lAsbIUDaV8I9hBOqt9ai6CaIs6Cz4QJSv0fUH3PDIHyRJWesPpQrqbsvqzW6A0r0H",
      thumbnail_url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=400",
      instructor_name: "Arq. Mayara Santos",
      instructor_role: "Mentor Sênior",
      instructor_avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
      sequence_order: 2,
      slug: "viabilidade-imobiliaria"
    },
    {
      id: '22222222-2222-2222-2222-222222222223',
      module_id: 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2',
      title: "Gestão de Contratos de Obra (EPC/Turnkey)",
      description: "Como gerir e fechar contratos de execução de obras civis complexas com o máximo controle de riscos.",
      long_description: "A Arq. Mayara Santos detalha a formatação de propostas comerciais de alto padrão, modelagem de contratos EPC (Engineering, Procurement, and Construction), gerenciamento de claims e administração de riscos em contratos Turnkey de obras corporativas.",
      duration: "21:05",
      video_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAf8QRwe3gf1pFcxu20L92dp2HUlE8A82l7fKjDzScmBTrxfFHwpkRnxBekcMm2N1gb0rMVWJWEN51WGe-0X_Bxa13yX4QlwmLABq0DdohaNdMJ1M8vpShyK3aQbZqTNtvqjLFXc7hDjey2ZdBwOyg1yOPhj0BBs_C1SdhSJ0lAuFtn3RfD1r1DWoHgYpoI4KZhDmJHIqqzyr6lAsbIUDaV8I9hBOqt9ai6CaIs6Cz4QJSv0fUH3PDIHyRJWesPpQrqbsvqzW6A0r0H",
      thumbnail_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400",
      instructor_name: "Arq. Mayara Santos",
      instructor_role: "Mentor Sênior",
      instructor_avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
      sequence_order: 3,
      slug: "gestao-contratos-epc"
    },

    // Módulo 3 Aulas
    {
      id: '33333333-3333-3333-3333-333333333331',
      module_id: 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3',
      title: "BIM e Virtual Design in Construction (VDC)",
      description: "Técnicas de modelagem inteligente e compatibilização 3D de projetos complexos.",
      long_description: "Aprenda com o Eng. Magno Santos como as metodologias de Building Information Modeling (BIM) e VDC reduzem erros de compatibilização e desperdícios no canteiro de obras. Descubra os fluxos de trabalho fundamentais para integrar orçamento, planejamento e projeto executivo em um único modelo digital.",
      duration: "15:30",
      video_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAf8QRwe3gf1pFcxu20L92dp2HUlE8A82l7fKjDzScmBTrxfFHwpkRnxBekcMm2N1gb0rMVWJWEN51WGe-0X_Bxa13yX4QlwmLABq0DdohaNdMJ1M8vpShyK3aQbZqTNtvqjLFXc7hDjey2ZdBwOyg1yOPhj0BBs_C1SdhSJ0lAuFtn3RfD1r1DWoHgYpoI4KZhDmJHIqqzyr6lAsbIUDaV8I9hBOqt9ai6CaIs6Cz4QJSv0fUH3PDIHyRJWesPpQrqbsvqzW6A0r0H",
      thumbnail_url: "https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?auto=format&fit=crop&q=80&w=400",
      instructor_name: "Eng. Magno Santos",
      instructor_role: "Mentor Sênior",
      instructor_avatar: "/magno.jpg",
      sequence_order: 1,
      slug: "bim-vdc-modelagem"
    },
    {
      id: '33333333-3333-3333-3333-333333333332',
      module_id: 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3',
      title: "Industrialização e Estruturas Pré-Fabricadas",
      description: "Fundamentos de construção modular, pré-moldados e otimização construtiva.",
      long_description: "Explore os caminhos para reduzir prazos de obra em até 50% através da industrialização da construção. Estudaremos desde a concepção arquitetônica voltada à modulação (Design for Manufacturing and Assembly) até o içamento em canteiro.",
      duration: "20:40",
      video_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAf8QRwe3gf1pFcxu20L92dp2HUlE8A82l7fKjDzScmBTrxfFHwpkRnxBekcMm2N1gb0rMVWJWEN51WGe-0X_Bxa13yX4QlwmLABq0DdohaNdMJ1M8vpShyK3aQbZqTNtvqjLFXc7hDjey2ZdBwOyg1yOPhj0BBs_C1SdhSJ0lAuFtn3RfD1r1DWoHgYpoI4KZhDmJHIqqzyr6lAsbIUDaV8I9hBOqt9ai6CaIs6Cz4QJSv0fUH3PDIHyRJWesPpQrqbsvqzW6A0r0H",
      thumbnail_url: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&q=80&w=600",
      instructor_name: "Eng. Magno Santos",
      instructor_role: "Mentor Sênior",
      instructor_avatar: "/magno.jpg",
      sequence_order: 2,
      slug: "industrializacao-pre-fabricados"
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

  console.log("Seed finalizado com sucesso!");
}

run().catch(console.error);
