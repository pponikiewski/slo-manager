'use server'

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { startOfMonth, format, parseISO } from "date-fns";

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
  timeSlot: string, 
  type: string | null
) {
  // 1. Najpierw usuwamy stary wpis dla tego slotu i dnia (czyszczenie kratki)
  // Dzięki temu w grafiku tygodniowym nie będziemy mieć duplikatów
  const { error: deleteError } = await supabase
    .from("attendance_logs")
    .delete()
    .match({ 
        member_id: memberId, 
        date: date, 
        time_slot: timeSlot // Usuwamy tylko z tego konkretnego slotu (np. 'standard')
    });

  if (deleteError) throw new Error(deleteError.message);

  // 2. Jeśli typ nie jest nullem (czyli zaznaczamy O lub N), dodajemy nowy wpis
  if (type) {
    const { error: insertError } = await supabase
      .from("attendance_logs")
      .insert({ 
        member_id: memberId, 
        date: date, 
        type: type, 
        time_slot: timeSlot 
      });
      
    if (insertError) throw new Error(insertError.message);
  }

  revalidatePath("/grafiki/tygodniowy");
  revalidatePath("/grafiki/niedzielny");
  revalidatePath("/");
}

export async function addExtraScore(memberId: string, type: string, selectedMonth: string) {
  // POPRAWKA: Tworzymy datę "na sztywno" jako tekst.
  // Jeśli selectedMonth to "2025-12", wynik to "2025-12-01".
  // Żadnych stref czasowych, żadnego przesuwania dni.
  const dateStr = `${selectedMonth}-01`;

  const { error } = await supabase.from("attendance_logs").insert({
    member_id: memberId,
    date: dateStr,     
    type: type,
    time_slot: 'extra'
  });

  if (error) throw new Error(error.message);

  // Odświeżamy stronę
  revalidatePath(`/grafiki/extra`); 
  revalidatePath("/");
}

export async function deleteExtraScore(logId: string) {
  const { error } = await supabase
    .from("attendance_logs")
    .delete()
    .eq("id", logId);

  if (error) {
    console.error("Błąd usuwania:", error);
    throw new Error("Nie udało się usunąć wpisu");
  }

  // Odświeżamy widoki, żeby punkt zniknął natychmiast
  revalidatePath("/grafiki/extra");
  revalidatePath("/");
}