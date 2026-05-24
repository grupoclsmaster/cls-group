import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, name, email, product } = body;

    if (!type || !email) {
      return NextResponse.json({ error: "Missing required fields (type, email)" }, { status: 400 });
    }

    // Split name into firstName and lastName
    const nameParts = (name || "").trim().split(" ");
    const firstName = nameParts[0] || "Membro";
    const lastName = nameParts.slice(1).join(" ") || "Simulado";

    // Build the Hubla payload format
    const hublaPayload = {
      type,
      version: "1.0.0",
      user: {
        firstName,
        lastName,
        email,
      },
      event: {
        product: {
          name: product || "Produto CLS Holding",
        },
      },
    };

    // Forward to the actual webhook endpoint locally
    const origin = new URL(request.url).origin;
    const webhookUrl = `${origin}/api/webhook/hubla`;
    const token = process.env.HUBLA_WEBHOOK_TOKEN || "";

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hubla-token": token,
      },
      body: JSON.stringify(hublaPayload),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: "Webhook simulation failed", details: result },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, result });
  } catch (error: unknown) {
    console.error("Simulation error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Simulation failed", details: message },
      { status: 500 }
    );
  }
}
