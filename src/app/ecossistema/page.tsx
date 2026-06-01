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
              type: string;
              image: string;
              ctaText: string;
            }

            const otherProducts: Product[] = [
              {
                id: "saia-improviso",
                title: "Saia do Improviso",
                description: "O treinamento prático de controle físico-financeiro para engenheiros e construtores. Aprenda a estruturar cronogramas precisos e eliminar desvios de orçamento no canteiro de obras de uma vez por todas.",
                category: "Curso Completo",
                type: "Adquirir Acesso",
                image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=600",
                ctaText: "Adquirir Curso"
              },
              {
                id: "calc-estrutural",
                title: "Cálculo Estrutural para Iniciantes",
                description: "Domine as teorias fundamentais e o dimensionamento prático de vigas, pilares e lajes de concreto armado. Leitura e interpretação de projetos para garantir máxima segurança executiva.",
                category: "Treinamento Técnico",
                type: "Adquirir Acesso",
                image: "https://images.unsplash.com/photo-1503387762-592dedb8c310?auto=format&fit=crop&q=80&w=600",
                ctaText: "Adquirir Treinamento"
              },
              {
                id: "ebook-moderno",
                title: "Ebook Engenheiro Moderno",
                description: "Descubra as principais ConTechs, ferramentas de inteligência artificial aplicadas à engenharia e técnicas de alavancagem profissional e posicionamento no mercado premium.",
                category: "Material Digital",
                type: "Download",
                image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80&w=600",
                ctaText: "Fazer Download"
              }
            ];

            export default function StandaloneEcossistemaPage() {
              const router = useRouter();
  
              const [isMember, setIsMember] = useState(false);
              const [loading, setLoading] = useState(true);

              useEffect(() => {
                async function checkMembership() {
                  try {
                    // createClient() is instantiated here (client-side only, inside useEffect)
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

              const handleCtaClick = (productId: string, active: boolean) => {
                if (productId === "club-pro") {
                  if (active) {
                    router.push("/dashboard");
                  } else {
                    alert("O Club Pro CLS é restrito a convidados. Fale com nosso consultor comercial para se candidatar a uma vaga!");
                  }
                } else {
                  alert("Redirecionando para a página de aquisição e checkout deste produto...");
                }
              };

              if (loading) {
                return <SkeletonDashboard />;
              }

              return (
                <div style={{ minHeight: "100vh", backgroundColor: "#0c0c0e", color: "#e5e1e6", position: "relative", overflowX: "hidden" }}>
      
                  {/* Background Radial Glow */}
                  <div className="eco-bg-glow" />

                  <div className="eco-container">
        
                    {/* CSS custom rules for grid layout, high end animations, card shadows, responsive styling */}
                    <style dangerouslySetInnerHTML={{ __html: `
                      .eco-bg-glow {
                        position: absolute;
                        top: 0;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 100%;
                        max-width: 1400px;
                        height: 550px;
                        background: radial-gradient(circle at 50% 0%, rgba(237, 192, 102, 0.08) 0%, rgba(7, 7, 50, 0.04) 50%, transparent 100%);
                        z-index: 0;
                        pointer-events: none;
                      }
          
                      .eco-container {
                        position: relative;
                        z-index: 1;
                        max-width: 1100px;
                        margin: 0 auto;
                        padding: 24px 32px 80px 32px;
                      }

                      .eco-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 64px;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                        padding: 24px 0;
                        position: sticky;
                        top: 0;
                        background: rgba(12, 12, 14, 0.8);
                        backdrop-filter: blur(12px);
                        -webkit-backdrop-filter: blur(12px);
                        z-index: 100;
                      }
          
                      .eco-logo-group {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                      }
          
                      .eco-logo-dot {
                        width: 8px;
                        height: 8px;
                        background-color: var(--color-secondary);
                        border-radius: 50%;
                        box-shadow: 0 0 12px var(--color-secondary);
                      }

                      .eco-brand-title {
                        font-family: 'Inter', sans-serif;
                        font-size: 16px;
                        font-weight: 700;
                        letter-spacing: 0.15em;
                        text-transform: uppercase;
                        background: linear-gradient(135deg, #ffffff 0%, #ffddea 50%, #edc066 100%);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        margin: 0;
                      }

                      .eco-hero-section {
                        text-align: center;
                        margin-bottom: 64px;
                      }

                      .eco-hero-title {
                        font-family: 'Outfit', sans-serif;
                        font-size: 44px;
                        font-weight: 700;
                        line-height: 1.18;
                        margin-bottom: 14px;
                        background: linear-gradient(180deg, #ffffff 36%, rgba(255, 255, 255, 0.85) 100%);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                      }

                      .eco-hero-subtitle {
                        font-family: 'Inter', sans-serif;
                        font-size: 15px;
                        color: var(--color-on-surface-variant);
                        max-width: 620px;
                        margin: 0 auto;
                        line-height: 1.6;
                        opacity: 0.85;
                      }

                      .eco-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                        gap: 28px;
                      }
          
                      .eco-highlight-card {
                        width: 100%;
                        border-radius: 16px;
                        border: 1px solid rgba(237, 192, 102, 0.18);
                        background: linear-gradient(145deg, rgba(28, 27, 30, 0.86) 0%, rgba(14, 14, 17, 0.96) 100%);
                        overflow: hidden;
                        margin-bottom: 64px;
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.36), inset 0 1px 0 rgba(255, 255, 255, 0.045);
                        position: relative;
                        transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                      }
          
                      .eco-highlight-card:hover {
                        transform: translateY(-2px);
                        border-color: rgba(237, 192, 102, 0.35);
                        box-shadow: 0 40px 80px rgba(0, 0, 0, 0.5), 0 0 40px rgba(237, 192, 102, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.08);
                      }
          
                      .eco-highlight-grid {
                        display: grid;
                        grid-template-columns: 1.2fr 1fr;
                        min-height: 380px;
                      }

                      .eco-highlight-image-wrapper {
                        position: relative;
                        min-height: 340px;
                        background-color: var(--color-surface-container-low);
                        overflow: hidden;
                      }

                      .eco-highlight-image {
                        position: absolute;
                        inset: 0;
                        background-image: url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200');
                        background-size: cover;
                        background-position: center 25%;
                        transition: transform 8s ease;
                      }

                      .eco-highlight-card:hover .eco-highlight-image {
                        transform: scale(1.05);
                      }

                      .eco-highlight-overlay {
                        position: absolute;
                        inset: 0;
                        background: linear-gradient(to right, transparent 20%, rgba(20, 19, 22, 0.95) 100%);
                      }

                      .eco-highlight-details {
                        padding: 40px;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        gap: 20px;
                        z-index: 2;
                        background-color: rgba(20, 19, 22, 0.95);
                      }

                      .eco-card {
                        background: linear-gradient(145deg, rgba(28, 27, 30, 0.62) 0%, rgba(14, 14, 17, 0.86) 100%);
                        border: 1px solid rgba(255, 255, 255, 0.05);
                        border-radius: 12px;
                        overflow: hidden;
                        display: flex;
                        flex-direction: column;
                        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.28);
                      }
          
                      .eco-card:hover {
                        transform: translateY(-6px);
                        border-color: rgba(237, 192, 102, 0.25);
                        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.45), 0 0 25px rgba(237, 192, 102, 0.03);
                      }

                      .eco-card-image-wrapper {
                        aspect-ratio: 16/10;
                        position: relative;
                        overflow: hidden;
                        background-color: var(--color-surface-container);
                      }

                      .eco-card-image {
                        position: absolute;
                        inset: 0;
                        background-size: cover;
                        background-position: center;
                        transition: transform 6s ease;
                      }

                      .eco-card:hover .eco-card-image {
                        transform: scale(1.06);
                      }

                      .eco-card-overlay {
                        position: absolute;
                        inset: 0;
                        background: linear-gradient(to top, rgba(14, 14, 17, 0.9) 0%, transparent 60%);
                      }

                      .eco-card-content {
                        padding: 28px;
                        display: flex;
                        flex-direction: column;
                        flex-grow: 1;
                        gap: 18px;
                      }

                      .eco-card-title {
                        font-family: 'Outfit', sans-serif;
                        font-size: 18px;
                        color: #ffffff;
                        font-weight: 600;
                        margin: 0;
                      }

                      .eco-card-desc {
                        font-family: 'Inter', sans-serif;
                        font-size: 13px;
                        color: var(--color-on-surface-variant);
                        line-height: 1.6;
                        margin: 0;
                        flex-grow: 1;
                        opacity: 0.85;
                      }

                      .badge-premium {
                        background: linear-gradient(135deg, rgba(237, 192, 102, 0.15) 0%, rgba(237, 192, 102, 0.05) 100%);
                        color: var(--color-secondary);
                        border: 1px solid rgba(237, 192, 102, 0.3);
                        font-size: 10px;
                        font-weight: 700;
                        letter-spacing: 0.08em;
                        padding: 6px 12px;
                        border-radius: 4px;
                        text-transform: uppercase;
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                      }
          
                      .badge-locked {
                        background: rgba(255, 255, 255, 0.03);
                        color: var(--color-on-surface-variant);
                        border: 1px solid rgba(255, 255, 255, 0.08);
                        font-size: 10px;
                        font-weight: 700;
                        letter-spacing: 0.08em;
                        padding: 6px 12px;
                        border-radius: 4px;
                        text-transform: uppercase;
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                      }
          
                      .badge-other {
                        background: rgba(255, 255, 255, 0.04);
                        color: var(--color-on-surface-variant);
                        border: 1px solid rgba(255, 255, 255, 0.08);
                        font-size: 10px;
                        font-weight: 700;
                        letter-spacing: 0.06em;
                        padding: 6px 12px;
                        border-radius: 6px;
                        text-transform: uppercase;
                      }
          
                      .btn-eco-active {
                        background: linear-gradient(135deg, #edc066 0%, #d89f24 100%) !important;
                        color: #261900 !important;
                        border: none !important;
                        box-shadow: 0 4px 15px rgba(237, 192, 102, 0.25) !important;
                        font-weight: 700 !important;
                        transition: all 0.3s ease !important;
                      }
                      .btn-eco-active:hover {
                        background: linear-gradient(135deg, #ffdea3 0%, #edc066 100%) !important;
                        box-shadow: 0 6px 20px rgba(237, 192, 102, 0.4) !important;
                        transform: translateY(-1px);
                      }

                      .btn-eco-locked {
                        background: rgba(255, 255, 255, 0.03) !important;
                        color: rgba(255, 255, 255, 0.3) !important;
                        border: 1px solid rgba(255, 255, 255, 0.08) !important;
                        cursor: not-allowed !important;
                        font-weight: 600 !important;
                        transition: all 0.3s ease !important;
                      }
                      .btn-eco-locked:hover {
                        background: rgba(255, 255, 255, 0.05) !important;
                        border-color: rgba(255, 255, 255, 0.12) !important;
                      }

                      .btn-card-cta {
                        width: 100%;
                        margin-top: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        padding: 14px 22px;
                        background: transparent;
                        color: var(--color-secondary);
                        border: 1px solid rgba(237, 192, 102, 0.28);
                        border-radius: 8px;
                        font-family: 'Inter', sans-serif;
                        font-size: 12px;
                        font-weight: 700;
                        letter-spacing: 0.08em;
                        text-transform: uppercase;
                        cursor: pointer;
                        transition: all 0.2s ease;
                      }
                      .eco-card:hover .btn-card-cta {
                        border-color: var(--color-secondary);
                        background: rgba(237, 192, 102, 0.05);
                        box-shadow: 0 4px 12px rgba(237, 192, 102, 0.15);
                      }

                      @media (max-width: 900px) {
                        .eco-highlight-grid {
                          grid-template-columns: 1fr;
                        }
                        .eco-highlight-image-wrapper {
                          min-height: 220px;
                        }
                        .eco-highlight-overlay {
                          background: linear-gradient(to top, rgba(20, 19, 22, 0.95) 0%, rgba(20, 19, 22, 0.3) 100%);
                        }
                        .eco-highlight-details {
                          padding: 32px 24px;
                        }
                        .eco-hero-title {
                          font-size: 36px;
                        }
                        .eco-header {
                          margin-bottom: 36px;
                          padding: 16px 0;
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
                        <Link href="/dashboard" className="btn-outline" style={{ textDecoration: "none", fontSize: "11px", padding: "10px 20px", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>dashboard</span>
                          Ir para o Painel
                        </Link>
                      )}
                    </header>

                    {/* Page Titles */}
                    <section className="eco-hero-section">
                      <h2 className="eco-hero-title">
                        Nosso Ecossistema
                      </h2>
                      <p className="eco-hero-subtitle">
                        Conheça todas as soluções de desenvolvimento técnico, mentoria avançada e networking do ecossistema CLS.
                      </p>
                    </section>

                    {/* Grid of Other Products */}
                    <h4
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: "22px",
                        color: "var(--color-on-surface)",
                        marginBottom: "28px",
                        fontWeight: 600,
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        paddingBottom: "12px"
                      }}
                    >
                      Programas e Soluções Adicionais
                    </h4>

                    <div className="eco-grid" style={{ marginBottom: "64px" }}>
                      {otherProducts.map((product) => (
                        <div key={product.id} className="eco-card">
              
                          {/* Thumbnail */}
                          <div className="eco-card-image-wrapper">
                            <div
                              className="eco-card-image"
                              style={{
                                backgroundImage: `url('${product.image}')`
                              }}
                            />
                            <div className="eco-card-overlay" />
                
                            <div style={{ position: "absolute", top: "16px", left: "16px", zIndex: 3 }}>
                              <span className="badge-other">{product.category}</span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="eco-card-content">
                            <h4 className="eco-card-title">
                              {product.title}
                            </h4>
                
                            <p className="eco-card-desc">
                              {product.description}
                            </p>

                            <button
                              onClick={() => handleCtaClick(product.id, false)}
                              className="btn-card-cta"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>shopping_bag</span>
                              {product.ctaText}
                            </button>
                          </div>

                        </div>
                      ))}
                    </div>

                    {/* Highlighted Flagship Product Card (Club Pro CLS) */}
                    <div className="eco-highlight-card">
                      <div className="eco-highlight-grid">
            
                        {/* Cover image banner */}
                        <div className="eco-highlight-image-wrapper">
                          <div className="eco-highlight-image" />
                          <div className="eco-highlight-overlay" />
              
                          {/* Lock watermark overlay for unsubscribed visitors */}
                          {!isMember && (
                            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.3)", backdropFilter: "blur(3px)", zIndex: 2 }}>
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", background: "rgba(19,19,22,0.8)", border: "1px solid rgba(255,255,255,0.08)", padding: "20px 24px", borderRadius: "12px" }}>
                                <span className="material-symbols-outlined" style={{ fontSize: "36px", color: "var(--color-secondary)" }}>lock</span>
                                <span style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.05em", color: "var(--color-on-surface-variant)" }}>ACESSO EXCLUSIVO</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Details column */}
                        <div className="eco-highlight-details">
                          <div>
                            {isMember ? (
                              <span className="badge-premium">
                                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>verified</span>
                                SEU PLANO ATIVO
                              </span>
                            ) : (
                              <span className="badge-locked">
                                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>lock</span>
                                CONVITE EXCLUSIVO
                              </span>
                            )}
                          </div>

                          <h3 style={{ fontSize: "32px", color: "#ffffff", fontWeight: 700, margin: 0, fontFamily: "'Outfit', sans-serif" }}>
                            Club Pro CLS
                          </h3>

                          <p style={{ fontSize: "14px", color: "var(--color-on-surface-variant)", lineHeight: "1.6", margin: 0, opacity: 0.9 }}>
                            {isMember 
                              ? "Sua plataforma executiva de elite na construção civil. Acesso ilimitado a mentorias semanais, biblioteca completa de masterclasses, modelos de dossiês e materiais de apoio exclusivos para acelerar sua captação de recursos e gestão de obras."
                              : "A plataforma executiva de elite da construção civil. Acesso restrito a mentorias semanais com líderes de mercado, biblioteca de masterclasses avançadas de viabilidade e custos, dossiês técnicos e rodadas fechadas de co-investimento."
                            }
                          </p>

                          <button
                            onClick={() => handleCtaClick("club-pro", isMember)}
                            disabled={!isMember}
                            className={isMember ? "btn-primary btn-eco-active" : "btn-primary btn-eco-locked"}
                            style={{
                              width: "fit-content",
                              marginTop: "8px",
                              padding: "14px 28px",
                              borderRadius: "6px",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px"
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                              {isMember ? "login" : "lock"}
                            </span>
                            {isMember ? "Acessar Conteúdo" : "Exclusivo para Membros"}
                          </button>
                        </div>

                      </div>
                    </div>

                    {/* Footer */}
                    <footer style={{ marginTop: "100px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--color-on-surface-variant)", fontSize: "13px" }}>
                      <div>
                        &copy; {new Date().getFullYear()} GRUPO CLS. Todos os direitos reservados.
                      </div>
                      <div style={{ display: "flex", gap: "16px" }}>
                        <span style={{ color: "var(--color-secondary)", fontWeight: 600, fontSize: "12px", letterSpacing: "0.05em", textTransform: "uppercase" }}>Construindo o Futuro</span>
                      </div>
                    </footer>

                  </div>
                  <div style={{ height: "48px" }} />
                </div>
              );
            }
