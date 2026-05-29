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
    <div
      style={{
        backgroundColor: "#010105",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        color: "var(--color-on-surface)",
      }}
    >
      {/* Top App Bar */}
      <header
        style={{
          position: "fixed",
          top: 0,
          width: "100%",
          zIndex: 50,
          backgroundColor: "rgba(19, 19, 22, 0.78)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "0 36px",
            height: "72px",
            maxWidth: "1440px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "clamp(2px, 1.5vw, 8px)" }}>
            <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)", fontSize: "clamp(14px, 4vw, 28px)" }}>diamond</span>
            <div
              className="font-display-mobile"
              style={{ color: "var(--color-secondary)", letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "clamp(12px, 4.5vw, 32px)" }}
            >
              CLUB PRO CLS
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main
        style={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "100px 20px 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "800px",
            height: "800px",
            backgroundColor: "var(--color-primary-container)",
            borderRadius: "50%",
            filter: "blur(120px)",
            opacity: 0.2,
            pointerEvents: "none",
          }}
        />

        {/* Login Card */}
        <div
          className="glass-panel-dark animate-fadeIn"
          style={{
            width: "100%",
            maxWidth: "500px",
            borderRadius: "10px",
            padding: "40px",
            position: "relative",
            zIndex: 10,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h1 className="font-headline-md" style={{ color: "var(--color-on-surface)", marginBottom: "8px" }}>
              Acesso Restrito
            </h1>
            <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)" }}>
              Insira suas credenciais para continuar.
            </p>
          </div>

          {error && (
            <div style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              color: "#f87171",
              padding: "12px",
              borderRadius: "6px",
              fontSize: "13px",
              marginBottom: "20px",
              textAlign: "center"
            }}>
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

            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            {/* Email/Username */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label
                htmlFor="email"
                className="font-label-caps"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                E-mail ou Usuário
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="email"
                  type="text"
                  className="input-dark"
                  placeholder="seu@email.com ou usuário"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ paddingRight: "48px" }}
                />
                <span
                  className="material-symbols-outlined"
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--color-on-surface-variant)",
                    fontSize: "20px",
                    pointerEvents: "none",
                  }}
                >
                  mail
                </span>
              </div>
            </div>

            {/* Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <label htmlFor="senha" className="font-label-caps" style={{ color: "var(--color-on-surface-variant)" }}>
                  Senha
                </label>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  id="senha"
                  type={showPassword ? "text" : "password"}
                  className="input-dark"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: "48px" }}
                />
                <span
                  className="material-symbols-outlined"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--color-on-surface-variant)",
                    fontSize: "20px",
                    cursor: "pointer",
                  }}
                >
                  {showPassword ? "visibility_off" : "lock"}
                </span>
              </div>
            </div>

            {/* Submit */}
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              style={{ 
                marginTop: "16px", 
                width: "100%", 
                padding: "14px 18px",
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "ENTRANDO..." : "ENTRAR"}
              {!loading && <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>}
            </button>
          </form>


        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: "var(--color-surface-container-lowest)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          padding: "32px 40px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            maxWidth: "1440px",
            margin: "0 auto",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)", fontSize: "18px" }}>diamond</span>
            <span className="font-label-caps" style={{ color: "var(--color-secondary)" }}>CLUB PRO CLS</span>
          </div>
          <div style={{ display: "flex", gap: "24px" }}>
            {["Termos", "Privacidade", "Contato"].map((item) => (
              <a
                key={item}
                href="#"
                className="font-body-md hover-gold-text"
                style={{ color: "var(--color-on-surface-variant)", textDecoration: "none" }}
              >
                {item}
              </a>
            ))}
          </div>
          <span className="font-body-md" style={{ color: "var(--color-on-surface-variant)" }}>
            © {new Date().getFullYear()} CLUB PRO CLS. Privacidade e Termos.
          </span>
        </div>
      </footer>
    </div>
  );
}
