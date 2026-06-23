-- ============================================================
--  Migration: initial schema
--  Worksheet Print App
-- ============================================================

-- 1. Subjects (วิชาที่ผู้ใช้เพิ่มเอง — default 3 วิชาอยู่ใน JS)
create table if not exists subjects (
  id         bigint generated always as identity primary key,
  key        text        not null unique,
  label      text        not null,
  emoji      text        not null default '📚',
  color      text        not null default 'sky',
  created_at timestamptz not null default now()
);

-- 2. Worksheets
create table if not exists worksheets (
  id            bigint generated always as identity primary key,
  name          text        not null,
  subject_key   text        not null,
  page_number   int         not null default 1,
  page_count    int         not null default 1,
  storage_path  text,
  file_url      text,
  thumbnail_url text,
  printed       boolean     not null default false,
  created_at    timestamptz not null default now()
);

-- 3. Print history
create table if not exists print_history (
  id               bigint generated always as identity primary key,
  worksheet_ids    bigint[]    not null default '{}',
  worksheet_names  text[]      not null default '{}',
  subject_labels   text[]      not null default '{}',
  printed_at       timestamptz not null default now()
);

-- ============================================================
--  Row Level Security — public access (ไม่มี auth)
-- ============================================================
alter table subjects      enable row level security;
alter table worksheets    enable row level security;
alter table print_history enable row level security;

create policy "allow all subjects"      on subjects      for all using (true) with check (true);
create policy "allow all worksheets"    on worksheets    for all using (true) with check (true);
create policy "allow all print_history" on print_history for all using (true) with check (true);

-- ============================================================
--  Storage bucket: worksheets (public)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('worksheets', 'worksheets', true)
on conflict (id) do nothing;

create policy "public read worksheets"
  on storage.objects for select
  using (bucket_id = 'worksheets');

create policy "public upload worksheets"
  on storage.objects for insert
  with check (bucket_id = 'worksheets');

create policy "public delete worksheets"
  on storage.objects for delete
  using (bucket_id = 'worksheets');
