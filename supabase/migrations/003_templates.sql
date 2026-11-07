-- FrameOnex: крок 3 — видалення шаблонів (лише супер-адмін)
-- Шаблони лежать у коді (lib/templates.ts), тому "видалення" = ключ шаблону
-- потрапляє в таблицю deleted_templates і шаблон зникає зі списку для всіх.
-- Його можна відновити назад. Запускати в Supabase -> SQL Editor (Ctrl+A -> Run).

create table if not exists deleted_templates (
  template_key text primary key,
  deleted_by uuid references auth.users(id),
  deleted_at timestamptz not null default now()
);

alter table deleted_templates enable row level security;

drop policy if exists deleted_templates_read on deleted_templates;
create policy deleted_templates_read on deleted_templates
  for select using (true);

drop policy if exists deleted_templates_super_write on deleted_templates;
create policy deleted_templates_super_write on deleted_templates
  for all using (is_super_admin()) with check (is_super_admin());
