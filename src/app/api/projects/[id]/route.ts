import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const WORKSPACE_ROOT = "/root/.openclaw/workspace";
const PROJECTS_DIR = path.join(WORKSPACE_ROOT, "projects");

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "");
    const filePath = path.join(PROJECTS_DIR, safeId, "project.json");
    const content = await fs.readFile(filePath, "utf-8");
    return NextResponse.json(JSON.parse(content));
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
