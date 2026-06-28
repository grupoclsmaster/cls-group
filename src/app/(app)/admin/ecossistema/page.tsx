"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tag: string;
  image: string;
  cta_text: string;
  cta_link: string;
  disabled: boolean;
  sequence_order: number;
}

export default function EcosystemAdminPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const showStatus = (type: "success" | "error", text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 5000);
  };

  const loadBanners = async () => {
    try {
      const { data, error } = await supabase
        .from("ecosystem_banners")
        .select("*")
        .order("sequence_order", { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao carregar banners do ecossistema.");
    }
  };

  useEffect(() => {
    const checkAdminAndLoad = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const emailLower = user.email?.toLowerCase();
        const isEmailAdmin = emailLower === "magnorjsantos@hotmail.com" || emailLower === "mayaracosta00@gmail.com";

        const { data: member } = await supabase
          .from("members")
          .select("member_type")
          .eq("id", user.id)
          .single();

        if ((member && member.member_type === "admin") || isEmailAdmin) {
          setIsAdmin(true);
          await loadBanners();
        } else {
          router.push("/sem-permissao");
        }
      } catch (err: any) {
        console.error("Erro no carregamento inicial:", err);
        showStatus("error", err.message || "Erro de permissão.");
      } finally {
        setLoading(false);
      }
    };

    void checkAdminAndLoad();
  }, [router, supabase]);

  const handleDeleteBanner = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este slide?")) return;
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from("ecosystem_banners")
        .delete()
        .eq("id", id);

      if (error) throw error;
      showStatus("success", "Slide excluído com sucesso!");
      await loadBanners();
    } catch (err: any) {
      showStatus("error", err.message || "Erro ao excluir slide.");
    } finally {
      setDeletingId(null);
    }
  };

  const moveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const list = [...banners];
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    // Update sequence orders locally
    const updatedList = list.map((b, idx) => ({
      ...b,
      sequence_order: idx + 1
    }));

    setBanners(updatedList);

    try {
      // Perform parallel updates to database
      const updates = updatedList.map((b) => 
        supabase
          .from("ecosystem_banners")
          .update({ sequence_order: b.sequence_order })
          .eq("id", b.id)
      );

      await Promise.all(updates);
      showStatus("success", "Ordem atualizada!");
    } catch (err: any) {
      showStatus("error", "Erro ao atualizar ordenação no banco.");
      void loadBanners();
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <p style={{ color: "var(--color-outline)" }}>Carregando dados do Ecossistema...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="animate-fadeIn" style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "60px" }}>
      {/* Navigation Breadcrumb */}
      <section style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }} className="font-label-caps">
        <Link href="/admin/painel" style={{ color: "var(--color-on-surface-variant)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }} className="hover-gold-text">
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_back</span>
          PAINEL DE CONTROLE
        </Link>
        <span style={{ color: "var(--color-surface-variant)" }}>/</span>
        <span style={{ color: "var(--color-on-surface-variant)" }}>Ecossistema</span>
      </section>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 className="font-display-mobile" style={{ color: "var(--color-on-surface)", marginBottom: "8px" }}>Administrar Ecossistema</h2>
          <p className="font-body-lg" style={{ color: "var(--color-on-surface-variant)", margin: 0 }}>
            Gerencie os slides (banners) exibidos na página principal do ecossistema.
          </p>
        </div>

        <Link href="/admin/ecossistema/novo" className="btn-primary" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>add_box</span>
          NOVO SLIDE
        </Link>
      </div>

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

      <div className="glass-panel metallic-edge" style={{ padding: "0px", borderRadius: "8px", overflow: "hidden" }}>
        {banners.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--color-outline)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "48px", marginBottom: "16px" }}>layers</span>
            <p className="font-body-lg" style={{ margin: 0 }}>Nenhum slide cadastrado para a página do ecossistema.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", background: "rgba(255, 255, 255, 0.02)" }}>
                  <th style={{ padding: "16px 24px", fontSize: "11px", color: "var(--color-outline)", fontWeight: 700 }}>ORDEM</th>
                  <th style={{ padding: "16px 24px", fontSize: "11px", color: "var(--color-outline)", fontWeight: 700 }}>SLIDE</th>
                  <th style={{ padding: "16px 24px", fontSize: "11px", color: "var(--color-outline)", fontWeight: 700 }}>TAG</th>
                  <th style={{ padding: "16px 24px", fontSize: "11px", color: "var(--color-outline)", fontWeight: 700 }}>CTA</th>
                  <th style={{ padding: "16px 24px", fontSize: "11px", color: "var(--color-outline)", fontWeight: 700 }}>STATUS</th>
                  <th style={{ padding: "16px 24px", fontSize: "11px", color: "var(--color-outline)", fontWeight: 700, textAlign: "right" }}>AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {banners.map((b, idx) => (
                  <tr 
                    key={b.id} 
                    style={{ 
                      borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                      backgroundColor: b.disabled ? "rgba(255, 255, 255, 0.01)" : "transparent"
                    }}
                  >
                    {/* Order Controls */}
                    <td style={{ padding: "16px 24px", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <button 
                          onClick={() => moveOrder(idx, "up")}
                          disabled={idx === 0}
                          className="btn-outline"
                          style={{ padding: "2px", minWidth: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", opacity: idx === 0 ? 0.3 : 1 }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_upward</span>
                        </button>
                        <button 
                          onClick={() => moveOrder(idx, "down")}
                          disabled={idx === banners.length - 1}
                          className="btn-outline"
                          style={{ padding: "2px", minWidth: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", opacity: idx === banners.length - 1 ? 0.3 : 1 }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_downward</span>
                        </button>
                      </div>
                    </td>

                    {/* Image & Title/Subtitle */}
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div 
                          style={{ 
                            width: "80px", 
                            height: "50px", 
                            borderRadius: "4px", 
                            backgroundImage: `url('${b.image}')`, 
                            backgroundSize: "cover", 
                            backgroundPosition: "center",
                            border: "1px solid rgba(255, 255, 255, 0.08)"
                          }} 
                        />
                        <div>
                          <h4 style={{ margin: 0, fontSize: "14px", color: "#ffffff", fontWeight: 600 }}>{b.title}</h4>
                          {b.subtitle && <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "var(--color-outline)" }}>{b.subtitle}</p>}
                        </div>
                      </div>
                    </td>

                    {/* Tag */}
                    <td style={{ padding: "16px 24px" }}>
                      {b.tag ? (
                        <span 
                          style={{ 
                            fontSize: "10px", 
                            backgroundColor: "rgba(145, 179, 225, 0.1)", 
                            color: "var(--color-secondary)", 
                            padding: "4px 8px", 
                            borderRadius: "20px", 
                            fontWeight: 700 
                          }}
                        >
                          {b.tag}
                        </span>
                      ) : (
                        <span style={{ color: "var(--color-outline)", fontSize: "12px" }}>-</span>
                      )}
                    </td>

                    {/* CTA Details */}
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontSize: "12px", color: "#ffffff", fontWeight: 500 }}>{b.cta_text}</span>
                        <a 
                          href={b.cta_link} 
                          target="_blank" 
                          rel="noreferrer" 
                          style={{ fontSize: "11px", color: "var(--color-secondary)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "2px" }}
                          className="hover-gold-text"
                        >
                          Link <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>open_in_new</span>
                        </a>
                      </div>
                    </td>

                    {/* Disabled Status */}
                    <td style={{ padding: "16px 24px" }}>
                      <span 
                        style={{ 
                          fontSize: "11px", 
                          color: b.disabled ? "#FFB74D" : "#81C784", 
                          backgroundColor: b.disabled ? "rgba(255, 183, 77, 0.1)" : "rgba(76, 175, 80, 0.1)", 
                          padding: "4px 8px", 
                          borderRadius: "4px",
                          fontWeight: 600
                        }}
                      >
                        {b.disabled ? "Desativado" : "Ativo"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                        <Link 
                          href={`/admin/ecossistema/${b.id}`} 
                          style={{ color: "var(--color-secondary)", display: "flex", alignItems: "center" }}
                          title="Editar Slide"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>edit</span>
                        </Link>
                        <button 
                          onClick={() => handleDeleteBanner(b.id)}
                          disabled={deletingId === b.id}
                          style={{ background: "none", border: "none", color: "var(--color-error)", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}
                          title="Excluir Slide"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
