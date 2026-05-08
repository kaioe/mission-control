"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { name: "Activity", href: "/activity", icon: "📋", available: true },
  { name: "Dashboard", href: "/dashboard", icon: "○", available: true },
  { name: "Tasks", href: "/tasks", icon: "□", available: true },
  { name: "Content", href: "/content", icon: "✍", available: true },
  { name: "Calendar", href: "/calendar", icon: "○", available: true },
  { name: "Projects", href: "/projects", icon: "◇", available: true },
  { name: "Memory", href: "/memory", icon: "◇", available: true },
  { name: "Docs", href: "/docs", icon: "◇", available: true },
  { name: "Team", href: "/team", icon: "◇", available: true },
  { name: "Visual", href: "/visual", icon: "◇", available: true },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-[240px] flex-col bg-[#0F0F14] border-r border-white/10">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded bg-[#141419] flex items-center justify-center overflow-hidden border border-[#9333EA]/30">
            <img src="/bjj-pixel-art.svg" alt="BJJ" className="w-7 h-7 object-contain" />
          </div>
          <span className="text-sm font-bold tracking-wider text-[#F5F5F5]">MISSION CONTROL</span>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs text-[#6B7280] font-medium">OSS ONLINE</span>
        </div>
      </div>

      <Separator className="bg-white/10" />

      <ScrollArea className="flex-1 px-4 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isAvailable = item.available;

            return (
              <Link
                key={item.name}
                href={isAvailable ? item.href : "#"}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all
                  ${isActive 
                    ? "bg-[#9333EA]/20 text-[#9333EA] border border-[#9333EA]/50" 
                    : isAvailable
                      ? "text-[#F5F5F5]/70 hover:bg-white/5 hover:text-[#F5F5F5]"
                      : "text-[#F5F5F5]/30 cursor-not-allowed"
                  }
                `}
                onClick={(e) => {
                  if (!isAvailable) {
                    e.preventDefault();
                  }
                }}
              >
                <span className="text-lg w-5 text-center">{item.icon}</span>
                <span>{item.name}</span>
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#9333EA]"></span>}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-xs font-bold">
            K
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-[#F5F5F5]">Kaio Andrade</span>
            <span className="text-[10px] text-[#6B7280]">Founder & CEO</span>
          </div>
        </div>
      </div>
    </div>
  );
}