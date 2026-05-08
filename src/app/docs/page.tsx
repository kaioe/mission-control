"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/app/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DocsPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchDocs() {
      try {
        const res = await fetch("/api/docs");
        if (res.ok) setDocs(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDocs();
  }, []);

  const filteredDocs = docs.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.path.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#F5F5F5] mb-2">Docs</h1>
            <p className="text-[#6B7280]">{docs.length} documents</p>
          </div>
          {selected && (
            <button onClick={() => setSelected(null)} className="px-3 py-1.5 text-sm text-[#6B7280] hover:text-[#F5F5F5] border border-white/10 rounded-md transition-colors">← Back</button>
          )}
        </div>

        {!selected && (
          <div className="mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="w-full max-w-md px-3 py-2 bg-[#0A0A0F] border border-white/10 rounded-md text-[#F5F5F5] text-sm focus:border-[#9333EA] focus:outline-none"
            />
          </div>
        )}

        {selected ? (
          <Card className="bg-[#141419] border-white/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[#2563EB]/20 flex items-center justify-center text-[#2563EB] text-xs">📄</div>
                <div>
                  <CardTitle className="text-lg text-[#F5F5F5]">{selected.title}</CardTitle>
                  <span className="text-xs text-[#6B7280]">{selected.wordCount} words · {selected.path}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="text-sm text-[#D1D5DB] font-mono whitespace-pre-wrap leading-relaxed">{selected.content}</pre>
            </CardContent>
          </Card>
        ) : loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-[#141419] border border-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#6B7280]">{search ? "No documents match your search." : "No documents yet."}</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDocs.map((doc) => (
              <Card key={doc.path} className="bg-[#141419] border-white/10 hover:border-[#2563EB]/50 transition-all cursor-pointer" onClick={() => setSelected(doc)}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{doc.path.includes("newsletter") ? "📝" : doc.path.includes("video") ? "🎥" : "📚"}</span>
                    <p className="text-sm text-[#F5F5F5] font-medium truncate">{doc.title}</p>
                  </div>
                  <p className="text-xs text-[#6B7280]">{doc.wordCount} words · {(doc.size / 1024).toFixed(1)} KB</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
