"use client";

import { deleteExtraScore, addExtraScore } from "@/app/actions";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation"; // <--- NOWY IMPORT

type Log = { id: string; type: string; date: string; created_at: string };

interface Props {
  memberId: string;
  name: string;
  logs: Log[];
  selectedMonth: string;
}

export function ExtraRow({ memberId, name, logs, selectedMonth }: Props) {
  const router = useRouter(); // <--- INICJALIZACJA ROUTERA

  const sortedLogs = [...logs].sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : new Date(a.date).getTime();
    const timeB = b.created_at ? new Date(b.created_at).getTime() : new Date(b.date).getTime();
    return timeA - timeB;
  });
  const totalSlots = Math.max(15, sortedLogs.length + 5);
  const emptySlotsCount = Math.max(0, totalSlots - sortedLogs.length - 1);

  async function handleAdd(type: string) {
    // Czekamy aż serwer zapisze
    await addExtraScore(memberId, type, selectedMonth);
    // Wymuszamy odświeżenie widoku w przeglądarce
    router.refresh();
  }

  return (
    <div className="flex items-center   py-2 px-2 transition-colors hover:bg-muted/30 group rounded-md mb-1">
      <div className="w-48 shrink-0 font-medium px-2 text-sm truncate text-foreground/80 group-hover:text-foreground transition-colors">
        {name}
      </div>

      <div className="flex flex-1 overflow-x-auto px-2 py-1 gap-1 items-center scrollbar-hide">

        {sortedLogs.map((log) => (
          <Popover key={log.id}>
            <PopoverTrigger asChild>
              <div
                className={cn(
                  "w-9 h-9 shrink-0 flex items-center justify-center rounded-lg text-xs font-bold cursor-pointer transition-all relative shadow-sm border group-hover/chip:scale-105 active:scale-95",
                  // Gradients and Styles
                  // Professional Solid Colors
                  log.type === "W" && "bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-800",
                  log.type === "R" && "bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-800",
                  log.type === "S" && "bg-slate-100 text-slate-900 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                )}
                title="Kliknij, aby usunąć"
              >
                {log.type}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Usunąć punkt?</span>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-7 text-xs"
                  onClick={async () => {
                    await deleteExtraScore(log.id);
                    router.refresh();
                  }}
                >
                  Tak, usuń
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        ))}

        <Popover>
          <PopoverTrigger asChild>
            <button className="w-9 h-9 shrink-0 flex items-center justify-center border-2 border-dashed border-muted-foreground/30 rounded-lg text-muted-foreground/50 cursor-pointer hover:bg-primary/5 hover:text-primary hover:border-primary/50 transition-colors active:scale-95">
              <span className="text-xl leading-none mb-[2px]">+</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <div className="flex gap-2">
              <ServiceButton type="W" label="Wieczór (2pkt)" color="bg-blue-50 text-blue-900 hover:bg-blue-100 border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800" onClick={() => handleAdd("W")} />
              <ServiceButton type="R" label="Rano (2pkt)" color="bg-amber-50 text-amber-900 hover:bg-amber-100 border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800" onClick={() => handleAdd("R")} />
              <ServiceButton type="S" label="Specjalne (3pkt)" color="bg-slate-50 text-slate-900 hover:bg-slate-100 border-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700" onClick={() => handleAdd("S")} />
            </div>
            <div className="text-[10px] text-center text-muted-foreground mt-3 border-t pt-2">
              Dodajesz do: <span className="font-bold text-foreground">{selectedMonth}</span>
            </div>
          </PopoverContent>
        </Popover>

        {Array.from({ length: emptySlotsCount }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="w-8 h-8 shrink-0 border border-muted/30 rounded-sm bg-muted/5"
          />
        ))}

      </div>
    </div>
  );
}

function ServiceButton({ type, label, color, onClick }: any) {
  return (
    <button onClick={onClick} className={cn("flex flex-col items-center justify-center w-14 h-14 rounded-md border transition-transform active:scale-95", color)}>
      <span className="text-xl font-black">{type}</span>
      <span className="text-[9px] uppercase font-medium opacity-80">{label}</span>
    </button>
  )
}