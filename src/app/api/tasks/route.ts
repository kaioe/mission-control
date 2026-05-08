import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DATA_FILE = "/root/.openclaw/workspace/mission-control/data/tasks.json";

async function readTasks(): Promise<any[]> {
  try {
    const content = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return [];
  }
}

async function writeTasks(tasks: any[]) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2));
}

export async function GET() {
  const tasks = await readTasks();
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tasks = await readTasks();
    const task = {
      id: `task-${Date.now()}`,
      title: body.title,
      status: body.status || "pending",
      priority: body.priority || "medium",
      project: body.project || "",
      assignee: body.assignee || "",
      createdAt: new Date().toISOString(),
    };
    tasks.push(task);
    await writeTasks(tasks);
    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
