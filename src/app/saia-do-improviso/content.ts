/**
 * Conteúdo textual da página "Saia do Improviso".
 * Copywriting direcionado para os 2 ICPs centrais:
 * 1. Engenheiros (recém-formados ou no mercado) que precisam estruturar seu negócio.
 * 2. Mestres de obras e empreiteiros que sofrem com desorganização e perdem margem de lucro.
 */

export interface ProblemCard {
  icon: string;
  tag: string;
  title: string;
  text: string;
}

export const problemCards: ProblemCard[] = [
  {
    icon: "business_center",
    tag: "Engenheiros",
    title: "Sabe a técnica, mas não tem o negócio estruturado",
    text: "A faculdade ensinou a calcular, mas não ensinou a gerenciar obra. Você pega serviços sem processo comercial claro, sofre para orçar com segurança e vive sobrecarregado no operacional sem saber se a conta vai fechar.",
  },
  {
    icon: "trending_down",
    tag: "Mestres de Obras",
    title: "O canteiro desorganizado que come o seu lucro",
    text: "Material pedido em cima da hora com frete caro, equipe parada esperando cimento chegar e quebra-quebra por falta de alinhamento. No fim da obra, o dinheiro que deveria ser o seu lucro escorre pelo ralo.",
  },
  {
    icon: "chat_bubble_outline",
    tag: "Ambos os perfis",
    title: "Gestão perdida no WhatsApp e combinados de boca",
    text: "Medições, recibos, pedidos de alteração e comprovantes espalhados em conversas de celular. Na hora de prestar contas ou acertar pagamentos, sobram discussões e faltam comprovantes formais.",
  },
  {
    icon: "schedule",
    tag: "Ambos os perfis",
    title: "O ciclo do apagador de incêndio",
    text: "Passar o dia inteiro correndo atrás de pepino no canteiro e chegar em casa exausto tendo que orçar, montar diário de obra e responder cliente até tarde da noite no computador.",
  },
];

export interface LessonCard {
  tag: string;
  title: string;
  text: string;
}

export const lessonCards: LessonCard[] = [
  {
    tag: "Módulo 1 • Visão de Negócio",
    title: "Estruturação de Processos e Blindagem de Margem",
    text: "Como estruturar sua prestação de serviço como um negócio de verdade: definição de escopo, orçamentação segura e identificação imediata de onde o dinheiro vaza no canteiro.",
  },
  {
    tag: "Módulo 2 • Campo e Suprimentos",
    title: "Planejamento Semanal de Obras sem Teoria Inútil",
    text: "O método de programação semanal de compras e equipes: saiba o que pedir com antecedência para nunca ter profissional parado nem pagar frete emergencial.",
  },
  {
    tag: "Módulo 3 • Controle e Qualidade",
    title: "Padrões de Conferência e Medição de Serviços",
    text: "Checklists objetivos de campo para fôrma, armadura, instalações e alvenaria: como inspecionar antes de fechar e registrar medições que eliminam retrabalho e discussões.",
  },
  {
    tag: "Módulo 4 • Tecnologia na Prática",
    title: "IA e ChatGPT Aplicados à Rotina da Construção",
    text: "Na tela ao vivo: como usar Inteligência Artificial para gerar cronogramas, memoriais descritivos, listas de compras e relatórios para clientes em menos de 5 minutos.",
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
    title: "Cronogramas de Execução",
    desc: "Gere o sequenciamento lógico de fundação a acabamento em minutos para apresentar prazos reais a clientes e equipes.",
  },
  {
    icon: "description",
    title: "Memoriais e Escopos de Contrato",
    desc: "Elabore especificações técnicas claras para fechar com empreiteiros sem deixar pontas soltas nem margem para aditivos surpresa.",
  },
  {
    icon: "fact_check",
    title: "Checklists de Fiscalização de Campo",
    desc: "Listas práticas para checar armaduras, concretagem, impermeabilização e tubulações antes que o erro seja concretado.",
  },
  {
    icon: "summarize",
    title: "Relatórios de Obra para Clientes",
    desc: "Transforme fotos e anotações do dia a dia em relatórios formais e organizados que transmitem autoridade imediata.",
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
    subtitle: "Recém-formados ou no mercado que precisam estruturar seu negócio",
    description:
      "Para quem domina o conhecimento técnico, mas nunca aprendeu a gerenciar o negócio: sofre para orçar com segurança, não tem processos padronizados de contrato e escopo, e vive sobrecarregado no operacional sem previsibilidade financeira.",
    benefits: [
      "Processos claros para orçar e fechar serviços com margem de lucro garantida",
      "Como gerar memoriais, cronogramas e relatórios técnicos usando IA em 5 minutos",
      "Sair do operacional sufocante para se posicionar como um profissional/empresa estruturada",
    ],
  },
  {
    role: "Mestres de Obras e Empreiteiros",
    subtitle: "Quem domina o canteiro, mas perde a margem de lucro por desorganização",
    description:
      "Para quem sabe executar como ninguém, mas sofre no dia a dia com pedidos de material de última hora, equipe parada por falta de insumo e retrabalho que devora o lucro suado do mês.",
    benefits: [
      "Planejamento semanal de compras para nunca pagar frete caro nem parar equipe",
      "Checklists práticos de conferência de campo para zerar erros e retrabalho",
      "Controle de medições e avanço de obra para blindar o dinheiro que sobra no seu bolso",
    ],
  },
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    question: "A aula serve tanto para engenheiros quanto para mestres de obras?",
    answer:
      "Exatamente. O método conecta as duas pontas essenciais da construção: a gestão e estruturação do negócio (que o engenheiro precisa) e a organização prática do canteiro e proteção de margem (que o mestre de obras precisa).",
  },
  {
    question: "Sou engenheiro recém-formado ou estou no mercado há algum tempo sem empresa estruturada. Devo participar?",
    answer:
      "Sim. É justamente para você estruturar seu negócio antes de continuar perdendo tempo e dinheiro. Entrar em projetos sem método comercial, orçamentação segura e processos claros queima a sua margem e a sua reputação com os clientes.",
  },
  {
    question: "Sou mestre de obras ou empreiteiro e não domino tecnologia. Vou conseguir aplicar?",
    answer:
      "Com certeza. A aula é 100% prática, sem enrolação teórica, falando a linguagem do canteiro. Você vai aprender a organizar sua semana de compras, usar listas simples de conferência e até usar o celular com Inteligência Artificial para fazer relatórios em minutos.",
  },
  {
    question: "Como funciona a transmissão ao vivo?",
    answer:
      "A aula acontece no dia 20 de novembro de 2026, às 19h (horário de Brasília), ao vivo pelo Zoom. O link de acesso exclusivo é enviado imediatamente após a confirmação da sua inscrição.",
  },
  {
    question: "E se eu quiser rever o conteúdo depois?",
    answer:
      "O ingresso garante sua participação ao vivo. Caso queira acesso vitalício à gravação e aos materiais demonstrados, você pode adicionar a gravação no checkout por apenas R$ 27,00.",
  },
];

export interface OfferRow {
  label: string;
  value: string;
}

export const offerRows: OfferRow[] = [
  { label: "Data e Horário", value: "20 de novembro de 2026, às 19h (BRT)" },
  { label: "Transmissão", value: "Ao vivo via Zoom (link no WhatsApp e e-mail)" },
  { label: "Condução", value: "Magno Santos" },
  { label: "Opcional no Checkout", value: "Acesso à gravação completa (+ R$ 27,00)" },
];
