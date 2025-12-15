-- 1. MINISTRANCI
create table members (
  id uuid default gen_random_uuid() primary key,
  first_name text not null,
  last_name text not null,
  rank text not null, -- 'ministrant', 'lektor'
  guild text,         -- 'Gildia I', 'Gildia II'
  created_at timestamp with time zone default now()
);

-- 2. SZABLON SLOTÓW (Dla grafiku stałego tygodniowego)
create table weekly_slots (
  id uuid default gen_random_uuid() primary key,
  day_of_week integer not null, -- 1=Pon, 2=Wt... 0=Niedziela
  time time not null,           -- 18:00
  label text,                   -- np. 'Poniedziałek Wieczór'
  unique(day_of_week, time)
);

-- 3. PRZYPISANIA STAŁE (Kto ma być w grafiku tygodniowym?)
-- Tabela łącząca: Slot <-> Ministrant
create table roster_assignments (
  id uuid default gen_random_uuid() primary key,
  slot_id uuid references weekly_slots(id) on delete cascade,
  member_id uuid references members(id) on delete cascade,
  unique(slot_id, member_id)
);

-- 4. HISTORIA OBECNOŚCI (Wspólna tabela, ale różne typy)
create table attendance_logs (
  id uuid default gen_random_uuid() primary key,
  member_id uuid references members(id) on delete cascade,
  date date not null,
  
  -- Tutaj będą lądować: 'O', 'N' (ze zwykłych grafikow) ORAZ 'W', 'R' (z dodatkowych)
  type text not null, 
  
  -- Opcjonalnie: skąd pochodzi wpis (tydzień, niedziela, extra)
  source text default 'standard', 
  
  created_at timestamp with time zone default now(),
  unique(member_id, date, type) -- Zabezpieczenie przed dublami tego samego typu
);

-- 5. WIDOK PUNKTACJI (Automatyczny Ranking)
-- Tu definiujemy wagi punktowe
create or replace view member_scores as
select
  m.id,
  m.first_name,
  m.last_name,
  m.rank,
  m.guild,
  coalesce(sum(
    case
      -- GRAFIK OBOWIĄZKOWY
      when al.type = 'O' then 1
      when al.type = 'N' then 0
      -- GRAFIK DODATKOWY
      when al.type = 'W' then 2
      when al.type = 'R' then 2
      when al.type = 'S' then 3
      -- Inne
      else 0
    end
  ), 0) as total_points
from members m
left join attendance_logs al on m.id = al.member_id
group by m.id;

-- 6. DANE STARTOWE - SLOTY TYGODNIOWE
-- Odwzorowujemy tabelę ze zdjęcia (Rano/Wieczór Pon-Sob)
insert into weekly_slots (day_of_week, time, label) values
(1, '07:00', 'Poniedziałek Rano'), (1, '18:00', 'Poniedziałek Wieczór'),
(2, '07:00', 'Wtorek Rano'),      (2, '18:00', 'Wtorek Wieczór'),
(3, '07:00', 'Środa Rano'),       (3, '18:00', 'Środa Wieczór'),
(4, '07:00', 'Czwartek Rano'),    (4, '18:00', 'Czwartek Wieczór'),
(5, '07:00', 'Piątek Rano'),      (5, '18:00', 'Piątek Wieczór'),
(6, '07:00', 'Sobota Rano'),      (6, '18:00', 'Sobota Wieczór');

-- Włączamy zabezpieczenia
alter table members enable row level security;
alter table attendance_logs enable row level security;
alter table weekly_slots enable row level security;
alter table roster_assignments enable row level security;

-- Polityki dostępu (na razie otwarte)
create policy "Allow all" on members for all using (true);
create policy "Allow all" on attendance_logs for all using (true);
create policy "Allow all" on weekly_slots for all using (true);
create policy "Allow all" on roster_assignments for all using (true);