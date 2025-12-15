import { supabase } from "@/lib/supabase";
import { Member } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const revalidate = 0; // Wyłącza cache, żeby zawsze widzieć świeże dane

export default async function Home() {
  // 1. Pobieramy dane z Supabase
  const { data: members, error } = await supabase
    .from("members")
    .select("*")
    .order("last_name", { ascending: true });

  if (error) {
    return <div className="p-4 text-red-500">Błąd ładowania danych: {error.message}</div>;
  }

  return (
    <main className="container mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Lista Ministrantów</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imię i Nazwisko</TableHead>
                <TableHead>Stopień</TableHead>
                <TableHead>Gildia</TableHead>
                <TableHead className="text-right">Punkty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members?.map((member: Member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    {member.first_name} {member.last_name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{member.rank}</Badge>
                  </TableCell>
                  <TableCell>{member.guild || "-"}</TableCell>
                  <TableCell className="text-right font-bold">
                    {member.points}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}