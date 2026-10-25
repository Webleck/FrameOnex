import type { Block, BlockStyle } from './blocks'
import { inDays } from './blocks'

const st = (bg: NonNullable<BlockStyle['bg']> = 'none'): BlockStyle => ({ bg, space: 'normal', align: 'left', show: 'all' })
const IMG = 'https://placehold.co/800x800'

const benefits = (bg: NonNullable<BlockStyle['bg']> = 'none'): Block => ({
  type: 'benefits', title: 'Чому це зручно', style: st(bg),
  items: [
    { title: 'Перша перевага', text: 'Коротко і конкретно.' },
    { title: 'Друга перевага', text: 'Що саме отримує покупець.' },
    { title: 'Третя перевага', text: 'Чим краще за аналоги.' },
  ],
})
const reviews = (bg: NonNullable<BlockStyle['bg']> = 'none'): Block => ({
  type: 'reviews', title: 'Відгуки покупців', style: st(bg),
  items: [{ name: 'Олена, Київ', text: 'Текст відгуку.' }, { name: 'Андрій, Львів', text: 'Текст відгуку.' }],
})
const faq = (): Block => ({
  type: 'faq', title: 'Часті запитання', style: st(),
  items: [{ q: 'Як відбувається оплата?', a: 'Оплата при отриманні на відділенні.' }, { q: 'Скільки йде доставка?', a: '1-3 дні по Україні.' }],
})
const hero = (): Block => ({ type: 'hero', headline: 'Назва вашого товару', subheadline: 'Одне речення про головну вигоду для покупця.', image: IMG, cta: 'Замовити', style: st() })
const order = (bg: NonNullable<BlockStyle['bg']> = 'none'): Block => ({ type: 'order', title: 'Залиште заявку', cta: 'Замовити', style: st(bg) })

export const TEMPLATES: { key: string; label: string; build: () => Block[] }[] = [
  { key: 'classic', label: 'Класичний (5 блоків)', build: () => [hero(), benefits(), reviews(), faq(), order()] },
  { key: 'quick', label: 'Короткий, для швидкого тесту товару', build: () => [hero(), benefits('light'), order()] },
  {
    key: 'long',
    label: 'Довгий (відео, порівняння, таймер)',
    build: () => [
      hero(),
      benefits('light'),
      { type: 'video', title: 'Дивіться відео', url: '', style: st() },
      { type: 'comparison', title: 'Чим ми кращі', ourLabel: 'Наш товар', otherLabel: 'Аналоги', style: st(),
        rows: [{ feature: 'Параметр 1', ours: 'yes', other: 'no' }, { feature: 'Параметр 2', ours: 'yes', other: 'no' }] },
      { type: 'gallery', title: 'Фото товару', columns: '3', items: [{ image: IMG }, { image: IMG }, { image: IMG }], style: st() },
      reviews('light'),
      faq(),
      { type: 'timer', title: 'Акція діє до', text: '', endsAt: inDays(7), expiredText: 'Акція завершена', style: st('dark') },
      order('dark'),
    ],
  },
]
