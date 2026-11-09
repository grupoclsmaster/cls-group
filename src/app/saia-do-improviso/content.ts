/**
 * Conteúdo textual da página "Saia do Improviso".
 * Copywriting humanizado baseado na Jornada do Herói:
 * - O Herói: O profissional da construção que ama o canteiro, mas vive sufocado pelo improviso.
 * - O Vilão: O improviso diário que devora o lucro e rouba o tempo com a família.
 * - O Guia: Magno Santos (experiência real do Metrô de SP à Coliseu Engenharia).
 * - O Plano: Método de 3 engrenagens + IA prática no celular.
 * - A Transformação: Sair de apagador de incêndio para dono de uma operação organizada e lucrativa.
 */

export interface ProblemCard {
  icon: string;
  tag: string;
  title: string;
  text: string;
}

export const problemCards: ProblemCard[] = [
  {
    icon: "warning",
    tag: "Mestres e Empreiteiros",
    title: "O material que acaba às 10h da manhã",
    text: "Equipe parada de braço cruzado esperando areia ou cimento chegar. O frete emergencial custa o dobro e sai direto da sua comissão.",
  },
  {
    icon: "trending_down",
    tag: "Engenheiros e Arquitetos",
    title: "O orçamento dado 'no feeling'",
    text: "Você fecha a obra por um valor, os imprevistos aparecem e a conta não fecha. No fim, trabalhou meses para pagar conta e ficar no zero a zero.",
  },
  {
    icon: "forum",
    tag: "Ambos os perfis",
    title: "A gestão perdida em áudios de WhatsApp",
    text: "Combinados de boca, fotos soltas e comprovantes sumidos. Na hora de acertar medição ou pedir pagamento, sobram discussões e prejuízos.",
  },
  {
    icon: "nightlight_round",
    tag: "Ambos os perfis",
    title: "A noite em família engolida pelo computador",
    text: "Passar o dia inteiro correndo atrás de pepino no canteiro e chegar em casa exausto tendo que digitar relatório e cronograma até meia-noite.",
  },
];

export interface LessonCard {
  tag: string;
  title: string;
  text: string;
}

export const lessonCards: LessonCard[] = [
  {
    tag: "Passo 1 • Blindagem Financeira",
    title: "Onde o Dinheiro Realmente Foge na sua Obra",
    text: "Como enxergar os ralos invisíveis de material, horas ociosas e retrabalho antes que eles comam a sua margem.",
  },
  {
    tag: "Passo 2 • Campo sem Surpresa",
    title: "Planejamento Semanal em 15 Minutos",
    text: "O método prático para pedir na quarta o que roda na semana que vem. Nunca mais pague frete caro nem pare pedreiro.",
  },
  {
    tag: "Passo 3 • Padrão de Execução",
    title: "Checklists de 3 Minutos que Evitam Quebra-Quebra",
    text: "O que bater o olho em armadura, fôrma, elétrica e alvenaria antes que o erro seja concretado.",
  },
  {
    tag: "Passo 4 • O Seu Assistente no Bolso",
    title: "ChatGPT e IA na Tela: Do Celular para a Obra",
    text: "Como gerar cronograma, memorial de contrato e relatório semanal para cliente em 3 minutos usando Inteligência Artificial.",
  },
];

export interface AiItem {
  icon: string;
  title: string;
  desc: string;
}

export const aiItems: AiItem[] = [
  {
    icon: "calendar_month",
    title: "Cronograma Completo em 3 Minutos",
    desc: "Sequência lógica de fundação ao acabamento sem quebrar a cabeça no Excel.",
  },
  {
    icon: "description",
    title: "Escopos e Contratos sem Brecha",
    desc: "Memoriais claros para fechar com equipe e cliente sem espaço para aditivos de prejuízo.",
  },
  {
    icon: "fact_check",
    title: "Checklist de Inspeção Instantâneo",
    desc: "Listas rápidas para checar ferragem, fôrma e tubulação direto no canteiro pelo celular.",
  },
  {
    icon: "summarize",
    title: "Relatório de Obra que Transmite Respeito",
    desc: "Transforme fotos soltas em um PDF executivo que deixa o cliente seguro e cala qualquer reclamação.",
  },
];

export interface AudienceProfile {
  role: string;
  subtitle: string;
  description: string;
  benefits: string[];
}

export const audienceProfiles: AudienceProfile[] = [
  {
    role: "Engenheiros Civis e Arquitetos",
    subtitle: "Para quem quer sair do operacional sufocante e ter uma empresa respeitada",
    description:
      "A faculdade ensinou a calcular viga, mas não ensinou a cobrar, fechar contrato seguro e liderar canteiro. Pare de ser refém da insegurança e estruture processos para ter previsibilidade financeira.",
    benefits: [
      "Processos padronizados para orçar e fechar obras com margem no bolso",
      "Como apresentar memoriais e relatórios de alto padrão usando IA",
      "Postura de empresário da engenharia, não de apagador de incêndio",
    ],
  },
  {
    role: "Mestres de Obras e Empreiteiros",
    subtitle: "Para quem domina a colher de pedreiro, mas perde o lucro na desorganização",
    description:
      "Você sabe construir melhor do que qualquer um de terno. Mas se o material falta e a conferência falha, o prejuízo sobra para você pagar. Aprenda a planejar a semana para ver o dinheiro render.",
    benefits: [
      "Planejamento simples de compras para nunca faltar insumo na obra",
      "Checklists fáceis para zerar retrabalho e quebra-quebra",
      "Medições formais e comprovantes claros para receber sem discussões",
    ],
  },
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    question: "A aula serve para quem trabalha com obras residenciais e reformas pequenas?",
    answer:
      "Com certeza. É exatamente na obra residencial de R$ 50 mil a R$ 1 milhão que o improviso mais machuca, porque o dinheiro sai direto do seu bolso. O método funciona para reforma de apartamento, casa térrea, sobrado ou condomínio.",
  },
  {
    question: "Sou recém-formado e ainda não peguei minha primeira obra. Devo participar?",
    answer:
      "Sem dúvida. Começar sem método custa muito caro: um erro de armadura ou uma compra errada já comem todo o seu lucro. Você vai entrar no mercado com a postura e as ferramentas de quem tem 10 anos de experiência.",
  },
  {
    question: "Não entendo nada de computador e uso mal o celular. Vou conseguir aplicar?",
    answer:
      "100%. A aula é em português simples, de quem pisa na terra com bota suja. Tudo que será mostrado você consegue usar pelo próprio WhatsApp e celular, sem precisar de programas caros ou complicados.",
  },
  {
    question: "Como funciona a transmissão ao vivo?",
    answer:
      "Acontece no dia 20 de novembro de 2026, às 19h (horário de Brasília), ao vivo pelo Zoom. O link de acesso exclusivo é enviado para seu WhatsApp e e-mail imediatamente após a confirmação.",
  },
  {
    question: "E se eu não puder assistir ao vivo ou quiser rever depois?",
    answer:
      "O ingresso garante sua vaga na transmissão interativa. No momento do checkout, você pode incluir o acesso vitalício à gravação e aos modelos de checklists por apenas +R$ 27,00.",
  },
];

export interface OfferRow {
  label: string;
  value: string;
}

export const offerRows: OfferRow[] = [
  { label: "Data e Horário", value: "20 de novembro de 2026, às 19h (Horário de Brasília)" },
  { label: "Formato", value: "Transmissão 100% ao vivo via Zoom" },
  { label: "Instrutor", value: "Magno Santos (Engenheiro Civil & Fundador da Coliseu)" },
  { label: "Acesso aos Materiais", value: "Demonstrações práticas e prompts de IA na tela" },
];
