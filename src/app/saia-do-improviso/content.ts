/**
 * Conteúdo textual da página, separado por dobra para facilitar edição.
 * Não altere a ordem das dobras — ela segue a narrativa de conversão.
 */

export interface ProblemCard {
  icon: string;
  title: string;
  text: string;
}

export const problemCards: ProblemCard[] = [
  { icon: "event_busy", title: "Falta de planejamento", text: "Começa atividades sem saber exatamente como organizar cada etapa." },
  { icon: "folder_off", title: "Desorganização", text: "Perde tempo procurando documentos e informações." },
  { icon: "restart_alt", title: "Retrabalho", text: "Precisa refazer atividades por falta de processos." },
  { icon: "schedule", title: "Atrasos", text: "Tem dificuldade para acompanhar prazos e responsabilidades." },
  { icon: "rule_folder", title: "Falta de controle", text: "Depende da memória para administrar tarefas." },
  { icon: "trending_down", title: "Baixa produtividade", text: "Trabalha muito, mas sente que poderia entregar mais." },
];

export interface LessonCard {
  number: string;
  title: string;
  text: string;
}

export const lessonCards: LessonCard[] = [
  {
    number: "01",
    title: "Mentalidade profissional",
    text: "Entenda o que diferencia um profissional que trabalha no improviso de alguém que atua com organização e método.",
  },
  {
    number: "02",
    title: "Planejamento e organização",
    text: "Aprenda a estruturar atividades, organizar informações e acompanhar tarefas.",
  },
  {
    number: "03",
    title: "Processos de trabalho",
    text: "Descubra como padronizar atividades, reduzir erros e evitar retrabalho.",
  },
  {
    number: "04",
    title: "Inteligência artificial na construção civil",
    text: "Veja como utilizar ferramentas de IA para organizar documentos, elaborar relatórios e estruturar cronogramas.",
  },
  {
    number: "05",
    title: "Desenvolvimento profissional",
    text: "Entenda como melhorar sua atuação e desenvolver habilidades valorizadas pelo mercado.",
  },
];

export interface AiItem {
  icon: string;
  label: string;
}

export const aiItems: AiItem[] = [
  { icon: "task_alt", label: "Organização de tarefas" },
  { icon: "timeline", label: "Criação de cronogramas" },
  { icon: "description", label: "Elaboração de relatórios" },
  { icon: "checklist", label: "Criação de checklists" },
  { icon: "folder_open", label: "Organização de documentos" },
  { icon: "account_tree", label: "Estruturação de processos" },
];

export interface AudienceItem {
  icon: string;
  label: string;
}

export const audienceItems: AudienceItem[] = [
  { icon: "engineering", label: "Engenheiros" },
  { icon: "architecture", label: "Arquitetos" },
  { icon: "construction", label: "Mestres de obras" },
  { icon: "supervisor_account", label: "Encarregados" },
  { icon: "straighten", label: "Técnicos em edificações" },
  { icon: "handyman", label: "Empreiteiros" },
  { icon: "apartment", label: "Construtores" },
  { icon: "person", label: "Profissionais autônomos" },
  { icon: "school", label: "Estudantes de engenharia e arquitetura" },
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  { question: "Preciso ser engenheiro para participar?", answer: "Não. A aula é aberta a profissionais de diferentes áreas da construção civil." },
  { question: "A aula será presencial?", answer: "Não. Será online e ao vivo, pela plataforma Zoom." },
  { question: "Quando será a aula?", answer: "Dia 20 de novembro de 2026, às 19h, horário de Brasília." },
  { question: "Preciso ter conhecimento em inteligência artificial?", answer: "Não. As demonstrações serão apresentadas de maneira prática." },
  { question: "A gravação está incluída?", answer: "Não. A participação ao vivo custa R$ 47,00. A gravação pode ser adicionada separadamente por R$ 27,00 no checkout." },
  { question: "Como receberei o acesso?", answer: "Após a confirmação do pagamento, você receberá as orientações para participar da aula." },
  { question: "A aula terá certificado?", answer: "A emissão de certificado ainda não está confirmada. Qualquer novidade será comunicada aos inscritos." },
];

export interface OfferRow {
  label: string;
  value: string;
}

export const offerRows: OfferRow[] = [
  { label: "Evento", value: "Saia do Improviso" },
  { label: "Especialista", value: "Engenheiro Magno Santos" },
  { label: "Data", value: "20 de novembro de 2026" },
  { label: "Horário", value: "19h" },
  { label: "Formato", value: "Online e ao vivo" },
  { label: "Plataforma", value: "Zoom" },
  { label: "Investimento", value: "R$ 47,00" },
];
