'use server'

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function addMember(formData: FormData) {
  // 1. Wyciągamy dane z formularza HTML
  const rawData = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    rank: formData.get("rank") as string,
    guild: formData.get("guild") as string || null, // Pusty string zamieniamy na null
    points: 0, // Nowy zawsze ma 0
  };

  // 2. Wysyłamy do Supabase
  const { error } = await supabase.from("members").insert(rawData);

  if (error) {
    console.error("Błąd dodawania:", error);
    throw new Error("Nie udało się dodać ministranta");
  }

  // 3. Odświeżamy stronę, żeby nowa osoba od razu się pojawiła
  revalidatePath("/");
}

export async function saveAttendance(
  memberId: string,
  date: string,
  timeSlot: string, // Teraz to będzie np. 'standard' albo 'am/pm'
  type: string | null
) {
  // Jeśli typ to null, usuwamy wpis
  if (!type) {
    await supabase
      .from("attendance_logs")
      .delete()
      .match({ member_id: memberId, date, type: 'O' }); // Usuwamy O
       // UWAGA: To uproszczenie. W delete lepiej matchować po ID, ale tu matchujemy po logice
       // Dla pewności spróbujmy usunąć wpis dla danej osoby i daty, który nie jest "Extra"
       // W tej wersji zróbmy prościej:
  } 

  // W wersji StrictCell po prostu używamy upsert.
  // Jeśli type jest null, to znaczy że chcemy usunąć. 
  // Supabase upsert nie usuwa przy nullu. Musimy rozdzielić logikę.
  
  if (type) {
      const { error } = await supabase
      .from("attendance_logs")
      .upsert(
        { member_id: memberId, date, type, time_slot: timeSlot },
        { onConflict: 'member_id, date, type' } 
        // Uwaga: Constraint w bazie jest (member_id, date, type).
        // To oznacza, że możesz mieć tego samego dnia 'O' i 'W'. To dobrze!
      );
      if (error) throw new Error(error.message);
  } else {
      // Usuwanie (dla StrictCell: usuwamy wpis O lub N dla tej daty)
      // Ponieważ StrictCell przełącza O/N, musimy usunąć cokolwiek tam jest z tego zakresu.
      const { error } = await supabase
        .from("attendance_logs")
        .delete()
        .eq('member_id', memberId)
        .eq('date', date)
        .in('type', ['O', 'N']); // Usuwamy tylko obowiązkowe, zostawiamy Extra
      
      if (error) throw new Error(error.message);
  }

  revalidatePath("/grafiki/tygodniowy");
  revalidatePath("/");
}
