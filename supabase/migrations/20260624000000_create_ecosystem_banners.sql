-- Migration to add ecosystem_banners table and seed it

CREATE TABLE IF NOT EXISTS public.ecosystem_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    tag TEXT,
    image TEXT NOT NULL,
    cta_text TEXT NOT NULL,
    cta_link TEXT NOT NULL,
    disabled BOOLEAN DEFAULT false,
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.ecosystem_banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read on ecosystem_banners" ON public.ecosystem_banners;
CREATE POLICY "Allow authenticated read on ecosystem_banners"
    ON public.ecosystem_banners FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Admin can insert ecosystem_banners" ON public.ecosystem_banners;
CREATE POLICY "Admin can insert ecosystem_banners"
    ON public.ecosystem_banners FOR INSERT
    TO authenticated
    WITH CHECK (public.get_member_type() = 'admin');

DROP POLICY IF EXISTS "Admin can update ecosystem_banners" ON public.ecosystem_banners;
CREATE POLICY "Admin can update ecosystem_banners"
    ON public.ecosystem_banners FOR UPDATE
    TO authenticated
    USING (public.get_member_type() = 'admin')
    WITH CHECK (public.get_member_type() = 'admin');

DROP POLICY IF EXISTS "Admin can delete ecosystem_banners" ON public.ecosystem_banners;
CREATE POLICY "Admin can delete ecosystem_banners"
    ON public.ecosystem_banners FOR DELETE
    TO authenticated
    USING (public.get_member_type() = 'admin');

INSERT INTO public.ecosystem_banners (title, subtitle, description, tag, image, cta_text, cta_link, disabled, sequence_order)
VALUES 
('CLUB CLS PRO', 'Programa de Aceleração', 'CLUB CLS PRO é o Master Mind, Mentoria para empresários.', 'FECHADO', '/bg-club-cls-pro.PNG', 'Indisponível no momento', '#', true, 1),
('O Código da Construção', '2ª Edição • Outubro 2026', 'O maior evento de engenharia, negócios e incorporação imobiliária do Brasil está de volta. Garanta sua vaga no lote de pré-lançamento com condições exclusivas.', 'EVENTO PRINCIPAL', '/ocdc2.png', 'Garantir Ingresso', 'https://www.ocodigodaconstrucao.com.br/#planos-2-edicao', false, 2),
('EP30 — Incorporação Imobiliária: Como Transformar Terrenos em Negócios', 'Concreto & Conversa', 'Neste episódio do Concreto & Conversa, discutimos o passo a passo de como estruturar e transformar terrenos em negócios rentáveis na incorporação imobiliária.', 'NOVO EPISÓDIO', 'https://img.youtube.com/vi/QUNkDh4OKfc/maxresdefault.jpg', 'Assistir Agora', 'https://youtu.be/QUNkDh4OKfc', false, 3),
('Saia do improviso.', 'Curso', 'O Manual completo para empresas saírem do "Apaga incêndio" e realmente crescer de forma saudável.', 'CURSO', 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200', 'Ver Grade Curricular', '/masterclasses', false, 4),
('CLS Studio', 'Estúdio CLS, Grave seu Podcast', 'Produza seus episódios com estrutura profissional de áudio e vídeo, câmeras 4k, microfones de ponta e suporte técnico completo.', 'CLS STUDIO', 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=1200', 'Grave seu Podcast', '#studio', false, 5)
ON CONFLICT DO NOTHING;
