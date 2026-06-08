"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function CadastroMentoradosPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);

    // Form validations
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Todos os campos são obrigatórios.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve conter no mínimo 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      // 1. Call custom endpoint to create the auth user and the public member profile
      const response = await fetch("/api/auth/register-mentorado", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao realizar cadastro.");
      }

      setSuccess(true);
      setError(null);

      // 2. Automatically sign in the user for a seamless experience
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (signInError) {
        console.error("Auto login error:", signInError);
        // Fallback: if auto-login fails, send them to login screen in 2 seconds
        setTimeout(() => {
          router.push("/login?registered=true");
        }, 2000);
      } else {
        // Redirect to dashboard in 1.5 seconds
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro inesperado ao se cadastrar.");
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#010105", color: "var(--color-on-surface)", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", overflow: "hidden" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .cadastro-card {
          width: 100%;
          max-width: 480px;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(16px);
          border-radius: 8px;
          padding: 40px;
          position: relative;
          z-index: 10;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
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
          box-shadow: 0 0 0 1px var(--color-secondary), 0 0 20px rgba(145, 179, 225, 0.15);
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
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background-color: rgba(145, 179, 225, 0.03);
          filter: blur(120px);
          pointer-events: none;
          z-index: 1;
        }
        .glow-orb-1 {
          top: -150px;
          right: -150px;
          background-color: rgba(145, 179, 225, 0.05);
        }
        .glow-orb-2 {
          bottom: -150px;
          left: -150px;
          background-color: rgba(107, 70, 193, 0.03);
        }
        @media (max-width: 480px) {
          .cadastro-card {
            padding: 24px 16px;
          }
        }
      ` }} />

      {/* Background Orbs */}
      <div className="glow-orb glow-orb-1" />
      <div className="glow-orb glow-orb-2" />

      <div className="cadastro-card">
        {/* Logo Branding */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
          <img src="/logo-cls.png" alt="CLUB PRO CLS" style={{ height: "72px", width: "auto", objectFit: "contain" }} />
        </div>

        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <span className="font-label-caps" style={{ color: "var(--color-secondary)", fontSize: "11px", display: "inline-block", marginBottom: "12px", border: "1px solid rgba(145, 179, 225,0.3)", padding: "4px 12px", borderRadius: "100px", backgroundColor: "rgba(145, 179, 225,0.05)" }}>
            Cadastro de Mentorado
          </span>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", margin: "0 0 8px 0" }}>
            Criar Minha Conta
          </h1>
          <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)", margin: 0 }}>
            Preencha os dados abaixo para ter acesso à comunidade.
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

        {success && (
          <div style={{
            backgroundColor: "rgba(34, 197, 94, 0.08)",
            border: "1px solid rgba(34, 197, 94, 0.15)",
            color: "#4ade80",
            padding: "16px",
            borderRadius: "4px",
            fontSize: "14px",
            marginBottom: "24px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: "32px", marginBottom: "4px" }}>check_circle</span>
            <span style={{ fontWeight: 600 }}>Cadastro realizado com sucesso!</span>
            <span style={{ fontSize: "12px", opacity: 0.8 }}>Redirecionando para a plataforma...</span>
          </div>
        )}

        {!success && (
          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Full Name */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label htmlFor="name" className="font-label-caps" style={{ color: "var(--color-on-surface-variant)", fontSize: "11px" }}>
                Nome Completo
              </label>
              <div className="login-input-wrapper">
                <input
                  id="name"
                  type="text"
                  className="login-input"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                />
                <span className="material-symbols-outlined login-input-icon">person</span>
              </div>
            </div>

            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label htmlFor="email" className="font-label-caps" style={{ color: "var(--color-on-surface-variant)", fontSize: "11px" }}>
                E-mail
              </label>
              <div className="login-input-wrapper">
                <input
                  id="email"
                  type="email"
                  className="login-input"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
                <span className="material-symbols-outlined login-input-icon">mail</span>
              </div>
            </div>

            {/* Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label htmlFor="senha" className="font-label-caps" style={{ color: "var(--color-on-surface-variant)", fontSize: "11px" }}>
                Criar Senha
              </label>
              <div className="login-input-wrapper">
                <input
                  id="senha"
                  type={showPassword ? "text" : "password"}
                  className="login-input"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
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

            {/* Confirm Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label htmlFor="confirmar-senha" className="font-label-caps" style={{ color: "var(--color-on-surface-variant)", fontSize: "11px" }}>
                Confirmar Senha
              </label>
              <div className="login-input-wrapper">
                <input
                  id="confirmar-senha"
                  type={showConfirmPassword ? "text" : "password"}
                  className="login-input"
                  placeholder="Repita a senha criada"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <span className="material-symbols-outlined login-input-icon">lock</span>
                <span
                  className="material-symbols-outlined login-input-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "visibility_off" : "visibility"}
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
              {loading ? "PROCESSANDO..." : "CADASTRAR E ENTRAR"}
              {!loading && <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>}
            </button>
          </form>
        )}

        {/* Card Footer */}
        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "12px", color: "var(--color-on-surface-variant)", borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "20px" }}>
          Já tem uma conta? <Link href="/login" style={{ color: "var(--color-secondary)", textDecoration: "none", fontWeight: 600 }} className="hover-gold-text">Entrar na plataforma</Link>
        </div>
      </div>
    </div>
  );
}
