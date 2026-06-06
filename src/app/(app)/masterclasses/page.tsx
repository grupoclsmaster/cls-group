"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { SkeletonMasterclasses } from "@/components/SkeletonLoading";

export default function MasterclassesPage() {
  const router = useRouter();

  const [courses, setCourses] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

        let finalCourses = dbCourses || [];
        let finalModules = dbModules || [];
        let finalLessons = (dbLessons || []).map((l: any) => {
          const prog = dbProgress.find((p) => p.lesson_id === l.id);
          return {
            ...l,
            completed: prog ? prog.completed : false,
          };
        });

        setCourses(finalCourses);
        setModules(finalModules);
        setLessons(finalLessons);

      } catch (err) {
        console.error("Erro ao carregar dados do Supabase:", err);
        setCourses([]);
        setModules([]);
        setLessons([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

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

  // FILTERED COURSES
  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCourse = (course: any) => {
    router.push(`/masterclasses/curso/${course.slug || course.id}`);
  };

  return (
    <div className="animate-fadeIn" style={{ position: "relative" }}>
      {/* CSS Injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        .course-card {
          background: var(--dropdown-bg);
          border: 1px solid var(--border-color);
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
          border-color: rgba(37, 99, 235, 0.25);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45), 0 0 20px rgba(37, 99, 235, 0.06);
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
      `}} />

      {/* SEARCH AND BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 className="font-headline-md" style={{ color: "var(--color-on-surface)", marginBottom: "4px" }}>Masterclasses</h1>
          <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)" }}>Trilhas especializadas do ecossistema de incorporação imobiliária.</p>
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
            placeholder="Buscar cursos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "220px",
              padding: "10px 16px 10px 42px",
              backgroundColor: "var(--search-input-bg)",
              border: "1px solid var(--search-input-border)",
              borderRadius: "100px",
              color: "var(--color-on-surface)",
              fontSize: "13px",
              outline: "none",
              backdropFilter: "blur(8px)"
            }}
          />
        </div>
      </div>

      {/* COURSES GRID VIEW */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "28px", marginTop: "20px" }}>
        {filteredCourses.map((course) => {
          const stats = getCourseStats(course.id);
          const progress = getCourseProgress(course.id);
          return (
            <div key={course.id} className="course-card" onClick={() => handleSelectCourse(course)}>
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
                  <h3 className="font-title-lg" style={{ color: "var(--color-on-surface)", marginBottom: "8px", fontWeight: 700 }}>
                    {course.title}
                  </h3>
                  <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", marginBottom: "16px", fontSize: "13px", lineHeight: "1.5" }}>
                    {course.description}
                  </p>
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-color)", paddingTop: "14px", marginTop: "10px" }}>
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
    </div>
  );
}
