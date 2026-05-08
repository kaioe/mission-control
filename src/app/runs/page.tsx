"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/app/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RunEntry {
  id: string;
  message: string;
  timestamp: string;
  type: string;
  entityType: string;
  entityName: string;
}

export default function RunsPage() {
  const [runs, setRuns] = useState<RunEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRuns() {
      try {
        const res = await fetch("/api/activity?limit=200");
        if (res.ok) {
          const all = await res.json();
          // Filter to system events (autonomous runs)
          setRuns(all.filter((a: any) => a.type === "system"));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchRuns();
  }, []);

  function formatDate(ts: string): string {
    return new Date(ts).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  }

  function timeAgo(ts: string): string {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  const cronJobs = [
    { name: "Crew Cycle", schedule: "Every 4 hours", desc: "Reads projects/tasks/memory, picks pending work, executes, logs results" },
    { name: "Task Scheduler", schedule: "Every 6 hours (offset)", desc: "Checks projects for gaps, creates next-step tasks automatically" },
    { name: "Memory Consolidation", schedule: "Daily at 04:00 CEST", desc: "Curates daily logs into long-term memory" },
  ];

  return (
    <DashboardLayout>
      <div className="p-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#F5F5F5] mb-2">Runs</h1>
          <p className="text-[#6B7280]">Autonomous crew operations and cron job history</p>
        </div>

        {/* Cron Job Status Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-10">
          {cronJobs.map((job) => (
            <Card key={job.name} className="bg-[#141419] border-white/10">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium text-[#F5F5F5]">{job.name}</span>
                </div>
                <p className="text-xs text-[#6B7280] mb-2">{job.schedule}</p>
                <p className="text-xs text-[#D1D5DB] leading-relaxed">{job.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Run Log */}
        <div>
          <h2 className="text-lg font-bold text-[#F5F5F5] mb-4">📋 Operation Log</h2>
          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-[#141419] border border-white/5 rounded-lg animate-pulse" />)}
            </div>
          ) : runs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#6B7280] mb-2">No autonomous runs recorded yet.</p>
              <p className="text-xs text-[#6B7280]">System events will appear here as the crew cycles run.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {runs.map((run) => (
                <Card key={run.id} className="bg-[#141419] border-white/10">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="w-6 h-6 rounded bg-[#6B7280]/20 flex items-center justify-center text-xs mt-0.5 flex-shrink-0">⚙️</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#D1D5DB]">{run.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="border-[#6B7280]/30 text-[#6B7280] text-[10px]">SYSTEM</Badge>
                        <span className="text-[11px] text-[#6B7280]">{formatDate(run.timestamp)}</span>
                        <span className="text-[11px] text-[#4B5563]">({timeAgo(run.timestamp)})</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
