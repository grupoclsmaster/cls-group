import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mqpmdethfoisgazwuxsa.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY;
if (!SUPABASE_KEY) throw new Error('Set SUPABASE_KEY environment variable (see .env.example)');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seed() {
    const projectsData = [
      {
        title: "Residência Horizon",
        category: "luxury",
        description: "Mansões contemporâneas com foco em sustentabilidade, design biofílico e automação residencial. Projetada para terrenos em condomínios de altíssimo padrão, unindo sofisticação e engenharia moderna.",
        image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCWrOztEooOM02xGQF3AS83ZsrznjhwH5wa5-P17Vt2sgVxTa3okKRDMA1KxqDc47IP-vmKgtQv_mea6DhaHuoCJP6dWh0Rn5o8xQXRsxR5JAezlPJ7XRPKlIn6HG7P8r2sp1hpSEDmyHVY3UUGWlDo2B_e6SDXmCfGGjWRhbzH8GjxUZku5viBOLJo6RCouHo2yIv5dL2o0WV41dn_iEZhoVeXaA-7SxMARfWAOHjeVGBzOa79wCd9nqzlt1mCNgxtD5wWqY5-t3ww",
        status: "Ativo"
      },
      {
        title: "Studio Urban Loft",
        category: "micro-living",
        description: "Studios inteligentes projetados para máxima rentabilidade em aluguéis de curta e média duração (AirBnb/Short stay). Conta com design escandinavo, otimização de espaço e alta liquidez.",
        image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLJxKknaCrDpriZatUdkGNuW5yye5PVoVE9l5M2SQWwjEfsmVZexFD6cjwKk6ySmCk9rMKYj7oMu-q70aT4hOz11zjlOeLYJhIjmGkT7p0p_eyl9H0H_cLC_1mgtmGyZeUB2oBU8dA_GiHUWF_8YJkmbPT7v6mzYxL4vy0PqDwh9I0AtpUhV5IlDhjJPxQ3wxhVAYnb95X51m1NqfaobFTCNg7ezb22p0PFqy61Cvd_f9FLGZBCn_6GwvIBq-XRdfz0SebaElqAQ33",
        status: "Ativo"
      },
      {
        title: "Refúgio Chalé Alpine",
        category: "chalet",
        description: "Retiros de luxo em destinos de montanha e serra. Arquitetura vernacular (A-Frame) fundida com minimalismo moderno, utilizando materiais nobres como pedra natural, madeira tratada e vidro duplo.",
        image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuC7yi9zFoc9cSNQA_aoxdDqvsQGd5UVMzNbuAtFxSKENkEcMI-DVeYB83fZjojvtTXjbBm6iglmb71ELDnjBl9bxuZc1OSuK14uvTniPmthJJqt7O05EsM_Xy_bSi2cdbel23errQ5YnJIJWAe_FkPql4FAPf3ySFGtV_KexsIMpk762CpbKyQfIz9htqIpXTxmOMGj3br0d5FSq0eIkn1jNaR-ibmV61LoR0MqP0ZrhaJMv2tGjntupg7CV0GJpqHo8mwGW21GUf7t",
        status: "Ativo"
      }
    ];

    for(const p of projectsData) {
        const { error } = await supabase.from('projects').insert(p);
        if(error) console.log("Project Error:", error);
    }
    console.log("Inserted Projetos");

    const resourcesData = [
      {
        title: "Dossiê Cenário da Construção Civil & Infraestrutura",
        description: "Visão geral abrangente do desempenho do setor de real estate, incorporação imobiliária e projeções macroeconômicas de infraestrutura.",
        category: "pdf",
        format: "pdf",
        size: "5.2 MB",
        file_url: "#"
      },
      {
        title: "Planilha de Viabilidade Econômica de Obras (EVTL)",
        description: "Modelo completo para estudos de viabilidade técnica, legal e financeira (EVTL) de novos empreendimentos residenciais e comerciais.",
        category: "spreadsheet",
        format: "spreadsheet",
        size: "14.8 MB",
        file_url: "#"
      },
      {
        title: "Master Deck para Apresentação de Projetos Civis",
        description: "Template de apresentação executiva estruturado para captação de recursos com investidores de incorporação e roadshows de projetos civis.",
        category: "template",
        format: "template",
        size: "28.3 MB",
        file_url: "#"
      },
      {
        title: "Planilha de BDI & Custos Indiretos",
        description: "Ferramenta avançada para cálculo de BDI (Benefícios e Despesas Indiretas) adaptada para orçamentos de obras corporativas e residenciais premium.",
        category: "spreadsheet",
        format: "spreadsheet",
        size: "4.1 MB",
        file_url: "#"
      },
      {
        title: "Manual de Gestão Contratual & Claims em Obras",
        description: "Manual prático com boas práticas jurídicas e de engenharia para gestão de pleitos (claims), aditivos contratuais e prevenção de litígios em obras.",
        category: "pdf",
        format: "pdf",
        size: "3.5 MB",
        file_url: "#"
      },
      {
        title: "Acesso Privado: Biblioteca BIM & ConTech Hub",
        description: "Acesso ao repositório compartilhado de templates de modelagem BIM (Revit/Archicad) e contatos com startups ConTech parceiras.",
        category: "link",
        format: "link",
        size: "",
        file_url: "https://bim.clspro.example.com"
      }
    ];

    for(const r of resourcesData) {
        const { error } = await supabase.from('resources').insert(r);
        if(error) console.log("Resource Error:", error);
    }
    console.log("Inserted Recursos");
}

seed().catch(console.error);
