"use client";

import { StrictAttendanceCell } from "./StrictAttendanceCell";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSunday } from "date-fns";
import { pl } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
        <Card key={guildName} className="break-inside-avoid shadow-md">
          <CardHeader className="pb-3 bg-muted/20 border-b">
            <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-primary tracking-tight">
                    {guildName}
                </CardTitle>
                <Badge variant="outline">{groupedMembers[guildName].length} osób</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/5">
                  <th className="p-3 text-left min-w-[180px] font-medium text-muted-foreground border-r">
                    Nazwisko i Imię
                  </th>
                  {/* Nagłówki Niedziel */}
                  {sundays.map(date => (
                    <th key={date.toISOString()} className="p-2 text-center w-14 border-r last:border-0">
                       <div className="flex flex-col items-center">
                          <span className="text-[10px] uppercase text-red-500 font-bold">Nd</span>
                          <span className="text-lg font-bold text-foreground">
                            {format(date, 'd')}
                          </span>
                       </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groupedMembers[guildName].map((member) => (
                  <tr key={member.id} className="border-b last:border-0 hover:bg-muted/10 transition-colors">
                    <td className="p-3 font-medium border-r whitespace-nowrap">
                      {member.last_name} {member.first_name}
                      <span className="ml-2 text-xs text-muted-foreground font-normal">
                        ({member.rank})
                      </span>
                    </td>
                    {/* Kratki */}
                    {sundays.map(date => {
                       const dateStr = format(date, 'yyyy-MM-dd');
                       return (
                         <td key={dateStr} className="p-0 text-center border-r last:border-0">
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}