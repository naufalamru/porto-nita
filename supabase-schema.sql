-- Jalankan seluruh SQL ini di Supabase > SQL Editor.
-- Buat akun admin secara manual melalui Authentication > Users.
-- Matikan/disable public sign-ups agar pengunjung tidak bisa membuat akun.

create table if not exists public.portfolio_profile (
  id integer primary key default 1 check (id = 1),
  full_name text not null default '',
  headline text not null default '',
  about text not null default '',
  location text not null default '',
  email text not null default '',
  phone text not null default '',
  linkedin text not null default '',
  github text not null default '',
  photo_url text not null default '',
  updated_at timestamptz not null default now()
);

insert into public.portfolio_profile (id)
values (1)
on conflict (id) do nothing;

create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('project', 'experience', 'education', 'skill', 'certificate')),
  title text not null,
  subtitle text not null default '',
  description text not null default '',
  date_label text not null default '',
  url text not null default '',
  image_url text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.portfolio_profile enable row level security;
alter table public.portfolio_items enable row level security;

drop policy if exists "Public can read profile" on public.portfolio_profile;
create policy "Public can read profile"
on public.portfolio_profile for select
to anon, authenticated using (true);

drop policy if exists "Authenticated admins can update profile" on public.portfolio_profile;
create policy "Authenticated admins can update profile"
on public.portfolio_profile for update
to authenticated using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "Public can read portfolio items" on public.portfolio_items;
create policy "Public can read portfolio items"
on public.portfolio_items for select
to anon, authenticated using (true);

drop policy if exists "Authenticated admins can insert portfolio items" on public.portfolio_items;
create policy "Authenticated admins can insert portfolio items"
on public.portfolio_items for insert
to authenticated with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated admins can update portfolio items" on public.portfolio_items;
create policy "Authenticated admins can update portfolio items"
on public.portfolio_items for update
to authenticated using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated admins can delete portfolio items" on public.portfolio_items;
create policy "Authenticated admins can delete portfolio items"
on public.portfolio_items for delete
to authenticated using (auth.role() = 'authenticated');

-- Catatan keamanan:
-- Jangan pernah menaruh service_role key di frontend.
-- Matikan pendaftaran publik di Supabase Auth dan buat hanya akun admin yang kamu kendalikan.
