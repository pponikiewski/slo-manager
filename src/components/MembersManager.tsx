"use client";

import { useState } from "react";
import { addMember, updateMember, deleteMember } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { UserPlus, Pencil, Trash2, Loader2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type Member = {
    id: string;
    first_name: string;
    last_name: string;
    rank: string;
    points: number;
    guild: string | null;
};

interface Props {
    members: Member[];
}

const RANKS = [
    { value: "ministrant", label: "Ministranci" },
    { value: "lektor", label: "Lektorzy" },
    { value: "kandydat", label: "Kandydaci" },
];

export function MembersManager({ members }: Props) {
    const [activeRank, setActiveRank] = useState("ministrant");
    const [isLoading, setIsLoading] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);

    // Filter members based on active tab (case insensitive just in case)
    const filteredMembers = members
        .filter(m => m.rank.toLowerCase() === activeRank)
        .sort((a, b) => a.last_name.localeCompare(b.last_name));

    const handleDelete = async (id: string) => {
        if (!confirm("Czy na pewno chcesz usunąć tę osobę? To nieodwracalne.")) return;
        setIsLoading(true);
        try {
            await deleteMember(id);
        } catch (e) {
            alert("Błąd usuwania");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingMember) return;
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = {
            first_name: formData.get("first_name") as string,
            last_name: formData.get("last_name") as string,
            rank: formData.get("rank") as string,
        };

        try {
            await updateMember(editingMember.id, data);
            setEditingMember(null);
        } catch (error) {
            alert("Błąd edycji");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* TABS */}
            <div className="flex p-1 bg-muted/20 rounded-lg w-full md:w-fit">
                {RANKS.map(rank => (
                    <button
                        key={rank.value}
                        onClick={() => setActiveRank(rank.value)}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-md transition-all capitalize flex-1 md:flex-none",
                            activeRank === rank.value
                                ? "bg-background shadow-sm text-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                    >
                        {rank.label}
                    </button>
                ))}
            </div>

            <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                    Lista: {RANKS.find(r => r.value === activeRank)?.label} ({filteredMembers.length})
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <UserPlus className="h-4 w-4" />
                            Dodaj osobę
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Dodaj nowego osobę</DialogTitle>
                        </DialogHeader>
                        <form action={async (formData) => {
                            await addMember(formData);
                            setIsAddOpen(false);
                        }} className="space-y-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Imię</label>
                                <Input name="first_name" required />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Nazwisko</label>
                                <Input name="last_name" required />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Stopień</label>
                                <Select name="rank" defaultValue={activeRank}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ministrant">Ministrant</SelectItem>
                                        <SelectItem value="lektor">Lektor</SelectItem>
                                        <SelectItem value="kandydat">Kandydat</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Zapisz</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* TABLE */}
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nazwisko i Imię</TableHead>
                            <TableHead>Stopień</TableHead>
                            <TableHead className="text-right">Akcje</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredMembers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                    Brak osób w tej grupie.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredMembers.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell className="font-medium">
                                        {member.last_name} {member.first_name}
                                    </TableCell>
                                    <TableCell className="capitalize">{member.rank}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => setEditingMember(member)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(member.id)} disabled={isLoading}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* EDIT DIALOG */}
            <Dialog open={!!editingMember} onOpenChange={(open) => !open && setEditingMember(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edytuj dane</DialogTitle>
                    </DialogHeader>
                    {editingMember && (
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Imię</label>
                                <Input name="first_name" defaultValue={editingMember.first_name} required />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Nazwisko</label>
                                <Input name="last_name" defaultValue={editingMember.last_name} required />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Stopień</label>
                                <Select name="rank" defaultValue={editingMember.rank.toLowerCase()}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ministrant">Ministrant</SelectItem>
                                        <SelectItem value="lektor">Lektor</SelectItem>
                                        <SelectItem value="kandydat">Kandydat</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Zaktualizuj
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
