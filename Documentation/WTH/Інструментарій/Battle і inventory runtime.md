# Battle і inventory runtime

Цей документ фіксує поточний runtime-контракт для бою, скілів і використання предметів після квітневого stabilization pass.

## 1. Скіли

- Джерело істини для бойових скілів: `src/content/skills/index.ts`
- Поточний runtime читає skill data через `GameRootStore.skillRegistry`
- Бойовий resolver більше не виводить `damageKind` через substring-евристику на кшталт `fire` або `poison`
- `SkillData` тепер задає:
  - `damageKind`
  - `targetScope`
  - `scalingStat`
  - `basePower`
  - `manaCost` за потреби

Мінімальний поточний набір:
- `basic-attack`
- `firebolt`

## 2. Інвентарний таргетинг

`ItemData.targetScope` є головною точкою істини для того, як предмет має обирати ціль у runtime.

Правила:
- `none` — предмет не потребує юніта-цілі
- `self` — предмет іде в обраного персонажа в character menu або в поточного виконавця в бою
- `ally` — предмет вимагає явного ally target
- `enemy` — предмет вимагає явного enemy target

`InventoryStore.useItem()` тепер приймає `ItemUseOptions`:
- `sourceUnitId`
- `targetUnitId`

Для targetable ефектів (`restoreResource`, `addTag`, `removeTag`) runtime примусово переписує `targetScope` у `unit` і прокидає `targetId`.

Це означає:
- potion з character menu справді лікує відкритого персонажа, а не завжди лідера партії
- той самий предмет можна використовувати в battle runtime без окремого дубльованого пайплайну

## 3. Предмети в бою

Battle command shell тепер підтримує базовий `item` flow.

Поточна поведінка:
- у battle UI показується перший battle-relevant consumable
- `self` і `none` предмети можна прожимати одразу
- `ally` і `enemy` предмети входять у target-selection flow
- після успішного використання item:
  - оновлюється battle runtime
  - синхронізується party runtime
  - предмет списується з інвентаря
  - у combat log пишеться `action` і, якщо є ресурсний ефект, `heal/status` запис

Поточний вертикальний slice уже покриває `basic-potion` як бойовий self-heal.

## 4. Dialogue shell

Клік по всій `.dialogue-screen__panel` знову є канонічним способом:
- відкрити прихований текст
- перейти далі після reveal

Advance handler тепер висить на самому `ScreenFrame`, а не тільки на внутрішній grid-обгортці. Це прибирає регресію, коли тест або гравець клікав у панель, але advance не спрацьовував.

## 5. Verification

Після цього pass:
- `tsc -b` проходить
- `vitest` під `Node 22.12.0` проходить повністю
- `vite build` під `Node 22.12.0` проходить

Важливо:
- локальний `Node 21` і далі не є надійним рантаймом для `vite/vitest`
- для стабільних прогонів використовуємо `Node 22.12.0+`
