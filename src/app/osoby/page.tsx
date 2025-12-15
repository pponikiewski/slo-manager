import { supabase } from "@/lib/supabase";
import { MembersManager } from "@/components/MembersManager";

export const revalidate = 0;

export default async function OsobyPage() {
    const { data: members, error } = await supabase
        .from("members")
        .select("*")
        .order("last_name");

    if (error) {
        console.error(error);
        return <div>Błąd pobierania listy osób</div>;
    }

    return (
        <div className="container mx-auto py-8 max-w-5xl px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Baza Osób
                </h1>
                <p className="text-muted-foreground mt-2">
                    Zarządzaj listą ministrantów, lektorów i kandydatów.
                </p>
            </div>

            <MembersManager members={members || []} />
        </div>
    );
}
