import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const MEMORY_DIR = "/root/.openclaw/workspace/memory";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const safeName = id.replace(/[^a-zA-Z0-9_-]/g, "");
    const filePath = path.join(MEMORY_DIR, `${safeName}.md`);

    const content = await fs.readFile(filePath, "utf-8");
    const lines = content.split("\n");
    const wordCount = content.split(/\s+/).filter(Boolean).length;

    const titleLine = lines.find((l) => l.startsWith("# "));
    const title = titleLine ? titleLine.replace("# ", "").trim() : safeName;

    return NextResponse.json({
      id: safeName,
      title,
      content,
      wordCount,
      lineCount: lines.length,
    });
  } catch (err) {
    console.error("Error reading memory:", err);
    return NextResponse.json({ error: "Memory not found" }, { status: 404 });
  }
}
