# Battle progression proposal

Implementation status update, April 2026:

- the reference loop from this proposal is now partially implemented in live runtime
- direct-damage battle consumables are now live through the shared effect runner
- the current source of truth for shipped behavior is `Battle rewards and progression runtime.md`
- this document remains useful as a planning/history note for future expansion

Цей документ фіксує бажаний контракт для наступної фази бойової системи.

Він описує не поточний runtime, а цільову бойову петлю:
- цілісна тактична сутичка;
- статусні ефекти з шансами накладання;
- AoE-уміння;
- випадковий корисний лут;
- післябойовий прогрес персонажа.

## 1. Еталонний сценарій бою

Цільовий приклад:

1. У бою є `2 вовки` і `героїня`.
2. Ініціатива будує чергу; героїня ходить першою.
3. Гравець обирає конкретного вовка.
4. Героїня б’є простим ударом і знімає HP по формулі.
5. Вовки ходять окремо і атакують.
6. Їхні атаки мають шанс накласти `bleed`.
7. `Bleed` тикає на початку або в кінці ходу за чітким правилом системи.
8. Героїня може відкрити інвентар і використати предмет, який:
   - лікує;
   - очищає негативний статус.
9. Вороги продовжують бій простими ударами або простими навичками.
10. Героїня може використати закляття, що б’є всіх ворогів.
11. Після перемоги відкривається summary:
   - лут;
   - досвід;
   - рівень;
   - вибір покращення.

## 2. Що вже підтримує поточний engine

- кілька ворогів одного типу в одному бою;
- ініціативна черга;
- ручний вибір конкретної цілі для одиночної атаки;
- damage formula для attack / skill;
- random AI з вибором дії і цілі;
- статуси як runtime-об’єкти;
- бойове використання предметів;
- reward effects і reward items після перемоги.

Тобто бій виду `2 вовки -> target single wolf -> wolves answer -> use potion -> finish fight` уже дуже близький до реального вертикального slice.

## 3. Що ще НЕ закрито повністю

### 3.1 Шансові on-hit статуси

Поточний runtime вміє:
- зберігати статуси;
- тікати статусами;
- застосовувати статус у battle runtime.

Поточний runtime ще не має нормального authored contract для:
- `атака/скіли з шансом накласти bleed`;
- `onHitEffects`;
- `onCritEffects`;
- `statusChance`.

Правильний напрям:
- не прив’язувати це до enemy AI;
- авторити це в `SkillData`.

Рекомендований shape:

```ts
interface SkillStatusApplication {
  statusType: 'bleed' | 'poison' | 'burn' | 'stun';
  chance: number;
  duration?: number;
  potency?: number;
  stacks?: number;
}

interface SkillData {
  id: string;
  name: string;
  damageKind: DamageKind;
  targetPattern: 'single-enemy' | 'all-enemies' | 'single-ally' | 'self';
  scalingStat: 'physicalAttack' | 'magicalAttack';
  basePower?: number;
  manaCost?: number;
  statusApplications?: SkillStatusApplication[];
}
```

### 3.2 Очищення статусів предметом

Поточний runtime має:
- `restoreResource`
- `addTag`
- `removeTag`

Але ще не має окремого ефекту:
- `removeStatus`
- `cleanseNegativeStatuses`

Щоб `свята вода` могла і хілити, і знімати `bleed`, потрібен новий ефект:

```ts
interface RemoveStatusEffect {
  type: 'removeStatus';
  statusType: StatusType;
  targetScope: 'unit' | 'party' | 'player';
  targetId?: string;
}
```

Для більш гнучкого дизайну можна ще додати:

```ts
interface CleanseStatusesEffect {
  type: 'cleanseStatuses';
  category?: 'damage' | 'control' | 'support' | 'barrier';
  onlyNegative?: boolean;
  targetScope: 'unit' | 'party' | 'player';
  targetId?: string;
}
```

### 3.3 AoE-закляття

Поточний battle action model фактично одноцільовий.

Щоб закляття било всіх ворогів, треба ввести `targetPattern`, а resolver має вміти:
- будувати список цілей;
- окремо рахувати hit / crit / damage по кожній цілі;
- логувати це як multi-target action.

Мінімальний набір:
- `single-enemy`
- `all-enemies`
- `single-ally`
- `self`

### 3.4 Досвід, рівень, post-battle advancement

Поточний engine ще не має повної XP / level-up системи.

Потрібні окремі речі:
- `experience` і `level` у party-unit runtime;
- формула переходу на наступний рівень;
- after-battle reward summary store;
- тимчасовий `level-up choice screen`.

Рекомендований after-battle варіант:
- якщо юніт набрав рівень:
  - гравець обирає `2 покращення навички`
  - або `+5 HP`
  - або `+5 Mana`

Краще не вшивати це прямо в `BattleStore`.
Правильніше:
- `BattleStore` завершує encounter;
- `RewardResolutionSystem` збирає rewards;
- `ProgressionStore` вирішує level-up choices;
- UI показує окремий post-battle summary modal/screen.

## 4. Bleed timing

Зараз у runtime `bleed` тикає на `turnEnd`.

Для твого сценарію це треба зафіксувати окремо:
- або залишаємо `turnEnd` для всіх wound-like статусів;
- або переносимо `bleed` на `turnStart`, якщо хочемо відчуття "вийшов на свій хід уже під кровотечею".

Я рекомендую:
- `poison` -> `turnEnd`
- `burn` -> `turnEnd`
- `bleed` -> `turnStart`

Чому:
- bleed тоді відчувається різкіше і драматичніше;
- він психологічно краще працює саме як “зайшов у свій хід уже з втратою”.

## 5. Лут: напрям

Лут після бою не повинен бути тільки:
- золото;
- абстрактний ресурс;
- випадковий сміттєвий дроп.

Для `WayToHeaven` найкращий напрям:
- корисний, тілесно-відчутний, world-grounded лут;
- лут, який пов’язаний з виживанням, алхімією, ритуалом і брудною практикою дороги.

### 5.1 Гербарій

Окремий клас матеріалів:
- `гербарій`
- це не витратники прямо зараз;
- це сировина для покращень, настоянок, курива, мазей, пахощів, ритуальних сумішей.

Рекомендовані перші herbarium-ресурси:
- `blood-moss`
  - мох, що тягне тепло з каменю; база для зупинки крові або темних припарок
- `wolf-thyme`
  - гірка степова трава; база для мисливських мазей і стимулів
- `ash-reed`
  - сухий попелястий очерет; дешева основа для диму, порошків і запалювальних сумішей
- `grave-bloom`
  - рідкісна квітка для очищення, ритуалів і небезпечних настоїв
- `salt-thorn`
  - їдкий колючий корінь; підходить для антисептичних і болючих сумішей

### 5.2 Корисний бойовий лут

Окремий клас — `usable road loot`.

Перші нормальні варіанти:
- `rough bandage`
  - слабкий heal
  - або знімає `bleed`
- `holy water`
  - heal + cleanse негативного статусу
- `field ration`
  - не бойовий heal, але закриває hunger / дає невеликий morale bump
- `pitch bomb`
  - кидається у ворога або всіх ворогів
  - може накладати `burn`
- `chalk salt packet`
  - слабкий anti-corruption / anti-undead / anti-curse утилітарний предмет
- `stimulant tincture`
  - відновлює mana або дає короткий initiative boost

## 6. Рекомендований loot table для вовків

Для звичайного encounter типу `2 вовки`:

- guaranteed:
  - `wolf-thyme` x1
- common roll:
  - `blood-moss` x1
  - `rough bandage` x1
  - `field ration` x1
- uncommon roll:
  - `pitch bomb` x1
  - `stimulant tincture` x1

Логіка:
- звірі самі не носять зілля, але бій у диких місцях може давати не тільки “зі шкури”, а й roadside salvage / stash / hunting remains
- тобто reward table може бути не тільки від ворога, а від `encounter context`

## 7. Як це має лягти в код

### Фаза A

- `SkillData.targetPattern`
- `SkillData.statusApplications`
- `removeStatus` effect
- `holy-water` item
- `rough-bandage` item
- `pitch-bomb` item

### Фаза B

- `lootTableRegistry`
- `LootTableData`
- `RewardResolutionSystem`
- encounter-context rewards
- herbarium item family

### Фаза C

- `experience`
- `level-up thresholds`
- `ProgressionStore`
- `post-battle summary`
- `level-up choice modal`

## 8. Висновок

Сценарій, який ти описав, дуже хороший як наступний референсний бій.

Він правильний, бо тестує одразу:
- single target basic attack;
- enemy random actions;
- статусний тиск;
- battle item use;
- cleanse;
- AoE magic;
- reward summary;
- progression loop.

Для поточного engine:
- перша половина вже майже є;
- друга половина ще потребує окремих систем;
- найважливіші missing pieces: `status chance`, `cleanse`, `AoE`, `XP/level-up`, `loot tables`.
