"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/app/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface DashboardStats {
  projects: { total: number; active: number; averageProgress: number };
  memory: { entries: number };
  docs: { total: number };
  tasks: { total: number };
  agents: { total: number; list: { name: string; role: string; beltColor: string; status: string }[] };
  activity: { total: number };
}

interface Activity {
  id: string;
  type: string;
  entityType: string;
  entityId: string;
  entityName: string;
  message: string;
  timestamp: string;
}

const typeColors: Record<string, string> = {
  system: "border-[#6B7280]/30 text-[#6B7280]",
  created: "border-[#2563EB]/30 text-[#2563EB]",
  done: "border-[#9333EA]/30 text-[#9333EA]",
  updated: "border-[#92400E]/30 text-[#92400E]",
};

const typeIcons: Record<string, string> = {
  system: "⚙️",
  created: "➕",
  done: "✅",
  updated: "🔄",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [statsRes, actRes] = await Promise.all([
          fetch("/api/stats"),
          fetch("/api/activity?limit=8"),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (actRes.ok) setActivity(await actRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  function timeAgo(ts: string): string {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl">
        {/* Hero */}
        <div className="mb-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[#9333EA] font-bold text-lg">₪</span>
              <span className="text-sm text-[#6B7280] font-mono">MISSION CONTROL v0.1</span>
            </div>
            <h1 className="text-4xl font-bold text-[#F5F5F5] mb-2 tracking-tight">BJJ Lotus Club</h1>
            <p className="text-[#6B7280] max-w-lg">AI crew command center. Orchestrating agents, managing projects, and building the future of BJJ education.</p>
          </div>
          <div className="w-24 h-24 opacity-60 hidden md:block">
            <img src="/bjj-pixel-art.svg" alt="BJJ" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-10">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-24 bg-[#141419] border border-white/5 rounded-lg animate-pulse" />)}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
            <Card className="bg-[#141419] border-white/10">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#6B7280] uppercase tracking-wider">Projects</span>
                  <div className="w-6 h-6 rounded bg-[#2563EB]/20 flex items-center justify-center text-[#2563EB] text-xs">◇</div>
                </div>
                <p className="text-2xl font-bold text-[#F5F5F5]">{stats.projects.total}</p>
                <span className="text-xs text-[#9333EA]">{stats.projects.averageProgress}% avg progress</span>
              </CardContent>
            </Card>
            <Card className="bg-[#141419] border-white/10">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#6B7280] uppercase tracking-wider">Tasks</span>
                  <div className="w-6 h-6 rounded bg-[#7D3C98]/20 flex items-center justify-center text-[#7D3C98] text-xs">□</div>
                </div>
                <p className="text-2xl font-bold text-[#F5F5F5]">{stats.tasks.total}</p>
                <span className="text-xs text-[#6B7280]">in queue</span>
              </CardContent>
            </Card>
            <Card className="bg-[#141419] border-white/10">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#6B7280] uppercase tracking-wider">Memory</span>
                  <div className="w-6 h-6 rounded bg-[#92400E]/20 flex items-center justify-center text-[#92400E] text-xs">🧠</div>
                </div>
                <p className="text-2xl font-bold text-[#F5F5F5]">{stats.memory.entries}</p>
                <span className="text-xs text-[#6B7280]">daily logs</span>
              </CardContent>
            </Card>
            <Card className="bg-[#141419] border-white/10">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#6B7280] uppercase tracking-wider">Docs</span>
                  <div className="w-6 h-6 rounded bg-[#2563EB]/20 flex items-center justify-center text-[#2563EB] text-xs">📝</div>
                </div>
                <p className="text-2xl font-bold text-[#F5F5F5]">{stats.docs.total}</p>
                <span className="text-xs text-[#6B7280]">documents</span>
              </CardContent>
            </Card>
            <Card className="bg-[#141419] border-white/10">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#6B7280] uppercase tracking-wider">Activity</span>
                  <div className="w-6 h-6 rounded bg-[#2563EB]/20 flex items-center justify-center text-[#2563EB] text-xs">📋</div>
                </div>
                <p className="text-2xl font-bold text-[#F5F5F5]">{stats.activity.total}</p>
                <span className="text-xs text-[#6B7280]">events logged</span>
              </CardContent>
            </Card>
            <Card className="bg-[#141419] border-white/10">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#6B7280] uppercase tracking-wider">Crew</span>
                  <div className="w-6 h-6 rounded bg-[#9333EA]/20 flex items-center justify-center text-[#9333EA] text-xs">👥</div>
                </div>
                <p className="text-2xl font-bold text-[#F5F5F5]">{stats.agents.total}</p>
                <span className="text-xs text-[#6B7280]">agents online</span>
              </CardContent>
            </Card>
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-2 mb-10">
          {/* Activity Feed */}
          <Card className="bg-[#141419] border-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base text-[#F5F5F5]">📋 Recent Activity</CardTitle>
              <Link href="/activity" className="text-xs text-[#9333EA] hover:underline">View all</Link>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-5 space-y-4">
                  {[1,2,3].map(i => <div key={i} className="h-12 bg-[#0A0A0F] rounded animate-pulse" />)}
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {activity.map((act) => (
                    <div key={act.id} className="flex items-start gap-3 px-5 py-3">
                      <span className="text-sm mt-0.5">{typeIcons[act.type] || "📌"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#D1D5DB] truncate">{act.message}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className={`text-[10px] ${typeColors[act.type] || "border-[#6B7280]/30 text-[#6B7280]"}`}>
                            {act.type.toUpperCase()}
                          </Badge>
                          <span className="text-[10px] text-[#6B7280]">{timeAgo(act.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Crew Section */}
          <Card className="bg-[#141419] border-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base text-[#F5F5F5]">🛸 Crew</CardTitle>
              <Link href="/team" className="text-xs text-[#9333EA] hover:underline">Manage</Link>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="space-y-3">
                {stats?.agents.list.map((agent) => (
                  <div key={agent.name} className="flex items-center gap-3 p-3 bg-[#0A0A0F] rounded-lg">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                      style={{ backgroundColor: `${agent.beltColor === "purple" ? "#7D3C98" : "#2563EB"}20` }}
                    >
                      {agent.name === "Oss" ? "👻" : "👤"}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#F5F5F5]">{agent.name}</p>
                      <span className="text-xs text-[#6B7280]">{agent.role} · {(agent.beltColor || "white").toUpperCase()} BELT</span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${agent.status === "active" ? "bg-green-500" : "bg-gray-500"}`} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-bold text-[#F5F5F5] mb-4">⚡ Quick Actions</h2>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <Link href="/projects" className="block p-5 bg-[#141419] border border-white/10 rounded-lg hover:border-[#9333EA]/50 transition-all">
              <p className="text-sm font-medium text-[#F5F5F5] mb-1">📊 Projects</p>
              <p className="text-xs text-[#6B7280]">Create, edit, track missions</p>
            </Link>
            <Link href="/tasks" className="block p-5 bg-[#141419] border border-white/10 rounded-lg hover:border-[#9333EA]/50 transition-all">
              <p className="text-sm font-medium text-[#F5F5F5] mb-1">✅ Tasks</p>
              <p className="text-xs text-[#6B7280]">Manage the queue</p>
            </Link>
            <Link href="/content" className="block p-5 bg-[#141419] border border-white/10 rounded-lg hover:border-[#9333EA]/50 transition-all">
              <p className="text-sm font-medium text-[#F5F5F5] mb-1">✍️ Content</p>
              <p className="text-xs text-[#6B7280]">Write newsletters & docs</p>
            </Link>
            <Link href="/memory" className="block p-5 bg-[#141419] border border-white/10 rounded-lg hover:border-[#9333EA]/50 transition-all">
              <p className="text-sm font-medium text-[#F5F5F5] mb-1">🧠 Memory</p>
              <p className="text-xs text-[#6B7280]">Browse daily logs</p>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
