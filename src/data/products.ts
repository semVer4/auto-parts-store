import { orderCatalogue } from '../shared/catalog'

export interface Product {
  id: number
  title: string
  brand: string
  article: string
  price: number
  oldPrice?: number
  category: string
  inStock: boolean
  image: string
  badge?: { text: string; type?: 'hit' }
  specs: { label: string; value: string }[]
}

// Базовый путь к ассетам (учитывает vite base './')
const img = (name: string) => `${import.meta.env.BASE_URL}img/${name}`

const productDetails: Product[] = [
  {
    id: 1,
    title: 'Колодки тормозные передние, комплект 4 шт.',
    brand: 'Bosch',
    article: '0986424815',
    price: 2540,
    oldPrice: 2990,
    category: 'Тормозная система',
    inStock: true,
    image: img('product-1.svg'),
    badge: { text: '-15%' },
    specs: [
      { label: 'Производитель', value: 'Bosch' },
      { label: 'Сторона установки', value: 'Передняя ось' },
      { label: 'Тип', value: 'Дисковые' },
      { label: 'Количество в комплекте', value: '4 шт.' },
      { label: 'Гарантия', value: '24 месяца' },
      { label: 'Страна производства', value: 'Германия' },
    ],
  },
  {
    id: 2,
    title: 'Фильтр масляный W 712/75',
    brand: 'Mann-Filter',
    article: 'W71275',
    price: 480,
    category: 'Масла и жидкости',
    inStock: true,
    image: img('product-2.svg'),
    specs: [
      { label: 'Производитель', value: 'Mann-Filter' },
      { label: 'Тип', value: 'Навинчиваемый' },
      { label: 'Высота', value: '79 мм' },
      { label: 'Гарантия', value: '12 месяцев' },
      { label: 'Страна производства', value: 'Германия' },
    ],
  },
  {
    id: 3,
    title: 'Масло моторное Mobil 1 5W-40, 4 л',
    brand: 'Mobil',
    article: '153264',
    price: 3250,
    category: 'Масла и жидкости',
    inStock: true,
    image: img('product-3.svg'),
    badge: { text: 'Хит', type: 'hit' },
    specs: [
      { label: 'Производитель', value: 'Mobil' },
      { label: 'Вязкость', value: '5W-40' },
      { label: 'Тип', value: 'Синтетическое' },
      { label: 'Объём', value: '4 л' },
      { label: 'Допуски', value: 'ACEA A3/B4' },
    ],
  },
  {
    id: 4,
    title: 'Аккумулятор Blue Dynamic 60 Ач',
    brand: 'Varta',
    article: '560408054',
    price: 6890,
    category: 'Электрика',
    inStock: false,
    image: img('product-4.svg'),
    specs: [
      { label: 'Производитель', value: 'Varta' },
      { label: 'Ёмкость', value: '60 Ач' },
      { label: 'Пусковой ток', value: '540 А' },
      { label: 'Полярность', value: 'Обратная' },
      { label: 'Гарантия', value: '24 месяца' },
    ],
  },
  {
    id: 5,
    title: 'Диск тормозной вентилируемый, перед',
    brand: 'Brembo',
    article: '09A41811',
    price: 4120,
    category: 'Тормозная система',
    inStock: true,
    image: img('product-1.svg'),
    specs: [
      { label: 'Производитель', value: 'Brembo' },
      { label: 'Тип', value: 'Вентилируемый' },
      { label: 'Диаметр', value: '288 мм' },
      { label: 'Сторона установки', value: 'Передняя ось' },
      { label: 'Гарантия', value: '24 месяца' },
    ],
  },
  {
    id: 6,
    title: 'Фильтр воздушный C 30 005',
    brand: 'Mann-Filter',
    article: 'C30005',
    price: 760,
    category: 'Двигатель',
    inStock: true,
    image: img('product-2.svg'),
    specs: [
      { label: 'Производитель', value: 'Mann-Filter' },
      { label: 'Тип', value: 'Панельный' },
      { label: 'Длина', value: '290 мм' },
      { label: 'Гарантия', value: '12 месяцев' },
    ],
  },
  {
    id: 7,
    title: 'Свечи зажигания, комплект 4 шт.',
    brand: 'NGK',
    article: 'BKR6E11',
    price: 1280,
    oldPrice: 1600,
    category: 'Двигатель',
    inStock: true,
    image: img('product-3.svg'),
    badge: { text: '-20%' },
    specs: [
      { label: 'Производитель', value: 'NGK' },
      { label: 'Зазор', value: '1.1 мм' },
      { label: 'Тип', value: 'Никелевые' },
      { label: 'Количество в комплекте', value: '4 шт.' },
    ],
  },
  {
    id: 8,
    title: 'Амортизатор передний, газомасляный',
    brand: 'KYB',
    article: '333832',
    price: 3540,
    category: 'Подвеска',
    inStock: false,
    image: img('product-4.svg'),
    specs: [
      { label: 'Производитель', value: 'KYB' },
      { label: 'Тип', value: 'Газомасляный' },
      { label: 'Сторона установки', value: 'Передняя ось' },
      { label: 'Гарантия', value: '12 месяцев' },
    ],
  },
]

export const products: Product[] = productDetails.map((details) => {
  const canonical = orderCatalogue.find((item) => item.id === details.id)
  if (!canonical) throw new Error(`Unknown product ${details.id}`)
  return { ...details, title: canonical.title, price: canonical.price, inStock: canonical.inStock }
})

export const categories = [
  { name: 'Двигатель', icon: '🔧' },
  { name: 'Тормозная система', icon: '🛑' },
  { name: 'Подвеска', icon: '⚙️' },
  { name: 'Электрика', icon: '🔌' },
  { name: 'Масла и жидкости', icon: '🛢️' },
  { name: 'Шины', icon: '🛞' },
]

export const navCategories = [
  'Двигатель',
  'Тормозная система',
  'Подвеска',
  'Электрика',
  'Кузов',
  'Масла и жидкости',
  'Шины и диски',
]

export const formatPrice = (value: number) => value.toLocaleString('ru-RU') + ' ₽'

export const getProduct = (id: number) => products.find((p) => p.id === id)
