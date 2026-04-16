# Local Stable Diffusion Forge

## Призначення

Цей документ фіксує, як саме в цьому проекті використовувати локальний інстанс Stable Diffusion на `http://127.0.0.1:7860/` для генерації портретів, сценічних ілюстрацій і службових batch-ів.

Документ є робочим `source of truth` для локального image pipeline, поки ми не винесемо це в окремий автоматизований скрипт.

## Що зараз запущено

Локальний інстанс на `127.0.0.1:7860` виглядає як `Forge/ReForge`-подібна збірка поверх `Stable Diffusion WebUI` і `Gradio`.

Локально підтверджено:

- root UI: `http://127.0.0.1:7860/`
- Swagger/OpenAPI: `http://127.0.0.1:7860/docs`
- OpenAPI schema: `http://127.0.0.1:7860/openapi.json`
- runtime API description: `http://127.0.0.1:7860/info`
- Gradio config: `http://127.0.0.1:7860/config`
- LoRA list: `http://127.0.0.1:7860/sdapi/v1/loras`
- LoRA refresh: `http://127.0.0.1:7860/sdapi/v1/refresh-loras`

## Що підтверджено по локальному інстансу

### Checkpoints

У поточному інстансі доступні такі checkpoints:

- `sd\\epicrealismXL_pureFix.safetensors [dd21adcc3a]`
- `sd\\plantMilkModelSuite_walnut.safetensors [1704e50726]`
- `sd\\ponyDiffusionV6XL_v6StartWithThisOne.safetensors [67ab2fd8ec]`
- `sd\\realismIllustriousBy_v50FP16.safetensors [902f264844]`
- `sd\\toonyou_beta6.safetensors [e8d456c42e]`
- `sd\\waiIllustriousSDXL_v160.safetensors [a5f58eb1c3]`

На момент перевірки активним був:

- `sd\\ponyDiffusionV6XL_v6StartWithThisOne.safetensors [67ab2fd8ec]`

### LoRA

На момент перевірки інстанс бачить такі LoRA:

- `incase_style_v3-1_ponyxl_ilff`
  alias: `incase-ilff-v3-4`
  path: `D:\\Civitai\\Packages\\reforge\\models\\Lora\\incase_style_v3-1_ponyxl_ilff.safetensors`
- `pixel_f2`
  alias: `pixel_f2`
  path: `D:\\Civitai\\Packages\\reforge\\models\\Lora\\pixel_f2.safetensors`

## Важливий висновок по API

У цьому локальному setup є робочий API, але він виглядає не як повністю стандартний `AUTOMATIC1111 /sdapi/v1/txt2img`-інстанс.

Локально підтверджено таке:

- `/sdapi/v1/loras` і `/sdapi/v1/refresh-loras` працюють
- `/docs`, `/openapi.json`, `/info` працюють
- у `openapi.json` видно Gradio-style endpoints:
  - `/run/{api_name}`
  - `/api/{api_name}`
  - `/queue/status`
- класичні для A1111 endpoints на кшталт `/sdapi/v1/options` або `/sdapi/v1/sd-models` у цьому інстансі не відповідають

Практичний висновок:

- для автоматизації треба орієнтуватися не на "старий A1111 REST", а на `Gradio API layer`
- найнадійніший спосіб подивитися точний callable contract цього інстансу:
  - відкрити footer link `Use via API` у веб-інтерфейсі
  - або використовувати `gradio_client.Client(...).view_api()`
  - або читати `http://127.0.0.1:7860/info`

## Як перевіряти інстанс руками

### PowerShell

```powershell
Invoke-RestMethod -Uri 'http://127.0.0.1:7860/sdapi/v1/loras' |
  Select-Object name, alias, path
```

```powershell
Invoke-RestMethod -Uri 'http://127.0.0.1:7860/openapi.json'
```

```powershell
Invoke-RestMethod -Uri 'http://127.0.0.1:7860/info'
```

### Що нас цікавить у першу чергу

- який endpoint відповідає за `txt2img`
- який endpoint відповідає за `img2img`
- чи доступний `queue/predict` виклик без браузерної взаємодії
- чи є named API endpoints, або тільки unnamed/fn-index flow

## Рекомендовані пресети саме для WayToHeaven

### 1. Main VN Portrait Preset

Використовувати для основних емоційних портретів NPC і для більшості batch-ів.

Рекомендація:

- checkpoint: `sd\\waiIllustriousSDXL_v160.safetensors [a5f58eb1c3]`
- LoRA: спочатку без LoRA
- aspect: `1024x1536`
- framing: `waist-up` або `mid-shot`
- background: plain neutral or cutout-friendly
- style target: dark fantasy VN portrait, clean silhouette, readable face, controlled costume detail

Чому:

- для нашого проєкту важлива стилізація і читабельність, а не надмірний реалізм
- цей тип чекпойнта виглядає ближчим до authored VN-подачі, ніж жорстко pony-oriented stack

### 2. Noble / Dramatic Portrait Preset

Використовувати для Сери, Гая, ритуальних сцен, nobles, dramatic codex portraits.

Рекомендація:

- checkpoint: `sd\\realismIllustriousBy_v50FP16.safetensors [902f264844]`
- LoRA: none at first pass
- aspect: `1024x1536`
- style target: painterly semi-real dark fantasy, elegant faces, strong fabric and metal readability

### 3. Experimental InCase Style Preset

Використовувати тільки для окремих тестів, не як production default.

Рекомендація:

- checkpoint: `sd\\ponyDiffusionV6XL_v6StartWithThisOne.safetensors [67ab2fd8ec]`
- LoRA: `<lora:incase-ilff-v3-4:0.6-0.8>`
- only if style consistency is acceptable

Причина обмеження:

- `incase_style_v3-1_ponyxl_ilff` виглядає як Pony XL-oriented LoRA
- якщо її використовувати з не-Pony checkpoint, результат може бути нестабільним
- для VN production pipeline це треба спочатку окремо затвердити на 2-3 тестових портретах

### 4. Не використовувати як main portrait preset

- `pixel_f2`

Причина:

- за назвою і характером це радше стилістичний або вузький спеціалізований LoRA-варіант
- для основного dark fantasy VN portrait pipeline він зараз не виглядає як базовий кандидат

## Прозорий PNG

### Що нам потрібно

Для runtime нам бажано мати:

- `png`
- прозорий фон
- чистий силует персонажа
- мінімум шуму навколо волосся, рук і плечей

### Що важливо чесно зафіксувати

Звичайний `txt2img` у Stable Diffusion не гарантує справжній alpha transparency.

Тобто:

- `png` отримати легко
- `transparent background` без додаткового pipeline не гарантується

### Що означає "за можливості"

У цьому setup прозорість треба вважати `best effort`, поки не підтверджено один із шляхів:

- активний `LayerDiffuse Transparent Image Editing`
- окремий background-removal / rembg workflow
- img2img/inpaint pass по готовій масці

На момент локальної перевірки в openapi не було явно підтвердженого окремого transparent-output endpoint.

Тому production-safe правило зараз таке:

1. Генеруємо портрет у `png`
2. Стараємося отримати максимально чистий однорідний фон
3. Якщо alpha не народжується напряму, вирізаємо фон окремим постпроцесом

## Рекомендований production workflow для портретів

### Batch policy

- Mirella: `composite pipeline`
- VIP recurring characters: `carefully approved flat portrait sheets`
- common NPC: `flat emotion portraits only`

### Image policy

- vertical portrait
- one character only
- readable face first
- costume silhouette second
- no noisy background storytelling inside the portrait asset
- no full-scene composition for dialogue portraits

### Generation order

1. `neutral` або `composed`
2. `stern`
3. `calm`
4. `hard`
5. `tired`
6. `amused` або інші вторинні емоції

Не починати batch з екзотичних емоцій, доки не затверджений identity anchor.

## Поточний batch у проекті

Перший підготовлений пакет лежить тут:

- `tmp/imagegen/chapter1-portrait-batch-01.jsonl`
- `tmp/imagegen/chapter1-portrait-batch-01.install-map.json`

Він уже підготовлений під:

- `lady-sera`
- `lord-guy`
- `aren`
- `edran`
- `tanya`
- `galen`

## Що треба зробити далі

### Мінімум для керованої автоматизації

1. Підтвердити точний callable `txt2img` endpoint через `Use via API` або `gradio_client`
2. Зафіксувати один робочий preset для `WayToHeaven portraits`
3. Прогнати 1-2 тестових персонажів
4. Тільки після цього запускати весь batch

### Рекомендований технічний наступний крок

Завести маленький локальний wrapper script, який:

- читає `tmp/imagegen/*.jsonl`
- шле job у локальний Gradio/Forge
- зберігає `png`
- за install map розкладає файли в runtime paths

## Зовнішні джерела

Ці джерела корисні не як "істина про наш конкретний інстанс", а як опорна документація по стеку:

- Forge README: [lllyasviel/stable-diffusion-webui-forge](https://github.com/lllyasviel/stable-diffusion-webui-forge)
  - Forge описує себе як шар поверх Stable Diffusion WebUI на базі Gradio
  - у статусі репозиторію є примітка, що API endpoints `txt2img`, `img2img` тощо мають працювати
- Gradio Python Client docs: [Introduction](https://www.gradio.app/main/docs/python-client/introduction)
  - корисно для `Client.view_api()` і `predict()/submit()`
- `sdwebuiapi` client examples: [mix1009/sdwebuiapi](https://github.com/mix1009/sdwebuiapi)
  - корисно для загальної моделі prompt + LoRA usage в SD WebUI ecosystem

## Підсумок

Так, цей локальний інстанс можна використовувати як робочий генератор для проекту.

Але треба чесно розділяти дві речі:

- `UI/LoRA/checkpoint environment` уже є і виглядає придатним
- `fully scripted batch generation contract` ще треба один раз зафіксувати через реальний callable txt2img endpoint

До цього моменту документ вважати основною опорною інструкцією для локального image pipeline.
