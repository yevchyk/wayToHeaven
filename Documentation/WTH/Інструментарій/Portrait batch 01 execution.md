# Portrait Batch 01 Execution

## Статус

Перший локальний прогін через `Forge` уже дав прийнятні стартові assets для сім'ї Торнів.

Поки що в production runtime заведені лише ті портрети, які пройшли ручну візуальну перевірку.

## Прийняті assets

### Lady Sera

- `chapter-1/portraits/lady-sera/composed.png`
- `chapter-1/portraits/lady-sera/tired.png`

Правило на цьому етапі:

- `soft` використовує той самий asset ref, що й перевірений `composed` anchor
- `mother` використовує той самий asset ref, що й перевірений `lady-sera/tired` anchor

### Lord Guy

- `chapter-1/portraits/lord-guy/composed.png`
- `chapter-1/portraits/lord-guy/cold.png`

Правило на цьому етапі:

- `father` використовує той самий asset ref, що й перевірений `lord-guy/cold` anchor

## Чому саме так

Мета цього проходу не "закрити весь каст", а акуратно зафіксувати першу стилістичну сім'ю портретів:

- однакова матеріальність
- однакова постановка
- однакова dark-fantasy noble мова
- придатність для dialogue scale

Через це ми свідомо не вставляли все, що згенерувалося, а взяли тільки ті кадри, які виглядають як справжні VN character portraits, а не як випадкові model dumps.

## Технічне рішення

Для цих assets runtime references переведені на `png`, а не `webp`, а alias-дублікати прибрані.

Причина:

- локальний Forge реально віддає нам `png`
- для портретного pipeline це простіше
- якщо пізніше з'явиться справжній alpha pipeline, `png` краще підходить як source asset

## Обмеження цього етапу

- background поки не прозорий по-справжньому, а чистий і нейтральний
- це ще не фінальна asset cleanup pass
- для `lady-sera/calm`, `lady-sera/hard`, `lord-guy/commanding` та інших емоцій треба окремий наступний прогін

## Наступний пріоритет

Після цього проходу логічно добирати:

1. `lady-sera/calm`
2. `lady-sera/hard`
3. `aren/sharp`
4. `edran/stern`
5. `tanya/careful`

Не розширювати batch далі, поки кожен новий персонаж не тримає ту ж саму візуальну сім'ю, що й уже прийняті Торни.
