import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DATA_FILE = "/root/.openclaw/workspace/mission-control/data/activity.json";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");

    const content = await fs.readFile(DATA_FILE, "utf-8");
    let activities = JSON.parse(content);

    // Sort by timestamp descending (newest first)
    activities.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (limit > 0) {
      activities = activities.slice(0, limit);
    }

    return NextResponse.json(activities);
  } catch (err) {
    console.error("Error reading activity:", err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const content = await fs.readFile(DATA_FILE, "utf-8").catch(() => "[]");
    const activities = JSON.parse(content);

    const entry = {
      id: `act-${Date.now()}`,
      type: body.type || "system",
      entityType: body.entityType || "system",
      entityId: body.entityId || "",
      entityName: body.entityName || "",
      message: body.message,
      timestamp: new Date().toISOString(),
    };

    activities.push(entry);
    await fs.writeFile(DATA_FILE, JSON.stringify(activities, null, 2));

    return NextResponse.json(entry, { status: 201 });
  } catch (err) {
    console.error("Error writing activity:", err);
    return NextResponse.json({ error: "Failed to log activity" }, { status: 500 });
  }
}
