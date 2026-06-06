"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { SkeletonManutencao } from "@/components/SkeletonLoading";

interface Member {
  name: string;
  email: string;
  role: string;
  company: string;
  industry: string;
  location: string;
  initials: string;
  img: string;
  status: "Ativo" | "Inativo";
  addedAt?: string;
  deactivatedAt?: string;
}

interface WebhookLog {
  id: string;
  timestamp: string;
  type: string;
  email: string;
  payload: unknown;
}

export default function ManutencaoPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulation form states
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simType, setSimType] = useState("customer.member_added");
  const [simName, setSimName] = useState("");
  const [simEmail, setSimEmail] = useState("");
  const [simProduct, setSimProduct] = useState("CLUB PRO CLS");
  const [simulating, setSimulating] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Copy helper states
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");

  // Helper to fetch data without setting React state directly (avoids setState-in-effect lint)
  const fetchMembersAndLogs = async (): Promise<{ members: Member[]; logs: WebhookLog[] }> => {
    try {
      const res = await fetch("/api/members");
      if (res.ok) {
        const data = await res.json();
        return { members: data.members || [], logs: data.logs || [] };
      }
      return { members: [], logs: [] };
    } catch (err) {
      console.error("Failed to fetch integration data:", err);
      return { members: [], logs: [] };
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchMembersAndLogs();
      setMembers(data.members);
      setLogs(data.logs);
      setLoading(false);
    };

    void loadData();

    if (typeof window !== "undefined") {
      void Promise.resolve().then(() => setWebhookUrl(`${window.location.origin}/api/webhook/hubla`));
    }
  }, []);

  if (loading) {
    return <SkeletonManutencao />;
  }

  return (
    <div className="animate-fadeIn">
      {/* Styles injected for custom components */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .custom-spinner-small {
          animation: spin 1s linear infinite;
          border-top: 2px solid var(--color-on-secondary);
          border-right: 2px solid transparent;
          border-bottom: 2px solid transparent;
          border-left: 2px solid transparent;
          border-radius: 50%;
          width: 18px;
          height: 18px;
        }
      `}</style>

      {/* Page Header */}
      <section style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "24px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)", fontSize: "28px" }}>build</span>
            <h2 className="font-display-mobile" style={{ color: "var(--color-on-surface)", margin: 0 }}>
              Painel de Manutenção
            </h2>
          </div>
          <p className="font-body-lg" style={{ color: "var(--color-on-surface-variant)" }}>
            Configuração de Webhooks, Logs de transações e Simulador de checkout da Hubla.
          </p>
        </div>

        <Link
          href="/membros"
          className="btn-primary"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "rgba(255,255,255,0.05)",
            color: "var(--color-on-surface)",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "8px 16px",
            borderRadius: "4px",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>group</span>
          Ver Diretório de Membros
        </Link>
      </section>

      {/* Main Content Grid: Config + Logs */}
      <div
        className="glass-panel metallic-edge"
        style={{
          borderRadius: "4px",
          padding: "32px",
          marginBottom: "40px",
          borderTop: "4px solid var(--color-secondary)",
          backgroundColor: "rgba(20, 19, 22, 0.7)",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "40px" }}>
          
          {/* Left Column: Config */}
          <div>
            <h3 className="font-title-lg" style={{ color: "var(--color-secondary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="material-symbols-outlined">sync_alt</span>
              Configuração Hubla Webhooks
            </h3>
            <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)", marginBottom: "24px", lineHeight: "1.6" }}>
              Sincronize as assinaturas e vendas do checkout da Hubla em tempo real. Configure uma URL de Webhook no painel da Hubla com os parâmetros abaixo.
            </p>

            {/* URL */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", color: "var(--color-on-surface)", fontSize: "11px", fontWeight: 700, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                URL do Webhook
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  readOnly
                  value={webhookUrl}
                  className="input-dark"
                  style={{ flex: 1, fontFamily: "monospace", fontSize: "13px" }}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(webhookUrl);
                    setCopiedUrl(true);
                    setTimeout(() => setCopiedUrl(false), 2000);
                  }}
                  className="btn-primary"
                  style={{
                    padding: "0 12px",
                    backgroundColor: "rgba(145, 179, 225, 0.1)",
                    color: "var(--color-secondary)",
                    border: "1px solid rgba(145, 179, 225, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "48px",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                    {copiedUrl ? "check" : "content_copy"}
                  </span>
                </button>
              </div>
            </div>

            {/* Security Token */}
            <div style={{ marginBottom: "32px" }}>
              <label style={{ display: "block", color: "var(--color-on-surface)", fontSize: "11px", fontWeight: 700, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Token Customizado (`x-hubla-token`)
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="password"
                  readOnly
                  value="0Vu9zLXFHKXFXmwtEVQvrQBLv1Wx1cjNO1jSZtgO2VP0yDvvvtBH7YH7nvSMI64R"
                  id="hubla-token-input"
                  className="input-dark"
                  style={{ flex: 1, fontFamily: "monospace", fontSize: "13px" }}
                />
                <button
                  onClick={() => {
                    const input = document.getElementById("hubla-token-input") as HTMLInputElement;
                    if (input) {
                      input.type = input.type === "password" ? "text" : "password";
                    }
                  }}
                  className="btn-primary"
                  style={{
                    padding: "0 12px",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    color: "var(--color-on-surface)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    minWidth: "48px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>visibility</span>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText("0Vu9zLXFHKXFXmwtEVQvrQBLv1Wx1cjNO1jSZtgO2VP0yDvvvtBH7YH7nvSMI64R");
                    setCopiedToken(true);
                    setTimeout(() => setCopiedToken(false), 2000);
                  }}
                  className="btn-primary"
                  style={{
                    padding: "0 12px",
                    backgroundColor: "rgba(145, 179, 225, 0.1)",
                    color: "var(--color-secondary)",
                    border: "1px solid rgba(145, 179, 225, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "48px",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                    {copiedToken ? "check" : "content_copy"}
                  </span>
                </button>
              </div>
              <span style={{ fontSize: "11px", color: "var(--color-on-surface-variant)", marginTop: "8px", display: "block", opacity: 0.8 }}>
                * No painel da Hubla, crie uma integração webhook e adicione um Header com a chave <code style={{ color: "var(--color-secondary)" }}>x-hubla-token</code> e o valor acima.
              </span>
            </div>

            {/* Simulation button */}
            <button
              onClick={() => setShowSimulateModal(true)}
              className="btn-primary"
              style={{
                width: "100%",
                backgroundColor: "var(--color-secondary)",
                color: "var(--color-on-secondary)",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "12px 20px",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>science</span>
              Simular Evento de Webhook
            </button>
          </div>

          {/* Right Column: Webhook Logs */}
          <div style={{ display: "flex", flexDirection: "column", borderLeft: "1px solid rgba(255,255,255,0.05)", paddingLeft: "40px" }}>
            <h3 className="font-title-lg" style={{ color: "var(--color-on-surface)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)" }}>history</span>
              Logs de Atividades do Webhook
            </h3>
            <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)", marginBottom: "20px" }}>
              Registro dos últimos webhooks recebidos do checkout da Hubla em ambiente local.
            </p>

            {logs.length === 0 ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "4px", color: "var(--color-on-surface-variant)", textAlign: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "32px", opacity: 0.5, marginBottom: "8px" }}>info</span>
                Nenhum log recebido ainda.<br/>Use o simulador ao lado para testar a comunicação.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "380px", overflowY: "auto", paddingRight: "8px" }}>
                {logs.map((log) => (
                  <div
                    key={log.id}
                    style={{
                      backgroundColor: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: "4px",
                      padding: "16px",
                      fontSize: "13px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "2px",
                          backgroundColor: log.type === "customer.member_added" ? "rgba(145, 179, 225, 0.15)" : "rgba(255,100,100,0.15)",
                          color: log.type === "customer.member_added" ? "var(--color-secondary)" : "#ffb4ab",
                          border: log.type === "customer.member_added" ? "1px solid rgba(145, 179, 225, 0.3)" : "1px solid rgba(255, 100, 100, 0.3)",
                        }}
                      >
                        {log.type}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--color-on-surface-variant)" }}>
                        {new Date(log.timestamp).toLocaleString("pt-BR")}
                      </span>
                    </div>

                    <div style={{ color: "var(--color-on-surface)", fontWeight: 500, marginBottom: "8px" }}>
                      E-mail: {log.email}
                    </div>

                    <div>
                      <button
                        onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--color-secondary)",
                          cursor: "pointer",
                          padding: 0,
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                          {expandedLogId === log.id ? "expand_less" : "expand_more"}
                        </span>
                        {expandedLogId === log.id ? "Ocultar Payload" : "Inspecionar Payload"}
                      </button>

                      {expandedLogId === log.id && (
                        <pre
                          style={{
                            marginTop: "8px",
                            backgroundColor: "rgba(0,0,0,0.6)",
                            padding: "12px",
                            borderRadius: "4px",
                            overflowX: "auto",
                            fontFamily: "monospace",
                            fontSize: "11px",
                            color: "#e1e0ff",
                            border: "1px solid rgba(255,255,255,0.05)",
                            maxHeight: "180px",
                          }}
                        >
                          <code>{JSON.stringify(log.payload, null, 2)}</code>
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mini Member list below for quick validation */}
      <section style={{ marginBottom: "24px" }}>
        <h3 className="font-headline-sm" style={{ color: "var(--color-on-surface)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)" }}>checklist_rtl</span>
          Verificação Rápida de Membros
        </h3>
        <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)", marginBottom: "20px" }}>
          Veja em tempo real a sincronização e os status dos membros cadastrados.
        </p>

        <div className="glass-panel" style={{ padding: "20px", borderRadius: "4px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
            {members.map((member, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "4px",
                  backgroundColor: "rgba(255,255,255,0.01)",
                  opacity: member.status === "Inativo" ? 0.6 : 1,
                  filter: member.status === "Inativo" ? "grayscale(40%)" : "none",
                }}
              >
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", overflow: "hidden", border: "1px solid rgba(145, 179, 225,0.2)" }}>
                  <img src={member.img} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: "var(--color-on-surface)", fontWeight: 600, fontSize: "14px", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {member.name}
                  </p>
                  <p style={{ color: "var(--color-on-surface-variant)", fontSize: "11px", margin: "2px 0 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {member.email}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: "8px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    padding: "2px 6px",
                    borderRadius: "2px",
                    backgroundColor: member.status === "Inativo" ? "rgba(255, 100, 100, 0.15)" : "rgba(145, 179, 225, 0.15)",
                    color: member.status === "Inativo" ? "#ffb4ab" : "var(--color-secondary)",
                    border: member.status === "Inativo" ? "1px solid rgba(255, 100, 100, 0.3)" : "1px solid rgba(145, 179, 225, 0.3)"
                  }}
                >
                  {member.status || "Ativo"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simulation Modal */}
      {showSimulateModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
        >
          <div
            className="glass-panel metallic-edge"
            style={{
              width: "100%",
              maxWidth: "500px",
              backgroundColor: "var(--color-surface-container-low)",
              borderRadius: "4px",
              padding: "32px",
              boxShadow: "0 24px 48px rgba(0,0,0,0.6)",
              border: "1px solid rgba(145, 179, 225, 0.2)",
              position: "relative",
            }}
          >
            {/* Close */}
            <button
              onClick={() => {
                setShowSimulateModal(false);
                setSimName("");
                setSimEmail("");
              }}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "transparent",
                border: "none",
                color: "var(--color-on-surface-variant)",
                cursor: "pointer",
              }}
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="font-headline-sm" style={{ color: "var(--color-on-surface)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)" }}>science</span>
              Simulador de Webhooks
            </h3>
            <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)", marginBottom: "24px" }}>
              Envie uma chamada simulada com payload de checkout para testar o comportamento do webhook e a reatividade do painel de membros.
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!simEmail || !simName) return;

                setSimulating(true);
                try {
                  const response = await fetch("/api/members/simulate", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      type: simType,
                      name: simName,
                      email: simEmail,
                      product: simProduct,
                    }),
                  });

                  if (response.ok) {
                    await fetchMembersAndLogs();
                    setShowSimulateModal(false);
                    setSimName("");
                    setSimEmail("");
                  } else {
                    const errData = await response.json();
                    alert(`Falha na simulação: ${errData.error || "Erro de servidor"}`);
                  }
                } catch (err: unknown) {
                  console.error(err);
                  const message = err instanceof Error ? err.message : String(err);
                  alert(`Erro de conexão: ${message}`);
                } finally {
                  setSimulating(false);
                }
              }}
            >
              {/* Event dropdown */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", color: "var(--color-on-surface)", fontSize: "12px", fontWeight: 700, marginBottom: "6px", textTransform: "uppercase" }}>
                  Tipo de Evento Hubla
                </label>
                <select
                  className="input-dark"
                  value={simType}
                  onChange={(e) => setSimType(e.target.value)}
                  style={{ width: "100%", cursor: "pointer" }}
                  required
                >
                  <option value="customer.member_added">customer.member_added (Adicionar/Ativar Membro)</option>
                  <option value="customer.member_removed">customer.member_removed (Remover/Inativar Membro)</option>
                </select>
              </div>

              {/* Name */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", color: "var(--color-on-surface)", fontSize: "12px", fontWeight: 700, marginBottom: "6px", textTransform: "uppercase" }}>
                  Nome do Cliente
                </label>
                <input
                  type="text"
                  placeholder="Ex: João da Silva"
                  className="input-dark"
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  style={{ width: "100%" }}
                  required
                />
              </div>

              {/* Email */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", color: "var(--color-on-surface)", fontSize: "12px", fontWeight: 700, marginBottom: "6px", textTransform: "uppercase" }}>
                  E-mail do Cliente
                </label>
                <input
                  type="email"
                  placeholder="Ex: joao.silva@email.com"
                  className="input-dark"
                  value={simEmail}
                  onChange={(e) => setSimEmail(e.target.value)}
                  style={{ width: "100%" }}
                  required
                />
              </div>

              {/* Product */}
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", color: "var(--color-on-surface)", fontSize: "12px", fontWeight: 700, marginBottom: "6px", textTransform: "uppercase" }}>
                  Nome do Produto
                </label>
                <input
                  type="text"
                  placeholder="Ex: CLUB PRO CLS"
                  className="input-dark"
                  value={simProduct}
                  onChange={(e) => setSimProduct(e.target.value)}
                  style={{ width: "100%" }}
                  required
                />
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowSimulateModal(false);
                    setSimName("");
                    setSimEmail("");
                  }}
                  className="btn-primary"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    color: "var(--color-on-surface)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    padding: "8px 16px",
                  }}
                  disabled={simulating}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    backgroundColor: "var(--color-secondary)",
                    color: "var(--color-on-secondary)",
                    padding: "8px 24px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  disabled={simulating}
                >
                  {simulating && <div className="custom-spinner-small" />}
                  {simulating ? "Disparando..." : "Disparar Webhook"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ height: "48px" }} />
    </div>
  );
}
