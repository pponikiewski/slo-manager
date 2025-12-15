"use client";

import { useState } from "react";
import { addMember } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";

export function AddMemberDialog() {
  const [open, setOpen] = useState(false);

  // Funkcja, która uruchamia się po wysłaniu formularza
  async function handleSubmit(formData: FormData) {
    await addMember(formData); // Wywołujemy Server Action
    setOpen(false); // Zamykamy okno po sukcesie
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Dodaj Osobę
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Dodaj nowego ministranta</DialogTitle>
        </DialogHeader>
        
        {/* Formularz HTML, który korzysta z Server Action */}
        <form action={handleSubmit} className="grid gap-4 py-4">
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="first_name" className="text-right">Imię</Label>
            <Input id="first_name" name="first_name" className="col-span-3" required />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="last_name" className="text-right">Nazwisko</Label>
            <Input id="last_name" name="last_name" className="col-span-3" required />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rank" className="text-right">Stopień</Label>
            {/* Używamy zwykłego selecta, ale stylizujemy go jak shadcn input */}
            <select 
                id="rank" 
                name="rank" 
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <option value="Kandydat">Kandydat</option>
                <option value="Ministrant">Ministrant</option>
                <option value="Lektor">Lektor</option>
                <option value="Ceremoniarz">Ceremoniarz</option>
            </select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="guild" className="text-right">Gildia</Label>
            <select 
                id="guild" 
                name="guild"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <option value="">Brak (luźny)</option>
                <option value="Gildia I">Gildia I</option>
                <option value="Gildia II">Gildia II</option>
                <option value="Gildia III">Gildia III</option>
                <option value="Gildia IV">Gildia IV</option>
                <option value="Gildia V">Gildia V</option>
            </select>
          </div>

          <div className="flex justify-end mt-4">
            <Button type="submit">Zapisz</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}