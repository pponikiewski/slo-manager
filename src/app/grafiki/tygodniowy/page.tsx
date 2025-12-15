import { supabase } from "@/lib/supabase";
import { WeeklyRoster } from "@/components/WeeklyRoster";

export const revalidate = 0;

export default async function TygodniowyPage() {
  // 1. Pobieramy Sloty wraz z Przypisanymi Osobami
  // To jest potężne zapytanie Supabase: "Daj mi sloty, a w nich przypisania, a w przypisaniach dane członka"
  const { data: slots, error } = await supabase
    .from("weekly_slots")
    .select(`
      *,
      roster_assignments (
        member:members (id, first_name, last_name)
      )
    `)
    .order("day_of_week")
    .order("time");

  if (error) {
    console.error(error);
    return <div>Błąd pobierania grafiku</div>;
  }

  // 2. Pobieramy logi obecności z tego miesiąca
  const { data: logs } = await supabase
    .from("attendance_logs")
    .select("*")
    .neq("time_slot", "extra"); // <--- TO MUSI TU BYĆ

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <h1 className="text-3xl font-extrabold mb-6 tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
        Grafik Tygodniowy (Stały)
      </h1>
      {/* Przekazujemy dane do komponentu wyświetlającego */}
      <WeeklyRoster slots={slots as any} logs={logs || []} />
    </div>
  );
}