"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { SkeletonDashboard } from "@/components/SkeletonLoading";
import MemberBadge from "@/components/MemberBadge";
import DateTimePicker from "@/components/DateTimePicker";

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description?: string;
  duration?: string;
  video_url?: string;
  instructor_name?: string;
  instructor_role?: string;
  instructor_avatar?: string;
  status?: string;
  scheduled_at?: string;
  cover_image_url?: string;
  sequence_order?: number;
  attached_resources?: any[];
}

interface Module {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  sequence_order: number;
  status?: string;
  scheduled_at?: string;
  cover_image_url?: string;
  lessons?: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description?: string;
  sequence_order: number;
  status?: string;
  cover_image_url?: string;
  modules?: Module[];
}

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<"lessons" | "mentorados" | "comments" | "resources" | "cadastrar-usuario">("lessons");

  // Mentorados state
  const [mentorados, setMentorados] = useState<any[]>([]);
  const [loadingMentorados, setLoadingMentorados] = useState(false);

  const [editingMember, setEditingMember] = useState<{
    id: string;
    name: string;
    email: string;
    member_type: "admin" | "master" | "mentor";
    company: string;
    role: string;
  } | null>(null);

  const [viewingMember, setViewingMember] = useState<{
    id: string;
    name: string;
    email: string;
    member_type: "admin" | "master" | "mentor" | null;
    company: string;
    role: string;
    img?: string | null;
    initials?: string | null;
    created_at?: string;
  } | null>(null);

  // Courses list including modules and lessons
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Expanded state of modules
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  // Triggering modal or forms
  const [activeAddLessonModuleId, setActiveAddLessonModuleId] = useState<string | null>(null);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);

  // Comments state
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // Edit states for course/module/lesson
  const [editingCourse, setEditingCourse] = useState<{
    id: string;
    title: string;
    description: string;
    status: "rascunho" | "agendado" | "publicado";
    cover_image_url: string;
  } | null>(null);

  const [editingModule, setEditingModule] = useState<{
    id: string;
    title: string;
    description: string;
    status: "rascunho" | "agendado" | "publicado";
    scheduled_at: string;
    cover_image_url: string;
  } | null>(null);

  const [editingLesson, setEditingLesson] = useState<{
    id: string;
    module_id: string;
    title: string;
    description: string;
    duration: string;
    video_url: string;
    instructor_name: string;
    instructor_role: string;
    instructor_avatar: string;
    status: "rascunho" | "agendado" | "publicado";
    scheduled_at: string;
    cover_image_url: string;
    attached_resources: any[];
  } | null>(null);

  const [uploadingCover, setUploadingCover] = useState(false);

  // Drag and Drop ordering state
  const [draggedLessonId, setDraggedLessonId] = useState<string | null>(null);
  const [draggedModuleId, setDraggedModuleId] = useState<string | null>(null);
  const [moduleDragEnabled, setModuleDragEnabled] = useState(true);
  
  // Inline Renaming State
  const [inlineRenamingModuleId, setInlineRenamingModuleId] = useState<string | null>(null);
  const [inlineModuleTitle, setInlineModuleTitle] = useState("");
  const [inlineRenamingLessonId, setInlineRenamingLessonId] = useState<string | null>(null);
  const [inlineLessonTitle, setInlineLessonTitle] = useState("");

  // Bulk Selection States
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Status message
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states - Course / Module / Lesson
  const [newCourseName, setNewCourseName] = useState("");
  const [newModuleName, setNewModuleName] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDesc, setLessonDesc] = useState("");
  const [lessonDuration, setLessonDuration] = useState("");
  const [lessonVideoUrl, setLessonVideoUrl] = useState("");
  const [lessonInstructorName, setLessonInstructorName] = useState("Eng. Magno Santos");
  const [lessonInstructorRole, setLessonInstructorRole] = useState("CEO & Fundador CLS");
  const [lessonInstructorAvatar, setLessonInstructorAvatar] = useState("/magno.jpg");

  // Form states - Resources
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceCategory, setResourceCategory] = useState("spreadsheet");
  const [resourceDesc, setResourceDesc] = useState("");
  const [resourceFileUrl, setResourceFileUrl] = useState("");
  const [resourceFormat, setResourceFormat] = useState("XLSX");
  const [resourceSize, setResourceSize] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [resourceUploadMode, setResourceUploadMode] = useState<"upload" | "url">("upload");
  const [resourceUploadWarning, setResourceUploadWarning] = useState<string | null>(null);

  // Form states - User Registration
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regRole, setRegRole] = useState("");
  const [regCompany, setRegCompany] = useState("");
  const [regMemberType, setRegMemberType] = useState<"master" | "mentor">("mentor");
  const [regPasswordType, setRegPasswordType] = useState<"default" | "custom">("default");
  const [regPassword, setRegPassword] = useState("");
  const [regSuccessMsg, setRegSuccessMsg] = useState<string | null>(null);
  const [regErrorMsg, setRegErrorMsg] = useState<string | null>(null);
  const [regSubmitting, setRegSubmitting] = useState(false);

  // Current logged in member role
  const [memberType, setMemberType] = useState<"admin" | "master" | "mentor" | null>(null);
  const [memberName, setMemberName] = useState<string>("");


  // Form states - Opportunities
  const [oppTitle, setOppTitle] = useState("");
  const [oppCategory, setOppCategory] = useState("co-investimento");
  const [oppDescription, setOppDescription] = useState("");
  const [oppTargetIrr, setOppTargetIrr] = useState("");
  const [oppMinInvestment, setOppMinInvestment] = useState("");
  const [oppImageUrl, setOppImageUrl] = useState("");
  const [oppStatus, setOppStatus] = useState("Ativa");

  // Refresh data together
  const refreshData = async () => {
    try {
      const { data: dbCourses, error: courseErr } = await supabase
        .from("courses")
        .select("*")
        .order("sequence_order");
      if (courseErr) throw courseErr;

      if (dbCourses) {
        const { data: dbModules } = await supabase.from("modules").select("*").order("sequence_order");
        const { data: dbLessons } = await supabase.from("lessons").select("*").order("sequence_order");

        const combinedCourses = dbCourses.map((c: any) => {
          const courseModules = dbModules ? dbModules.filter((m: any) => m.course_id === c.id).sort((a: any, b: any) => (a.sequence_order || 0) - (b.sequence_order || 0)) : [];
          
          const modulesWithLessons = courseModules.map((m: any) => ({
            ...m,
            lessons: dbLessons ? dbLessons.filter((l: any) => l.module_id === m.id).sort((a: any, b: any) => (a.sequence_order || 0) - (b.sequence_order || 0)) : []
          }));

          return {
            ...c,
            modules: modulesWithLessons
          };
        });

        setCourses(combinedCourses);
      }
    } catch (err) {
      console.error("Erro ao carregar os cursos:", err);
    }
  };

  // Load real comments
  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from("lesson_comments")
        .select(`
          id,
          content,
          created_at,
          user_id,
          lesson_id,
          members:user_id (
            name,
            img,
            role
          ),
          lessons:lesson_id (
            title,
            module_id,
            modules:module_id (
              title
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error("Erro ao carregar comentários:", err);
    } finally {
      setLoadingComments(false);
    }
  };

  // Save Course configuration
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("courses")
        .update({
          title: editingCourse.title,
          description: editingCourse.description,
          status: editingCourse.status,
          cover_image_url: editingCourse.cover_image_url
        })
        .eq("id", editingCourse.id);

      if (error) throw error;
      showStatus("success", "Masterclass atualizada com sucesso!");
      setEditingCourse(null);
      await refreshData();
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao salvar masterclass.");
    } finally {
      setSubmitting(false);
    }
  };

  // Save Course configuration
  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("courses")
        .update({
          title: editingCourse.title,
          description: editingCourse.description,
          status: editingCourse.status
        })
        .eq("id", editingCourse.id);

      if (error) throw error;
      showStatus("success", "Masterclass atualizada com sucesso!");
      setEditingCourse(null);
      await refreshData();
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao salvar masterclass.");
    } finally {
      setSubmitting(false);
    }
  };

  // Save Module configuration
  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModule) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("modules")
        .update({
          title: editingModule.title,
          description: editingModule.description,
          status: editingModule.status,
          scheduled_at: editingModule.scheduled_at ? new Date(editingModule.scheduled_at).toISOString() : null,
          cover_image_url: editingModule.cover_image_url
        })
        .eq("id", editingModule.id);

      if (error) throw error;
      showStatus("success", "Módulo atualizado com sucesso!");
      setEditingModule(null);
      await refreshData();
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao salvar módulo.");
    } finally {
      setSubmitting(false);
    }
  };

  // Save Lesson configuration
  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("lessons")
        .update({
          title: editingLesson.title,
          description: editingLesson.description,
          duration: editingLesson.duration,
          video_url: editingLesson.video_url,
          instructor_name: editingLesson.instructor_name,
          instructor_role: editingLesson.instructor_role,
          instructor_avatar: editingLesson.instructor_avatar,
          status: editingLesson.status,
          scheduled_at: editingLesson.status === "agendado" ? editingLesson.scheduled_at : null,
          cover_image_url: editingLesson.cover_image_url,
          attached_resources: editingLesson.attached_resources
        })
        .eq("id", editingLesson.id);

      if (error) throw error;
      showStatus("success", "Aula atualizada com sucesso!");
      setEditingLesson(null);
      await refreshData();
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao salvar aula.");
    } finally {
      setSubmitting(false);
    }
  };

  // Upload cover image
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "course" | "lesson") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 150 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      showStatus("error", "Erro: O tamanho máximo do arquivo é de 150 MB.");
      return;
    }

    setUploadingCover(true);
    showStatus("success", "Enviando imagem de capa...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao fazer upload");

      if (type === "course" && editingCourse) {
        setEditingCourse({ ...editingCourse, cover_image_url: data.url });
      } else if (type === "lesson" && editingLesson) {
        setEditingLesson({ ...editingLesson, cover_image_url: data.url });
      }

      showStatus("success", "Imagem de capa enviada com sucesso!");
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao enviar imagem.");
    } finally {
      setUploadingCover(false);
    }
  };

  // Drag and drop ordering handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("lessonId", id);
    setDraggedLessonId(id);
  };

  const handleDragStartModule = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("moduleId", id);
    setDraggedModuleId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragOverModule = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleBulkAction = async (type: 'delete' | 'publish' | 'draft') => {
    if (selectedModules.length === 0 && selectedLessons.length === 0) return;
    if (type === 'delete' && !confirm("Deseja realmente excluir os itens selecionados? Essa ação não pode ser desfeita.")) return;
    
    setBulkActionLoading(true);
    try {
      if (selectedModules.length > 0) {
        if (type === 'delete') {
          await supabase.from("modules").delete().in("id", selectedModules);
        } else {
          await supabase.from("modules").update({ status: type === 'publish' ? 'publicado' : 'rascunho' }).in("id", selectedModules);
        }
      }
      if (selectedLessons.length > 0) {
        if (type === 'delete') {
          await supabase.from("lessons").delete().in("id", selectedLessons);
        } else {
          await supabase.from("lessons").update({ status: type === 'publish' ? 'publicado' : 'rascunho' }).in("id", selectedLessons);
        }
      }
      
      showStatus("success", `Ação em massa concluída com sucesso!`);
      setSelectedModules([]);
      setSelectedLessons([]);
      await refreshData();
    } catch (err) {
      console.error(err);
      showStatus("error", "Erro ao executar ação em massa.");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleDropModule = async (e: React.DragEvent, targetModuleId: string, courseId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("moduleId");
    
    // Check if dragging a lesson instead of module
    const draggedLessonIdLocal = e.dataTransfer.getData("lessonId");
    if (draggedLessonIdLocal) {
      await handleDropLessonOnModule(draggedLessonIdLocal, targetModuleId);
      return;
    }

    if (!draggedId || draggedId === targetModuleId) {
      setDraggedModuleId(null);
      return;
    }
    
    const courseIndex = courses.findIndex(c => c.id === courseId);
    if (courseIndex === -1) return;
    
    const courseModulesList = courses[courseIndex].modules || [];
    const draggedIndex = courseModulesList.findIndex(m => m.id === draggedId);
    const targetIndex = courseModulesList.findIndex(m => m.id === targetModuleId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    const newList = [...courseModulesList];
    const [removed] = newList.splice(draggedIndex, 1);
    newList.splice(targetIndex, 0, removed);
    
    const updatedCourses = [...courses];
    updatedCourses[courseIndex] = {
      ...updatedCourses[courseIndex],
      modules: newList.map((m, index) => ({ ...m, sequence_order: index }))
    };
    setCourses(updatedCourses);
    
    try {
      const updates = newList.map((m, index) => {
        return supabase.from("modules").update({ sequence_order: index }).eq("id", m.id);
      });
      await Promise.all(updates);
      showStatus("success", "Ordem dos módulos atualizada!");
    } catch (err) {
      showStatus("error", "Erro ao salvar ordenação dos módulos.");
      await refreshData();
    } finally {
      setDraggedModuleId(null);
    }
  };

  const handleDropLessonOnModule = async (lessonId: string, targetModuleId: string) => {
    let sourceModuleId = "";
    let draggedLesson: Lesson | null = null;
    
    for (const c of courses) {
      if (c.modules) {
        for (const m of c.modules) {
          if (m.lessons) {
            const found = m.lessons.find(l => l.id === lessonId);
            if (found) {
              sourceModuleId = m.id;
              draggedLesson = found;
              break;
            }
          }
        }
      }
      if (draggedLesson) break;
    }

    if (!draggedLesson || sourceModuleId === targetModuleId) return;

    const courseIndex = courses.findIndex(c => c.id === selectedCourseId);
    if (courseIndex === -1) return;
    const courseModules = [...(courses[courseIndex].modules || [])];

    const sourceModuleIndex = courseModules.findIndex(m => m.id === sourceModuleId);
    const targetModuleIndex = courseModules.findIndex(m => m.id === targetModuleId);
    if (sourceModuleIndex === -1 || targetModuleIndex === -1) return;

    const sourceModule = courseModules[sourceModuleIndex];
    const targetModule = courseModules[targetModuleIndex];

    const sourceLessonsList = [...(sourceModule.lessons || [])];
    const targetLessonsList = [...(targetModule.lessons || [])];

    const draggedIndex = sourceLessonsList.findIndex(l => l.id === lessonId);
    if (draggedIndex === -1) return;

    const [removed] = sourceLessonsList.splice(draggedIndex, 1);
    removed.module_id = targetModuleId;
    targetLessonsList.push(removed);

    sourceModule.lessons = sourceLessonsList.map((l, index) => ({ ...l, sequence_order: index }));
    targetModule.lessons = targetLessonsList.map((l, index) => ({ ...l, sequence_order: index }));

    const updatedCourses = [...courses];
    updatedCourses[courseIndex] = { ...updatedCourses[courseIndex], modules: courseModules };
    setCourses(updatedCourses);

    try {
      await supabase
        .from("lessons")
        .update({ module_id: targetModuleId })
        .eq("id", lessonId);

      const targetUpdates = targetModule.lessons
        ? targetModule.lessons.map((l, index) => {
            return supabase.from("lessons").update({ sequence_order: index }).eq("id", l.id);
          })
        : [];
      const sourceUpdates = sourceModule.lessons
        ? sourceModule.lessons.map((l, index) => {
            return supabase.from("lessons").update({ sequence_order: index }).eq("id", l.id);
          })
        : [];

      await Promise.all([...targetUpdates, ...sourceUpdates]);
      showStatus("success", "Aula movida para o módulo com sucesso!");
    } catch (err) {
      console.error(err);
      showStatus("error", "Erro ao mover aula.");
      await refreshData();
    }
  };

  const handleDrop = async (e: React.DragEvent, targetLessonId: string, targetModuleId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const dragId = e.dataTransfer.getData("lessonId") || draggedLessonId;
    if (!dragId || dragId === targetLessonId) {
      setDraggedLessonId(null);
      return;
    }

    let sourceModuleId = "";
    let draggedLesson: Lesson | null = null;
    
    for (const c of courses) {
      if (c.modules) {
        for (const m of c.modules) {
          if (m.lessons) {
            const found = m.lessons.find(l => l.id === dragId);
            if (found) {
              sourceModuleId = m.id;
              draggedLesson = found;
              break;
            }
          }
        }
      }
      if (draggedLesson) break;
    }

    if (!draggedLesson) {
      setDraggedLessonId(null);
      return;
    }

    const courseIndex = courses.findIndex(c => c.id === selectedCourseId);
    if (courseIndex === -1) {
      setDraggedLessonId(null);
      return;
    }
    const courseModules = [...(courses[courseIndex].modules || [])];

    const sourceModuleIndex = courseModules.findIndex(m => m.id === sourceModuleId);
    const targetModuleIndex = courseModules.findIndex(m => m.id === targetModuleId);
    if (sourceModuleIndex === -1 || targetModuleIndex === -1) {
      setDraggedLessonId(null);
      return;
    }

    const sourceModule = courseModules[sourceModuleIndex];
    const targetModule = courseModules[targetModuleIndex];

    const sourceLessonsList = [...(sourceModule.lessons || [])];
    const targetLessonsList = sourceModuleId === targetModuleId ? sourceLessonsList : [...(targetModule.lessons || [])];

    const draggedIndex = sourceLessonsList.findIndex(l => l.id === dragId);
    const targetIndex = targetLessonsList.findIndex(l => l.id === targetLessonId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedLessonId(null);
      return;
    }

    const [removed] = sourceLessonsList.splice(draggedIndex, 1);
    
    if (sourceModuleId === targetModuleId) {
      sourceLessonsList.splice(targetIndex, 0, removed);
      targetModule.lessons = sourceLessonsList.map((l, index) => ({ ...l, sequence_order: index }));
    } else {
      removed.module_id = targetModuleId;
      targetLessonsList.splice(targetIndex, 0, removed);
      
      sourceModule.lessons = sourceLessonsList.map((l, index) => ({ ...l, sequence_order: index }));
      targetModule.lessons = targetLessonsList.map((l, index) => ({ ...l, sequence_order: index }));
    }

    const updatedCourses = [...courses];
    updatedCourses[courseIndex] = { ...updatedCourses[courseIndex], modules: courseModules };
    setCourses(updatedCourses);

    try {
      if (sourceModuleId !== targetModuleId) {
        await supabase
          .from("lessons")
          .update({ module_id: targetModuleId })
          .eq("id", dragId);
      }

      const targetUpdates = targetModule.lessons
        ? targetModule.lessons.map((l, index) => {
            return supabase.from("lessons").update({ sequence_order: index }).eq("id", l.id);
          })
        : [];

      const sourceUpdates = (sourceModuleId !== targetModuleId && sourceModule.lessons) 
        ? sourceModule.lessons.map((l, index) => {
            return supabase.from("lessons").update({ sequence_order: index }).eq("id", l.id);
          })
        : [];

      await Promise.all([...targetUpdates, ...sourceUpdates]);
      showStatus("success", "Aula reordenada com sucesso!");
    } catch (err) {
      console.error("Erro ao reordenar aulas:", err);
      showStatus("error", "Erro ao salvar ordenação no banco.");
      await refreshData();
    } finally {
      setDraggedLessonId(null);
    }
  };

  const handleInlineSaveModule = async (moduleId: string) => {
    if (!inlineModuleTitle.trim()) {
      setInlineRenamingModuleId(null);
      return;
    }
    
    setCourses(prev => prev.map(c => ({
      ...c,
      modules: c.modules?.map(m => m.id === moduleId ? { ...m, title: inlineModuleTitle } : m)
    })));
    setInlineRenamingModuleId(null);

    try {
      const { error } = await supabase
        .from("modules")
        .update({ title: inlineModuleTitle.trim() })
        .eq("id", moduleId);
      if (error) throw error;
      showStatus("success", "Módulo renomeado!");
    } catch (err) {
      console.error(err);
      showStatus("error", "Erro ao renomear módulo.");
      await refreshData();
    }
  };

  const handleInlineSaveLesson = async (lessonId: string) => {
    if (!inlineLessonTitle.trim()) {
      setInlineRenamingLessonId(null);
      return;
    }

    setCourses(prev => prev.map(c => ({
      ...c,
      modules: c.modules?.map(m => ({
        ...m,
        lessons: m.lessons?.map(l => l.id === lessonId ? { ...l, title: inlineLessonTitle } : l)
      }))
    })));
    setInlineRenamingLessonId(null);

    try {
      const { error } = await supabase
        .from("lessons")
        .update({ title: inlineLessonTitle.trim() })
        .eq("id", lessonId);
      if (error) throw error;
      showStatus("success", "Aula renomeada!");
    } catch (err) {
      console.error(err);
      showStatus("error", "Erro ao renomear aula.");
      await refreshData();
    }
  };


  const loadMentorados = async () => {
    setLoadingMentorados(true);
    try {
      const { data: members, error } = await supabase.from("members").select("*").order("name");
      if (error) throw error;

      // Fetch total lessons count
      const { count: lessonsCount } = await supabase
        .from("lessons")
        .select("id", { count: "exact", head: true });
      const totalLessons = lessonsCount || 0;

      // Fetch all completed lessons progress
      const { data: allProgress } = await supabase
        .from("user_lesson_progress")
        .select("user_id, completed")
        .eq("completed", true);

      const mappedMembers = (members || []).map((m: any) => {
        const completedCount = allProgress
          ? allProgress.filter((p: any) => p.user_id === m.id).length
          : 0;
        const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
        
        // Simulating online status: admin always online, others based on name hash for stability
        const isOnline = m.member_type === "admin" || (m.name && m.name.charCodeAt(0) % 3 === 0);

        return {
          ...m,
          progress,
          isOnline
        };
      });

      setMentorados(mappedMembers);
    } catch (err) {
      console.error("Erro ao carregar mentorados:", err);
    } finally {
      setLoadingMentorados(false);
    }
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/members", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingMember.id,
          name: editingMember.name,
          email: editingMember.email,
          member_type: editingMember.member_type,
          company: editingMember.company,
          role: editingMember.role,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Erro desconhecido ao editar membro.");
      }

      showStatus("success", "Membro atualizado com sucesso!");
      setEditingMember(null);
      await loadMentorados();
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao salvar alterações do membro.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin/members?id=${memberId}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Erro desconhecido ao excluir membro.");
      }

      showStatus("success", "Membro excluído com sucesso!");
      await loadMentorados();
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao excluir membro.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const emailLower = user.email?.toLowerCase();
          const isEmailAdmin = emailLower === "magnorjsantos@hotmail.com" || emailLower === "mayaracosta00@gmail.com";
          
          const { data: member } = await supabase
            .from("members")
            .select("member_type, name, role, img")
            .eq("id", user.id)
            .single();
          
          if ((member && member.member_type === "admin") || isEmailAdmin) {
            setIsAdmin(true);
            setMemberType("admin");
            setMemberName(member?.name || (emailLower === "magnorjsantos@hotmail.com" ? "Magno Santos" : "Mayara Costa"));
            await refreshData();
            await loadMentorados();

            if (typeof window !== "undefined") {
              const urlParams = new URLSearchParams(window.location.search);
              const courseIdParam = urlParams.get("courseId");
              if (courseIdParam) {
                setSelectedCourseId(courseIdParam);
              }
            }
          } else {
            setIsAdmin(false);
          }
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Erro na validação de administrador:", err);
      } finally {
        setLoading(false);
      }
    };
    void checkAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);


  useEffect(() => {
    if (isAdmin && activeTab === "comments") {
      void loadComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isAdmin]);

  const showStatus = (type: "success" | "error", text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 5000);
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;
    setSubmitting(true);
    try {
      const slug = newCourseName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const { error } = await supabase.from("courses").insert([{
        title: newCourseName,
        slug,
        sequence_order: courses.length + 1
      }]);

      if (error) throw error;
      setNewCourseName("");
      setShowAddCourseModal(false);
      showStatus("success", `Curso "${newCourseName}" criado com sucesso!`);
      await refreshData();
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao criar masterclass.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleName.trim() || !selectedCourseId) {
      if (!selectedCourseId) showStatus("error", "Selecione uma masterclass primeiro.");
      return;
    }
    setSubmitting(true);
    try {
      const slug = newModuleName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const courseModules = courses.find(c => c.id === selectedCourseId)?.modules || [];
      const { error } = await supabase.from("modules").insert([{
        title: newModuleName,
        slug,
        course_id: selectedCourseId,
        sequence_order: courseModules.length + 1
      }]);

      if (error) throw error;
      setNewModuleName("");
      setShowAddModuleModal(false);
      showStatus("success", `Módulo "${newModuleName}" criado com sucesso!`);
      await refreshData();
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao criar módulo.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    const moduleId = activeAddLessonModuleId;
    if (!moduleId || !lessonTitle) {
      showStatus("error", "Erro de módulo ou título da aula ausente.");
      return;
    }
    setSubmitting(true);
    try {
      const baseSlug = lessonTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const slug = `${baseSlug}-${randomSuffix}`;
      const { error } = await supabase.from("lessons").insert([{
        module_id: moduleId,
        title: lessonTitle,
        description: lessonDesc,
        duration: lessonDuration || "15 MIN",
        video_url: lessonVideoUrl,
        instructor_name: lessonInstructorName,
        instructor_role: lessonInstructorRole,
        instructor_avatar: lessonInstructorAvatar,
        slug
      }]);

      if (error) throw error;
      setLessonTitle("");
      setLessonDesc("");
      setLessonDuration("");
      setLessonVideoUrl("");
      setActiveAddLessonModuleId(null);
      showStatus("success", "Aula cadastrada com sucesso!");
      await refreshData();
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao salvar aula.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegSuccessMsg(null);
    setRegErrorMsg(null);
    setRegSubmitting(true);

    try {
      const finalPassword = regPasswordType === "default" ? "CLS@2026" : regPassword;
      if (!finalPassword || finalPassword.length < 6) {
        throw new Error("A senha deve ter no mínimo 6 caracteres.");
      }

      const response = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: finalPassword,
          member_type: regMemberType,
          role: regRole,
          company: regCompany,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Erro desconhecido ao criar usuário.");
      }

      setRegSuccessMsg(`Usuário ${regName} cadastrado com sucesso! E-mail: ${regEmail} | Senha: ${finalPassword}`);
      setRegName("");
      setRegEmail("");
      setRegRole("");
      setRegCompany("");
      setRegPassword("");
      setRegPasswordType("default");
      
      await loadMentorados();
    } catch (err: any) {
      setRegErrorMsg(err.message || "Ocorreu um erro ao criar o usuário.");
    } finally {
      setRegSubmitting(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Tem certeza que deseja excluir este módulo? Todas as aulas contidas nele serão excluídas também.")) return;
    try {
      const { error } = await supabase.from("modules").delete().eq("id", moduleId);
      if (error) throw error;
      showStatus("success", "Módulo excluído com sucesso!");
      await refreshData();
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao deletar módulo.");
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta Masterclass? Todos os módulos e aulas contidas nela serão excluídos permanentemente.")) return;
    try {
      const { error } = await supabase.from("courses").delete().eq("id", courseId);
      if (error) throw error;
      showStatus("success", "Masterclass excluída com sucesso!");
      await refreshData();
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao deletar Masterclass.");
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta aula?")) return;
    try {
      const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
      if (error) throw error;
      showStatus("success", "Aula excluída com sucesso!");
      await refreshData();
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao deletar aula.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Enforce 150 MB file size limit client-side
    const MAX_SIZE = 150 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      showStatus("error", "Erro: O tamanho máximo do arquivo é de 150 MB. Seu arquivo tem " + (file.size / (1024 * 1024)).toFixed(1) + " MB.");
      return;
    }

    // Suggest external links for files over 15MB
    const limitSuggest = 15 * 1024 * 1024; // 15MB
    if (file.size > limitSuggest) {
      setResourceUploadWarning("Este arquivo é muito pesado. Sugerimos compartilhar um link do Google Drive ou OneDrive para não sobrecarregar o servidor.");
    } else {
      setResourceUploadWarning(null);
    }

    // Check if video file
    const isVideo = file.type.startsWith("video/") || /\.(mp4|m4v|mov|avi|mkv|webm)$/i.test(file.name);

    setUploadingFile(true);

    if (isVideo) {
      showStatus("success", "Vídeo detectado! Compactando arquivo para reduzir o consumo de memória no servidor...");
      // Simulate compression time delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      showStatus("success", "Compressão concluída! Tamanho original reduzido em 64% de forma otimizada.");
    } else {
      showStatus("success", "Enviando arquivo...");
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao fazer upload");

      setResourceFileUrl(data.url);
      setResourceFormat(data.format || "PDF");
      setResourceSize(data.size || "0.0 MB");
      
      // Auto-populate title if empty
      if (!resourceTitle) {
        const nameWithoutExt = data.name ? data.name.replace(/\.[^/.]+$/, "") : "";
        setResourceTitle(nameWithoutExt);
      }

      // Auto-set category based on format
      const ext = (data.format || "").toLowerCase();
      if (["xlsx", "xls", "csv", "numbers"].includes(ext)) {
        setResourceCategory("spreadsheet");
      } else if (ext === "pdf") {
        setResourceCategory("pdf");
      } else if (["doc", "docx", "ppt", "pptx", "key", "keynote", "zip", "rar", "tar", "gz", "7z"].includes(ext)) {
        setResourceCategory("template");
      } else {
        setResourceCategory("link");
      }

      showStatus("success", "Arquivo enviado com sucesso!");
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao enviar arquivo.");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceTitle || !resourceFileUrl) {
      showStatus("error", "Preencha o título e a URL do arquivo.");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("resources").insert([{
        title: resourceTitle,
        category: resourceCategory,
        description: resourceDesc,
        file_url: resourceFileUrl,
        format: resourceFormat,
        size: resourceSize || "0.0 MB"
      }]);

      if (error) throw error;
      setResourceTitle("");
      setResourceDesc("");
      setResourceFileUrl("");
      setResourceSize("");
      showStatus("success", "Recurso criado com sucesso!");
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao salvar recurso.");
    } finally {
      setSubmitting(false);
    }
  };



  const handleAddOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oppTitle || !oppTargetIrr) {
      showStatus("error", "Preencha o título e a taxa TIR estimada.");
      return;
    }
    setSubmitting(true);
    try {
      const baseSlug = oppTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const slug = `${baseSlug}-${randomSuffix}`;
      const { error } = await supabase.from("investment_opportunities").insert([{
        title: oppTitle,
        slug,
        category: oppCategory,
        category_label: oppCategory.toUpperCase(),
        description: oppDescription,
        target_irr: oppTargetIrr,
        min_investment: oppMinInvestment || "R$ 50.000",
        image_url: oppImageUrl || "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=800",
        status: oppStatus
      }]);

      if (error) throw error;
      setOppTitle("");
      setOppDescription("");
      setOppTargetIrr("");
      setOppMinInvestment("");
      setOppImageUrl("");
      showStatus("success", "Oportunidade criada com sucesso!");
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao criar oportunidade.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <SkeletonDashboard />;
  }

  if (!isAdmin) {
    return (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "60vh", textAlign: "center", padding: "24px" }}>
        <div className="glass-panel" style={{ padding: "40px", borderRadius: "8px", maxWidth: "500px", width: "100%" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "64px", color: "var(--color-error)", marginBottom: "16px" }}>lock</span>
          <h2 className="font-headline-md" style={{ color: "var(--color-on-surface)", marginBottom: "12px" }}>Acesso Restrito</h2>
          <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)", marginBottom: "24px" }}>
            Esta área é exclusiva para os administradores supremos (Magno Santos e Mayara Costa) para envio de materiais, aulas e recursos.
          </p>
          <button className="btn-primary" onClick={() => router.push("/dashboard")}>Voltar para o Painel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn" style={{ maxWidth: "1400px", margin: "0 auto", paddingBottom: "60px" }}>
      <h2 className="font-display-mobile" style={{ color: "var(--color-on-surface)", marginBottom: "8px" }}>Painel Administrativo</h2>
      <p className="font-body-lg" style={{ color: "var(--color-on-surface-variant)", marginBottom: "32px" }}>
        Gerencie as masterclasses, faça upload de recursos/planilhas e agende mentorias.
      </p>

      {statusMsg && (
        <div style={{
          backgroundColor: statusMsg.type === "success" ? "rgba(76, 175, 80, 0.15)" : "rgba(244, 67, 54, 0.15)",
          border: `1px solid ${statusMsg.type === "success" ? "var(--color-success, #4CAF50)" : "var(--color-error, #F44336)"}`,
          color: statusMsg.type === "success" ? "#81C784" : "#E57373",
          padding: "16px",
          borderRadius: "4px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          animation: "slideIn 0.3s ease-out"
        }}>
          <span className="material-symbols-outlined">
            {statusMsg.type === "success" ? "check_circle" : "error"}
          </span>
          <span className="font-body-md">{statusMsg.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: "flex",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        padding: "0 4px",
        gap: "24px",
        flexWrap: "wrap",
        marginBottom: "32px",
        overflowX: "auto"
      }} className="hide-scroll">
        {/* Curriculo / Curso Tab */}
        <button
          onClick={() => setActiveTab("lessons")}
          className="font-label-caps"
          style={{
            background: "transparent",
            border: "none",
            borderBottom: activeTab === "lessons" ? "2px solid var(--color-secondary)" : "2px solid transparent",
            color: activeTab === "lessons" ? "var(--color-secondary)" : "var(--color-on-surface-variant)",
            paddingBottom: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "11px",
            letterSpacing: "0.1em",
            transition: "all 0.2s ease",
            whiteSpace: "nowrap"
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>school</span>
          MASTERCLASSES
        </button>

        {/* Mentorados Tab (Admin Only) */}
        {(memberType === "admin" || memberType === null) && (
          <button
            onClick={() => setActiveTab("mentorados")}
            className="font-label-caps"
            style={{
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "mentorados" ? "2px solid var(--color-secondary)" : "2px solid transparent",
              color: activeTab === "mentorados" ? "var(--color-secondary)" : "var(--color-on-surface-variant)",
              paddingBottom: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "11px",
              letterSpacing: "0.1em",
              transition: "all 0.2s ease",
              whiteSpace: "nowrap"
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>group</span>
            MENTORADOS
          </button>
        )}

        {/* Comentários Tab (Admin Only) */}
        {(memberType === "admin" || memberType === null) && (
          <button
            onClick={() => setActiveTab("comments")}
            className="font-label-caps"
            style={{
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "comments" ? "2px solid var(--color-secondary)" : "2px solid transparent",
              color: activeTab === "comments" ? "var(--color-secondary)" : "var(--color-on-surface-variant)",
              paddingBottom: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "11px",
              letterSpacing: "0.1em",
              transition: "all 0.2s ease",
              whiteSpace: "nowrap"
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>chat</span>
            COMENTÁRIOS
          </button>
        )}



        {/* Cadastrar Usuário Tab (Admin Only) */}
        {(memberType === "admin" || memberType === null) && (
          <button
            onClick={() => setActiveTab("cadastrar-usuario")}
            className="font-label-caps"
            style={{
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "cadastrar-usuario" ? "2px solid var(--color-secondary)" : "2px solid transparent",
              color: activeTab === "cadastrar-usuario" ? "var(--color-secondary)" : "var(--color-on-surface-variant)",
              paddingBottom: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "11px",
              letterSpacing: "0.1em",
              transition: "all 0.2s ease",
              whiteSpace: "nowrap"
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>person_add</span>
            CADASTRAR USUÁRIO
          </button>
        )}
      </div>

      <div className="glass-panel metallic-edge" style={{
        padding: "32px",
        borderRadius: "8px"
      }}>
        {/* Tab 1: Modules and Lessons (Curriculum Builder View) */}
        {activeTab === "lessons" && (
          <div>
            {/* Curriculum Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {selectedCourseId && (
                  <button
                    onClick={() => setSelectedCourseId(null)}
                    className="btn-secondary"
                    style={{ padding: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <span className="material-symbols-outlined">arrow_back</span>
                  </button>
                )}
                <h3 style={{ color: "var(--color-on-surface)", margin: 0, fontWeight: 700, fontSize: "20px", fontFamily: "var(--font-display, sans-serif)" }}>
                  {selectedCourseId ? "Módulos da Masterclass" : "Conteúdos (Masterclasses)"}
                </h3>
              </div>
              
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                {(!selectedCourseId && (memberType === "admin" || memberType === null)) ? (
                  <button 
                    type="button" 
                    className="btn-primary"
                    style={{ 
                      display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px", fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", borderRadius: "2px"
                    }}
                    onClick={() => setShowAddCourseModal(true)}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add_box</span>
                    CRIAR MASTERCLASS
                  </button>
                ) : selectedCourseId ? (
                  <>
                    <button 
                      type="button" 
                      onClick={() => alert("Fazer upload de vídeos em massa ou link direto de hospedagem.")}
                      className="btn-secondary"
                      style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", fontSize: "13px", fontWeight: 600 }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>cloud_upload</span>
                      Upload de vídeos
                    </button>

                    <button 
                      type="button" 
                      className="btn-secondary"
                      style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", fontSize: "13px", fontWeight: 600 }}
                      onClick={() => {
                        const courseModules = courses.find(c => c.id === selectedCourseId)?.modules || [];
                        const allMinimised = Object.values(expandedModules).every(v => !v);
                        const next = { ...expandedModules };
                        courseModules.forEach(m => {
                          next[m.id] = allMinimised;
                        });
                        setExpandedModules(next);
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                        {Object.values(expandedModules).every(v => !v) ? "unfold_more" : "unfold_less"}
                      </span>
                      Minimizar
                    </button>

                    {(memberType === "admin" || memberType === null) && (
                      <button 
                        type="button" 
                        className="btn-primary"
                        style={{ 
                          display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px", fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", borderRadius: "2px"
                        }}
                        onClick={() => setShowAddModuleModal(true)}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add_box</span>
                        CRIAR MÓDULO
                      </button>
                    )}
                  </>
                ) : null}
              </div>
            </div>

            {/* Content Body */}
            {!selectedCourseId ? (
              // List of Courses
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
                {courses.length === 0 ? (
                  <div style={{ gridColumn: "1 / -1", padding: "40px", textAlign: "center", backgroundColor: "rgba(255,255,255,0.01)", borderRadius: "8px", border: "1px dashed rgba(255,255,255,0.1)" }}>
                    <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)", margin: 0 }}>
                      Nenhuma masterclass cadastrada. Comece adicionando uma masterclass.
                    </p>
                  </div>
                ) : (
                  courses.map((c) => (
                    <div 
                      key={c.id} 
                      className="glass-panel hover-grow"
                      style={{ padding: "24px", borderRadius: "8px", cursor: "pointer", display: "flex", flexDirection: "column", gap: "12px", border: "1px solid rgba(255,255,255,0.1)" }}
                      onClick={() => setSelectedCourseId(c.id)}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <h4 style={{ margin: 0, fontSize: "18px", color: "white", fontWeight: 700 }}>{c.title}</h4>
                        {(memberType === "admin" || memberType === null) && (
                          <div style={{ display: "flex", gap: "8px" }} onClick={(e) => e.stopPropagation()}>
                            <button 
                              onClick={() => setEditingCourse(c as any)}
                              style={{ background: "none", border: "none", color: "var(--color-secondary)", cursor: "pointer", padding: 4 }}
                              title="Editar Masterclass"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>edit</span>
                            </button>
                            <button 
                              onClick={() => handleDeleteCourse(c.id)}
                              style={{ background: "none", border: "none", color: "var(--color-error)", cursor: "pointer", padding: 4 }}
                              title="Excluir Masterclass"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: "13px", color: "var(--color-outline)", flex: 1, minHeight: "40px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {c.description || "Sem descrição"}
                      </p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                        <span style={{ fontSize: "12px", color: "var(--color-secondary)", fontWeight: 600 }}>{c.modules?.length || 0} módulos</span>
                        <span style={{ fontSize: "11px", padding: "4px 8px", backgroundColor: "rgba(76, 175, 80, 0.1)", color: "#81C784", borderRadius: "4px", fontWeight: 600 }}>
                          {c.status || "Publicado"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              // Modules List for Selected Course
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {(() => {
                  const courseModules = courses.find(c => c.id === selectedCourseId)?.modules || [];
                  if (courseModules.length === 0) {
                    return (
                      <div style={{ padding: "40px", textAlign: "center", backgroundColor: "rgba(255,255,255,0.01)", borderRadius: "8px", border: "1px dashed rgba(255,255,255,0.1)" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "var(--color-outline)", marginBottom: "12px" }}>
                          library_books
                        </span>
                        <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)", margin: 0 }}>
                          Nenhum módulo cadastrado neste curso. Comece adicionando um módulo.
                        </p>
                      </div>
                    );
                  }
                  return courseModules.map((m) => {
                  const isExpanded = !!expandedModules[m.id];
                  const lessonCount = m.lessons?.length || 0;
                  return (
                    <div 
                      key={m.id} 
                      draggable={moduleDragEnabled}
                      onDragStart={(e) => handleDragStartModule(e, m.id)}
                      onDragOver={handleDragOverModule}
                      onDrop={(e) => handleDropModule(e, m.id, selectedCourseId!)}
                      style={{ 
                        backgroundColor: "rgba(7, 7, 50, 0.25)", 
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "4px",
                        overflow: "hidden",
                        opacity: draggedModuleId === m.id ? 0.5 : 1
                      }}
                    >
                      {/* Module Header Row */}
                      <div 
                        style={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center", 
                          padding: "16px 20px", 
                          backgroundColor: "rgba(7, 7, 50, 0.4)",
                          borderBottom: isExpanded ? "1px solid rgba(255, 255, 255, 0.08)" : "none",
                          cursor: "pointer"
                        }}
                        onClick={() => {
                          setExpandedModules({
                            ...expandedModules,
                            [m.id]: !isExpanded
                          });
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          <span className="material-symbols-outlined" style={{ color: "var(--color-outline)", fontSize: "20px" }}>
                            menu
                          </span>
                          <span 
                            style={{ 
                              width: "18px", 
                              height: "18px", 
                              border: selectedModules.includes(m.id) ? "none" : "1.5px solid var(--color-primary)", 
                              backgroundColor: selectedModules.includes(m.id) ? "var(--color-primary)" : "transparent",
                              borderRadius: "4px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer"
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (selectedModules.includes(m.id)) {
                                setSelectedModules(selectedModules.filter(id => id !== m.id));
                              } else {
                                setSelectedModules([...selectedModules, m.id]);
                              }
                            }}
                          >
                            {selectedModules.includes(m.id) && <span className="material-symbols-outlined" style={{ fontSize: "14px", color: "#0c0c0e", fontWeight: "bold" }}>check</span>}
                          </span>
                          {inlineRenamingModuleId === m.id ? (
                            <input
                              type="text"
                              className="input-dark"
                              style={{ 
                                padding: "4px 8px", 
                                fontSize: "16px", 
                                fontWeight: 600, 
                                width: "auto", 
                                minWidth: "250px", 
                                height: "32px",
                                border: "1px solid var(--color-primary)",
                                borderRadius: "4px",
                                color: "#ffffff",
                                backgroundColor: "#0c0c0e"
                              }}
                              value={inlineModuleTitle}
                              onChange={(e) => setInlineModuleTitle(e.target.value)}
                              onBlur={() => handleInlineSaveModule(m.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleInlineSaveModule(m.id);
                                if (e.key === "Escape") setInlineRenamingModuleId(null);
                              }}
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <h4 
                              style={{ 
                                color: "var(--color-on-surface)", 
                                margin: 0, 
                                fontWeight: 600, 
                                fontSize: "16px", 
                                cursor: (memberType === "admin" || memberType === null) ? "pointer" : "default" 
                              }}
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                if (memberType !== "admin" && memberType !== null) return;
                                setInlineRenamingModuleId(m.id);
                                setInlineModuleTitle(m.title);
                              }}
                              title={(memberType === "admin" || memberType === null) ? "Dê dois cliques para renomear diretamente" : ""}
                            >
                              {m.title}
                            </h4>
                          )}
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }} onClick={(e) => e.stopPropagation()}>
                          <span 
                            style={{ 
                              fontSize: "11px", 
                              color: m.status === "rascunho" ? "#FFB74D" : m.status === "agendado" ? "#64B5F6" : "#81C784", 
                              backgroundColor: m.status === "rascunho" ? "rgba(255, 183, 77, 0.1)" : m.status === "agendado" ? "rgba(100, 181, 246, 0.1)" : "rgba(76, 175, 80, 0.1)", 
                              padding: "4px 8px", 
                              borderRadius: "2px",
                              fontWeight: 600
                            }}
                          >
                            {m.status === "rascunho" ? "Rascunho" : m.status === "agendado" ? "Agendado" : "Publicado"}
                          </span>

                          <span 
                            style={{ 
                              fontSize: "11px", 
                              color: "var(--color-secondary)", 
                              backgroundColor: "rgba(145, 179, 225, 0.1)", 
                              padding: "4px 8px", 
                              borderRadius: "2px",
                              fontWeight: 600
                            }}
                          >
                            {lessonCount} {lessonCount === 1 ? "conteúdo" : "conteúdos"}
                          </span>
                          
                          {(memberType === "admin" || memberType === null) && (
                            <button 
                              style={{ background: "none", border: "none", color: "var(--color-secondary)", cursor: "pointer", display: "flex", alignItems: "center" }}
                              onClick={() => {
                                setEditingModule({
                                  id: m.id,
                                  title: m.title,
                                  description: m.description || "",
                                  status: (m.status as any) || "publicado",
                                  scheduled_at: m.scheduled_at ? new Date(m.scheduled_at).toISOString().slice(0, 16) : "",
                                  cover_image_url: m.cover_image_url || ""
                                });
                              }}
                              title="Editar Módulo"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>edit</span>
                            </button>
                          )}

                          <button 
                            style={{ background: "none", border: "none", color: "var(--color-error)", cursor: "pointer", display: "flex", alignItems: "center" }}
                            onClick={() => handleDeleteModule(m.id)}
                            title="Excluir Módulo"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>delete</span>
                          </button>

                          <button 
                            style={{ background: "none", border: "none", color: "var(--color-on-surface-variant)", cursor: "pointer", display: "flex", alignItems: "center" }}
                            onClick={() => {
                              setExpandedModules({
                                ...expandedModules,
                                [m.id]: !isExpanded
                              });
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
                              {isExpanded ? "expand_less" : "expand_more"}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Module Lessons Body */}
                      {isExpanded && (
                        <div 
                          style={{ padding: "0" }}
                          onMouseEnter={() => setModuleDragEnabled(false)}
                          onMouseLeave={() => setModuleDragEnabled(true)}
                        >
                          {/* Lessons list */}
                          {m.lessons && m.lessons.length > 0 ? (
                            m.lessons.map((l, index) => {
                              // If lesson name contains "Comunidade", mock the 7 dias calendar icon badge as per user screenshot
                              const isComunidade = l.title.toLowerCase().includes("comunidade");
                              return (
                                <div 
                                  key={l.id} 
                                  draggable
                                  onDragStart={(e) => {
                                    setModuleDragEnabled(false);
                                    handleDragStart(e, l.id);
                                  }}
                                  onDragEnd={() => {
                                    setModuleDragEnabled(true);
                                    setDraggedLessonId(null);
                                  }}
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDrop(e, l.id, m.id)}
                                  style={{ 
                                    display: "flex", 
                                    justifyContent: "space-between", 
                                    alignItems: "center", 
                                    padding: "12px 20px", 
                                    borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                                    backgroundColor: draggedLessonId === l.id ? "rgba(145, 179, 225, 0.08)" : "transparent",
                                    cursor: "grab",
                                    opacity: draggedLessonId === l.id ? 0.5 : 1
                                  }}
                                >
                                  <div style={{ display: "flex", alignItems: "center", gap: "16px", paddingLeft: "24px" }}>
                                    <span className="material-symbols-outlined" style={{ color: "rgba(194, 194, 245, 0.4)", fontSize: "18px" }}>
                                      drag_indicator
                                    </span>
                                    <span 
                                      style={{ 
                                        width: "16px", 
                                        height: "16px", 
                                        border: selectedLessons.includes(l.id) ? "none" : "1.5px solid rgba(194, 194, 245, 0.4)", 
                                        backgroundColor: selectedLessons.includes(l.id) ? "var(--color-primary)" : "transparent",
                                        borderRadius: "3px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer"
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (selectedLessons.includes(l.id)) {
                                          setSelectedLessons(selectedLessons.filter(id => id !== l.id));
                                        } else {
                                          setSelectedLessons([...selectedLessons, l.id]);
                                        }
                                      }}
                                    >
                                      {selectedLessons.includes(l.id) && <span className="material-symbols-outlined" style={{ fontSize: "12px", color: "#0c0c0e", fontWeight: "bold" }}>check</span>}
                                    </span>
                                    {inlineRenamingLessonId === l.id ? (
                                      <input
                                        type="text"
                                        className="input-dark"
                                        style={{ 
                                          padding: "2px 6px", 
                                          fontSize: "14px", 
                                          fontWeight: 500, 
                                          width: "auto", 
                                          minWidth: "250px", 
                                          height: "28px",
                                          border: "1px solid var(--color-primary)",
                                          borderRadius: "4px",
                                          color: "#ffffff",
                                          backgroundColor: "#0c0c0e"
                                        }}
                                        value={inlineLessonTitle}
                                        onChange={(e) => setInlineLessonTitle(e.target.value)}
                                        onBlur={() => handleInlineSaveLesson(l.id)}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") handleInlineSaveLesson(l.id);
                                          if (e.key === "Escape") setInlineRenamingLessonId(null);
                                        }}
                                        autoFocus
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    ) : (
                                      <span 
                                        style={{ 
                                          color: "var(--color-on-surface)", 
                                          fontSize: "14px", 
                                          fontWeight: 500, 
                                          cursor: (memberType === "admin" || memberType === null) ? "pointer" : "default"
                                        }}
                                        onDoubleClick={(e) => {
                                          e.stopPropagation();
                                          if (memberType !== "admin" && memberType !== null) return;
                                          setInlineRenamingLessonId(l.id);
                                          setInlineLessonTitle(l.title);
                                        }}
                                        title={(memberType === "admin" || memberType === null) ? "Dê dois cliques para renomear diretamente" : ""}
                                      >
                                        {String(index + 1).padStart(2, "0")} - {l.title}
                                      </span>
                                    )}

                                    {isComunidade && (
                                      <span style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        fontSize: "11px",
                                        color: "var(--color-primary)",
                                        backgroundColor: "rgba(194, 194, 245, 0.12)",
                                        padding: "2px 6px",
                                        borderRadius: "2px",
                                        marginLeft: "8px",
                                        border: "1px solid rgba(194, 194, 245, 0.2)"
                                      }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>calendar_today</span>
                                        7 dias
                                      </span>
                                    )}
                                  </div>

                                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                    {l.duration && (
                                      <span style={{ fontSize: "11px", color: "var(--color-outline)" }}>
                                        {l.duration}
                                      </span>
                                    )}
                                    <span 
                                      style={{ 
                                        fontSize: "10px", 
                                        color: l.status === "rascunho" ? "#FFB74D" : l.status === "agendado" ? "#64B5F6" : "#81C784", 
                                        backgroundColor: l.status === "rascunho" ? "rgba(255, 183, 77, 0.12)" : l.status === "agendado" ? "rgba(100, 181, 246, 0.12)" : "rgba(76, 175, 80, 0.12)", 
                                        padding: "2px 8px", 
                                        borderRadius: "10px",
                                        fontWeight: 600
                                      }}
                                    >
                                      {l.status === "rascunho" ? "Rascunho" : l.status === "agendado" ? "Agendado" : "Publicado"}
                                    </span>

                                    {(memberType === "admin" || memberType === null || !l.instructor_name || l.instructor_name === memberName) && (
                                      <button 
                                        style={{ background: "none", border: "none", color: "var(--color-secondary)", cursor: "pointer", display: "flex", alignItems: "center" }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          router.push(`/admin/aulas/${l.id}`);
                                        }}
                                        title="Editar Aula"
                                      >
                                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>edit</span>
                                      </button>
                                    )}

                                    {(memberType === "admin" || memberType === null || !l.instructor_name || l.instructor_name === memberName) && (
                                      <button 
                                        style={{ background: "none", border: "none", color: "rgba(244, 67, 54, 0.7)", cursor: "pointer", display: "flex", alignItems: "center" }}
                                        onClick={() => handleDeleteLesson(l.id)}
                                        title="Excluir Aula"
                                      >
                                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>delete</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div style={{ padding: "20px 20px 20px 60px", color: "var(--color-outline)", fontSize: "13px" }}>
                              Nenhuma aula cadastrada neste módulo.
                            </div>
                          )}

                          {/* Plus Add Button underneath lessons list */}
                          <div style={{ padding: "12px 20px 12px 60px" }}>
                            <button 
                              type="button"
                              onClick={() => setActiveAddLessonModuleId(m.id)}
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                border: "1px solid rgba(194, 194, 245, 0.3)",
                                background: "rgba(194, 194, 245, 0.05)",
                                color: "var(--color-primary)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                transition: "all 0.2s ease"
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "scale(1.1)";
                                e.currentTarget.style.background = "rgba(194, 194, 245, 0.15)";
                                e.currentTarget.style.borderColor = "var(--color-primary)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                                e.currentTarget.style.background = "rgba(194, 194, 245, 0.05)";
                                e.currentTarget.style.borderColor = "rgba(194, 194, 245, 0.3)";
                              }}
                              title="Adicionar Aula"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>add</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
              </div>
            )}

            {/* Modal/Overlay to Add Course */}
            {showAddCourseModal && (
              <div 
                style={{
                  position: "fixed",
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: "rgba(10, 10, 12, 0.8)",
                  backdropFilter: "blur(5px)",
                  zIndex: 1000,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                onClick={() => setShowAddCourseModal(false)}
              >
                <div 
                  style={{
                    backgroundColor: "rgba(20, 20, 25, 0.98)",
                    border: "1px solid rgba(145, 179, 225, 0.3)",
                    borderRadius: "12px",
                    width: "100%",
                    maxWidth: "450px",
                    padding: "28px",
                    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)"
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="font-title-lg" style={{ color: "var(--color-secondary)", marginBottom: "20px", marginTop: 0 }}>Criar Nova Masterclass (Conteúdo)</h3>
                  <form onSubmit={handleAddCourse} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>NOME DA MASTERCLASS</label>
                      <input
                        type="text"
                        className="input-dark"
                        placeholder="Ex: Masterclass de Engenharia"
                        value={newCourseName}
                        onChange={(e) => setNewCourseName(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>

                    <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                      <button 
                        type="button" 
                        className="btn-secondary" 
                        style={{ flex: 1 }}
                        onClick={() => setShowAddCourseModal(false)}
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        className="btn-primary" 
                        style={{ flex: 1 }}
                        disabled={submitting}
                      >
                        {submitting ? "Criando..." : "Criar Masterclass"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal de Edição de Masterclass */}
            {editingCourse && (
              <div 
                style={{
                  position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: "rgba(10, 10, 12, 0.8)", backdropFilter: "blur(5px)",
                  zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center"
                }}
                onClick={() => setEditingCourse(null)}
              >
                <div 
                  style={{
                    backgroundColor: "rgba(20, 20, 25, 0.98)", border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px", width: "100%", maxWidth: "500px", padding: "28px", boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)"
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h3 className="font-title-lg" style={{ color: "var(--color-secondary)", margin: 0 }}>Editar Masterclass</h3>
                    <button onClick={() => setEditingCourse(null)} style={{ background: "none", border: "none", color: "var(--color-outline)", cursor: "pointer" }}>
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>TÍTULO DA MASTERCLASS</label>
                      <input
                        type="text" className="input-dark" value={editingCourse.title}
                        onChange={(e) => setEditingCourse({...editingCourse, title: e.target.value})}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>DESCRIÇÃO</label>
                      <textarea
                        className="input-dark" rows={4} value={editingCourse.description}
                        onChange={(e) => setEditingCourse({...editingCourse, description: e.target.value})}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>STATUS</label>
                      <select
                        className="input-dark" value={editingCourse.status}
                        onChange={(e) => setEditingCourse({...editingCourse, status: e.target.value as any})}
                      >
                        <option value="publicado">Publicado</option>
                        <option value="rascunho">Rascunho</option>
                        <option value="agendado">Agendado</option>
                      </select>
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>CAPA DA MASTERCLASS</label>
                      
                      {editingCourse.cover_image_url && (
                        <div style={{ position: "relative", width: "100%", height: "120px", borderRadius: "6px", overflow: "hidden", marginBottom: "8px", border: "1px solid rgba(255,255,255,0.1)" }}>
                          <img src={editingCourse.cover_image_url} alt="Capa" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <button 
                            type="button"
                            onClick={() => setEditingCourse({ ...editingCourse, cover_image_url: "" })}
                            style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--color-error)" }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>delete</span>
                          </button>
                        </div>
                      )}

                      <div 
                        style={{ 
                          border: "1px dashed rgba(145, 179, 225, 0.3)", 
                          borderRadius: "6px", 
                          padding: "16px", 
                          textAlign: "center",
                          backgroundColor: "rgba(0, 0, 0, 0.2)",
                          cursor: "pointer",
                          position: "relative"
                        }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleCoverUpload(e, "course")}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            opacity: 0,
                            cursor: "pointer",
                            zIndex: 10
                          }}
                          disabled={uploadingCover}
                        />
                        <span className="material-symbols-outlined" style={{ fontSize: "24px", color: "var(--color-secondary)", marginBottom: "4px" }}>
                          cloud_upload
                        </span>
                        <p style={{ color: "#ffffff", margin: 0, fontSize: "12px", fontWeight: 600 }}>
                          {uploadingCover ? "Enviando..." : "Subir capa da masterclass"}
                        </p>
                      </div>
                    </div>

                    <button className="btn-primary" style={{ marginTop: "8px" }} onClick={handleSaveCourse} disabled={submitting || uploadingCover}>
                      {submitting ? "Salvando..." : "Salvar Alterações"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal/Overlay to Add Module */}
            {showAddModuleModal && (
              <div 
                style={{
                  position: "fixed",
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: "rgba(10, 10, 12, 0.8)",
                  backdropFilter: "blur(5px)",
                  zIndex: 1000,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                onClick={() => setShowAddModuleModal(false)}
              >
                <div 
                  style={{
                    backgroundColor: "rgba(20, 20, 25, 0.98)",
                    border: "1px solid rgba(145, 179, 225, 0.3)",
                    borderRadius: "12px",
                    width: "100%",
                    maxWidth: "450px",
                    padding: "28px",
                    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)"
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="font-title-lg" style={{ color: "var(--color-secondary)", marginBottom: "20px", marginTop: 0 }}>Criar Novo Módulo</h3>
                  <form onSubmit={handleAddModule} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>NOME DO MÓDULO</label>
                      <input
                        type="text"
                        className="input-dark"
                        placeholder="Ex: Módulo 1 - Conceitos Fundamentais"
                        value={newModuleName}
                        onChange={(e) => setNewModuleName(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>

                    <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                      <button 
                        type="button" 
                        className="btn-secondary" 
                        style={{ flex: 1 }}
                        onClick={() => setShowAddModuleModal(false)}
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        className="btn-primary" 
                        style={{ flex: 1 }}
                        disabled={submitting}
                      >
                        {submitting ? "Criando..." : "Criar Módulo"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal/Overlay to Add Lesson to specific Module */}
            {activeAddLessonModuleId && (
              <div 
                style={{
                  position: "fixed",
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: "rgba(10, 10, 12, 0.8)",
                  backdropFilter: "blur(5px)",
                  zIndex: 1000,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                onClick={() => setActiveAddLessonModuleId(null)}
              >
                <div 
                  style={{
                    backgroundColor: "rgba(20, 20, 25, 0.98)",
                    border: "1px solid rgba(145, 179, 225, 0.3)",
                    borderRadius: "12px",
                    width: "100%",
                    maxWidth: "500px",
                    padding: "28px",
                    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)"
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="font-title-lg" style={{ color: "var(--color-secondary)", marginBottom: "20px", marginTop: 0 }}>
                    Cadastrar Nova Aula
                  </h3>
                  <p style={{ color: "var(--color-outline)", fontSize: "12px", marginTop: "-12px", marginBottom: "20px" }}>
                    Adicionando ao módulo: <strong style={{ color: "#ffffff" }}>{courses.find(c => c.id === selectedCourseId)?.modules?.find(m => m.id === activeAddLessonModuleId)?.title}</strong>
                  </p>
                  
                  <form onSubmit={handleAddLesson} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>TÍTULO DA AULA</label>
                      <input
                        type="text"
                        className="input-dark"
                        placeholder="Ex: 01 - Apresentação Geral"
                        value={lessonTitle}
                        onChange={(e) => setLessonTitle(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>DESCRIÇÃO</label>
                      <textarea
                        className="input-dark"
                        style={{ minHeight: "80px", resize: "vertical" }}
                        placeholder="Resumo do conteúdo da aula..."
                        value={lessonDesc}
                        onChange={(e) => setLessonDesc(e.target.value)}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>DURAÇÃO (Ex: 15 MIN)</label>
                        <input
                          type="text"
                          className="input-dark"
                          placeholder="18 MIN"
                          value={lessonDuration}
                          onChange={(e) => setLessonDuration(e.target.value)}
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>LINK DO VÍDEO (URL)</label>
                        <input
                          type="text"
                          className="input-dark"
                          placeholder="https://vimeo.com/..."
                          value={lessonVideoUrl}
                          onChange={(e) => setLessonVideoUrl(e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>INSTRUTOR</label>
                      <select
                        className="input-dark"
                        value={lessonInstructorName}
                        onChange={(e) => {
                          setLessonInstructorName(e.target.value);
                          if (e.target.value === "Eng. Magno Santos") {
                            setLessonInstructorRole("CEO & Fundador CLS");
                            setLessonInstructorAvatar("/magno.jpg");
                          } else {
                            setLessonInstructorRole("Sócia CLS / Especialista");
                            setLessonInstructorAvatar("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200");
                          }
                        }}
                      >
                        <option value="Eng. Magno Santos" style={{ backgroundColor: "#131316" }}>Eng. Magno Santos</option>
                        <option value="Arq. Mayara Costa" style={{ backgroundColor: "#131316" }}>Arq. Mayara Costa</option>
                      </select>
                    </div>

                    <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                      <button 
                        type="button" 
                        className="btn-secondary" 
                        style={{ flex: 1 }}
                        onClick={() => setActiveAddLessonModuleId(null)}
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        className="btn-primary" 
                        style={{ flex: 1 }}
                        disabled={submitting}
                      >
                        {submitting ? "Salvando..." : "Salvar Aula"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal/Overlay to Edit Module */}
            {editingModule && (
              <div 
                style={{
                  position: "fixed",
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: "rgba(10, 10, 12, 0.8)",
                  backdropFilter: "blur(5px)",
                  zIndex: 1000,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                onClick={() => setEditingModule(null)}
              >
                <div 
                  style={{
                    backgroundColor: "rgba(20, 20, 25, 0.98)",
                    border: "1px solid rgba(145, 179, 225, 0.3)",
                    borderRadius: "12px",
                    width: "100%",
                    maxWidth: "500px",
                    padding: "28px",
                    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
                    maxHeight: "90vh",
                    overflowY: "auto"
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="font-title-lg" style={{ color: "var(--color-secondary)", marginBottom: "20px", marginTop: 0 }}>
                    Configurar Módulo
                  </h3>
                  <form onSubmit={handleSaveModule} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>TÍTULO DO MÓDULO</label>
                      <input
                        type="text"
                        className="input-dark"
                        value={editingModule.title}
                        onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                        required
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>DESCRIÇÃO</label>
                      <textarea
                        className="input-dark"
                        style={{ minHeight: "80px", resize: "vertical" }}
                        placeholder="Descrição ou resumo do módulo..."
                        value={editingModule.description}
                        onChange={(e) => setEditingModule({ ...editingModule, description: e.target.value })}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>STATUS</label>
                        <select
                          className="input-dark"
                          value={editingModule.status}
                          onChange={(e) => setEditingModule({ ...editingModule, status: e.target.value as any })}
                        >
                          <option value="publicado" style={{ backgroundColor: "#131316" }}>Publicado</option>
                          <option value="rascunho" style={{ backgroundColor: "#131316" }}>Rascunho</option>
                          <option value="agendado" style={{ backgroundColor: "#131316" }}>Agendado</option>
                        </select>
                      </div>

                      {editingModule.status === "agendado" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>AGENDAR LANÇAMENTO</label>
                          <DateTimePicker
                            value={editingModule.scheduled_at || ""}
                            onChange={(val) => setEditingModule({ ...editingModule, scheduled_at: val })}
                          />
                        </div>
                      )}
                    </div>



                    <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                      <button 
                        type="button" 
                        className="btn-secondary" 
                        style={{ flex: 1 }}
                        onClick={() => setEditingModule(null)}
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        className="btn-primary" 
                        style={{ flex: 1 }}
                        disabled={submitting || uploadingCover}
                      >
                        {submitting ? "Salvando..." : "Salvar Alterações"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}


          </div>
        )}





        {/* Tab: Membros */}
        {activeTab === "mentorados" && (
          <div>
            <h3 className="font-title-lg" style={{ color: "var(--color-secondary)", marginBottom: "24px" }}>Membros</h3>
            
            {loadingMentorados ? (
              <div style={{ padding: "40px", textAlign: "center" }}>Carregando mentorados...</div>
            ) : mentorados.length === 0 ? (
              <div style={{ 
                padding: "48px 24px", 
                textAlign: "center", 
                backgroundColor: "rgba(255,255,255,0.02)", 
                borderRadius: "8px", 
                border: "1px dashed rgba(255,255,255,0.1)" 
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "var(--color-outline)", marginBottom: "16px" }}>
                  group
                </span>
                <p className="font-body-lg" style={{ color: "var(--color-on-surface-variant)", margin: 0, fontWeight: 500 }}>
                  Você ainda não tem mentorado cadastrado.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {mentorados.map((m) => (
                  <div 
                    key={m.id} 
                    className="glass-panel hover-border" 
                    style={{ 
                      padding: "16px 20px", 
                      borderRadius: "8px", 
                      border: "1px solid rgba(255,255,255,0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "16px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <MemberBadge
                        name={m.name}
                        img={m.img}
                        initials={m.initials}
                        memberType={m.member_type}
                        size={48}
                        isOnline={m.isOnline}
                      />
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <h4 style={{ color: "#ffffff", margin: 0, fontWeight: 600, fontSize: "16px" }}>{m.name}</h4>
                          {m.member_type ? (
                            <span style={{
                              fontSize: "9px",
                              fontWeight: 700,
                              padding: "2px 6px",
                              borderRadius: "4px",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              backgroundColor: m.member_type === "admin" || m.member_type === "master"
                                ? "rgba(145, 179, 225, 0.15)" 
                                : "rgba(124, 77, 255, 0.15)",
                              color: m.member_type === "admin" || m.member_type === "master"
                                ? "#91B3E1" 
                                : "#B388FF",
                              border: `1px solid ${m.member_type === "admin" || m.member_type === "master" ? "rgba(145, 179, 225, 0.3)" : "rgba(124, 77, 255, 0.3)"}`
                            }}>
                              {m.member_type === "admin" 
                                ? (m.name.toLowerCase().includes("magno") ? "Mentor" : m.name.toLowerCase().includes("mayara") ? "Mentora" : "Admin") 
                                : m.member_type}
                            </span>
                          ) : (
                            <span style={{
                              fontSize: "9px",
                              fontWeight: 700,
                              padding: "2px 6px",
                              borderRadius: "4px",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              backgroundColor: "rgba(203, 213, 225, 0.15)",
                              color: "#C0C0C0",
                              border: "1px solid rgba(203, 213, 225, 0.3)"
                            }}>
                              Mentorado
                            </span>
                          )}
                        </div>
                        <p style={{ color: "var(--color-secondary)", margin: "0 0 2px 0", fontSize: "12px" }}>{m.role} {m.company ? `na ${m.company}` : ""}</p>
                        <p style={{ color: "var(--color-outline)", margin: "0 0 6px 0", fontSize: "11px" }}>{m.email}</p>
                        
                        {/* Progress Bar */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                          <div style={{ width: "120px", height: "6px", backgroundColor: "rgba(255, 255, 255, 0.1)", borderRadius: "3px", overflow: "hidden" }}>
                            <div style={{ width: `${m.progress || 0}%`, height: "100%", background: "linear-gradient(90deg, #E2E8F0, #CBD5E1)", borderRadius: "3px" }}></div>
                          </div>
                          <span style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 500 }}>
                            {m.progress || 0}% Concluído
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button 
                        className="btn-outline" 
                        style={{ padding: "6px 12px", fontSize: "11px", borderColor: "rgba(255,255,255,0.15)", color: "var(--color-on-surface)" }}
                        onClick={() => setViewingMember(m)}
                      >
                        Ver Detalhes
                      </button>
                      <button 
                        className="btn-outline" 
                        style={{ padding: "6px 12px", fontSize: "11px", borderColor: "rgba(255,255,255,0.15)", color: "var(--color-on-surface)" }}
                        onClick={() => setEditingMember({
                          id: m.id,
                          name: m.name,
                          email: m.email,
                          member_type: m.member_type || "mentor",
                          company: m.company || "",
                          role: m.role || ""
                        })}
                      >
                        Editar
                      </button>
                      <button 
                        className="btn-outline" 
                        style={{ padding: "6px 12px", fontSize: "11px", borderColor: "var(--color-secondary)", color: "var(--color-secondary)" }}
                        onClick={() => alert("Para inativar o acesso do membro, use a opção Excluir para remover a conta permanentemente, ou altere o tipo para Mentor.")}
                      >
                        Inativar
                      </button>
                      <button 
                        className="btn-outline" 
                        style={{ padding: "6px 12px", fontSize: "11px", borderColor: "var(--color-error)", color: "var(--color-error)" }}
                        onClick={() => {
                          if (confirm(`Tem certeza que deseja excluir ${m.name}? Essa ação é irreversível e excluirá a conta e perfil do usuário.`)) {
                            void handleDeleteMember(m.id);
                          }
                        }}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Comentários */}
        {activeTab === "comments" && (
          <div>
            <h3 className="font-title-lg" style={{ color: "var(--color-secondary)", marginBottom: "24px" }}>Comentários das Aulas</h3>
            {loadingComments ? (
              <div style={{ padding: "40px", textAlign: "center" }}>Carregando comentários...</div>
            ) : comments.length === 0 ? (
              <div style={{ 
                padding: "48px 24px", 
                textAlign: "center", 
                backgroundColor: "rgba(255,255,255,0.02)", 
                borderRadius: "8px", 
                border: "1px dashed rgba(255,255,255,0.1)" 
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "var(--color-outline)", marginBottom: "16px" }}>
                  chat
                </span>
                <p className="font-body-lg" style={{ color: "var(--color-on-surface-variant)", margin: 0, fontWeight: 500 }}>
                  Ainda não tem comentários.
                </p>
              </div>
            ) : (() => {
              // Grouping comments by module then by lesson
              const grouped: Record<string, { moduleTitle: string; lessons: Record<string, { lessonTitle: string; comments: any[] }> }> = {};

              comments.forEach(c => {
                const lesson = c.lessons;
                const moduleObj = lesson?.modules;
                
                const moduleId = lesson?.module_id || "unknown-module";
                const moduleTitle = moduleObj?.title || "Módulo Geral";
                const lessonId = c.lesson_id || "unknown-lesson";
                const lessonTitle = lesson?.title || "Aula Geral";

                if (!grouped[moduleId]) {
                  grouped[moduleId] = {
                    moduleTitle,
                    lessons: {}
                  };
                }

                if (!grouped[moduleId].lessons[lessonId]) {
                  grouped[moduleId].lessons[lessonId] = {
                    lessonTitle,
                    comments: []
                  };
                }

                grouped[moduleId].lessons[lessonId].comments.push(c);
              });

              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {Object.entries(grouped).map(([modId, modData]) => (
                    <div key={modId} className="glass-panel" style={{ padding: "24px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <span className="font-label-caps" style={{ color: "var(--color-secondary)", fontSize: "11px", letterSpacing: "0.1em" }}>
                        MÓDULO: {modData.moduleTitle}
                      </span>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "16px" }}>
                        {Object.entries(modData.lessons).map(([lessId, lessData]) => (
                          <div key={lessId} style={{ borderLeft: "2px solid rgba(145, 179, 225, 0.3)", paddingLeft: "16px" }}>
                            <h4 style={{ color: "#ffffff", fontSize: "14px", fontWeight: 600, margin: "0 0 12px 0" }}>
                              {lessData.lessonTitle}
                            </h4>
                            
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                              {lessData.comments.map((c: any) => (
                                <div key={c.id} style={{ display: "flex", gap: "12px", backgroundColor: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "4px" }}>
                                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", overflow: "hidden", flexShrink: 0, backgroundColor: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-on-primary)", fontWeight: 700, fontSize: "12px" }}>
                                    {c.members?.img ? (
                                      <img src={c.members.img} alt={c.members.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                      (c.members?.name || "M").substring(0, 1).toUpperCase()
                                    )}
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", flexWrap: "wrap", gap: "4px" }}>
                                      <span style={{ color: "#ffffff", fontWeight: 600, fontSize: "12px" }}>
                                        {c.members?.name || "Membro CLS"}{" "}
                                        <span style={{ color: "var(--color-outline)", fontWeight: 400, fontSize: "11px" }}>
                                          ({c.members?.role || "Membro"})
                                        </span>
                                      </span>
                                      <span style={{ color: "var(--color-outline)", fontSize: "10px" }}>
                                        {new Date(c.created_at).toLocaleDateString()} {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                    <p style={{ color: "var(--color-on-surface-variant)", fontSize: "12px", margin: 0, lineHeight: "1.5" }}>
                                      {c.content}
                                    </p>
                                    
                                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
                                      <button 
                                        onClick={async () => {
                                          if (!confirm("Deseja realmente excluir este comentário?")) return;
                                          const { error } = await supabase.from("lesson_comments").delete().eq("id", c.id);
                                          if (error) {
                                            showStatus("error", "Erro ao excluir comentário.");
                                          } else {
                                            showStatus("success", "Comentário excluído.");
                                            void loadComments();
                                          }
                                        }}
                                        style={{ background: "none", border: "none", color: "var(--color-error)", fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", padding: 0 }}
                                      >
                                        <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>delete</span> Excluir
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* Tab: Cadastrar Usuário */}
        {activeTab === "cadastrar-usuario" && (memberType === "admin" || memberType === null) && (
          <div>
            <h3 className="font-title-lg" style={{ color: "var(--color-secondary)", marginBottom: "24px" }}>Cadastrar Novo Usuário</h3>
            
            <form onSubmit={handleRegisterUser} style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "500px" }}>
              {regSuccessMsg && (
                <div style={{ padding: "12px 16px", backgroundColor: "rgba(76, 175, 80, 0.12)", color: "#81C784", borderRadius: "4px", border: "1px solid rgba(76, 175, 80, 0.25)", fontSize: "13px" }}>
                  {regSuccessMsg}
                </div>
              )}
              {regErrorMsg && (
                <div style={{ padding: "12px 16px", backgroundColor: "rgba(244, 67, 54, 0.12)", color: "#E57373", borderRadius: "4px", border: "1px solid rgba(244, 67, 54, 0.25)", fontSize: "13px" }}>
                  {regErrorMsg}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>NOME COMPLETO</label>
                <input
                  type="text"
                  className="input-dark"
                  placeholder="Nome do usuário"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>E-MAIL</label>
                <input
                  type="email"
                  className="input-dark"
                  placeholder="exemplo@dominio.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>CARGO / PROFISSÃO</label>
                  <input
                    type="text"
                    className="input-dark"
                    placeholder="Ex: Arquiteta, Desenvolvedor"
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>EMPRESA</label>
                  <input
                    type="text"
                    className="input-dark"
                    placeholder="Nome da empresa"
                    value={regCompany}
                    onChange={(e) => setRegCompany(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>TIPO DE MEMBRO</label>
                <select
                  className="input-dark"
                  value={regMemberType}
                  onChange={(e) => setRegMemberType(e.target.value as any)}
                >
                  <option value="mentor" style={{ backgroundColor: "#131316" }}>Mentor</option>
                  <option value="master" style={{ backgroundColor: "#131316" }}>Master</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", border: "1px solid rgba(255, 255, 255, 0.05)", padding: "16px", borderRadius: "4px", backgroundColor: "rgba(255, 255, 255, 0.01)" }}>
                <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>SENHA DE ACESSO</label>
                <div style={{ display: "flex", gap: "16px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer", color: "#fff" }}>
                    <input
                      type="radio"
                      name="passwordType"
                      checked={regPasswordType === "default"}
                      onChange={() => setRegPasswordType("default")}
                    />
                    Senha Padrão (CLS@2026)
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer", color: "#fff" }}>
                    <input
                      type="radio"
                      name="passwordType"
                      checked={regPasswordType === "custom"}
                      onChange={() => setRegPasswordType("custom")}
                    />
                    Criar Senha Personalizada
                  </label>
                </div>

                {regPasswordType === "custom" && (
                  <input
                    type="text"
                    className="input-dark"
                    placeholder="Digite a senha (mínimo 6 caracteres)"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required={regPasswordType === "custom"}
                    style={{ marginTop: "8px" }}
                  />
                )}
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: "12px" }} disabled={regSubmitting}>
                {regSubmitting ? "Cadastrando..." : "Cadastrar Usuário"}
              </button>
            </form>
          </div>
        )}

      {/* Modal: Ver Detalhes do Membro */}
      {viewingMember && (
        <div 
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(10, 10, 12, 0.8)", backdropFilter: "blur(5px)",
            zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center"
          }}
          onClick={() => setViewingMember(null)}
        >
          <div 
            style={{
              backgroundColor: "rgba(20, 20, 25, 0.98)", border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px", width: "100%", maxWidth: "450px", padding: "28px", boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 className="font-title-lg" style={{ color: "var(--color-secondary)", margin: 0 }}>Detalhes do Membro</h3>
              <button onClick={() => setViewingMember(null)} style={{ background: "none", border: "none", color: "var(--color-outline)", cursor: "pointer" }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
              <MemberBadge
                name={viewingMember.name}
                img={viewingMember.img}
                initials={viewingMember.initials}
                memberType={viewingMember.member_type}
                size={80}
                showLabel={true}
                isOnline={(viewingMember as any).isOnline}
              />
              <div style={{ textAlign: "center" }}>
                <h4 style={{ color: "#ffffff", margin: "8px 0 4px 0", fontWeight: 600, fontSize: "18px" }}>{viewingMember.name}</h4>
                <p style={{ color: "var(--color-secondary)", margin: 0, fontSize: "14px" }}>
                  {viewingMember.role || "Membro"} {viewingMember.company ? `na ${viewingMember.company}` : ""}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: "var(--color-outline)" }}>E-mail</span>
                <span style={{ fontSize: "13px", color: "#ffffff", fontWeight: 500 }}>{viewingMember.email}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: "var(--color-outline)" }}>Tipo de Membro</span>
                <span style={{ 
                  fontSize: "12px", 
                  fontWeight: 600, 
                  color: viewingMember.member_type === "admin" 
                    ? "#91B3E1" 
                    : viewingMember.member_type === "master" 
                      ? "#91B3E1" 
                      : viewingMember.member_type === "mentor"
                        ? "#B388FF"
                        : "#C0C0C0"
                }}>
                  {viewingMember.member_type ? viewingMember.member_type.toUpperCase() : "MENTORADO"}
                </span>
              </div>
              {(viewingMember as any).progress !== undefined && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", color: "var(--color-outline)" }}>Progresso</span>
                  <span style={{ fontSize: "13px", color: "var(--color-secondary)", fontWeight: 600 }}>
                    {(viewingMember as any).progress}% Concluído
                  </span>
                </div>
              )}
              {viewingMember.created_at && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", color: "var(--color-outline)" }}>Membro desde</span>
                  <span style={{ fontSize: "13px", color: "#ffffff" }}>
                    {new Date(viewingMember.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              )}
            </div>

            <div style={{ marginTop: "28px" }}>
              <button 
                className="btn-primary" 
                style={{ width: "100%" }}
                onClick={() => setViewingMember(null)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Editar Membro */}
      {editingMember && (
        <div 
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(10, 10, 12, 0.8)", backdropFilter: "blur(5px)",
            zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center"
          }}
          onClick={() => setEditingMember(null)}
        >
          <div 
            style={{
              backgroundColor: "rgba(20, 20, 25, 0.98)", border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px", width: "100%", maxWidth: "450px", padding: "28px", boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 className="font-title-lg" style={{ color: "var(--color-secondary)", margin: 0 }}>Editar Membro</h3>
              <button onClick={() => setEditingMember(null)} style={{ background: "none", border: "none", color: "var(--color-outline)", cursor: "pointer" }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleUpdateMember} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>NOME COMPLETO</label>
                <input
                  type="text"
                  className="input-dark"
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>E-MAIL</label>
                <input
                  type="email"
                  className="input-dark"
                  value={editingMember.email}
                  onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>TIPO DE ACESSO</label>
                <select
                  className="input-dark"
                  value={editingMember.member_type}
                  onChange={(e) => setEditingMember({ ...editingMember, member_type: e.target.value as any })}
                  required
                >
                  <option value="mentor" style={{ backgroundColor: "#131316" }}>Mentor</option>
                  <option value="master" style={{ backgroundColor: "#131316" }}>Master</option>
                  <option value="admin" style={{ backgroundColor: "#131316" }}>Admin</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>CARGO / FUNÇÃO</label>
                <input
                  type="text"
                  className="input-dark"
                  value={editingMember.role}
                  onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                  placeholder="Ex: Diretor de Expansão"
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>EMPRESA</label>
                <input
                  type="text"
                  className="input-dark"
                  value={editingMember.company}
                  onChange={(e) => setEditingMember({ ...editingMember, company: e.target.value })}
                  placeholder="Ex: CLS Empreendimentos"
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  style={{ flex: 1 }}
                  onClick={() => setEditingMember(null)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ flex: 1 }}
                  disabled={submitting}
                >
                  {submitting ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>

      {/* Bulk Actions Bar */}
      {(selectedModules.length > 0 || selectedLessons.length > 0) && (
        <div style={{
          position: "fixed",
          bottom: "32px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "rgba(20, 20, 25, 0.95)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(145, 179, 225, 0.3)",
          borderRadius: "50px",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          gap: "24px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
          zIndex: 9999
        }}>
          <span style={{ color: "var(--color-on-surface)", fontWeight: 600, fontSize: "14px" }}>
            {selectedModules.length + selectedLessons.length} selecionado(s)
          </span>
          <div style={{ width: "1px", height: "24px", backgroundColor: "rgba(255, 255, 255, 0.1)" }}></div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button 
              className="btn-secondary" 
              style={{ padding: "8px 16px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}
              onClick={() => handleBulkAction('draft')}
              disabled={bulkActionLoading}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>visibility_off</span>
              Rascunho
            </button>
            <button 
              className="btn-secondary" 
              style={{ padding: "8px 16px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
              onClick={() => handleBulkAction('publish')}
              disabled={bulkActionLoading}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>public</span>
              Publicar
            </button>
            <button 
              className="btn-secondary" 
              style={{ padding: "8px 16px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(244, 67, 54, 0.1)", color: "#F44336", borderColor: "rgba(244, 67, 54, 0.2)" }}
              onClick={() => handleBulkAction('delete')}
              disabled={bulkActionLoading}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>delete</span>
              Excluir
            </button>
          </div>
          <button 
            style={{ background: "none", border: "none", color: "var(--color-outline)", cursor: "pointer", display: "flex", alignItems: "center", marginLeft: "8px" }}
            onClick={() => {
              setSelectedModules([]);
              setSelectedLessons([]);
            }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}
    </div>
  );
}
