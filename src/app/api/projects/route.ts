import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const WORKSPACE_ROOT = "/root/.openclaw/workspace";
const PROJECTS_DIR = path.join(WORKSPACE_ROOT, "projects");

export async function GET() {
  try {
    const entries = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });
    const projects = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const projectFile = path.join(PROJECTS_DIR, entry.name, "project.json");
        try {
          const content = await fs.readFile(projectFile, "utf-8");
          const project = JSON.parse(content);
          projects.push(project);
        } catch {
          // Skip directories without valid project.json
        }
      }
    }

    return NextResponse.json(projects);
  } catch (err) {
    console.error("Error reading projects:", err);
    return NextResponse.json([], { status: 500 });
  }
}