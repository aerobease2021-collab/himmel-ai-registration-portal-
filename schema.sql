-- Run this complete script in Supabase > SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null check (type in ('vendor','freelancer')),
  company_name text,
  contact_name text not null,
  email text not null,
  phone text not null,
  country text not null,
  website text,
  services text[] not null default '{}',
  languages text[] not null default '{}',
  experience text not null,
  capacity text,
  availability text,
  rate text,
  document_path text not null,
  notes text,
  status text not null default 'New' check (status in ('New','Reviewing','Shortlisted','Approved','Rejected'))
);

alter table public.registrations enable row level security;

-- Public users can submit registrations, but cannot read or update submissions.
drop policy if exists "Public can submit registration" on public.registrations;
create policy "Public can submit registration"
on public.registrations for insert to anon, authenticated
with check (true);

-- Admin identity allowlist. Add the admin's authenticated user UUID here.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admin_users enable row level security;

create or replace function public.is_himmel_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.admin_users where user_id = auth.uid()); $$;

drop policy if exists "Admins can read registrations" on public.registrations;
create policy "Admins can read registrations"
on public.registrations for select to authenticated
using (public.is_himmel_admin());

drop policy if exists "Admins can update registrations" on public.registrations;
create policy "Admins can update registrations"
on public.registrations for update to authenticated
using (public.is_himmel_admin()) with check (public.is_himmel_admin());

-- Private bucket: uploaded company profiles and freelancer CVs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('registration-documents', 'registration-documents', false, 10485760,
  array['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do update set public = false, file_size_limit = 10485760;

drop policy if exists "Public can upload registration documents" on storage.objects;
create policy "Public can upload registration documents"
on storage.objects for insert to anon, authenticated
with check (bucket_id = 'registration-documents');

drop policy if exists "Admins can view registration documents" on storage.objects;
create policy "Admins can view registration documents"
on storage.objects for select to authenticated
using (bucket_id = 'registration-documents' and public.is_himmel_admin());

drop policy if exists "Admins can delete registration documents" on storage.objects;
create policy "Admins can delete registration documents"
on storage.objects for delete to authenticated
using (bucket_id = 'registration-documents' and public.is_himmel_admin());
