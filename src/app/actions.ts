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
  slot: 'am' | 'pm',
  type: string | null // null oznacza usunięcie wpisu
) {
  if (!type) {
    // Jeśli typ to null, usuwamy wpis (czyszczenie kratki)
    await supabase
      .from("attendance_logs")
      .delete()
      .match({ member_id: memberId, date, slot });
  } else {
    // W przeciwnym razie wstawiamy lub aktualizujemy (upsert)
    const { error } = await supabase
      .from("attendance_logs")
      .upsert(
        { member_id: memberId, date, slot, type },
        { onConflict: 'member_id, date, slot' } // Klucz unikalny, który zdefiniowaliśmy w bazie
      );
      
    if (error) throw new Error(error.message);
  }

  // Odświeżamy widok, żeby inni admini też widzieli zmianę
  revalidatePath("/grafik");
}