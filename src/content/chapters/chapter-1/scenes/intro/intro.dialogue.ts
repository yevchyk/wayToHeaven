import type { DialogueData } from '@engine/types/dialogue';

export const chapter1IntroDialogue: DialogueData = {
  "id": "chapter-1/dialogues/prologue-001",
  "title": "Пролог — Над містом, під землею",
  "startNodeId": "n1",
  "meta": {
    "chapterId": "chapter-1",
    "sceneId": "chapter-1/scene/intro",
    "sceneTitle": "Пролог — Над містом, під землею",
    "defaultBackgroundId": "chapter-1/backgrounds/mansion-dining-hall.webp",
    "defaultMusicId": "theme_estate"
  },
  "nodes": {
    "n1": {
      "id": "n1",
      "type": "narration",
      "backgroundId": "chapter-1/backgrounds/mansion-dining-hall.webp",
      "music": { "action": "play", "musicId": "theme_estate", "fadeMs": 900, "loop": true },
      "stage": {
        "left": { "speakerId": "lady-sera", "emotion": "soft", "portraitId": "chapter-1/portraits/lady-sera/soft.webp" },
        "center": { "speakerId": "mirella", "emotion": "neutral", "portraitId": "chapter-1/portraits/mirella/neutral.webp" },
        "right": { "speakerId": "lord-guy", "emotion": "composed", "portraitId": "chapter-1/portraits/lord-guy/composed.webp" },
        "extra": [
          { "speakerId": "kael", "emotion": "playful", "portraitId": "chapter-1/portraits/kael/playful.webp" },
          { "speakerId": "sir-raust", "emotion": "stern", "portraitId": "chapter-1/portraits/sir-raust/stern.webp" }
        ]
      },
      "text": "Ранок у домі Торнів завжди починався красиво. Срібний посуд, тепле світло, гірське повітря за склом і місто далеко внизу — ніби весь світ лежав під їхнім столом. Мірелла сиділа тихо, відчуваючи, як тепло чаю розливається по тілу. (Внутрішня думка: «Все таке правильне… але чому мені завжди здається, що щось приховане?»)",
      "onEnterEffects": [{ "type": "setFlag", "flagId": "chapter1.prologue.seen", "value": true }],
      "nextNodeId": "n2"
    },

    "n2": {
      "id": "n2",
      "type": "dialogue",
      "speakerId": "lord-guy",
      "speakerSide": "right",
      "emotion": "composed",
      "text": "Шахта знову просіла по видобутку. А люди внизу чомусь завжди дивуються, коли за це карають. Міжкамінь — це не просто руда. Він з’єднує виміри. Сонячний Храм кричить, що ми уроди, бо покинули Сонце і його радіацію, яка нас захищала від цієї херні. А я кажу — ми стали сильнішими.",
      "nextNodeId": "n3"
    },

    "n3": {
      "id": "n3",
      "type": "dialogue",
      "speakerId": "sir-raust",
      "speakerSide": "left",
      "emotion": "stern",
      "text": "Страх тримає дім лише доти, доки хтось сильніший не принесе свій. А магія… вона просто знімає маску. Під нею ми всі однакові.",
      "nextNodeId": "n4"
    },

    "n4": {
      "id": "n4",
      "type": "choice",
      "speakerId": "mirella",
      "speakerSide": "center",
      "emotion": "thinking",
      "text": "Мірелла ковзнула поглядом між батьком і дядьком. (Внутрішня думка: «Магія підсилює те, що вже є… то що вона підсилить у мені?»)",
      "choices": [
        { "id": "n4_c1", "text": "Підтримати Рауста про честь.", "effects": [{ "type": "changeStat", "key": "humanity", "delta": 1 }], "nextNodeId": "n5" },
        { "id": "n4_c2", "text": "Підтримати батька про порядок.", "effects": [{ "type": "changeStat", "key": "pragmatism", "delta": 1 }], "nextNodeId": "n6" },
        { "id": "n4_c3", "text": "Промовчати.", "effects": [{ "type": "changeStat", "key": "egoism", "delta": 1 }], "nextNodeId": "n7" }
      ]
    },

    "n5": { "id": "n5", "type": "dialogue", "speakerId": "mirella", "emotion": "serious", "text": "Якщо дім тримається лише на страху, то це поганий дім.", "nextNodeId": "n8" },
    "n6": { "id": "n6", "type": "dialogue", "speakerId": "mirella", "emotion": "polite", "text": "Без порядку все внизу давно б розсипалося.", "nextNodeId": "n8" },
    "n7": { "id": "n7", "type": "narration", "text": "Мірелла нічого не сказала. Але всередині вже заворушилося легке, майже приємне відчуття — колись я могла б змусити їх усіх мовчати.", "nextNodeId": "n8" },

    "n8": {
      "id": "n8",
      "type": "narration",
      "backgroundId": "chapter-1/backgrounds/mirella-room-morning.webp",
      "transition": { "type": "fade", "durationMs": 450 },
      "stage": { "left": { "speakerId": "servant-lyna", "emotion": "soft", "portraitId": "chapter-1/portraits/servant-lyna/soft.webp" }, "right": { "speakerId": "mirella", "emotion": "neutral", "portraitId": "chapter-1/portraits/mirella/neutral.webp" } },
      "text": "Перед виїздом на шахту Ліна допомагала Міреллі з одягом. У домі Торнів навіть ранкові дрібниці були частиною порядку.",
      "nextNodeId": "n9"
    },

    "n9": {
      "id": "n9",
      "type": "choice",
      "speakerId": "mirella",
      "speakerSide": "right",
      "emotion": "thinking",
      "text": "Ліна нахилилася, поправляючи комір. Її пальці торкнулися шкіри Мірелли. Груди служниці були помітно стиснуті в простій сукні — дешевий одяг підкреслював усе, що в лордеси було приховане розкішшю.",
      "choices": [
        { "id": "n9_c1", "text": "Подякувати і поправити комір самій.", "effects": [{ "type": "changeStat", "key": "altruism", "delta": 1 }], "nextNodeId": "n10" },
        { "id": "n9_c2", "text": "Нічого не сказати.", "effects": [{ "type": "changeStat", "key": "egoism", "delta": 1 }], "nextNodeId": "n11" },
        { "id": "n9_c3", "text": "Холодно зауважити: «Ти занадто відверто вдягнена. Приведи себе до ладу».", "effects": [{ "type": "changeStat", "key": "lust", "delta": 1 }], "nextNodeId": "n12" },
        { "id": "n9_c4", "text": "Вимагати ідеальності без слів.", "effects": [{ "type": "changeStat", "key": "pragmatism", "delta": 1 }], "nextNodeId": "n13" }
      ],
      "adultMarker": { "enabled": true, "tags": ["class-humiliation", "power-dynamics", "shame-arousal"] }
    },

    "n10": { "id": "n10", "type": "dialogue", "speakerId": "servant-lyna", "emotion": "soft", "text": "Дякую, пані…", "nextNodeId": "n14" },
    "n11": { "id": "n11", "type": "narration", "text": "Ліна мовчки закінчила роботу. Мірелла відчула приємну холодну дистанцію.", "nextNodeId": "n14" },
    "n12": { "id": "n12", "type": "narration", "text": "Мірелла грубо поправила комір, пальці ковзнули по теплій шкірі грудей служниці. Ліна почервоніла, опустила очі. (Внутрішня думка Мірелли: «Отак. Нехай знає своє місце. І чому мені від цього так… гаряче і мокро між ніг?»)", "nextNodeId": "n14" },
    "n13": { "id": "n13", "type": "dialogue", "speakerId": "servant-lyna", "emotion": "embarrassed", "text": "Так, пані. Все буде ідеально.", "nextNodeId": "n14" },

    "n14": {
      "id": "n14",
      "type": "narration",
      "backgroundId": "chapter-1/backgrounds/flying-limo.webp",
      "transition": { "type": "fade", "durationMs": 500 },
      "music": { "action": "switch", "musicId": "theme_city_view", "fadeMs": 700 },
      "stage": { "left": { "speakerId": "marna-voss", "emotion": "professional" }, "center": { "speakerId": "mirella", "emotion": "curious" }, "right": { "speakerId": "lord-guy", "emotion": "composed" } },
      "text": "Аеролімузин ковзав над містом. За вікнами поволі зникала чистота і починалися промислові райони.",
      "nextNodeId": "n15"
    },

    "n15": {
      "id": "n15",
      "type": "dialogue",
      "speakerId": "lord-guy",
      "emotion": "composed",
      "text": "Магія — це не просто метал. Це міжкамінь. Він з’єднує наш вимір з чужим. Сонячний Храм каже, що ми уроди, бо покинули Сонце і його радіацію, яка нас захищала. А я кажу — ми стали сильнішими.",
      "nextNodeId": "n16"
    },

    "n16": {
      "id": "n16",
      "type": "choice",
      "speakerId": "mirella",
      "emotion": "thinking",
      "text": "Мірелла провела пальцем по холодному склу. (Внутрішня думка: «Якщо магія підсилює те, що вже є… то що вона підсилить у мені?»)",
      "choices": [
        { "id": "n16_c1", "text": "Питати, чому магія ламає людей.", "effects": [{ "type": "changeStat", "key": "humanity", "delta": 1 }], "nextNodeId": "n17" },
        { "id": "n16_c2", "text": "Питати, як її використовувати у владі.", "effects": [{ "type": "changeStat", "key": "pragmatism", "delta": 1 }], "nextNodeId": "n18" },
        { "id": "n16_c3", "text": "Питати, чому в колоніях люди так легко падають у крайнощі.", "effects": [{ "type": "changeStat", "key": "restraint", "delta": 1 }], "nextNodeId": "n19" },
        { "id": "n16_c4", "text": "Запитати Марну, чи вона сама користується магією.", "nextNodeId": "n20" }
      ]
    },

    "n17": { "id": "n17", "type": "dialogue", "speakerId": "lord-guy", "text": "Ламає не магія. Ламає слабкість, яка без неї просто жила тихо.", "nextNodeId": "n21" },
    "n18": { "id": "n18", "type": "dialogue", "speakerId": "marna-voss", "text": "Через контроль, доступ і страх втратити перевагу.", "nextNodeId": "n21" },
    "n19": { "id": "n19", "type": "dialogue", "speakerId": "marna-voss", "text": "Бо далеко від старих правил люди швидко розуміють, що межі були лише звичкою.", "nextNodeId": "n21" },
    "n20": { "id": "n20", "type": "dialogue", "speakerId": "marna-voss", "text": "Я ношу амулет з міжкаміння. Він допомагає… відчувати більше. Але я контролюю це.", "nextNodeId": "n21" },

    "n21": {
      "id": "n21",
      "type": "narration",
      "backgroundId": "chapter-1/backgrounds/mining-arrival.webp",
      "music": { "action": "switch", "musicId": "theme_mining", "fadeMs": 700 },
      "text": "Шахта зустріла їх важким повітрям, іржею, пилом і поглядами, в яких давно не залишилося ні подиву, ні надії. (Внутрішня думка Мірелли: «Вони бояться мене. І мені це… подобається»)",
      "nextNodeId": "n22"
    },

    "n22": {
      "id": "n22",
      "type": "choice",
      "speakerId": "mirella",
      "emotion": "thinking",
      "text": "Мірелла йшла поруч із батьком. Погляди робітників були колючими.",
      "choices": [
        { "id": "n22_c1", "text": "Дивитися людям у вічі.", "effects": [{ "type": "changeStat", "key": "humanity", "delta": 1 }], "nextNodeId": "n23" },
        { "id": "n22_c2", "text": "Тримати поставу й не реагувати.", "effects": [{ "type": "changeStat", "key": "restraint", "delta": 1 }], "nextNodeId": "n24" },
        { "id": "n22_c3", "text": "Відчути, що їхній страх — частина влади.", "effects": [{ "type": "changeStat", "key": "domination", "delta": 1 }], "nextNodeId": "n25" },
        { "id": "n22_c4", "text": "Запитати батька, чому вони так бояться.", "nextNodeId": "n26" }
      ]
    },

    "n23": { "id": "n23", "type": "narration", "text": "Декілька людей одразу відвели очі.", "nextNodeId": "n27" },
    "n24": { "id": "n24", "type": "narration", "text": "Мірелла тримала голову рівно.", "nextNodeId": "n27" },
    "n25": { "id": "n25", "type": "narration", "text": "Її прізвище важило тут більше за будь-який пістолет. Легке тепло розлилося в животі.", "nextNodeId": "n27" },
    "n26": { "id": "n26", "type": "dialogue", "speakerId": "lord-guy", "text": "Бо знають, що один слабкий — і десятки беруть приклад.", "nextNodeId": "n27" },

    "n27": {
      "id": "n27",
      "type": "narration",
      "backgroundId": "chapter-1/backgrounds/punishment-platform.webp",
      "music": { "action": "switch", "musicId": "theme_tension", "fadeMs": 350 },
      "text": "На центральній платформі вже стояли охоронці. Унизу, під ланцюгами ліфта, навколішках тримали шахтаря.",
      "nextNodeId": "n28"
    },

    "n28": {
      "id": "n28",
      "type": "dialogue",
      "speakerId": "lord-guy",
      "emotion": "cruel",
      "text": "Один саботажник коштує дорожче, ніж десяток трупів. Бо трупи мовчать, а приклад — живе довше.",
      "nextNodeId": "n29"
    },

    "n29": {
      "id": "n29",
      "type": "choice",
      "speakerId": "mirella",
      "emotion": "shocked",
      "text": "Гай говорив тихо. Крик шахтаря лунав над платформою. (Внутрішня думка: «Це жахливо… але чому мені так гаряче?»)",
      "choices": [
        { "id": "n29_c1", "text": "Спробувати зупинити.", "effects": [{ "type": "changeStat", "key": "altruism", "delta": 1 }, { "type": "changeStat", "key": "humanity", "delta": 1 }], "nextNodeId": "n30" },
        { "id": "n29_c2", "text": "Відвернутися.", "effects": [{ "type": "changeStat", "key": "restraint", "delta": 1 }], "nextNodeId": "n31" },
        { "id": "n29_c3", "text": "Дивитися мовчки.", "effects": [{ "type": "changeStat", "key": "pragmatism", "delta": 1 }], "nextNodeId": "n32" },
        { "id": "n29_c4", "text": "Підтримати батька.", "effects": [{ "type": "changeStat", "key": "egoism", "delta": 1 }, { "type": "changeStat", "key": "lust", "delta": 1 }], "nextNodeId": "n33" }
      ],
      "adultMarker": { "enabled": true, "tags": ["class-humiliation", "rough-handling"] }
    },

    "n30": { "id": "n30", "type": "dialogue", "speakerId": "mirella", "text": "Цього досить.", "nextNodeId": "n34" },
    "n31": { "id": "n31", "type": "narration", "text": "Мірелла відвернулася, але крик все одно дістався.", "nextNodeId": "n34" },
    "n32": { "id": "n32", "type": "narration", "text": "Вона запам’ятовувала кожен звук.", "nextNodeId": "n34" },
    "n33": { "id": "n33", "type": "narration", "text": "Мірелла відчула гарячу хвилю між ніг. «Так. Отак треба».", "nextNodeId": "n34" },

    "n34": {
      "id": "n34",
      "type": "narration",
      "backgroundId": "chapter-1/backgrounds/private-gallery.webp",
      "music": { "action": "switch", "musicId": "theme_family_crack", "fadeMs": 500 },
      "stage": { "left": { "speakerId": "marna-voss", "emotion": "superior" }, "right": { "speakerId": "lord-guy", "emotion": "amused" } },
      "text": "Мірелла випадково опинилася біля приватної галереї. Те, що вона побачила, було занадто відвертим.",
      "nextNodeId": "n35"
    },

    "n35": {
      "id": "n35",
      "type": "narration",
      "text": "Батько трахав Марну раком, притиснувши її до холодного скла. Її великі груди розгойдувалися від кожного потужного поштовху. Ляскання шкіри об шкіру, мокрі звуки, стогони Марни: «Сильніше, лорде…». Гай грубо тримав її за стегна, вганяючи член глибоко. Марна вигиналася, її соски терлися об скло. (Внутрішня думка Мірелли: «Батько… такий сильний. Я ніколи не бачила його таким. Мені гаряче… між ніг усе мокро. Я ненавиджу себе за це»)",
      "adultMarker": { "enabled": true, "tags": ["betrayal", "power-dynamics", "shame-arousal"] },
      "nextNodeId": "n36"
    },

    "n36": {
      "id": "n36",
      "type": "choice",
      "speakerId": "mirella",
      "emotion": "hurt",
      "text": "Мірелла стояла в тіні, серце калатало. Сором і збудження змішалися в один гарячий клубок.",
      "choices": [
        { "id": "n36_c1", "text": "Піти тихо.", "effects": [{ "type": "changeStat", "key": "restraint", "delta": 1 }], "nextNodeId": "n37" },
        { "id": "n36_c2", "text": "Запам’ятати як важіль.", "effects": [{ "type": "changeStat", "key": "pragmatism", "delta": 1 }], "nextNodeId": "n38" },
        { "id": "n36_c3", "text": "Відчути тільки огиду.", "effects": [{ "type": "changeStat", "key": "humanity", "delta": 1 }], "nextNodeId": "n39" }
      ]
    },

    "n37": { "id": "n37", "type": "narration", "text": "Вона відступила в тінь, ковтаючи все.", "nextNodeId": "n40" },
    "n38": { "id": "n38", "type": "narration", "text": "Мірелла запам’ятала кожен рух. Це можна використати.", "nextNodeId": "n40" },
    "n39": { "id": "n39", "type": "narration", "text": "Огида була справжньою, але під нею пульсувало щось інше.", "nextNodeId": "n40" },

    "n40": {
      "id": "n40",
      "type": "narration",
      "backgroundId": "chapter-1/backgrounds/sera-room-evening.webp",
      "transition": { "type": "fade", "durationMs": 450 },
      "stage": { "left": { "speakerId": "lady-sera", "emotion": "tired" }, "right": { "speakerId": "mirella", "emotion": "thinking" } },
      "text": "Увечері мати сиділа біля вікна з келихом вина. Мірелла довго мовчала, перш ніж вирішила, чи взагалі говорити.",
      "nextNodeId": "n41"
    },

    "n41": {
      "id": "n41",
      "type": "choice",
      "speakerId": "mirella",
      "emotion": "thinking",
      "text": "Слова вже були в неї в горлі. Але ще можна було їх проковтнути.",
      "choices": [
        { "id": "n41_c1", "text": "Сказати матері про батька і Марну.", "nextNodeId": "n42" },
        { "id": "n41_c2", "text": "Промовчати.", "nextNodeId": "n47" }
      ]
    },

    "n42": {
      "id": "n42",
      "type": "dialogue",
      "speakerId": "mirella",
      "emotion": "hurt",
      "text": "Я бачила його з нею… раком… притиснутим до скла…",
      "nextNodeId": "n43"
    },

    "n43": {
      "id": "n43",
      "type": "dialogue",
      "speakerId": "lady-sera",
      "emotion": "resigned",
      "text": "Я знаю.",
      "nextNodeId": "n44"
    },

    "n44": {
      "id": "n44",
      "type": "choice",
      "speakerId": "mirella",
      "emotion": "shocked",
      "text": "Від цієї спокійної відповіді Міреллі стало холодніше, ніж від ранкового вітру в горах.",
      "choices": [
        { "id": "n44_c1", "text": "Спитати: «Чому ти це терпиш?»", "effects": [{ "type": "changeStat", "key": "humanity", "delta": 1 }], "nextNodeId": "n45" },
        { "id": "n44_c2", "text": "Спитати: «Отже, так треба для дому?»", "effects": [{ "type": "changeStat", "key": "pragmatism", "delta": 1 }], "nextNodeId": "n46" },
        { "id": "n44_c3", "text": "Замовкнути.", "nextNodeId": "n48" },
        { "id": "n44_c4", "text": "Подумати, що мати слабка.", "effects": [{ "type": "changeStat", "key": "lust", "delta": 1 }], "nextNodeId": "n49" }
      ]
    },

    "n45": { "id": "n45", "type": "dialogue", "speakerId": "lady-sera", "emotion": "fragile", "text": "Бо іноді жінка рятує дім не тим, що б’ється, а тим, що знає, де саме її битва вже програна.", "nextNodeId": "n50" },
    "n46": { "id": "n46", "type": "dialogue", "speakerId": "lady-sera", "emotion": "sad", "text": "Для дому завжди щось треба. Саме тому доми іноді гниють красивіше за людей.", "nextNodeId": "n50" },
    "n47": { "id": "n47", "type": "narration", "text": "Мірелла промовчала. Між ними росло мовчання, що теж було різновидом правди.", "nextNodeId": "n50" },
    "n48": { "id": "n48", "type": "narration", "text": "Дорослий світ не виправдовується. Він просто сидить навпроти й дивиться, як ти звикаєш.", "nextNodeId": "n50" },
    "n49": { "id": "n49", "type": "narration", "text": "Жалість до слабкого може дуже швидко перетворитися на презирство.", "nextNodeId": "n50" },

    "n50": {
      "id": "n50",
      "type": "narration",
      "backgroundId": "chapter-1/backgrounds/armory-evening.webp",
      "transition": { "type": "fade", "durationMs": 400 },
      "music": { "action": "switch", "musicId": "theme_raust", "fadeMs": 700 },
      "stage": { "left": { "speakerId": "sir-raust", "emotion": "stern" }, "center": { "speakerId": "mirella", "emotion": "soft" }, "right": { "speakerId": "kael", "emotion": "playful" } },
      "text": "У зброярні пахло маслом, шкірою й холодною сталлю. Поруч із Раустом навіть тиша здавалася чеснішою.",
      "nextNodeId": "n51"
    },

    "n51": {
      "id": "n51",
      "type": "choice",
      "speakerId": "mirella",
      "emotion": "thinking",
      "text": "Каель надто старався звучати доросло.",
      "choices": [
        { "id": "n51_c1", "text": "Підтримати Рауста.", "effects": [{ "type": "changeStat", "key": "humanity", "delta": 1 }], "nextNodeId": "n52" },
        { "id": "n51_c2", "text": "Підбадьорити Каеля.", "effects": [{ "type": "changeStat", "key": "altruism", "delta": 1 }], "nextNodeId": "n53" },
        { "id": "n51_c3", "text": "Вколоти Каеля за пиху.", "effects": [{ "type": "changeStat", "key": "lust", "delta": 1 }], "nextNodeId": "n54" },
        { "id": "n51_c4", "text": "Сказати, що головне — повернутися живими.", "effects": [{ "type": "changeStat", "key": "pragmatism", "delta": 1 }], "nextNodeId": "n55" }
      ]
    },

    "n52": { "id": "n52", "type": "dialogue", "speakerId": "mirella", "text": "Головне, щоб дехто поруч умів не геройствувати зайвого.", "nextNodeId": "n56" },
    "n53": { "id": "n53", "type": "dialogue", "speakerId": "mirella", "text": "Тоді повернися живим і сам усе покажеш.", "nextNodeId": "n56" },
    "n54": { "id": "n54", "type": "dialogue", "speakerId": "mirella", "text": "Спробуй спочатку не перечепитися об власні піхви, герой.", "nextNodeId": "n56" },
    "n55": { "id": "n55", "type": "dialogue", "speakerId": "sir-raust", "text": "Ось це вже звучить розумно.", "nextNodeId": "n56" },

    "n56": {
      "id": "n56",
      "type": "narration",
      "backgroundId": "chapter-1/backgrounds/mirella-room-night.webp",
      "transition": { "type": "fade", "durationMs": 400 },
      "music": { "action": "switch", "musicId": "theme_tension", "fadeMs": 500 },
      "stage": { "left": null, "center": { "speakerId": "mirella", "emotion": "embarrassed" }, "right": { "speakerId": "kael", "emotion": "nervous" } },
      "text": "Пізніше, у своїх покоях, Мірелла відчула чужу присутність раніше, ніж побачила її. Каель стояв за дверима і дивився.",
      "nextNodeId": "n57"
    },

    "n57": {
      "id": "n57",
      "type": "choice",
      "speakerId": "mirella",
      "emotion": "embarrassed",
      "text": "Він не виглядав небезпечним. Просто дурним, розгубленим хлопчиськом. (Внутрішня думка: «Я не хочу його лякати… він же ще дитина»)",
      "adultMarker": { "enabled": true, "tags": ["boundary-violation", "shame-arousal"] },
      "choices": [
        { "id": "n57_c1", "text": "Вдавано не помітити, щоб не лякати.", "effects": [{ "type": "setFlag", "key": "sparedKael", "value": true }], "nextNodeId": "n58" },
        { "id": "n57_c2", "text": "М’яко сказати, щоб пішов.", "effects": [{ "type": "changeStat", "key": "altruism", "delta": 1 }], "nextNodeId": "n59" },
        { "id": "n57_c3", "text": "Принизити його як дурного хлопчиська.", "effects": [{ "type": "changeStat", "key": "lust", "delta": 1 }], "nextNodeId": "n60" },
        { "id": "n57_c4", "text": "Промовчати і запам’ятати.", "effects": [{ "type": "changeStat", "key": "pragmatism", "delta": 1 }], "nextNodeId": "n61" }
      ]
    },

    "n58": { "id": "n58", "type": "narration", "text": "Мірелла зробила вигляд, що нічого не сталося. Каель зник майже беззвучно. Залишився тільки сором і дивне тепло між ніг.", "nextNodeId": "n62" },
    "n59": { "id": "n59", "type": "dialogue", "speakerId": "mirella", "text": "Каелю. Іди. Зараз.", "nextNodeId": "n62" },
    "n60": { "id": "n60", "type": "dialogue", "speakerId": "mirella", "text": "Ти навіть підглядати не вмієш непомітно.", "nextNodeId": "n62" },
    "n61": { "id": "n61", "type": "narration", "text": "Вона нічого не сказала. Але в її пам’яті ця сцена лягла в той самий темний ящик.", "nextNodeId": "n62" },

    "n62": {
      "id": "n62",
      "type": "narration",
      "backgroundId": "chapter-1/backgrounds/balcony-night-city.webp",
      "transition": { "type": "fade", "durationMs": 500 },
      "music": { "action": "switch", "musicId": "theme_raust", "fadeMs": 700 },
      "stage": { "left": { "speakerId": "sir-raust", "emotion": "grim" }, "right": { "speakerId": "mirella", "emotion": "thinking" } },
      "text": "Пізно вночі Рауст покликав її на балкон. Внизу мерехтіло місто, й уперше за день Мірелла відчула, що може вдихнути на повні груди.",
      "nextNodeId": "n63"
    },

    "n63": {
      "id": "n63",
      "type": "dialogue",
      "speakerId": "sir-raust",
      "speakerSide": "left",
      "emotion": "grim",
      "text": "Народитися над іншими — не заслуга. Це випробування, яке майже ніхто не проходить.",
      "nextNodeId": "n64"
    },

    "n64": {
      "id": "n64",
      "type": "choice",
      "speakerId": "mirella",
      "speakerSide": "right",
      "emotion": "serious",
      "text": "Мірелла дивилася на вогні внизу й раптом зрозуміла, що хоче відповісти чесно хоча б раз за цей день.",
      "choices": [
        { "id": "n64_c1", "text": "«Я хочу лишитися людиною.»", "effects": [{ "type": "changeStat", "key": "humanity", "delta": 1 }], "nextNodeId": "n65" },
        { "id": "n64_c2", "text": "«Я хочу стати сильною.»", "effects": [{ "type": "changeStat", "key": "domination", "delta": 1 }], "nextNodeId": "n66" },
        { "id": "n64_c3", "text": "«Я хочу вижити.»", "effects": [{ "type": "changeStat", "key": "pragmatism", "delta": 1 }], "nextNodeId": "n67" }
      ]
    },

    "n65": { "id": "n65", "type": "dialogue", "speakerId": "sir-raust", "text": "Тоді тримайся за це раніше, ніж за зброю.", "nextNodeId": "n68" },
    "n66": { "id": "n66", "type": "dialogue", "speakerId": "sir-raust", "text": "Сила без міри завжди шукає, ким би стати замість людини.", "nextNodeId": "n68" },
    "n67": { "id": "n67", "type": "dialogue", "speakerId": "sir-raust", "text": "Це чесна відповідь. І найнебезпечніша з усіх.", "nextNodeId": "n68" },

    "n68": {
      "id": "n68",
      "type": "event",
      "speakerId": "sir-raust",
      "emotion": "protective",
      "text": "Він вклав їй у долоню старий родовий медальйон.",
      "onEnterEffects": [{ "type": "setFlag", "key": "gotRaustToken", "value": true }],
      "nextNodeId": "n69"
    },

    "n69": {
      "id": "n69",
      "type": "narration",
      "backgroundId": "chapter-1/backgrounds/hangar-dawn.webp",
      "transition": { "type": "fade", "durationMs": 400 },
      "music": { "action": "switch", "musicId": "theme_raust", "fadeMs": 500 },
      "stage": { "left": { "speakerId": "sir-raust", "emotion": "battle_ready" }, "center": { "speakerId": "mirella", "emotion": "soft" }, "right": { "speakerId": "kael", "emotion": "nervous" } },
      "text": "На світанку вони відлітали. Із самого початку було щось неправильне в тому, як порожніє дім, коли з нього йде єдина людина, якій ти віриш.",
      "nextNodeId": "n70"
    },

    "n70": {
      "id": "n70",
      "type": "choice",
      "speakerId": "mirella",
      "emotion": "soft",
      "text": "Рауст затягнув рукавицю. Каель намагався не показати страху.",
      "choices": [
        { "id": "n70_c1", "text": "Попросити Рауста берегти Каеля.", "effects": [{ "type": "changeStat", "key": "altruism", "delta": 1 }], "nextNodeId": "n71" },
        { "id": "n70_c2", "text": "Побажати їм слави.", "effects": [{ "type": "changeStat", "key": "domination", "delta": 1 }], "nextNodeId": "n72" },
        { "id": "n70_c3", "text": "Не показувати емоцій.", "effects": [{ "type": "changeStat", "key": "restraint", "delta": 1 }], "nextNodeId": "n73" }
      ]
    },

    "n71": { "id": "n71", "type": "dialogue", "speakerId": "sir-raust", "text": "Я завжди це роблю. Навіть коли він думає, що вже дорослий.", "nextNodeId": "n74" },
    "n72": { "id": "n72", "type": "dialogue", "speakerId": "kael", "text": "Ось бачиш. Хоч хтось тут розуміє, як треба проводжати героїв.", "nextNodeId": "n74" },
    "n73": { "id": "n73", "type": "narration", "text": "Мірелла лише кивнула. І Каель образився на це більше, ніж показав.", "nextNodeId": "n74" },

    "n74": {
      "id": "n74",
      "type": "narration",
      "backgroundId": "chapter-1/backgrounds/mansion-corridor-empty.webp",
      "transition": { "type": "fade", "durationMs": 500 },
      "music": { "action": "switch", "musicId": "theme_family_crack", "fadeMs": 700 },
      "text": "Коли транспорт зник за гірським хребтом, дім одразу став іншим. Тишим. Більш порожнім. І чомусь менш безпечним.",
      "nextNodeId": "n75"
    },

    "n75": {
      "id": "n75",
      "type": "choice",
      "speakerId": "mirella",
      "emotion": "thinking",
      "text": "Довгі коридори здавалися чужими навіть при звичному світлі ламп.",
      "choices": [
        { "id": "n75_c1", "text": "Піти до матері.", "effects": [{ "type": "changeStat", "key": "humanity", "delta": 1 }], "nextNodeId": "n76" },
        { "id": "n75_c2", "text": "Самій шукати, що приховує дім.", "effects": [{ "type": "changeStat", "key": "pragmatism", "delta": 1 }], "nextNodeId": "n77" },
        { "id": "n75_c3", "text": "Замкнутись у себе.", "effects": [{ "type": "changeStat", "key": "restraint", "delta": 1 }], "nextNodeId": "n78" }
      ]
    },

    "n76": { "id": "n76", "type": "narration", "text": "Мати вже спала або робила вигляд, що спить. Від цього в домі стало ще холодніше.", "nextNodeId": "n79" },
    "n77": { "id": "n77", "type": "narration", "text": "Мірелла пройшла повз зачинені двері кабінету батька і вперше подумала, що дім теж може мати нутрощі.", "nextNodeId": "n79" },
    "n78": { "id": "n78", "type": "narration", "text": "Вона зачинила двері, але це не дало жодного відчуття захисту.", "nextNodeId": "n79" },

    "n79": {
      "id": "n79",
      "type": "event",
      "text": "Сирена вдарила раптово.",
      "sfx": [{ "id": "alarm", "volume": 0.95 }],
      "music": { "action": "switch", "musicId": "theme_attack", "fadeMs": 250 },
      "transition": { "type": "flash", "durationMs": 220 },
      "nextNodeId": "n80"
    },

    "n80": {
      "id": "n80",
      "type": "narration",
      "backgroundId": "chapter-1/backgrounds/mansion-attack-corridor.webp",
      "text": "Червоне аварійне світло лягло на стіни, і за кілька секунд красивий дім перестав бути домом.",
      "nextNodeId": "n81"
    },

    "n81": {
      "id": "n81",
      "type": "narration",
      "stage": { "left": { "speakerId": "lady-sera", "emotion": "afraid" }, "center": { "speakerId": "mirella", "emotion": "shocked" }, "right": { "speakerId": "orc-raider", "emotion": "dominant" } },
      "text": "Оркоїдні рейдери вдерлися з нижніх технічних рівнів. Вони встигли схопити Серу.",
      "nextNodeId": "n82"
    },

    "n82": {
      "id": "n82",
      "type": "choice",
      "speakerId": "mirella",
      "emotion": "trembling",
      "text": "Потім батько ввірвався і вирізав усіх. Мірелла запам’ятає не крики, а те, яким страшним і сильним він був.",
      "choices": [
        { "id": "n82_c1", "text": "Кинутися до матері.", "effects": [{ "type": "changeStat", "key": "altruism", "delta": 1 }], "nextNodeId": "n83" },
        { "id": "n82_c2", "text": "Завмерти.", "nextNodeId": "n84" },
        { "id": "n82_c3", "text": "Хапати зброю/знак роду.", "effects": [{ "type": "changeStat", "key": "pragmatism", "delta": 1 }], "nextNodeId": "n85" },
        { "id": "n82_c4", "text": "Відчути моторошний захват від його сили.", "effects": [{ "type": "changeStat", "key": "lust", "delta": 1 }], "nextNodeId": "n86" }
      ],
      "adultMarker": { "enabled": true, "tags": ["violent-intrusion", "shame-arousal"] }
    },

    "n83": { "id": "n83", "type": "narration", "text": "Мірелла встигла торкнутися материної руки лише на мить.", "nextNodeId": "n87" },
    "n84": { "id": "n84", "type": "narration", "text": "Страх приклеїв її до підлоги краще, ніж будь-який наказ.", "nextNodeId": "n87" },
    "n85": { "id": "n85", "type": "narration", "text": "Пальці самі стиснули медальйон і короткий ніж.", "nextNodeId": "n87" },
    "n86": { "id": "n86", "type": "narration", "text": "У тій жорстокості було щось таке, що лякало і притягувало водночас.", "nextNodeId": "n87" },

    "n87": {
      "id": "n87",
      "type": "narration",
      "backgroundId": "chapter-1/backgrounds/cage-descent.webp",
      "music": { "action": "switch", "musicId": "theme_captivity", "fadeMs": 700 },
      "stage": { "left": { "speakerId": "old-prisoner", "emotion": "shifty" }, "center": { "speakerId": "mirella", "emotion": "broken" }, "right": { "speakerId": "guard", "emotion": "cold" } },
      "text": "Спуск у клітці пахнув кров’ю, іржею і чиїмось старим потом. Голод виявився принизливішим за страх.",
      "nextNodeId": "n88"
    },

    "n88": {
      "id": "n88",
      "type": "dialogue",
      "speakerId": "old-prisoner",
      "emotion": "shifty",
      "text": "У тебе такий вигляд, ніби ти ще вчора їла з гербового срібла.",
      "nextNodeId": "n89"
    },

    "n89": {
      "id": "n89",
      "type": "choice",
      "speakerId": "mirella",
      "emotion": "humiliated",
      "text": "Старий тримав шматок сухого хліба. Від нього тхнуло і старістю, і чимось слизько-двозначним. Міреллі було огидно навіть думати, що доведеться просити. (Внутрішня думка: «Він зараз полізе… о боже, тільки не це»)",
      "adultMarker": { "enabled": true, "tags": ["captivity", "class-humiliation", "shame-arousal"] },
      "choices": [
        { "id": "n89_c1", "text": "Терпіти голод.", "effects": [{ "type": "changeStat", "key": "restraint", "delta": 1 }], "nextNodeId": "n90" },
        { "id": "n89_c2", "text": "Попросити їжі обережно.", "effects": [{ "type": "changeStat", "key": "humanity", "delta": 1 }], "nextNodeId": "n91" },
        { "id": "n89_c3", "text": "Спробувати щось виторгувати.", "effects": [{ "type": "changeStat", "key": "pragmatism", "delta": 1 }], "nextNodeId": "n92" },
        { "id": "n89_c4", "text": "Наїхати статусом.", "effects": [{ "type": "changeStat", "key": "egoism", "delta": 1 }], "nextNodeId": "n93" }
      ]
    },

    "n90": { "id": "n90", "type": "narration", "text": "Мірелла відвернулася. Голод простіше витримати, ніж ще одне приниження.", "nextNodeId": "n94" },
    "n91": { "id": "n91", "type": "dialogue", "speakerId": "mirella", "text": "Дай трохи…", "nextNodeId": "n94" },
    "n92": { "id": "n92", "type": "dialogue", "speakerId": "mirella", "text": "Якщо ми переживемо цей спуск, я можу відплатити.", "nextNodeId": "n94" },
    "n93": { "id": "n93", "type": "dialogue", "speakerId": "mirella", "text": "Ти взагалі розумієш, хто я?", "nextNodeId": "n94" },

    "n94": {
      "id": "n94",
      "type": "dialogue",
      "speakerId": "old-prisoner",
      "emotion": "soft",
      "text": "Розумію. Тому й кажу: їж, поки ще можеш бути просто голодною, а не мертвою.",
      "onEnterEffects": [{ "type": "setFlag", "key": "oldManNotPureMonster", "value": true }],
      "nextNodeId": "n95"
    },

    "n95": {
      "id": "n95",
      "type": "narration",
      "backgroundId": "chapter-1/backgrounds/holding-point-before-bridge.webp",
      "transition": { "type": "fade", "durationMs": 450 },
      "text": "Перед мостом конвой зупинився. Унизу, в чорній воді, не відбивалося жодне світло.",
      "nextNodeId": "n96"
    },

    "n96": {
      "id": "n96",
      "type": "event",
      "music": { "action": "switch", "musicId": "theme_rebels", "fadeMs": 300 },
      "sfx": [{ "id": "metal_clang", "volume": 0.9 }],
      "text": "Десь попереду задзвеніли ланцюги мосту.",
      "nextNodeId": "n97"
    },

    "n97": {
      "id": "n97",
      "type": "narration",
      "backgroundId": "chapter-1/backgrounds/chain-bridge-black-river.webp",
      "stage": { "left": { "speakerId": "tessa-grey", "emotion": "hard" }, "center": { "speakerId": "mirella", "emotion": "humiliated" }, "right": { "speakerId": "scarred-woman", "emotion": "hateful" } },
      "text": "Повстанці вдарили по конвою швидко. На одну мить Мірелла подумала, що це порятунок.",
      "nextNodeId": "n98"
    },

    "n98": {
      "id": "n98",
      "type": "dialogue",
      "speakerId": "scarred-woman",
      "emotion": "hateful",
      "text": "Поглянь на неї. Біле обличчя, чиста шкіра. Наче все це брудне місце взагалі не для таких, як вона.",
      "nextNodeId": "n99"
    },

    "n99": {
      "id": "n99",
      "type": "event",
      "text": "Жінка зі шрамом грубо схопила Міреллу за волосся, друга рука стиснула її великі груди через сукню і сильно стиснула. «Ось така панська сучка…»",
      "adultMarker": { "enabled": true, "tags": ["class-hatred", "rough-handling", "shame-arousal"] },
      "nextNodeId": "n100"
    },

    "n100": {
      "id": "n100",
      "type": "choice",
      "speakerId": "mirella",
      "emotion": "trembling",
      "text": "Біль і сором змішалися з дивним жаром між ніг.",
      "choices": [
        { "id": "n100_c1", "text": "Вчепитися в когось і зірватися вниз разом.", "effects": [{ "type": "changeStat", "key": "domination", "delta": 1 }], "nextNodeId": "n101" },
        { "id": "n100_c2", "text": "Стрибнути самій.", "effects": [{ "type": "changeStat", "key": "restraint", "delta": 1 }], "nextNodeId": "n102" },
        { "id": "n100_c3", "text": "Просити пощади.", "effects": [{ "type": "changeStat", "key": "submission", "delta": 1 }], "nextNodeId": "n103" },
        { "id": "n100_c4", "text": "Сказати, що ти теж жертва.", "effects": [{ "type": "changeStat", "key": "pragmatism", "delta": 1 }], "nextNodeId": "n104" }
      ]
    },

    "n101": { "id": "n101", "type": "narration", "text": "Мірелла рвонулася вперед, хапаючи чужу руку вже від люті.", "nextNodeId": "n105" },
    "n102": { "id": "n102", "type": "narration", "text": "Вона стрибнула сама, не даючи їм задоволення зробити останній поштовх.", "nextNodeId": "n105" },
    "n103": { "id": "n103", "type": "dialogue", "speakerId": "mirella", "text": "Будь ласка…", "nextNodeId": "n105" },
    "n104": { "id": "n104", "type": "dialogue", "speakerId": "mirella", "text": "Ви дивитесь не на ворога. А на те, що від нього лишилося.", "nextNodeId": "n105" },

    "n105": {
      "id": "n105",
      "type": "narration",
      "text": "Це нічого не змінило. Міст, крики, чужі руки, чийсь подих зовсім поруч — а потім тільки провалля.",
      "nextNodeId": "n106"
    },

    "n106": {
      "id": "n106",
      "type": "narration",
      "backgroundId": "chapter-1/backgrounds/abyss-fall.webp",
      "music": { "action": "switch", "musicId": "theme_fall", "fadeMs": 600 },
      "stage": { "center": { "speakerId": "mirella", "emotion": "falling" } },
      "text": "Падіння було таким довгим, що в нього встигло поміститися все її життя.",
      "nextNodeId": "n107"
    },

    "n107": {
      "id": "n107",
      "type": "choice",
      "speakerId": "mirella",
      "emotion": "hollow",
      "text": "Стіл. Ліна. Шахта. Мати з вином. Каель у дверях. Рауст на балконі. Батько в крові.",
      "choices": [
        { "id": "n107_c1", "text": "Думати про матір.", "effects": [{ "type": "changeStat", "key": "humanity", "delta": 1 }], "nextNodeId": "n108" },
        { "id": "n107_c2", "text": "Думати про силу.", "effects": [{ "type": "changeStat", "key": "domination", "delta": 1 }], "nextNodeId": "n109" },
        { "id": "n107_c3", "text": "Думати тільки про виживання.", "effects": [{ "type": "changeStat", "key": "pragmatism", "delta": 1 }], "nextNodeId": "n110" }
      ]
    },

    "n108": { "id": "n108", "type": "narration", "text": "Останнім чистим образом у темряві лишилася мати. Не сильна. Не права. Але жива.", "nextNodeId": "n111" },
    "n109": { "id": "n109", "type": "narration", "text": "Мірелла побачила лише одне: як легко все вирішує той, хто більше не соромиться сили.", "nextNodeId": "n111" },
    "n110": { "id": "n110", "type": "narration", "text": "Жодної думки не лишилося цілісною. Тільки голе, тваринне бажання дихати ще хоч раз.", "nextNodeId": "n111" },

    "n111": {
      "id": "n111",
      "type": "narration",
      "backgroundId": "chapter-1/backgrounds/ancient-temple-black-river.webp",
      "transition": { "type": "fade", "durationMs": 700 },
      "music": { "action": "switch", "musicId": "theme_parasite", "fadeMs": 900 },
      "sfx": [{ "id": "river_deep", "volume": 0.7 }, { "id": "parasite_whisper", "volume": 0.5, "delayMs": 400 }],
      "stage": { "left": { "speakerId": "ner-azet", "emotion": "hunger" }, "right": { "speakerId": "mirella", "emotion": "broken" } },
      "text": "Коли вона розплющила очі, над нею висіли уламки древнього храму, а поруч дихала чорна ріка. Біль уже майже перестав бути болем.",
      "nextNodeId": "n112"
    },

    "n112": {
      "id": "n112",
      "type": "dialogue",
      "speakerId": "ner-azet",
      "emotion": "hunger",
      "text": "Встань.",
      "adultMarker": { "enabled": true, "tags": ["body-horror", "corruption", "shame-arousal"] },
      "nextNodeId": "n113"
    },

    "n113": {
      "id": "n113",
      "type": "narration",
      "text": "Це торкнулося не шкіри. Глибшого місця. Наче в її тілі відчинилися двері, яких там ніколи не мало бути. Тепло, слиз, пульсація в животі, щось ворушиться всередині.",
      "nextNodeId": "n114"
    },

    "n114": {
      "id": "n114",
      "type": "choice",
      "speakerId": "mirella",
      "emotion": "trembling",
      "text": "Мірелла зрозуміла тільки одне: щось чужорідне хоче жити в ній так само сильно, як вона сама. Боротьба чи прийняття — це вже не вибір, а початок.",
      "choices": [
        { "id": "n114_c1", "text": "Опиратися.", "effects": [{ "type": "changeStat", "key": "humanity", "delta": 1 }], "nextNodeId": "n115" },
        { "id": "n114_c2", "text": "Прийняти силу, щоб жити.", "effects": [{ "type": "changeStat", "key": "pragmatism", "delta": 1 }], "nextNodeId": "n116" },
        { "id": "n114_c3", "text": "Підкоритися, бо сил нема.", "effects": [{ "type": "changeStat", "key": "submission", "delta": 1 }], "nextNodeId": "n117" },
        { "id": "n114_c4", "text": "Відчути смак сили й захотіти помститися всім.", "effects": [{ "type": "changeStat", "key": "domination", "delta": 1 }], "nextNodeId": "n118" }
      ]
    },

    "n115": { "id": "n115", "type": "dialogue", "speakerId": "mirella", "text": "Ні… не ти.", "nextNodeId": "n119" },
    "n116": { "id": "n116", "type": "dialogue", "speakerId": "mirella", "text": "Жити. Хоч якось.", "nextNodeId": "n119" },
    "n117": { "id": "n117", "type": "narration", "text": "Вона відпустила опір, бо іноді тіло капітулює раніше за волю.", "nextNodeId": "n119" },
    "n118": { "id": "n118", "type": "narration", "text": "Під болем, страхом і приниженням Мірелла раптом відчула ще дещо: як солодко може звучати думка, що колись це все повернеться іншим. Помститися. Всім.", "nextNodeId": "n119" },

    "n119": {
      "id": "n119",
      "type": "event",
      "speakerId": "ner-azet",
      "emotion": "invasion",
      "text": "Тоді встань.",
      "onEnterEffects": [
        { "type": "setFlag", "key": "parasiteContact", "value": true },
        { "type": "unlockStat", "key": "corruption" }
      ],
      "nextNodeId": "n120"
    },

    "n120": {
      "id": "n120",
      "type": "narration",
      "text": "Чорна ріка дихнула в темряві. Мірелла підняла голову. Пролог закінчився там, де починалося вже не повернення — а підйом нагору через щось гірше за смерть.",
      "isEnd": true,
      "onEnterEffects": [
        { "type": "setFlag", "key": "prologueFinished", "value": true },
        { "type": "runScript", "scriptId": "chapter1.goToUndergroundAwakening" }
      ]
    }
  }
}
