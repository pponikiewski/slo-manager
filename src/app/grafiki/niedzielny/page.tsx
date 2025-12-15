import { supabase } from "@/lib/supabase";
import { SundayRoster } from "@/components/SundayRoster";

export const revalidate = 0;

export default async function NiedzielnyPage() {
  // 1. Pobieramy wszystkich ministrantów, którzy mają jakąś gildię
  // (Możemy usunąć .not('guild', 'is', null) jeśli chcemy widzieć też tych bez gildii)
  const { data: members, error } = await supabase
    .from("members")
    .select("*")
    .order("guild") // Najpierw grupuj po gildii
    .order("last_name"); // Potem alfabetycznie

  if (error) {
    return <div>Błąd pobierania danych: {error.message}</div>;
  }

  // 2. Pobieramy logi obecności
  const { data: logs } = await supabase
    .from("attendance_logs")
    .select("*")
    .neq("time_slot", "extra"); // <--- TO MUSI TU BYĆ

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <h1 className="text-3xl font-extrabold mb-6 tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
        Grafik Niedzielny
      </h1>
      <SundayRoster members={members || []} logs={logs || []} />
    </div>
  );
}