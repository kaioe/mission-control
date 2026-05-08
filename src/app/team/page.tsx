"use client";

import { DashboardLayout } from "@/app/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const teamMembers = [
  { name: "Oss", role: "Chief of Staff", belt: "Purple", status: "online", emoji: "👻" },
  { name: "Kaio Andrade", role: "Founder & CEO", belt: "White", status: "online", emoji: "👤" },
];

export default function TeamPage() {
  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#F5F5F5] mb-2">Team</h1>
          <p className="text-[#6B7280]">AI agents and crew members</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <Card key={member.name} className="bg-[#141419] border-white/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                    member.belt === "Purple" ? "bg-[#7D3C98]/20" : "bg-[#2563EB]/20"
                  }`}>
                    {member.emoji}
                  </div>
                  <div>
                    <CardTitle className="text-base text-[#F5F5F5]">{member.name}</CardTitle>
                    <span className="text-xs text-[#6B7280]">{member.role}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${member.status === "online" ? "bg-green-500" : "bg-gray-500"}`} />
                  <span className="text-xs text-[#6B7280]">{member.status.toUpperCase()}</span>
                  <Badge variant="outline" className="border-[#7D3C98] text-[#7D3C98] text-[10px] ml-2">{member.belt} BELT</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
          <Card className="bg-[#141419] border-dashed border-white/10 hover:border-[#9333EA]/50 transition-all cursor-pointer">
            <CardContent className="p-8 text-center">
              <p className="text-2xl mb-2">+</p>
              <p className="text-sm text-[#6B7280]">Add new agent</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
