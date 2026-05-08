"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/app/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/toast";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
}

interface MemoryRef {
  id: string;
  title: string;
  wordCount: number;
}

interface DocRef {
  path: string;
  title: string;
  wordCount: number;
}

interface ProjectDetail {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  mission: string;
  createdAt: string;
  updatedAt: string;
  linkedTasks: Task[];
  linkedMemories: MemoryRef[];
  linkedDocs: DocRef[];
}

interface Activity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  actor: string;
  projectId?: string;
}

const beltColors: Record<string, string> = { white: "#F5F5F5", blue: "#2563EB", purple: "#9333EA", brown: "#92400E", black: "#0A0A0A" };
const beltOrder = ["white", "blue", "purple", "brown", "black"];

const statusColors: Record<string, string> = { active: "border-[#2563EB] text-[#2563EB]", completed: "border-[#9333EA] text-[#9333EA]", paused: "border-[#92400E] text-[#92400E]" };
const taskStripe: Record<string, string> = { done: "bg-[#9333EA]/20 border-[#9333EA]/40", "in-progress": "bg-[#2563EB]/20 border-[#2563EB]/40", pending: "bg-[#92400E]/20 border-[#92400E]/40" };

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const id = typeof params.id === "string" ? params.id : "";

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingForm, setEditingForm] = useState<Partial<ProjectDetail>>({});
  const [saving, setSaving] = useState(false);

  async function fetchActivities() {
    try {
      const res = await fetch("/api/activity?limit=100");
      if (!res.ok) return;
      const data = await res.json();
      const filtered = (data.activities || []).filter(
        (a: Activity) => a.projectId === id || a.message?.toLowerCase().includes(id.toLowerCase())
      );
      setActivities(filtered);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchProject() {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data);
        setEditingForm({ ...data });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      fetchProject();
      fetchActivities();
    }
  }, [id]);

  async function saveProject() {
    if (!editingForm.name?.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingForm,
          id,
          createdAt: project?.createdAt || new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setShowEditModal(false);
        addToast("Project updated!");
        fetchProject();
      }
    } catch (err) {
      console.error("Failed to save project:", err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 max-w-5xl">
          <div className="h-48 bg-[#141419] border border-white/5 rounded-lg animate-pulse" />
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="p-8 max-w-5xl">
          <div className="text-center py-20">
            <p className="text-[#6B7280]">Project not found.</p>
            <button onClick={() => router.push("/projects")} className="mt-4 text-[#9333EA] text-sm hover:underline">← Back to projects</button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const beltColor = beltColors[beltOrder.findIndex((b) => b === id) >= 0 ? beltOrder[beltOrder.findIndex((b) => b === id)] : "purple"] || "#6B7280";

  function formatDate(ts: string): string {
    return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-5xl">
        <button onClick={() => router.push("/projects")} className="text-sm text-[#6B7280] hover:text-[#F5F5F5] mb-6 block transition-colors">
          ← Back to projects
        </button>

        <div className="flex items-start gap-6 mb-8">
          <div className="w-2 h-16 rounded-sm flex-shrink-0" style={{ backgroundColor: beltColor }} />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-[#F5F5F5]">{project.name}</h1>
                <Badge variant="outline" className={statusColors[project.status] || ""}>
                  {project.status.toUpperCase()}
                </Badge>
              </div>
              <button
                onClick={() => setShowEditModal(true)}
                className="px-3 py-1.5 text-sm font-medium bg-[#9333EA] text-white rounded-md hover:bg-[#7D3C98] transition-colors"
              >
                Edit Project
              </button>
            </div>
            <p className="text-[#6B7280] mb-4">{project.description}</p>
            <div className="flex items-center gap-6 text-xs text-[#6B7280]">
              <span>Created {formatDate(project.createdAt)}</span>
              <span>Updated {formatDate(project.updatedAt)}</span>
              <span>{project.linkedTasks.length} tasks</span>
              <span>{project.linkedDocs.length} docs</span>
              <span>{project.linkedMemories.length} memories</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="bg-[#141419] border-white/10 md:col-span-1">
            <CardHeader>
              <CardTitle className="text-sm text-[#F5F5F5]">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[#F5F5F5] mb-3">{project.progress}%</p>
              <Progress value={project.progress} className="h-3 bg-[#1E1E2E]" />
            </CardContent>
          </Card>
          <Card className="bg-[#141419] border-white/10 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm text-[#F5F5F5]">Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#D1D5DB] leading-relaxed">{project.mission || "No mission statement defined."}</p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold text-[#F5F5F5] mb-4">🔗 Linked Tasks ({project.linkedTasks.length})</h2>
          {project.linkedTasks.length === 0 ? (
            <p className="text-sm text-[#6B7280]">No linked tasks.</p>
          ) : (
            <div className="space-y-2">
              {project.linkedTasks.map((task) => (
                <Card key={task.id} className={`bg-[#141419] border ${taskStripe[task.status] || "border-white/10"}`}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${task.status === "done" ? "bg-[#9333EA]" : task.status === "in-progress" ? "bg-[#2563EB]" : "bg-[#92400E]"}`} />
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${task.status === "done" ? "text-[#6B7280] line-through" : "text-[#F5F5F5]"}`}>{task.title}</p>
                    </div>
                    <span className="text-xs text-[#6B7280] uppercase">{task.status}</span>
                    <span className="text-[10px] text-[#4B5563]">{task.priority}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold text-[#F5F5F5] mb-4">📝 Linked Documents ({project.linkedDocs.length})</h2>
          {project.linkedDocs.length === 0 ? (
            <p className="text-sm text-[#6B7280]">No linked documents.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {project.linkedDocs.map((doc) => (
                <Card key={doc.path} className="bg-[#141419] border-white/10">
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-[#F5F5F5]">{doc.title}</p>
                    <p className="text-xs text-[#6B7280] mt-1">{doc.wordCount} words · {doc.path}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold text-[#F5F5F5] mb-4">🧠 Linked Memories ({project.linkedMemories.length})</h2>
          {project.linkedMemories.length === 0 ? (
            <p className="text-sm text-[#6B7280]">No linked memories.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {project.linkedMemories.map((mem) => (
                <Card key={mem.id} className="bg-[#141419] border-white/10 cursor-pointer hover:border-[#2563EB]/50 transition-all" onClick={() => router.push("/memory")}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] text-xs font-bold">{mem.id.slice(-2)}</div>
                    <div>
                      <p className="text-sm font-medium text-[#F5F5F5]">{mem.title}</p>
                      <p className="text-xs text-[#6B7280]">{mem.wordCount} words</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-white/10 pt-8">
          <h2 className="text-lg font-bold text-[#F5F5F5] mb-4">📊 Activity Feed ({activities.length})</h2>
          {activities.length === 0 ? (
            <p className="text-sm text-[#6B7280]">No activity recorded for this project.</p>
          ) : (
            <div className="space-y-2">
              {activities.map((a) => (
                <div key={a.id} className="flex items-center gap-3 p-3 bg-[#141419] border border-white/10 rounded-md">
                  <div className={`w-2 h-2 rounded-full ${a.type === "created" ? "bg-[#2563EB]" : a.type === "done" ? "bg-[#9333EA]" : a.type === "updated" ? "bg-[#92400E]" : "bg-[#6B7280]"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#F5F5F5] truncate">{a.message}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#6B7280]">
                    <span>{a.actor || "System"}</span>
                    <span>{formatDate(a.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-[#141419] border border-white/10 rounded-lg w-full max-lg mx-4 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[#F5F5F5]">Edit Project</h2>
                <button onClick={() => setShowEditModal(false)} className="text-[#6B7280] hover:text-[#F5F5F5] text-xl">✕</button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#6B7280] mb-1">Name</label>
                  <input
                    type="text"
                    value={editingForm.name || ""}
                    onChange={(e) => setEditingForm({ ...editingForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0A0A0F] border border-white/10 rounded-md text-[#F5F5F5] text-sm focus:border-[#9333EA] focus:outline-none"
                    placeholder="Project name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#6B7280] mb-1">Description</label>
                  <textarea
                    value={editingForm.description || ""}
                    onChange={(e) => setEditingForm({ ...editingForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0A0A0F] border border-white/10 rounded-md text-[#F5F5F5] text-sm focus:border-[#9333EA] focus:outline-none h-20 resize-none"
                    placeholder="What's this project about?"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#6B7280] mb-1">Mission</label>
                  <textarea
                    value={editingForm.mission || ""}
                    onChange={(e) => setEditingForm({ ...editingForm, mission: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0A0A0F] border border-white/10 rounded-md text-[#F5F5F5] text-sm focus:border-[#9333EA] focus:outline-none h-16 resize-none"
                    placeholder="Core mission statement"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm text-[#6B7280] mb-1">Status</label>
                    <select
                      value={editingForm.status || "active"}
                      onChange={(e) => setEditingForm({ ...editingForm, status: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0A0A0F] border border-white/10 rounded-md text-[#F5F5F5] text-sm focus:border-[#9333EA] focus:outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="w-24">
                    <label className="block text-sm text-[#6B7280] mb-1">Progress %</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={editingForm.progress ?? 0}
                      onChange={(e) => setEditingForm({ ...editingForm, progress: Math.min(100, Math.max(0, Number(e.target.value))) })}
                      className="w-full px-3 py-2 bg-[#0A0A0F] border border-white/10 rounded-md text-[#F5F5F5] text-sm focus:border-[#9333EA] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-sm text-[#6B7280] hover:text-[#F5F5F5] border border-white/10 rounded-md transition-colors">Cancel</button>
                <button
                  onClick={saveProject}
                  disabled={saving || !editingForm.name?.trim()}
                  className="px-4 py-2 text-sm font-medium bg-[#9333EA] text-white rounded-md hover:bg-[#7D3C98] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >{saving ? "Saving..." : "Save Changes"}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
