"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function SemPermissaoPage() {
  const router = useRouter();
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: member } = await supabase
            .from("members")
            .select("status")
            .eq("id", user.id)
            .single();

          if (member && member.status === "Ativo") {
            setIsMember(true);
          }
        }
      } catch (err) {
        console.error("Error verifying user status on permission page:", err);
      } finally {
        setLoading(false);
      }
    }
    void checkUser();
  }, []);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: "var(--color-on-surface-variant)" }}>
        Carregando...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center", padding: "20px" }}>
      <span className="material-symbols-outlined" style={{ fontSize: "64px", color: "var(--color-error, #cf6679)", marginBottom: "24px" }}>
        lock
      </span>
      <h1 className="font-display" style={{ fontSize: "32px", color: "var(--color-on-surface)", marginBottom: "16px" }}>
        Acesso Restrito
      </h1>
      
      {isMember ? (
        <>
          <p className="font-body-lg" style={{ color: "var(--color-on-surface-variant)", maxWidth: "500px", marginBottom: "32px" }}>
            Você não tem permissão para acessar essa página. Esta área é exclusiva para administradores.
          </p>
          <Link href="/membros" className="btn-primary" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "10px 20px" }}>
            VOLTAR AO FEED
          </Link>
        </>
      ) : (
        <>
          <p className="font-body-lg" style={{ color: "var(--color-on-surface-variant)", maxWidth: "500px", marginBottom: "32px" }}>
            Seu acesso ao Club CLS está pendente ou inativo. Esta área é exclusiva para membros ativos do clube.
          </p>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/ecossistema" className="btn-outline" style={{ textDecoration: "none", border: "1px solid var(--border-color)", color: "var(--color-on-surface)", padding: "10px 20px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              IR PARA ECOSSISTEMA
            </Link>
            <button onClick={handleLogout} className="btn-primary" style={{ padding: "10px 20px", cursor: "pointer" }}>
              SAIR DA CONTA
            </button>
          </div>
        </>
      )}
    </div>
  );
}
