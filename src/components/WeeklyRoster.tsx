"use client";

import { StrictAttendanceCell } from "./StrictAttendanceCell";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { pl } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Typy danych, które przyjdą z bazy
type Member = { id: string; last_name: string; first_name: string };
type Assignment = { member: Member };
type Slot = {
  id: string;
  day_of_week: number;
  time: string;
  label: string;
  roster_assignments: Assignment[]; // Lista przypisanych osób
};
type Log = { member_id: string; date: string; type: string };

interface Props {
  slots: Slot[];
  logs: Log[];
}

export function WeeklyRoster({ slots, logs }: Props) {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  
  // Generujemy wszystkie dni miesiąca
  const allDaysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Funkcja pomocnicza: Znajdź status w logach
  const getStatus = (memberId: string, dateStr: string) => {
    const log = logs.find(l => l.member_id === memberId && l.date === dateStr);
    return log ? log.type : null;
  };

  return (
    <div className="space-y-8">
      {/* Iterujemy po każdym slocie (Poniedziałek 18:00, Wtorek 7:00...) */}
      {slots.map((slot) => {
        // Jeśli slot jest pusty (nikt nie przypisany), nie wyświetlamy go
        if (!slot.roster_assignments || slot.roster_assignments.length === 0) return null;

        // Filtrujemy dni miesiąca, żeby znaleźć np. tylko Poniedziałki (dla slotu Poniedziałkowego)
        // day_of_week w JS: 0=Niedz, 1=Pon. W bazie: 1=Pon, 0=Niedz. Zgadza się.
        const relevantDates = allDaysInMonth.filter(day => day.getDay() === slot.day_of_week);

        return (
          <Card key={slot.id} className="break-inside-avoid">
            <CardHeader className="pb-2 bg-muted/20">
              <CardTitle className="text-lg flex justify-between">
                <span>{slot.label || `${slot.time}`}</span>
                <span className="text-sm font-normal text-muted-foreground uppercase">
                    {format(relevantDates[0], 'EEEE', { locale: pl })}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left min-w-[150px] font-medium text-muted-foreground">Ministrant</th>
                    {/* Generujemy nagłówki dat (np. 4, 11, 18) */}
                    {relevantDates.map(date => (
                      <th key={date.toISOString()} className="p-2 text-center w-12 font-medium">
                        <div className="text-xs text-muted-foreground mb-1">
                            {format(date, 'MMM', { locale: pl })}
                        </div>
                        <div className="text-lg leading-none">
                            {format(date, 'd')}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slot.roster_assignments.map(({ member }) => (
                    <tr key={member.id} className="border-b last:border-0 hover:bg-muted/10">
                      <td className="p-3 font-medium whitespace-nowrap">
                        {member.last_name} {member.first_name}
                      </td>
                      {/* Kratki dla każdej daty */}
                      {relevantDates.map(date => {
                         const dateStr = format(date, 'yyyy-MM-dd');
                         return (
                           <td key={dateStr} className="p-0 text-center border-l">
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
        );
      })}
    </div>
  );
}