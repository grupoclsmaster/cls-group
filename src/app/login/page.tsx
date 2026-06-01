"use client";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  return (
    <div className="login-container" style={{ display: "flex", minHeight: "100vh", backgroundColor: "#010105", color: "var(--color-on-surface)" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .login-left {
          flex: 1.3;
          position: relative;
          background-image: url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200');
          background-size: cover;
          background-position: center;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 60px;
          overflow: hidden;
        }
        .login-left-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(1, 1, 5, 0.96) 0%, rgba(7, 7, 50, 0.5) 100%);
          z-index: 1;
        }
        .login-left-content {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .login-right {
          width: 540px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 60px;
          background-color: #010105;
          border-left: 1px solid rgba(255, 255, 255, 0.05);
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }
        .login-input-wrapper {
          position: relative;
          width: 100%;
        }
        .login-input {
          background-color: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #e5e1e6;
          border-radius: 4px;
          padding: 16px 18px 16px 48px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          outline: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          width: 100%;
          backdrop-filter: blur(10px);
        }
        .login-input:focus {
          border-color: var(--color-secondary);
          box-shadow: 0 0 0 1px var(--color-secondary), 0 0 20px rgba(237, 192, 102, 0.15);
          background-color: rgba(255, 255, 255, 0.04);
        }
        .login-input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.4);
          font-size: 20px;
          pointer-events: none;
          transition: color 0.3s ease;
        }
        .login-input:focus + .login-input-icon {
          color: var(--color-secondary);
        }
        .login-input-btn {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.4);
          font-size: 20px;
          cursor: pointer;
          transition: color 0.3s ease;
          user-select: none;
        }
        .login-input-btn:hover {
          color: var(--color-on-surface);
        }
        .glow-orb {
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background-color: rgba(237, 192, 102, 0.04);
          filter: blur(100px);
          pointer-events: none;
          z-index: 1;
        }
        .glow-orb-top {
          top: -200px;
          right: -200px;
        }
        .glow-orb-bottom {
          bottom: -200px;
          left: -200px;
          background-color: rgba(194, 194, 245, 0.03);
        }
        .perk-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 24px;
        }
        .perk-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: rgba(237, 192, 102, 0.08);
          border: 1px solid rgba(237, 192, 102, 0.15);
          color: var(--color-secondary);
          flex-shrink: 0;
        }
        @media (max-width: 1023px) {
          .login-left { display: none !important; }
          .login-right { width: 100% !important; padding: 40px 24px !important; }
        }
      ` }} />

      {/* Left side: Premium branding & benefits */}
      <div className="login-left">
        <div className="login-left-overlay" />
        <div className="login-left-content">
          {/* Logo Branding */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)", fontSize: "32px" }}>diamond</span>
            <div className="font-display" style={{ color: "var(--color-secondary)", letterSpacing: "0.15em", textTransform: "uppercase", fontSize: "22px" }}>
              CLUB PRO CLS
            </div>
          </div>

          {/* Slogan and details */}
          <div style={{ maxWidth: "540px", margin: "auto 0" }}>
            <span className="font-label-caps" style={{ color: "var(--color-secondary)", fontSize: "11px", display: "inline-block", marginBottom: "16px", border: "1px solid rgba(237,192,102,0.3)", padding: "4px 12px", borderRadius: "100px", backgroundColor: "rgba(237,192,102,0.05)" }}>
              Acesso Exclusivo
            </span>
            <h2 className="font-display" style={{ fontSize: "clamp(28px, 3vw, 42px)", lineHeight: 1.2, color: "#fff", marginBottom: "24px", fontWeight: 800 }}>
              A comunidade de elite dos incorporadores e construtores
            </h2>
            <p className="font-body-lg" style={{ color: "rgba(255,255,255,0.7)", marginBottom: "40px", fontSize: "16px" }}>
              Um ecossistema fechado focado em potencializar carreiras, estruturar viabilidade de negócios e criar conexões reais de alto padrão.
            </p>

            {/* Perks list */}
            <div>
              <div className="perk-item">
                <div className="perk-icon-wrapper">
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>hub</span>
                </div>
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>Networking Estruturado</h4>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: "1.4" }}>Conecte-se e faça negócios diretamente com fundadores, diretores e investidores do setor.</p>
                </div>
              </div>

              <div className="perk-item">
                <div className="perk-icon-wrapper">
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>school</span>
                </div>
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>Mentorias de Alto Impacto</h4>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: "1.4" }}>Aprenda de forma prática com profissionais atuantes na estruturação de SPE/SCP e engenharia de custos.</p>
                </div>
              </div>

              <div className="perk-item">
                <div className="perk-icon-wrapper">
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>monetization_on</span>
                </div>
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>Landbanks & Investimentos</h4>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: "1.4" }}>Acesso privilegiado a estudos de viabilidade técnica, novos landbanks e co-investimentos.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer of left side */}
          <div style={{ display: "flex", gap: "24px", color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>lock</span>
              Conexão Segura SSL
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>verified</span>
              Selo CLS Master
            </span>
          </div>
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="login-right">
        {/* Glow orbs */}
        <div className="glow-orb glow-orb-top" />
        <div className="glow-orb glow-orb-bottom" />

        {/* Brand name for responsive/mobile view */}
        <div style={{ display: "flex", justifyContent: "flex-start", position: "relative", zIndex: 10 }}>
          <div style={{ display: "none" }} className="mobile-brand-wrapper">
            {/* Will display on small screens via style overrides if necessary, or keep it aligned */}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }} className="mobile-only-logo">
            <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)", fontSize: "24px" }}>diamond</span>
            <div className="font-display-mobile" style={{ color: "var(--color-secondary)", letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "16px" }}>
              CLUB PRO CLS
            </div>
          </div>
        </div>

        {/* Center Form Container */}
        <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", zIndex: 10, width: "100%", maxWidth: "380px", margin: "0 auto" }}>
          <div style={{ marginBottom: "36px" }}>
            <h1 className="font-headline-md" style={{ color: "var(--color-on-surface)", marginBottom: "8px", fontSize: "28px", fontWeight: 700 }}>
              Acesso Restrito
            </h1>
            <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)" }}>
              Insira suas credenciais para continuar.
            </p>
          </div>

          {error && (
            <div style={{
              backgroundColor: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.15)",
              color: "#f87171",
              padding: "14px",
              borderRadius: "4px",
              fontSize: "13px",
              marginBottom: "24px",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>error</span>
              {error}
            </div>
          )}

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (loading) return;
              setError(null);
              setLoading(true);
              try {
                let loginEmail = email.trim();
                
                // If it doesn't look like an email, try resolving it as a username
                if (!loginEmail.includes("@")) {
                  const { data: member, error: memberErr } = await supabase
                    .from("members")
                    .select("email")
                    .eq("username", loginEmail.toLowerCase())
                    .maybeSingle();
                  
                  if (memberErr || !member) {
                    setError("E-mail/Usuário ou senha incorretos.");
                    setLoading(false);
                    return;
                  }
                  loginEmail = member.email;
                }

                const { error: authError } = await supabase.auth.signInWithPassword({
                  email: loginEmail,
                  password: password,
                });
                
                if (authError) {
                  setError("E-mail/Usuário ou senha incorretos.");
                } else {
                  router.push("/dashboard");
                }
              } catch (err: any) {
                setError("Erro inesperado ao realizar login.");
                console.error(err);
              } finally {
                setLoading(false);
              }
            }}
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {/* Email/Username */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label
                htmlFor="email"
                className="font-label-caps"
                style={{ color: "var(--color-on-surface-variant)", fontSize: "11px" }}
              >
                E-mail ou Usuário
              </label>
              <div className="login-input-wrapper">
                <input
                  id="email"
                  type="text"
                  className="login-input"
                  placeholder="seu@email.com ou usuário"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <span className="material-symbols-outlined login-input-icon">mail</span>
              </div>
            </div>

            {/* Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <label htmlFor="senha" className="font-label-caps" style={{ color: "var(--color-on-surface-variant)", fontSize: "11px" }}>
                  Senha
                </label>
              </div>
              <div className="login-input-wrapper">
                <input
                  id="senha"
                  type={showPassword ? "text" : "password"}
                  className="login-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span className="material-symbols-outlined login-input-icon">lock</span>
                <span
                  className="material-symbols-outlined login-input-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </div>
            </div>

            {/* Submit */}
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              style={{ 
                marginTop: "12px", 
                width: "100%", 
                padding: "16px",
                borderRadius: "4px",
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "13px"
              }}
            >
              {loading ? "ENTRANDO..." : "ENTRAR"}
              {!loading && <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
            zIndex: 10,
            fontSize: "12px",
            color: "var(--color-on-surface-variant)",
            borderTop: "1px solid rgba(255, 255, 255, 0.05)",
            paddingTop: "24px"
          }}
        >
          <span>© {new Date().getFullYear()} CLUB PRO CLS</span>
          <div style={{ display: "flex", gap: "16px" }}>
            <Link href="/termos" style={{ color: "inherit", textDecoration: "none" }} className="hover-gold-text">Termos</Link>
            <Link href="/privacidade" style={{ color: "inherit", textDecoration: "none" }} className="hover-gold-text">Privacidade</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
