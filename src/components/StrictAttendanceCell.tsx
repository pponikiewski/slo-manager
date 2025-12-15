"use client";

import { useState } from "react";
import { saveAttendance } from "@/app/actions";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react"; // Usunąłem importy Check i X

interface Props {
  memberId: string;
  date: string;
  initialStatus: string | null;
}

export function StrictAttendanceCell({ memberId, date, initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);

    // --- LOGIKA ---
    // Puste -> O -> N -> Puste
    let newStatus: string | null = null;

    if (status === null) newStatus = "O";
    else if (status === "O") newStatus = "N";
    else newStatus = null; // Reset

    setStatus(newStatus);

    try {
      await saveAttendance(memberId, date, "standard", newStatus);
    } catch (error) {
      console.error(error);
      setStatus(status); // Cofnij w razie błędu
    } finally {
      setLoading(false);
    }
  };

  const getStyles = (s: string | null) => {
    switch (s) {
      // Styl dla OBECNY (O) - Zielony + Pogrubienie
      case "O": return "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800 font-extrabold text-base";
      
      // Styl dla NIEOBECNY (N) - Czerwony + Pogrubienie
      case "N": return "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800 font-extrabold text-base";
      
      // Puste pole
      default: return "hover:bg-accent/50";
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={cn(
        "w-full h-10 flex items-center justify-center cursor-pointer select-none transition-all m-0.5 border rounded-sm",
        getStyles(status)
      )}
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin opacity-50" />
      ) : (
        // Wyświetlamy po prostu literkę (status), czyli "O" lub "N"
        status
      )}
    </div>
  );
}