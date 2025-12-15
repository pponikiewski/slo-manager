import { supabase } from "@/lib/supabase";
import { AttendanceGrid } from "@/components/AttendanceGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AttendanceLog } from "@/types"; // <--- Ważny import

export const revalidate = 0;

export default async function GrafikPage() {
  // 1. Pobierz ministrantów
  const { data: members } = await supabase
    .from("members")
    .select("*")
    .order("last_name");

  // 2. Pobierz historię obecności
  const { data: logs } = await supabase
    .from("attendance_logs")
    .select("*");

  return (
    <div className="container mx-auto py-6 px-2">
      <Card>
        <CardHeader>
          <CardTitle>Miesięczny Grafik Obecności</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <AttendanceGrid 
            members={members || []} 
            // 👇 To jest kluczowe - przekazujemy logi, a jak ich nie ma (null), to pustą tablicę
            logs={(logs as AttendanceLog[]) || []} 
          />
        </CardContent>
      </Card>
    </div>
  );
}