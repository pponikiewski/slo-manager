"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";

export function MonthPicker() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Pobieramy miesiąc z URL (np. ?month=2025-12) lub bierzemy obecny
  const currentMonth = searchParams.get("month") || new Date().toISOString().slice(0, 7);

  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-sm font-medium text-muted-foreground">Edytujesz miesiąc:</span>
      <Input
        type="month"
        value={currentMonth}
        onChange={(e) => {
          // Jak zmienisz datę, przeładowujemy stronę z nowym parametrem
          router.push(`/grafiki/extra?month=${e.target.value}`);
        }}
        className="w-auto font-bold"
      />
    </div>
  );
}