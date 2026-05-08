"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Simple password check - server will validate
    const res = await fetch(`/api/auth?password=${encodeURIComponent(password)}`);
    if (res.ok) {
      // Server sets cookie, reload to trigger middleware
      window.location.href = "/dashboard";
    } else {
      setError("Invalid password");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6">
            <img src="/bjj-pixel-art.svg" alt="BJJ" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-[#F5F5F5] mb-2">Mission Control</h1>
          <p className="text-[#6B7280] text-sm">BJJ Lotus Club Operations</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#141419] border border-white/10 rounded-lg p-6">
          <div className="mb-4">
            <label className="block text-xs text-[#6B7280] mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-[#0A0A0F] border border-white/10 rounded-md text-[#F5F5F5] text-sm focus:border-[#9333EA] focus:outline-none"
              placeholder="Enter password"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-xs text-[#DC2626] mb-4">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full px-4 py-2 text-sm font-medium bg-[#9333EA] text-white rounded-md hover:bg-[#7D3C98] transition-colors disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Enter"}
          </button>
        </form>

        <p className="text-center text-xs text-[#4B5563] mt-6">
          Managed by Oss 👻 — Chief of Staff
        </p>
      </div>
    </div>
  );
}
