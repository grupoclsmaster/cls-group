"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { SkeletonMasterclasses } from "@/components/SkeletonLoading";

// Fallback courses matching seeded database structure
const fallbackCourses = [
  {
    id: "41f3db50-a051-4940-be6f-7bceffe969b8",
    title: "Incorporação e Construção Civil",
    description: "Formação completa cobrindo gestão de projetos, cronogramas físico-financeiros, orçamentação e BIM.",
    cover_image_url: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=800",
    sequence_order: 1
  }
];

// Fallback modules matching seeded database structure
const fallbackModules = [
  {
    id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1",
    course_id: "41f3db50-a051-4940-be6f-7bceffe969b8",
    title: "Gestão de Projetos e Planejamento de Obras",
    description: "Fundamentos essenciais de planejamento de obras, cronogramas físicos e de suprimentos.",
    sequence_order: 1,
    slug: "gestao-e-planejamento"
  },
  {
    id: "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2",
    course_id: "41f3db50-a051-4940-be6f-7bceffe969b8",
    title: "Engenharia de Custos e Viabilidade de Projetos",
    description: "Composição de custos diretos e indiretos, orçamentação avançada e análise de EVTL.",
    sequence_order: 2,
    slug: "custos-e-viabilidade"
  },
  {
    id: "c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3",
    course_id: "41f3db50-a051-4940-be6f-7bceffe969b8",
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
    description: "Como estruturar um cronograma integrated alinhando metas físicas a desembolsos financeiros.",
    duration: "18:45",
    thumbnail_url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600",
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
    thumbnail_url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200",
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
    thumbnail_url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600",
    instructor_name: "Arq. Mayara Costa",
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
    thumbnail_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400",
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
    thumbnail_url: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=400",
    instructor_name: "Eng. Magno Santos",
    instructor_role: "Mentor Sênior",
    instructor_avatar: "/magno.jpg",
    sequence_order: 2,
    slug: "analise-viabilidade-imobiliaria",
    progress: 0,
    completed: false
  },
  {
    id: "22222222-2222-2222-2222-222222222223",
    module_id: "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2",
    title: "Gestão de Contratos de Obra (EPC/Turnkey)",
    description: "Modelagem contratual, matrizes de riscos e responsabilidades em contratos de construção complexos.",
    duration: "21:05",
    thumbnail_url: "https://images.unsplash.com/photo-1560520653-9e0e4c89fd11?auto=format&fit=crop&q=80&w=400",
    instructor_name: "Eng. Magno Santos",
    instructor_role: "Mentor Sênior",
    instructor_avatar: "/magno.jpg",
    sequence_order: 3,
    slug: "gestao-contratos-obra",
    progress: 0,
    completed: false
  },
  {
    id: "33333333-3333-3333-3333-333333333331",
    module_id: "c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3",
    title: "BIM e Virtual Design in Construction (VDC)",
    description: "Como aplicar fluxos BIM 3D, 4D e 5D para garantir sincronia física e de custos.",
    duration: "15:30",
    thumbnail_url: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&q=80&w=400",
    instructor_name: "Arq. Mayara Costa",
    instructor_role: "Mentor Sênior",
    instructor_avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    sequence_order: 1,
    slug: "bim-vdc-planejamento",
    progress: 0,
    completed: false
  },
  {
    id: "33333333-3333-3333-3333-333333333332",
    module_id: "c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3",
    title: "Industrialização e Pré-fabricados na Obra",
    description: "Estudo comparativo de custos e velocidade executiva com métodos industrializados off-site.",
    duration: "19:20",
    thumbnail_url: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&q=80&w=600",
    instructor_name: "Arq. Mayara Costa",
    instructor_role: "Mentor Sênior",
    instructor_avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    sequence_order: 2,
    slug: "industrializacao-pre-fabricados",
    progress: 0,
    completed: false
  }
];

export default function MasterclassesPage() {
  const router = useRouter();

  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMuted, setIsMuted] = useState(false);

  // Load selected course from URL parameter if present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const cId = params.get("course_id");
      if (cId) {
        setSelectedCourseId(cId);
      }
    }
  }, []);

  const handleSelectCourse = (courseId: string | null) => {
    setSelectedCourseId(courseId);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (courseId) {
        url.searchParams.set("course_id", courseId);
      } else {
        url.searchParams.delete("course_id");
      }
      window.history.pushState({}, "", url.toString());
    }
  };

  // Fetch data on load
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        let dbProgress: any[] = [];
        if (user) {
          const { data: progressData } = await supabase
            .from('user_lesson_progress')
            .select('*')
            .eq('user_id', user.id);
          if (progressData) dbProgress = progressData;
        }

        // Fetch courses
        const { data: dbCourses } = await supabase
          .from('courses')
          .select('*')
          .order('sequence_order', { ascending: true });

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

        let finalCourses = fallbackCourses;
        if (dbCourses && dbCourses.length > 0) {
          finalCourses = dbCourses;
        }

        let finalModules = fallbackModules;
        if (dbModules && dbModules.length > 0) {
          finalModules = dbModules;
        }

        let finalLessons = fallbackLessons;
        if (dbLessons && dbLessons.length > 0) {
          finalLessons = dbLessons.map((l: any) => {
            const prog = dbProgress.find((p) => p.lesson_id === l.id);
            return {
              ...l,
              thumbnail_url: l.cover_image_url || l.thumbnail_url || "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=400",
              progress: prog ? prog.percent_complete : 0,
              completed: prog ? prog.completed : false,
              watched_seconds: prog ? prog.watched_seconds : 0
            };
          });
        }

        setCourses(finalCourses);
        setModules(finalModules);
        setLessons(finalLessons);

      } catch (err) {
        console.error("Erro ao carregar dados do Supabase:", err);
        setCourses(fallbackCourses);
        setModules(fallbackModules);
        setLessons(fallbackLessons);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Handle resetting progress on the active hero lesson
  const handleResetProgress = async (lessonId: string) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLessons(prev => prev.map(l => l.id === lessonId ? { ...l, progress: 0, completed: false } : l));
        alert("Progresso da aula reiniciado localmente!");
        return;
      }

      const { error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          percent_complete: 0,
          completed: false,
          watched_seconds: 0,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setLessons(prev => prev.map(l => l.id === lessonId ? { ...l, progress: 0, completed: false } : l));
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
    return <SkeletonMasterclasses />;
  }

  // Course Statistics Calculator
  const getCourseStats = (courseId: string) => {
    const courseModules = modules.filter(m => m.course_id === courseId);
    const courseLessons = lessons.filter(l => courseModules.some(m => m.id === l.module_id));
    return {
      modulesCount: courseModules.length,
      lessonsCount: courseLessons.length
    };
  };

  // Course Total Progress Calculator
  const getCourseProgress = (courseId: string) => {
    const courseModules = modules.filter(m => m.course_id === courseId);
    const courseLessons = lessons.filter(l => courseModules.some(m => m.id === l.module_id));
    if (courseLessons.length === 0) return 0;
    const completedCount = courseLessons.filter(l => l.completed).length;
    return Math.round((completedCount / courseLessons.length) * 100);
  };

  // 1. FILTERED COURSES (when no course selected)
  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 2. ACTIVE SELECTED COURSE DATA
  const activeCourse = selectedCourseId ? courses.find(c => c.id === selectedCourseId) : null;
  const activeModules = selectedCourseId ? modules.filter(m => m.course_id === selectedCourseId).sort((a, b) => a.sequence_order - b.sequence_order) : [];
  const activeLessons = selectedCourseId ? lessons.filter(l => activeModules.some(m => m.id === l.module_id)) : [];

  // Filtered lessons inside selected course if search is active
  const filteredLessons = activeLessons.filter(l =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Top 5 lessons from the active course
  const rankingIds = [
    "22222222-2222-2222-2222-222222222222",
    "22222222-2222-2222-2222-222222222221",
    "33333333-3333-3333-3333-333333333331",
    "11111111-1111-1111-1111-111111111111",
    "22222222-2222-2222-2222-222222222223"
  ];
  const top5Lessons = rankingIds
    .map(id => activeLessons.find(l => l.id === id))
    .filter(Boolean);

  // Active Hero Lesson calculation
  const inProgress = activeLessons.find((l) => l.progress > 0 && l.progress < 100);
  const firstUnfinished = activeLessons.find((l) => !l.completed);
  const defaultHero = inProgress || firstUnfinished || activeLessons[0];
  
  const currentHeroLesson = defaultHero ? {
    ...defaultHero,
    module_title: activeModules.find(m => m.id === defaultHero.module_id)?.title || "Módulo"
  } : null;

  return (
    <div className="animate-fadeIn" style={{ position: "relative" }}>
      {/* CSS Injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        .netflix-carousel {
          display: flex;
          overflow-x: auto;
          scroll-behavior: smooth;
          gap: 18px;
          padding: 10px 0 20px;
          margin-bottom: 20px;
        }
        .netflix-carousel::-webkit-scrollbar {
          height: 6px;
        }
        .netflix-carousel::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .netflix-carousel::-webkit-scrollbar-thumb:hover {
          background: rgba(237, 192, 102, 0.3);
        }
        .netflix-card {
          flex: 0 0 280px;
          border-radius: 6px;
          overflow: hidden;
          background: linear-gradient(145deg, rgba(7, 7, 50, 0.4) 0%, rgba(19, 19, 22, 0.35) 100%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          display: flex;
          flex-direction: column;
        }
        .netflix-card:hover {
          transform: scale(1.03);
          border-color: rgba(237, 192, 102, 0.3);
        }
        .carousel-container {
          position: relative;
        }
        .carousel-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background-color: rgba(19, 19, 22, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          opacity: 0;
          transition: opacity 0.3s ease, border-color 0.2s, background-color 0.2s;
        }
        .carousel-container:hover .carousel-arrow {
          opacity: 1;
        }
        .carousel-arrow:hover {
          background-color: rgba(237, 192, 102, 0.1);
          border-color: var(--color-secondary);
          color: var(--color-secondary);
        }
        .carousel-arrow-left {
          left: -20px;
        }
        .carousel-arrow-right {
          right: -20px;
        }
        .hero-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background-color: var(--color-secondary);
          color: var(--color-on-secondary);
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 14px 28px;
          border-radius: 4px;
          text-decoration: none;
          transition: all 0.2s ease;
          border: none;
          cursor: pointer;
        }
        .hero-action-btn:hover {
          background-color: var(--color-secondary-fixed-dim);
          box-shadow: 0 0 20px rgba(237, 192, 102, 0.25);
        }
        .control-circle-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.25);
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
        .course-card {
          background: linear-gradient(145deg, rgba(7, 7, 50, 0.4) 0%, rgba(19, 19, 22, 0.35) 100%);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .course-card:hover {
          transform: translateY(-5px);
          border-color: rgba(237, 192, 102, 0.25);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45), 0 0 20px rgba(237, 192, 102, 0.06);
        }
        .course-card-img-wrapper {
          position: relative;
          aspect-ratio: 16/9;
          overflow: hidden;
          background-color: var(--color-surface-container);
        }
        .course-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .course-card:hover .course-card-img {
          transform: scale(1.04);
        }
        .back-nav-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--color-outline);
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          padding: 8px 0;
          margin-bottom: 24px;
          transition: color 0.2s;
        }
        .back-nav-btn:hover {
          color: var(--color-secondary);
        }
      `}} />

      {/* SEARCH AND BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          {selectedCourseId ? (
            <button onClick={() => handleSelectCourse(null)} className="back-nav-btn">
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_back</span>
              Voltar para os Cursos
            </button>
          ) : (
            <>
              <h1 className="font-headline-md" style={{ color: "var(--color-on-surface)", marginBottom: "4px" }}>Masterclasses</h1>
              <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)" }}>Trilhas especializadas do ecossistema de incorporação imobiliária.</p>
            </>
          )}
        </div>

        {/* Search Input Pill */}
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
            placeholder={selectedCourseId ? "Buscar aulas..." : "Buscar cursos..."}
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

      {/* ======================================================== */}
      {/* 1. COURSES GRID VIEW (when selectedCourseId is NULL)    */}
      {/* ======================================================== */}
      {!selectedCourseId && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "28px", marginTop: "20px" }}>
          {filteredCourses.map((course) => {
            const stats = getCourseStats(course.id);
            const progress = getCourseProgress(course.id);
            return (
              <div key={course.id} className="course-card" onClick={() => handleSelectCourse(course.id)}>
                <div className="course-card-img-wrapper">
                  <img
                    src={course.cover_image_url || "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=800"}
                    alt={course.title}
                    className="course-card-img"
                  />
                  {/* Progress Line */}
                  {progress > 0 && (
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "4px", backgroundColor: "rgba(255,255,255,0.15)", zIndex: 4 }}>
                      <div style={{ height: "100%", backgroundColor: "var(--color-secondary)", width: `${progress}%` }} />
                    </div>
                  )}
                </div>
                
                <div style={{ padding: "20px", display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "space-between" }}>
                  <div>
                    <h3 className="font-title-lg" style={{ color: "#ffffff", marginBottom: "8px", fontWeight: 700 }}>
                      {course.title}
                    </h3>
                    <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", marginBottom: "16px", fontSize: "13px", lineHeight: "1.5" }}>
                      {course.description}
                    </p>
                  </div>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "14px", marginTop: "10px" }}>
                    <span style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>
                      {stats.modulesCount} Módulos • {stats.lessonsCount} Aulas
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--color-secondary)", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                      {progress > 0 ? `${progress}% CONCLUÍDO` : "ACESSAR TRILHA"}
                      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>arrow_forward</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredCourses.length === 0 && (
            <div style={{ gridColumn: "span 3", textAlign: "center", padding: "80px 20px", color: "var(--color-outline)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "48px", marginBottom: "12px", opacity: 0.5 }}>movie</span>
              <p>Nenhuma trilha encontrada para a busca realizada.</p>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. SELECTED COURSE VIEW (Modules & Lessons)              */}
      {/* ======================================================== */}
      {selectedCourseId && activeCourse && (
        <div>
          {/* Hero Banner (Only shown if a lesson is available and search is empty) */}
          {currentHeroLesson && searchQuery === "" && (
            <section
              style={{
                margin: "-20px -40px 36px -40px",
                height: "45vh",
                minHeight: "380px",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end"
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url('${currentHeroLesson.thumbnail_url}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center 30%",
                  zIndex: 1
                }}
              />
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
                  Continuar Trilha • {currentHeroLesson.module_title}
                </span>
                <h1
                  className="font-display"
                  style={{
                    fontSize: "36px",
                    fontWeight: 800,
                    color: "#ffffff",
                    lineHeight: 1.1,
                    letterSpacing: "-0.01em"
                  }}
                >
                  {currentHeroLesson.title}
                </h1>

                {currentHeroLesson.progress > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "4px 0" }}>
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
                          backgroundColor: "var(--color-secondary)",
                          width: `${currentHeroLesson.progress}%`
                        }}
                      />
                    </div>
                    <span style={{ fontSize: "10px", color: "var(--color-on-surface-variant)", fontWeight: 600 }}>
                      {currentHeroLesson.progress}% assistido
                    </span>
                  </div>
                )}

                <p
                  className="font-body-md"
                  style={{
                    color: "rgba(255, 255, 255, 0.8)",
                    fontSize: "13px",
                    lineHeight: "1.6",
                    marginTop: "2px"
                  }}
                >
                  {currentHeroLesson.description}
                </p>

                <div style={{ display: "flex", gap: "16px", marginTop: "12px", alignItems: "center" }}>
                  <Link href={`/masterclasses/${currentHeroLesson.id}`} className="hero-action-btn">
                    <span className="material-symbols-outlined" style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}>
                      play_arrow
                    </span>
                    Assistir Aula
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
                  onClick={() => handleResetProgress(currentHeroLesson.id)}
                  className="control-circle-btn"
                  title="Reiniciar Progresso"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>replay</span>
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="control-circle-btn"
                  title={isMuted ? "Ativar Áudio" : "Mutar"}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                    {isMuted ? "volume_off" : "volume_up"}
                  </span>
                </button>
              </div>
            </section>
          )}

          {/* Course Metadata info if Hero is not shown */}
          {(searchQuery !== "" || !currentHeroLesson) && (
            <div style={{ marginBottom: "36px", paddingBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <h2 className="font-headline-sm" style={{ color: "#ffffff", marginBottom: "8px" }}>{activeCourse.title}</h2>
              <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)" }}>{activeCourse.description}</p>
            </div>
          )}

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
                        border: "1px solid rgba(255, 255, 255, 0.08)"
                      }}
                    >
                      <div style={{ width: "100%", height: "100%", position: "relative" }}>
                        <img
                          src={lesson.thumbnail_url}
                          alt={lesson.title}
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

          {/* Modules/Trails Section (Modules do NOT have a cover image) */}
          <h2
            className="font-display"
            style={{
              fontSize: "22px",
              color: "var(--color-on-surface)",
              marginBottom: "24px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              paddingBottom: "12px",
              fontWeight: 700
            }}
          >
            Módulos da Trilha
          </h2>

          {activeModules.map((mod) => {
            const moduleLessons = filteredLessons.filter((l) => l.module_id === mod.id);
            
            if (moduleLessons.length === 0) return null;

            return (
              <section key={mod.id} className="carousel-container" style={{ marginBottom: "36px" }}>
                <h3
                  className="font-title-lg"
                  style={{
                    fontSize: "16px",
                    color: "var(--color-on-surface)",
                    marginBottom: "16px",
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
                        <div style={{ aspectRatio: "16/9", position: "relative", backgroundColor: "var(--color-surface-container)", overflow: "hidden" }}>
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              backgroundImage: `url('${lesson.thumbnail_url}')`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              transition: "transform 0.4s ease"
                            }}
                          />
                          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(19, 19, 22, 0.7) 0%, transparent 100%)" }} />

                          {/* Progress Line */}
                          {lesson.progress > 0 && (
                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "4px", backgroundColor: "rgba(255,255,255,0.2)", zIndex: 4 }}>
                              <div style={{ height: "100%", backgroundColor: "var(--color-secondary)", width: `${lesson.progress}%` }} />
                            </div>
                          )}

                          {/* Duration Badge */}
                          {lesson.duration && (
                            <span
                              style={{
                                position: "absolute",
                                bottom: "8px",
                                right: "8px",
                                backgroundColor: "rgba(0,0,0,0.75)",
                                color: "#ffffff",
                                fontSize: "9px",
                                fontWeight: 700,
                                padding: "2px 6px",
                                borderRadius: "2px",
                                letterSpacing: "0.05em",
                                border: "1px solid rgba(255,255,255,0.1)",
                                zIndex: 3
                              }}
                            >
                              {lesson.duration}
                            </span>
                          )}
                        </div>

                        {/* Card Content info */}
                        <div style={{ padding: "16px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
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
                              fontSize: "12px",
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
          
          {activeModules.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--color-outline)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "48px", marginBottom: "12px", opacity: 0.5 }}>list</span>
              <p>Nenhum módulo ou aula cadastrados para esta masterclass.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
