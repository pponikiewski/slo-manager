"use client";

import { useState } from "react";
import { saveAttendance } from "@/app/actions";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface Props {
  memberId: string;
  date: string;
  slot: "am" | "pm";
  initialStatus: string | null; // Np. 'O', 'N', 'W' lub null
}

export function AttendanceCell({ memberId, date, slot, initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  // Cykl zmian statusu przy kliknięciu
  const handleClick = async () => {
    if (loading) return;
    setLoading(true);

    // Logika cyklu: Puste -> O (Obecny) -> N (Nieobecny) -> W (Dodatkowy) -> Puste
    let newStatus: string | null = null;
    
    if (status === null) newStatus = "O";
    else if (status === "O") newStatus = "N";
    else if (status === "N") newStatus = "W"; // Możemy tu dodać 'R' czy 'S' w przyszłości
    else newStatus = null;

    // Aktualizacja optymistyczna (zmieniamy wygląd zanim serwer odpowie)
    setStatus(newStatus);

    try {
      await saveAttendance(memberId, date, slot, newStatus);
    } catch (error) {
      // Jak coś pójdzie nie tak, cofamy zmianę
      console.error(error);
      setStatus(status);
      alert("Błąd zapisu!");
    } finally {
      setLoading(false);
    }
  };

  // Funkcja pomocnicza do kolorów
  const getColors = (s: string | null) => {
    switch (s) {
      case "O": return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 font-bold";
      case "N": return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 font-bold";
      case "W": return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-bold"; // Extra
      default: return "hover:bg-slate-100 dark:hover:bg-slate-800"; // Pusty
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={cn(
        "w-full h-10 flex items-center justify-center cursor-pointer transition-colors select-none text-sm",
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