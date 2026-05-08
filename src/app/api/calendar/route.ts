import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const TASKS_FILE = "/root/.openclaw/workspace/mission-control/data/tasks.json";
const ACTIVITY_FILE = "/root/.openclaw/workspace/mission-control/data/activity.json";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const year = parseInt(url.searchParams.get("year") || String(new Date().getFullYear()));
    const month = parseInt(url.searchParams.get("month") || String(new Date().getMonth() + 1));

    const events: any[] = [];

    // Load tasks and group by DUE DATE (not creation date)
    try {
      const tasksContent = await fs.readFile(TASKS_FILE, "utf-8");
      const tasks = JSON.parse(tasksContent);
      for (const task of tasks) {
        // Use dueDate if available, otherwise fall back to createdAt
        const dateStr = task.dueDate || task.createdAt.split("T")[0];
        const d = new Date(dateStr);
        if (d.getFullYear() === year && d.getMonth() + 1 === month) {
          events.push({
            id: task.id,
            date: dateStr,
            title: task.title,
            type: "task",
            status: task.status,
            project: task.project,
            priority: task.priority,
          });
        }
      }
    } catch {}

    // Load activity events for this month (still by creation time)
    try {
      const activityContent = await fs.readFile(ACTIVITY_FILE, "utf-8");
      const activities = JSON.parse(activityContent);
      for (const act of activities) {
        const d = new Date(act.timestamp);
        if (d.getFullYear() === year && d.getMonth() + 1 === month) {
          events.push({
            id: act.id,
            date: act.timestamp.split("T")[0],
            title: act.message,
            type: "activity",
            actionType: act.type,
            entityType: act.entityType,
          });
        }
      }
    } catch {}

    // Group by date
    const grouped: Record<string, any[]> = {};
    for (const event of events) {
      if (!grouped[event.date]) grouped[event.date] = [];
      grouped[event.date].push(event);
    }

    return NextResponse.json({ year, month, events: grouped });
  } catch (err) {
    console.error("Error loading calendar events:", err);
    return NextResponse.json({ events: {} }, { status: 500 });
  }
}
