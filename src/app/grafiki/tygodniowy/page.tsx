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
    .select("*");

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Grafik Tygodniowy (Stały)</h1>
      {/* Przekazujemy dane do komponentu wyświetlającego */}
      <WeeklyRoster slots={slots as any} logs={logs || []} />
    </div>
  );
}