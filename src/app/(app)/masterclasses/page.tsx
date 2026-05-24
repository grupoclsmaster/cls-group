"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

// Fallback modules matching seeded database structure
const fallbackModules = [
  {
    id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1",
    title: "Gestão de Projetos e Planejamento de Obras",
    description: "Fundamentos essenciais de planejamento de obras, cronogramas físicos e de suprimentos.",
    sequence_order: 1,
    slug: "gestao-e-planejamento"
  },
  {
    id: "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2",
    title: "Engenharia de Custos e Viabilidade de Projetos",
    description: "Composição de custos diretos e indiretos, orçamentação avançada e análise de EVTL.",
    sequence_order: 2,
    slug: "custos-e-viabilidade"
  },
  {
    id: "c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3",
    title: "Métodos Construtivos Avançados e BIM",
    description: "Adoção prática de modelagem BIM 3D/4D/5D, VDC e industrialização da construção.",
    sequence_order: 3,
    slug: "metodos-e-bim"
  }
];

const fallbackLessons = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    module_id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1",
    title: "Fundamentos do Planejamento Físico-Financeiro",
    description: "Como estruturar um cronograma integrado alinhando metas físicas a desembolsos financeiros.",
    duration: "18:45",
    thumbnail_url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600",
    instructor_name: "Eng. Magno Santos",
    instructor_role: "Mentor Sênior",
    instructor_avatar: "/magno.jpg",
    sequence_order: 1,
    slug: "planejamento-fisico-financeiro",
    progress: 53,
    completed: false
  },
  {
    id: "11111111-1111-1111-1111-111111111112",
    module_id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1",
    title: "Controle de Suprimentos e Logística de Canteiro",
    description: "Planejamento logístico e de suprimentos para evitar gargalos e paralisações nas frentes de trabalho.",
    duration: "15:20",
    thumbnail_url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=1200",
    instructor_name: "Eng. Magno Santos",
    instructor_role: "Mentor Sênior",
    instructor_avatar: "/magno.jpg",
    sequence_order: 2,
    slug: "suprimentos-e-logistica-canteiro",
    progress: 0,
    completed: false
  },
  {
    id: "11111111-1111-1111-1111-111111111113",
    module_id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1",
    title: "Lean Construction e Otimização de Processos",
    description: "Adoção dos princípios da construção enxuta para redução de perdas e aumento de eficiência.",
    duration: "22:15",
    thumbnail_url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=600",
    instructor_name: "Arq. Mayara Santos",
    instructor_role: "Mentor Sênior",
    instructor_avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    sequence_order: 3,
    slug: "lean-construction-otimizacao",
    progress: 0,
    completed: false
  },
  {
    id: "22222222-2222-2222-2222-222222222221",
    module_id: "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2",
    title: "Engenharia de Custos Aplicada",
    description: "Desconstruindo a composição de custos e orçamento paramétrico para obras de alto padrão.",
    duration: "18:45",
    thumbnail_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400",
    instructor_name: "Eng. Magno Santos",
    instructor_role: "Mentor Sênior",
    instructor_avatar: "/magno.jpg",
    sequence_order: 1,
    slug: "engenharia-de-custos-aplicada",
    progress: 100,
    completed: true
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    module_id: "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2",
    title: "Análise de Viabilidade Imobiliária",
    description: "Estratégias avançadas para estruturação financeira de terrenos e incorporação.",
    duration: "24:10",
    thumbnail_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=400",
    instructor_name: "Arq. Mayara Santos",
    instructor_role: "Mentor Sênior",
    instructor_avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    sequence_order: 2,
    slug: "viabilidade-imobiliaria",
    progress: 15,
    completed: false
  },
  {
    id: "22222222-2222-2222-2222-222222222223",
    module_id: "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2",
    title: "Gestão de Contratos de Obra (EPC/Turnkey)",
    description: "Como gerir e fechar contratos de execução de obras civis complexas com o máximo controle de riscos.",
    duration: "21:05",
    thumbnail_url: "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&q=80&w=400",
    instructor_name: "Arq. Mayara Santos",
    instructor_role: "Mentor Sênior",
    instructor_avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    sequence_order: 3,
    slug: "gestao-contratos-epc",
    progress: 0,
    completed: false
  },
  {
    id: "33333333-3333-3333-3333-333333333331",
    module_id: "c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3",
    title: "BIM e Virtual Design in Construction (VDC)",
    description: "Técnicas de modelagem inteligente e compatibilização 3D de projetos complexos.",
    duration: "15:30",
    thumbnail_url: "https://images.unsplash.com/photo-1503387762-592dedb8c310?auto=format&fit=crop&q=80&w=400",
    instructor_name: "Eng. Magno Santos",
    instructor_role: "Mentor Sênior",
    instructor_avatar: "/magno.jpg",
    sequence_order: 1,
    slug: "bim-vdc-modelagem",
    progress: 0,
    completed: false
  },
  {
    id: "33333333-3333-3333-3333-333333333332",
    module_id: "c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3",
    title: "Industrialização e Estruturas Pré-Fabricadas",
    description: "Fundamentos de construção modular, pré-moldados e otimização construtiva.",
    duration: "20:40",
    thumbnail_url: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&q=80&w=600",
    instructor_name: "Eng. Magno Santos",
    instructor_role: "Mentor Sênior",
    instructor_avatar: "/magno.jpg",
    sequence_order: 2,
    slug: "industrializacao-pre-fabricados",
    progress: 0,
    completed: false
  }
];

export default function MasterclassesPage() {
  const router = useRouter();
  const supabase = createClient();

  const [modules, setModules] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [heroLesson, setHeroLesson] = useState<any>(null);

  // Fetch data on load
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        let dbProgress: any[] = [];
        if (user) {
          const { data: progressData } = await supabase
            .from('user_lesson_progress')
            .select('*')
            .eq('user_id', user.id);
          if (progressData) dbProgress = progressData;
        }

        // Fetch modules
        const { data: dbModules } = await supabase
          .from('modules')
          .select('*')
          .order('sequence_order', { ascending: true });

        // Fetch lessons
        const { data: dbLessons } = await supabase
          .from('lessons')
          .select('*')
          .order('sequence_order', { ascending: true });

        let finalModules = fallbackModules;
        let finalLessons = fallbackLessons;

        if (dbModules && dbModules.length > 0) {
          finalModules = dbModules;
        }
        if (dbLessons && dbLessons.length > 0) {
          finalLessons = dbLessons.map((l: any) => {
            const prog = dbProgress.find((p) => p.lesson_id === l.id);
            return {
              ...l,
              progress: prog ? prog.percent_complete : 0,
              completed: prog ? prog.completed : false,
              watched_seconds: prog ? prog.watched_seconds : 0
            };
          });
        }

        setModules(finalModules);
        setLessons(finalLessons);

        // Determine Hero lesson (either the active in-progress one, or the first lesson)
        const inProgress = finalLessons.find((l) => l.progress > 0 && l.progress < 100);
        const firstUnfinished = finalLessons.find((l) => !l.completed);
        const defaultHero = inProgress || firstUnfinished || finalLessons[0];
        
        if (defaultHero) {
          const mod = finalModules.find((m) => m.id === defaultHero.module_id);
          setHeroLesson({
            ...defaultHero,
            module_title: mod ? mod.title : "Módulo"
          });
        }
      } catch (err) {
        console.error("Erro ao carregar dados do Supabase:", err);
        setModules(fallbackModules);
        setLessons(fallbackLessons);
        setHeroLesson({
          ...fallbackLessons[4], // Default to viabilidade-imobiliaria
          module_title: fallbackModules[1].title
        });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Handle resetting progress on the active hero lesson
  const handleResetProgress = async (lessonId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Mock fallback reset
        setLessons(prev => prev.map(l => l.id === lessonId ? { ...l, progress: 0, completed: false } : l));
        if (heroLesson && heroLesson.id === lessonId) {
          setHeroLesson((prev: any) => ({ ...prev, progress: 0, completed: false }));
        }
        alert("Progresso da aula reiniciado localmente!");
        return;
      }

      const { error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          watched_seconds: 0,
          total_seconds: 1200,
          percent_complete: 0,
          completed: false,
          last_watched_at: new Date().toISOString()
        }, { onConflict: 'user_id,lesson_id' });

      if (error) throw error;

      setLessons(prev => prev.map(l => l.id === lessonId ? { ...l, progress: 0, completed: false } : l));
      if (heroLesson && heroLesson.id === lessonId) {
        setHeroLesson((prev: any) => ({ ...prev, progress: 0, completed: false }));
      }
      alert("Progresso da aula reiniciado com sucesso!");
    } catch (err) {
      console.error("Erro ao reiniciar progresso:", err);
    }
  };

  // Scroll carousels programmatically
  const scrollCarousel = (id: string, direction: 'left' | 'right') => {
    const container = document.getElementById(id);
    if (container) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", color: "var(--color-secondary)" }}>
        <span className="material-symbols-outlined animate-spin" style={{ fontSize: "48px" }}>sync</span>
      </div>
    );
  }

  // Filter lessons if query is provided
  const filteredLessons = lessons.filter(l => 
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Generate Top 5 list based on lessons (hardcoded ranking matching active user scenarios)
  // 1. Viabilidade Imobiliária, 2. Custos Aplicada, 3. BIM VDC, 4. Planejamento Físico, 5. Contratos EPC
  const rankingIds = [
    "22222222-2222-2222-2222-222222222222",
    "22222222-2222-2222-2222-222222222221",
    "33333333-3333-3333-3333-333333333331",
    "11111111-1111-1111-1111-111111111111",
    "22222222-2222-2222-2222-222222222223"
  ];
  const top5Lessons = rankingIds
    .map(id => lessons.find(l => l.id === id))
    .filter(Boolean);

  return (
    <div className="animate-fadeIn" style={{ position: "relative" }}>
      {/* CSS Injection for Netflix elements without strong shadows, softer module borders */}
      <style dangerouslySetInnerHTML={{ __html: `
        .netflix-carousel {
          display: flex;
          overflow-x: auto;
          scroll-behavior: smooth;
          gap: 18px;
          padding: 16px 0 24px 0;
          scrollbar-width: none; /* Firefox */
        }
        .netflix-carousel::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
        .carousel-container {
          position: relative;
          margin-bottom: 32px;
        }
        .carousel-arrow {
          position: absolute;
          top: 16px;
          bottom: 24px;
          width: 50px;
          background-color: rgba(14, 14, 17, 0.65);
          border: none;
          color: white;
          font-size: 32px;
          cursor: pointer;
          zIndex: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease, background-color 0.2s ease, color 0.2s ease;
          backdrop-filter: blur(4px);
        }
        .carousel-container:hover .carousel-arrow {
          opacity: 1;
        }
        .carousel-arrow:hover {
          background-color: rgba(14, 14, 17, 0.95);
          color: var(--color-secondary);
        }
        .carousel-arrow-left {
          left: -10px;
          border-radius: 0 4px 4px 0;
        }
        .carousel-arrow-right {
          right: -10px;
          border-radius: 4px 0 0 4px;
        }
        .netflix-card {
          flex: 0 0 310px;
          border-radius: 8px; /* Softer rounded corners */
          overflow: hidden;
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.08); /* Softer module border */
          background-color: var(--color-surface-container-low);
          transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), border-color 0.3s ease;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          box-shadow: none !important; /* Strictly no shadows as requested */
        }
        .netflix-card:hover {
          transform: translateY(-4px) scale(1.02);
          border-color: rgba(237, 192, 102, 0.45);
          z-index: 2;
          box-shadow: none !important; /* Strictly no shadows */
        }
        .hero-action-btn {
          background-color: #ffffff;
          color: #131316;
          border: none;
          border-radius: 4px;
          padding: 12px 28px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: background-color 0.2s ease, transform 0.1s ease;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          text-decoration: none;
        }
        .hero-action-btn:hover {
          background-color: #e6e6e6;
          transform: scale(1.02);
        }
        .hero-action-btn:active {
          transform: scale(0.98);
        }
        .control-circle-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.4);
          background-color: rgba(0, 0, 0, 0.4);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: border-color 0.2s, background-color 0.2s, color 0.2s;
        }
        .control-circle-btn:hover {
          border-color: #ffffff;
          background-color: rgba(255, 255, 255, 0.1);
          color: var(--color-secondary);
        }
      `}} />

      {/* Netflix Hero Banner */}
      {heroLesson && (
        <section
          style={{
            margin: "-40px -40px 32px -40px",
            height: "55vh",
            minHeight: "450px",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end"
          }}
        >
          {/* Background Image Layer */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url('${heroLesson.thumbnail_url}')`,
              backgroundSize: "cover",
              backgroundPosition: "center 30%",
              zIndex: 1
            }}
          />

          {/* Fade Overlay Gradients (Softening the boundaries into the main bg color) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to right, rgba(19, 19, 22, 0.95) 0%, rgba(19, 19, 22, 0.8) 25%, rgba(19, 19, 22, 0.3) 60%, transparent 100%)",
              zIndex: 2
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, #131316 0%, rgba(19, 19, 22, 0.8) 12%, rgba(19, 19, 22, 0.3) 45%, transparent 100%)",
              zIndex: 2
            }}
          />

          {/* Search Pill overlay on top-right of hero banner */}
          <div
            style={{
              position: "absolute",
              top: "32px",
              right: "40px",
              zIndex: 10,
              display: "flex",
              alignItems: "center"
            }}
          >
            <div style={{ position: "relative" }}>
              <span
                className="material-symbols-outlined"
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#a0a0a5",
                  fontSize: "18px"
                }}
              >
                search
              </span>
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "220px",
                  padding: "10px 16px 10px 42px",
                  backgroundColor: "rgba(14, 14, 17, 0.75)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "100px",
                  color: "#ffffff",
                  fontSize: "13px",
                  outline: "none",
                  backdropFilter: "blur(8px)"
                }}
              />
            </div>
          </div>

          {/* Hero Banner Text Content (Left aligned) */}
          <div
            style={{
              position: "relative",
              zIndex: 5,
              padding: "0 40px 40px 40px",
              maxWidth: "600px",
              display: "flex",
              flexDirection: "column",
              gap: "12px"
            }}
          >
            <span
              className="font-label-caps"
              style={{
                color: "var(--color-secondary)",
                fontSize: "11px",
                letterSpacing: "0.15em",
                fontWeight: 700
              }}
            >
              Teste • Conteúdo 1
            </span>
            <h1
              className="font-display"
              style={{
                fontSize: "46px",
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1.1,
                letterSpacing: "-0.01em"
              }}
            >
              {heroLesson.title}
            </h1>

            {/* Custom gold progress bar (strictly NO red as requested) */}
            {heroLesson.progress > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "8px 0" }}>
                <div
                  style={{
                    width: "200px",
                    height: "3px",
                    backgroundColor: "rgba(255,255,255,0.25)",
                    borderRadius: "100px",
                    overflow: "hidden"
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      backgroundColor: "var(--color-secondary)", // Gold Accent
                      width: `${heroLesson.progress}%`
                    }}
                  />
                </div>
                <span style={{ fontSize: "10px", color: "var(--color-on-surface-variant)", fontWeight: 600 }}>
                  {heroLesson.progress}% assistido
                </span>
              </div>
            )}

            <p
              className="font-body-md"
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: "14px",
                lineHeight: "1.6",
                marginTop: "4px"
              }}
            >
              {heroLesson.description}
            </p>

            <div style={{ display: "flex", gap: "16px", marginTop: "16px", alignItems: "center" }}>
              <Link href={`/masterclasses/${heroLesson.id}`} className="hero-action-btn">
                <span className="material-symbols-outlined" style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}>
                  play_arrow
                </span>
                Continue assistindo
              </Link>
            </div>
          </div>

          {/* Replay and Mute controls on bottom right */}
          <div
            style={{
              position: "absolute",
              right: "40px",
              bottom: "40px",
              zIndex: 5,
              display: "flex",
              gap: "12px"
            }}
          >
            <button
              onClick={() => handleResetProgress(heroLesson.id)}
              className="control-circle-btn"
              title="Reiniciar Progresso"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>replay</span>
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="control-circle-btn"
              title={isMuted ? "Ativar Áudio" : "Mutar"}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                {isMuted ? "volume_off" : "volume_up"}
              </span>
            </button>
          </div>
        </section>
      )}

      {/* Main Content Sections */}
      <div style={{ padding: "0 0 40px 0" }}>
        
        {/* Netflix Top 5 Section (strictly NO red, styled with gold outline numbers) */}
        {top5Lessons.length > 0 && searchQuery === "" && (
          <section className="carousel-container" style={{ marginBottom: "44px" }}>
            <h3
              className="font-title-lg"
              style={{
                fontSize: "18px",
                color: "var(--color-on-surface)",
                marginBottom: "16px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)" }}>workspace_premium</span>
              Top 5 Mais Assistidos
            </h3>
            
            <div className="netflix-carousel" style={{ padding: "0 10px 20px 20px", gap: "24px" }}>
              {top5Lessons.map((lesson: any, index: number) => (
                <div key={lesson.id} style={{ display: "flex", position: "relative", width: "240px", height: "190px", alignItems: "center", flexShrink: 0 }}>
                  
                  {/* Huge Netflix outline number on the left */}
                  <span style={{
                    position: "absolute",
                    left: 0,
                    bottom: "-14px",
                    fontSize: "170px",
                    fontWeight: "900",
                    fontFamily: "'Impact', 'Inter', sans-serif",
                    lineHeight: "1",
                    color: "#131316", // Blend fill to bg to appear hollow
                    WebkitTextStroke: "3px rgba(237, 192, 102, 0.45)", // Gold outline
                    zIndex: 1,
                    userSelect: "none"
                  }}>
                    {index + 1}
                  </span>
                  
                  {/* Overlapping Poster Card (Soften module, no shadows) */}
                  <div
                    className="netflix-card"
                    onClick={() => router.push(`/masterclasses/${lesson.id}`)}
                    style={{
                      position: "absolute",
                      left: "70px",
                      width: "135px",
                      height: "180px",
                      zIndex: 2,
                      borderRadius: "8px",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      boxShadow: "none" // Strictly no shadow
                    }}
                  >
                    <div style={{ width: "100%", height: "100%", position: "relative" }}>
                      <img
                        src={lesson.thumbnail_url}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(19, 19, 22, 0.95) 0%, rgba(19, 19, 22, 0.2) 50%, transparent 100%)" }} />
                      
                      {/* Gold Progress line if started */}
                      {lesson.progress > 0 && (
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", backgroundColor: "rgba(255,255,255,0.2)", zIndex: 4 }}>
                          <div style={{ height: "100%", backgroundColor: "var(--color-secondary)", width: `${lesson.progress}%` }} />
                        </div>
                      )}

                      {/* Title Overlay */}
                      <div style={{ position: "absolute", bottom: "12px", left: "10px", right: "10px", zIndex: 3 }}>
                        <span style={{ fontSize: "8px", color: "var(--color-secondary)", fontWeight: 700, display: "block", marginBottom: "2px" }}>
                          AULA {lesson.sequence_order}
                        </span>
                        <h4 style={{ fontSize: "11px", color: "#ffffff", fontWeight: 700, lineHeight: "1.3", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {lesson.title}
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Modules/Trails Section */}
        <h2
          className="font-display"
          style={{
            fontSize: "26px",
            color: "var(--color-on-surface)",
            marginBottom: "24px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            paddingBottom: "12px"
          }}
        >
          Módulos
        </h2>

        {modules.map((mod) => {
          const moduleLessons = filteredLessons.filter((l) => l.module_id === mod.id);
          
          if (moduleLessons.length === 0) return null;

          return (
            <section key={mod.id} className="carousel-container">
              <h3
                className="font-title-lg"
                style={{
                  fontSize: "17px",
                  color: "var(--color-on-surface)",
                  marginBottom: "8px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "baseline",
                  gap: "8px"
                }}
              >
                Módulo {String(mod.sequence_order).padStart(2, "0")}{" "}
                <span style={{ color: "var(--color-secondary)", fontSize: "14px", fontWeight: 400 }}>
                  / {mod.title}
                </span>
              </h3>

              {/* Navigation arrows */}
              <button
                className="carousel-arrow carousel-arrow-left"
                onClick={() => scrollCarousel(`carousel-${mod.id}`, "left")}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>

              <div id={`carousel-${mod.id}`} className="netflix-carousel">
                {moduleLessons.map((lesson) => {
                  return (
                    <div
                      key={lesson.id}
                      className="netflix-card"
                      onClick={() => router.push(`/masterclasses/${lesson.id}`)}
                    >
                      {/* Image Thumbnail */}
                      <div style={{ aspectRatio: "16/9", position: "relative", backgroundColor: "var(--color-surface-container)" }}>
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            backgroundImage: `url('${lesson.thumbnail_url}')`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            opacity: 0.8
                          }}
                        />
                        
                        {/* Shadow overlays */}
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(14,14,17,0.95) 0%, transparent 60%)" }} />

                        {/* Status tag badges (strictly NO red, styled with Gold palette) */}
                        <div style={{ position: "absolute", top: "10px", left: "10px", zIndex: 3 }}>
                          {lesson.completed ? (
                            <span
                              style={{
                                backgroundColor: "rgba(7,7,50,0.85)",
                                border: "1px solid rgba(237,192,102,0.4)",
                                color: "var(--color-secondary)",
                                padding: "4px 8px",
                                borderRadius: "2px",
                                fontSize: "9px",
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                backdropFilter: "blur(4px)"
                              }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: "10px", fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                              CONCLUÍDO
                            </span>
                          ) : lesson.progress > 0 ? (
                            <span
                              style={{
                                backgroundColor: "rgba(237, 192, 102, 0.2)",
                                border: "1px solid rgba(237, 192, 102, 0.4)",
                                color: "var(--color-secondary)",
                                padding: "4px 8px",
                                borderRadius: "2px",
                                fontSize: "9px",
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                backdropFilter: "blur(4px)"
                              }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: "10px", fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                              CONTINUAR ({lesson.progress}%)
                            </span>
                          ) : (
                            <span
                              style={{
                                backgroundColor: "rgba(255,255,255,0.9)",
                                color: "#000000",
                                padding: "4px 8px",
                                borderRadius: "2px",
                                fontSize: "9px",
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: "10px", fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                              ASSISTIR
                            </span>
                          )}
                        </div>

                        {/* Duration Badge */}
                        <span
                          style={{
                            position: "absolute",
                            bottom: "8px",
                            right: "8px",
                            backgroundColor: "rgba(0,0,0,0.75)",
                            backdropFilter: "blur(4px)",
                            color: "white",
                            fontSize: "9px",
                            padding: "2px 6px",
                            borderRadius: "2px",
                            zIndex: 3
                          }}
                        >
                          {lesson.duration}
                        </span>

                        {/* Gold progress line at the very bottom of the card image */}
                        {lesson.progress > 0 && (
                          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", backgroundColor: "rgba(255,255,255,0.2)", zIndex: 4 }}>
                            <div style={{ height: "100%", backgroundColor: "var(--color-secondary)", width: `${lesson.progress}%` }} />
                          </div>
                        )}
                      </div>

                      {/* Card Content info */}
                      <div style={{ padding: "12px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                        <span style={{ fontSize: "9px", color: "var(--color-secondary)", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "4px" }}>
                          AULA {lesson.sequence_order}
                        </span>
                        <h4
                          style={{
                            fontSize: "14px",
                            color: "#ffffff",
                            fontWeight: 600,
                            lineHeight: "1.3",
                            marginBottom: "6px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {lesson.title}
                        </h4>
                        <p
                          style={{
                            fontSize: "11px",
                            color: "var(--color-on-surface-variant)",
                            lineHeight: "1.4",
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            margin: 0
                          }}
                        >
                          {lesson.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                className="carousel-arrow carousel-arrow-right"
                onClick={() => scrollCarousel(`carousel-${mod.id}`, "right")}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </section>
          );
        })}
      </div>
    </div>
  );
}
