"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { SkeletonDashboard } from "@/components/SkeletonLoading";

// Interfaces
interface Banner {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tag: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  disabled?: boolean;
}

interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  type: "gratuito" | "pago";
  price: string;
  rating: number;
  badge?: "Lançamento" | "Mais Acessado" | "Destaque";
  image: string;
  checkoutUrl: string;
}

interface Project {
  id: string;
  title: string;
  type: string;
  scale: string;
  price: string;
  badge?: string;
  image: string;
  checkoutUrl: string;
}

interface Episode {
  id: string;
  title: string;
  duration: string;
  date: string;
  description: string;
  thumbnail: string;
  youtubeUrl: string;
}

// Mock Data
const featuredBanners: Banner[] = [
  {
    id: "club-pro",
    title: "CLUB CLS PRO",
    subtitle: "Programa de Aceleração",
    description: "CLUB CLS PRO é o Master Mind, Mentoria para empresários.",
    tag: "FECHADO",
    image: "/bg-club-cls-pro.PNG",
    ctaText: "Indisponível no momento",
    ctaLink: "#",
    disabled: true
  },
  {
    id: "codigo-construcao",
    title: "O Código da Construção",
    subtitle: "2ª Edição • Outubro 2026",
    description: "O maior evento de engenharia, negócios e incorporação imobiliária do Brasil está de volta. Garanta sua vaga no lote de pré-lançamento com condições exclusivas.",
    tag: "EVENTO PRINCIPAL",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200",
    ctaText: "Garantir Ingresso",
    ctaLink: "https://grupocls.com.br/codigo-construcao"
  },
  {
    id: "concreto-conversa-recente",
    title: "EP30 — Incorporação Imobiliária: Como Transformar Terrenos em Negócios",
    subtitle: "Concreto & Conversa",
    description: "Neste episódio do Concreto & Conversa, discutimos o passo a passo de como estruturar e transformar terrenos em negócios rentáveis na incorporação imobiliária.",
    tag: "NOVO EPISÓDIO",
    image: "https://img.youtube.com/vi/QUNkDh4OKfc/maxresdefault.jpg",
    ctaText: "Assistir Agora",
    ctaLink: "https://youtu.be/QUNkDh4OKfc"
  },
  {
    id: "curso-saia-do-improviso",
    title: "Saia do improviso.",
    subtitle: "Curso",
    description: "O Manual completo para empresas saírem do \"Apaga incêndio\" e realmente crescer de forma saudável.",
    tag: "CURSO",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200",
    ctaText: "Ver Grade Curricular",
    ctaLink: "/masterclasses"
  },
  {
    id: "studio-cls",
    title: "CLS Studio",
    subtitle: "Estúdio CLS, Grave seu Podcast",
    description: "Produza seus episódios com estrutura profissional de áudio e vídeo, câmeras 4k, microfones de ponta e suporte técnico completo.",
    tag: "CLS STUDIO",
    image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=1200",
    ctaText: "Grave seu Podcast",
    ctaLink: "#studio"
  }
];

const digitalProducts: Product[] = [
  {
    id: "planilha-viabilidade",
    title: "Planilha EVTL Automatizada",
    description: "Estudo de viabilidade técnica e legal completo para novos terrenos e empreendimentos.",
    category: "Planilhas",
    type: "pago",
    price: "R$ 197,00",
    rating: 4.9,
    badge: "Destaque",
    image: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=600",
    checkoutUrl: "https://checkout.grupocls.com.br/evtl"
  },
  {
    id: "ebook-incorporacao",
    title: "Ebook: Incorporação 360",
    description: "O guia estratégico definitivo para engenheiros e arquitetos entrarem no mercado de incorporação.",
    category: "Ebooks",
    type: "gratuito",
    price: "Gratuito",
    rating: 4.8,
    badge: "Lançamento",
    image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80&w=600",
    checkoutUrl: "https://checkout.grupocls.com.br/ebook-incorporacao"
  },
  {
    id: "checklist-canteiro",
    title: "Checklist de Canteiro Lean",
    description: "Guia prático para auditorias rápidas e implementação do Lean Construction na sua obra.",
    category: "Checklists",
    type: "gratuito",
    price: "Gratuito",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=600",
    checkoutUrl: "https://checkout.grupocls.com.br/canteiro-lean"
  },
  {
    id: "manual-bdi",
    title: "Manual de BDI e Custos Indiretos",
    description: "Aprenda a calcular a taxa de BDI correta para licitações e obras privadas.",
    category: "Guias",
    type: "pago",
    price: "R$ 49,90",
    rating: 4.9,
    badge: "Mais Acessado",
    image: "https://images.unsplash.com/photo-1503387762-592dedb8c310?auto=format&fit=crop&q=80&w=600",
    checkoutUrl: "https://checkout.grupocls.com.br/manual-bdi"
  },
  {
    id: "planilha-obras-casa",
    title: "Planilha de Custos Residenciais",
    description: "Orçamento padrão e fluxo de caixa de obra para construções de casas de alto padrão.",
    category: "Planilhas",
    type: "pago",
    price: "R$ 149,00",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600",
    checkoutUrl: "https://checkout.grupocls.com.br/planilha-alto-padrao"
  },
  {
    id: "guia-investidores",
    title: "Guia de Captação de Investidores",
    description: "Como estruturar uma apresentação comercial e atrair cotistas para obras multifamiliares.",
    category: "Guias",
    type: "pago",
    price: "R$ 89,00",
    rating: 4.6,
    badge: "Lançamento",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600",
    checkoutUrl: "https://checkout.grupocls.com.br/guia-investidores"
  }
];

const projectsReady: Project[] = [
  {
    id: "residencia-horizon",
    title: "Residência Horizon",
    type: "Arquitetônico Completo",
    scale: "320m² • 4 Suítes",
    price: "R$ 2.490,00",
    badge: "Mais Procurado",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600",
    checkoutUrl: "https://checkout.grupocls.com.br/residencia-horizon"
  },
  {
    id: "villa-toscana",
    title: "Casa de Campo Toscana",
    type: "Arquitetônico & Interiores",
    scale: "210m² • 3 Suítes",
    price: "R$ 1.890,00",
    badge: "Lançamento",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600",
    checkoutUrl: "https://checkout.grupocls.com.br/villa-toscana"
  },
  {
    id: "loft-industrial",
    title: "Loft Studio Industrial",
    type: "Projeto Arquitetônico",
    scale: "85m² • Duplex",
    price: "R$ 980,00",
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=600",
    checkoutUrl: "https://checkout.grupocls.com.br/loft-industrial"
  },
  {
    id: "template-contratos",
    title: "Kit Jurídico da Construção",
    type: "Modelos & Contratos",
    scale: "15 Arquivos Editáveis",
    price: "R$ 297,00",
    badge: "Essencial",
    image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=600",
    checkoutUrl: "https://checkout.grupocls.com.br/kit-juridico"
  }
];

const podcastEpisodes: Episode[] = [
  {
    id: "ep-48",
    title: "Concreto & Conversa #48 - Incorporação Pura, SPE e Estruturação de Equity na Construção",
    duration: "1h 14min",
    date: "Há 3 dias",
    description: "Neste episódio destrinchamos as regras cruciais de estruturação societária (SPE) para captação de recursos com investidores anjo e family offices de médio porte.",
    thumbnail: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=400",
    youtubeUrl: "https://youtube.com/watch?v=mock-48"
  },
  {
    id: "ep-47",
    title: "Concreto & Conversa #47 - Contechs, IA no Canteiro e a Engenharia do Amanhã",
    duration: "58min",
    date: "Há 1 semana",
    description: "Como startups estão aplicando Inteligência Artificial para leitura de projetos e geração de cronogramas em tempo real, diminuindo desvios em mais de 25%.",
    thumbnail: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=400",
    youtubeUrl: "https://youtube.com/watch?v=mock-47"
  },
  {
    id: "ep-46",
    title: "Concreto & Conversa #46 - Gerenciando Obras de Alto Padrão sem Estresse",
    duration: "1h 05min",
    date: "Há 2 semanas",
    description: "Métodos práticos de atendimento, relatórios integrados para clientes exigentes e negociação de contratos por administração.",
    thumbnail: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=400",
    youtubeUrl: "https://youtube.com/watch?v=mock-46"
  }
];

export default function EcossistemaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [productFilter, setProductFilter] = useState("Todos");
  const [studioName, setStudioName] = useState("");
  const [studioEmail, setStudioEmail] = useState("");
  const [studioMessage, setStudioMessage] = useState("");
  const [adName, setAdName] = useState("");
  const [adEmail, setAdEmail] = useState("");
  const [adCompany, setAdCompany] = useState("");
  const [bookingStatus, setBookingStatus] = useState<string | null>(null);
  const [adStatus, setAdStatus] = useState<string | null>(null);

  // Load state and authenticate user
  useEffect(() => {
    async function initPage() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: member } = await supabase
            .from('members')
            .select('status')
            .eq('id', user.id)
            .single();

          if (member && member.status === "Ativo") {
            setIsMember(true);
          }
        }
      } catch (err) {
        console.error("Auth verify failed", err);
      } finally {
        setLoading(false);
      }
    }
    void initPage();
  }, []);

  // Auto Slider transition every 6s
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleCtaClick = (link: string) => {
    if (link.startsWith("http")) {
      window.open(link, "_blank");
    } else {
      // Internal navigation or scroll
      const element = document.querySelector(link);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      } else {
        router.push(link);
      }
    }
  };

  const handleStudioBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studioName || !studioEmail) return;
    setBookingStatus("Enviando...");
    setTimeout(() => {
      setBookingStatus("Sua solicitação de agendamento do estúdio foi enviada! Entraremos em contato em breve.");
      setStudioName("");
      setStudioEmail("");
      setStudioMessage("");
    }, 1200);
  };

  const handleAdInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adName || !adEmail || !adCompany) return;
    setAdStatus("Enviando...");
    setTimeout(() => {
      setAdStatus("Sua proposta comercial foi registrada! Nossa equipe comercial enviará o Media Kit em instantes.");
      setAdName("");
      setAdEmail("");
      setAdCompany("");
    }, 1200);
  };

  const filteredProducts = digitalProducts.filter((p) => {
    if (productFilter === "Todos") return true;
    if (productFilter === "Gratuitos") return p.type === "gratuito";
    if (productFilter === "Premium") return p.type === "pago";
    return p.category === productFilter;
  });

  if (loading) {
    return <SkeletonDashboard />;
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-primary-container)", color: "var(--color-on-surface)", overflowX: "hidden" }}>
      {/* CSS overrides for Microsoft/Windows Store layout styling */}
      <style dangerouslySetInnerHTML={{ __html: `
        .windows-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 104px 40px 60px 40px;
        }
        @media (max-width: 768px) {
          .windows-container {
            padding: 104px 20px 40px 20px;
          }
        }
        /* Top Navigation Header bar */
        .win-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 80px;
          background-color: var(--topbar-bg);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--topbar-border);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
        }
        @media (max-width: 768px) {
          .win-nav {
            padding: 0 20px;
          }
        }
        /* Grid featured slider (Windows Store Style) */
        .store-hero-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
          margin-bottom: 48px;
        }
        @media (max-width: 1024px) {
          .store-hero-grid {
            grid-template-columns: 1fr;
          }
        }
        .main-slider-card {
          position: relative;
          aspect-ratio: 16/9;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--border-color);
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }
        @media (max-width: 600px) {
          .main-slider-card {
            aspect-ratio: 4/3;
          }
        }
        .slider-bg-img {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
        }
        .slider-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, rgba(19, 19, 22, 0.95) 0%, rgba(19, 19, 22, 0.6) 60%, transparent 100%);
          z-index: 2;
          pointer-events: none;
        }
        @media (max-width: 768px) {
          .slider-overlay {
            background: linear-gradient(to top, rgba(19, 19, 22, 0.98) 0%, rgba(19, 19, 22, 0.6) 60%, transparent 100%);
          }
        }
        .slider-content {
          position: relative;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 40px;
          max-width: 550px;
          z-index: 5;
        }
        @media (max-width: 768px) {
          .slider-content {
            padding: 20px;
            max-width: 100%;
          }
        }
        /* Right sidebar selector items */
        .store-hero-sidebar {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        @media (max-width: 1024px) {
          .store-hero-sidebar {
            flex-direction: row;
            overflow-x: auto;
            padding-bottom: 6px;
          }
        }
        .sidebar-select-item {
          background-color: var(--dropdown-bg);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }
        @media (max-width: 1024px) {
          .sidebar-select-item {
            flex: 0 0 240px;
          }
        }
        .sidebar-select-item:hover {
          background-color: var(--dropdown-item-hover);
          border-color: rgba(145, 179, 225, 0.3);
        }
        .sidebar-select-item.active {
          border-color: var(--color-secondary);
          background-color: var(--dropdown-item-hover);
          box-shadow: 0 0 15px rgba(145, 179, 225, 0.05);
        }
        .sidebar-item-thumb {
          width: 50px;
          height: 50px;
          border-radius: 4px;
          background-size: cover;
          background-position: center;
          flex-shrink: 0;
          border: 1px solid var(--border-color);
        }
        
        /* Categories cards */
        .category-tiles-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          margin-bottom: 56px;
        }
        @media (max-width: 1024px) {
          .category-tiles-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 600px) {
          .category-tiles-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .category-tile {
          background-color: var(--dropdown-bg);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          text-align: center;
        }
        .category-tile:hover {
          transform: translateY(-4px);
          border-color: var(--color-secondary);
          background-color: var(--dropdown-item-hover);
        }
        
        /* Modular Store Cards */
        .store-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 48px;
        }
        .store-card {
          background-color: var(--dropdown-bg);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .store-card:hover {
          transform: translateY(-4px);
          border-color: rgba(145, 179, 225, 0.3);
          box-shadow: 0 10px 20px rgba(0,0,0,0.06);
        }
        .store-card-img-wrapper {
          aspect-ratio: 16/10;
          overflow: hidden;
          position: relative;
          background-color: var(--color-surface);
          border-bottom: 1px solid var(--border-color);
        }
        .store-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .store-card:hover .store-card-img {
          transform: scale(1.03);
        }
        .card-tag-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 4px 8px;
          border-radius: 2px;
          color: #ffffff;
          z-index: 5;
        }
        
        /* Metrics layout for sponsor and studio */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin: 24px 0;
        }
        @media (max-width: 768px) {
          .metrics-grid {
            grid-template-columns: 1fr;
          }
        }
        .metric-card {
          background-color: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 24px;
          text-align: center;
        }

        /* Sponsors/Studio Split Columns */
        .action-split-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          margin-bottom: 64px;
        }
        @media (max-width: 1024px) {
          .action-split-section {
            grid-template-columns: 1fr;
          }
        }
        
        /* Partners banner */
        .partners-row {
          display: flex;
          justify-content: space-around;
          align-items: center;
          flex-wrap: wrap;
          gap: 32px;
          padding: 40px 24px;
          background-color: rgba(255, 255, 255, 0.01);
          border-radius: 8px;
          border: 1px solid var(--border-color);
          margin-bottom: 64px;
        }
        .partner-logo {
          font-family: 'Outfit', sans-serif;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: var(--color-on-surface-variant);
          opacity: 0.5;
          transition: opacity 0.2s;
        }
        .partner-logo:hover {
          opacity: 1;
        }

        /* Forms inputs in Windows Store style */
        .win-form-input {
          width: 100%;
          background-color: var(--search-input-bg);
          border: 1px solid var(--search-input-border);
          border-radius: 4px;
          color: var(--color-on-surface);
          padding: 10px 14px;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s;
        }
        .win-form-input:focus {
          border-color: var(--color-secondary);
        }
      `}} />

      {/* Standalone navigation header */}
      <header className="win-nav">
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="font-headline-sm" style={{ color: "var(--color-on-surface)", fontSize: "16px", fontWeight: 700, letterSpacing: "0.05em" }}>
            GRUPO CLS
          </span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {isMember && (
            <Link href="/dashboard" className="btn-primary" style={{ padding: "8px 16px", fontSize: "10px", textDecoration: "none" }}>
              ACESSAR PORTAL
            </Link>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="windows-container">
        
        {/* Dynamic Big Featured Slider (Windows Store Style) */}
        <section className="store-hero-grid">
          
          {/* Left Large Slide Banner */}
          <div className="main-slider-card">
            {featuredBanners.map((banner, i) => (
              <div
                key={banner.id}
                className="slider-bg-img"
                style={{ 
                  backgroundImage: `url('${banner.image}')`,
                  opacity: currentSlide === i ? 1 : 0,
                  transition: 'opacity 0.8s ease-in-out',
                  zIndex: currentSlide === i ? 1 : 0
                }}
              />
            ))}
            <div className="slider-overlay" />
            <div className="slider-content">
              {featuredBanners[currentSlide].tag && (
                <span style={{
                  alignSelf: "flex-start",
                  backgroundColor: "var(--color-secondary)",
                  color: "#000000",
                  fontSize: "9px",
                  fontWeight: 800,
                  padding: "4px 10px",
                  borderRadius: "20px",
                  marginBottom: "16px",
                  letterSpacing: "0.05em"
                }} className="font-label-caps">
                  {featuredBanners[currentSlide].tag}
                </span>
              )}
              {featuredBanners[currentSlide].subtitle && (
                <span style={{ fontSize: "12px", color: "var(--color-secondary)", fontWeight: 700 }} className="font-label-caps">
                  {featuredBanners[currentSlide].subtitle}
                </span>
              )}
              {featuredBanners[currentSlide].title && (
                <h2 className="font-display" style={{ fontSize: "32px", color: "#ffffff", fontWeight: 800, margin: "6px 0 12px 0", lineHeight: "1.1" }}>
                  {featuredBanners[currentSlide].title}
                </h2>
              )}
              {featuredBanners[currentSlide].description && (
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", lineHeight: "1.5", marginBottom: "24px" }}>
                  {featuredBanners[currentSlide].description}
                </p>
              )}
              <div>
                <button
                  onClick={() => !featuredBanners[currentSlide].disabled && handleCtaClick(featuredBanners[currentSlide].ctaLink)}
                  className={featuredBanners[currentSlide].disabled ? "btn-outline" : "btn-primary"}
                  style={{ 
                    padding: "12px 24px", 
                    fontSize: "11px",
                    opacity: featuredBanners[currentSlide].disabled ? 0.6 : 1,
                    cursor: featuredBanners[currentSlide].disabled ? "not-allowed" : "pointer",
                    backgroundColor: featuredBanners[currentSlide].disabled ? "var(--color-surface-container)" : undefined,
                    color: featuredBanners[currentSlide].disabled ? "var(--color-on-surface-variant)" : undefined,
                    borderColor: featuredBanners[currentSlide].disabled ? "var(--border-color)" : undefined
                  }}
                  disabled={featuredBanners[currentSlide].disabled}
                >
                  {featuredBanners[currentSlide].ctaText}
                  {!featuredBanners[currentSlide].disabled && (
                    <span className="material-symbols-outlined" style={{ fontSize: "16px", marginLeft: "8px" }}>arrow_forward</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Selector List Column */}
          <div className="store-hero-sidebar">
            {featuredBanners.map((banner, i) => (
              <div
                key={banner.id}
                onClick={() => setCurrentSlide(i)}
                className={`sidebar-select-item ${currentSlide === i ? 'active' : ''}`}
              >
                <div
                  className="sidebar-item-thumb"
                  style={{ backgroundImage: `url('${banner.image}')` }}
                />
                <div>
                  <span style={{ fontSize: "9px", color: "var(--color-secondary)", fontWeight: 700 }} className="font-label-caps">
                    {banner.tag}
                  </span>
                  <h4 style={{ fontSize: "13px", color: "var(--color-on-surface)", fontWeight: 600, margin: "2px 0 0 0" }}>
                    {banner.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>

        </section>

        {/* Content Discovery Grid Category Tiles removed as requested */}

        {/* Digital Products Marketplace Section */}
        {false && (
        <section id="produtos" style={{ marginBottom: "64px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px", marginBottom: "24px", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px" }}>
            <div>
              <h3 className="font-headline-sm" style={{ color: "var(--color-on-surface)" }}>Produtos Digitais</h3>
              <p style={{ fontSize: "13px", color: "var(--color-on-surface-variant)", marginTop: "4px" }}>Ebooks, planilhas estruturadas, guias práticos e materiais de apoio.</p>
            </div>
            
            {/* Horizontal Filter Tabs */}
            <div style={{ display: "flex", gap: "8px", overflowX: "auto" }}>
              {["Todos", "Planilhas", "Ebooks", "Checklists", "Guias", "Gratuitos", "Premium"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setProductFilter(tab)}
                  style={{
                    backgroundColor: productFilter === tab ? "rgba(145, 179, 225, 0.15)" : "transparent",
                    color: productFilter === tab ? "var(--color-secondary)" : "var(--color-on-surface-variant)",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  className="font-label-caps"
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog grid */}
          <div className="store-grid">
            {filteredProducts.map((p) => (
              <div key={p.id} className="store-card">
                <div className="store-card-img-wrapper">
                  <img src={p.image} className="store-card-img" alt={p.title} />
                  {p.badge && (
                    <span
                      className="card-tag-badge"
                      style={{
                        backgroundColor: p.badge === "Lançamento" ? "var(--color-secondary)" : p.badge === "Destaque" ? "var(--color-primary)" : "#6b7280"
                      }}
                    >
                      {p.badge}
                    </span>
                  )}
                </div>
                
                <div style={{ padding: "16px", display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "space-between" }}>
                  <div>
                    <span style={{ fontSize: "9px", color: "var(--color-secondary)", fontWeight: 700 }} className="font-label-caps">
                      {p.category}
                    </span>
                    <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-on-surface)", margin: "4px 0 6px 0", lineHeight: "1.4" }}>{p.title}</h4>
                    <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant)", lineHeight: "1.4", margin: 0 }}>{p.description}</p>
                  </div>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-color)", paddingTop: "12px", marginTop: "16px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "2px", marginBottom: "4px" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "12px", color: "var(--color-secondary)", fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--color-on-surface)" }}>{p.rating}</span>
                      </div>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-on-surface)" }}>{p.price}</span>
                    </div>
                    
                    <button
                      onClick={() => handleCtaClick(p.checkoutUrl)}
                      className="btn-primary"
                      style={{ padding: "8px 14px", fontSize: "10px" }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                        {p.type === "gratuito" ? "download" : "shopping_cart"}
                      </span>
                      {p.type === "gratuito" ? "BAIXAR" : "COMPRAR"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        )}

        {/* Ready to Use Construction Projects Section */}
        {false && (
        <section id="projetos" style={{ marginBottom: "64px" }}>
          <div style={{ marginBottom: "24px", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px" }}>
            <h3 className="font-headline-sm" style={{ color: "var(--color-on-surface)" }}>Projetos e Templates Prontos</h3>
            <p style={{ fontSize: "13px", color: "var(--color-on-surface-variant)", marginTop: "4px" }}>Projetos arquitetônicos detalhados, memoriais descritivos e pacotes profissionais de documentos.</p>
          </div>

          <div className="store-grid">
            {projectsReady.map((proj) => (
              <div key={proj.id} className="store-card">
                <div className="store-card-img-wrapper">
                  <img src={proj.image} className="store-card-img" alt={proj.title} />
                  {proj.badge && (
                    <span className="card-tag-badge" style={{ backgroundColor: "var(--color-secondary)" }}>
                      {proj.badge}
                    </span>
                  )}
                </div>
                
                <div style={{ padding: "16px", display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "space-between" }}>
                  <div>
                    <span style={{ fontSize: "9px", color: "var(--color-outline)", fontWeight: 700 }} className="font-label-caps">
                      {proj.type}
                    </span>
                    <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-on-surface)", margin: "4px 0 2px 0" }}>{proj.title}</h4>
                    <span style={{ fontSize: "11px", color: "var(--color-on-surface-variant)" }}>{proj.scale}</span>
                  </div>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-color)", paddingTop: "12px", marginTop: "16px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-on-surface)" }}>{proj.price}</span>
                    <button
                      onClick={() => handleCtaClick(proj.checkoutUrl)}
                      className="btn-primary"
                      style={{ padding: "8px 14px", fontSize: "10px" }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>shopping_cart</span>
                      ADQUIRIR
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        )}
        {/* Smart Site Map Footer */}
        <footer style={{ borderTop: "1px solid var(--border-color)", paddingTop: "48px", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.2fr", gap: "40px" }} className="hide-sidebar-at-900">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <span className="font-title-lg" style={{ color: "var(--color-on-surface)", fontSize: "14px", fontWeight: 700, letterSpacing: "0.05em" }}>GRUPO CLS</span>
            </div>
            <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant)", lineHeight: "1.6", maxWidth: "260px" }}>O hub centralizador de conhecimento técnico, ferramentas digitais avançadas e networking de alto nível na construção civil.</p>
            <span style={{ display: "block", fontSize: "11px", color: "var(--color-outline)", marginTop: "24px" }}>&copy; {new Date().getFullYear()} Grupo CLS. Todos os direitos reservados.</span>
          </div>

          <div>
            <h5 className="font-label-caps" style={{ color: "var(--color-on-surface)", fontSize: "10px", marginBottom: "16px" }}>Produtos</h5>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", padding: 0 }}>
              <li><Link href="#produtos" style={{ textDecoration: "none", color: "var(--color-on-surface-variant)", fontSize: "12px" }} className="hover-gold-text">Planilhas Prontas</Link></li>
              <li><Link href="#produtos" style={{ textDecoration: "none", color: "var(--color-on-surface-variant)", fontSize: "12px" }} className="hover-gold-text">Ebooks & Manuais</Link></li>
              <li><Link href="#projetos" style={{ textDecoration: "none", color: "var(--color-on-surface-variant)", fontSize: "12px" }} className="hover-gold-text">Projetos Arquitetônicos</Link></li>
              <li><Link href="#projetos" style={{ textDecoration: "none", color: "var(--color-on-surface-variant)", fontSize: "12px" }} className="hover-gold-text">Modelos Contratuais</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-label-caps" style={{ color: "var(--color-on-surface)", fontSize: "10px", marginBottom: "16px" }}>Mídia e Eventos</h5>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", padding: 0 }}>
              <li><Link href="#podcast" style={{ textDecoration: "none", color: "var(--color-on-surface-variant)", fontSize: "12px" }} className="hover-gold-text">Episódios Podcast</Link></li>
              <li><Link href="#eventos" style={{ textDecoration: "none", color: "var(--color-on-surface-variant)", fontSize: "12px" }} className="hover-gold-text">O Código da Construção</Link></li>
              <li><Link href="/masterclasses" style={{ textDecoration: "none", color: "var(--color-on-surface-variant)", fontSize: "12px" }} className="hover-gold-text">Masterclasses Gravadas</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-label-caps" style={{ color: "var(--color-on-surface)", fontSize: "10px", marginBottom: "16px" }}>Soluções Corporativas</h5>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", padding: 0 }}>
              <li><Link href="#podcast" style={{ textDecoration: "none", color: "var(--color-on-surface-variant)", fontSize: "12px" }} className="hover-gold-text">Patrocinar Podcast</Link></li>
              <li><Link href="#podcast" style={{ textDecoration: "none", color: "var(--color-on-surface-variant)", fontSize: "12px" }} className="hover-gold-text">Gravação de Podcast (Estúdio)</Link></li>
              <li><Link href="#podcast" style={{ textDecoration: "none", color: "var(--color-on-surface-variant)", fontSize: "12px" }} className="hover-gold-text">Produção de Cursos</Link></li>
            </ul>
          </div>
        </footer>

      </main>

      <div style={{ height: "40px" }} />
    </div>
  );
}
