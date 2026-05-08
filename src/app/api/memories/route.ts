import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const MEMORY_DIR = "/root/.openclaw/workspace/memory";

export async function GET() {
  try {
    const entries = await fs.readdir(MEMORY_DIR, { withFileTypes: true });
    const memories = [];

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith(".md") && entry.name !== "README.md") {
        const filePath = path.join(MEMORY_DIR, entry.name);
        const content = await fs.readFile(filePath, "utf-8");
        const lines = content.split("\n");
        const wordCount = content.split(/\s+/).filter(Boolean).length;

        // Extract title (first # heading or use filename)
        const titleLine = lines.find((l) => l.startsWith("# "));
        const title = titleLine ? titleLine.replace("# ", "").trim() : entry.name.replace(".md", "");

        // Extract a preview (first non-empty line after the title)
        const preview = lines.slice(1).find((l) => l.trim() && !l.startsWith("#")) || "";

        memories.push({
          id: entry.name.replace(".md", ""),
          date: entry.name.replace(".md", ""),
          title,
          preview: preview.slice(0, 200),
          wordCount,
          lineCount: lines.length,
          updatedAt: (await fs.stat(filePath)).mtime.toISOString(),
        });
      }
    }

    // Sort by date descending
    memories.sort((a, b) => b.date.localeCompare(a.date));

    return NextResponse.json(memories);
  } catch (err) {
    console.error("Error reading memories:", err);
    return NextResponse.json([], { status: 500 });
  }
}
