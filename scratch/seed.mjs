import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mqpmdethfoisgazwuxsa.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY;
if (!SUPABASE_KEY) throw new Error('Set SUPABASE_KEY environment variable (see .env.example)');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seed() {
    const rawData = fs.readFileSync('src/data/members.json', 'utf8');
    const { members, logs } = JSON.parse(rawData);

    for (const m of members) {
        // Create user
        const { data: user, error: userError } = await supabase.auth.admin.createUser({
            email: m.email,
            password: 'Password123!',
            email_confirm: true
        });

        if (userError) {
            console.error('Error creating user', m.email, userError);
            continue;
        }

        // Insert into public.members
        const { error: memberError } = await supabase.from('members').insert({
            id: user.user.id,
            name: m.name,
            email: m.email,
            role: m.role,
            company: m.company,
            industry: m.industry,
            location: m.location,
            initials: m.initials,
            img: m.img,
            status: m.status,
            added_at: m.addedAt || new Date().toISOString(),
            deactivated_at: m.deactivatedAt || null,
            linkedin_url: m.linkedin_url || null,
            instagram_url: m.instagram_url || null,
            facebook_url: m.facebook_url || null,
            x_url: m.x_url || null,
            website_url: m.website_url || null,
            username: m.username || null,
            bio: m.bio || null
        });

        if (memberError) {
            console.error('Error inserting member', m.email, memberError);
        } else {
            console.log('Inserted member', m.email);
        }
    }

    // Insert Webhook Logs
    if (logs && logs.length > 0) {
        for(const log of logs) {
            await supabase.from('webhook_logs').insert({
                type: log.type,
                email: log.email,
                payload: log.payload,
                created_at: log.timestamp
            });
        }
        console.log('Inserted logs');
    }

    // Insert Oportunidades
    const assetsData = [
      {
        slug: "nexus-commercial",
        title: "Nexus Commercial Tower",
        category: "incorporacao",
        category_label: "Incorporação Corporativa",
        description: "Co-investimento em torre corporativa Classe A com certificação LEED e modelagem 100% BIM em São Paulo.",
        long_description: "A Nexus Commercial Tower representa o estado da arte em edifícios corporativos...",
        image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
        badge: "Sustentabilidade & BIM",
        target_irr: "18.5% a.a. projetada",
        min_investment: "R$ 250.000",
        status: "Captação Ativa"
      },
      {
        slug: "cls-mastermind-dubai",
        title: "CLS Technical Tour Dubai - High-Rises",
        category: "missoes-tecnicas",
        category_label: "Missões Técnicas",
        description: "Visita técnica guiada para engenheiros e incorporadores para analisar as maiores obras e estruturas de Dubai.",
        long_description: "Imersão técnica internacional restrita a 12 membros do ecossistema...",
        image_url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=800",
        badge: "Exclusivo para Mentorados",
        target_irr: "N/A (Imaterial)",
        min_investment: "R$ 45.000 / vaga",
        status: "Vagas Limitadas"
      },
      {
        slug: "heritage-infrastructure-fund",
        title: "Heritage Infrastructure Fund I",
        category: "infraestrutura",
        category_label: "Infraestrutura & Obras Públicas",
        description: "Fundo fechado para financiamento de obras de infraestrutura urbana, saneamento e logística de grande porte.",
        long_description: "O Heritage Infrastructure Fund I capta recursos privados...",
        image_url: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=800",
        badge: "Foco em Yield & Infra",
        target_irr: "14.2% a.a. histórica",
        min_investment: "R$ 100.000",
        status: "Apenas Convidados"
      },
      {
        slug: "horizon-residence",
        title: "The Horizon Residence Portfolio",
        category: "incorporacao",
        category_label: "Incorporação Residencial de Luxo",
        description: "Portfólio de incorporação e construção de residências de altíssimo padrão em condomínios fechados costeiros.",
        long_description: "Portfólio estruturado de multipropriedade...",
        image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
        badge: "Oportunidade Âncora",
        target_irr: "22.4% a.a. estimada",
        min_investment: "R$ 500.000",
        status: "Captação Prioritária"
      },
      {
        slug: "buildtech-solutions",
        title: "BuildTech Solutions - Série A",
        category: "contech",
        category_label: "ConTech & Inovação",
        description: "Rodada de investimento Venture Capital em startup de inteligência artificial aplicada ao planejamento e controle de obras.",
        long_description: "A BuildTech Solutions é uma das contechs mais promissoras do Brasil...",
        image_url: "https://images.unsplash.com/photo-1581094288338-2314dddb7eed?auto=format&fit=crop&q=80&w=800",
        badge: "Alta Escalaridade",
        target_irr: "35% a.a. projetada (VC)",
        min_investment: "R$ 150.000",
        status: "Captação Ativa"
      }
    ];

    for(const a of assetsData) {
        const { error } = await supabase.from('investment_opportunities').insert(a);
        if(error) console.log("Oportunidade Error:", error);
    }
    console.log("Inserted Oportunidades");

    // Insert Calendar Events
    const initialEventsList = [
      {
        title: "Mentoria de Engenharia & Valuation",
        event_type: "mentoria",
        event_date: "2026-05-04",
        start_time: "14:00",
        end_time: "15:30",
        mentor_name: "Eng. Magno Santos",
        mentor_role: "Mentor Sênior",
        mentor_avatar: "/magno.jpg",
        mentor_bio: "Engenheiro Sênior e especialista em Private Equity com mais de 20 anos de experiência em incorporações imobiliárias e valuation técnico de landbanks.",
        topic: "Valuation técnico de ativos físicos de grande porte e mitigação de riscos na compra de terrenos e landbanks corporativos.",
        zoom_link: "https://zoom.us/j/magno-santos-pe"
      },
      {
        title: "Mentoria de Arquitetura & Design Premium",
        event_type: "mentoria",
        event_date: "2026-05-13",
        start_time: "16:00",
        end_time: "17:30",
        mentor_name: "Arq. Mayara Costa",
        mentor_role: "Mentor Sênior",
        mentor_avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
        mentor_bio: "Arquiteta especialista em design conceitual de luxo...",
        topic: "Posicionamento estético como alavanca de valorização e o desenvolvimento conceitual de projetos residenciais e corporativos premium.",
        zoom_link: "https://zoom.us/j/mayara-costa-design"
      },
      {
        title: "Reunião de Alinhamento: Portfólio Q3",
        event_type: "atualizacao",
        event_date: "2026-05-24",
        start_time: "11:00",
        end_time: "12:00",
        mentor_name: "Alexandre de Morais",
        mentor_role: "CEO & Fundador CLS",
        mentor_avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
        mentor_bio: "Managing Director da Holding executiva, focado na expansão de fundos de liquidez e alinhamento estratégico.",
        topic: "Atualização de desempenho das oportunidades vigentes de co-investimento e cronograma de saídas planejadas.",
        zoom_link: "https://zoom.us/j/cls-portfolio-q3"
      },
      {
        title: "Mentoria: Viabilidade de Landbanks",
        event_type: "mentoria",
        event_date: "2026-05-28",
        start_time: "14:00",
        end_time: "15:30",
        mentor_name: "Eng. Magno Santos",
        mentor_role: "Mentor Sênior",
        mentor_avatar: "/magno.jpg",
        mentor_bio: "Engenheiro Sênior e especialista em Private Equity com mais de 20 anos de experiência em incorporações imobiliárias e valuation técnico de landbanks.",
        topic: "Análise aprofundada de estudos de viabilidade técnica e legal (EVTL) para novos landbanks.",
        zoom_link: "https://zoom.us/j/magno-santos-pe"
      },
      {
        title: "Mastermind: Soluções BIM & ConTech",
        event_type: "mentoria",
        event_date: "2026-06-05",
        start_time: "10:00",
        end_time: "11:30",
        mentor_name: "Eng. Magno Santos",
        mentor_role: "Mentor Sênior",
        mentor_avatar: "/magno.jpg",
        mentor_bio: "Engenheiro Sênior e especialista em Private Equity com mais de 20 anos de experiência em incorporações imobiliárias e valuation técnico de landbanks.",
        topic: "Discussão em mesa redonda sobre a adoção prática de ferramentas BIM e ConTechs na gestão de suprimentos e obras.",
        zoom_link: "https://zoom.us/j/magno-santos-pe"
      },
      {
        title: "Networking: Visita à Grande Obra SP",
        event_type: "atualizacao",
        event_date: "2026-06-12",
        start_time: "09:00",
        end_time: "18:00",
        mentor_name: "Arq. Mayara Costa",
        mentor_role: "Mentor Sênior",
        mentor_avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
        mentor_bio: "Arquiteta especialista em design conceitual de luxo e formatação de projetos imobiliários sob medida para clientes Ultra-High-Net-Worth.",
        topic: "Visita técnica presencial a um grande empreendimento corporativo de alto padrão em São Paulo com foco em compatibilização BIM e acabamentos.",
        zoom_link: "https://zoom.us/j/mayara-costa-design"
      },
      {
        title: "Mentoria: Estruturação de SPE e SCP",
        event_type: "mentoria",
        event_date: "2026-07-10",
        start_time: "14:00",
        end_time: "15:30",
        mentor_name: "Eng. Magno Santos",
        mentor_role: "Mentor Sênior",
        mentor_avatar: "/magno.jpg",
        mentor_bio: "Engenheiro Sênior e especialista em Private Equity com mais de 20 anos de experiência em incorporações imobiliárias e valuation técnico de landbanks.",
        topic: "Estruturação societária e financeira de Sociedades de Propósito Específico (SPE) e Sociedades em Conta de Participação (SCP) para captação de recursos.",
        zoom_link: "https://zoom.us/j/magno-santos-pe"
      },
      {
        title: "Workshop: Planejamento Lean Construction",
        event_type: "mentoria",
        event_date: "2026-07-22",
        start_time: "16:00",
        end_time: "17:30",
        mentor_name: "Arq. Mayara Costa",
        mentor_role: "Mentor Sênior",
        mentor_avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
        mentor_bio: "Arquiteta especialista em design conceitual de luxo e formatação de projetos imobiliários sob medida para clientes Ultra-High-Net-Worth.",
        topic: "Implementação da metodologia Lean nos fluxos de projeto arquitetônico e interface direta com o planejamento executivo da obra.",
        zoom_link: "https://zoom.us/j/mayara-costa-design"
      }
    ];

    for(const e of initialEventsList) {
        const { error } = await supabase.from('calendar_events').insert(e);
        if(error) console.log("Evento Error:", error);
    }
    console.log("Inserted Eventos");
    
    // Todos
    await supabase.from('todos').insert({ title: 'Configurar Autenticação', is_complete: false });
    await supabase.from('todos').insert({ title: 'Sincronizar Frontend com Supabase', is_complete: false });
    console.log("Inserted Todos");
}

seed().catch(console.error);
