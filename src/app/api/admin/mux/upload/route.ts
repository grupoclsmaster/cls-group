import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

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

    // 2. Retrieve Mux Credentials
    const tokenId = process.env.MUX_TOKEN_ID;
    const tokenSecret = process.env.MUX_TOKEN_SECRET;

    if (!tokenId || !tokenSecret) {
      console.error("Erro: Credenciais do Mux não configuradas no servidor.");
      return NextResponse.json(
        { error: "Configuração do Mux incompleta no servidor" },
        { status: 500 }
      );
    }

    // 3. Request Direct Upload URL from Mux API
    const authString = Buffer.from(`${tokenId}:${tokenSecret}`).toString("base64");
    
    const response = await fetch("https://api.mux.com/video/v1/uploads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${authString}`,
      },
      body: JSON.stringify({
        cors_origin: "*",
        new_asset_settings: {
          playback_policy: ["public"],
        },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Mux API Error details:", result);
      return NextResponse.json(
        { error: "Erro ao gerar URL de upload no Mux", details: result },
        { status: response.status }
      );
    }

    // Return the upload ID and direct GCS URL to client
    return NextResponse.json({
      uploadId: result.data.id,
      uploadUrl: result.data.url,
    });
  } catch (error: any) {
    console.error("Erro geral no endpoint de upload do Mux:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor", details: error.message },
      { status: 500 }
    );
  }
}
