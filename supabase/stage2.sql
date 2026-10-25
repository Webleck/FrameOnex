-- Етап 2: поле для номера накладної (ТТН). Виконайте в SQL Editor.
alter table orders add column if not exists ttn text;
