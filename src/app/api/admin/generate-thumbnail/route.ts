import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. Authenticate user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const emailLower = user.email?.toLowerCase();
    if (emailLower !== "magnorjsantos@hotmail.com" && emailLower !== "mayaracosta00@gmail.com") {
      return NextResponse.json({ error: "Acesso negado: Apenas administradores master" }, { status: 403 });
    }

    // 2. Parse body
    const { title } = await req.json();
    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Título não fornecido" }, { status: 400 });
    }

    // 3. Create the prompt for AI Image Generation
    // Matches the design system colors: deep navy / charcoal (#131316), gold (#b89047), and electric blue/secondary (#91B3E1)
    const basePrompt = `A premium professional educational masterclass video thumbnail for a lesson titled "${title}". Dark luxury background with deep navy blue (#131316) and charcoal. Sleek metallic gold lines and accents (#b89047) combined with subtle electric blue (#91B3E1) glow. Minimalist, modern 3D abstract shapes, technological concept, clean design, cinematic lighting, 8k resolution, no text.`;

    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(basePrompt)}?width=1280&height=720&nologo=true&private=true&enhance=true`;

    // 4. Fetch the generated image
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
      throw new Error(`Falha ao gerar imagem pelo serviço de IA: ${imgRes.statusText}`);
    }

    const arrayBuffer = await imgRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 5. Upload to Supabase Storage
    const fileId = crypto.randomUUID();
    const storagePath = `covers/${fileId}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("resources")
      .upload(storagePath, buffer, {
        contentType: "image/jpeg",
        cacheControl: "31536000",
        upsert: true
      });

    if (uploadError) {
      console.error("Erro ao subir capa gerada por IA para o Storage:", uploadError);
      return NextResponse.json({ error: "Erro ao salvar a capa gerada no Storage" }, { status: 500 });
    }

    // 6. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from("resources")
      .getPublicUrl(storagePath);

    return NextResponse.json({ url: publicUrl });

  } catch (error: any) {
    console.error("Erro geral no gerador de thumbnails:", error);
    return NextResponse.json({ error: "Erro interno do servidor", details: error.message }, { status: 500 });
  }
}
