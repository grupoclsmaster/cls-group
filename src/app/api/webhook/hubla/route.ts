import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "src", "data", "members.json");

const AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200"
];

function getDeterministicAvatar(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATARS.length;
  return AVATARS[index];
}

interface Member {
  name: string;
  email: string;
  role: string;
  company: string;
  industry: string;
  location: string;
  initials: string;
  img: string;
  status: "Ativo" | "Inativo";
  addedAt?: string;
  deactivatedAt?: string;
}

interface WebhookLog {
  id: string;
  timestamp: string;
  type: string;
  email: string;
  payload: unknown;
}

interface Database {
  members: Member[];
  logs: WebhookLog[];
}

function loadDatabase(): Database {
  try {
    if (!fs.existsSync(dataFilePath)) {
      // If it doesn't exist, create directory and write a basic empty state
      const dir = path.dirname(dataFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const initialDb: Database = { members: [], logs: [] };
      fs.writeFileSync(dataFilePath, JSON.stringify(initialDb, null, 2), "utf8");
      return initialDb;
    }
    const data = fs.readFileSync(dataFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading database:", error);
    return { members: [], logs: [] };
  }
}

function saveDatabase(db: Database) {
  try {
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(db, null, 2), "utf8");
  } catch (error) {
    console.error("Error saving database:", error);
  }
}

export async function POST(request: Request) {
  try {
    // 1. Verify token
    const tokenHeader = request.headers.get("x-hubla-token");
    const expectedToken = process.env.HUBLA_WEBHOOK_TOKEN;

    if (!tokenHeader || tokenHeader !== expectedToken) {
      console.warn("Unauthorized webhook attempt. Token received:", tokenHeader);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse body
    const body = await request.json();
    const { type, user, event, version } = body;

    if (!type) {
      return NextResponse.json({ error: "Missing event type" }, { status: 400 });
    }

    // Load db
    const db = loadDatabase();

    const timestamp = new Date().toISOString();
    const userEmail = user?.email || body.subscription?.user?.email || "desconhecido@hubla.com";
    const userFirstName = user?.firstName || body.subscription?.user?.firstName || "Membro";
    const userLastName = user?.lastName || body.subscription?.user?.lastName || "Hubla";
    const fullName = `${userFirstName} ${userLastName}`.trim();
    const productName = event?.product?.name || "Produto CLS Holding";

    // 3. Process event types
    if (type === "customer.member_added") {
      const existingMemberIndex = db.members.findIndex(
        (m) => m.email.toLowerCase() === userEmail.toLowerCase()
      );

      if (existingMemberIndex > -1) {
        // Update existing member status
        db.members[existingMemberIndex].status = "Ativo";
        db.members[existingMemberIndex].name = fullName;
        db.members[existingMemberIndex].addedAt = timestamp;
      } else {
        // Add new member
        const initials = `${userFirstName[0] || "M"}${userLastName[0] || "H"}`.toUpperCase();
        const newMember: Member = {
          name: fullName,
          email: userEmail,
          role: "Membro Executivo",
          company: productName,
          industry: "Engenharia & Construção",
          location: "Brasil",
          initials,
          img: getDeterministicAvatar(userEmail),
          status: "Ativo",
          addedAt: timestamp
        };
        db.members.push(newMember);
      }
    } else if (type === "customer.member_removed") {
      const existingMemberIndex = db.members.findIndex(
        (m) => m.email.toLowerCase() === userEmail.toLowerCase()
      );

      if (existingMemberIndex > -1) {
        // Update existing member status to Inactive
        db.members[existingMemberIndex].status = "Inativo";
        db.members[existingMemberIndex].deactivatedAt = timestamp;
      }
    }

    // 4. Log the webhook receipt
    const newLog: WebhookLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp,
      type,
      email: userEmail,
      payload: body
    };

    // Prepend to logs and keep last 50
    db.logs = [newLog, ...db.logs].slice(0, 50);

    // Save db
    saveDatabase(db);

    return NextResponse.json({ success: true, event: type, email: userEmail });
  } catch (error: unknown) {
    console.error("Webhook processing error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Internal Server Error", details: message }, { status: 500 });
  }
}
