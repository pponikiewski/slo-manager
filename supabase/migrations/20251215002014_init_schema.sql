-- supabase/migrations/202xxx_init_schema.sql

-- Tabela przechowywująca dane ministrantów
create table members (
  id uuid default gen_random_uuid() primary key,
  first_name text not null,
  last_name text not null,
  rank text not null, -- 'ministrant', 'lektor', 'kandydat'
  guild text, -- 'Gildia I', 'Gildia II'
  points integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Zabezpieczenia (RLS)
alter table members enable row level security;

-- Polityka dostępu (na razie otwarta dla wszystkich)
create policy "Public Access" on members for all using (true);