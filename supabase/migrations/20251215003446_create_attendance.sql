create table attendance_logs (
  id uuid default gen_random_uuid() primary key,
  member_id uuid references members(id) on delete cascade not null,
  date date not null,
  slot text check (slot in ('am', 'pm')) not null, -- 'am' (rano) lub 'pm' (wieczór)
  type text not null, -- 'O' (obecny), 'N' (nieobecny), 'W', 'R', 'S' (nadobowiązkowe)
  created_at timestamp with time zone default now(),
  unique(member_id, date, slot) -- Zabezpieczenie: jedna osoba nie może mieć 2 wpisów na ten sam slot
);

alter table attendance_logs enable row level security;
create policy "Public Access" on attendance_logs for all using (true);