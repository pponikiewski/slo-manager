"use client";

import { useState } from "react";
import { assignMemberToSlot, removeAssignment } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Plus, UserPlus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Member = { id: string; last_name: string; first_name: string };
type Assignment = { id: string; member: Member }; // Assignment ID potrzebne do usuwania
type Slot = {
    id: string;
    day_of_week: number;
    time: string;
    label: string;
    roster_assignments: Assignment[];
};

interface Props {
    slots: Slot[];
    allMembers: Member[];
}

const DAYS = ["", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];

export function EditRoster({ slots, allMembers }: Props) {
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

    // Grupowanie slotów po dniu
    const slotsByDay = new Map<number, Slot[]>();
    slots.forEach(slot => {
        const current = slotsByDay.get(slot.day_of_week) || [];
        current.push(slot);
        slotsByDay.set(slot.day_of_week, current);
    });

    // Sortowanie slotów
    slotsByDay.forEach(daySlots => daySlots.sort((a, b) => a.time.localeCompare(b.time)));
    const daysOrder = [1, 2, 3, 4, 5, 6];

    const handleRemove = async (assignmentId: string) => {
        if (!confirm("Czy na pewno chcesz usunąć tę osobę z grafiku?")) return;
        setLoadingMap(prev => ({ ...prev, [assignmentId]: true }));
        try {
            await removeAssignment(assignmentId);
        } catch (e) {
            alert("Błąd usuwania");
        } finally {
            setLoadingMap(prev => ({ ...prev, [assignmentId]: false }));
        }
    };

    const handleAdd = async (slotId: string, memberId: string) => {
        if (!memberId) return;
        setLoadingMap(prev => ({ ...prev, [`add-${slotId}`]: true }));
        try {
            await assignMemberToSlot(slotId, memberId);
        } catch (e) {
            alert("Błąd dodawania");
        } finally {
            setLoadingMap(prev => ({ ...prev, [`add-${slotId}`]: false }));
        }
    };

    const [expandedDay, setExpandedDay] = useState<number | null>(null);

    const toggleDay = (dayIndex: number) => {
        setExpandedDay(prev => prev === dayIndex ? null : dayIndex);
    };

    return (
        <div className="space-y-4">
            {daysOrder.map(dayIndex => {
                const daySlots = slotsByDay.get(dayIndex);
                if (!daySlots) return null;
                const isExpanded = expandedDay === dayIndex;

                return (
                    <div key={dayIndex} className="border rounded-lg bg-card/30 overflow-hidden">
                        <button
                            onClick={() => toggleDay(dayIndex)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-muted/20 hover:bg-muted/40 transition-colors"
                        >
                            <span className="text-lg font-bold text-foreground">{DAYS[dayIndex]}</span>
                            <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform duration-200", isExpanded && "rotate-180")} />
                        </button>

                        <div className={cn("grid transition-all duration-300 ease-in-out grid-rows-[0fr]", isExpanded && "grid-rows-[1fr]")}>
                            <div className="overflow-hidden">
                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 border-t border-border/10">
                                    {daySlots.map(slot => (
                                        <div key={slot.id} className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                                            <div className="bg-muted/40 px-4 py-3 border-b flex justify-between items-center">
                                                <span className="font-semibold text-sm">{slot.label || slot.time}</span>
                                                <span className="text-xs text-muted-foreground uppercase tracking-wider">{slot.time}</span>
                                            </div>

                                            <div className="p-4 space-y-4">
                                                {/* Lista przypisanych */}
                                                <div className="space-y-2">
                                                    {slot.roster_assignments.length === 0 && (
                                                        <p className="text-xs text-muted-foreground italic text-center py-2">Brak przypisanych osób</p>
                                                    )}
                                                    {slot.roster_assignments.map((assignment) => (
                                                        <div key={assignment.id} className="flex items-center justify-between text-sm group p-2 rounded-md hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50">
                                                            <span className="font-medium">
                                                                {assignment.member.last_name} {assignment.member.first_name}
                                                            </span>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                                                                onClick={() => handleRemove(assignment.id)}
                                                                disabled={loadingMap[assignment.id]}
                                                            >
                                                                {loadingMap[assignment.id] ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Formularz dodawania */}
                                                <div className="pt-2 border-t mt-2">
                                                    <div className="flex items-center gap-2">
                                                        <Select
                                                            disabled={loadingMap[`add-${slot.id}`]}
                                                            onValueChange={(value) => handleAdd(slot.id, value)}
                                                        >
                                                            <SelectTrigger className="w-full h-9 text-sm">
                                                                <SelectValue placeholder="+ Dodaj osobę..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {allMembers
                                                                    .filter(m => {
                                                                        // Sprawdzamy, czy osoba jest już przypisana do JAKIEGOKOLWIEK slotu w tym dniu
                                                                        const isAssignedToDay = daySlots.some(s =>
                                                                            s.roster_assignments.some(a => a.member.id === m.id)
                                                                        );
                                                                        return !isAssignedToDay;
                                                                    })
                                                                    .map(m => (
                                                                        <SelectItem key={m.id} value={m.id}>
                                                                            {m.last_name} {m.first_name}
                                                                        </SelectItem>
                                                                    ))}
                                                            </SelectContent>
                                                        </Select>
                                                        {loadingMap[`add-${slot.id}`] && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
