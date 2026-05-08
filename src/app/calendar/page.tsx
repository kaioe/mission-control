"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/app/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  type: string;
  status?: string;
  project?: string;
  actionType?: string;
}

export default function CalendarPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [events, setEvents] = useState<Record<string, CalendarEvent[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const res = await fetch(`/api/calendar?year=${currentYear}&month=${currentMonth + 1}`);
        if (res.ok) {
          const data = await res.json();
          setEvents(data.events || {});
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [currentYear, currentMonth]);

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
  }

  function goToday() {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(null);
  }

  const monthName = new Date(currentYear, currentMonth).toLocaleString("default", { month: "long", year: "numeric" });

  function pad(n: number): string { return n < 10 ? "0" + n : String(n); }

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => null);

  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  const selectedEvents = selectedDate ? events[selectedDate] || [] : [];

  function eventColor(type: string, status?: string): string {
    if (type === "task") {
      if (status === "done") return "bg-[#9333EA]";
      if (status === "in-progress") return "bg-[#2563EB]";
      return "bg-[#92400E]";
    }
    return "bg-[#6B7280]";
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#F5F5F5] mb-2">Calendar</h1>
          <p className="text-[#6B7280]">Tasks and events timeline</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card className="bg-[#141419] border-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-3">
                <button onClick={prevMonth} className="text-[#6B7280] hover:text-[#F5F5F5] text-lg transition-colors">←</button>
                <CardTitle className="text-lg text-[#F5F5F5]">{monthName}</CardTitle>
                <button onClick={nextMonth} className="text-[#6B7280] hover:text-[#F5F5F5] text-lg transition-colors">→</button>
              </div>
              <button onClick={goToday} className="text-xs text-[#9333EA] hover:underline">Today</button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 bg-[#0A0A0F] rounded-lg animate-pulse" />
              ) : (
                <div className="grid grid-cols-7 gap-1">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div key={d} className="text-xs text-[#6B7280] font-medium py-2 text-center">{d}</div>
                  ))}
                  {emptyDays.map((_, i) => <div key={`e-${i}`} />)}
                  {days.map((d) => {
                    const dateStr = `${currentYear}-${pad(currentMonth + 1)}-${pad(d)}`;
                    const dayEvents = events[dateStr] || [];
                    const isToday = dateStr === todayStr;
                    const isSelected = dateStr === selectedDate;

                    return (
                      <div key={d} className="min-h-[60px] p-1">
                        <button
                          onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                          className={`
                            w-full text-sm rounded-md p-1.5 transition-all text-left
                            ${isSelected ? "bg-[#9333EA]/30 text-[#9333EA] ring-1 ring-[#9333EA]/50" : ""}
                            ${isToday && !isSelected ? "bg-[#9333EA]/20 text-[#9333EA] font-bold" : ""}
                            ${!isSelected && !isToday ? "text-[#D1D5DB] hover:bg-white/5" : ""}
                          `}
                        >
                          <span className="text-xs font-medium">{d}</span>
                          {dayEvents.length > 0 && (
                            <div className="flex flex-wrap gap-0.5 mt-1">
                              {dayEvents.slice(0, 3).map((ev) => (
                                <div key={ev.id} className={`w-1.5 h-1.5 rounded-full ${eventColor(ev.type, ev.status)}`} />
                              ))}
                              {dayEvents.length > 3 && (
                                <span className="text-[8px] text-[#6B7280]">+{dayEvents.length - 3}</span>
                              )}
                            </div>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Side panel: selected day events */}
          <Card className="bg-[#141419] border-white/10">
            <CardHeader>
              <CardTitle className="text-sm text-[#F5F5F5]">
                {selectedDate ? new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : "Select a day"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedDate ? (
                <p className="text-xs text-[#6B7280]">Click a date to see its events.</p>
              ) : selectedEvents.length === 0 ? (
                <p className="text-xs text-[#6B7280]">No events on this day.</p>
              ) : (
                <div className="space-y-2">
                  {selectedEvents.map((ev) => (
                    <div key={ev.id} className="p-3 bg-[#0A0A0F] rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${eventColor(ev.type, ev.status)}`} />
                        <span className="text-[10px] text-[#6B7280] uppercase">{ev.type}</span>
                        {ev.status && <span className="text-[10px] text-[#6B7280]">{ev.status}</span>}
                      </div>
                      <p className="text-xs text-[#D1D5DB] leading-relaxed">{ev.title}</p>
                      {ev.project && <p className="text-[10px] text-[#6B7280] mt-1">📁 {ev.project}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
