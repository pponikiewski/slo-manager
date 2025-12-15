import { supabase } from "@/lib/supabase";
import { EditRoster } from "@/components/EditRoster";

export const revalidate = 0;

export default async function EdycjaGrafikuPage() {
    // 1. Pobieramy Sloty wraz z Przypisanymi Osobami (i ID przypisania do usuwania)
    const { data: slots, error } = await supabase
        .from("weekly_slots")
        .select(`
      *,
      roster_assignments (
        id,
        member:members (id, first_name, last_name)
      )
    `)
        .order("day_of_week")
        .order("time");

    if (error) {
        console.error(error);
        return <div>Błąd pobierania grafiku</div>;
    }

    // 2. Pobieramy listę wszystkich ministrantów do dropdowna
    const { data: members } = await supabase
        .from("members")
        .select("id, first_name, last_name")
        .order("last_name");

    return (
        <div className="container mx-auto py-8 max-w-7xl px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Edytor Grafiku Tygodniowego
                </h1>
                <p className="text-muted-foreground mt-2">
                    Dodawaj i usuwaj osoby z poszczególnych dyżurów. Zmiany są widoczne natychmiast.
                </p>
            </div>

            <EditRoster slots={slots as any} allMembers={members || []} />
        </div>
    );
}
