# Dialogue engine audit and main menu pass

Дата: 2026-04-13

## Що було перевірено

- runtime логіка діалогів
- reveal / auto / paging
- взаємодія діалогу з модалками
- choice flow у `DialogueScreen`
- стартовий `MainMenuScreen`

## Висновок по діалоговому двигуну

Базовий контракт двигуна зараз коректний:

- authored choice nodes доходять до UI без логіки в React
- пагінація довгих реплік іде через runtime, а не через ручне різання контенту
- choice list з'являється тільки після повного reveal поточної сторінки
- `advanceOrReveal()` лишається єдиною точкою основного поступу репліки

Слабке місце було не в самій структурі node/choice flow, а в побічних станах оболонки:

- глобальні гарячі клавіші могли просувати діалог, коли поверх був відкритий modal
- reveal/auto timers не зупинялись достатньо жорстко при відкритті modal
- старі тести перевіряли вже неактуальні choice texts і word-safe припущення

Це виправлено.

## Прийняті рішення

### 1. Modal-safe dialogue runtime

Коли відкритий будь-який modal, діалог:

- не реагує на глобальний advance hotkey
- не крутить reveal timer
- не крутить auto-advance timer

Це зафіксовано як правильний контракт shell/runtime інтеграції.

Ключові файли:

- `src/engine/stores/UIStore.ts`
- `src/engine/stores/DialogueStore.ts`
- `src/ui/screens/DialogueScreen.tsx`

### 2. Reveal іде по grapheme flow, а не по цілих словах

Reveal більше не чекає, поки накопичиться повне слово. Текст іде дрібнішими кроками з короткими паузами на сильній пунктуації. Для VN це дає м'якший і менш механічний ритм.

Ключовий файл:

- `src/engine/systems/dialogue/dialogueReveal.ts`

### 3. Dialogue shell тепер має коротші й локалізовані utility labels

Верхній і нижній shell діалогу переведений на коротші українські лейбли:

- `Сцена`
- `Голос`
- `Стор.`
- `Авто`
- `Бачене`
- `Лог`
- `Сейви`
- `Кодекс`
- `Налашт.`
- `Сховати`
- `Стати`

Це зменшує відчуття debug/admin panel і трохи розвантажує footer.

Ключовий файл:

- `src/ui/screens/DialogueScreen.tsx`

## Висновок по UI діалогу

Поточний `DialogueScreen` після цього проходу уже ближчий до правильного VN shell:

- сторінки не повинні скролитись через нижній control rail
- choice cards не змішуються з текстовою панеллю
- header/footer лишаються службовими, але вже менше кричать
- fullscreen transition veil для `fade` і `dissolve` став значно м'якшим, без майже чорного blink overlay

Що ще не ідеально:

- на малих width utility controls все ще можуть ставати щільними
- частина інших screen/modals у проекті досі має англомовні службові назви
- placeholder portraits і backgrounds тимчасові

## Висновок по головному меню

`MainMenuScreen` переведений у immersive-подачу:

- забрана важка рамка shell
- меню зібране праворуч
- ліворуч стоїть heroine placeholder
- фон — окремий blurred background image

Це правильний напрям для гри: меню більше не виглядає як системний launcher усередині AppShell.

Ключові файли:

- `src/App.tsx`
- `src/ui/screens/MainMenuScreen.tsx`

## Що з placeholder / preset шарами

Ні, цей шар ще не закритий повністю.

У проекті все ще активні:

- `src/content/shared/placeholders/menu/*`
- `src/content/shared/placeholders/portraits/*`
- `src/content/shared/placeholders/backgrounds/*`
- `src/ui/components/dialogue/dialoguePlaceholderAssets.ts`
- `placeholderPreset` для outfit silhouettes Мірелли

Тобто зараз у нас уже не сирий хаос, але ще не повна заміна всіх тимчасових пресетів на фінальний арт.

## Що вже готово до тесту

- старт у `mainMenu` без framed shell
- старт нової гри з нового меню
- dialogue advance / reveal / choice flow
- відкриття backlog / saves / library без зламу dialogue timers
- vertical slice від прологу до першого бою

## Перевірка

Під `Node 22.12.0` зелене:

- `npx -y node@22.12.0 node_modules\\vitest\\vitest.mjs run`
- `npx -y node@22.12.0 node_modules\\vite\\bin\\vite.js build`

Результат на момент цього проходу:

- `46/46` test files
- `225/225` tests
- production build проходить

## Ризики, що лишились

- великі PNG/JPG-ассети все ще роздувають bundle
- main menu heroine/background поки тимчасові заглушки
- battle/world/codex ще треба підтягнути до того ж рівня UI-consistency, що й dialogue shell

## Наступна фаза

- окремий asset cleanup pass для menu/dialogue placeholders
- ще один dialogue UX pass уже по живому відчуттю: spacing, timing, reduced utility weight
- системне добивання mixed-language UI в інших екранах
