# Portrait Batch 01

## Призначення

Це перший production batch для портретів Chapter 1 після звірки персонажних нотаток зі сценами.

Його роль:

- зафіксувати першу візуальну сім'ю для дому Торнів;
- дати runtime придатні `png` assets;
- не розмножувати alias-персонажів у дві різні зовнішності.

## Поточний стан

Пакет підготовлений як робочий batch:

- `tmp/imagegen/chapter1-portrait-batch-01.jsonl`
- `tmp/imagegen/chapter1-portrait-batch-01.install-map.json`

Він не є "згенеруй усе й розкидай без перевірки". Це curated batch для покрокового відбору.

## Унікальні портрети цього batch

1. `lady-sera-composed.png`
2. `lady-sera-tired.png`
3. `lady-sera-calm.png`
4. `lady-sera-hard.png`
5. `lord-guy-cold.png`
6. `aren-sharp.png`
7. `aren-amused.png`
8. `edran-neutral.png`
9. `edran-stern.png`
10. `tanya-careful.png`
11. `galen-serious.png`

## Alias policy

У цьому проєкті:

- `mother` і `lady-sera` це одна жінка;
- `father` і `lord-guy` це один чоловік.

Тому правильна політика така:

- alias-и мають посилатися на ті самі asset refs;
- окремі duplicate png-файли для alias-пар не потрібні;
- intro id і chapter id можуть лишатися різними як narrative ids, але не як два різні набори портретів.

## Цільові runtime paths

Install map уже готовий у:

- `tmp/imagegen/chapter1-portrait-batch-01.install-map.json`

На цьому етапі він розкладає результати тільки в:

- `src/content/chapters/chapter-1/images/portraits/...`
- `src/content/prologue/images/portraits/...` тільки там, де це окремий персонаж, а не alias-копія

## Важливі правила перевірки

- портрет має читатися на dialogue scale;
- фон може бути нейтральним, але не повинен ламати майбутній cutout;
- Сера не може знову з'їхати в modern casual або glam;
- Таня не може виглядати як generic maid placeholder;
- Гай і Сера мають лишатися впізнаваними між intro id і chapter id;
- якщо новий кадр гірший за вже прийнятий anchor, він не йде в runtime лише тому, що "вже згенерувався".

## Рекомендований порядок відбору

1. `lady-sera`
2. `lord-guy`
3. `aren`
4. `edran`
5. `tanya`
6. `galen`

Спершу затверджуються anchor-портрети, і лише потім добираються другорядні емоції.
