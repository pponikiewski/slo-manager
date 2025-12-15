"use client";

import { StrictAttendanceCell } from "./StrictAttendanceCell";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSunday } from "date-fns";
import { pl } from "date-fns/locale";

type Member = { id: string; last_name: string; first_name: string; guild: string | null; rank: string };
type Log = { member_id: string; date: string; type: string };

interface Props {
  members: Member[];
  logs: Log[];
}

export function SundayRoster({ members, logs }: Props) {
  const today = new Date();

  // 1. Generujemy TYLKO NIEDZIELE w tym miesiącu
  const sundays = eachDayOfInterval({
    start: startOfMonth(today),
    end: endOfMonth(today),
  }).filter(day => isSunday(day));

  // 2. Grupujemy ministrantów po Gildiach
  // Wynik to obiekt: { "Gildia I": [...], "Gildia II": [...] }
  const groupedMembers = members.reduce((acc, member) => {
    const guildName = member.guild || "Bez Gildii"; // Jak ktoś nie ma gildii, trafia do worka "Bez Gildii"
    if (!acc[guildName]) acc[guildName] = [];
    acc[guildName].push(member);
    // Sortujemy alfabetycznie wewnątrz grupy
    acc[guildName].sort((a, b) => {
      // W SundayRoster typ Member to { id, last_name, first_name ... } a nie { member: ... } jak w Weekly.
      return a.last_name.localeCompare(b.last_name) || a.first_name.localeCompare(b.first_name);
    });
    return acc;
  }, {} as Record<string, Member[]>);

  // Sortujemy nazwy gildii, żeby "Gildia I" była przed "Gildia II"
  const sortedGuildNames = Object.keys(groupedMembers).sort();

  // Helper do szukania statusu
  const getStatus = (memberId: string, dateStr: string) => {
    const log = logs.find(l => l.member_id === memberId && l.date === dateStr);
    return log ? log.type : null;
  };

  return (
    <div className="space-y-8">
      {sortedGuildNames.map((guildName) => (
        <div key={guildName} className="break-inside-avoid shadow-sm rounded-lg border bg-card/60 backdrop-blur-sm overflow-hidden mb-4">
          <div className="flex items-center justify-between bg-muted/30 px-3 py-2 border-b">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent transform uppercase tracking-tight">
                {guildName}
              </h3>
              <span className="text-[10px] text-muted-foreground bg-background/50 px-1 py-0.5 rounded-[2px] border font-semibold">
                {groupedMembers[guildName].length} osób
              </span>
            </div>
          </div>

          <div className="">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-muted/10 border-b border-border/50">
                  <th className="p-2 px-3 text-left min-w-[140px] font-medium text-muted-foreground uppercase text-xs tracking-wide border-r border-border/30">
                    Nazwisko i Imię
                  </th>
                  {/* Nagłówki Niedziel */}
                  {sundays.map(date => (
                    <th key={date.toISOString()} className="p-2 text-center w-10 border-r border-border/30 last:border-0 hover:bg-muted/20 transition-colors">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] uppercase text-red-500/80 font-bold leading-none mb-0.5">Nd</span>
                        <span className="text-xs font-bold text-foreground leading-none">
                          {format(date, 'd')}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {groupedMembers[guildName].map((member) => (
                  <tr key={member.id} className="group hover:bg-muted/20 transition-colors">
                    <td className="p-2 px-3 font-medium border-r border-border/30 whitespace-nowrap text-foreground/90 group-hover:text-foreground">
                      {member.last_name} {member.first_name}
                      <span className="ml-1 text-[9px] text-muted-foreground/70 font-normal">
                        ({member.rank})
                      </span>
                    </td>
                    {/* Kratki */}
                    {sundays.map(date => {
                      const dateStr = format(date, 'yyyy-MM-dd');
                      return (
                        <td key={dateStr} className="p-0 text-center border-r border-border/30 last:border-0 bg-background/20">
                          <StrictAttendanceCell
                            memberId={member.id}
                            date={dateStr}
                            initialStatus={getStatus(member.id, dateStr)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}