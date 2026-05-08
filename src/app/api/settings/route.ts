import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const AGENTS_DIR = "/root/.openclaw/workspace/agents";

export async function GET() {
  try {
    const files = await fs.readdir(AGENTS_DIR).catch(() => []);
    const agents: any[] = [];

    for (const file of files) {
      if (file.endsWith(".json")) {
        try {
          const content = await fs.readFile(path.join(AGENTS_DIR, file), "utf-8");
          agents.push(JSON.parse(content));
        } catch {}
      }
    }

    return NextResponse.json({
      agents,
      passwordEnabled: false,
      version: "0.1",
    });
  } catch (err) {
    return NextResponse.json({ agents: [], passwordEnabled: false, version: "0.1" });
  }
}
