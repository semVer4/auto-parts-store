// Server-authoritative demo catalogue. Client-submitted prices are never trusted.
export const orderCatalogue = [
  { id: 1, title: 'Колодки тормозные передние, комплект 4 шт.', price: 2540, inStock: true },
  { id: 2, title: 'Фильтр масляный W 712/75', price: 480, inStock: true },
  { id: 3, title: 'Масло моторное Mobil 1 5W-40, 4 л', price: 3250, inStock: true },
  { id: 4, title: 'Аккумулятор Blue Dynamic 60 Ач', price: 6890, inStock: false },
  { id: 5, title: 'Диск тормозной вентилируемый, перед', price: 4120, inStock: true },
  { id: 6, title: 'Фильтр воздушный C 30 005', price: 760, inStock: true },
  { id: 7, title: 'Свечи зажигания, комплект 4 шт.', price: 1280, inStock: true },
  { id: 8, title: 'Амортизатор передний, газомасляный', price: 3540, inStock: false },
] as const
