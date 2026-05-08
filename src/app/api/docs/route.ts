import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DOCS_DIR = "/root/.openclaw/workspace/docs";

export async function GET() {
  async function walkDir(dir: string, basePath = ""): Promise<any[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
    const results = [];
    for (const entry of entries) {
      const relPath = basePath ? `${basePath}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        const children = await walkDir(path.join(dir, entry.name), relPath);
        results.push(...children);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        const filePath = path.join(dir, entry.name);
        const stat = await fs.stat(filePath);
        const content = await fs.readFile(filePath, "utf-8");
        const titleLine = content.split("\n").find((l) => l.startsWith("# "));
        results.push({
          name: entry.name,
          path: relPath,
          title: titleLine ? titleLine.replace("# ", "").trim() : entry.name,
          size: stat.size,
          wordCount: content.split(/\s+/).filter(Boolean).length,
          updatedAt: stat.mtime.toISOString(),
          content,
        });
      }
    }
    return results;
  }

  try {
    const docs = await walkDir(DOCS_DIR);
    docs.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return NextResponse.json(docs);
  } catch (err) {
    console.error("Error reading docs:", err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, category } = body;
    if (!title || !content) {
      return NextResponse.json({ error: "Title and content required" }, { status: 400 });
    }

    const safeName = title.toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 60);
    const categoryDir = category ? path.join(DOCS_DIR, category) : DOCS_DIR;
    await fs.mkdir(categoryDir, { recursive: true });

    const filePath = path.join(categoryDir, `${safeName}.md`);
    await fs.writeFile(filePath, content, "utf-8");

    return NextResponse.json({ success: true, path: `${category ? category + "/" : ""}${safeName}.md` });
  } catch (err) {
    console.error("Error writing doc:", err);
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
  }
}
