"use client";
import Link from "next/link";

export default function TermsPage() {
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
          background-color: rgba(237, 192, 102, 0.03);
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
          border-color: rgba(237, 192, 102, 0.3);
          background-color: rgba(237, 192, 102, 0.05);
          box-shadow: 0 0 15px rgba(237, 192, 102, 0.1);
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
          <Link href="/login" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
            <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)", fontSize: "24px" }}>diamond</span>
            <div
              className="font-display-mobile"
              style={{ color: "var(--color-secondary)", letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "16px" }}
            >
              CLUB PRO CLS
            </div>
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
          <h1 className="document-title">Termos de Uso</h1>
          <div className="document-subtitle">
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>verified_user</span>
            Última atualização: Junho de 2026
          </div>

          <div className="document-body">
            <p>
              Seja bem-vindo ao **CLUB PRO CLS**. Ao acessar e utilizar esta plataforma privada, você concorda em cumprir e estar vinculado aos seguintes Termos de Uso. Recomendamos que você leia atentamente todos os itens abaixo descritos antes de utilizar os nossos serviços.
            </p>

            <div className="document-section">
              <h3 className="document-section-title">
                <span className="number">01.</span> Aceitação dos Termos
              </h3>
              <p>
                O CLUB PRO CLS é um ecossistema digital restrito e privado destinado a profissionais, parceiros e alunos do Grupo CLS. A utilização de qualquer parte da plataforma indica o seu consentimento integral com estes Termos de Uso e com a nossa Política de Privacidade. Caso discorde de qualquer cláusula ou regra, você não deverá acessar ou utilizar a plataforma.
              </p>
            </div>

            <div className="document-section">
              <h3 className="document-section-title">
                <span className="number">02.</span> Acesso e Cadastro de Membros
              </h3>
              <p>
                O acesso à plataforma é outorgado exclusivamente a membros formalmente aprovados e cadastrados pela administração.
              </p>
              <ul>
                <li>Suas credenciais de login (e-mail/usuário e senha) são estritamente pessoais e intransferíveis.</li>
                <li>Qualquer compartilhamento de credenciais, senhas ou acesso com terceiros não autorizados resultará na suspensão imediata e irrevogável da sua conta.</li>
                <li>Você é inteiramente responsável por manter a confidencialidade dos seus dados de login e por todas as ações realizadas em sua conta.</li>
              </ul>
            </div>

            <div className="document-section">
              <h3 className="document-section-title">
                <span className="number">03.</span> Propriedade Intelectual e Conteúdo
              </h3>
              <p>
                Todo o conteúdo disponibilizado na plataforma — incluindo, mas não se limitando a: vídeos de Masterclasses, gravações de Mentorias, planilhas de viabilidade físico-financeira, materiais em PDF, marcas, códigos e designs — é de propriedade exclusiva do CLUB PRO CLS ou licenciado ao mesmo.
              </p>
              <ul>
                <li>O acesso ao conteúdo é restrito para visualização e aprendizado pessoal e profissional do membro ativo.</li>
                <li>É terminantemente proibido baixar de forma ilícita, copiar, gravar a tela, reproduzir, distribuir, publicar ou vender qualquer conteúdo da plataforma sem autorização prévia por escrito da administração.</li>
                <li>O descumprimento desta regra constitui crime de violação de direitos autorais e sujeitará o infrator às devidas medidas judiciais e criminais cabíveis.</li>
              </ul>
            </div>

            <div className="document-section">
              <h3 className="document-section-title">
                <span className="number">04.</span> Regras de Conduta e Convivência
              </h3>
              <p>
                A plataforma preza por um ambiente profissional, ético e construtivo. Ao interagir no Feed da Comunidade, publicar Stories (Status), comentar em aulas ou enviar mensagens, você se compromete a:
              </p>
              <ul>
                <li>Respeitar todos os membros, mentores e a administração.</li>
                <li>Não publicar conteúdos falsos, difamatórios, injuriosos, preconceituosos ou de cunho político/religioso extremista.</li>
                <li>Não realizar spam, propaganda não autorizada ou ofertas comerciais agressivas fora dos espaços especificamente designados para negócios.</li>
              </ul>
            </div>

            <div className="document-section">
              <h3 className="document-section-title">
                <span className="number">05.</span> Limitação de Responsabilidade
              </h3>
              <p>
                Os estudos de viabilidade técnica, fórmulas, planilhas de precificação e conselhos compartilhados em mentorias representam metodologias e referências técnicas de mercado. Eles servem de apoio consultivo e educacional.
              </p>
              <p>
                Cada membro e profissional é civil e tecnicamente responsável pela aplicação dessas ferramentas, projetos e estruturação societária de suas respectivas empresas e obras. O CLUB PRO CLS não se responsabiliza por decisões financeiras ou operacionais particulares tomadas com base em nosso material educativo.
              </p>
            </div>

            <div className="document-section">
              <h3 className="document-section-title">
                <span className="number">06.</span> Modificações dos Termos
              </h3>
              <p>
                Reservamo-nos o direito de alterar estes Termos de Uso a qualquer momento, visando a melhoria do ecossistema e a segurança jurídica de todos os envolvidos. O uso continuado da plataforma após as modificações constitui a aceitação tácita das novas diretrizes.
              </p>
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
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)", fontSize: "18px" }}>diamond</span>
            <span className="font-label-caps" style={{ color: "var(--color-secondary)" }}>CLUB PRO CLS</span>
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
