import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "src", "data", "members.json");

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
    console.error("Error loading database in GET route:", error);
    return { members: [], logs: [] };
  }
}

export async function GET() {
  try {
    const db = loadDatabase();
    return NextResponse.json(db);
  } catch (error: unknown) {
    console.error("GET members error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Internal Server Error", details: message }, { status: 500 });
  }
}
