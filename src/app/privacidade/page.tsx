"use client";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div
      style={{
        backgroundColor: "#010105",
        minHeight: "100vh",
        color: "var(--color-on-surface)",
        fontFamily: "'Inter', sans-serif",
        position: "relative",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .document-container {
          max-width: 800px;
          margin: 120px auto 80px;
          padding: 0 24px;
          position: relative;
          z-index: 10;
        }
        .document-panel {
          background: linear-gradient(145deg, rgba(7, 7, 50, 0.5) 0%, rgba(19, 19, 22, 0.3) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 48px;
          box-shadow: 0 40px 80px rgba(0, 0, 0, 0.5);
        }
        .document-title {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 800;
          color: #fff;
          margin-bottom: 8px;
          letter-spacing: -0.01em;
        }
        .document-subtitle {
          color: var(--color-secondary);
          font-size: 13px;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 40px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .document-section {
          margin-bottom: 32px;
        }
        .document-section-title {
          font-family: 'Outfit', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .document-section-title span.number {
          color: var(--color-secondary);
          font-family: 'Outfit', sans-serif;
        }
        .document-body {
          color: rgba(255, 255, 255, 0.7);
          font-size: 15px;
          line-height: 1.7;
        }
        .document-body p {
          margin-bottom: 16px;
        }
        .document-body ul {
          margin-left: 20px;
          margin-bottom: 16px;
          list-style-type: none;
        }
        .document-body li {
          margin-bottom: 8px;
          position: relative;
          padding-left: 16px;
        }
        .document-body li::before {
          content: "•";
          color: var(--color-secondary);
          position: absolute;
          left: 0;
        }
        .glow-orb {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background-color: rgba(37, 99, 235, 0.03);
          filter: blur(140px);
          pointer-events: none;
          z-index: 1;
        }
        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--color-on-surface-variant);
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 4px;
          background-color: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.2s ease;
        }
        .back-btn:hover {
          color: var(--color-secondary);
          border-color: rgba(37, 99, 235, 0.3);
          background-color: rgba(37, 99, 235, 0.05);
          box-shadow: 0 0 15px rgba(37, 99, 235, 0.1);
        }
        @media (max-width: 768px) {
          .document-panel {
            padding: 24px;
          }
          .document-container {
            margin-top: 100px;
          }
        }
      ` }} />

      {/* Glow Orbs */}
      <div className="glow-orb" style={{ top: "-100px", left: "-100px" }} />
      <div className="glow-orb" style={{ bottom: "-100px", right: "-100px", backgroundColor: "rgba(194, 194, 245, 0.02)" }} />

      {/* Header */}
      <header
        style={{
          position: "fixed",
          top: 0,
          width: "100%",
          zIndex: 50,
          backgroundColor: "rgba(1, 1, 5, 0.8)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 24px",
            height: "72px",
            maxWidth: "1200px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <Link href="/login" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <img src="/logo-cls.png" alt="CLUB PRO CLS" style={{ height: "32px", width: "auto", objectFit: "contain" }} />
          </Link>

          <Link href="/login" className="back-btn">
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_back</span>
            Voltar para o Login
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="document-container">
        <div className="document-panel">
          <h1 className="document-title">Política de Privacidade</h1>
          <div className="document-subtitle">
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>shield</span>
            Última atualização: Junho de 2026
          </div>

          <div className="document-body">
            <p>
              O **CLUB PRO CLS** tem o firme compromisso de proteger a privacidade e a segurança dos dados pessoais de seus membros. Esta Política de Privacidade explica detalhadamente como coletamos, usamos, armazenamos e protegemos suas informações dentro de nossa plataforma fechada.
            </p>

            <div className="document-section">
              <h3 className="document-section-title">
                <span className="number">01.</span> Informações que Coletamos
              </h3>
              <p>
                Para prestar os nossos serviços e garantir o acesso seguro à plataforma, coletamos as seguintes categorias de dados pessoais:
              </p>
              <ul>
                <li>**Dados de Cadastro**: Nome completo, endereço de e-mail corporativo ou pessoal, profissão/cargo, empresa e nome de usuário (username).</li>
                <li>**Dados de Perfil**: Foto de perfil (avatar), biografia e informações profissionais voluntariamente compartilhadas.</li>
                <li>**Dados de Acesso e Navegação**: Endereço IP, cookies de sessão, histórico de visualização de aulas, comentários postados e interações no feed da comunidade.</li>
              </ul>
            </div>

            <div className="document-section">
              <h3 className="document-section-title">
                <span className="number">02.</span> Como Utilizamos Seus Dados
              </h3>
              <p>
                Os seus dados pessoais são utilizados de forma estrita para as seguintes finalidades legítimas:
              </p>
              <ul>
                <li>**Prestação do Serviço**: Identificar você na plataforma, validar seu login, controlar o seu progresso nas Masterclasses e liberar o acesso a materiais.</li>
                <li>**Personalização e Interação**: Exibir seu perfil com a respectiva tipologia de membro (Selo de Master, Mentor ou Admin) no feed de discussões, Reels e comentários da comunidade.</li>
                <li>**Comunicação**: Enviar avisos importantes sobre o sistema, alterações em termos, confirmações de criação de eventos ou notificações de novas mentorias técnicas no calendário.</li>
              </ul>
            </div>

            <div className="document-section">
              <h3 className="document-section-title">
                <span className="number">03.</span> Cookies e Armazenamento Local
              </h3>
              <p>
                Utilizamos cookies e tecnologias de armazenamento local (`localStorage`) para otimizar sua navegação. Eles servem para:
              </p>
              <ul>
                <li>Manter sua sessão de login ativa de forma segura (via cookies criptografados do Supabase Auth).</li>
                <li>Lembrar de suas preferências de interface (por exemplo, se o menu lateral está expandido ou colapsado).</li>
                <li>Otimizar o carregamento de imagens e layouts estáticos já visualizados.</li>
              </ul>
            </div>

            <div className="document-section">
              <h3 className="document-section-title">
                <span className="number">04.</span> Compartilhamento de Dados
              </h3>
              <p>
                Sua privacidade é prioridade absoluta. Por isso, adotamos regras rígidas sobre seus dados:
              </p>
              <ul>
                <li>**Sem Venda de Dados**: Não comercializamos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins publicitários ou de marketing.</li>
                <li>**Provedores de Serviços**: Seus dados de autenticação e banco de dados são hospedados de forma segura e criptografada em servidores em nuvem por meio do provedor **Supabase** (segurança padrão internacional SOC2).</li>
                <li>**Cumprimento da Lei**: Compartilharemos dados somente sob ordem judicial expressa ou em caso de cumprimento de obrigações legais vigentes.</li>
              </ul>
            </div>

            <div className="document-section">
              <h3 className="document-section-title">
                <span className="number">05.</span> Segurança da Informação
              </h3>
              <p>
                Implementamos rigorosas medidas de segurança técnicas e organizacionais para proteger suas informações pessoais contra perda, roubo, acesso não autorizado e alteração. Isso inclui a utilização de conexões seguras sob protocolo **HTTPS (SSL)**, isolamento de banco de dados (Row Level Security - RLS) e chaves de acesso rotativas no servidor.
              </p>
            </div>

            <div className="document-section">
              <h3 className="document-section-title">
                <span className="number">06.</span> Seus Direitos
              </h3>
              <p>
                Como titular de dados e em conformidade com a Lei Geral de Proteção de Dados (LGPD), você possui o direito de:
              </p>
              <ul>
                <li>Confirmar a existência do processamento de seus dados pessoais.</li>
                <li>Acessar, corrigir ou atualizar seus dados cadastrais diretamente pela página de Perfil na plataforma.</li>
                <li>Solicitar a exclusão ou encerramento permanente de sua conta de membro enviando um contato à nossa equipe administrativa.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: "var(--color-surface-container-lowest)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          padding: "32px 24px",
          marginTop: "auto"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            maxWidth: "1200px",
            margin: "0 auto",
            width: "100%",
            flexWrap: "wrap",
            gap: "16px",
            fontSize: "13px",
            color: "var(--color-on-surface-variant)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src="/logo-cls.png" alt="CLUB PRO CLS" style={{ height: "24px", width: "auto", objectFit: "contain" }} />
          </div>
          <div style={{ display: "flex", gap: "24px" }}>
            <Link href="/termos" style={{ color: "inherit", textDecoration: "none" }} className="hover-gold-text">Termos</Link>
            <Link href="/privacidade" style={{ color: "inherit", textDecoration: "none" }} className="hover-gold-text">Privacidade</Link>
          </div>
          <span>© {new Date().getFullYear()} CLUB PRO CLS. Todos os direitos reservados.</span>
        </div>
      </footer>
    </div>
  );
}
