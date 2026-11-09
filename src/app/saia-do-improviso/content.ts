/**
 * Conteúdo textual da página "Saia do Improviso".
 * Copywriting humanizado baseado na Jornada do Herói:
 * - O Herói: Qualquer pessoa (empresário, empreendedor, autônomo, engenheiro, prestador de serviço)
 *   que trabalha muito, mas vive sufocado pelo improviso diário.
 * - O Vilão: A cultura do improviso que rouba o lucro, a previsibilidade e a paz com a família.
 * - O Guia: Magno Santos (método testado desde o rigor do Metrô de SP até a gestão de negócios na Coliseu).
 * - O Plano: Método de 3 engrenagens práticas + IA no bolso pelo celular.
 * - A Transformação: Sair de apagador de incêndio para líder de uma operação organizada, previsível e lucrativa.
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
    tag: "Rotina Sobrecarregada",
    title: "O dia engolido por apagar incêndios",
    text: "Você acorda com metas claras, mas passa o dia inteiro respondendo urgências, resolvendo desespero dos outros e travado no que não traz dinheiro.",
  },
  {
    icon: "trending_down",
    tag: "Finanças e Preços",
    title: "Orçamentos e propostas no 'feeling'",
    text: "Cobrar pelo que acha que vai custar sem ter margem real. Os imprevistos aparecem, o lucro evapora e você trabalha meses para empatar no zero a zero.",
  },
  {
    icon: "forum",
    tag: "Comunicação e Equipe",
    title: "Gestão e combinados perdidos no WhatsApp",
    text: "Áudios longos, tarefas de boca e comprovantes espalhados. Na hora de cobrar ou entregar, sobram desculpas, retrabalho e desgaste com o cliente.",
  },
  {
    icon: "nightlight_round",
    tag: "Vida e Família",
    title: "A noite de descanso roubada pelo computador",
    text: "Chegar em casa sem energia para a família e ter que abrir o notebook até meia-noite para colocar relatórios, propostas e planilhas em dia.",
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
    title: "Onde o Dinheiro Realmente Foge no seu Negócio",
    text: "Como mapear e estancar os ralos invisíveis de retrabalho, horas perdidas e custos emergenciais antes que eles destruam o seu lucro.",
  },
  {
    tag: "Passo 2 • Rotina sem Surpresas",
    title: "Planejamento Semanal em 15 Minutos",
    text: "O método prático para antecipar compras, entregas e demandas da semana inteira. Nunca mais dependa da sorte nem viva no desespero.",
  },
  {
    tag: "Passo 3 • Padrão de Execução",
    title: "Checklists de 3 Minutos que Zeram Erros",
    text: "Roteiros rápidos de conferência para você ou sua equipe executarem com perfeição sem você precisar ficar em cima o tempo todo.",
  },
  {
    tag: "Passo 4 • O Assistente no Bolso",
    title: "ChatGPT e IA na Prática: Do Celular para a Rotina",
    text: "Como gerar cronogramas, propostas comerciais blindadas e relatórios profissionais em 3 minutos usando Inteligência Artificial pelo smartphone.",
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
    title: "Cronograma e Planejamento em 3 Minutos",
    desc: "Sequência lógica de tarefas, compras e entregas sem complicação e sem depender de softwares caros.",
  },
  {
    icon: "description",
    title: "Contratos e Propostas sem Brechas",
    desc: "Escopos claros para fechar com clientes e parceiros sem surpresas ou prejuízos imprevistos.",
  },
  {
    icon: "fact_check",
    title: "Checklists de Conferência Instantâneos",
    desc: "Roteiros objetivos para inspecionar qualidade, serviços e entregas direto pelo celular.",
  },
  {
    icon: "summarize",
    title: "Relatórios Executivos que Geram Respeito",
    desc: "Transforme fotos e anotações soltas em um documento de alto padrão que cala qualquer reclamação.",
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
    role: "Empresários e Empreendedores",
    subtitle: "Para quem quer processos que rodam sozinhos e lucro de verdade no bolso",
    description:
      "Você não criou o seu negócio para ser o funcionário mais sobrecarregado da empresa. Descubra como estruturar processos simples para a operação rodar com qualidade mesmo quando você não estiver presente.",
    benefits: [
      "Fim da dependência total da sua presença física em tudo",
      "Previsibilidade de prazos, equipe e custos operacionais",
      "Margem de lucro protegida no fechamento de cada mês",
    ],
  },
  {
    role: "Engenheiros, Arquitetos e Técnicos",
    subtitle: "Para quem domina a técnica, mas quer parar de apagar incêndios",
    description:
      "A faculdade ensinou a calcular e desenhar, mas não ensinou a orçar com segurança, liderar equipes e negociar contratos. Transforme seu conhecimento técnico em uma operação lucrativa e respeitada.",
    benefits: [
      "Processos padronizados para orçar e fechar sem levar calote",
      "Relatórios executivos e memoriais de alto padrão usando IA",
      "Postura de empresário respeitado, não de apagador de incêndio",
    ],
  },
  {
    role: "Autônomos e Prestadores de Serviços",
    subtitle: "Para quem quer ser valorizado e parar de trabalhar de graça",
    description:
      "Seja na obra, no comércio, na consultoria ou em serviços: sem método o seu esforço vira prejuízo. Aprenda a organizar a semana, passar segurança para o cliente e usar a IA como seu braço direito.",
    benefits: [
      "Checklists rápidos para zerar retrabalho e queixas",
      "Propostas claras que eliminam discussões na hora do pagamento",
      "Mais tempo com a família sem abrir mão de faturamento",
    ],
  },
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    question: "Eu não sou da construção civil nem sou engenheiro. Essa aula serve para mim?",
    answer:
      "Com certeza. O improviso machuca qualquer setor: falta de processos, urgências engolindo o dia e dinheiro que escorre pelo ralo. As ferramentas de planejamento semanal, checklists de conferência e inteligência artificial funcionam para empresários, comerciantes, autônomos e prestadores de qualquer tipo de serviço.",
  },
  {
    question: "Não entendo nada de tecnologia e uso mal o celular. Vou conseguir acompanhar?",
    answer:
      "100%. A aula é em linguagem simples, prática e direta ao ponto. Tudo o que será demonstrado pode ser aplicado direto no seu WhatsApp e celular, sem a necessidade de programas caros ou complicados.",
  },
  {
    question: "Minha empresa é pequena ou trabalho sozinho. Vale a pena participar?",
    answer:
      "É exatamente quem tem operação enxuta que mais precisa deste método. Sem processos e sem ferramentas inteligentes, você vira escravo de cada detalhe. O método te dá a produtividade equivalente a ter uma equipe inteira no seu bolso.",
  },
  {
    question: "Como funciona a transmissão ao vivo?",
    answer:
      "Acontece no dia 20 de novembro de 2026, às 19h (horário de Brasília), ao vivo pelo Zoom. O link de acesso exclusivo é enviado para seu WhatsApp e e-mail imediatamente após a confirmação.",
  },
  {
    question: "E se eu não puder assistir ao vivo ou quiser rever depois?",
    answer:
      "O ingresso garante sua vaga na transmissão interativa. No momento do checkout, você pode incluir o acesso vitalício à gravação e aos modelos de checklists e prompts por apenas +R$ 27,00.",
  },
];

export interface OfferRow {
  label: string;
  value: string;
}

export const offerRows: OfferRow[] = [
  { label: "Data e Horário", value: "20 de novembro de 2026, às 19h (Horário de Brasília)" },
  { label: "Formato", value: "Transmissão 100% ao vivo via Zoom" },
  { label: "Mentor", value: "Magno Santos (Engenheiro & Fundador da Coliseu)" },
  { label: "Acesso aos Materiais", value: "Demonstrações práticas e modelos de IA na tela" },
];
