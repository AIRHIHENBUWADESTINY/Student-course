-- Align the course accent palette with the Deeperlearn brand colours.
-- The "indigo" accent key was replaced by "blue" in the app theme, so migrate
-- any existing rows and update the column default.
update public.courses set accent = 'blue' where accent = 'indigo';

alter table public.courses alter column accent set default 'blue';
