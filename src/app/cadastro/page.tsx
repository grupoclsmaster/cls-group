"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CadastroPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p>Cadastro público desativado. Redirecionando para <a href="/login">login</a>...</p>
    </div>
  );
}
