"use client";

import { useState } from "react";
import { Member } from "@/types";
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
import { cn } from "@/lib/utils"; // Pomocnik do łączenia klas CSS

interface AttendanceGridProps {
  members: Member[];
}

export function AttendanceGrid({ members }: AttendanceGridProps) {
  // 1. Generujemy dni dla bieżącego miesiąca
  const today = new Date();
  const days = eachDayOfInterval({
    start: startOfMonth(today),
    end: endOfMonth(today),
  });

  return (
    <div className="relative w-full border rounded-md overflow-hidden">
      {/* Wrapper z overflow-auto pozwala na scrollowanie w poziomie */}
      <div className="overflow-auto max-w-[100vw] max-h-[80vh]">
        <Table className="w-max border-collapse">
          <TableHeader className="sticky top-0 z-20 bg-background shadow-sm">
            <TableRow>
              {/* Sticky Column: Imię i Nazwisko */}
              <TableHead className="sticky left-0 z-30 bg-background min-w-[150px] border-r">
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
              <TableHead className="sticky left-0 z-30 bg-background border-r h-8"></TableHead>
              {/* Pod-nagłówki: AM / PM dla każdego dnia */}
              {days.map((day) => (
                <>
                  <TableHead key={`${day}-am`} className="h-8 text-[10px] text-center w-10 border-r p-0">Rano</TableHead>
                  <TableHead key={`${day}-pm`} className="h-8 text-[10px] text-center w-10 border-r p-0">Wiecz</TableHead>
                </>
              ))}
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id} className="hover:bg-muted/50">
                {/* Sticky Column: Nazwisko */}
                <TableCell className="sticky left-0 z-10 bg-background border-r font-medium text-sm whitespace-nowrap">
                  {member.first_name} {member.last_name}
                </TableCell>

                {/* Komórki siatki */}
                {days.map((day) => (
                  <>
                    {/* Slot RANO */}
                    <TableCell className="border-r p-0 text-center relative h-10 w-10 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                      {/* Tu będzie logika klikania */}
                    </TableCell>
                    
                    {/* Slot WIECZÓR */}
                    <TableCell className="border-r p-0 text-center relative h-10 w-10 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                      {/* Tu będzie logika klikania */}
                    </TableCell>
                  </>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}