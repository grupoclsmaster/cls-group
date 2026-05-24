"use client";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
          backgroundColor: "rgba(19, 19, 22, 0.7)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 40px",
            height: "80px",
            maxWidth: "1440px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)", fontSize: "28px" }}>diamond</span>
            <div
              className="font-display-mobile"
              style={{ color: "var(--color-secondary)", letterSpacing: "0.2em", textTransform: "uppercase" }}
            >
              CLUB PRO CLS
            </div>
          </div>
          <nav style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            <span
              className="font-title-lg"
              style={{
                color: "var(--color-secondary)",
                borderBottom: "2px solid var(--color-secondary)",
                paddingBottom: "4px",
                cursor: "pointer",
              }}
            >
              Entrar
            </span>
            <Link
              href="/cadastro"
              className="font-title-lg hover-gold-dim-text"
              style={{ color: "var(--color-on-surface-variant)", textDecoration: "none" }}
            >
              Cadastrar
            </Link>
            <span
              className="font-title-lg hover-gold-dim-text"
              style={{ color: "var(--color-on-surface-variant)", cursor: "pointer" }}
            >
              Suporte
            </span>
          </nav>
          <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)", fontSize: "28px", cursor: "pointer" }}>
            help_outline
          </span>
        </div>
      </header>

      {/* Main */}
      <main
        style={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "128px 20px 80px",
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
            maxWidth: "440px",
            borderRadius: "8px",
            padding: "40px",
            position: "relative",
            zIndex: 10,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h1 className="font-headline-md" style={{ color: "var(--color-on-surface)", marginBottom: "8px" }}>
              Acesso Restrito
            </h1>
            <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)" }}>
              Insira suas credenciais para continuar.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = "/dashboard";
            }}
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label
                htmlFor="email"
                className="font-label-caps"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                E-mail
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="email"
                  type="email"
                  className="input-dark"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ paddingRight: "40px" }}
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
                <Link
                  href="/recuperar-senha"
                  className="font-label-caps"
                  style={{ color: "var(--color-secondary)", textDecoration: "none", transition: "color 0.2s" }}
                >
                  Esqueci minha senha
                </Link>
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
                  style={{ paddingRight: "40px" }}
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
            <button type="submit" className="btn-primary" style={{ marginTop: "16px", width: "100%" }}>
              ENTRAR
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>
            </button>
          </form>

          <div
            style={{
              marginTop: "32px",
              textAlign: "center",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              paddingTop: "24px",
            }}
          >
            <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)" }}>
              Ainda não tem conta?{" "}
              <Link
                href="/cadastro"
                style={{ color: "var(--color-secondary)", fontWeight: 600, textDecoration: "none", marginLeft: "4px" }}
              >
                Cadastre-se
              </Link>
            </p>
          </div>
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
