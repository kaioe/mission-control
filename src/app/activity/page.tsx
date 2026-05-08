"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/app/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Activity {
  id: string;
  type: string;
  entityType: string;
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

export default function ActivityPage() {
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchActivity() {
      try {
        const res = await fetch("/api/activity?limit=200");
        if (res.ok) setActivity(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchActivity();
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

  function formatDate(ts: string): string {
    const d = new Date(ts);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  const filtered = filter === "all" ? activity : activity.filter((a) => a.type === filter);
  const types = [...new Set(activity.map((a) => a.type))];

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#F5F5F5] mb-2">Activity</h1>
          <p className="text-[#6B7280]">{activity.length} events · Crew operation log</p>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
              filter === "all" ? "bg-[#9333EA]/20 text-[#9333EA] border border-[#9333EA]/50" : "bg-[#0A0A0F] text-[#6B7280] border border-white/10 hover:text-[#F5F5F5]"
            }`}
          >
            All
          </button>
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                filter === t
                  ? "bg-[#9333EA]/20 text-[#9333EA] border border-[#9333EA]/50"
                  : "bg-[#0A0A0F] text-[#6B7280] border border-white/10 hover:text-[#F5F5F5]"
              }`}
            >
              {typeIcons[t] || "📌"} {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-[#141419] border border-white/5 rounded-lg animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-[#6B7280]">No activity events match this filter.</div>
        ) : (
          <div className="space-y-1">
            {filtered.map((act) => (
              <Card key={act.id} className="bg-[#141419] border-white/10 hover:border-white/20 transition-colors">
                <CardContent className="p-4 flex items-start gap-3">
                  <span className="text-base mt-0.5">{typeIcons[act.type] || "📌"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm text-[#D1D5DB]">{act.message}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={`text-[10px] ${typeColors[act.type] || "border-[#6B7280]/30 text-[#6B7280]"}`}>
                        {act.type.toUpperCase()}
                      </Badge>
                      {act.entityType !== "system" && (
                        <Badge variant="outline" className="text-[10px] border-white/10 text-[#6B7280]">
                          {act.entityType}
                        </Badge>
                      )}
                      <span className="text-[11px] text-[#6B7280]">{formatDate(act.timestamp)}</span>
                      <span className="text-[11px] text-[#4B5563]">({timeAgo(act.timestamp)})</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
