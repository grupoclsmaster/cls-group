"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface Mission {
  id: string;
  title: string;
  description: string;
  has_text_question: boolean;
  text_question?: string;
  has_form_link: boolean;
  form_link?: string;
  has_file_upload: boolean;
  file_upload_label?: string;
  created_at: string;
}

interface Submission {
  id: string;
  mission_id: string;
  student_id: string;
  text_answer?: string;
  form_submitted_link?: string;
  file_url?: string;
  file_name?: string;
  status: "pending" | "approved" | "rejected";
  feedback?: string;
  submitted_at: string;
  reviewed_at?: string;
  members?: {
    name: string;
    email: string;
    role: string;
    img?: string;
  };
}

export default function MissoesPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Data States
  const [missions, setMissions] = useState<Mission[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]); // Student submissions if admin
  const [mySubmissions, setMySubmissions] = useState<Record<string, Submission>>({}); // Student's own mapping mission_id -> Submission

  // UI Navigation
  const [adminTab, setAdminTab] = useState<"correcoes" | "gerenciamento">("correcoes");
  const [expandedMissionId, setExpandedMissionId] = useState<string | null>(null);

  // Admin Missions Forms
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [hasTextQuestion, setHasTextQuestion] = useState(false);
  const [textQuestion, setTextQuestion] = useState("");
  const [hasFormLink, setHasFormLink] = useState(false);
  const [formLink, setFormLink] = useState("");
  const [hasFileUpload, setHasFileUpload] = useState(false);
  const [fileUploadLabel, setFileUploadLabel] = useState("");
  const [submittingMission, setSubmittingMission] = useState(false);

  // Student Submission Forms
  const [submittingResponse, setSubmittingResponse] = useState<Record<string, boolean>>({});
  const [answers, setAnswers] = useState<Record<string, { text_answer?: string; form_submitted_link?: string; file_url?: string; file_name?: string }>>({});
  const [uploadingForMission, setUploadingForMission] = useState<Record<string, boolean>>({});

  // Admin Corrections Form
  const [correctingSubmission, setCorrectingSubmission] = useState<Submission | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [processingCorrection, setProcessingCorrection] = useState(false);

  // General Notification
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showStatus = (type: "success" | "error", text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 5000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Check member type and admin status
      const { data: member } = await supabase
        .from("members")
        .select("id, name, img, role, initials, member_type")
        .eq("id", user.id)
        .single();

      setCurrentUser(member);
      const emailLower = user.email?.toLowerCase();
      const isEmailAdmin = emailLower === "magnorjsantos@hotmail.com" || emailLower === "mayaracosta00@gmail.com";
      const isUserAdmin = member?.member_type === "admin" || isEmailAdmin;
      setIsAdmin(isUserAdmin);

      // Load Missions
      const { data: dbMissions, error: missionsErr } = await supabase
        .from("missions")
        .select("*")
        .order("created_at", { ascending: true });

      if (missionsErr) throw missionsErr;
      setMissions(dbMissions || []);

      if (isUserAdmin) {
        // Load all submissions for review
        const { data: dbSubmissions, error: subErr } = await supabase
          .from("mission_submissions")
          .select(`
            *,
            members:student_id (
              name,
              email,
              role,
              img
            )
          `)
          .order("submitted_at", { ascending: false });

        if (subErr) throw subErr;
        setSubmissions(dbSubmissions || []);
      } else {
        // Load only current student's submissions
        const { data: dbMySubmissions, error: mySubErr } = await supabase
          .from("mission_submissions")
          .select("*")
          .eq("student_id", user.id);

        if (mySubErr) throw mySubErr;
        const mapping: Record<string, Submission> = {};
        dbMySubmissions?.forEach((s: Submission) => {
          mapping[s.mission_id] = s;
        });
        setMySubmissions(mapping);

        // Prepopulate answers with existing submissions
        const initialAnswers: typeof answers = {};
        dbMySubmissions?.forEach((s: Submission) => {
          initialAnswers[s.mission_id] = {
            text_answer: s.text_answer || "",
            form_submitted_link: s.form_submitted_link || "",
            file_url: s.file_url || "",
            file_name: s.file_name || ""
          };
        });
        setAnswers(initialAnswers);
      }
    } catch (err: any) {
      console.error("Erro ao carregar dados:", err);
      showStatus("error", "Erro ao carregar dados da página.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Student upload handler
  const handleStudentFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, missionId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      showStatus("error", "Erro: O tamanho máximo do arquivo é de 100 MB.");
      return;
    }

    setUploadingForMission(prev => ({ ...prev, [missionId]: true }));
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/missions/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao fazer upload");

      setAnswers(prev => ({
        ...prev,
        [missionId]: {
          ...prev[missionId],
          file_url: data.url,
          file_name: data.name
        }
      }));
      showStatus("success", "Arquivo enviado com sucesso!");
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao fazer upload do arquivo.");
    } finally {
      setUploadingForMission(prev => ({ ...prev, [missionId]: false }));
    }
  };

  // Student submit task submission
  const handleStudentSubmit = async (missionId: string) => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission || !currentUser) return;

    const answerData = answers[missionId] || {};

    if (mission.has_text_question && !answerData.text_answer?.trim()) {
      showStatus("error", "Por favor, responda a pergunta textual.");
      return;
    }
    if (mission.has_form_link && !answerData.form_submitted_link?.trim()) {
      showStatus("error", "Por favor, insira o link de confirmação do formulário.");
      return;
    }
    if (mission.has_file_upload && !answerData.file_url) {
      showStatus("error", "Por favor, faça upload do arquivo solicitado.");
      return;
    }

    setSubmittingResponse(prev => ({ ...prev, [missionId]: true }));
    try {
      const existingSub = mySubmissions[missionId];
      if (existingSub) {
        // Update existing submission
        const { error } = await supabase
          .from("mission_submissions")
          .update({
            text_answer: answerData.text_answer || null,
            form_submitted_link: answerData.form_submitted_link || null,
            file_url: answerData.file_url || null,
            file_name: answerData.file_name || null,
            status: "pending", // Reset back to pending for re-review
            feedback: null, // Reset feedback
            submitted_at: new Date().toISOString()
          })
          .eq("id", existingSub.id);

        if (error) throw error;
        showStatus("success", "Missão re-enviada com sucesso!");
      } else {
        // Insert new submission
        const { error } = await supabase
          .from("mission_submissions")
          .insert([{
            mission_id: missionId,
            student_id: currentUser.id,
            text_answer: answerData.text_answer || null,
            form_submitted_link: answerData.form_submitted_link || null,
            file_url: answerData.file_url || null,
            file_name: answerData.file_name || null,
            status: "pending"
          }]);

        if (error) throw error;
        showStatus("success", "Missão enviada com sucesso!");
      }
      await loadData();
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao salvar envio da missão.");
    } finally {
      setSubmittingResponse(prev => ({ ...prev, [missionId]: false }));
    }
  };

  // Admin: Create/Edit Mission
  const handleSaveMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDesc.trim()) {
      showStatus("error", "Título e Descrição são obrigatórios.");
      return;
    }

    setSubmittingMission(true);
    try {
      const payload = {
        title: formTitle,
        description: formDesc,
        has_text_question: hasTextQuestion,
        text_question: hasTextQuestion ? textQuestion : null,
        has_form_link: hasFormLink,
        form_link: hasFormLink ? formLink : null,
        has_file_upload: hasFileUpload,
        file_upload_label: hasFileUpload ? fileUploadLabel : null,
        updated_at: new Date().toISOString()
      };

      if (editingMission) {
        const { error } = await supabase
          .from("missions")
          .update(payload)
          .eq("id", editingMission.id);
        if (error) throw error;
        showStatus("success", "Missão atualizada com sucesso!");
      } else {
        const { error } = await supabase
          .from("missions")
          .insert([payload]);
        if (error) throw error;
        showStatus("success", "Nova missão criada com sucesso!");
      }

      setShowCreateModal(false);
      resetMissionForm();
      await loadData();
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao salvar missão.");
    } finally {
      setSubmittingMission(false);
    }
  };

  // Admin: Delete Mission
  const handleDeleteMission = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta missão permanentemente? Todos os envios dos alunos também serão perdidos.")) return;
    try {
      const { error } = await supabase.from("missions").delete().eq("id", id);
      if (error) throw error;
      showStatus("success", "Missão excluída com sucesso.");
      await loadData();
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao excluir missão.");
    }
  };

  // Admin: Correct Submission
  const handleProcessCorrection = async (status: "approved" | "rejected") => {
    if (!correctingSubmission) return;
    setProcessingCorrection(true);
    try {
      const { error } = await supabase
        .from("mission_submissions")
        .update({
          status,
          feedback: feedbackText.trim() || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: currentUser.id
        })
        .eq("id", correctingSubmission.id);

      if (error) throw error;
      showStatus("success", status === "approved" ? "Missão Aprovada!" : "Missão Rejeitada.");
      setCorrectingSubmission(null);
      setFeedbackText("");
      await loadData();
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao salvar avaliação.");
    } finally {
      setProcessingCorrection(false);
    }
  };

  const resetMissionForm = () => {
    setEditingMission(null);
    setFormTitle("");
    setFormDesc("");
    setHasTextQuestion(false);
    setTextQuestion("");
    setHasFormLink(false);
    setFormLink("");
    setHasFileUpload(false);
    setFileUploadLabel("");
  };

  const openEditMission = (m: Mission) => {
    setEditingMission(m);
    setFormTitle(m.title);
    setFormDesc(m.description);
    setHasTextQuestion(m.has_text_question);
    setTextQuestion(m.text_question || "");
    setHasFormLink(m.has_form_link);
    setFormLink(m.form_link || "");
    setHasFileUpload(m.has_file_upload);
    setFileUploadLabel(m.file_upload_label || "");
    setShowCreateModal(true);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "20px" }}>
        <div style={{ height: "120px", background: "rgba(255,255,255,0.03)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }} className="animate-pulse" />
        <div style={{ height: "300px", background: "rgba(255,255,255,0.03)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }} className="animate-pulse" />
      </div>
    );
  }

  // Calculations for Student view
  const totalMissions = missions.length;
  const approvedMissions = Object.values(mySubmissions).filter(s => s.status === "approved").length;
  const completionPercentage = totalMissions > 0 ? Math.round((approvedMissions / totalMissions) * 100) : 0;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .input-dark {
          background: rgba(0, 0, 0, 0.4) !important;
          border: 1px solid rgba(255, 255, 255, 0.12) !important;
          color: #fff !important;
          border-radius: 4px !important;
          padding: 12px 16px !important;
          font-family: 'Inter', sans-serif !important;
          font-size: 14px !important;
          outline: none !important;
          transition: all 0.2s ease !important;
          width: 100% !important;
        }
        .input-dark:focus {
          border-color: var(--color-secondary) !important;
          box-shadow: 0 0 0 1px var(--color-secondary) !important;
          background: rgba(0, 0, 0, 0.6) !important;
        }
        .input-dark::placeholder {
          color: rgba(255, 255, 255, 0.25) !important;
        }
        .input-dark:disabled {
          background: rgba(255, 255, 255, 0.02) !important;
          color: rgba(255, 255, 255, 0.4) !important;
          border-color: rgba(255, 255, 255, 0.05) !important;
          cursor: not-allowed !important;
        }
        /* Custom Checkbox */
        .custom-checkbox-container {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          color: #fff;
          font-size: 14px;
          font-weight: 500;
          user-select: none;
          padding: 8px 0;
        }
        .custom-checkbox-container input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          height: 0;
          width: 0;
        }
        .checkmark {
          width: 20px;
          height: 20px;
          background-color: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          display: inline-block;
          position: relative;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .custom-checkbox-container:hover input ~ .checkmark {
          border-color: var(--color-secondary);
          background-color: rgba(0, 0, 0, 0.6);
        }
        .custom-checkbox-container input:checked ~ .checkmark {
          background-color: var(--color-secondary);
          border-color: var(--color-secondary);
        }
        .checkmark:after {
          content: "";
          position: absolute;
          display: none;
        }
        .custom-checkbox-container input:checked ~ .checkmark:after {
          display: block;
        }
        .custom-checkbox-container .checkmark:after {
          left: 6px;
          top: 2px;
          width: 6px;
          height: 11px;
          border: solid #000;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
      `}} />
      {/* Toast Alert */}
      {statusMsg && (
        <div
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            padding: "16px 24px",
            borderRadius: "8px",
            backgroundColor: statusMsg.type === "success" ? "rgba(16, 185, 129, 0.95)" : "rgba(239, 68, 68, 0.95)",
            color: "#fff",
            zIndex: 1000,
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            backdropFilter: "blur(8px)",
            fontWeight: 500,
            fontSize: "14px",
            border: statusMsg.type === "success" ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(239, 68, 68, 0.2)"
          }}
        >
          {statusMsg.text}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 className="font-display-lg" style={{ margin: 0, color: "var(--color-primary)" }}>
            {isAdmin ? "Gerenciador de Missões" : "Suas Missões"}
          </h1>
          <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)", marginTop: "4px" }}>
            {isAdmin 
              ? "Publique tarefas técnicas e avalie os envios dos membros mentoreados." 
              : "Execute as missões do Club Pro CLS para comprovar seu progresso e receber avaliações."}
          </p>
        </div>

        {isAdmin && (
          <button 
            className="btn-primary" 
            onClick={() => { resetMissionForm(); setShowCreateModal(true); }}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <span className="material-symbols-outlined">add</span> Nova Missão
          </button>
        )}
      </div>

      {/* ADMIN VIEW */}
      {isAdmin ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.1)", gap: "24px", paddingBottom: "1px" }}>
            <button
              onClick={() => setAdminTab("correcoes")}
              style={{
                background: "none",
                border: "none",
                color: adminTab === "correcoes" ? "var(--color-secondary)" : "var(--color-on-surface-variant)",
                borderBottom: adminTab === "correcoes" ? "2px solid var(--color-secondary)" : "2px solid transparent",
                padding: "8px 16px 12px 16px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "15px",
                transition: "all 0.2s ease"
              }}
            >
              Correções ({submissions.filter(s => s.status === "pending").length})
            </button>
            <button
              onClick={() => setAdminTab("gerenciamento")}
              style={{
                background: "none",
                border: "none",
                color: adminTab === "gerenciamento" ? "var(--color-secondary)" : "var(--color-on-surface-variant)",
                borderBottom: adminTab === "gerenciamento" ? "2px solid var(--color-secondary)" : "2px solid transparent",
                padding: "8px 16px 12px 16px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "15px",
                transition: "all 0.2s ease"
              }}
            >
              Missões Criadas ({missions.length})
            </button>
          </div>

          {/* Tab Content 1: Corrections */}
          {adminTab === "correcoes" && (
            <div className="glass-panel" style={{ padding: "24px", borderRadius: "16px", overflowX: "auto" }}>
              <h3 className="font-title-md" style={{ margin: "0 0 16px 0", color: "#fff" }}>Envios dos Alunos</h3>
              
              {submissions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--color-on-surface-variant)" }}>
                  Nenhum envio recebido até o momento.
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", color: "var(--color-on-surface-variant)", fontSize: "13px", textAlign: "left" }}>
                      <th style={{ padding: "12px" }}>Aluno</th>
                      <th style={{ padding: "12px" }}>Missão</th>
                      <th style={{ padding: "12px" }}>Envio</th>
                      <th style={{ padding: "12px" }}>Status</th>
                      <th style={{ padding: "12px" }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub) => {
                      const mission = missions.find(m => m.id === sub.mission_id);
                      return (
                        <tr key={sub.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: "14px", color: "#e2e8f0" }}>
                          <td style={{ padding: "16px 12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              {sub.members?.img ? (
                                <img src={sub.members.img} alt="" style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
                              ) : (
                                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(145, 179, 225, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-secondary)", fontSize: "12px", fontWeight: "bold" }}>
                                  {sub.members?.name?.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <div style={{ fontWeight: 600 }}>{sub.members?.name || "Aluno"}</div>
                                <div style={{ fontSize: "11px", color: "var(--color-on-surface-variant)" }}>{sub.members?.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "16px 12px" }}>
                            <div style={{ fontWeight: 500 }}>{mission?.title || "Missão Removida"}</div>
                          </td>
                          <td style={{ padding: "16px 12px", color: "var(--color-on-surface-variant)", fontSize: "12px" }}>
                            {new Date(sub.submitted_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td style={{ padding: "16px 12px" }}>
                            <span style={{
                              display: "inline-block",
                              padding: "4px 10px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: 600,
                              letterSpacing: "0.05em",
                              backgroundColor: sub.status === "approved" ? "rgba(16, 185, 129, 0.1)" : sub.status === "rejected" ? "rgba(239, 68, 68, 0.1)" : "rgba(245, 158, 11, 0.1)",
                              color: sub.status === "approved" ? "#10b981" : sub.status === "rejected" ? "#ef4444" : "#f59e0b",
                              border: sub.status === "approved" ? "1px solid rgba(16, 185, 129, 0.2)" : sub.status === "rejected" ? "1px solid rgba(239, 68, 68, 0.2)" : "1px solid rgba(245, 158, 11, 0.2)"
                            }}>
                              {sub.status === "approved" ? "APROVADO" : sub.status === "rejected" ? "CORRIGIR" : "PENDENTE"}
                            </span>
                          </td>
                          <td style={{ padding: "16px 12px" }}>
                            <button
                              className="btn-outline"
                              style={{ padding: "6px 12px", fontSize: "12px", border: "1px solid rgba(255,255,255,0.15)" }}
                              onClick={() => {
                                setCorrectingSubmission(sub);
                                setFeedbackText(sub.feedback || "");
                              }}
                            >
                              Avaliar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Tab Content 2: Missions Management */}
          {adminTab === "gerenciamento" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
              {missions.length === 0 ? (
                <div className="glass-panel" style={{ padding: "40px", textAlign: "center", borderRadius: "16px", color: "var(--color-on-surface-variant)" }}>
                  Nenhuma missão cadastrada. Clique em "Nova Missão" para começar.
                </div>
              ) : (
                missions.map((m) => (
                  <div key={m.id} className="glass-panel" style={{ padding: "24px", borderRadius: "16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "24px", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: "300px" }}>
                      <h4 className="font-title-md" style={{ margin: "0 0 8px 0", color: "#fff" }}>{m.title}</h4>
                      <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)", margin: "0 0 16px 0", whiteSpace: "pre-line" }}>{m.description}</p>
                      
                      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                        {m.has_text_question && (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--color-secondary)" }}>
                            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>subject</span> Resposta Textual
                          </div>
                        )}
                        {m.has_form_link && (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--color-secondary)" }}>
                            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>link</span> Formulário Externo
                          </div>
                        )}
                        {m.has_file_upload && (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--color-secondary)" }}>
                            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>upload_file</span> Envio de Arquivo
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <button className="btn-outline hover-gold-text" onClick={() => openEditMission(m)} style={{ padding: "8px" }} title="Editar">
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>edit</span>
                      </button>
                      <button className="btn-outline" onClick={() => handleDeleteMission(m.id)} style={{ padding: "8px", borderColor: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }} title="Deletar">
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>delete</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ) : (
        /* STUDENT VIEW */
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {/* Progress Overview Card */}
          <div className="glass-panel" style={{ padding: "28px", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "24px", background: "linear-gradient(135deg, rgba(7,7,50,0.6) 0%, rgba(14,24,78,0.4) 100%)", border: "1px solid rgba(145,179,225,0.15)" }}>
            <div style={{ flex: 1, minWidth: "250px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-secondary)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>Seu Progresso</div>
              <h2 className="font-display-md" style={{ margin: "0 0 16px 0", color: "#fff" }}>
                {approvedMissions} de {totalMissions} Missões Concluídas
              </h2>

              {/* Progress bar container */}
              <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden", marginBottom: "8px" }}>
                <div style={{ width: `${completionPercentage}%`, height: "100%", background: "linear-gradient(90deg, var(--color-primary), var(--color-secondary))", borderRadius: "4px", transition: "width 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)", boxShadow: "0 0 12px rgba(145,179,225,0.6)" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--color-on-surface-variant)" }}>
                <span>Aproveitamento geral</span>
                <span style={{ fontWeight: "bold", color: "var(--color-secondary)" }}>{completionPercentage}%</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "88px", height: "88px", borderRadius: "50%", background: "rgba(145, 179, 225, 0.08)", border: "2px solid rgba(145, 179, 225, 0.12)", color: "var(--color-secondary)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "42px", filter: "drop-shadow(0 0 8px rgba(145,179,225,0.4))" }}>military_tech</span>
            </div>
          </div>

          {/* Missions List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 className="font-title-lg" style={{ margin: 0, color: "#fff" }}>Relação de Missões</h3>

            {missions.length === 0 ? (
              <div className="glass-panel" style={{ padding: "40px", textAlign: "center", borderRadius: "16px", color: "var(--color-on-surface-variant)" }}>
                Nenhuma missão disponível no momento.
              </div>
            ) : (
              missions.map((m) => {
                const sub = mySubmissions[m.id];
                const isExpanded = expandedMissionId === m.id;
                const ans = answers[m.id] || {};

                // Determine Badge Info
                let badgeText = "Não Iniciado";
                let badgeBg = "rgba(255,255,255,0.03)";
                let badgeColor = "var(--color-on-surface-variant)";
                let badgeBorder = "1px solid rgba(255,255,255,0.06)";

                if (sub) {
                  if (sub.status === "approved") {
                    badgeText = "Concluído";
                    badgeBg = "rgba(16, 185, 129, 0.1)";
                    badgeColor = "#10b981";
                    badgeBorder = "1px solid rgba(16, 185, 129, 0.25)";
                  } else if (sub.status === "rejected") {
                    badgeText = "Corrigir";
                    badgeBg = "rgba(239, 68, 68, 0.1)";
                    badgeColor = "#ef4444";
                    badgeBorder = "1px solid rgba(239, 68, 68, 0.25)";
                  } else {
                    badgeText = "Em Correção";
                    badgeBg = "rgba(245, 158, 11, 0.1)";
                    badgeColor = "#f59e0b";
                    badgeBorder = "1px solid rgba(245, 158, 11, 0.25)";
                  }
                }

                return (
                  <div
                    key={m.id}
                    className="glass-panel"
                    style={{
                      borderRadius: "16px",
                      overflow: "hidden",
                      border: isExpanded ? "1px solid rgba(145, 179, 225, 0.3)" : "1px solid rgba(255,255,255,0.06)",
                      transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                      boxShadow: isExpanded ? "0 8px 32px rgba(0,0,0,0.3)" : "none"
                    }}
                  >
                    {/* Accordion Header */}
                    <div
                      onClick={() => setExpandedMissionId(isExpanded ? null : m.id)}
                      style={{
                        padding: "24px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                        userSelect: "none",
                        gap: "16px",
                        flexWrap: "wrap",
                        backgroundColor: isExpanded ? "rgba(255,255,255,0.01)" : "transparent"
                      }}
                    >
                      <div style={{ flex: 1, minWidth: "250px" }}>
                        <h4 className="font-title-md" style={{ margin: "0 0 4px 0", color: isExpanded ? "var(--color-secondary)" : "#fff", transition: "color 0.2s" }}>{m.title}</h4>
                        <p className="font-body-sm" style={{ color: "var(--color-on-surface-variant)", margin: 0 }}>
                          Submetido em: {sub ? new Date(sub.submitted_at).toLocaleDateString("pt-BR") : "Nunca"}
                        </p>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <span style={{
                          display: "inline-block",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          backgroundColor: badgeBg,
                          color: badgeColor,
                          border: badgeBorder,
                          textTransform: "uppercase"
                        }}>
                          {badgeText}
                        </span>

                        <span className="material-symbols-outlined" style={{ color: "var(--color-on-surface-variant)", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)" }}>
                          expand_more
                        </span>
                      </div>
                    </div>

                    {/* Accordion Body */}
                    {isExpanded && (
                      <div style={{ padding: "0 24px 28px 24px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                        <div style={{ padding: "20px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                          <h5 style={{ margin: "0 0 8px 0", color: "#a0aec0", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Descrição da Atividade</h5>
                          <p className="font-body-md" style={{ color: "#e2e8f0", margin: 0, whiteSpace: "pre-line" }}>{m.description}</p>
                        </div>

                        {/* Admin Feedback Box if rejected */}
                        {sub?.feedback && (
                          <div style={{ marginTop: "20px", padding: "16px", borderRadius: "8px", backgroundColor: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                            <span className="material-symbols-outlined" style={{ color: "#ef4444" }}>warning</span>
                            <div>
                              <div style={{ fontWeight: 600, color: "#ef4444", fontSize: "14px", marginBottom: "4px" }}>Feedback de Correção do Mentor:</div>
                              <div style={{ fontSize: "13px", color: "#fca5a5" }}>{sub.feedback}</div>
                            </div>
                          </div>
                        )}

                        {/* Submission Inputs */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginTop: "24px" }}>
                          
                          {/* Text Answer */}
                          {m.has_text_question && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              <label style={{ fontSize: "14px", fontWeight: 600, color: "#cbd5e0" }}>
                                Pergunta: {m.text_question} <span style={{ color: "#ef4444" }}>*</span>
                              </label>
                              <textarea
                                className="input-dark"
                                style={{ minHeight: "120px", resize: "vertical", width: "100%" }}
                                placeholder="Digite sua resposta aqui..."
                                value={ans.text_answer || ""}
                                disabled={sub?.status === "approved" || sub?.status === "pending"}
                                onChange={(e) => setAnswers(prev => ({
                                  ...prev,
                                  [m.id]: { ...prev[m.id], text_answer: e.target.value }
                                }))}
                              />
                            </div>
                          )}

                          {/* Form Link */}
                          {m.has_form_link && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              <label style={{ fontSize: "14px", fontWeight: 600, color: "#cbd5e0" }}>
                                Preenchimento do Formulário Externo <span style={{ color: "#ef4444" }}>*</span>
                              </label>
                              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", marginBottom: "8px" }}>
                                <a href={m.form_link} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px", textDecoration: "none", fontSize: "13px", padding: "8px 16px" }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>open_in_new</span> Acessar Formulário
                                </a>
                                <span style={{ fontSize: "12px", color: "var(--color-on-surface-variant)" }}>Responda o formulário acima e depois insira o link de envio abaixo.</span>
                              </div>
                              <input
                                type="url"
                                className="input-dark"
                                placeholder="Insira o link de confirmação do envio (ex: link do formulário preenchido ou URL do print)"
                                value={ans.form_submitted_link || ""}
                                disabled={sub?.status === "approved" || sub?.status === "pending"}
                                onChange={(e) => setAnswers(prev => ({
                                  ...prev,
                                  [m.id]: { ...prev[m.id], form_submitted_link: e.target.value }
                                }))}
                              />
                            </div>
                          )}

                          {/* File Upload */}
                          {m.has_file_upload && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              <label style={{ fontSize: "14px", fontWeight: 600, color: "#cbd5e0" }}>
                                {m.file_upload_label || "Upload da Atividade Técnica"} <span style={{ color: "#ef4444" }}>*</span>
                              </label>

                              {ans.file_url ? (
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)" }}>description</span>
                                    <div style={{ textAlign: "left" }}>
                                      <div style={{ fontSize: "14px", color: "#fff", fontWeight: 500 }}>{ans.file_name || "arquivo_entregue"}</div>
                                      <a href={ans.file_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: "var(--color-secondary)", textDecoration: "none" }}>Download do arquivo</a>
                                    </div>
                                  </div>
                                  
                                  {sub?.status !== "approved" && sub?.status !== "pending" && (
                                    <button
                                      type="button"
                                      onClick={() => setAnswers(prev => ({
                                        ...prev,
                                        [m.id]: { ...prev[m.id], file_url: "", file_name: "" }
                                      }))}
                                      style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center" }}
                                    >
                                      <span className="material-symbols-outlined">close</span>
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div style={{ position: "relative" }}>
                                  <input
                                    type="file"
                                    id={`file-upload-${m.id}`}
                                    style={{ display: "none" }}
                                    disabled={sub?.status === "approved" || sub?.status === "pending" || uploadingForMission[m.id]}
                                    onChange={(e) => handleStudentFileUpload(e, m.id)}
                                  />
                                  <label
                                    htmlFor={`file-upload-${m.id}`}
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      padding: "32px 16px",
                                      borderRadius: "8px",
                                      border: "2px dashed rgba(255,255,255,0.15)",
                                      backgroundColor: "rgba(255,255,255,0.01)",
                                      cursor: (sub?.status === "approved" || sub?.status === "pending") ? "not-allowed" : "pointer",
                                      transition: "all 0.2s"
                                    }}
                                    className="hover-gold-text"
                                  >
                                    <span className="material-symbols-outlined" style={{ fontSize: "36px", color: "var(--color-on-surface-variant)", marginBottom: "8px" }}>
                                      cloud_upload
                                    </span>
                                    <span style={{ fontSize: "13px", color: "#fff", fontWeight: 500 }}>
                                      {uploadingForMission[m.id] ? "Enviando arquivo..." : "Clique para selecionar ou arraste o arquivo"}
                                    </span>
                                    <span style={{ fontSize: "11px", color: "var(--color-on-surface-variant)", marginTop: "4px" }}>
                                      PDF, Planilhas Excel (XLSX, XLS), Word ou Zip de até 100 MB.
                                    </span>
                                  </label>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Submit Actions */}
                          {sub?.status !== "approved" && sub?.status !== "pending" && (
                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                              <button
                                className="btn-primary"
                                onClick={() => handleStudentSubmit(m.id)}
                                disabled={submittingResponse[m.id]}
                              >
                                {submittingResponse[m.id] ? "Enviando..." : sub ? "Re-enviar Missão" : "Enviar Missão"}
                              </button>
                            </div>
                          )}

                          {sub?.status === "pending" && (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-secondary)", fontSize: "13px", marginTop: "8px", justifyContent: "flex-end" }}>
                              <span className="material-symbols-outlined animate-spin" style={{ fontSize: "18px" }}>autorenew</span>
                              Aguardando correção do administrador.
                            </div>
                          )}

                          {sub?.status === "approved" && (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#10b981", fontSize: "13px", marginTop: "8px", justifyContent: "flex-end" }}>
                              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>check_circle</span>
                              Parabéns! Missão aprovada e concluída.
                            </div>
                          )}

                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ADMIN MODAL: CREATE / EDIT MISSION */}
      {showCreateModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          backdropFilter: "blur(4px)"
        }}>
          <div className="glass-panel" style={{
            maxWidth: "600px",
            width: "100%",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.12)",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column"
          }}>
            {/* Modal Header */}
            <div style={{ padding: "24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="font-title-md" style={{ margin: 0, color: "#fff" }}>
                {editingMission ? "Editar Missão" : "Criar Nova Missão"}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: "none", border: "none", color: "var(--color-on-surface-variant)", cursor: "pointer" }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveMission} style={{ padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "20px" }}>
              
              {/* Title */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", color: "#cbd5e0", fontWeight: 600 }}>Título da Missão</label>
                <input
                  type="text"
                  className="input-dark"
                  placeholder="Ex: Elaboração de Planilha EVTL"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>

              {/* Description */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", color: "#cbd5e0", fontWeight: 600 }}>Descrição / Instruções</label>
                <textarea
                  className="input-dark"
                  style={{ minHeight: "100px", resize: "vertical" }}
                  placeholder="Descreva as instruções detalhadas do que o aluno deve fazer..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
              </div>

              {/* Toggle 1: Text Question */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px" }}>
                <label className="custom-checkbox-container">
                  <input
                    type="checkbox"
                    checked={hasTextQuestion}
                    onChange={(e) => setHasTextQuestion(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Requer Resposta Escrita (Pergunta)
                </label>
                
                {hasTextQuestion && (
                  <input
                    type="text"
                    className="input-dark"
                    placeholder="Digite a pergunta para o aluno (ex: Qual a taxa de viabilidade encontrada?)"
                    value={textQuestion}
                    onChange={(e) => setTextQuestion(e.target.value)}
                    style={{ marginTop: "4px" }}
                  />
                )}
              </div>

              {/* Toggle 2: Form Link */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px" }}>
                <label className="custom-checkbox-container">
                  <input
                    type="checkbox"
                    checked={hasFormLink}
                    onChange={(e) => setHasFormLink(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Requer Preenchimento de Formulário Externo
                </label>
                
                {hasFormLink && (
                  <input
                    type="url"
                    className="input-dark"
                    placeholder="https://docs.google.com/forms/d/..."
                    value={formLink}
                    onChange={(e) => setFormLink(e.target.value)}
                    style={{ marginTop: "4px" }}
                  />
                )}
              </div>

              {/* Toggle 3: File Upload */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px", paddingBottom: "16px" }}>
                <label className="custom-checkbox-container">
                  <input
                    type="checkbox"
                    checked={hasFileUpload}
                    onChange={(e) => setHasFileUpload(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Requer Upload de Arquivo (Planilha, PDF, etc.)
                </label>
                
                {hasFileUpload && (
                  <input
                    type="text"
                    className="input-dark"
                    placeholder="Instrução do Upload (ex: Envie a planilha de custos indiretos compactada)"
                    value={fileUploadLabel}
                    onChange={(e) => setFileUploadLabel(e.target.value)}
                    style={{ marginTop: "4px" }}
                  />
                )}
              </div>

              {/* Modal Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px" }}>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setShowCreateModal(false)}
                  disabled={submittingMission}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submittingMission}
                >
                  {submittingMission ? "Salvando..." : "Salvar Missão"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ADMIN MODAL: CORRECT SUBMISSION */}
      {correctingSubmission && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          backdropFilter: "blur(4px)"
        }}>
          <div className="glass-panel" style={{
            maxWidth: "650px",
            width: "100%",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.12)",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column"
          }}>
            {/* Modal Header */}
            <div style={{ padding: "24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 className="font-title-md" style={{ margin: 0, color: "#fff" }}>
                  Avaliar Envio de Atividade
                </h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "var(--color-on-surface-variant)" }}>
                  Aluno: {correctingSubmission.members?.name} | {correctingSubmission.members?.email}
                </p>
              </div>
              <button
                onClick={() => setCorrectingSubmission(null)}
                style={{ background: "none", border: "none", color: "var(--color-on-surface-variant)", cursor: "pointer" }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Mission Details */}
              <div>
                <div style={{ fontSize: "12px", color: "var(--color-secondary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Missão</div>
                <h4 style={{ margin: 0, color: "#fff", fontSize: "16px" }}>
                  {missions.find(m => m.id === correctingSubmission.mission_id)?.title || "Missão Técnica"}
                </h4>
              </div>

              {/* Answers Display */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "16px", backgroundColor: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <h5 style={{ margin: 0, fontSize: "14px", color: "#fff", fontWeight: 600 }}>Entregas do Aluno:</h5>

                {/* Text Answer */}
                {correctingSubmission.text_answer && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "12px" }}>
                    <div style={{ fontSize: "12px", color: "var(--color-on-surface-variant)", fontWeight: 500 }}>
                      Pergunta: {missions.find(m => m.id === correctingSubmission.mission_id)?.text_question}
                    </div>
                    <div style={{ fontSize: "14px", color: "#e2e8f0", backgroundColor: "rgba(0,0,0,0.15)", padding: "12px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.03)", whiteSpace: "pre-line" }}>
                      {correctingSubmission.text_answer}
                    </div>
                  </div>
                )}

                {/* Form Link */}
                {correctingSubmission.form_submitted_link && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "12px" }}>
                    <div style={{ fontSize: "12px", color: "var(--color-on-surface-variant)", fontWeight: 500 }}>Confirmação do Formulário:</div>
                    <div>
                      <a href={correctingSubmission.form_submitted_link} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--color-secondary)", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>open_in_new</span> {correctingSubmission.form_submitted_link}
                      </a>
                    </div>
                  </div>
                )}

                {/* File Upload */}
                {correctingSubmission.file_url && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "12px" }}>
                    <div style={{ fontSize: "12px", color: "var(--color-on-surface-variant)", fontWeight: 500 }}>Arquivo Técnico Enviado:</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)", fontSize: "20px" }}>description</span>
                      <a href={correctingSubmission.file_url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--color-secondary)", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>
                        {correctingSubmission.file_name || "Baixar arquivo da entrega"} <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>download</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Correction Fields */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "14px", color: "#cbd5e0", fontWeight: 600 }}>Feedback / Observações</label>
                <textarea
                  className="input-dark"
                  style={{ minHeight: "100px", resize: "vertical", width: "100%" }}
                  placeholder="Escreva orientações para o aluno (necessário principalmente em caso de reprovação/ajuste)..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />
              </div>

              {/* Modal Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px" }}>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setCorrectingSubmission(null)}
                  disabled={processingCorrection}
                >
                  Fechar
                </button>
                <button
                  type="button"
                  className="btn-outline"
                  style={{ borderColor: "rgba(239, 68, 68, 0.3)", color: "#ef4444" }}
                  onClick={() => handleProcessCorrection("rejected")}
                  disabled={processingCorrection}
                >
                  Reprovar / Solicitar Ajuste
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => handleProcessCorrection("approved")}
                  disabled={processingCorrection}
                >
                  Aprovar Entrega
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
