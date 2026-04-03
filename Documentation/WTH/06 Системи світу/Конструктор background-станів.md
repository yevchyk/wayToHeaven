---
type: system
status: active
tags:
  - system
  - backgrounds
  - storybook
---

# Конструктор background-станів

Background authoring у chapter 1 більше не спирається на один довгий prompt на кожну сцену.

Канонічна модель тепер така:

- `master location`
- `room / zone`
- `scene effect`
- `general vibe`
- `situation`
- `style pack`
- `variant`
- `scene preset`

## Для чого це потрібно

Одна й та сама локація має лишатися впізнаваною між сценами.

Ми не хочемо щоразу вигадувати нове місце з нуля.

Ми хочемо:

- взяти [[Маєток Торнів]]
- відкрити конкретну кімнату
- змінити її стан через конкретні scene effects
- зберегти географію, архітектуру і візуальну памʼять місця

## Що означає кожен шар

### `master location`

Це джерело правди про саме місце.

Для chapter 1 головні приклади:

- `Thorn Estate`
- `Thorn Mining Complex`
- `Black River Underworks`
- `Ashen Reach`
- `Caravan Road To Hugen-Um`

`master location` тримає:

- загальну архітектуру
- матеріали
- масштаб
- соціальний клас простору
- continuity rules

### `room / zone`

Це підпростір усередині master location.

Для `Thorn Estate` ми вже тримаємо окремо:

- `Mirella Room`
- `Dining Hall`
- `Grand Hall`
- `Orangery`
- `Estate Corridors`
- `East Platform`
- `Upper Gallery`
- `Ritual And Private Function Rooms`
- `Training Yard`

Одна і та сама кімната може мати кілька background-станів, але все ще лишатися тією самою кімнатою.

### `general vibe`

Це емоційний режим світу, а не конкретна подія.

Приклади:

- `Aristocratic Decay`
- `Household Tension`
- `House Under Assault`
- `Industrial Sacred`
- `Ashen City Suspicion`
- `Road-Worn Survival`

### `situation`

Це поточний стан простору в історії.

Приклади:

- `Formal Morning`
- `Evening Return`
- `Private Fracture`
- `Night Hush`
- `Ritual Preparation`
- `Open Assault`
- `Sealed Aftermath`
- `Captivity And Awakening`

Саме `situation` дозволяє не вигадувати нову локацію, а модифікувати ту саму.

### `scene effect`

Це швидкий presentation-шар поверх уже впізнаваного простору.

Він потрібен не для зміни самої географії, а для швидкого переходу між станами кадру.

Приклади:

- `blood border`
- `shadow veil`
- `smoke haze`
- `cold morning spill`
- `moon slice`

Для [[Їдальня маєтку Торнів]] canonical use такий:

- чистий сніданковий стан: `cold morning spill`
- тиснучий приватний стан: `shadow veil`
- атакований або післяударний стан: `blood border` + `smoke haze`

`scene effect` має бути runtime-friendly:

- у Storybook він дає швидке превʼю і prompt block
- у runtime він переходить у `backgroundStyle`

### `style pack`

Це мова генерації.

Вона не міняє канонічну географію.

Вона міняє:

- painterly level
- lighting bias
- readability
- negative prompt

### `variant`

Це shot logic:

- `Wide Establishing`
- `Intimate Interior`
- `Corridor Depth`
- `Balcony Outlook`

## Приклад на нашому прологу

Ми не authorимо окремо:

- “їдальня вранці”
- “їдальня вночі”
- “їдальня під час штурму”

як три різні світи.

Ми authorимо:

- `master location`: `Thorn Estate`
- `room`: `Dining Hall`

А потім міняємо:

- `scene effect`: `cold morning spill`
- `situation`: `Formal Morning`
- `scene effect`: `shadow veil`
- `situation`: `Night Hush`
- `scene effect`: `blood border` + `smoke haze`
- `situation`: `Open Assault`

і за потреби:

- `general vibe`
- `style pack`
- `variant`

Тоді простір лишається одним і тим самим, але переходить між станами.

## `scene preset`

`scene preset` це канонічна стартова точка з уже існуючих runtime-сцен.

Наприклад:

- `Breakfast In The Dining Hall`
- `Orangery Fracture`
- `Main Corridor Under Assault`
- `Prison Fall Cell`
- `Temple Exit Plaza`
- `Caravan Ambush Break`

Preset потрібен не для того, щоб заморозити сцену.

Він потрібен, щоб:

- стартувати з реального chapter 1 beat
- бачити, який background уже стоїть у runtime
- потім варіювати той самий простір далі

## Storybook роль

`Location Backdrop/Workbench` тепер має два різні режими:

- `Location State Prompt Composer`
- runtime reference grids

`Location State Prompt Composer`:

- збирає prompt з блоків, але primary flow тепер іде через `room / zone` + `scene effects`
- дозволяє відкривати master location і її room/state combinations
- дає `runtime style token`, який можна переносити в `backgroundStyle`
- дає copy окремо для:
  - full prompt
  - short prompt
  - negative prompt
  - vibe block
  - location block
  - scene effects block
  - situation block
  - style block
  - variant block

Runtime reference grids:

- показують, які `backgroundId` уже реально стоять у content-файлах
- не є source of truth для самого prompt authoring

## Source of truth в коді

Основні файли:

- `src/content/storybook/backgroundProfiles/chapter1BackgroundPromptWorkbench.ts`
- `src/engine/types/backgroundAuthoring.ts`
- `src/engine/utils/buildBackgroundPromptRecipe.ts`
- `src/ui/components/location-backdrop/BackgroundPromptWorkbench.tsx`
- `src/ui/components/narrative/narrativeBackdropEffects.tsx`

## Наслідок для подальшого authoring

Коли додається нова background-сцена, потрібно не тільки підкласти asset.

Потрібно вирішити:

1. До якої `master location` вона належить.
2. Який це `room / zone`.
3. Який `scene effect` потрібен поверх цієї кімнати.
4. Який `situation` вона виражає.
5. Який `general vibe` потрібен.
6. Який `style pack` доречний.
7. Який `variant` найкраще читає цей простір.

Якщо новий кадр не вкладається в жодну існуючу master location або room, це сигнал не до нового випадкового prompt-а, а до розширення системи.
