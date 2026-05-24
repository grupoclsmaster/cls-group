"use client";
import Link from "next/link";
import { useState } from "react";

export default function CadastroPage() {
  const [form, setForm] = useState({ nome: "", email: "", senha: "", confirmar: "" });

  return (
    <div style={{ backgroundColor: "#010105", minHeight: "100vh", display: "flex", flexDirection: "column", color: "var(--color-on-surface)" }}>
      {/* Header */}
      <header style={{ position: "fixed", top: 0, width: "100%", zIndex: 50, backgroundColor: "rgba(19,19,22,0.7)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 40px", height: "80px", maxWidth: "1440px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)", fontSize: "28px" }}>diamond</span>
            <div className="font-display-mobile" style={{ color: "var(--color-secondary)", letterSpacing: "0.2em", textTransform: "uppercase" }}>CLUB PRO CLS</div>
          </div>
          <nav style={{ display: "flex", gap: "32px" }}>
            <Link href="/login" className="font-title-lg" style={{ color: "var(--color-on-surface-variant)", textDecoration: "none" }}>Entrar</Link>
            <span className="font-title-lg" style={{ color: "var(--color-secondary)", borderBottom: "2px solid var(--color-secondary)", paddingBottom: "4px" }}>Cadastrar</span>
          </nav>
          <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)", fontSize: "28px" }}>help_outline</span>
        </div>
      </header>

      <main style={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "128px 20px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "600px", height: "600px", backgroundColor: "var(--color-primary-container)", borderRadius: "50%", filter: "blur(120px)", opacity: 0.2, pointerEvents: "none" }} />

        <div className="glass-panel-dark animate-fadeIn" style={{ width: "100%", maxWidth: "480px", borderRadius: "8px", padding: "40px", position: "relative", zIndex: 10 }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h1 className="font-headline-md" style={{ color: "var(--color-on-surface)", marginBottom: "8px" }}>Criar Conta</h1>
            <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)" }}>Junte-se ao CLUB PRO CLS e transforme sua visão.</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); window.location.href = "/dashboard"; }} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {[
              { id: "nome", label: "Nome Completo", type: "text", placeholder: "Seu nome completo", icon: "person" },
              { id: "email", label: "E-mail", type: "email", placeholder: "seu@email.com", icon: "mail" },
              { id: "senha", label: "Senha", type: "password", placeholder: "Mínimo 8 caracteres", icon: "lock" },
              { id: "confirmar", label: "Confirmar Senha", type: "password", placeholder: "Repita sua senha", icon: "lock_reset" },
            ].map((field) => (
              <div key={field.id} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label htmlFor={field.id} className="font-label-caps" style={{ color: "var(--color-on-surface-variant)" }}>{field.label}</label>
                <div style={{ position: "relative" }}>
                  <input
                    id={field.id}
                    type={field.type}
                    className="input-dark"
                    placeholder={field.placeholder}
                    required
                    style={{ paddingRight: "40px" }}
                    onChange={(e) => setForm({ ...form, [field.id]: e.target.value })}
                  />
                  <span className="material-symbols-outlined" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-on-surface-variant)", fontSize: "20px", pointerEvents: "none" }}>{field.icon}</span>
                </div>
              </div>
            ))}

            <button type="submit" className="btn-primary" style={{ marginTop: "8px", width: "100%" }}>
              CRIAR CONTA
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>
            </button>
          </form>

          <div style={{ marginTop: "24px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "20px" }}>
            <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)" }}>
              Já tem uma conta?{" "}
              <Link href="/login" style={{ color: "var(--color-secondary)", fontWeight: 600, textDecoration: "none", marginLeft: "4px" }}>Entrar</Link>
            </p>
          </div>
        </div>
      </main>

      <footer style={{ backgroundColor: "var(--color-surface-container-lowest)", borderTop: "1px solid rgba(255,255,255,0.05)", padding: "32px 40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1440px", margin: "0 auto", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)", fontSize: "18px" }}>diamond</span>
            <span className="font-label-caps" style={{ color: "var(--color-secondary)" }}>CLUB PRO CLS</span>
          </div>
          <span className="font-body-md" style={{ color: "var(--color-on-surface-variant)" }}>© {new Date().getFullYear()} CLUB PRO CLS. Privacidade e Termos.</span>
        </div>
      </footer>
    </div>
  );
}
