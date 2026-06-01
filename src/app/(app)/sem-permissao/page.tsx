"use client";
import Link from "next/link";

export default function SemPermissaoPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center" }}>
      <span className="material-symbols-outlined" style={{ fontSize: "64px", color: "var(--color-error, #cf6679)", marginBottom: "24px" }}>
        lock
      </span>
      <h1 className="font-display" style={{ fontSize: "32px", color: "var(--color-on-surface)", marginBottom: "16px" }}>
        Acesso Restrito
      </h1>
      <p className="font-body-lg" style={{ color: "var(--color-on-surface-variant)", maxWidth: "500px", marginBottom: "32px" }}>
        Você não tem permissão para acessar essa página ainda. Esta área é exclusiva para administradores.
      </p>
      <Link href="/feed" className="btn-primary">
        VOLTAR AO FEED
      </Link>
    </div>
  );
}
