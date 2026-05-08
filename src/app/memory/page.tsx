"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/app/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MemoryEntry {
  id: string;
  date: string;
  title: string;
  preview: string;
  wordCount: number;
  lineCount: number;
  updatedAt: string;
}

export default function MemoryPage() {
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MemoryEntry | null>(null);
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchMemories() {
      try {
        const res = await fetch("/api/memories");
        if (res.ok) setMemories(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMemories();
  }, []);

  async function openMemory(memory: MemoryEntry) {
    setSelected(memory);
    setContent("Loading...");
    try {
      const res = await fetch(`/api/memories/${memory.id}`);
      if (res.ok) {
        const data = await res.json();
        setContent(data.content);
      }
    } catch (err) {
      console.error(err);
      setContent("Failed to load content.");
    }
  }

  const filteredMemories = memories.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.preview.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#F5F5F5] mb-2">Memory</h1>
            <p className="text-[#6B7280]">{memories.length} daily logs</p>
          </div>
          {selected && (
            <button onClick={() => { setSelected(null); setContent(""); }} className="px-3 py-1.5 text-sm text-[#6B7280] hover:text-[#F5F5F5] border border-white/10 rounded-md transition-colors">
              ← Back to list
            </button>
          )}
        </div>

        {!selected && (
          <div className="mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search memory..."
              className="w-full max-w-md px-3 py-2 bg-[#0A0A0F] border border-white/10 rounded-md text-[#F5F5F5] text-sm focus:border-[#9333EA] focus:outline-none"
            />
          </div>
        )}

        {selected ? (
          <Card className="bg-[#141419] border-white/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[#2563EB]/20 flex items-center justify-center text-[#2563EB] text-xs font-bold">{selected.date.slice(8)}</div>
                <div>
                  <CardTitle className="text-lg text-[#F5F5F5]">{selected.title}</CardTitle>
                  <span className="text-xs text-[#6B7280]">{selected.date} · {selected.wordCount} words</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="text-sm text-[#D1D5DB] font-mono whitespace-pre-wrap leading-relaxed">{content}</pre>
            </CardContent>
          </Card>
        ) : loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 bg-[#141419] border border-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredMemories.length === 0 ? (
          <div className="text-[#6B7280] text-center py-20">{search ? "No memory entries match your search." : "No memory entries yet."}</div>
        ) : (
          <div className="space-y-4">
            {filteredMemories.map((memory) => (
              <Card key={memory.id} className="bg-[#141419] border-white/10 hover:border-[#2563EB]/50 transition-all cursor-pointer" onClick={() => openMemory(memory)}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] font-bold text-sm">{memory.date.slice(8)}</div>
                      <div>
                        <CardTitle className="text-base text-[#F5F5F5]">{memory.title}</CardTitle>
                        <span className="text-xs text-[#6B7280]">{memory.date} · {memory.wordCount} words · {memory.lineCount} lines</span>
                      </div>
                    </div>
                    <span className="text-[#6B7280] text-sm">→</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#6B7280] line-clamp-2">{memory.preview}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
