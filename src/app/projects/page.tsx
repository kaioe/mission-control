"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/app/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

import { useToast } from "@/components/toast";

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  mission: string;
  linkedMemories: string[];
  linkedDocs: string[];
  linkedTasks: string[];
}

const EMPTY_PROJECT: Project = {
  id: "",
  name: "",
  description: "",
  status: "active",
  progress: 0,
  createdAt: "",
  updatedAt: "",
  mission: "",
  linkedMemories: [],
  linkedDocs: [],
  linkedTasks: [],
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState({ ...EMPTY_PROJECT });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const { addToast } = useToast();

  const beltColors: Record<string, string> = {
    white: "#F5F5F5",
    blue: "#2563EB",
    purple: "#9333EA",
    brown: "#92400E",
    black: "#0A0A0A",
  };

  const beltOrder = ["white", "blue", "purple", "brown", "black"];

  function projectBeltColor(index: number): string {
    return beltColors[beltOrder[index % beltOrder.length]] || "#6B7280";
  }

  async function fetchProjects() {
    try {
      setLoading(true);
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({
      id: "",
      name: "",
      description: "",
      status: "active",
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mission: "",
      linkedMemories: [],
      linkedDocs: [],
      linkedTasks: [],
    });
    setShowModal(true);
  }

  function openEdit(project: Project) {
    setEditing(project);
    setForm({ ...project });
    setShowModal(true);
  }

  async function saveProject() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const id = editing ? editing.id : form.name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
      const method = editing ? "PUT" : "PUT";
      const res = await fetch(`/api/projects/${id}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          id,
          createdAt: editing ? editing.createdAt : new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setShowModal(false);
        addToast(editing ? "Project updated!" : "Project created!");
        fetchProjects();
      }
    } catch (err) {
      console.error("Failed to save project:", err);
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject(project: Project) {
    if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
      if (res.ok) {
        fetchProjects();
        addToast(`"${project.name}" deleted`);
      }
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#F5F5F5] mb-2">Projects</h1>
            <p className="text-[#6B7280]">Active missions and their progress</p>
          </div>
          <button
            onClick={openCreate}
            className="px-4 py-2 text-sm font-medium bg-[#9333EA] text-white rounded-md hover:bg-[#7D3C98] transition-colors flex items-center gap-2"
          >
            <span>+</span> New Project
          </button>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-[#141419] border border-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 opacity-40">
              <img src="/bjj-pixel-art.svg" alt="BJJ" className="w-full h-full object-contain" />
            </div>
            <p className="text-[#6B7280] mb-4">No projects yet.</p>
            <button
              onClick={openCreate}
              className="px-4 py-2 text-sm font-medium bg-[#9333EA]/20 text-[#9333EA] border border-[#9333EA]/50 rounded-md hover:bg-[#9333EA]/30 transition-colors"
            >
              Create your first project
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => {
              const beltColor = projectBeltColor(index);
              return (
                <Card
                  key={project.id}
                  className="bg-[#141419] border-white/10 hover:border-[#9333EA]/50 transition-all cursor-pointer group relative"
                  onClick={() => openEdit(project)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-6 rounded-sm"
                          style={{ backgroundColor: beltColor }}
                        />
                        <Badge
                          variant="outline"
                          className={`
                            ${project.status === "active" ? "border-[#2563EB] text-[#2563EB]" : ""}
                            ${project.status === "completed" ? "border-[#9333EA] text-[#9333EA]" : ""}
                            ${project.status === "paused" ? "border-[#92400E] text-[#92400E]" : ""}
                          `}
                        >
                          {project.status.toUpperCase()}
                        </Badge>
                      </div>
                      <span className="text-xs text-[#6B7280]">{project.progress}%</span>
                    </div>
                    <CardTitle className="text-lg text-[#F5F5F5] flex items-center gap-3">
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: beltColor }}
                      />
                      {project.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[#6B7280] mb-4 line-clamp-2">
                      {project.description}
                    </p>
                    <Progress
                      value={project.progress}
                      className="h-2 bg-[#1E1E2E]"
                    />
                    <div className="flex items-center gap-4 mt-4 text-xs text-[#6B7280]">
                      <span>🔗 {project.linkedTasks.length} tasks</span>
                      <span>📝 {project.linkedDocs.length} docs</span>
                      <span>🧠 {project.linkedMemories.length} memories</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProject(project);
                      }}
                      className="mt-3 text-xs text-[#6B7280] hover:text-[#DC2626] transition-colors opacity-0 group-hover:opacity-100"
                    >
                      Delete project
                    </button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#141419] border border-white/10 rounded-lg w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#F5F5F5]">
                {editing ? "Edit Project" : "New Project"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#6B7280] hover:text-[#F5F5F5] text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#6B7280] mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0A0A0F] border border-white/10 rounded-md text-[#F5F5F5] text-sm focus:border-[#9333EA] focus:outline-none"
                  placeholder="Project name"
                />
              </div>
              <div>
                <label className="block text-sm text-[#6B7280] mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0A0A0F] border border-white/10 rounded-md text-[#F5F5F5] text-sm focus:border-[#9333EA] focus:outline-none h-20 resize-none"
                  placeholder="What's this project about?"
                />
              </div>
              <div>
                <label className="block text-sm text-[#6B7280] mb-1">Mission</label>
                <textarea
                  value={form.mission}
                  onChange={(e) => setForm({ ...form, mission: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0A0A0F] border border-white/10 rounded-md text-[#F5F5F5] text-sm focus:border-[#9333EA] focus:outline-none h-16 resize-none"
                  placeholder="Core mission statement"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-[#6B7280] mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
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
                    value={form.progress}
                    onChange={(e) =>
                      setForm({ ...form, progress: Math.min(100, Math.max(0, Number(e.target.value))) })
                    }
                    className="w-full px-3 py-2 bg-[#0A0A0F] border border-white/10 rounded-md text-[#F5F5F5] text-sm focus:border-[#9333EA] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-[#6B7280] hover:text-[#F5F5F5] border border-white/10 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveProject}
                disabled={saving || !form.name.trim()}
                className="px-4 py-2 text-sm font-medium bg-[#9333EA] text-white rounded-md hover:bg-[#7D3C98] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : editing ? "Save Changes" : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
