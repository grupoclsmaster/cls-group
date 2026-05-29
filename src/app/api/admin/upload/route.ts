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

    // 2. Authorize admin
    if (user.email !== "Magnorjsantos@hotmail.com" && user.email !== "mayaracosta00@gmail.com") {
      return NextResponse.json({ error: "Acesso negado: Apenas administradores master" }, { status: 403 });
    }

    // 3. Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    // Enforce 150 MB size limit
    const MAX_SIZE = 150 * 1024 * 1024; // 150 MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "O arquivo excede o limite máximo permitido de 150 MB" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Keep original file extension and sanitize name
    const originalName = file.name;
    const fileExtension = originalName.split('.').pop() || '';
    const fileId = crypto.randomUUID();
    const storagePath = `resources/${fileId}.${fileExtension}`;

    // 4. Upload to Supabase Storage in 'resources' bucket
    const { error: uploadError } = await supabase.storage
      .from("resources")
      .upload(storagePath, buffer, {
        contentType: file.type || "application/octet-stream",
        cacheControl: "31536000",
        upsert: true
      });

    if (uploadError) {
      console.error("Erro ao subir arquivo para o Storage:", uploadError);
      return NextResponse.json({ error: "Erro ao subir arquivo para o Storage" }, { status: 500 });
    }

    // 5. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from("resources")
      .getPublicUrl(storagePath);

    // Format size to MB or KB
    const bytes = file.size;
    let sizeStr = "0.0 MB";
    if (bytes < 1024 * 1024) {
      sizeStr = (bytes / 1024).toFixed(1) + " KB";
    } else {
      sizeStr = (bytes / (1024 * 1024)).toFixed(1) + " MB";
    }

    return NextResponse.json({
      url: publicUrl,
      size: sizeStr,
      format: fileExtension.toUpperCase(),
      name: originalName
    });

  } catch (error: any) {
    console.error("Erro geral no endpoint de upload de admin:", error);
    return NextResponse.json({ error: "Erro interno do servidor", details: error.message }, { status: 500 });
  }
}
