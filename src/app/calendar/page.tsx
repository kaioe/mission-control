"use client";

import { DashboardLayout } from "@/app/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const today = new Date();
const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

export default function CalendarPage() {
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => null);

  const monthName = today.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#F5F5F5] mb-2">Calendar</h1>
          <p className="text-[#6B7280]">Schedule events and track your BJJ journey</p>
        </div>
        <Card className="bg-[#141419] border-white/10">
          <CardHeader>
            <CardTitle className="text-lg text-[#F5F5F5]">{monthName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-xs text-[#6B7280] font-medium py-2">{d}</div>
              ))}
              {emptyDays.map((_, i) => <div key={`e-${i}`} />)}
              {days.map((d) => (
                <div
                  key={d}
                  className={`py-2 text-sm rounded-md cursor-pointer transition-colors hover:bg-[#9333EA]/20 ${
                    d === today.getDate() ? "bg-[#9333EA]/30 text-[#9333EA] font-bold" : "text-[#D1D5DB]"
                  }`}
                >
                  {d}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
