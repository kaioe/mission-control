"use client";

import { DashboardLayout } from "@/app/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VisualPage() {
  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#F5F5F5] mb-2">Visual</h1>
          <p className="text-[#6B7280]">Brand assets, graphics, and pixel art</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-[#141419] border-white/10 hover:border-[#9333EA]/50 transition-all overflow-hidden group cursor-pointer">
            <div className="w-full h-48 bg-[#0A0A0F] flex items-center justify-center p-4">
              <img
                src="/bjj-pixel-art.svg"
                alt="BJJ Belt Lineup"
                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
              />
            </div>
            <CardContent className="p-4">
              <p className="text-sm text-[#F5F5F5] font-medium">BJJ Belt Lineup</p>
              <p className="text-xs text-[#6B7280] mt-1">Pixel art · 5 belt colors</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
