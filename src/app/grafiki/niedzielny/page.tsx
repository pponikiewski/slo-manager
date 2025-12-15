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
    .select("*");

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 tracking-tight">Grafik Niedzielny</h1>
      <SundayRoster members={members || []} logs={logs || []} />
    </div>
  );
}