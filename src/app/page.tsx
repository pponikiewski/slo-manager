import { supabase } from "@/lib/supabase";
import { MemberScore } from "@/types";
import { AddMemberDialog } from "@/components/AddMemberDialog";
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
import { Trophy } from "lucide-react"; // Ikona pucharu

export const revalidate = 0; // Zawsze świeże dane

export default async function Home() {
  // Pobieramy dane z Twojego WIDOKU (member_scores), który sam liczy punkty
  const { data: members, error } = await supabase
    .from("member_scores")
    .select("*")
    .order("total_points", { ascending: false }); // Najlepsi na górze

  if (error) {
    return <div className="p-8 text-center text-red-500">Błąd bazy danych: {error.message}</div>;
  }

  return (
    <main className="container mx-auto py-6 px-4 max-w-5xl">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Panel Parafialny</h1>
        {/* Tu w przyszłości może być przełącznik miesięcy */}
      </div>

      <div className="grid gap-6">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center space-x-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <CardTitle>Ranking Punktowy</CardTitle>
            </div>
            <AddMemberDialog />
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[60px] text-center">Poz.</TableHead>
                    <TableHead>Ministrant</TableHead>
                    <TableHead className="hidden sm:table-cell">Stopień</TableHead>
                    <TableHead className="hidden sm:table-cell">Gildia</TableHead>
                    <TableHead className="text-right pr-6">Punkty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members?.map((member: MemberScore, index: number) => (
                    <TableRow key={member.id} className="hover:bg-muted/30">
                      <TableCell className="text-center font-mono text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{member.first_name} {member.last_name}</span>
                          {/* Na telefonach pokazujemy stopień pod nazwiskiem */}
                          <span className="sm:hidden text-xs text-muted-foreground">{member.rank}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="secondary" className="font-normal">
                          {member.rank}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {member.guild || "-"}
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg pr-6">
                        {member.total_points}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}