-- Adds a date of birth to student profiles.
-- Run this once in the Supabase SQL editor (or via the Supabase CLI).

alter table public.profiles
  add column if not exists date_of_birth date;

-- Re-create the signup trigger so new profiles capture the date of birth
-- supplied during registration (stored in the auth user's metadata).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, bio, goal, date_of_birth)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.email, ''),
    '',
    'Complete all six courses this semester',
    nullif(new.raw_user_meta_data ->> 'date_of_birth', '')::date
  )
  on conflict (id) do nothing;

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;
