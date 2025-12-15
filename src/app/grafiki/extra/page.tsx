import { supabase } from "@/lib/supabase";
import { ExtraRow } from "@/components/ExtraRow";
import { MonthPicker } from "@/components/MonthPicker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { startOfMonth, endOfMonth, format, parseISO } from "date-fns";

export const revalidate = 0;

// Definicja typów dla Next.js 15
interface Props {
  searchParams: Promise<{ month?: string }>;
}

export default async function ExtraPage(props: Props) {
  // 1. Czekamy na parametry (To jest ta naprawa błędu)
  const searchParams = await props.searchParams;

  // Teraz już bezpiecznie pobieramy miesiąc
  const selectedMonth = searchParams.month || new Date().toISOString().slice(0, 7);

  // 2. Pobieramy ministrantów
  const { data: members } = await supabase
    .from("members")
    .select("*")
    .order("last_name");

  // Calculate start and end of month
  const baseDate = parseISO(`${selectedMonth}-01`);
  const startDate = format(startOfMonth(baseDate), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(baseDate), 'yyyy-MM-dd');

  // 3. Pobieramy logi TYLKO z wybranego miesiąca
  const { data: logs } = await supabase
    .from("attendance_logs")
    .select("id, member_id, type, date, created_at")
    .eq("time_slot", "extra")
    .gte("date", startDate)
    .lte("date", endDate);

  return (
    <div className="container mx-auto py-6 px-2">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              Służba Nadobowiązkowa
            </h1>
            <p className="text-muted-foreground mt-1">Zarządzaj punktami dodatkowymi</p>
          </div>
          <MonthPicker />
        </div>

        <div className="rounded-xl border bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
          <div className="flex border-b bg-muted/30 py-3 px-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            <div className="w-48 px-2 flex items-center gap-2">
              <span>Ministrant</span>
            </div>
            <div className="px-2">Przebieg służby ({format(baseDate, 'yyyy-MM')})</div>
          </div>

          <div className="divide-y divide-border/50 p-2">
            {members?.map((member) => {
              const memberLogs = logs?.filter(l => l.member_id === member.id) || [];
              return (
                <ExtraRow
                  key={member.id}
                  memberId={member.id}
                  name={`${member.last_name} ${member.first_name}`}
                  logs={memberLogs}
                  selectedMonth={selectedMonth}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}