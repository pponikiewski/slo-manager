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