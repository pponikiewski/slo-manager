"use client";

import { Member, AttendanceLog } from "@/types";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSunday } from "date-fns";
import { pl } from "date-fns/locale";
import { cn } from "@/lib/utils"; 
import { AttendanceCell } from "./AttendanceCell"; // Importujemy naszą "Inteligentną Kratkę"

// Definicja co ten komponent przyjmuje z góry (z page.tsx)
interface AttendanceGridProps {
  members: Member[];
  logs: AttendanceLog[]; // <--- Tu był brakujący element
}

export function AttendanceGrid({ members, logs = [] }: AttendanceGridProps) {

  // 1. Generujemy dni dla bieżącego miesiąca
  const today = new Date();
  const days = eachDayOfInterval({
    start: startOfMonth(today),
    end: endOfMonth(today),
  });

  // 2. Funkcja pomocnicza: Szukamy czy dany ministrant ma wpis w danym dniu i slocie
  const getStatus = (memberId: string, date: Date, slot: 'am' | 'pm') => {
    const dateStr = format(date, 'yyyy-MM-dd'); // Formatujemy datę tak jak w bazie (tekst)
    
    // Szukamy w tablicy logów
    const log = logs.find(l => 
      l.member_id === memberId && 
      l.date === dateStr && 
      l.slot === slot
    );

    // Zwracamy typ (np. "O", "N") lub null jeśli brak wpisu
    return log ? log.type : null;
  };

  return (
    <div className="relative w-full border rounded-md overflow-hidden">
      {/* Wrapper z overflow-auto pozwala na scrollowanie w poziomie */}
      <div className="overflow-auto max-w-[100vw] max-h-[80vh]">
        <Table className="w-max border-collapse">
          <TableHeader className="sticky top-0 z-20 bg-background shadow-sm">
            <TableRow>
              {/* Sticky Column: Imię i Nazwisko (Nagłówek) */}
              <TableHead className="sticky left-0 z-30 bg-background min-w-[150px] border-r shadow-[1px_0_0_0_rgba(0,0,0,0.1)]">
                Ministrant
              </TableHead>
              
              {/* Generujemy nagłówki dni */}
              {days.map((day) => {
                const isSun = isSunday(day);
                return (
                  <TableHead 
                    key={day.toISOString()} 
                    colSpan={2} 
                    className={cn(
                      "text-center border-r min-w-[80px]",
                      isSun && "bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-200"
                    )}
                  >
                    <div className="text-xs font-normal opacity-70">
                      {format(day, "EEEE", { locale: pl })}
                    </div>
                    <div>{format(day, "d MMM", { locale: pl })}</div>
                  </TableHead>
                );
              })}
            </TableRow>
            <TableRow>
              {/* Pusta komórka pod nagłówkiem nazwisk */}
              <TableHead className="sticky left-0 z-30 bg-background border-r h-8 shadow-[1px_0_0_0_rgba(0,0,0,0.1)]"></TableHead>
              {/* Pod-nagłówki: AM / PM dla każdego dnia */}
              {days.map((day) => (
                <>
                  <TableHead key={`${day}-am`} className="h-8 text-[10px] text-center w-10 border-r p-0 bg-muted/30">Rano</TableHead>
                  <TableHead key={`${day}-pm`} className="h-8 text-[10px] text-center w-10 border-r p-0 bg-muted/30">Wiecz</TableHead>
                </>
              ))}
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id} className="hover:bg-muted/50">
                {/* Sticky Column: Nazwisko (Wiersz) */}
                <TableCell className="sticky left-0 z-10 bg-background border-r font-medium text-sm whitespace-nowrap shadow-[1px_0_0_0_rgba(0,0,0,0.1)]">
                  {member.first_name} {member.last_name}
                </TableCell>

                {/* Komórki siatki */}
                {days.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd'); // Pobieramy datę jako string dla komponentu
                  
                  return (
                  <>
                    {/* Slot RANO */}
                    <TableCell className="border-r p-0 text-center relative h-10 w-10">
                      <AttendanceCell 
                        memberId={member.id}
                        date={dateStr}
                        slot="am"
                        initialStatus={getStatus(member.id, day, 'am')}
                      />
                    </TableCell>
                    
                    {/* Slot WIECZÓR */}
                    <TableCell className="border-r p-0 text-center relative h-10 w-10">
                      <AttendanceCell 
                        memberId={member.id}
                        date={dateStr}
                        slot="pm"
                        initialStatus={getStatus(member.id, day, 'pm')}
                      />
                    </TableCell>
                  </>
                )})}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}