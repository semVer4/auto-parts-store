# Изображения интерфейса демомагазина

Метод: встроенный `image_gen`, отдельный вызов и одна генерация на каждый сюжет. Не API/CLI; ключи API не использовались.
Фотографии иллюстративные: нет реального автомобиля продавца или фотографии точного SKU. Товарные изображения показывают категорию детали и не подтверждают внешний вид указанного артикула.
WebP созданы имеющимся в проекте Sharp, quality 88, effort 6, без изменения размеров или композиции. Все PNG-исходники хранятся в `design-assets/source`, вне публичного каталога.
Для семи новых товарных изображений запрашивался квадрат около 1024 px; сохранён фактически возвращённый инструментом размер 1254 × 1254 без ресайза. Каждый результат просмотрен: комплектность, целый объект, реалистичность материалов, отсутствие надписей и единый студийный фон.

История: на раннем этапе `public/img/product-5.svg`, простая кодовая иллюстрация диска, исправляла ошибочную иллюстрацию с подписью «Тормозные колодки». Теперь все восемь товаров используют отдельные сгенерированные фотографии; старые SVG не подключены к товарам.

| Назначение | Сайт | Оригинал | Размер | WebP, байт |
| --- | --- | --- | --- | ---: |
| Hero | `public/img/editorial-car-hero.webp` | `design-assets/source/editorial-car-hero.png` | 1536 × 1024 | 233 558 |
| Колодки, товар 1 | `public/img/editorial-brake-pads.webp` | `design-assets/source/editorial-brake-pads.png` | 1254 × 1254 | 197 544 |
| Масляный фильтр, товар 2 | `public/img/editorial-oil-filter.webp` | `design-assets/source/editorial-oil-filter.png` | 1254 × 1254 | 109 780 |
| Моторное масло, товар 3 | `public/img/editorial-motor-oil.webp` | `design-assets/source/editorial-motor-oil.png` | 1254 × 1254 | 140 668 |
| Аккумулятор, товар 4 | `public/img/editorial-battery.webp` | `design-assets/source/editorial-battery.png` | 1254 × 1254 | 76 752 |
| Тормозной диск, товар 5 | `public/img/editorial-brake-disc.webp` | `design-assets/source/editorial-brake-disc.png` | 1254 × 1254 | 144 728 |
| Воздушный фильтр, товар 6 | `public/img/editorial-air-filter.webp` | `design-assets/source/editorial-air-filter.png` | 1254 × 1254 | 119 036 |
| Свечи, товар 7 | `public/img/editorial-spark-plugs.webp` | `design-assets/source/editorial-spark-plugs.png` | 1254 × 1254 | 122 842 |
| Амортизатор, товар 8 | `public/img/editorial-shock-absorber.webp` | `design-assets/source/editorial-shock-absorber.png` | 1254 × 1254 | 51 002 |

## Hero: промпт

```text
Use case: photorealistic-natural
Asset type: automotive shop website hero photograph, landscape 3:2 composition
Primary request: a beautiful natural editorial photograph of a single unbranded red late-1980s sports coupe, viewed from the front three-quarter angle.
Scene/backdrop: quiet spacious garage studio with a warm neutral plaster wall and gently worn concrete floor; soft daylight entering through large windows.
Subject: a low classic coupe with an authentic late-1980s silhouette, tactile red painted metal, black window trim and realistic wheels; no badges, no branding and no license plate lettering.
Style/medium: photorealistic motoring magazine photography, real camera feel, natural color balance and subtle film texture; calm, confident and premium.
Composition/framing: landscape 3:2 image, whole car visible and large in frame, centered with comfortable space around every edge so the photograph remains strong in a mobile crop; low eye-level camera, modest focal length, convincing perspective.
Lighting/mood: soft window daylight, restrained true reflections on paint and glass, warm neutral background, gentle realistic shadows.
Materials/textures: tangible paint, metal, rubber and glass, subtle surface imperfections and concrete grain.
Constraints: exactly one car; no people; no text, logos, fake brands or watermark.
Avoid: glossy 3D render, illustration, artificial AI poster aesthetics, futuristic styling, neon, dramatic smoke, excessive saturation, extreme reflections, large empty text area, cropped wheels or bumpers.
```

## Фильтр: промпт

```text
Use case: product-mockup
Asset type: square automotive store product-card photograph
Primary request: a clean, photorealistic studio product photograph of one generic automotive spin-on oil filter.
Scene/backdrop: seamless warm off-white background, soft subtle contact shadow.
Subject: a single short black cylindrical metal oil-filter canister, unbranded, presented at a three-quarter angle lying slightly tilted so both the matte black canister body and the gold-colored threaded metal base are clearly visible; mechanically plausible oil-filter construction with one central threaded opening and evenly spaced inlet holes around it, black rubber gasket seated around the base perimeter.
Style/medium: precise professional studio product photography, tactile real metal, restrained realistic highlights and natural color.
Composition/framing: square image, complete filter centered, comfortable clean margins, large enough to read clearly at small product-card size.
Lighting/mood: soft diffused studio light, gentle shadow, neutral premium catalog mood.
Constraints: exactly one filter, no packaging, no people, no text, logos, labels, fake brands or watermark. Demonstrative generic product art, not an exact SKU photograph.
Avoid: illustration, 3D rendering appearance, exaggerated reflections, clutter, extra parts, malformed threads, repeated holes, cropped object.
```

## Колодки, товар 1: промпт

```text
Use case: product-mockup
Asset type: square automotive store product-card photograph
Primary request: clean photorealistic studio product photography for a cohesive automotive parts catalog.
Scene/backdrop: seamless warm off-white background with a soft subtle contact shadow, no props.
Subject: Exactly four automotive front disc brake pads forming one complete set, arranged in a tidy shallow staggered group with each complete pad separately visible. Real dark charcoal friction compound with fine grain on stamped black steel backing plates, plausible mounting ears and clean new part edges; two pads reveal their friction faces and two reveal their backing plates.
Style/medium: precise professional studio product photography; tactile real materials, restrained natural highlights, crisp useful detail and neutral color balance.
Composition/framing: square image, approximately 1024 by 1024 pixels; three-quarter product view; complete object or complete set centered with comfortable clean margins, large enough to read clearly in a small product card.
Lighting/mood: soft diffused studio light from above-left, gentle realistic shadow, calm premium catalog mood.
Constraints: only the specified product or set; no packaging, people, text, labels, logos, lettering, fake brands or watermark. Generic demonstrative product art, not an exact SKU photograph.
Avoid: illustration, glossy 3D-render appearance, exaggerated reflections, clutter, props, extra parts, cropped edges or mechanically impossible geometry.
```

## Моторное масло, товар 3: промпт

```text
Use case: product-mockup
Asset type: square automotive store product-card photograph
Primary request: clean photorealistic studio product photography for a cohesive automotive parts catalog.
Scene/backdrop: seamless warm off-white background with a soft subtle contact shadow, no props.
Subject: One generic 4-litre automotive motor-oil jug, a new graphite-grey moulded plastic canister with an integrated carry handle and a closed black screw cap. Authentic oil-container proportions, subtle moulding seams and fine plastic texture, completely blank sides with no label or embossed lettering.
Style/medium: precise professional studio product photography; tactile real materials, restrained natural highlights, crisp useful detail and neutral color balance.
Composition/framing: square image, approximately 1024 by 1024 pixels; three-quarter product view; complete object or complete set centered with comfortable clean margins, large enough to read clearly in a small product card.
Lighting/mood: soft diffused studio light from above-left, gentle realistic shadow, calm premium catalog mood.
Constraints: only the specified product or set; no packaging, people, text, labels, logos, lettering, fake brands or watermark. Generic demonstrative product art, not an exact SKU photograph.
Avoid: illustration, glossy 3D-render appearance, exaggerated reflections, clutter, props, extra parts, cropped edges or mechanically impossible geometry.
```

## Аккумулятор, товар 4: промпт

```text
Use case: product-mockup
Asset type: square automotive store product-card photograph
Primary request: clean photorealistic studio product photography for a cohesive automotive parts catalog.
Scene/backdrop: seamless warm off-white background with a soft subtle contact shadow, no props.
Subject: One new generic automotive 12-volt starter battery, a compact heavy rectangular dark graphite plastic case with a black lid, integrated carrying handle folded neatly down and two realistic metal terminal posts, one with a small red protective accent and the other black. Completely blank casing without labels or markings.
Style/medium: precise professional studio product photography; tactile real materials, restrained natural highlights, crisp useful detail and neutral color balance.
Composition/framing: square image, approximately 1024 by 1024 pixels; three-quarter product view; complete object or complete set centered with comfortable clean margins, large enough to read clearly in a small product card.
Lighting/mood: soft diffused studio light from above-left, gentle realistic shadow, calm premium catalog mood.
Constraints: only the specified product or set; no packaging, people, text, labels, logos, lettering, fake brands or watermark. Generic demonstrative product art, not an exact SKU photograph.
Avoid: illustration, glossy 3D-render appearance, exaggerated reflections, clutter, props, extra parts, cropped edges or mechanically impossible geometry.
```

## Тормозной диск, товар 5: промпт

```text
Use case: product-mockup
Asset type: square automotive store product-card photograph
Primary request: clean photorealistic studio product photography for a cohesive automotive parts catalog.
Scene/backdrop: seamless warm off-white background with a soft subtle contact shadow, no props.
Subject: One new automotive ventilated front brake disc rotor, realistic machined silver cast iron, circular friction ring with subtle concentric machining lines, central raised hub and five evenly spaced bolt holes. The substantial disc is slightly tilted in a plausible stable resting position to reveal the vented edge with internal cooling channels. Plain undrilled and unslotted friction faces.
Style/medium: precise professional studio product photography; tactile real materials, restrained natural highlights, crisp useful detail and neutral color balance.
Composition/framing: square image, approximately 1024 by 1024 pixels; three-quarter product view; complete object or complete set centered with comfortable clean margins, large enough to read clearly in a small product card.
Lighting/mood: soft diffused studio light from above-left, gentle realistic shadow, calm premium catalog mood.
Constraints: only the specified product or set; no packaging, people, text, labels, logos, lettering, fake brands or watermark. Generic demonstrative product art, not an exact SKU photograph.
Avoid: illustration, glossy 3D-render appearance, exaggerated reflections, clutter, props, extra parts, cropped edges or mechanically impossible geometry.
```

## Воздушный фильтр, товар 6: промпт

```text
Use case: product-mockup
Asset type: square automotive store product-card photograph
Primary request: clean photorealistic studio product photography for a cohesive automotive parts catalog.
Scene/backdrop: seamless warm off-white background with a soft subtle contact shadow, no props.
Subject: One new rectangular automotive panel air filter, finely pleated warm cream filter paper in a dark orange rubber perimeter frame, a shallow rectangular form at a three-quarter angle so the pleats, thickness and full frame are clearly visible. Realistic tightly spaced straight pleats and tangible rubber texture.
Style/medium: precise professional studio product photography; tactile real materials, restrained natural highlights, crisp useful detail and neutral color balance.
Composition/framing: square image, approximately 1024 by 1024 pixels; three-quarter product view; complete object or complete set centered with comfortable clean margins, large enough to read clearly in a small product card.
Lighting/mood: soft diffused studio light from above-left, gentle realistic shadow, calm premium catalog mood.
Constraints: only the specified product or set; no packaging, people, text, labels, logos, lettering, fake brands or watermark. Generic demonstrative product art, not an exact SKU photograph.
Avoid: illustration, glossy 3D-render appearance, exaggerated reflections, clutter, props, extra parts, cropped edges or mechanically impossible geometry.
```

## Свечи, товар 7: промпт

```text
Use case: product-mockup
Asset type: square automotive store product-card photograph
Primary request: clean photorealistic studio product photography for a cohesive automotive parts catalog.
Scene/backdrop: seamless warm off-white background with a soft subtle contact shadow, no props.
Subject: Exactly four new automotive spark plugs arranged in a tidy diagonal parallel group, each complete plug visible and separate. White ribbed ceramic insulators, realistic polished hexagonal steel bodies, accurately threaded lower shafts and small curved ground electrodes. No printing on the ceramic or metal.
Style/medium: precise professional studio product photography; tactile real materials, restrained natural highlights, crisp useful detail and neutral color balance.
Composition/framing: square image, approximately 1024 by 1024 pixels; three-quarter product view; complete object or complete set centered with comfortable clean margins, large enough to read clearly in a small product card.
Lighting/mood: soft diffused studio light from above-left, gentle realistic shadow, calm premium catalog mood.
Constraints: only the specified product or set; no packaging, people, text, labels, logos, lettering, fake brands or watermark. Generic demonstrative product art, not an exact SKU photograph.
Avoid: illustration, glossy 3D-render appearance, exaggerated reflections, clutter, props, extra parts, cropped edges or mechanically impossible geometry.
```

## Амортизатор, товар 8: промпт

```text
Use case: product-mockup
Asset type: square automotive store product-card photograph
Primary request: clean photorealistic studio product photography for a cohesive automotive parts catalog.
Scene/backdrop: seamless warm off-white background with a soft subtle contact shadow, no props.
Subject: One new generic automotive front suspension damper strut without a coil spring, shown diagonally within the square frame with the complete object visible. Black cylindrical steel damper body, a round lower spring perch, physically plausible welded lower mounting brackets and a straight bright chrome piston rod with a threaded upper mounting end. Authentic mechanical proportions and subtle powder-coated metal texture.
Style/medium: precise professional studio product photography; tactile real materials, restrained natural highlights, crisp useful detail and neutral color balance.
Composition/framing: square image, approximately 1024 by 1024 pixels; three-quarter product view; complete object or complete set centered with comfortable clean margins, large enough to read clearly in a small product card.
Lighting/mood: soft diffused studio light from above-left, gentle realistic shadow, calm premium catalog mood.
Constraints: only the specified product or set; no packaging, people, text, labels, logos, lettering, fake brands or watermark. Generic demonstrative product art, not an exact SKU photograph.
Avoid: illustration, glossy 3D-render appearance, exaggerated reflections, clutter, props, extra parts, cropped edges or mechanically impossible geometry.
```
