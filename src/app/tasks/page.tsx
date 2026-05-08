"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/app/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/toast";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  project: string;
  assignee: string;
  dueDate?: string;
  createdAt: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", status: "pending", priority: "medium", project: "", assignee: "", dueDate: "" });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const { addToast } = useToast();

  async function fetchTasks() {
    try {
      setLoading(true);
      const res = await fetch("/api/tasks");
      if (res.ok) setTasks(await res.json());
    } catch (err) {
      console.error(err);
      addToast("Failed to load tasks", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchTasks(); }, []);

  async function toggleTask(task: Task) {
    const newStatus = task.status === "done" ? "pending" : "done";
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)));
        addToast(newStatus === "done" ? "Task completed ✓" : "Task reopened");
      }
    } catch {
      addToast("Failed to toggle task", "error");
    }
  }

  async function deleteTask(id: string) {
    if (!confirm("Delete this task?")) return;
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        addToast("Task deleted");
      }
    } catch {
      addToast("Failed to delete task", "error");
    }
  }

  async function saveTask() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ title: "", status: "pending", priority: "medium", project: "", assignee: "", dueDate: "" });
        addToast("Task created!");
        fetchTasks();
      }
    } catch {
      addToast("Failed to create task", "error");
    } finally {
      setSaving(false);
    }
  }

  const statusColors: Record<string, string> = {
    pending: "border-[#92400E] text-[#92400E]",
    "in-progress": "border-[#2563EB] text-[#2563EB]",
    done: "border-[#9333EA] text-[#9333EA]",
  };

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.project.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#F5F5F5] mb-2">Tasks</h1>
            <p className="text-[#6B7280]">{tasks.length} total · {tasks.filter((t) => t.status === "done").length} done</p>
          </div>
          <button onClick={() => setShowModal(true)} className="px-4 py-2 text-sm font-medium bg-[#9333EA] text-white rounded-md hover:bg-[#7D3C98] transition-colors flex items-center gap-2">
            <span>+</span> New Task
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full max-w-md px-3 py-2 bg-[#0A0A0F] border border-white/10 rounded-md text-[#F5F5F5] text-sm focus:border-[#9333EA] focus:outline-none"
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-[#141419] border border-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#6B7280] mb-2">{search ? "No tasks match your search." : "No tasks yet."}</p>
            {!search && (
              <button onClick={() => setShowModal(true)} className="text-[#9333EA] text-sm hover:underline">Create your first task</button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task) => (
              <Card key={task.id} className={`bg-[#141419] border-white/10 group ${task.status === "done" ? "opacity-60" : ""}`}>
                <CardContent className="p-4 flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={task.status === "done"}
                    onChange={() => toggleTask(task)}
                    className="w-4 h-4 accent-[#9333EA] cursor-pointer flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${task.status === "done" ? "text-[#6B7280] line-through" : "text-[#F5F5F5]"}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      {task.project && <span className="text-xs text-[#6B7280]">📁 {task.project}</span>}
                      {task.assignee && <span className="text-xs text-[#6B7280]">👤 {task.assignee}</span>}
                      {task.dueDate && (
                        <span className={`text-xs ${new Date(task.dueDate) < new Date() ? "text-[#DC2626]" : "text-[#2563EB]"}`}>
                          📅 {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="outline" className={statusColors[task.status] || ""}>
                      {task.status === "in-progress" ? "IN PROGRESS" : task.status.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-[#6B7280] hidden sm:inline">{task.priority}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                      className="text-[#6B7280] hover:text-[#DC2626] transition-colors opacity-0 group-hover:opacity-100 text-xs ml-2"
                    >
                      ✕
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#141419] border border-white/10 rounded-lg w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#F5F5F5]">New Task</h2>
              <button onClick={() => setShowModal(false)} className="text-[#6B7280] hover:text-[#F5F5F5] text-xl">✕</button>
            </div>
            <div className="space-y-4">
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Task title" className="w-full px-3 py-2 bg-[#0A0A0F] border border-white/10 rounded-md text-[#F5F5F5] text-sm focus:border-[#9333EA] focus:outline-none" />
              <div className="flex gap-4">
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="flex-1 px-3 py-2 bg-[#0A0A0F] border border-white/10 rounded-md text-[#F5F5F5] text-sm focus:border-[#9333EA] focus:outline-none">
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="flex-1 px-3 py-2 bg-[#0A0A0F] border border-white/10 rounded-md text-[#F5F5F5] text-sm focus:border-[#9333EA] focus:outline-none">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <input type="text" value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} placeholder="Project (optional)" className="w-full px-3 py-2 bg-[#0A0A0F] border border-white/10 rounded-md text-[#F5F5F5] text-sm focus:border-[#9333EA] focus:outline-none" />
              <input type="text" value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} placeholder="Assignee (optional)" className="w-full px-3 py-2 bg-[#0A0A0F] border border-white/10 rounded-md text-[#F5F5F5] text-sm focus:border-[#9333EA] focus:outline-none" />
              <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full px-3 py-2 bg-[#0A0A0F] border border-white/10 rounded-md text-[#F5F5F5] text-sm focus:border-[#9333EA] focus:outline-none" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-[#6B7280] border border-white/10 rounded-md">Cancel</button>
              <button onClick={saveTask} disabled={saving || !form.title.trim()} className="px-4 py-2 text-sm font-medium bg-[#9333EA] text-white rounded-md disabled:opacity-50">{saving ? "Saving..." : "Create Task"}</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
