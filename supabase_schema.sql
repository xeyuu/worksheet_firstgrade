-- ============================================================
--  Worksheet Print App — Supabase Schema
--  Run this in Supabase > SQL Editor
-- ============================================================

-- 1. Subjects (custom ones; default 3 are in JS)
create table if not exists subjects (
  id         bigint generated always as identity primary key,
  key        text    not null unique,
  label      text    not null,
  emoji      text    not null default '📚',
  color      text    not null default 'sky',
  created_at timestamptz default now()
);

-- 2. Worksheets
create table if not exists worksheets (
  id            bigint generated always as identity primary key,
  name          text        not null,
  subject_key   text        not null,
  page_number   int         default 1,
  page_count    int         default 1,
  storage_path  text,
  file_url      text,
  thumbnail_url text,
  printed       boolean     default false,
  created_at    timestamptz default now()
);

-- 3. Print history
create table if not exists print_history (
  id                bigint generated always as identity primary key,
  worksheet_ids     bigint[]    not null,
  worksheet_names   text[]      not null,
  subject_labels    text[]      default '{}',
  printed_at        timestamptz default now()
);

-- ============================================================
--  Storage bucket
-- ============================================================
-- In Supabase Dashboard > Storage > New bucket
--   Name: worksheets
--   Public: true  (ให้แสดงรูป thumbnail ได้โดยไม่ต้อง auth)

-- ============================================================
--  Row Level Security (RLS) — Public read/write (ไม่มี auth)
--  ถ้าต้องการ auth ให้ปรับ policy ทีหลัง
-- ============================================================
alter table subjects     enable row level security;
alter table worksheets   enable row level security;
alter table print_history enable row level security;

create policy "public all subjects"      on subjects      for all using (true) with check (true);
create policy "public all worksheets"    on worksheets    for all using (true) with check (true);
create policy "public all print_history" on print_history for all using (true) with check (true);

-- Storage policy (run in SQL editor)
insert into storage.buckets (id, name, public)
values ('worksheets', 'worksheets', true)
on conflict do nothing;

create policy "public read worksheets storage"
  on storage.objects for select using (bucket_id = 'worksheets');

create policy "public upload worksheets storage"
  on storage.objects for insert with check (bucket_id = 'worksheets');

create policy "public delete worksheets storage"
  on storage.objects for delete using (bucket_id = 'worksheets');
