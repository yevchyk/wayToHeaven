import type { SceneGenerationDocument } from '@engine/types/sceneGeneration';

export const chapter1IntroTwoOfThreeSceneGenerationDocument = {
  id: 'chapter-1/scene-generation/intro-two-of-three',
  schemaVersion: 1,
  title: 'Prologue - Microchapter II',
  meta: {
    chapterId: 'chapter-1',
    language: 'uk',
    defaultBackgroundId: 'prologue/backgrounds/thorn_estate_inner_corridor_late_afternoon',
    defaultMusicId: 'prologue/music/after_the_ridge',
    notes:
      'VN-oriented opening prologue flow. Microchapter II is authored as a standalone scene-generation document.',
    defaultStage: {
      characters: [
        {
          speakerId: 'mirella',
          emotion: 'composed',
          portraitId: 'prologue/portraits/mirella/composed.webp',
          placement: {
            x: 12,
            scale: 1.04,
          },
        },
        {
          speakerId: 'father',
          emotion: 'cold',
          portraitId: 'prologue/portraits/father/cold.webp',
          placement: {
            x: 88,
            scale: 1.14,
          },
        },
        {
          speakerId: 'mother',
          emotion: 'tired',
          portraitId: 'prologue/portraits/mother/tired.webp',
          placement: {
            x: 64,
            scale: 0.96,
            opacity: 0.86,
          },
        },
        {
          speakerId: 'aren',
          emotion: 'sharp',
          portraitId: 'chapter-1/portraits/aren/sharp.png',
          placement: {
            x: 46,
            scale: 0.94,
            opacity: 0.82,
          },
        },
        {
          speakerId: 'edran',
          emotion: 'neutral',
          portraitId: 'prologue/portraits/edran/neutral.webp',
          placement: {
            x: 28,
            scale: 0.92,
            opacity: 0.78,
          },
        },
      ],
      focusCharacterId: 'mirella',
    },
  },
  scenes: {
    'chapter-1/scene/intro/two-of-three': {
      id: 'chapter-1/scene/intro/two-of-three',
      mode: 'sequence',
      title: 'Дві з трьох',
      description:
        'Після гір небезпека перестає бути тільки зовнішньою. Тепер вона живе в родинній пам’яті, у неправильній близькості й у тих, хто ще здатен говорити правду без прикрас.',
      startNodeId: 'mc2_intro_001',
      backgroundId: 'prologue/backgrounds/thorn_estate_inner_corridor_late_afternoon',
      music: {
        action: 'play',
        musicId: 'prologue/music/after_the_ridge',
        fadeMs: 900,
        loop: true,
      },
      stage: {
        characters: [
          {
            speakerId: 'mirella',
            emotion: 'distant',
            portraitId: 'prologue/portraits/mirella/distant.webp',
            placement: {
              x: 14,
              scale: 1.06,
            },
          },
        ],
        focusCharacterId: 'mirella',
      },
      nodes: {
        mc2_intro_001: {
          id: 'mc2_intro_001',
          type: 'narration',
          title: 'Дім після гір',
          text: `Після гір дім не став іншим зовні.

Коридори так само стояли рівно й чисто. Слуги рухалися знайомими маршрутами. Десь у дальньому крилі вже носили коробки з тканинами до великої зали, де готували бал. Десь дзенькало срібло. Десь сперечалися про свічки, про розсадку, про вина, які не повинні виглядати бідніше за ті, що подадуть у Верденів чи Сорелів.

Усе це ще було домом Торнів.
Тим самим.
Дорогим.
Зібраним.
Правильним.

І все ж повітря стало іншим.

Ніби сам будинок уже знав: Мірелла бачила, з чого він зроблений насправді. Не з мармуру. Не зі світла. Не з традиції. А з поту, страху, мовчання, приниження і красивої мови, яка вміє називати все це необхідністю.`,
          sfx: [
            {
              sfxId: 'prologue/sfx/estate_corridor_soft_ambience',
              volume: 0.18,
            },
            {
              sfxId: 'prologue/sfx/distant_steps_stone',
              delayMs: 220,
              volume: 0.14,
            },
          ],
          onEnterEffects: [
            {
              type: 'setFlag',
              flagId: 'mc2.branch.grandmother',
              value: false,
            },
            {
              type: 'setFlag',
              flagId: 'mc2.branch.aren',
              value: false,
            },
            {
              type: 'setFlag',
              flagId: 'mc2.branch.edran',
              value: false,
            },
            {
              type: 'setFlag',
              flagId: 'mc2.branch.count',
              value: 0,
            },
          ],
          nextNodeId: 'mc2_intro_002',
        },
        mc2_intro_002: {
          id: 'mc2_intro_002',
          type: 'narration',
          text: `Батько знову існував як функція. Мати - як красива втома. Арен то з’являвся, то зникав, ніби сам не знав, до якої частини дому хоче належати сильніше: до тієї, що прийняла його, чи до тієї, яка ніколи не дасть йому забути, що його прийняли. Едран готувався до відльоту, і сама ця підготовка вже змінювала вагу кімнат.

Мірелла кілька разів ловила себе на дивному відчутті: якщо просто лишитися в цих коридорах і нічого не робити, дім почне думати замість неї.

Потрібно було рухатися.
Не для втечі.
Для вибору.
До тієї близькості, яка бодай ненадовго скине з себе гарний одяг.`,
          nextNodeId: 'mc2_hub_first',
        },
        mc2_hub_first: {
          id: 'mc2_hub_first',
          type: 'choice',
          speakerId: 'mirella',
          speakerSide: 'center',
          emotion: 'thinking',
          portraitId: 'prologue/portraits/mirella/thinking.webp',
          text: 'Куди Мірелла піде спершу?',
          choices: [
            {
              id: 'mc2_first_grandmother',
              tone: 'info',
              text: 'Прийняти поїздку до бабусі за місто.',
              effects: [
                {
                  type: 'setFlag',
                  flagId: 'mc2.branch.grandmother',
                  value: true,
                },
                {
                  type: 'setFlag',
                  flagId: 'mc2.branch.count',
                  value: 1,
                },
              ],
              nextNodeId: 'g_001_road',
            },
            {
              id: 'mc2_first_aren',
              tone: 'social',
              text: 'Піти на нижню галерею, де крутиться Арен.',
              effects: [
                {
                  type: 'setFlag',
                  flagId: 'mc2.branch.aren',
                  value: true,
                },
                {
                  type: 'setFlag',
                  flagId: 'mc2.branch.count',
                  value: 1,
                },
              ],
              nextNodeId: 'a_001_gallery',
            },
            {
              id: 'mc2_first_edran',
              tone: 'duty',
              text: 'Піти до тренувального майданчика, де збирається Едран.',
              effects: [
                {
                  type: 'setFlag',
                  flagId: 'mc2.branch.edran',
                  value: true,
                },
                {
                  type: 'setFlag',
                  flagId: 'mc2.branch.count',
                  value: 1,
                },
              ],
              nextNodeId: 'e_001_yard',
            },
          ],
        },
        g_001_road: {
          id: 'g_001_road',
          type: 'narration',
          title: 'Дорога за місто',
          backgroundId: 'prologue/backgrounds/road_to_old_estate_evening',
          transition: {
            type: 'fade',
            durationMs: 800,
          },
          music: {
            action: 'switch',
            musicId: 'prologue/music/blood_quiet',
            fadeMs: 800,
            loop: true,
          },
          text: `До бабусі ніколи не їхали як до родички, яку просто давно не бачили.

Поїздка до неї завжди нагадувала інше: визнання того, що в кожному великому роді є стара кімната пам’яті, яку не можна повністю замурувати, як би не хотілося.

За міськими рівнями дорога ставала простішою і правдивішою. Вітер - грубшим. Небо - більшим. Простір - менш слухняним. Будинки вже не стояли так, ніби їх довго вчили гарним манерам. Земля починала дихати сильніше за фасади.

Мірелла сиділа біля вікна екіпажа й дивилася, як місто повільно відсувається назад, разом із його блиском, храмами, обіцянками й добрим смаком. За межею центральних кварталів усе виглядало чесніше. Не краще. Але чесніше.

Саме тут ставало ясно: будинок Торнів був не природним станом світу, а дорогою й дуже впертою конструкцією поверх нього.`,
          sfx: [
            {
              sfxId: 'prologue/sfx/cart_road_soft',
              volume: 0.12,
            },
            {
              sfxId: 'prologue/sfx/window_wind_old_house',
              delayMs: 420,
              volume: 0.16,
            },
          ],
          nextNodeId: 'g_002_estate',
        },
        g_002_estate: {
          id: 'g_002_estate',
          type: 'narration',
          text: `Стара садиба бабусі стояла на пагорбі, який колись, мабуть, виглядав велично. Тепер він виглядав вперто. Світлий камінь фасаду був посічений дрібними тріщинами. Верхні вікна дивилися на світ гірше, ніж нижні. Будинок ще тримав форму - але вже не робив вигляд, що йому це дається легко.

Двері відчинила стара служниця, схожа на одну з тих жінок, які народжуються не стільки в родині, скільки в самому домі.

- Панна Мірелла, - сказала вона. - Пані сьогодні ясна.
- Це добре чи погано?
- Це рідко, - відповіла стара.`,
          nextNodeId: 'g_003_salon',
        },
        g_003_salon: {
          id: 'g_003_salon',
          type: 'narration',
          title: 'Зимовий салон',
          backgroundId: 'prologue/backgrounds/old_estate_winter_salon',
          transition: {
            type: 'fade',
            durationMs: 700,
          },
          text: `У зимовому салоні пахло старим деревом, сухими книгами, тканиною, яка пережила більше сезонів, ніж більшість людей довкола, і тим особливим родинним минулим, яке давно вже втратило блиск, але не вагу.

Бабуся сиділа біля вікна у високому кріслі. На шиї - нитка темних каменів. На обличчі - висушена, майже кістяна тонкість. В очах - не безумство.

Гірше.

Ясність, яка надто давно живе поруч із тріщиною, щоб ще називати її хворобою.`,
          sfx: [
            {
              sfxId: 'prologue/sfx/old_clock_soft',
              volume: 0.12,
            },
            {
              sfxId: 'prologue/sfx/window_wind_old_house',
              delayMs: 260,
              volume: 0.1,
            },
          ],
          sceneChange: {
            stage: {
              characters: [
                {
                  speakerId: 'grandmother',
                  emotion: 'clear',
                  portraitId: 'prologue/portraits/grandmother/clear.webp',
                  placement: {
                    x: 82,
                    scale: 1.04,
                  },
                },
                {
                  speakerId: 'mirella',
                  emotion: 'guarded',
                  portraitId: 'prologue/portraits/mirella/guarded.webp',
                  placement: {
                    x: 18,
                    scale: 1.06,
                  },
                },
              ],
              focusCharacterId: 'grandmother',
            },
          },
          nextNodeId: 'g_004_opening',
        },
        g_004_opening: {
          id: 'g_004_opening',
          type: 'dialogue',
          speakerId: 'grandmother',
          speakerSide: 'left',
          emotion: 'clear',
          portraitId: 'prologue/portraits/grandmother/clear.webp',
          text: 'Підійди. Я хочу зрозуміти, хто саме тебе вдягає.',
          nextNodeId: 'g_005_body',
        },
        g_005_body: {
          id: 'g_005_body',
          type: 'narration',
          text: `Мірелла сіла навпроти.

Спершу вони говорили про просте: про дорогу, про гори, про пил, який не любить красивих рукавів. Потім - уже не про просте. Бабуся питала не так, як питають родички. Вона роздивлялася Міреллу так, ніби намагалася побачити не тільки лице, а й те, що стоїть за ним.

- І як там пахне? - спитала вона.
- Пилом.
- Брешеш.
- Металом, потом і пилом.
- І страхом, - кивнула бабуся. - У вас у роді завжди добре пахло зверху і погано знизу.

Розмова пливла нерівно: про старі журнали Землі, які колись зберігали як святі зразки смаку; про жінок, що вміли носити тіло як броню; про чоловіків, які плутали владу з власною кісткою; про те, що гарний дім дуже часто є лише найдорогшою формою страху.`,
          nextNodeId: 'g_006_choice',
        },
        g_006_choice: {
          id: 'g_006_choice',
          type: 'choice',
          speakerId: 'mirella',
          speakerSide: 'center',
          emotion: 'thinking',
          portraitId: 'prologue/portraits/mirella/thinking.webp',
          text: 'Як Мірелла тримає цю розмову?',
          choices: [
            {
              id: 'g_006_listen',
              tone: 'social',
              text: 'Слухати серйозно, навіть якщо слова звучать дивно.',
              effects: [
                {
                  type: 'changeRelationship',
                  key: 'grandmother',
                  delta: 1,
                },
                {
                  type: 'changeStat',
                  key: 'will',
                  delta: 1,
                },
              ],
              nextNodeId: 'g_007_deep',
            },
            {
              id: 'g_006_ironize',
              tone: 'danger',
              text: 'Тримати іронію, не дозволяючи їй зайти надто глибоко.',
              effects: [
                {
                  type: 'changeStat',
                  key: 'superiority',
                  delta: 1,
                },
                {
                  type: 'changeRelationship',
                  key: 'grandmother',
                  delta: -1,
                },
              ],
              nextNodeId: 'g_007_deep',
            },
            {
              id: 'g_006_probe',
              tone: 'neutral',
              text: 'Поставити прямі питання й дивитися, чи витримає вона ясність.',
              effects: [
                {
                  type: 'changeStat',
                  key: 'machiavellianism',
                  delta: 1,
                },
              ],
              nextNodeId: 'g_007_deep',
            },
          ],
        },
        g_007_deep: {
          id: 'g_007_deep',
          type: 'narration',
          text: `Бабуся не ображалась ні на іронію, ні на прямоту. Здавалося, їй давно байдуже до ввічливості - лиш би слова ще тримали вагу.

- Ти була внизу лише раз, - сказала вона. - А вже дивишся на дім не так, як дивилась раніше.
- Це не складно.
- Ні. Складно інше. Не зрадіти надто швидко, коли в тріщину заходить правда.

Мірелла не відповіла.

- Коли з тобою заговорить щось не людське, - продовжила стара, - найнебезпечнішим буде не страх. А полегшення від того, що воно, можливо, виявиться чеснішим за людей твого дому.

Оце вже було сказано не як стара примха. А як пам’ять про щось, із чим ця жінка давно живе поруч.`,
          nextNodeId: 'g_008_gift',
        },
        g_008_gift: {
          id: 'g_008_gift',
          type: 'narration',
          text: `Наприкінці бабуся дістала зі шкатулки старий темний гребінь.

- Це було твоєї прабаби, - сказала вона. - Вона казала, що гарне волосся - останнє, що люди тримають як прапор, коли все інше вже здали.

Гребінь лежав у її сухих пальцях, як річ із тих часів, коли форма ще не була тільки декорацією.`,
          nextNodeId: 'g_009_take',
        },
        g_009_take: {
          id: 'g_009_take',
          type: 'choice',
          speakerId: 'mirella',
          speakerSide: 'center',
          emotion: 'guarded',
          portraitId: 'prologue/portraits/mirella/guarded.webp',
          text: 'Що вона робить із гребенем?',
          choices: [
            {
              id: 'g_009_take_silent',
              tone: 'info',
              text: 'Взяти його мовчки.',
              effects: [
                {
                  type: 'giveItem',
                  itemId: 'heirloom_comb',
                  quantity: 1,
                },
                {
                  type: 'changeRelationship',
                  key: 'grandmother',
                  delta: 1,
                },
              ],
              nextNodeId: 'return_from_branch',
            },
            {
              id: 'g_009_take_cold',
              tone: 'neutral',
              text: 'Взяти, але без вдячності.',
              effects: [
                {
                  type: 'giveItem',
                  itemId: 'heirloom_comb',
                  quantity: 1,
                },
                {
                  type: 'changeStat',
                  key: 'machiavellianism',
                  delta: 1,
                },
              ],
              nextNodeId: 'return_from_branch',
            },
            {
              id: 'g_009_refuse',
              tone: 'danger',
              text: 'Відмовитися й піти тільки зі словами.',
              effects: [
                {
                  type: 'changeRelationship',
                  key: 'grandmother',
                  delta: -1,
                },
                {
                  type: 'changeStat',
                  key: 'innocence',
                  delta: 1,
                },
              ],
              nextNodeId: 'return_from_branch',
            },
          ],
        },
        a_001_gallery: {
          id: 'a_001_gallery',
          type: 'narration',
          title: 'Нижня галерея',
          backgroundId: 'prologue/backgrounds/thorn_estate_lower_gallery_garden',
          transition: {
            type: 'fade',
            durationMs: 800,
          },
          music: {
            action: 'switch',
            musicId: 'prologue/music/nearer_than_safe',
            fadeMs: 800,
            loop: true,
          },
          text: `Нижня галерея була частиною дому, яка не виходила на гостей. Звідси видно було внутрішні сади, технічні доріжки, клітки з птахами, темніші стіни й той побутовий бік великого дому, який зазвичай не показують красиво.

Саме тому тут завжди було трохи небезпечніше. Менше ритуалу. Більше правди.

Саме тут Міреллу й знайшов Арен.`,
          sfx: [
            {
              sfxId: 'prologue/sfx/garden_birds_far',
              volume: 0.14,
            },
            {
              sfxId: 'prologue/sfx/peacock_far',
              delayMs: 420,
              volume: 0.11,
            },
          ],
          sceneChange: {
            stage: {
              characters: [
                {
                  speakerId: 'aren',
                  emotion: 'sharp',
                  portraitId: 'chapter-1/portraits/aren/sharp.png',
                },
                {
                  speakerId: 'mirella',
                  emotion: 'composed',
                  portraitId: 'prologue/portraits/mirella/composed.webp',
                },
              ],
              focusCharacterId: 'aren',
            },
          },
          nextNodeId: 'a_002_day',
        },
        a_002_day: {
          id: 'a_002_day',
          type: 'narration',
          text: `Удень із ним усе почалося майже нормально. Кілька звичних шпильок. Кілька півжартів. Потім - глибше.

- Ти дивишся на мене так, ніби я тут зайвий, - сказав він.
- Ні.
- Брешеш.

І раптом, майже без переходу, Арен заговорив уже не про сьогоднішній день, а про те, що насправді в ньому жило давно: про сім’ю, якої більше немає; про кімнати, що лишилися тільки запахом у пам’яті; про дім, який прийняв його як свого рівно настільки, наскільки це було красиво і зручно.

- Ти знаєш це як факт, - сказав він. - А я знаю це як відсутність.`,
          nextNodeId: 'a_003_choice',
        },
        a_003_choice: {
          id: 'a_003_choice',
          type: 'choice',
          speakerId: 'mirella',
          speakerSide: 'center',
          emotion: 'thinking',
          portraitId: 'prologue/portraits/mirella/thinking.webp',
          text: 'Як Мірелла відповідає на його біль?',
          choices: [
            {
              id: 'a_003_recognize',
              tone: 'social',
              text: 'Визнати, що він тут не так просто свій, як усі вдають.',
              effects: [
                {
                  type: 'changeRelationship',
                  key: 'aren',
                  delta: 1,
                },
                {
                  type: 'changeStat',
                  key: 'simplicity',
                  delta: 1,
                },
              ],
              nextNodeId: 'a_004_evening',
            },
            {
              id: 'a_003_needle',
              tone: 'danger',
              text: 'Вколоти його за голод до місця в цьому домі.',
              effects: [
                {
                  type: 'changeRelationship',
                  key: 'aren',
                  delta: -1,
                },
                {
                  type: 'changeStat',
                  key: 'superiority',
                  delta: 1,
                },
              ],
              nextNodeId: 'a_004_evening',
            },
            {
              id: 'a_003_deflect',
              tone: 'neutral',
              text: 'Не дати йому тепла, але й не добивати. Лишити це висіти між вами.',
              effects: [
                {
                  type: 'changeStat',
                  key: 'machiavellianism',
                  delta: 1,
                },
              ],
              nextNodeId: 'a_004_evening',
            },
          ],
        },
        a_004_evening: {
          id: 'a_004_evening',
          type: 'narration',
          title: 'Вечір у кімнаті Мірелли',
          backgroundId: 'prologue/backgrounds/mirella_room_night',
          transition: {
            type: 'fade',
            durationMs: 800,
          },
          tags: ['aren_branch', 'adult_image_sequence'],
          sceneChange: {
            stage: null,
          },
          text: `Увечері Арен зайшов до її кімнати без стуку.

Не як гість.
Як той, хто надто звик бути своїм.

У дзеркалі він виглядав старшим, ніж удень. Темніше світло робило його менше хлопцем і більше кимось, хто вже відчуває в тілі право на зайву близькість, але ще не вміє витримати її наслідки.

Спершу все ще трималося в межах слів.
Чи плакала вона.
Чи він тут чужий.
Чи бачить вона, наскільки дім перекручує тих, кого приймає.

Потім він узяв до рук її гребінь.
Підійшов ближче.
Занадто ближче.`,
          sfx: [
            {
              sfxId: 'prologue/sfx/night_hall_ambience',
              volume: 0.11,
            },
            {
              sfxId: 'prologue/sfx/room_door_close_soft',
              delayMs: 300,
              volume: 0.13,
            },
          ],
          nextNodeId: 'a_005_body',
        },
        a_005_body: {
          id: 'a_005_body',
          type: 'narration',
          tags: ['aren_branch', 'adult_image_sequence'],
          text: `Це не було прямим насильством.
І саме тому ставало ще брудніше.

Неправильна близькість, яка росте не з самого бажання навіть, а з деформованої домашньої залежності, втрати, сирітства й голоду до власного місця.

- Ти дивишся на мене так, ніби я теж винен у всьому, - сказав він.
- А ти ні?
- Не в усьому.

Його рука зависла там, де мала б уже зупинитися.
І в повітрі стало ясно: дім не просто виховує. Він ще й псує форми близькості раніше, ніж люди встигають їх назвати.`,
          nextNodeId: 'a_006_choice',
        },
        a_006_choice: {
          id: 'a_006_choice',
          type: 'choice',
          tags: ['aren_branch', 'adult_image_sequence'],
          speakerId: 'mirella',
          speakerSide: 'center',
          emotion: 'shaken',
          portraitId: 'prologue/portraits/mirella/shaken.webp',
          text: 'Що робить Мірелла в цю мить?',
          choices: [
            {
              id: 'a_006_cut',
              tone: 'danger',
              text: 'Різко й остаточно обірвати його.',
              effects: [
                {
                  type: 'changeRelationship',
                  key: 'aren',
                  delta: -2,
                },
                {
                  type: 'changeStat',
                  key: 'will',
                  delta: 1,
                },
              ],
              nextNodeId: 'a_007_exit',
            },
            {
              id: 'a_006_ambiguity',
              tone: 'neutral',
              text: 'Не дати йому права, але й не закрити тему до кінця.',
              effects: [
                {
                  type: 'changeRelationship',
                  key: 'aren',
                  delta: 1,
                },
                {
                  type: 'changeStat',
                  key: 'machiavellianism',
                  delta: 1,
                },
              ],
              nextNodeId: 'a_007_exit',
            },
            {
              id: 'a_006_fear',
              tone: 'social',
              text: 'Показати страх і тим самим змусити його самого побачити межу.',
              effects: [
                {
                  type: 'changeRelationship',
                  key: 'aren',
                  delta: -1,
                },
                {
                  type: 'changeStat',
                  key: 'innocence',
                  delta: -1,
                },
              ],
              nextNodeId: 'a_007_exit',
            },
          ],
        },
        a_007_exit: {
          id: 'a_007_exit',
          type: 'narration',
          text: `Арен відступив сам.

Наче злякався не її, а того, наскільки близько підійшов до правди про самого себе.

Після нього в кімнаті лишився не слід тіла, а гірший присмак: розуміння, що домашня небезпека найчастіше не кричить і не ламає двері. Вона приходить тихо, своїм обличчям, і довго вдає, що ще не перейшла межу.`,
          nextNodeId: 'return_from_branch',
        },
        e_001_yard: {
          id: 'e_001_yard',
          type: 'narration',
          title: 'Тренувальний майданчик',
          backgroundId: 'prologue/backgrounds/thorn_estate_training_yard_evening',
          transition: {
            type: 'fade',
            durationMs: 800,
          },
          text: `На тренувальному майданчику пахло маслом, шкірою і сухим металом. Мірелла перебирала патрони без справжньої мети, коли її знайшов Едран.

- Якщо й далі триматимеш їх так, - сказав він, - вони образяться ще до пострілу.`,
          sfx: [
            {
              sfxId: 'prologue/sfx/training_yard_wind_soft',
              volume: 0.15,
            },
            {
              sfxId: 'prologue/sfx/metal_small_shift',
              delayMs: 220,
              volume: 0.12,
            },
          ],
          sceneChange: {
            stage: {
              characters: [
                {
                  speakerId: 'edran',
                  emotion: 'neutral',
                  portraitId: 'prologue/portraits/edran/neutral.webp',
                  placement: {
                    x: 82,
                    scale: 1.02,
                  },
                },
                {
                  speakerId: 'mirella',
                  emotion: 'guarded',
                  portraitId: 'prologue/portraits/mirella/guarded.webp',
                  placement: {
                    x: 18,
                    scale: 1.06,
                  },
                },
              ],
              focusCharacterId: 'edran',
            },
          },
          nextNodeId: 'e_002_lesson',
        },
        e_002_lesson: {
          id: 'e_002_lesson',
          type: 'narration',
          text: `Він дав їй пістоль, поправив хват, лікті, кут кисті. Торкався рівно настільки, наскільки потрібно. У ньому не було ні зайвого права, ні солодкої м’якості - лише точність.

- Не стискай так, ніби хочеш покарати зброю, - сказав він. - Вона цього не оцінить.
- А які руки вона любить?
- Ті, що не брешуть.

Перший постріл вийшов поганим. Другий - кращим. Третій уже нагадував, що тіло теж може вчитися не тільки красі.`,
          sfx: [
            {
              sfxId: 'prologue/sfx/training_pistol_single',
              delayMs: 360,
              volume: 0.18,
            },
          ],
          nextNodeId: 'e_003_talk',
        },
        e_003_talk: {
          id: 'e_003_talk',
          type: 'narration',
          text: `Потім вони сіли на лаву, і розмова стала прямішою.

Едран назвав батькову мрію про бездоганну Міреллу тим, чим вона була насправді: бажанням поставити живу людину на правильну полицю.

- Бездоганність - чудова річ, якщо ти ваза, - сказав він. - Для людини це зазвичай означає, що її дуже зручно тримати там, де треба іншим.

Він говорив без прикрас. Саме тому його слова важили більше, ніж багатослівні істини інших людей у цьому домі.

- Сила, яку всі звикли терпіти, - не те саме, що сила, яку справді поважають, - сказав він.
- І яка в нас удома?
- Обидві. Саме тому цей дім досі стоїть.`,
          nextNodeId: 'e_004_choice',
        },
        e_004_choice: {
          id: 'e_004_choice',
          type: 'choice',
          speakerId: 'mirella',
          speakerSide: 'center',
          emotion: 'thinking',
          portraitId: 'prologue/portraits/mirella/thinking.webp',
          text: 'Його правда не просила ні ніжності, ні віри, але все одно вимагала від неї відповіді.',
          choices: [
            {
              id: 'e_004_accept',
              tone: 'duty',
              text: 'Прийняти її як рідкісну форму опори.',
              effects: [
                {
                  type: 'changeRelationship',
                  key: 'edran',
                  delta: 2,
                },
                {
                  type: 'changeStat',
                  key: 'honor',
                  delta: 1,
                },
              ],
              nextNodeId: 'e_005_knife',
            },
            {
              id: 'e_004_resist',
              tone: 'danger',
              text: 'Побачити в ньому людину, яка завжди говорить правильно вже після того, як програла місце.',
              effects: [
                {
                  type: 'changeRelationship',
                  key: 'edran',
                  delta: -1,
                },
                {
                  type: 'changeStat',
                  key: 'superiority',
                  delta: 1,
                },
              ],
              nextNodeId: 'e_005_knife',
            },
            {
              id: 'e_004_store',
              tone: 'neutral',
              text: 'Нічого не вирішувати зараз. Просто запам’ятати його слова.',
              effects: [
                {
                  type: 'changeStat',
                  key: 'machiavellianism',
                  delta: 1,
                },
              ],
              nextNodeId: 'e_005_knife',
            },
          ],
        },
        e_005_knife: {
          id: 'e_005_knife',
          type: 'narration',
          text: `Наприкінці Едран простягнув їй невеликий складаний ніж.

- На.
- Ти даєш мені зброю на прощання?
- Ні. Я даю тобі звичку мати щось своє.

Він помовчав, тоді додав:

- Не поспішай вірити людям, які ніколи не програвали. Дуже часто це не сила. Це просто любов світу до правильної брехні.`,
          nextNodeId: 'e_006_take',
        },
        e_006_take: {
          id: 'e_006_take',
          type: 'choice',
          speakerId: 'mirella',
          speakerSide: 'center',
          emotion: 'guarded',
          portraitId: 'prologue/portraits/mirella/guarded.webp',
          text: 'Ніж лежав між ними не як подарунок, а як спосіб запам’ятати цю розмову руками.',
          choices: [
            {
              id: 'e_006_take_open',
              tone: 'info',
              text: 'Взяти ніж і прийняти його вагу.',
              effects: [
                {
                  type: 'giveItem',
                  itemId: 'edran_folding_knife',
                  quantity: 1,
                },
                {
                  type: 'changeRelationship',
                  key: 'edran',
                  delta: 1,
                },
              ],
              nextNodeId: 'return_from_branch',
            },
            {
              id: 'e_006_take_cold',
              tone: 'neutral',
              text: 'Взяти, але без видимої вдячності.',
              effects: [
                {
                  type: 'giveItem',
                  itemId: 'edran_folding_knife',
                  quantity: 1,
                },
                {
                  type: 'changeStat',
                  key: 'machiavellianism',
                  delta: 1,
                },
              ],
              nextNodeId: 'return_from_branch',
            },
            {
              id: 'e_006_refuse',
              tone: 'danger',
              text: 'Відмовитися, щоб не брати на себе його правду разом із річчю.',
              effects: [
                {
                  type: 'changeRelationship',
                  key: 'edran',
                  delta: -1,
                },
                {
                  type: 'changeStat',
                  key: 'innocence',
                  delta: 1,
                },
              ],
              nextNodeId: 'return_from_branch',
            },
          ],
        },
        return_from_branch: {
          id: 'return_from_branch',
          type: 'narration',
          backgroundId: 'prologue/backgrounds/thorn_estate_evening_hall_silent',
          transition: {
            type: 'fade',
            durationMs: 650,
          },
          music: {
            action: 'switch',
            musicId: 'prologue/music/after_the_ridge',
            fadeMs: 700,
            loop: true,
          },
          text: `Коли Мірелла поверталася назад у дім, він здавався тим самим - і водночас уже не тим самим.

Після кожної близькості тут залишався не слід події, а зміщення повітря. Коридори були все ті ж. Лампи - ті ж. Пауза за столом - та сама.

Але між людьми ставало важче дихати.`,
          sfx: [
            {
              sfxId: 'prologue/sfx/evening_hall_soft',
              volume: 0.12,
            },
          ],
          nextNodeId: 'mc2_branch_router',
        },
        mc2_branch_router: {
          id: 'mc2_branch_router',
          type: 'choice',
          speakerId: 'mirella',
          speakerSide: 'center',
          emotion: 'thinking',
          portraitId: 'prologue/portraits/mirella/thinking.webp',
          text: 'На сьогодні з неї вже зняли занадто багато покривал, але день ще не закінчився.',
          choices: [
            {
              id: 'mc2_go_second_hub',
              tone: 'neutral',
              text: 'Так. Ще одну.',
              conditions: [
                {
                  type: 'flag',
                  flagId: 'mc2.branch.count',
                  operator: 'lte',
                  value: 1,
                },
              ],
              nextNodeId: 'mc2_hub_second',
            },
            {
              id: 'mc2_go_convergence',
              tone: 'neutral',
              text: 'Досить. Повернутися в тишу дому.',
              conditions: [
                {
                  type: 'flag',
                  flagId: 'mc2.branch.count',
                  operator: 'gte',
                  value: 2,
                },
              ],
              nextNodeId: 'mc2_convergence',
            },
          ],
        },
        mc2_hub_second: {
          id: 'mc2_hub_second',
          type: 'choice',
          speakerId: 'mirella',
          speakerSide: 'center',
          emotion: 'thinking',
          portraitId: 'prologue/portraits/mirella/thinking.webp',
          text: 'Якщо відкривати ще одну тріщину в цьому домі, треба було вирішити, до кого йти далі.',
          choices: [
            {
              id: 'mc2_second_grandmother',
              tone: 'info',
              text: 'Поїхати до бабусі.',
              conditions: [
                {
                  type: 'flagEquals',
                  flagId: 'mc2.branch.grandmother',
                  value: false,
                },
              ],
              effects: [
                {
                  type: 'setFlag',
                  flagId: 'mc2.branch.grandmother',
                  value: true,
                },
                {
                  type: 'setFlag',
                  flagId: 'mc2.branch.count',
                  value: 2,
                },
              ],
              nextNodeId: 'g_001_road',
            },
            {
              id: 'mc2_second_aren',
              tone: 'social',
              text: 'Знайти Арена.',
              conditions: [
                {
                  type: 'flagEquals',
                  flagId: 'mc2.branch.aren',
                  value: false,
                },
              ],
              effects: [
                {
                  type: 'setFlag',
                  flagId: 'mc2.branch.aren',
                  value: true,
                },
                {
                  type: 'setFlag',
                  flagId: 'mc2.branch.count',
                  value: 2,
                },
              ],
              nextNodeId: 'a_001_gallery',
            },
            {
              id: 'mc2_second_edran',
              tone: 'duty',
              text: 'Піти до Едрана.',
              conditions: [
                {
                  type: 'flagEquals',
                  flagId: 'mc2.branch.edran',
                  value: false,
                },
              ],
              effects: [
                {
                  type: 'setFlag',
                  flagId: 'mc2.branch.edran',
                  value: true,
                },
                {
                  type: 'setFlag',
                  flagId: 'mc2.branch.count',
                  value: 2,
                },
              ],
              nextNodeId: 'e_001_yard',
            },
          ],
        },
        mc2_convergence: {
          id: 'mc2_convergence',
          type: 'narration',
          title: 'Після двох ліній',
          backgroundId: 'prologue/backgrounds/thorn_estate_evening_hall_silent',
          transition: {
            type: 'fade',
            durationMs: 700,
          },
          text: `Після двох із трьох близькостей дім уже не міг здаватися просто домом.

Він став сіткою невимовленого.

Якщо Мірелла була в бабусі, у ній лишилися слова, які пахли старою правдою й дивною ясністю. Якщо була лінія Арена - дім утратив тілесну безпечність. Якщо була лінія Едрана - з’явилася твереза опора, яка саме тому боліла сильніше, бо ось-ось мала зникнути.

І поруч із усім цим лишалася ще одна відсутня лінія.
Те, чого не сталося.
Те, чого вона не побачила.
І ця відсутність теж працювала всередині неї, як тиха порожнина в кістці.`,
          nextNodeId: 'mc2_evening_table',
        },
        mc2_evening_table: {
          id: 'mc2_evening_table',
          type: 'narration',
          text: `Увечері за столом усі поводилися майже правильно.

Саме це й було нестерпно.

Батько говорив про маршрути й супровід. Мати - про тканини до балу, ніби лінія плеча у сукні може зупинити розпад не гірше за озброєну охорону. Арен або мовчав надто довго, або встрявав не туди. Едран уже належав відльоту більше, ніж дому.

Мірелла сиділа рівно й відчувала, що навіть звук приборів об тарілки тепер нагадує дисципліну, яка втомилася прикидатися домашньою звичкою.`,
          nextNodeId: 'mc2_departure_001',
        },
        mc2_departure_001: {
          id: 'mc2_departure_001',
          type: 'narration',
          title: 'Відліт Едрана',
          backgroundId: 'prologue/backgrounds/thorn_estate_east_platform_night',
          transition: {
            type: 'fade',
            durationMs: 800,
          },
          text: `На східній платформі вітер уже був нічний. Місто внизу світилося, ніби саме себе підтримувало в темряві.

Едран відлітав.

Навіть якщо Мірелла не обрала його лінію, сам факт його від’їзду важив. Бо разом із ним із дому виносили одну з небагатьох присутностей, поруч із якою брехня гірше вдавала норму.`,
          sfx: [
            {
              sfxId: 'prologue/sfx/night_platform_wind',
              volume: 0.16,
            },
            {
              sfxId: 'prologue/sfx/airship_engine_departure',
              delayMs: 420,
              volume: 0.18,
            },
          ],
          sceneChange: {
            stage: {
              characters: [
                {
                  speakerId: 'mirella',
                  emotion: 'guarded',
                  portraitId: 'prologue/portraits/mirella/guarded.webp',
                  placement: {
                    x: 18,
                    scale: 1.06,
                  },
                },
                {
                  speakerId: 'edran',
                  emotion: 'neutral',
                  portraitId: 'prologue/portraits/edran/neutral.webp',
                  placement: {
                    x: 82,
                    scale: 1.03,
                  },
                },
              ],
              focusCharacterId: 'edran',
            },
          },
          nextNodeId: 'mc2_departure_002',
        },
        mc2_departure_002: {
          id: 'mc2_departure_002',
          type: 'narration',
          text: `Прощання було коротким.
Саме таким, яке болить довше.

Батько потис брату руку так, ніби підтверджував маршрут, а не прощався. Мати поцілувала його в щоку. Арен обійняв незграбно, ніби соромився щирості. Коли черга дійшла до Мірелли, Едран затримав на ній погляд трохи довше.

- Тримайся, - сказав він.
- Нудне слово.
- Гарні слова гірше тримають форму.

Якщо між ними було більше довіри, його голос ставав м’якшим. Якщо менше - лише точнішим. Але в будь-якому разі після нього в домі ставало менше повітря.`,
          nextNodeId: 'mc2_summary',
        },
        mc2_summary: {
          id: 'mc2_summary',
          type: 'narration',
          title: 'Кінець мікроглави II',
          text: `У домі стало тихіше не тому, що всі заспокоїлись.
А тому, що після двох близькостей Мірелла краще почула, скільки в ньому було невимовленого.
І як дорого іноді коштує те, що не сталося.

Осі та стосунки знову змінилися залежно від двох обраних ліній.

Моральний слід:
Не всяка близькість лікує.
І не всяка відсутність є порожнечею.`,
          onEnterEffects: [
            {
              type: 'setFlag',
              flagId: 'chapter1.prologue.microchapter2.completed',
              value: true,
            },
          ],
          nextSceneId: 'chapter-1/scene/intro/ball-and-assault',
        },
      },
    },
  },
} satisfies SceneGenerationDocument;
