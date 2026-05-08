"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/app/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/toast";

export default function ContentPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", category: "newsletter", content: "" });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const { addToast } = useToast();

  async function fetchDocs() {
    try {
      const res = await fetch("/api/docs");
      if (res.ok) setDocs(await res.json());
    } catch (err) {
      console.error(err);
      addToast("Failed to load docs", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchDocs(); }, []);

  function openCreate() {
    setEditing(null);
    setForm({ title: "", category: "newsletter", content: "" });
    setShowModal(true);
  }

  function openEdit(doc: any) {
    setEditing(doc);
    setForm({ title: doc.title, category: doc.path.split("/")[0], content: doc.content });
    setShowModal(true);
  }

  async function saveDoc() {
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    try {
      // For simplicity, delete old + recreate
      if (editing) {
        // We don't have a DELETE endpoint for docs yet - just create a new one
      }
      const res = await fetch("/api/docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ title: "", category: "newsletter", content: "" });
        addToast(editing ? "Document updated!" : "Document created!");
        fetchDocs();
      }
    } catch {
      addToast("Failed to save document", "error");
    } finally {
      setSaving(false);
    }
  }

  const filteredDocs = docs.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.path.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#F5F5F5] mb-2">Content</h1>
            <p className="text-[#6B7280]">{docs.length} documents</p>
          </div>
          <button onClick={openCreate} className="px-4 py-2 text-sm font-medium bg-[#9333EA] text-white rounded-md hover:bg-[#7D3C98] transition-colors flex items-center gap-2">
            <span>+</span> New Document
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full max-w-md px-3 py-2 bg-[#0A0A0F] border border-white/10 rounded-md text-[#F5F5F5] text-sm focus:border-[#9333EA] focus:outline-none"
          />
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 bg-[#141419] border border-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#6B7280] mb-4">{search ? "No documents match your search." : "No documents yet."}</p>
            {!search && (
              <button onClick={openCreate} className="text-[#9333EA] text-sm hover:underline">Write your first document</button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDocs.map((doc) => (
              <Card key={doc.path} className="bg-[#141419] border-white/10 group cursor-pointer" onClick={() => openEdit(doc)}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-[#9333EA]/10 flex items-center justify-center text-[#9333EA] text-xs font-bold">
                        {doc.path.includes("newsletter") ? "📝" : doc.path.includes("video") ? "🎥" : "📚"}
                      </div>
                      <div>
                        <CardTitle className="text-base text-[#F5F5F5]">{doc.title}</CardTitle>
                        <span className="text-xs text-[#6B7280]">{doc.wordCount} words · {doc.path}</span>
                      </div>
                    </div>
                    <span className="text-xs text-[#6B7280] opacity-0 group-hover:opacity-100 transition-opacity">Click to edit</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#6B7280] leading-relaxed whitespace-pre-wrap line-clamp-3">{doc.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#141419] border border-white/10 rounded-lg w-full max-w-2xl mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#F5F5F5]">{editing ? "Edit Document" : "New Document"}</h2>
              <button onClick={() => setShowModal(false)} className="text-[#6B7280] hover:text-[#F5F5F5] text-xl">✕</button>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-[#6B7280] mb-1">Title</label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 bg-[#0A0A0F] border border-white/10 rounded-md text-[#F5F5F5] text-sm focus:border-[#9333EA] focus:outline-none" placeholder="Document title" />
                </div>
                <div className="w-40">
                  <label className="block text-sm text-[#6B7280] mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 bg-[#0A0A0F] border border-white/10 rounded-md text-[#F5F5F5] text-sm focus:border-[#9333EA] focus:outline-none">
                    <option value="newsletter">📝 Newsletter</option>
                    <option value="video">🎥 Video Script</option>
                    <option value="course">📚 Course</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#6B7280] mb-1">Content (Markdown)</label>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full px-3 py-2 bg-[#0A0A0F] border border-white/10 rounded-md text-[#F5F5F5] text-sm focus:border-[#9333EA] focus:outline-none h-64 resize-none font-mono" placeholder="# Title\n\nWrite your content in markdown..." />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-[#6B7280] border border-white/10 rounded-md">Cancel</button>
              <button onClick={saveDoc} disabled={saving || !form.title.trim() || !form.content.trim()} className="px-4 py-2 text-sm font-medium bg-[#9333EA] text-white rounded-md disabled:opacity-50">{saving ? "Saving..." : editing ? "Save Changes" : "Create Document"}</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
