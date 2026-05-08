"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/app/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/toast";

export default function SettingsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [password, setPassword] = useState("");
  const { addToast } = useToast();

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setAgents(data.agents || []);
          setPasswordEnabled(data.passwordEnabled || false);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#F5F5F5] mb-2">Settings</h1>
          <p className="text-[#6B7280]">Configure agents, auth, and system preferences</p>
        </div>

        {/* Agents */}
        <Card className="bg-[#141419] border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-base text-[#F5F5F5]">🛸 Agents</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-20 bg-[#0A0A0F] rounded animate-pulse" />
            ) : (
              <div className="space-y-3">
                {agents.map((agent: any) => (
                  <div key={agent.id} className="flex items-center justify-between p-3 bg-[#0A0A0F] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                        style={{ backgroundColor: agent.beltColor === "purple" ? "#7D3C98" : "#2563EB" } as React.CSSProperties}>
                        {agent.name === "Oss" ? "👻" : "👤"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#F5F5F5]">{agent.displayName || agent.name}</p>
                        <span className="text-xs text-[#6B7280]">{agent.role} · {(agent.beltColor || "white").toUpperCase()} BELT</span>
                      </div>
                    </div>
                    <Badge variant="outline" className={agent.status === "active" ? "border-green-500/50 text-green-500" : "border-gray-500/50 text-gray-500"}>
                      {agent.status?.toUpperCase() || "ACTIVE"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cron Jobs */}
        <Card className="bg-[#141419] border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-base text-[#F5F5F5]">⏰ Cron Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#0A0A0F] rounded-lg">
                <div>
                  <p className="text-sm font-medium text-[#F5F5F5]">Crew Cycle</p>
                  <span className="text-xs text-[#6B7280]">Every 4 hours · Active</span>
                </div>
                <Badge variant="outline" className="border-green-500/50 text-green-500">RUNNING</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#0A0A0F] rounded-lg">
                <div>
                  <p className="text-sm font-medium text-[#F5F5F5]">Task Scheduler</p>
                  <span className="text-xs text-[#6B7280]">Every 6 hours · Active</span>
                </div>
                <Badge variant="outline" className="border-green-500/50 text-green-500">RUNNING</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#0A0A0F] rounded-lg">
                <div>
                  <p className="text-sm font-medium text-[#F5F5F5]">Memory Consolidation</p>
                  <span className="text-xs text-[#6B7280]">Daily at 04:00 CEST · Active</span>
                </div>
                <Badge variant="outline" className="border-green-500/50 text-green-500">SCHEDULED</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Auth */}
        <Card className="bg-[#141419] border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-base text-[#F5F5F5]">🔒 Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 bg-[#0A0A0F] rounded-lg mb-3">
              <div>
                <p className="text-sm font-medium text-[#F5F5F5]">Password Protection</p>
                <span className="text-xs text-[#6B7280]">{passwordEnabled ? "Enabled" : "Disabled — site is public"}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={passwordEnabled} onChange={() => setPasswordEnabled(!passwordEnabled)} />
                <div className="w-9 h-5 bg-[#1E1E2E] rounded-full peer peer-checked:bg-[#9333EA] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
              </label>
            </div>
            {passwordEnabled && (
              <div>
                <label className="block text-xs text-[#6B7280] mb-1">Set password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full max-w-sm px-3 py-2 bg-[#0A0A0F] border border-white/10 rounded-md text-[#F5F5F5] text-sm focus:border-[#9333EA] focus:outline-none"
                />
                <button
                  onClick={() => addToast("Password saved (UI only — wire to backend)")}
                  className="mt-2 px-3 py-1.5 text-xs bg-[#9333EA] text-white rounded-md hover:bg-[#7D3C98] transition-colors"
                >
                  Save
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="bg-[#141419] border-white/10">
          <CardHeader>
            <CardTitle className="text-base text-[#F5F5F5]">ℹ️ System</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-[#6B7280] space-y-1">
              <p>Mission Control v0.1</p>
              <p>Next.js 16.2.6 · React 19.2.4 · Tailwind 4</p>
              <p>office.kaioandrade.com</p>
              <p className="mt-2 text-[#4B5563]">Managed by Oss 👻 — Chief of Staff</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
