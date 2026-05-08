import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const WORKSPACE_ROOT = "/root/.openclaw/workspace";
const PROJECTS_DIR = path.join(WORKSPACE_ROOT, "projects");
const MEMORY_DIR = path.join(WORKSPACE_ROOT, "memory");
const DOCS_DIR = path.join(WORKSPACE_ROOT, "docs");
const TASKS_FILE = path.join(WORKSPACE_ROOT, "mission-control", "data", "tasks.json");

async function readJsonFile(filePath: string): Promise<any | null> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "");
    const filePath = path.join(PROJECTS_DIR, safeId, "project.json");
    const project = await readJsonFile(filePath);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Resolve linked tasks
    const allTasks = await readJsonFile(TASKS_FILE);
    const linkedTasks = (allTasks || []).filter((t: any) =>
      project.linkedTasks?.includes(t.id)
    );

    // Resolve linked memories
    const linkedMemories = [];
    if (project.linkedMemories?.length) {
      for (const memId of project.linkedMemories) {
        const memContent = await fs.readFile(path.join(MEMORY_DIR, `${memId}.md`), "utf-8").catch(() => null);
        if (memContent) {
          const lines = memContent.split("\n");
          const titleLine = lines.find((l) => l.startsWith("# "));
          linkedMemories.push({
            id: memId,
            title: titleLine ? titleLine.replace("# ", "").trim() : memId,
            wordCount: memContent.split(/\s+/).filter(Boolean).length,
          });
        }
      }
    }

    // Resolve linked docs
    const linkedDocs = [];
    if (project.linkedDocs?.length) {
      for (const docPath of project.linkedDocs) {
        const docContent = await fs.readFile(path.join(DOCS_DIR, docPath), "utf-8").catch(() => null);
        if (docContent) {
          const lines = docContent.split("\n");
          const titleLine = lines.find((l) => l.startsWith("# "));
          linkedDocs.push({
            path: docPath,
            title: titleLine ? titleLine.replace("# ", "").trim() : docPath,
            wordCount: docContent.split(/\s+/).filter(Boolean).length,
          });
        }
      }
    }

    return NextResponse.json({
      ...project,
      linkedTasks,
      linkedMemories,
      linkedDocs,
    });
  } catch {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "");
    const body = await request.json();
    const projectDir = path.join(PROJECTS_DIR, safeId);

    await fs.mkdir(projectDir, { recursive: true });

    const project = {
      id: safeId,
      name: body.name || safeId,
      description: body.description || "",
      status: body.status || "active",
      progress: body.progress ?? 0,
      mission: body.mission || "",
      linkedMemories: body.linkedMemories || [],
      linkedDocs: body.linkedDocs || [],
      linkedTasks: body.linkedTasks || [],
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await fs.writeFile(
      path.join(projectDir, "project.json"),
      JSON.stringify(project, null, 2)
    );

    return NextResponse.json(project);
  } catch (err) {
    console.error("Error saving project:", err);
    return NextResponse.json({ error: "Failed to save project" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "");
    await fs.rm(path.join(PROJECTS_DIR, safeId), { recursive: true, force: true });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting project:", err);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
