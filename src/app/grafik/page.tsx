import { supabase } from "@/lib/supabase";
import { AttendanceGrid } from "@/components/AttendanceGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const revalidate = 0;

export default async function GrafikPage() {
  // Pobieramy wszystkich ministrantów posortowanych alfabetycznie
  const { data: members } = await supabase
    .from("members")
    .select("*")
    .order("last_name");

  return (
    <div className="container mx-auto py-6 px-2">
      <Card>
        <CardHeader>
          <CardTitle>Miesięczny Grafik Obecności</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {/* Przekazujemy dane do naszego komponentu Client Side */}
          <AttendanceGrid members={members || []} />
        </CardContent>
      </Card>
    </div>
  );
}