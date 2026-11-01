-- C.A.R.E.S. website: database + security rules
-- Run this ONCE in Supabase: SQL Editor > New query > paste all > Run.

-- ---------- Tables ----------
create table if not exists public.settings (
  key   text primary key,
  value text
);

create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  event_date  date,
  description text,
  image_url   text,
  visible     boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.gallery (
  id         uuid primary key default gen_random_uuid(),
  image_url  text not null,
  caption    text,
  visible    boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.volunteers (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (char_length(name) <= 100),
  age          int  check (age between 10 and 110),
  phone        text not null check (char_length(phone) <= 20),
  email        text check (char_length(email) <= 120),
  track        text not null check (track in ('Youth', 'Senior Citizen')),
  availability text check (char_length(availability) <= 200),
  message      text check (char_length(message) <= 1000),
  status       text not null default 'New' check (status in ('New', 'Contacted', 'Joined', 'Not available')),
  notes        text,
  created_at   timestamptz not null default now()
);

create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) <= 100),
  email      text check (char_length(email) <= 120),
  phone      text check (char_length(phone) <= 20),
  message    text not null check (char_length(message) <= 2000),
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.donations (
  id         uuid primary key default gen_random_uuid(),
  donor_name text not null check (char_length(donor_name) <= 100),
  amount     numeric(12,2) not null check (amount > 0),
  reference  text check (char_length(reference) <= 60),
  method     text,
  source     text not null default 'online' check (source in ('online', 'manual')),
  status     text not null default 'Pending' check (status in ('Pending', 'Verified', 'Rejected')),
  note       text,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role    text not null default 'editor' check (role in ('admin', 'editor'))
);

-- ---------- Helper functions ----------
create or replace function public.is_staff() returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.profiles where user_id = auth.uid());
$$;

create or replace function public.is_admin() returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin');
$$;

-- ---------- Row Level Security ----------
alter table public.settings    enable row level security;
alter table public.events      enable row level security;
alter table public.gallery     enable row level security;
alter table public.volunteers  enable row level security;
alter table public.messages    enable row level security;
alter table public.donations   enable row level security;
alter table public.profiles    enable row level security;

-- Public website content: everyone can read, only staff can change
create policy "settings read"   on public.settings for select using (true);
create policy "settings write"  on public.settings for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "events read visible" on public.events for select using (visible or public.is_staff());
create policy "events write"        on public.events for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "gallery read visible" on public.gallery for select using (visible or public.is_staff());
create policy "gallery write"        on public.gallery for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- Visitors may only ADD rows (never read them) and only with safe starting values
create policy "volunteers insert" on public.volunteers for insert to anon, authenticated
  with check (status = 'New' and notes is null);
create policy "volunteers staff"  on public.volunteers for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "messages insert" on public.messages for insert to anon, authenticated
  with check (is_read = false);
create policy "messages staff"  on public.messages for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "donations insert" on public.donations for insert to anon
  with check (status = 'Pending' and source = 'online' and note is null);
create policy "donations staff"  on public.donations for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- Profiles: a logged-in user can see their own role; only admins can manage roles
create policy "profiles self read" on public.profiles for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "profiles admin write" on public.profiles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- Photo storage ----------
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

create policy "gallery files public read" on storage.objects for select
  using (bucket_id = 'gallery');
create policy "gallery files staff upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'gallery' and public.is_staff());
create policy "gallery files staff update" on storage.objects for update to authenticated
  using (bucket_id = 'gallery' and public.is_staff());
create policy "gallery files staff delete" on storage.objects for delete to authenticated
  using (bucket_id = 'gallery' and public.is_staff());

-- ---------- Starting settings (the NGO can change all of these in the admin panel) ----------
insert into public.settings (key, value) values
  ('email', 'caresngo.taloja@gmail.com'),
  ('address', 'Taloja, Panvel, Maharashtra')
on conflict (key) do nothing;

-- ---------- AFTER you create the first admin user (Authentication > Users > Add user) ----------
-- run this line with the real email:
--   insert into public.profiles (user_id, role)
--   select id, 'admin' from auth.users where email = 'caresngo.taloja@gmail.com';
