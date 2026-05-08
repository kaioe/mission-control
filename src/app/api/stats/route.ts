import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const WORKSPACE_ROOT = "/root/.openclaw/workspace";

async function countFiles(dir: string, ext: string): Promise<number> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries.filter((e) => e.isFile() && e.name.endsWith(ext)).length;
  } catch {
    return 0;
  }
}

async function getJsonFiles(dir: string): Promise<any[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const results = [];
    for (const entry of entries) {
      if (entry.isDirectory()) {
        try {
          const content = await fs.readFile(path.join(dir, entry.name, "project.json"), "utf-8");
          results.push(JSON.parse(content));
        } catch {}
      }
    }
    return results;
  } catch {
    return [];
  }
}

export async function GET() {
  const [projects, memoryCount, docCount, agentFiles] = await Promise.all([
    getJsonFiles(path.join(WORKSPACE_ROOT, "projects")),
    countFiles(path.join(WORKSPACE_ROOT, "memory"), ".md"),
    countFiles(path.join(WORKSPACE_ROOT, "docs"), ""),
    fs.readdir(path.join(WORKSPACE_ROOT, "agents")).catch(() => []),
  ]);

  // Read agent configs
  const agents = [];
  for (const file of agentFiles) {
    if (file.endsWith(".json")) {
      try {
        const content = await fs.readFile(path.join(WORKSPACE_ROOT, "agents", file), "utf-8");
        const agent = JSON.parse(content);
        agents.push({
          name: agent.displayName || agent.name,
          role: agent.role,
          beltColor: agent.beltColor,
          status: agent.status,
        });
      } catch {}
    }
  }

  // Read tasks from mission-control data
  // Read activity count
  let activityCount = 0;
  try {
    const activityContent = await fs.readFile(
      path.join(WORKSPACE_ROOT, "mission-control", "data", "activity.json"),
      "utf-8"
    );
    activityCount = JSON.parse(activityContent).length;
  } catch {}

  let taskCount = 0;
  try {
    const tasksContent = await fs.readFile(
      path.join(WORKSPACE_ROOT, "mission-control", "data", "tasks.json"),
      "utf-8"
    );
    taskCount = JSON.parse(tasksContent).length;
  } catch {}

  const totalProgress = projects.length > 0
    ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length)
    : 0;

  const activeProjects = projects.filter((p) => p.status === "active").length;

  return NextResponse.json({
    projects: { total: projects.length, active: activeProjects, averageProgress: totalProgress },
    memory: { entries: memoryCount },
    docs: { total: docCount },
    tasks: { total: taskCount },
    agents: { total: agents.length, list: agents },
    activity: { total: activityCount },
  });
}
