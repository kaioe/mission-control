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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const tasks = await readTasks();
    const index = tasks.findIndex((t: any) => t.id === id);
    if (index === -1) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    tasks[index] = { ...tasks[index], ...body, updatedAt: new Date().toISOString() };
    await writeTasks(tasks);
    return NextResponse.json(tasks[index]);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tasks = await readTasks();
    const filtered = tasks.filter((t: any) => t.id !== id);
    if (filtered.length === tasks.length) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    await writeTasks(filtered);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
