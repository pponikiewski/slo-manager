import { StrictAttendanceCell } from "./StrictAttendanceCell";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { pl } from "date-fns/locale";
// Usunięto import Card, bo już go nie używamy w starym stylu

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

  // 1. Grupujemy sloty po Dniu Tygodnia (1=Pon, 2=Wt, ... 6=Sob)
  const slotsByDay = new Map<number, Slot[]>();
  slots.forEach(slot => {
    if (!slot.roster_assignments || slot.roster_assignments.length === 0) return;
    const current = slotsByDay.get(slot.day_of_week) || [];
    // Sortujemy przypisania alfabetycznie (Nazwisko -> Imię)
    if (slot.roster_assignments) {
      slot.roster_assignments.sort((a, b) => {
        const lastNameComparison = a.member.last_name.localeCompare(b.member.last_name);
        if (lastNameComparison !== 0) return lastNameComparison;
        return a.member.first_name.localeCompare(b.member.first_name);
      });
    }
    current.push(slot);
    slotsByDay.set(slot.day_of_week, current);
  });

  // Sortujemy sloty wewnątrz dnia po czasie (np. 07:00 przed 18:00)
  slotsByDay.forEach((daySlots) => {
    daySlots.sort((a, b) => a.time.localeCompare(b.time));
  });

  // Kolejność dni do wyświetlenia: Pon (1) -> Sob (6)
  const daysOrder = [1, 2, 3, 4, 5, 6];

  return (
    <div className="space-y-8">
      {daysOrder.map((dayIndex) => {
        const daySlots = slotsByDay.get(dayIndex);
        if (!daySlots || daySlots.length === 0) return null;

        // Znajdujemy daty dla tego dnia tygodnia w tym miesiącu
        const relevantDates = allDaysInMonth.filter(day => day.getDay() === dayIndex);
        const dayName = relevantDates.length > 0 ? format(relevantDates[0], 'EEEE', { locale: pl }) : '';

        return (
          <div key={dayIndex} className="space-y-2">
            {/* Opcjonalny duży nagłówek dnia, jeśli chcemy */}
            {/* <h2 className="text-xl font-bold capitalize text-muted-foreground mb-4 border-b pb-2">{dayName}</h2> */}

            {/* Grid: Na desktopie 2 kolumny (Rano / Wieczór), na mobilu 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {daySlots.map(slot => (
                <div key={slot.id} className="break-inside-avoid rounded-lg border bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden">
                  {/* Header Slotu */}
                  <div className="flex items-center justify-between bg-muted/30 px-3 py-2 border-b">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{slot.label || slot.time}</span>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground bg-background/50 px-1 py-0.5 rounded-[2px] border">
                        {dayName}
                      </span>
                    </div>
                  </div>

                  <div className="">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/10">
                          <th className="p-3 text-left min-w-[140px] font-medium text-muted-foreground uppercase text-xs tracking-wide">
                            Ministrant
                          </th>
                          {/* Generujemy nagłówki dat */}
                          {relevantDates.map(date => (
                            <th key={date.toISOString()} className="p-2 text-center w-8 border-l border-border/40">
                              <div className="flex flex-col items-center leading-none">
                                <span className="text-xs text-muted-foreground opacity-70 mb-0.5">
                                  {format(date, 'd')}
                                </span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {slot.roster_assignments.map(({ member }) => (
                          <tr key={member.id} className="group hover:bg-muted/20 transition-colors">
                            <td className="p-2 px-3 font-medium whitespace-nowrap text-foreground/90 group-hover:text-foreground transition-colors">
                              {member.last_name} {member.first_name}
                            </td>
                            {/* Kratki */}
                            {relevantDates.map(date => {
                              const dateStr = format(date, 'yyyy-MM-dd');
                              return (
                                <td key={dateStr} className="p-0 text-center border-l border-border/40">
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
          </div>
        );
      })}
    </div>
  );
}