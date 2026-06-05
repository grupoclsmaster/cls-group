import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import path from "path";
import fs from "fs";
import os from "os";
import crypto from "crypto";

// Configure ffmpeg path safely
try {
  if (ffmpegPath && fs.existsSync(ffmpegPath)) {
    ffmpeg.setFfmpegPath(ffmpegPath);
  } else {
    console.warn("ffmpeg-static path does not exist on filesystem:", ffmpegPath);
  }
} catch (e) {
  console.error("Failed to configure ffmpeg path:", e);
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. Authenticate user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // 2. Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null; // "image" | "video"

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let compressedBuffer: Buffer;
    let fileExtension: string;
    let mimeType: string;

    const fileId = crypto.randomUUID();

    if (type === "video" || file.type.startsWith("video/")) {
      fileExtension = "mp4";
      mimeType = "video/mp4";

      // Compress video using ffmpeg
      const tempDir = os.tmpdir();
      const inputPath = path.join(tempDir, `input_${fileId}.${file.name.split('.').pop() || 'mp4'}`);
      const outputPath = path.join(tempDir, `output_${fileId}.mp4`);

      await fs.promises.writeFile(inputPath, buffer);

      try {
        await new Promise<void>((resolve, reject) => {
          ffmpeg(inputPath)
            .output(outputPath)
            .videoCodec("libx264")
            .audioCodec("aac")
            .outputOptions([
              "-crf 28",            // High compression (default is 23, higher means smaller file)
              "-preset superfast",  // Fast encoding
              "-vf scale=-2:720",   // Scale to max height of 720px, maintaining aspect ratio (even number)
              "-max_muxing_queue_size 1024"
            ])
            .on("end", () => resolve())
            .on("error", (err: any) => reject(err))
            .run();
        });

        compressedBuffer = await fs.promises.readFile(outputPath);
      } catch (ffmpegErr) {
        console.error("Erro na compressão de vídeo ffmpeg:", ffmpegErr);
        // Fallback: use raw buffer if ffmpeg fails
        compressedBuffer = buffer;
      } finally {
        // Cleanup temp files
        await fs.promises.unlink(inputPath).catch(() => {});
        await fs.promises.unlink(outputPath).catch(() => {});
      }
    } else {
      // Treat as image and compress to AVIF
      fileExtension = "avif";
      mimeType = "image/avif";

      try {
        compressedBuffer = await sharp(buffer)
          .avif({ quality: 60 }) // High compression AVIF format
          .toBuffer();
      } catch (sharpErr) {
        console.error("Erro na compressão de imagem sharp:", sharpErr);
        // Fallback: use raw buffer
        compressedBuffer = buffer;
        fileExtension = file.name.split('.').pop() || "jpg";
        mimeType = file.type;
      }
    }

    // 3. Upload to Supabase Storage
    const storagePath = `uploads/${user.id}/${fileId}.${fileExtension}`;
    const { error: uploadError } = await supabase.storage
      .from("posts")
      .upload(storagePath, compressedBuffer, {
        contentType: mimeType,
        cacheControl: "31536000",
        upsert: true
      });

    if (uploadError) {
      console.error("Erro ao subir arquivo para o Storage:", uploadError);
      return NextResponse.json({ error: "Erro ao subir arquivo para o Storage" }, { status: 500 });
    }

    // 4. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from("posts")
      .getPublicUrl(storagePath);

    return NextResponse.json({ url: publicUrl });

  } catch (error: any) {
    console.error("Erro geral no endpoint de upload:", error);
    return NextResponse.json({ error: "Erro interno do servidor", details: error.message }, { status: 500 });
  }
}
