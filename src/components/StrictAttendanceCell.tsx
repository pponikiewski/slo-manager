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
      // Styl dla OBECNY (O) - Subtelny zielony, profesjonalny
      case "O": return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800/50 font-medium text-sm";

      // Styl dla NIEOBECNY (N) - Subtelny czerwony/szary, profesjonalny
      case "N": return "bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800/50 font-medium text-sm";

      // Puste pole
      default: return "hover:bg-accent/50 opacity-50 hover:opacity-100";
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "w-full h-9 flex items-center justify-center cursor-pointer select-none transition-all m-[1px] border rounded-md",
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