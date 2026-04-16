import type { SceneGenerationDocument } from '@engine/types/sceneGeneration';

export const chapter1IntroBallAndAssaultSceneGenerationDocument = {
  id: 'chapter-1/scene-generation/intro-ball-and-assault',
  schemaVersion: 1,
  title: 'Prologue - Microchapter III',
  meta: {
    chapterId: 'chapter-1',
    language: 'uk',
    defaultBackgroundId: 'prologue/backgrounds/thorn_estate_dressing_room_late_day',
    defaultMusicId: 'prologue/music/veil_before_fire',
    notes:
      'VN-oriented opening prologue flow. Microchapter III is authored as a standalone scene-generation document.',
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
    'chapter-1/scene/intro/ball-and-assault': {
      id: 'chapter-1/scene/intro/ball-and-assault',
      mode: 'sequence',
      title: 'Бал і штурм',
      description:
        'Дім готується до публічної демонстрації сили, коли стара ненависть і чужа воля входять у нього в найправильнішу мить.',
      startNodeId: 'mc3_001_intro',
      backgroundId: 'prologue/backgrounds/thorn_estate_dressing_room_late_day',
      music: {
        action: 'play',
        musicId: 'prologue/music/veil_before_fire',
        fadeMs: 900,
        loop: true,
      },
      stage: {
        characters: [
          {
            speakerId: 'mirella',
            emotion: 'guarded',
            portraitId: 'prologue/portraits/mirella/guarded.webp',
            placement: {
              x: 14,
              scale: 1.06,
            },
          },
        ],
        focusCharacterId: 'mirella',
      },
      nodes: {
        mc3_001_intro: {
          id: 'mc3_001_intro',
          type: 'narration',
          title: 'Перед балом',
          text: `Після відльоту Едрана дім не заспокоївся. Навпаки - ніби ще міцніше вчепився у власну форму.

Мірелла зрозуміла це не розумом, а тілом. Усе навколо наче стало акуратнішим на півподиху: голоси слуг тихіші, тканини розкладені точніше, срібло натерте уважніше, погляди довші, але обережніші. Так завжди буває з великими домами, коли вони чують під собою тріщину. Вони не стають чеснішими. Вони стають красивішими.

Бал мав відбутися незабаром. Не як свято, а як відповідь. Як заява. Як розкішна усмішка роду, який не може дозволити іншим домам побачити, що рука, яка тримає гори, вже втомлюється.

Мірелла стояла в примірочній перед високим дзеркалом, а довкола неї жили тканини, голки, коробки з прикрасами й жіночі руки, які ще вчора могли б здаватися нешкідливими. Тепер навіть вони виглядали частиною великого домашнього механізму, що мав вивести її до світла в правильній формі.`,
          sfx: [
            {
              sfxId: 'prologue/sfx/fabric_layers_soft',
              volume: 0.14,
            },
            {
              sfxId: 'prologue/sfx/dressing_room_small_metal',
              delayMs: 240,
              volume: 0.12,
            },
          ],
          nextNodeId: 'mc3_002_mother_dressing',
        },
        mc3_002_mother_dressing: {
          id: 'mc3_002_mother_dressing',
          type: 'narration',
          text: `Мати стояла поруч у світлій сукні для примірки, ще не застебнутій до кінця. На її плечах лежав той тип втоми, який багаті люди навчилися добре носити: не як слабкість, а як додатковий шар елегантності.

- Не сутулься, - сказала вона, поправляючи лінію плеча на Міреллі. - Ти починаєш думати, що все це смішно. Це видно.

- А воно не смішно? - спитала Мірелла.

Мати на мить затримала руки на тканині.

- Смішно, - сказала вона тихо. - Але смішне дуже часто тримає людей довше, ніж правда.

Мірелла глянула в дзеркало. Світла тканина спадала по ній гарно. Надто гарно. Вона раптом відчула себе не людиною в одязі, а поверхнею, на яку дім наносить останній лак перед показом.`,
          nextNodeId: 'mc3_003_choice_dress',
        },
        mc3_003_choice_dress: {
          id: 'mc3_003_choice_dress',
          type: 'choice',
          speakerId: 'mirella',
          speakerSide: 'center',
          emotion: 'thinking',
          portraitId: 'prologue/portraits/mirella/thinking.webp',
          text: 'У цій красі було щось майже образливе, але відвернутися від неї до кінця Мірелла теж не могла.',
          choices: [
            {
              id: 'mc3_accept_armor',
              tone: 'duty',
              text: 'Прийняти красу як броню. Нехай дім хоч цим платить за право користуватися нею.',
              effects: [
                {
                  type: 'changeStat',
                  key: 'will',
                  delta: 1,
                },
                {
                  type: 'changeStat',
                  key: 'machiavellianism',
                  delta: 1,
                },
              ],
              nextNodeId: 'mc3_004_mother_followup',
            },
            {
              id: 'mc3_feel_disgust',
              tone: 'danger',
              text: 'Відчути до всього цього відразу й не приховати її повністю.',
              effects: [
                {
                  type: 'changeStat',
                  key: 'honor',
                  delta: 1,
                },
                {
                  type: 'changeRelationship',
                  key: 'mother',
                  delta: -1,
                },
              ],
              nextNodeId: 'mc3_004_mother_followup',
            },
            {
              id: 'mc3_hold_double_truth',
              tone: 'neutral',
              text: 'Зрозуміти, що це огидно, але все одно може знадобитися.',
              effects: [
                {
                  type: 'changeStat',
                  key: 'machiavellianism',
                  delta: 1,
                },
                {
                  type: 'changeStat',
                  key: 'will',
                  delta: 1,
                },
              ],
              nextNodeId: 'mc3_004_mother_followup',
            },
          ],
        },
        mc3_004_mother_followup: {
          id: 'mc3_004_mother_followup',
          type: 'narration',
          text: `Мати відступила на крок і подивилася на Міреллу так, ніби оцінювала не тільки посадку тканини, а й те, наскільки далеко в ній уже зайшла тріщина.

- Сорелі майже точно приїдуть, - сказала вона. - Вердени теж, якщо захочуть побачити, як ми дихаємо після гір. Отці з Крила Блиску вже підтвердили присутність. Це буде гарний вечір.

- Або дуже дорогий театр, - сказала Мірелла.

Мати не заперечила.

- У великих домах, - відповіла вона, - це часто одне й те саме.`,
          nextNodeId: 'mc3_005_corridor_to_father',
        },
        mc3_005_corridor_to_father: {
          id: 'mc3_005_corridor_to_father',
          type: 'narration',
          title: 'Кабінет і бал',
          backgroundId: 'prologue/backgrounds/thorn_estate_outer_cabinet_corridor_evening',
          transition: {
            type: 'fade',
            durationMs: 700,
          },
          text: `Пізніше, проходячи повз кабінет батька, Мірелла почула голоси. Власне, не голоси - голос батька й материні паузи. Так у цьому домі завжди й відбувалися серйозні розмови: один називав речі, інша вирішувала, скільки тиші треба між ними, щоб усе не здалося занадто голим.

Двері були не зачинені до кінця.

- Якщо ми зараз скасуємо бал, - говорив батько, - це означатиме, що чутки з гір мають вагу.

- А якщо не скасуємо? - спитала мати.

- Значить, усі побачать, що Торни досі тримають гори, місто і власний дім одночасно.

- Навіть якщо це вже не зовсім правда?

На мить стало тихо. Потім батько відповів:

- Особливо якщо це вже не зовсім правда.`,
          sfx: [
            {
              sfxId: 'prologue/sfx/hall_tension_silence',
              volume: 0.08,
            },
          ],
          nextNodeId: 'mc3_006_narration_power',
        },
        mc3_006_narration_power: {
          id: 'mc3_006_narration_power',
          type: 'narration',
          text: `Оце і було ядро їхнього роду. Не чистота. Не шляхетність. Не навіть жорстокість сама по собі.

А здатність тримати форму тоді, коли правда вже сиплеться з-під неї.

Мірелла відійшла від дверей, не бажаючи більше чути. Але голос батька ще довго стояв у неї в голові, ніби залізний каркас під дорогою тканиною.

Внизу, в центральних залах, уже починали готувати музику. На столах перевіряли срібло. У повітрі змішувалися аромат свічного воску, квітів і майбутньої публічної брехні.`,
          nextNodeId: 'mc3_007_hall_preparation',
        },
        mc3_007_hall_preparation: {
          id: 'mc3_007_hall_preparation',
          type: 'narration',
          title: 'Дім перед виставою',
          backgroundId: 'prologue/backgrounds/thorn_estate_grand_hall_prep_evening',
          transition: {
            type: 'fade',
            durationMs: 800,
          },
          music: {
            action: 'switch',
            musicId: 'prologue/music/gilded_surface',
            fadeMs: 850,
            loop: true,
          },
          text: `У великий зал уже несли підсвічники. Музиканти перевіряли місця, ще без гри, лише короткими пробними звуками. Слуги рухалися так, ніби йшлося не про бал, а про операцію, у якій жоден жест не має права бути зайвим.

Арен сперечався з кимось із охорони біля східного проходу - різко, але стишено, щоб не робити зі злості виставу. Батько проходив крізь кімнати з виразом людини, яка не просто контролює підготовку, а власним поглядом тримає будинок у зборі. Мати перевіряла квіти так, ніби кожна гілка мала не тільки стояти красиво, а й знати своє місце в ієрархії вечора.

Мірелла раптом зрозуміла, що в цьому домі навіть свято не є відпочинком від сили.
Свято - це її парадна форма.`,
          sfx: [
            {
              sfxId: 'prologue/sfx/silver_table_light_clink',
              volume: 0.12,
            },
            {
              sfxId: 'prologue/sfx/musicians_tuning_far',
              delayMs: 320,
              volume: 0.1,
            },
          ],
          nextNodeId: 'mc3_008_choice_focus',
        },
        mc3_008_choice_focus: {
          id: 'mc3_008_choice_focus',
          type: 'choice',
          speakerId: 'mirella',
          speakerSide: 'center',
          emotion: 'thinking',
          portraitId: 'prologue/portraits/mirella/thinking.webp',
          text: 'Поки дім збирав себе до вечора, ще можна було побачити, що саме він насправді захищає.',
          choices: [
            {
              id: 'mc3_watch_father',
              tone: 'duty',
              text: 'Дивитися на батька і вчитися, як він тримає дім самим тілом.',
              effects: [
                {
                  type: 'changeRelationship',
                  key: 'father',
                  delta: 1,
                },
                {
                  type: 'changeStat',
                  key: 'will',
                  delta: 1,
                },
              ],
              nextNodeId: 'mc3_009_pre_attack',
            },
            {
              id: 'mc3_watch_mother',
              tone: 'social',
              text: 'Дивитися на матір і бачити, як краса може бути роботою, а не даром.',
              effects: [
                {
                  type: 'changeRelationship',
                  key: 'mother',
                  delta: 1,
                },
                {
                  type: 'changeStat',
                  key: 'simplicity',
                  delta: 1,
                },
              ],
              nextNodeId: 'mc3_009_pre_attack',
            },
            {
              id: 'mc3_watch_house',
              tone: 'neutral',
              text: 'Дивитися на сам дім як на машину, що готується пережити чужий погляд.',
              effects: [
                {
                  type: 'changeStat',
                  key: 'machiavellianism',
                  delta: 1,
                },
              ],
              nextNodeId: 'mc3_009_pre_attack',
            },
          ],
        },
        mc3_009_pre_attack: {
          id: 'mc3_009_pre_attack',
          type: 'narration',
          text: `І саме тоді, коли дім уже майже вдягнувся для майбутнього вечора, перший звук прийшов не як крик.

Глухий удар.
Десь у західному крилі.

Він не був схожий на впущений піднос чи зірвану шафу. У ньому відразу чулося щось гірше: сила, яка вже не питає дозволу в меблів, стін і ранкового порядку.

Усі завмерли не тому, що зрозуміли. А тому, що тіло розуміє загрозу швидше, ніж розум знаходить для неї назву.`,
          music: {
            action: 'switch',
            musicId: 'prologue/music/first_crack',
            fadeMs: 400,
            loop: true,
          },
          sfx: [
            {
              sfxId: 'prologue/sfx/heavy_distant_impact',
              volume: 0.28,
            },
          ],
          nextNodeId: 'mc3_010_second_impact',
        },
        mc3_010_second_impact: {
          id: 'mc3_010_second_impact',
          type: 'narration',
          text: `Потім був другий удар.
Довший.
Гірший.

За ним - тріск скла.
За ним - жіночий крик.
За ним - уже не сумнів.

Двері з боку західних сходів розчинилися так різко, що вдарили об стіну. На порозі з’явився охоронець, сірий обличчям, ніби в нього з тіла вже вийшла частина крові.

- Гугони! - крикнув він. - Західний вхід прорвали!`,
          sfx: [
            {
              sfxId: 'prologue/sfx/glass_break_far',
              delayMs: 120,
              volume: 0.24,
            },
            {
              sfxId: 'prologue/sfx/woman_scream_far',
              delayMs: 280,
              volume: 0.2,
            },
            {
              sfxId: 'prologue/sfx/door_burst_open',
              delayMs: 420,
              volume: 0.26,
            },
          ],
          nextNodeId: 'mc3_011_father_entry',
        },
        mc3_011_father_entry: {
          id: 'mc3_011_father_entry',
          type: 'narration',
          text: `Батько влетів у зал через мить.

І в ньому не лишилося нічого домашнього.

Не чоловік за столом.
Не господар балу.
Не навіть батько в звичному сенсі.

Лише чиста функція волі.

- Внутрішній сектор, - сказав він. - Зараз.

Мати повернулась до нього.
- Як вони зайшли?
- Потім.
- Хто їх-
- Потім.

У цьому "потім" уже було все: і те, що він зрозумів масштаб удару, і те, що зараз важливіше не правда, а порядок руху.`,
          sceneChange: {
            stage: {
              characters: [
                {
                  speakerId: 'mirella',
                  emotion: 'shaken',
                  portraitId: 'prologue/portraits/mirella/shaken.webp',
                  placement: {
                    x: 18,
                    scale: 1.08,
                  },
                },
                {
                  speakerId: 'aren',
                  emotion: 'sharp',
                  portraitId: 'chapter-1/portraits/aren/sharp.png',
                  placement: {
                    x: 44,
                    scale: 0.98,
                    opacity: 0.9,
                  },
                },
                {
                  speakerId: 'mother',
                  emotion: 'afraid',
                  portraitId: 'prologue/portraits/mother/held.webp',
                  placement: {
                    x: 68,
                    scale: 1,
                    opacity: 0.92,
                  },
                },
                {
                  speakerId: 'father',
                  emotion: 'cold',
                  portraitId: 'prologue/portraits/father/battle_cold.webp',
                  placement: {
                    x: 88,
                    scale: 1.18,
                  },
                },
              ],
              focusCharacterId: 'father',
            },
          },
          nextNodeId: 'mc3_012_corridor_run',
        },
        mc3_012_corridor_run: {
          id: 'mc3_012_corridor_run',
          type: 'narration',
          title: 'Біг коридорами',
          backgroundId: 'prologue/backgrounds/thorn_estate_main_corridor_attack',
          transition: {
            type: 'cut',
            durationMs: 250,
          },
          music: {
            action: 'switch',
            musicId: 'prologue/music/house_under_assault',
            fadeMs: 350,
            loop: true,
          },
          text: `Будинок ожив не як дім, а як живий організм, у який увійшов біль.

Коридори, створені для розміру й величі, раптом стали пастками. Високі стелі посилили луну чужих кроків. Скляні вставки в стінах світилися тривожними відблисками. З-за кутів вибігали слуги - хтось зі сріблом у руках, хтось із тканиною, хтось уже просто з голими очима людини, яка ще не встигла вирішити, чи можна тут кричати.

Арен ішов поруч різко, на межі того стану, коли юнак хоче довести, що він уже чоловік, саме в ту хвилину, коли це найнебезпечніше. Мати трималася прямо, але Мірелла бачила: ще трохи - і її краса перестане бути формою, а стане лише тілом, яке намагається не впасти.`,
          sfx: [
            {
              sfxId: 'prologue/sfx/running_steps_stone_group',
              volume: 0.22,
            },
            {
              sfxId: 'prologue/sfx/alarm_mechanical_far',
              delayMs: 320,
              volume: 0.14,
            },
          ],
          nextNodeId: 'mc3_013_choice_run',
        },
        mc3_013_choice_run: {
          id: 'mc3_013_choice_run',
          type: 'choice',
          speakerId: 'mirella',
          speakerSide: 'center',
          emotion: 'shaken',
          portraitId: 'prologue/portraits/mirella/shaken.webp',
          text: 'Коли форма дому тріснула вголос, тіло саме шукало, за що вхопитися першим.',
          choices: [
            {
              id: 'mc3_run_to_mother',
              tone: 'social',
              text: 'Триматися ближче до матері.',
              effects: [
                {
                  type: 'changeRelationship',
                  key: 'mother',
                  delta: 1,
                },
              ],
              nextNodeId: 'mc3_014_gughons',
            },
            {
              id: 'mc3_run_watch_father',
              tone: 'duty',
              text: 'Стежити за батьком і його рухами, ніби саме він ще утримує стіни.',
              effects: [
                {
                  type: 'changeRelationship',
                  key: 'father',
                  delta: 1,
                },
                {
                  type: 'changeStat',
                  key: 'will',
                  delta: 1,
                },
              ],
              nextNodeId: 'mc3_014_gughons',
            },
            {
              id: 'mc3_run_hold_self',
              tone: 'neutral',
              text: 'Не чіплятися ні за кого. Просто зібрати себе і йти.',
              effects: [
                {
                  type: 'changeStat',
                  key: 'will',
                  delta: 1,
                },
                {
                  type: 'changeStat',
                  key: 'machiavellianism',
                  delta: 1,
                },
              ],
              nextNodeId: 'mc3_014_gughons',
            },
          ],
        },
        mc3_014_gughons: {
          id: 'mc3_014_gughons',
          type: 'narration',
          text: `На верхній галереї з’явилися гугони.

Не як рівний ворог і не як красивий заколот.
Як стара ненависть, яка нарешті дісталася до дорогого килима.

Брудні, в сажі, з червоними шматками тканини на плечах і руках, вони рухалися не шляхетно, але переконано. У їхніх обличчях не було стилю, тільки голодна впевненість, що будинок на їхніх очах втрачає недоторканність.

І тоді один із них побачив матір.`,
          nextNodeId: 'mc3_015_grab',
        },
        mc3_015_grab: {
          id: 'mc3_015_grab',
          type: 'narration',
          title: 'Рука на шиї',
          backgroundId: 'prologue/backgrounds/thorn_estate_upper_gallery_attack',
          transition: {
            type: 'cut',
            durationMs: 200,
          },
          text: `Усе сталося майже за секунду.

Мати саме озирнулася назад, ніби хотіла щось сказати Міреллі, - і гуґон уже був біля неї. Великий, у попелі, з широкою рукою, в якій бруд і сила давно перестали бути різними речами. Він схопив її за шию й притягнув до себе так грубо, ніби хотів не просто взяти заручницю, а принизити саму ідею її краси, її світла, її високості.

Мати видихнула різко. Не закричала спершу - лише втратила форму в плечах.

- Дивіться! - крикнув гуґон униз, хрипко, майже радісно. - Оце ваші пані! Оце ваш блиск!`,
          sfx: [
            {
              sfxId: 'prologue/sfx/body_grab_hard',
              volume: 0.24,
            },
            {
              sfxId: 'prologue/sfx/crowd_shout_near',
              delayMs: 260,
              volume: 0.18,
            },
          ],
          nextNodeId: 'mc3_016_father_choice_no_choice',
        },
        mc3_016_father_choice_no_choice: {
          id: 'mc3_016_father_choice_no_choice',
          type: 'narration',
          text: `І саме тоді батько його побачив.

У цю мить у нього не залишилося жодної зручної ролі.
Не голови дому.
Не господаря балу.
Не людини, яка ще може все вирішити холодно.

Лишилося тільки одне:
вибір, який не є вибором.

Він пішов до неї одразу.
Без паузи.
Без наказу.
Без красивого маневру.

Мірелла раптом побачила в ньому не рід, не титул, не руку, яка карає. Просто чоловіка, який вирішив, що в цю хвилину існує тільки одна точка світу - та, де в чужій руці його жінка.`,
          nextNodeId: 'mc3_017_rescue',
        },
        mc3_017_rescue: {
          id: 'mc3_017_rescue',
          type: 'narration',
          text: `Батько вистрілив раз.
Гуґон смикнувся, але не впав.
Ще крок.
Ще ближче.
Ще один рух збоку - один із нападників кинувся йому назустріч, але батько вдарив швидше, ніж той устиг наблизитися як слід.

Мати була затиснута між тілом чужинця і поруччям галереї. Світла тканина на її плечі вже потемніла від чужих пальців. У цю секунду вона не була аристократкою, не була господинею дому, не була навіть просто матір’ю. Вона була тілом, яке от-от вирвуть із його форми й перетворять на чийсь трофей.

Батько кинувся вперед.
Удар.
Крик.
Темна кров на світлому рукаві.
Гуґон падає.
Мати виривається.`,
          sfx: [
            {
              sfxId: 'prologue/sfx/pistol_shot_close',
              volume: 0.26,
            },
            {
              sfxId: 'prologue/sfx/impact_body_metal',
              delayMs: 180,
              volume: 0.22,
            },
            {
              sfxId: 'prologue/sfx/body_fall_stairs_side',
              delayMs: 320,
              volume: 0.2,
            },
          ],
          nextNodeId: 'mc3_018_fatal_blow',
        },
        mc3_018_fatal_blow: {
          id: 'mc3_018_fatal_blow',
          type: 'narration',
          text: `І саме в цю мить, коли мати вже вислизнула з чужої руки, прийшов інший удар.

Зліва.
З диму.
З тієї брудної периферії бою, яку неможливо тримати в очах повністю.

Мірелла потім ніколи не буде певна, що це було першим - куля чи лезо. В її пам’яті вони злилися в одне: темне, швидке, остаточне.

Батько смикнувся так, ніби хтось раптом грубо поправив його поставу.

Але він ще стояв.
Ще встиг відштовхнути матір убік.
Ще встиг сказати їй щось коротке - може ім’я, може наказ, може всього лише видих.
І тільки після цього почав падати.`,
          sfx: [
            {
              sfxId: 'prologue/sfx/blade_or_shot_ambiguous',
              volume: 0.24,
            },
            {
              sfxId: 'prologue/sfx/body_hit_soft_heavy',
              delayMs: 180,
              volume: 0.22,
            },
          ],
          nextNodeId: 'mc3_019_fall',
        },
        mc3_019_fall: {
          id: 'mc3_019_fall',
          type: 'narration',
          text: `Найстрашнішим було те, що він не впав одразу мертвим.

Він упав ще живим рівно настільки, щоб будинок устиг змінити звук.

До цієї миті все ще здавалося, ніби дім тримається хоч і тріснуто, але все ж тримається. Ніби його воля, його холод, його жорстокість і його звичка бути центром порядку можуть ще зібрати розсипане назад.

Але коли він упав, разом із ним впала не тільки людина.
Впав сам спосіб, яким будинок досі називав себе силою.

Мірелла дивилася - і не могла ні закричати, ні побігти одразу.

Їй стало ясно щось нестерпне:
він був жорстоким.
Лицемірним.
Страшним.
І все ж у найгіршу мить вибрав не рід, не бал, не репутацію, не гори.
А матір.

І тепер його вже неможливо було звести до однієї правди.`,
          music: {
            action: 'switch',
            musicId: 'prologue/music/fall_of_order',
            fadeMs: 500,
            loop: true,
          },
          nextNodeId: 'mc3_020_choice_after_fall',
        },
        mc3_020_choice_after_fall: {
          id: 'mc3_020_choice_after_fall',
          type: 'choice',
          speakerId: 'mirella',
          speakerSide: 'center',
          emotion: 'broken',
          portraitId: 'prologue/portraits/mirella/broken.webp',
          text: 'Після пострілу світ ще рухався, але вже не підкорявся жодній звичній логіці.',
          choices: [
            {
              id: 'mc3_reach_father',
              tone: 'duty',
              text: 'Смикнутися до батька, хоч це вже майже неможливо.',
              effects: [
                {
                  type: 'changeRelationship',
                  key: 'father',
                  delta: 2,
                },
                {
                  type: 'changeStat',
                  key: 'innocence',
                  delta: -1,
                },
              ],
              nextNodeId: 'mc3_021_aren_pull',
            },
            {
              id: 'mc3_hold_mother',
              tone: 'social',
              text: 'Рвонути до матері, яка ще жива тільки завдяки його тілу.',
              effects: [
                {
                  type: 'changeRelationship',
                  key: 'mother',
                  delta: 2,
                },
              ],
              nextNodeId: 'mc3_021_aren_pull',
            },
            {
              id: 'mc3_freeze',
              tone: 'neutral',
              text: 'Завмерти на мить, бо світ уже перестав бути читабельним.',
              effects: [
                {
                  type: 'changeStat',
                  key: 'will',
                  delta: -1,
                },
                {
                  type: 'changeStat',
                  key: 'innocence',
                  delta: -1,
                },
              ],
              nextNodeId: 'mc3_021_aren_pull',
            },
          ],
        },
        mc3_021_aren_pull: {
          id: 'mc3_021_aren_pull',
          type: 'narration',
          text: `Арен схопив її за руку.

- Пішли! - крикнув він.

Його лице вже не було юним у тому зручному сенсі, який ще можна пробачити. Воно стало гострішим. Реальнішим. У ньому з’явилося щось від людей, які раптом зрозуміли: у них більше немає даху, за яким можна дорослішати повільно.

Мати щось кричала зі сходів - не слова навіть, а команду самого тіла, яке лишилося живим ціною чужого. Навколо ще билися, бігли, падали. Скло сипалося з верхніх прольотів. Дим уже влізав у простір, де ще недавно мали грати музиканти.`,
          nextNodeId: 'mc3_022_inner_sector',
        },
        mc3_022_inner_sector: {
          id: 'mc3_022_inner_sector',
          type: 'narration',
          title: 'Внутрішній сектор',
          backgroundId: 'prologue/backgrounds/thorn_estate_inner_sector_archives',
          transition: {
            type: 'fade',
            durationMs: 700,
          },
          text: `Вони добігли до внутрішнього сектора майже навпомацки - крізь коридори, які вже втратили свою велич і стали просто шляхом між страхом і стіною.

Архівна кімната зустріла їх густим, мертвим спокоєм. Товсті стіни. Металеві футляри для родових записів. Високі шафи. Запах сухого пилу, старого паперу і глухої матерії. Тут дім завжди тримав те, що вважав важливішим за живу людину: документи, печатки, пам’ять про себе самого.

Арен зачинив важку стулку й засунув засув. Від зовнішнього світу залишилися глухі удари, далекі постріли й той страшний хаос, який уже не відрізняє парадні сходи від бійні.`,
          sfx: [
            {
              sfxId: 'prologue/sfx/heavy_door_shut',
              volume: 0.24,
            },
            {
              sfxId: 'prologue/sfx/lock_bar_slide',
              delayMs: 180,
              volume: 0.2,
            },
            {
              sfxId: 'prologue/sfx/muffled_battle_far',
              delayMs: 280,
              volume: 0.12,
            },
          ],
          nextNodeId: 'mc3_023_archive_choice',
        },
        mc3_023_archive_choice: {
          id: 'mc3_023_archive_choice',
          type: 'choice',
          speakerId: 'mirella',
          speakerSide: 'center',
          emotion: 'broken',
          portraitId: 'prologue/portraits/mirella/broken.webp',
          text: 'Коли над домом уже валився цілий світ, із собою можна було взяти тільки те, що переживе його падіння.',
          choices: [
            {
              id: 'mc3_take_personal',
              tone: 'social',
              text: 'Тільки особисті речі: те, що ще має вагу для неї, а не для роду.',
              effects: [
                {
                  type: 'setFlag',
                  flagId: 'chapter1.prologue.escape.focus',
                  value: 'personal',
                },
                {
                  type: 'changeStat',
                  key: 'simplicity',
                  delta: 1,
                },
              ],
              nextNodeId: 'mc3_024_items_result',
            },
            {
              id: 'mc3_take_symbol',
              tone: 'duty',
              text: 'Шукати щось родове: печатку, знак, пам’ять про дім.',
              effects: [
                {
                  type: 'giveItem',
                  itemId: 'thorn_seal_fragment',
                  quantity: 1,
                },
                {
                  type: 'setFlag',
                  flagId: 'chapter1.prologue.escape.focus',
                  value: 'house',
                },
                {
                  type: 'changeStat',
                  key: 'honor',
                  delta: 1,
                },
              ],
              nextNodeId: 'mc3_024_items_result',
            },
            {
              id: 'mc3_take_weapon_and_memory',
              tone: 'neutral',
              text: 'Взяти те, що допоможе жити далі, і те, що не дасть забути.',
              effects: [
                {
                  type: 'setFlag',
                  flagId: 'chapter1.prologue.escape.focus',
                  value: 'survival_and_memory',
                },
                {
                  type: 'changeStat',
                  key: 'will',
                  delta: 1,
                },
                {
                  type: 'changeStat',
                  key: 'machiavellianism',
                  delta: 1,
                },
              ],
              nextNodeId: 'mc3_024_items_result',
            },
          ],
        },
        mc3_024_items_result: {
          id: 'mc3_024_items_result',
          type: 'narration',
          text: `У цю хвилину все родове виглядало дивно дрібним. Документи, печатки, книги, метали - усе те, що ще вранці здавалося важким, тепер стало майже неживим.

Мірелла взяла те, що рука обрала швидше за думку.
Якщо в неї вже був старий гребінь - він пішов із нею. Якщо був ніж Едрана - теж. Якщо вона обрала знак роду, то взяла його не з любові, а з лютого розуміння, що навіть мертвий дім ще довго тягнутиме за собою живих.

Арен уже відкривав люк у підземний хід.`,
          nextNodeId: 'mc3_025_descent',
        },
        mc3_025_descent: {
          id: 'mc3_025_descent',
          type: 'narration',
          title: 'Підземний хід',
          backgroundId: 'prologue/backgrounds/thorn_estate_escape_tunnel_dark',
          transition: {
            type: 'fade',
            durationMs: 750,
          },
          music: {
            action: 'switch',
            musicId: 'prologue/music/after_the_fall',
            fadeMs: 700,
            loop: true,
          },
          text: `Хід під домом пахнув вологим каменем, старим металом і втечею ще до того, як люди зробили перший крок. Над ними все ще жив штурм - уже глухо, крізь товщу стін і перекриттів, але досить виразно, щоб не забути: будинок нагорі не просто горить. Він втрачає право бути собою.

Вони спускалися майже навпомацки. Попереду - Арен, різкий, задиханий, занадто живий після всього. Позаду, у Міреллі в голові, ще стояла галерея, рука гугона на шиї матері, батьків крок уперед і те нестерпне місце правди, в якому людина може бути потворною майже все життя - і все одно померти так, що ти вже не зведеш її до однієї назви.`,
          sfx: [
            {
              sfxId: 'prologue/sfx/underground_drip_dark',
              volume: 0.1,
            },
            {
              sfxId: 'prologue/sfx/steps_stone_tunnel',
              delayMs: 240,
              volume: 0.16,
            },
          ],
          nextNodeId: 'mc3_026_tunnel_exchange',
        },
        mc3_026_tunnel_exchange: {
          id: 'mc3_026_tunnel_exchange',
          type: 'narration',
          text: `Коли вони дісталися до технічної камери з аварійним виходом, Арен нарешті сперся на стіну й важко задихав.

Його лице було біле, майже прозоре.

- Він мертвий, - сказав він.

Мірелла не відповіла.

- Ти чуєш? - різкіше кинув Арен. - Він мертвий.

- Не кажи це так, - прошепотіла вона.

- А як? Красиво?

Вона повернулася до нього.

- Просто замовкни.

І він замовк.

Не через послух. Через те, що в цю хвилину вже не було слів, які не принижували б подію самим фактом свого існування.`,
          nextNodeId: 'mc3_027_final_image',
        },
        mc3_027_final_image: {
          id: 'mc3_027_final_image',
          type: 'narration',
          text: `Вони стояли в темряві, двоє дітей дому, який ще не встиг остаточно догоріти, але вже перестав бути їхнім захистом.

Нагорі лишалися:
мертвий батько,
врятована ним мати,
зал, де мала звучати музика,
срібло, яке вже не мало кому блищати,
і дім, що весь ранок так уперто готувався до вистави сили, а ввечері впав у найстарішу правду будь-якої форми - у руйнування.

Мірелла стиснула в руці те, що взяла із собою.
Предмет.
Пам’ять.
Лезо.
Знак.
Щось мале проти всього, що тільки-но закінчилося.

І вперше їй стало страшно не тільки через втрату.
А через інше:
через те, що частина її все ще хотіла, щоб батько підвівся.`,
          nextNodeId: 'mc3_summary',
        },
        mc3_summary: {
          id: 'mc3_summary',
          type: 'narration',
          title: 'Кінець мікроглави III',
          text: `Бал не почався.
Але дім устиг показати своє справжнє обличчя: навіть перед смертю він намагався тримати поставу.

Коли впав батько, разом із ним упав не лише захист.
Упав сам спосіб, яким Мірелла досі розуміла силу.

Осі й стосунки знову змінилися залежно від того, за що вона вхопилася в руйнуванні.

Моральний слід:
Людина може бути потворною все життя - і все одно померти так, що її буде неможливо звести до однієї правди.`,
          onEnterEffects: [
            {
              type: 'setFlag',
              flagId: 'chapter1.prologue.microchapter3.completed',
              value: true,
            },
          ],
          nextSceneId: 'chapter-1/scene/prison-fall',
        },
      },
    },
  },
} satisfies SceneGenerationDocument;
