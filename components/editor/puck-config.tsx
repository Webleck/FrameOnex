'use client'
import { createContext, useContext } from 'react'
import type { Config, Field } from '@puckeditor/core'
import { BlockView, BlockFrame, ColumnsLayout, colCount } from '@/components/Blocks'
import type { Block, BlockStyle } from '@/lib/blocks'
import { inDays } from '@/lib/blocks'
import { FONTS, safeAccent, fontStack, safeColor, safeBgUrl, bgStyle, darkOverlay } from '@/lib/theme'
import ImageInput from './ImageInput'
import ColorInput from './ColorInput'
import SliderInput from './SliderInput'
import PositionPad from './PositionPad'

const opts = (pairs: [string, string][]) => pairs.map(([label, value]) => ({ label, value }))
const defaultStyle = { bg: 'none', space: 'normal', align: 'left', show: 'all', overlay: '0', hAlign: 'center', vAlign: 'top', posMobile: 'desktop', widthPct: 100, minH: 0, z: 0, pos: { x: 0, y: 0 } }

const imageField = (label: string) => ({
  type: 'custom' as const,
  label,
  render: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <ImageInput value={value} onChange={onChange} />
  ),
})

const dateTimeField = (label: string) => ({
  type: 'custom' as const,
  label,
  render: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <input type="datetime-local" value={value ?? ''} onChange={(e) => onChange(e.target.value)}
      style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 6, fontSize: 14 }} />
  ),
})

const colorField = (label: string) => ({
  type: 'custom' as const,
  label,
  render: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <ColorInput value={value} onChange={onChange} allowEmpty />
  ),
})

const sliderField = (label: string, o: { min: number; max: number; step?: number; unit?: string; def: number }) => ({
  type: 'custom' as const,
  label,
  render: ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
    <SliderInput value={value} onChange={onChange} {...o} />
  ),
})

const padField = (label: string) => ({
  type: 'custom' as const,
  label,
  render: ({ value, onChange }: { value: { x: number; y: number }; onChange: (v: { x: number; y: number }) => void }) => (
    <PositionPad value={value} onChange={onChange} />
  ),
})

// Вкладені блоки знають, що вони всередині колонок
const NestedCtx = createContext(false)

type SlotC = React.ComponentType<{ minEmptyHeight?: number }>
function ColumnsPreview(props: {
  layout: string; gap: string; valign: string; style?: BlockStyle; col1: SlotC; col2: SlotC; col3: SlotC
}) {
  const slots = [props.col1, props.col2, props.col3].slice(0, colCount(props.layout))
  return (
    <BlockFrame style={props.style}>
      <NestedCtx.Provider value={true}>
        <ColumnsLayout layout={props.layout} gap={props.gap} valign={props.valign}>
          {slots.map((Slot, i) => (
            <div key={i} className="min-w-0"><Slot minEmptyHeight={96} /></div>
          ))}
        </ColumnsLayout>
      </NestedCtx.Provider>
    </BlockFrame>
  )
}

function pageStyle(o: { accent?: string; font?: string; bgColor?: string; textColor?: string; bgImage?: string; overlay?: string }) {
  const image = safeBgUrl(o.bgImage)
  const text = safeColor(o.textColor) ?? (image && darkOverlay(o.overlay) ? '#ffffff' : undefined)
  return {
    '--accent': safeAccent(o.accent),
    fontFamily: fontStack(o.font),
    ...bgStyle({ color: safeColor(o.bgColor), image, overlay: o.overlay }),
    ...(text ? { color: text } : {}),
  } as React.CSSProperties
}

// Однакова група «Оформлення» для кожного блоку
const styleFields = (): Record<string, Field> => ({
  style: {
    type: 'object',
    label: 'Оформлення блоку',
    objectFields: {
      bg: { type: 'select', label: 'Фон', options: opts([['Без фону', 'none'], ['Світло-сірий', 'light'], ['Акцентний колір', 'accent'], ['Темний', 'dark']]) },
      bgColor: colorField('Свій колір фону'),
      bgImage: imageField('Фонове фото'),
      overlay: { type: 'select', label: 'Затемнення фонового фото', options: opts([['Без затемнення', '0'], ['Легке', '20'], ['Середнє', '40'], ['Сильне', '60'], ['Дуже сильне', '80']]) },
      textColor: colorField('Колір тексту'),
      btnColor: colorField('Колір кнопок і акцентів'),
      btnText: colorField('Колір тексту на кнопках'),
      space: { type: 'select', label: 'Відступи', options: opts([['Малі', 'compact'], ['Звичайні', 'normal'], ['Великі', 'spacious']]) },
      align: { type: 'radio', label: 'Вирівнювання тексту', options: opts([['Ліворуч', 'left'], ['По центру', 'center']]) },
      widthPct: sliderField('Ширина блоку, %', { min: 20, max: 100, step: 5, unit: '%', def: 100 }),
      hAlign: { type: 'radio', label: 'Положення вужчого блоку', options: opts([['Ліворуч', 'left'], ['По центру', 'center'], ['Праворуч', 'right']]) },
      minH: sliderField('Мінімальна висота, px (0 = авто)', { min: 0, max: 1200, step: 10, unit: 'px', def: 0 }),
      vAlign: { type: 'radio', label: 'Вміст по вертикалі (якщо задана висота)', options: opts([['Зверху', 'top'], ['По центру', 'center'], ['Знизу', 'bottom']]) },
      pos: padField('Зсув блоку: перетягніть точку (накладання)'),
      z: sliderField('Шар: більше число = поверх інших', { min: -5, max: 50, step: 1, def: 0 }),
      posMobile: { type: 'radio', label: 'Де діє зсув і шар', options: opts([['Лише на компʼютері', 'desktop'], ['Скрізь, і на телефоні', 'all']]) },
      show: { type: 'select', label: 'Де показувати', options: opts([['Скрізь', 'all'], ['Лише на телефоні', 'mobile'], ['Лише на компʼютері', 'desktop']]) },
    },
  },
})

export function makeConfig(price: number): Config {
  // У редакторі форма замовлення неактивна (preview), щоб не створювати справжніх заявок
  const ctx = { landingId: 'preview', price, preview: true }
  const view = (type: Block['type']) => {
    const Preview = (props: Record<string, unknown>) => {
      const nested = useContext(NestedCtx)
      return <BlockView block={{ ...props, type } as unknown as Block} ctx={{ ...ctx, nested }} />
    }
    return Preview
  }

  return {
    categories: {
      layout: { title: 'Структура', components: ['columns'] },
      sales: { title: 'Продаж', components: ['hero', 'timer', 'cta', 'order'] },
      content: { title: 'Контент', components: ['benefits', 'text', 'image', 'gallery', 'video'] },
      trust: { title: 'Довіра', components: ['reviews', 'comparison', 'faq'] },
    },
    root: {
      fields: {
        accent: {
          type: 'custom' as const,
          label: 'Основний колір сторінки',
          render: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
            <ColorInput value={value} onChange={onChange} />
          ),
        },
        font: {
          type: 'select',
          label: 'Шрифт сторінки',
          options: Object.entries(FONTS).map(([value, f]) => ({ label: f.label, value })),
        },
        bgColor: colorField('Колір фону сторінки'),
        bgImage: imageField('Фонове фото всієї сторінки'),
        overlay: { type: 'select', label: 'Затемнення фонового фото', options: opts([['Без затемнення', '0'], ['Легке', '20'], ['Середнє', '40'], ['Сильне', '60'], ['Дуже сильне', '80']]) },
        textColor: colorField('Колір тексту сторінки'),
        popup: { type: 'radio', label: 'Кнопка «Замовити»', options: opts([['Відкриває вікно з формою', 'on'], ['Прокручує до форми внизу', 'off']]) },
      },
      defaultProps: { accent: '#0E7C66', font: 'sans', bgColor: '', textColor: '', bgImage: '', overlay: '0', popup: 'on' },
      render: ({ children, ...p }: { children: React.ReactNode; accent?: string; font?: string; bgColor?: string; textColor?: string; bgImage?: string; overlay?: string }) => (
        <div
          className="min-h-screen overflow-x-clip bg-neutral-50 text-neutral-900"
          style={pageStyle(p)}
        >
          {children}
        </div>
      ),
    },
    components: {
      hero: {
        label: 'Головний екран',
        fields: {
          headline: { type: 'text', label: 'Заголовок' },
          subheadline: { type: 'textarea', label: 'Підзаголовок' },
          image: imageField('Картинка товару'),
          imageLayout: { type: 'select', label: 'Розташування картинки', options: opts([['Справа від тексту', 'right'], ['Зліва від тексту', 'left'], ['Над текстом, у рамках сторінки', 'top'], ['Над текстом, на всю ширину екрана', 'full']]) },
          imageRatio: { type: 'select', label: 'Пропорції картинки', options: opts([['Квадрат', 'square'], ['4:3', '4-3'], ['16:9 (широка)', '16-9'], ['21:9 (панорама)', '21-9'], ['Оригінальні', 'auto']]) },
          cta: { type: 'text', label: 'Текст кнопки' },
          ...styleFields(),
        },
        defaultProps: { headline: 'Назва вашого товару', subheadline: 'Одне речення про головну вигоду для покупця.', image: '', cta: 'Замовити', imageLayout: 'right', imageRatio: 'square', style: defaultStyle },
        render: view('hero'),
      },
      benefits: {
        label: 'Переваги',
        fields: {
          title: { type: 'text', label: 'Заголовок блоку' },
          items: {
            type: 'array',
            label: 'Переваги',
            arrayFields: { title: { type: 'text', label: 'Назва' }, text: { type: 'textarea', label: 'Опис' } },
            defaultItemProps: { title: 'Нова перевага', text: 'Коротко і конкретно.' },
            getItemSummary: (item: { title?: string }) => item.title || 'Перевага',
          },
          ...styleFields(),
        },
        defaultProps: { title: 'Чому це зручно', items: [{ title: 'Перша перевага', text: 'Коротко і конкретно.' }], style: defaultStyle },
        render: view('benefits'),
      },
      reviews: {
        label: 'Відгуки',
        fields: {
          title: { type: 'text', label: 'Заголовок блоку' },
          items: {
            type: 'array',
            label: 'Відгуки',
            arrayFields: { name: { type: 'text', label: 'Імʼя, місто' }, text: { type: 'textarea', label: 'Текст' } },
            defaultItemProps: { name: 'Імʼя, місто', text: 'Текст відгуку.' },
            getItemSummary: (item: { name?: string }) => item.name || 'Відгук',
          },
          ...styleFields(),
        },
        defaultProps: { title: 'Відгуки покупців', items: [{ name: 'Олена, Київ', text: 'Текст відгуку.' }], style: defaultStyle },
        render: view('reviews'),
      },
      faq: {
        label: 'Питання й відповіді',
        fields: {
          title: { type: 'text', label: 'Заголовок блоку' },
          items: {
            type: 'array',
            label: 'Питання',
            arrayFields: { q: { type: 'text', label: 'Питання' }, a: { type: 'textarea', label: 'Відповідь' } },
            defaultItemProps: { q: 'Нове питання?', a: 'Відповідь.' },
            getItemSummary: (item: { q?: string }) => item.q || 'Питання',
          },
          ...styleFields(),
        },
        defaultProps: { title: 'Часті запитання', items: [{ q: 'Як відбувається оплата?', a: 'Оплата при отриманні.' }], style: defaultStyle },
        render: view('faq'),
      },
      timer: {
        label: 'Таймер акції',
        fields: {
          title: { type: 'text', label: 'Заголовок' },
          text: { type: 'textarea', label: 'Підпис' },
          endsAt: dateTimeField('Акція діє до'),
          expiredText: { type: 'text', label: 'Текст після завершення' },
          ...styleFields(),
        },
        defaultProps: { title: 'Акція діє до', text: '', endsAt: inDays(7), expiredText: 'Акція завершена', style: defaultStyle },
        render: view('timer'),
      },
      gallery: {
        label: 'Галерея',
        fields: {
          title: { type: 'text', label: 'Заголовок' },
          columns: { type: 'radio', label: 'Колонок на компʼютері', options: opts([['2', '2'], ['3', '3']]) },
          items: {
            type: 'array',
            label: 'Картинки',
            arrayFields: { image: imageField('Картинка') },
            defaultItemProps: { image: '' },
            getItemSummary: (item: { image?: string }) => (item.image ? 'Картинка' : 'Порожня картинка'),
          },
          ...styleFields(),
        },
        defaultProps: { title: 'Фото товару', columns: '3', items: [{ image: '' }, { image: '' }, { image: '' }], style: defaultStyle },
        render: view('gallery'),
      },
      video: {
        label: 'Відео',
        fields: {
          title: { type: 'text', label: 'Заголовок' },
          url: { type: 'text', label: 'Посилання (YouTube, Vimeo або .mp4)' },
          ...styleFields(),
        },
        defaultProps: { title: 'Дивіться відео', url: '', style: defaultStyle },
        render: view('video'),
      },
      comparison: {
        label: 'Порівняння',
        fields: {
          title: { type: 'text', label: 'Заголовок' },
          ourLabel: { type: 'text', label: 'Назва колонки (ваш товар)' },
          otherLabel: { type: 'text', label: 'Назва колонки (аналоги)' },
          rows: {
            type: 'array',
            label: 'Рядки',
            arrayFields: {
              feature: { type: 'text', label: 'Параметр' },
              ours: { type: 'radio', label: 'У вашого товару', options: opts([['Так', 'yes'], ['Ні', 'no']]) },
              other: { type: 'radio', label: 'В аналогів', options: opts([['Так', 'yes'], ['Ні', 'no']]) },
            },
            defaultItemProps: { feature: 'Новий параметр', ours: 'yes', other: 'no' },
            getItemSummary: (item: { feature?: string }) => item.feature || 'Рядок',
          },
          ...styleFields(),
        },
        defaultProps: {
          title: 'Чим ми кращі', ourLabel: 'Наш товар', otherLabel: 'Аналоги',
          rows: [{ feature: 'Параметр 1', ours: 'yes', other: 'no' }, { feature: 'Параметр 2', ours: 'yes', other: 'no' }],
          style: defaultStyle,
        },
        render: view('comparison'),
      },
      text: {
        label: 'Текст',
        fields: {
          title: { type: 'text', label: 'Заголовок' },
          body: { type: 'textarea', label: 'Текст (абзаци з нового рядка)' },
          ...styleFields(),
        },
        defaultProps: { title: 'Про товар', body: 'Перший абзац.\nДругий абзац.', style: defaultStyle },
        render: view('text'),
      },
      cta: {
        label: 'Кнопка замовлення',
        fields: {
          title: { type: 'text', label: 'Заголовок' },
          cta: { type: 'text', label: 'Текст кнопки' },
          ...styleFields(),
        },
        defaultProps: { title: 'Готові замовити?', cta: 'Замовити', style: defaultStyle },
        render: view('cta'),
      },
      image: {
        label: 'Картинка',
        fields: {
          image: imageField('Картинка'),
          width: { type: 'radio', label: 'Ширина', options: opts([['У рамках сторінки', 'page'], ['На всю ширину екрана', 'full']]) },
          ratio: { type: 'select', label: 'Пропорції', options: opts([['Оригінальні', 'auto'], ['Квадрат', 'square'], ['4:3', '4-3'], ['16:9 (широка)', '16-9'], ['21:9 (панорама)', '21-9']]) },
          fit: { type: 'radio', label: 'Як вписати у пропорції', options: opts([['Обрізати по краях', 'cover'], ['Показати цілком', 'contain']]) },
          rounded: { type: 'radio', label: 'Закруглені кути', options: opts([['Так', 'yes'], ['Ні', 'no']]) },
          alt: { type: 'text', label: 'Опис для пошуковиків (alt)' },
          caption: { type: 'text', label: 'Підпис під картинкою' },
          ...styleFields(),
        },
        defaultProps: { image: '', width: 'full', ratio: 'auto', fit: 'cover', rounded: 'yes', alt: '', caption: '', style: defaultStyle },
        render: view('image'),
      },
      columns: {
        label: 'Колонки (контейнер)',
        fields: {
          layout: { type: 'select', label: 'Розкладка', options: opts([['1 колонка', '1'], ['2 колонки', '2'], ['3 колонки', '3'], ['Вузька + широка', '1-2'], ['Широка + вузька', '2-1']]) },
          gap: { type: 'select', label: 'Відстань між колонками', options: opts([['Мала', 'small'], ['Звичайна', 'normal'], ['Велика', 'large']]) },
          valign: { type: 'radio', label: 'Вирівнювання по вертикалі', options: opts([['Зверху', 'start'], ['По центру', 'center']]) },
          col1: { type: 'slot', disallow: ['columns'] },
          col2: { type: 'slot', disallow: ['columns'] },
          col3: { type: 'slot', disallow: ['columns'] },
          ...styleFields(),
        },
        defaultProps: { layout: '2', gap: 'normal', valign: 'start', col1: [], col2: [], col3: [], style: defaultStyle },
        render: ColumnsPreview,
      },
      order: {
        label: 'Форма замовлення',
        fields: {
          title: { type: 'text', label: 'Заголовок блоку' },
          cta: { type: 'text', label: 'Текст кнопки' },
          ...styleFields(),
        },
        defaultProps: { title: 'Залиште заявку', cta: 'Замовити', style: defaultStyle },
        render: view('order'),
      },
    },
  }
}
