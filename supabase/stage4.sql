-- Етап 4: сховище для картинок лендінгів. Виконайте в SQL Editor.
insert into storage.buckets (id, name, public)
values ('landing-images', 'landing-images', true)
on conflict (id) do nothing;
