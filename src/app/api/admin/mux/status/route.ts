import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
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

    // 2. Retrieve uploadId from query params
    const { searchParams } = new URL(req.url);
    const uploadId = searchParams.get("uploadId");

    if (!uploadId) {
      return NextResponse.json({ error: "ID de upload não fornecido" }, { status: 400 });
    }

    // 3. Retrieve Mux Credentials
    const tokenId = process.env.MUX_TOKEN_ID;
    const tokenSecret = process.env.MUX_TOKEN_SECRET;

    if (!tokenId || !tokenSecret) {
      return NextResponse.json(
        { error: "Configuração do Mux incompleta no servidor" },
        { status: 500 }
      );
    }

    const authString = Buffer.from(`${tokenId}:${tokenSecret}`).toString("base64");

    // 4. Query Mux Upload Status
    const uploadRes = await fetch(`https://api.mux.com/video/v1/uploads/${uploadId}`, {
      method: "GET",
      headers: {
        "Authorization": `Basic ${authString}`,
      },
    });

    if (!uploadRes.ok) {
      const errData = await uploadRes.json();
      return NextResponse.json(
        { error: "Erro ao consultar status no Mux", details: errData },
        { status: uploadRes.status }
      );
    }

    const uploadResult = await uploadRes.json();
    const uploadData = uploadResult.data;

    // Possible statuses: waiting, uploading, processing, asset_created, error, cancelled
    if (uploadData.status === "asset_created" && uploadData.asset_id) {
      // 5. Query Asset to get the playback ID
      const assetRes = await fetch(`https://api.mux.com/video/v1/assets/${uploadData.asset_id}`, {
        method: "GET",
        headers: {
          "Authorization": `Basic ${authString}`,
        },
      });

      if (!assetRes.ok) {
        const errData = await assetRes.json();
        return NextResponse.json(
          { error: "Upload concluído, mas erro ao obter detalhes do vídeo no Mux", details: errData },
          { status: assetRes.status }
        );
      }

      const assetResult = await assetRes.json();
      const assetData = assetResult.data;

      // Extract playback_id (assuming public policy playback ID exists)
      const playbackId = assetData.playback_ids?.[0]?.id || "";

      return NextResponse.json({
        status: "completed",
        assetId: uploadData.asset_id,
        playbackId: playbackId,
        duration: assetData.duration || null,
      });
    }

    if (uploadData.status === "error") {
      return NextResponse.json({
        status: "error",
        error: uploadData.error || "Ocorreu um erro no processamento do vídeo no Mux.",
      });
    }

    // Default return while waiting or uploading
    return NextResponse.json({
      status: uploadData.status, // e.g. "waiting", "uploading", "processing"
    });
  } catch (error: any) {
    console.error("Erro geral no endpoint de status do Mux:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor", details: error.message },
      { status: 500 }
    );
  }
}
