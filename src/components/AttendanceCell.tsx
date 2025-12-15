"use client";

import { useState } from "react";
import { saveAttendance } from "@/app/actions";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface Props {
  memberId: string;
  date: string;
  slot: "am" | "pm";
  initialStatus: string | null;
}

export function AttendanceCell({ memberId, date, slot, initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);

    // --- LOGIKA CYKLU ---
    let newStatus: string | null = null;
    
    // 1. Sekcja Obowiązkowa (O/N)
    if (status === null) newStatus = "O";      // 1 klik: Obecny
    else if (status === "O") newStatus = "N";  // 2 klik: Nieobecny (kara/brak punktów)
    
    // 2. Sekcja Extra / Nadobowiązkowa (Kody literowe)
    else if (status === "N") newStatus = "W";  // 3 klik: Wieczór (Extra)
    else if (status === "W") newStatus = "R";  // 4 klik: Rano (Extra)
    else if (status === "R") newStatus = "S";  // 5 klik: Specjalne/Inne
    
    // 3. Reset
    else newStatus = null;                     // 6 klik: Puste (Wyczyść)

    // Aktualizacja optymistyczna (dla oka)
    setStatus(newStatus);

    try {
      await saveAttendance(memberId, date, slot, newStatus);
    } catch (error) {
      console.error(error);
      setStatus(status); // Cofnij w razie błędu
    } finally {
      setLoading(false);
    }
  };

  // Kolory dla poszczególnych kodów
  const getColors = (s: string | null) => {
    switch (s) {
      // Grafiki Obowiązkowe
      case "O": return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 font-bold border-green-200";
      case "N": return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 font-bold border-red-200";
      
      // Grafiki Extra (Wyróżniające się kolory)
      case "W": return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 font-bold border-blue-200";
      case "R": return "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 font-bold border-orange-200";
      case "S": return "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400 font-bold border-purple-200";
      
      default: return "hover:bg-accent/50 cursor-pointer"; // Puste
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={cn(
        "w-full h-10 flex items-center justify-center cursor-pointer select-none text-xs sm:text-sm transition-all duration-200",
        getColors(status)
      )}
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin opacity-50" />
      ) : (
        status
      )}
    </div>
  );
}