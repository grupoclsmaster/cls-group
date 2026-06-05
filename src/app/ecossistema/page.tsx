"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { SkeletonDashboard } from "@/components/SkeletonLoading";

interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  price: string;
  image: string;
  checkoutUrl: string;
}

const otherProducts: Product[] = [
  {
    id: "saia-improviso",
    title: "Saia do Improviso",
    description: "Controle físico-financeiro prático para canteiros de obras. Aprenda a estruturar cronogramas precisos e eliminar desvios de orçamento de vez.",
    category: "Curso Completo",
    price: "12x de R$ 49,70 ou R$ 497 à vista",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=600",
    checkoutUrl: "https://checkout.grupocls.com.br/saia-do-improviso"
  },
  {
    id: "calc-estrutural",
    title: "Cálculo Estrutural Prático",
    description: "Dimensionamento e leitura de projetos de vigas, pilares e lajes de concreto armado. Segurança executiva sem mistérios.",
    category: "Treinamento Técnico",
    price: "12x de R$ 29,70 ou R$ 297 à vista",
    image: "https://images.unsplash.com/photo-1503387762-592dedb8c310?auto=format&fit=crop&q=80&w=600",
    checkoutUrl: "https://checkout.grupocls.com.br/calculo-estrutural"
  },
  {
    id: "orcamento-360",
    title: "Orçamento & Planejamento 360",
    description: "Domine a engenharia de custos, cotações integradas e precificação estratégica para fechar contratos altamente lucrativos.",
    category: "Treinamento Técnico",
    price: "12x de R$ 39,70 ou R$ 397 à vista",
    image: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=600",
    checkoutUrl: "https://checkout.grupocls.com.br/orcamento-360"
  },
  {
    id: "ebook-moderno",
    title: "Ebook Engenheiro Moderno",
    description: "Guia completo sobre ConTechs, inteligência artificial aplicada à construção civil e posicionamento de mercado profissional premium.",
    category: "Material Gratuito",
    price: "Gratuito",
    image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80&w=600",
    checkoutUrl: "https://checkout.grupocls.com.br/ebook-moderno"
  }
];

export default function StandaloneEcossistemaPage() {
  const router = useRouter();

  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Todos");

  useEffect(() => {
    async function checkMembership() {
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
        console.error("Auth check failed", err);
      } finally {
        setLoading(false);
      }
    }
    checkMembership();
  }, []);

  const handleCtaClick = (productId: string, checkoutUrl: string) => {
    if (productId === "club-pro") {
      if (isMember) {
        router.push("/dashboard");
      } else {
        window.open("https://wa.me/5599999999999?text=Quero%20me%20candidatar%20ao%20Club%20Pro%20CLS", "_blank");
      }
    } else {
      window.open(checkoutUrl, "_blank");
    }
  };

  const categories = ["Todos", "Curso Completo", "Treinamento Técnico", "Material Gratuito"];

  const filteredProducts = activeCategory === "Todos"
    ? otherProducts
    : otherProducts.filter(p => p.category === activeCategory);

  if (loading) {
    return <SkeletonDashboard />;
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0b0b0d", color: "#e5e1e6", position: "relative", overflowX: "hidden" }}>
      
      {/* Background Glow */}
      <div className="eco-bg-glow" />

      <div className="eco-container">

        <style dangerouslySetInnerHTML={{ __html: `
          .eco-bg-glow {
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 100%;
            max-width: 1400px;
            height: 650px;
            background: radial-gradient(circle at 50% 0%, rgba(237, 192, 102, 0.09) 0%, rgba(7, 7, 50, 0.03) 60%, transparent 100%);
            z-index: 0;
            pointer-events: none;
          }

          .eco-container {
            position: relative;
            z-index: 1;
            max-width: 720px; /* Reduced width for link tree aesthetics */
            margin: 0 auto;
            padding: 20px 20px 80px 20px;
          }

          .eco-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            padding: 16px 0;
          }

          .eco-logo-group {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .eco-logo-dot {
            width: 8px;
            height: 8px;
            background-color: #edc066;
            border-radius: 50%;
            box-shadow: 0 0 10px #edc066;
          }

          .eco-brand-title {
            font-family: 'Inter', sans-serif;
            font-size: 15px;
            font-weight: 700;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            background: linear-gradient(135deg, #ffffff 0%, #edc066 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin: 0;
          }

          .eco-hero-section {
            text-align: center;
            margin-bottom: 32px;
          }

          .eco-hero-title {
            font-family: 'Outfit', sans-serif;
            font-size: 38px;
            font-weight: 800;
            line-height: 1.2;
            margin-bottom: 10px;
            background: linear-gradient(180deg, #ffffff 30%, rgba(255, 255, 255, 0.75) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .eco-hero-subtitle {
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            color: #c8c5cf;
            max-width: 500px;
            margin: 0 auto;
            line-height: 1.5;
            opacity: 0.85;
          }

          /* Metric Stats Counter Row */
          .eco-stats-row {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 40px;
            text-align: center;
          }

          .eco-stat-box {
            background: linear-gradient(145deg, rgba(20, 20, 25, 0.6) 0%, rgba(12, 12, 15, 0.8) 100%);
            border: 1px solid rgba(237, 192, 102, 0.08);
            border-radius: 10px;
            padding: 14px 8px;
            backdrop-filter: blur(10px);
          }

          .eco-stat-number {
            font-family: 'Outfit', sans-serif;
            font-size: 20px;
            font-weight: 700;
            color: #edc066;
            margin-bottom: 2px;
          }

          .eco-stat-label {
            font-family: 'Inter', sans-serif;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #8c8894;
          }

          /* Featured Flagship Item (Club Pro CLS) */
          .eco-flagship-section {
            margin-bottom: 40px;
          }

          .eco-flagship-card {
            background: linear-gradient(135deg, rgba(28, 27, 30, 0.9) 0%, rgba(12, 12, 14, 0.98) 100%);
            border: 1px solid rgba(237, 192, 102, 0.25);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05);
            transition: all 0.3s ease;
          }

          .eco-flagship-card:hover {
            border-color: rgba(237, 192, 102, 0.5);
            box-shadow: 0 20px 40px rgba(237, 192, 102, 0.08);
            transform: translateY(-2px);
          }

          .eco-flagship-cover {
            height: 160px;
            background-image: url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200');
            background-size: cover;
            background-position: center 30%;
            position: relative;
          }

          .eco-flagship-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(to top, rgba(12, 12, 14, 1) 0%, rgba(0,0,0,0.4) 100%);
          }

          .eco-flagship-content {
            padding: 24px;
            position: relative;
            margin-top: -30px;
            z-index: 2;
          }

          .badge-flagship {
            background: linear-gradient(135deg, rgba(237, 192, 102, 0.15) 0%, rgba(237, 192, 102, 0.05) 100%);
            color: #edc066;
            border: 1px solid rgba(237, 192, 102, 0.3);
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.08em;
            padding: 4px 10px;
            border-radius: 4px;
            text-transform: uppercase;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            margin-bottom: 12px;
          }

          .eco-flagship-title {
            font-family: 'Outfit', sans-serif;
            font-size: 26px;
            font-weight: 800;
            color: #ffffff;
            margin: 0 0 6px 0;
          }

          .eco-flagship-desc {
            font-size: 13px;
            color: #c8c5cf;
            line-height: 1.5;
            margin-bottom: 18px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            opacity: 0.9;
          }

          .eco-flagship-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;
            padding-top: 16px;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
          }

          .eco-flagship-price {
            font-family: 'Outfit', sans-serif;
            font-size: 14px;
            font-weight: 600;
            color: #edc066;
          }

          .eco-flagship-btn {
            background: linear-gradient(135deg, #edc066 0%, #d89f24 100%);
            color: #261900;
            font-family: 'Inter', sans-serif;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            padding: 10px 20px;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(237, 192, 102, 0.2);
          }

          .eco-flagship-btn:hover {
            background: linear-gradient(135deg, #ffdea3 0%, #edc066 100%);
            box-shadow: 0 6px 16px rgba(237, 192, 102, 0.35);
            transform: translateY(-1px);
          }

          /* Filter Tabs */
          .eco-filter-container {
            display: flex;
            gap: 8px;
            margin-bottom: 24px;
            overflow-x: auto;
            padding-bottom: 6px;
          }
          .eco-filter-container::-webkit-scrollbar {
            display: none;
          }

          .eco-filter-btn {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.06);
            color: #8c8894;
            font-size: 11px;
            font-family: 'Inter', sans-serif;
            font-weight: 600;
            padding: 8px 16px;
            border-radius: 20px;
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.2s ease;
          }

          .eco-filter-btn:hover {
            color: #ffffff;
            background: rgba(255, 255, 255, 0.06);
          }

          .eco-filter-btn.active {
            background: rgba(237, 192, 102, 0.1);
            border-color: rgba(237, 192, 102, 0.3);
            color: #edc066;
          }

          /* Link-Tree Row Card */
          .eco-tree-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .eco-tree-card {
            background: linear-gradient(145deg, rgba(20, 20, 24, 0.7) 0%, rgba(12, 12, 14, 0.85) 100%);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            display: flex;
            align-items: center;
            padding: 12px;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            backdrop-filter: blur(8px);
          }

          .eco-tree-card:hover {
            transform: translateY(-2px) scale(1.01);
            border-color: rgba(237, 192, 102, 0.22);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35), 0 0 15px rgba(237, 192, 102, 0.02);
          }

          .eco-tree-thumb {
            width: 72px;
            height: 72px;
            border-radius: 8px;
            background-size: cover;
            background-position: center;
            flex-shrink: 0;
            border: 1px solid rgba(255, 255, 255, 0.08);
          }

          .eco-tree-info {
            flex-grow: 1;
            padding: 0 16px;
            min-width: 0; /* Prevents overflow issues with truncating text */
          }

          .eco-tree-title {
            font-family: 'Outfit', sans-serif;
            font-size: 15px;
            font-weight: 700;
            color: #ffffff;
            margin: 0 0 4px 0;
          }

          .eco-tree-desc {
            font-size: 11px;
            color: #a8a5b0;
            line-height: 1.4;
            margin: 0 0 4px 0;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            opacity: 0.85;
          }

          .eco-tree-meta {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .eco-tree-tag {
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 0.03em;
            color: #edc066;
            background: rgba(237, 192, 102, 0.08);
            padding: 2px 6px;
            border-radius: 4px;
            text-transform: uppercase;
          }

          .eco-tree-price {
            font-family: 'Outfit', sans-serif;
            font-size: 11px;
            color: #8c8894;
            font-weight: 500;
          }

          .eco-tree-action {
            flex-shrink: 0;
          }

          .eco-tree-btn {
            background: transparent;
            color: #edc066;
            border: 1px solid rgba(237, 192, 102, 0.25);
            font-family: 'Inter', sans-serif;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            padding: 10px 14px;
            border-radius: 6px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s ease;
          }

          .eco-tree-card:hover .eco-tree-btn {
            background: #edc066;
            color: #261900;
            border-color: #edc066;
            box-shadow: 0 4px 10px rgba(237, 192, 102, 0.25);
          }

          @media (max-width: 600px) {
            .eco-tree-card {
              flex-direction: column;
              align-items: stretch;
              gap: 12px;
              padding: 14px;
            }
            .eco-tree-thumb {
              width: 100%;
              height: 120px;
            }
            .eco-tree-info {
              padding: 0;
            }
            .eco-tree-btn {
              width: 100%;
              justify-content: center;
            }
            .eco-flagship-footer {
              flex-direction: column;
              align-items: stretch;
            }
            .eco-flagship-btn {
              width: 100%;
              justify-content: center;
            }
          }
        `}} />

        {/* Minimal Header */}
        <header className="eco-header">
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div className="eco-logo-group">
              <div className="eco-logo-dot" />
              <h1 className="eco-brand-title">GRUPO CLS</h1>
            </div>
          </Link>
          {isMember && (
            <Link href="/dashboard" className="btn-outline" style={{ textDecoration: "none", fontSize: "10px", padding: "8px 16px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>dashboard</span>
              Painel
            </Link>
          )}
        </header>

        {/* Hero Section */}
        <section className="eco-hero-section">
          <h2 className="eco-hero-title">
            Ecossistema CLS
          </h2>
          <p className="eco-hero-subtitle">
            Acelere sua carreira e gestão com nossas soluções de mentoria avançada, treinamentos técnicos e ferramentas profissionais.
          </p>
        </section>


        {/* Highlighted Flagship (Club Pro CLS) at the Top */}
        <section className="eco-flagship-section">
          <div className="eco-flagship-card">
            <div className="eco-flagship-cover">
              <div className="eco-flagship-overlay" />
            </div>
            
            <div className="eco-flagship-content">
              <div>
                <span className="badge-flagship" style={!isMember ? { background: "rgba(255, 100, 100, 0.08)", color: "#ff6b6b", borderColor: "rgba(255, 100, 100, 0.25)" } : {}}>
                  <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>{isMember ? "verified_user" : "lock"}</span>
                  {isMember ? "Membros Club" : "Acesso Fechado"}
                </span>
              </div>

              <h3 className="eco-flagship-title">Club Pro CLS</h3>
              
              <p className="eco-flagship-desc">
                A plataforma de elite da construção civil. Acesso a mentorias ao vivo com referências de mercado, banco de dossiês técnicos e ferramentas prontas.
              </p>

              <div className="eco-flagship-footer">
                <div className="eco-flagship-price" style={!isMember ? { color: "#ff6b6b" } : {}}>
                  {isMember ? "Seu plano está ativo" : "Apenas para Convidados • Indisponível"}
                </div>
                <button
                  onClick={() => handleCtaClick("club-pro", "")}
                  disabled={!isMember}
                  className="eco-flagship-btn"
                  style={!isMember ? { background: "rgba(255, 255, 255, 0.03)", color: "rgba(255, 255, 255, 0.3)", border: "1px solid rgba(255, 255, 255, 0.08)", cursor: "not-allowed", boxShadow: "none" } : {}}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                    {isMember ? "login" : "lock"}
                  </span>
                  {isMember ? "Acessar Painel" : "Inscrições Fechadas"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Catalog Section Header */}
        <h4
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "18px",
            color: "#ffffff",
            marginBottom: "16px",
            fontWeight: 600,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            paddingBottom: "8px"
          }}
        >
          Treinamentos & Downloads
        </h4>

        {/* Filter Categories */}
        <div className="eco-filter-container">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`eco-filter-btn ${activeCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Link-Tree Style List */}
        <div className="eco-tree-list">
          {filteredProducts.map((product) => (
            <div key={product.id} className="eco-tree-card">
              
              {/* Product Thumbnail */}
              <div
                className="eco-tree-thumb"
                style={{ backgroundImage: `url('${product.image}')` }}
              />

              {/* Product Info */}
              <div className="eco-tree-info">
                <h4 className="eco-tree-title">{product.title}</h4>
                <p className="eco-tree-desc">{product.description}</p>
                <div className="eco-tree-meta">
                  <span className="eco-tree-tag">{product.category}</span>
                  <span className="eco-tree-price">{product.price}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="eco-tree-action">
                <button
                  onClick={() => handleCtaClick(product.id, product.checkoutUrl)}
                  className="eco-tree-btn"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                    {product.price === "Gratuito" ? "download" : "shopping_cart"}
                  </span>
                  {product.price === "Gratuito" ? "Baixar" : "Comprar"}
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Footer */}
        <footer style={{ marginTop: "80px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#8c8894", fontSize: "12px" }}>
          <div>
            &copy; {new Date().getFullYear()} GRUPO CLS.
          </div>
          <div>
            <span style={{ color: "#edc066", fontWeight: 600, fontSize: "11px", letterSpacing: "0.05em", textTransform: "uppercase" }}>Construindo o Futuro</span>
          </div>
        </footer>

      </div>
      <div style={{ height: "40px" }} />
    </div>
  );
}
