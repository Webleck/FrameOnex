-- Демо-товар і демо-лендінг: відкриється за /l/demo
with p as (
  insert into products (name, cost_price, sale_price, supplier)
  values ('Демо-товар', 400, 899, 'Постачальник 1') returning id
)
insert into landings (product_id, slug, title, status, settings, blocks)
select id, 'demo', 'Демо-товар: замовити зі знижкою', 'published',
 '{"accent":"#0E7C66"}',
 '[
  {"type":"hero","headline":"Назва вашого товару","subheadline":"Одне речення про головну вигоду для покупця.","image":"https://placehold.co/800x800","cta":"Замовити"},
  {"type":"benefits","title":"Чому це зручно","items":[{"title":"Перша перевага","text":"Коротко і конкретно."},{"title":"Друга перевага","text":"Що саме отримує покупець."},{"title":"Третя перевага","text":"Чим краще за аналоги."}]},
  {"type":"reviews","title":"Відгуки покупців","items":[{"name":"Олена, Київ","text":"Текст відгуку."},{"name":"Андрій, Львів","text":"Текст відгуку."}]},
  {"type":"faq","title":"Часті запитання","items":[{"q":"Як відбувається оплата?","a":"Оплата при отриманні на відділенні."},{"q":"Скільки йде доставка?","a":"1-3 дні по Україні."}]},
  {"type":"order","title":"Залиште заявку","cta":"Замовити"}
 ]'::jsonb
from p;
