import type { SceneGenerationDocument } from '@engine/types/sceneGeneration';

export const chapter1IntroSceneGenerationDocument = {
  id: 'chapter-1/scene-generation/intro',
  schemaVersion: 1,
  title: 'Prologue - Microchapter I',
  meta: {
    chapterId: 'chapter-1',
    language: 'uk',
    defaultBackgroundId: 'prologue/backgrounds/thorn_estate_mirella_room_morning',
    defaultMusicId: 'prologue/music/house_of_form',
    notes:
      'VN-oriented opening prologue flow. Microchapter I is authored as a standalone scene-generation document.',
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
    'chapter-1/scene/intro': {
      id: 'chapter-1/scene/intro',
      mode: 'sequence',
      title: 'Повернення з гірських шахт',
      description:
        "A descent from polished aristocratic form into the bone of the family's power, then a return home already split by what was seen below.",
      startNodeId: 's1_intro',
      replay: {
        enabled: true,
      },
      backgroundId: 'prologue/backgrounds/thorn_estate_mirella_room_morning',
      music: {
        action: 'play',
        musicId: 'prologue/music/house_of_form',
        fadeMs: 900,
        loop: true,
      },
      stage: {
        characters: [
          {
            speakerId: 'mirella',
            emotion: 'waking',
            portraitId: 'prologue/portraits/mirella/waking.webp',
            placement: {
              x: 14,
              scale: 1.08,
            },
          },
        ],
        focusCharacterId: 'mirella',
      },
      nodes: {
        s1_intro: {
          id: 's1_intro',
          type: 'narration',
          title: 'Morning in the Thorn House',
          text: `Ранок у домі Торнів починався не зі світла.

Світло приходило вже на готовий порядок: на відсунуті штори, срібло без плям, налиту воду для вмивання, на дім, який встиг зібрати себе у форму ще до того, як прокинулися люди.

Мірелла розплющила очі раніше, ніж почула стук. Кілька секунд лежала нерухомо, дивлячись у бліду тканину балдахіна, і це були єдині чесні секунди ранку. У них тіло ще могло належати само собі.`,
          sfx: [
            {
              sfxId: 'prologue/sfx/morning_wind_soft',
              volume: 0.35,
            },
            {
              sfxId: 'prologue/sfx/house_metal_chime_far',
              delayMs: 220,
              volume: 0.18,
            },
            {
              sfxId: 'prologue/sfx/door_soft_knock',
              delayMs: 480,
              volume: 0.42,
            },
          ],
          onEnterEffects: [
            {
              type: 'setFlag',
              flagId: 'chapter1.prologue.seen',
              value: true,
            },
            {
              type: 'setCharacterOutfit',
              characterId: 'mirella',
              outfitId: 'dress-pristine',
            },
          ],
          nextNodeId: 's1_servant_entry',
        },
        s1_servant_entry: {
          id: 's1_servant_entry',
          type: 'dialogue',
          speakerId: 'servant_girl',
          speakerSide: 'left',
          emotion: 'careful',
          portraitId: 'prologue/portraits/servant_girl/careful.webp',
          text: 'Пані. Ваша матір просила не спізнюватися.',
          nextNodeId: 's1_room_narration',
        },
        s1_room_narration: {
          id: 's1_room_narration',
          type: 'narration',
          text: `Тобто батько вже встав.
Тобто день уже почався не для всіх однаково.

Кімната ще тримала ранковий холод. Срібна миска трохи ламала відбиток її лиця, і на мить Міреллі здалося, що очі в дзеркалі не зовсім її - темніші, уважніші, старші.

Служниця відкрила шафу.
- Для дороги попелясту, пані?
- Ні. Червону.
Служниця підняла брови.
- Для ранкового виїзду?
- Для батькових справ я не вдягну синю, - сказала Мірелла. - Мені шкода синю.`,
          sfx: [
            {
              sfxId: 'prologue/sfx/fabric_lift_soft',
              volume: 0.24,
            },
          ],
          nextNodeId: 's1_corset',
        },
        s1_corset: {
          id: 's1_corset',
          type: 'narration',
          text: `Служниця подала сорочку, потім червоний корсет і взялася за шнурівку. Рухи в неї були хороші: без поспіху, без метушні, саме такі, які любили в домі Торнів.

Коли останній ряд ліг на спині, Мірелла побачила в дзеркалі не себе, а служницю. Грубий ліф натягувався на її важких грудях так щільно, що це виглядало майже як виклик. У кімнаті, де все мало бути стриманим, охайним і дорогим, її тіло раптом здалося чимось занадто живим.
Похабством.
Або чесністю, якої тут бракувало.

Служниця теж зрозуміла, куди впав погляд. Але рук не відсмикнула.`,
          sfx: [
            {
              sfxId: 'prologue/sfx/corset_pull',
              volume: 0.28,
            },
            {
              sfxId: 'prologue/sfx/cloth_shift_soft',
              delayMs: 180,
              volume: 0.16,
            },
          ],
          nextNodeId: 's1_reaction',
        },
        s1_reaction: {
          id: 's1_reaction',
          type: 'choice',
          speakerId: 'mirella',
          speakerSide: 'center',
          emotion: 'cool',
          portraitId: 'prologue/portraits/mirella/cool.webp',
          text: 'Мірелла могла назвати це похабщиною, похвалити цю тілесну зухвалість або залишити напругу без слів.',
          choices: [
            {
              id: 's1_reaction_cold',
              tone: 'danger',
              text: 'Назвати це похабщиною: "Прибери це. Похабщина теж мусить знати своє місце."',
              effects: [
                {
                  type: 'changeStat',
                  key: 'superiority',
                  delta: 1,
                },
                {
                  type: 'changeRelationship',
                  key: 'servants',
                  delta: -1,
                },
              ],
              nextNodeId: 's1_after_cold',
            },
            {
              id: 's1_reaction_ironic',
              tone: 'neutral',
              text: 'Похвалити: "Сміливо. У твоєму ліфі більше життя, ніж у всій цій кімнаті."',
              effects: [
                {
                  type: 'changeStat',
                  key: 'machiavellianism',
                  delta: 1,
                },
                {
                  type: 'changeRelationship',
                  key: 'servants',
                  delta: 1,
                },
              ],
              nextNodeId: 's1_after_ironic',
            },
            {
              id: 's1_reaction_soft',
              tone: 'social',
              text: 'Змовчати: дати їй зрозуміти, що все помічено, але нічого не подаровано.',
              effects: [
                {
                  type: 'changeStat',
                  key: 'paranoia',
                  delta: 1,
                },
              ],
              nextNodeId: 's1_after_soft',
            },
          ],
        },
        s1_after_cold: {
          id: 's1_after_cold',
          type: 'narration',
          text: `Служниця сіпнула виріз угору так різко, ніби Мірелла вдарила не словом, а пальцями.
- Пробачте, пані.

Відтепер кожен її рух став сухим і дрібним. Саме так рухаються люди, які вже зрозуміли: тут навіть тіло можуть покарати за зайву правду.`,
          nextNodeId: 's1_after_reaction',
        },
        s1_after_ironic: {
          id: 's1_after_ironic',
          type: 'narration',
          text: `Служниця здригнулася сильніше, ніж від докору. На щоках спалахнув колір.
- Ви жартуєте, пані.

Ні, подумала Мірелла. Саме це й було найнебезпечніше.

Після цього між ними зависла крихка, неправильна спільність: не близькість, а знання, що межа тут уже тріснула.`,
          nextNodeId: 's1_after_reaction',
        },
        s1_after_soft: {
          id: 's1_after_soft',
          type: 'narration',
          text: `Мірелла нічого не сказала. Служниця теж. Лише затягнула останній вузол трохи тугіше і нарешті відступила.

Мовчання виявилося не милосердям, а способом лишити борг невимовленим.`,
          nextNodeId: 's1_after_reaction',
        },
        s1_after_reaction: {
          id: 's1_after_reaction',
          type: 'narration',
          text: `Мірелла нічого не відповіла. Лише провела пальцем по горлу, ніби перевіряючи, чи дихання все ще її.

Волосся їй заплели простіше, ніж для гостей. Для поїздки в гори не треба було виглядати святково. Там не потребували краси. Там потребували прізвища.
Іноді - тільки його.`,
          nextNodeId: 's1_transition',
        },
        s1_transition: {
          id: 's1_transition',
          type: 'narration',
          text: 'Коли Мірелла вийшла з кімнати, дім уже прокинувся повністю. Коридори стояли чисті, мов після молитви. На сходах не було ні пилу, ні крику, ні випадкових людей. Усе навколо вчило одному й тому самому: якщо достатньо добре прибрати поверхню, можна довго вдавати, ніби гниль унизу не стосується тебе.',
          nextNodeId: 's2_intro',
        },
        s2_intro: {
          id: 's2_intro',
          type: 'narration',
          title: 'Сніданок і розмова про гори',
          backgroundId: 'prologue/backgrounds/thorn_estate_dining_hall_morning',
          transition: {
            type: 'fade',
            durationMs: 700,
          },
          text: `За столом уже зібралися всі.

Батько сидів на своєму місці так, ніби не він у ньому сидів, а саме крісло, стіл і кімната виросли навколо нього. Перед ним лежали листи, звіти, охоронні донесення, рахунки, маршрути і нотатки для міської ради. Його ранок починався не з їжі. З контролю.`,
          sfx: [
            {
              sfxId: 'prologue/sfx/silver_table_light_clink',
              volume: 0.22,
            },
            {
              sfxId: 'prologue/sfx/paper_rustle',
              delayMs: 160,
              volume: 0.18,
            },
          ],
          sceneChange: {
            stage: {
              characters: [
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
                {
                  speakerId: 'mirella',
                  emotion: 'composed',
                  portraitId: 'prologue/portraits/mirella/composed.webp',
                  placement: {
                    x: 12,
                    scale: 1.04,
                  },
                },
              ],
              focusCharacterId: 'father',
            },
          },
          nextNodeId: 's2_family_setup',
        },
        s2_family_setup: {
          id: 's2_family_setup',
          type: 'narration',
          text: 'Мати сиділа праворуч - бездоганно зібрана, блідіша, ніж дозволяв би здоровий сон. На повіках лежав тонкий золотий пил, яким вона колись учила Міреллу працювати за старими земними журналами, ніби за мудрими книгами. Ліворуч - Едран, молодший брат батька, спокійний і занадто тверезий для цього дому. Навпроти сидів Арен - двоюрідний брат, вихований тут після загибелі його сім’ї. Не чужий. Але й не до кінця свій у тій глибині, де це по-справжньому щось значить.',
          nextNodeId: 's2_opening_lines',
        },
        s2_opening_lines: {
          id: 's2_opening_lines',
          type: 'dialogue',
          speakerId: 'father',
          speakerSide: 'left',
          emotion: 'cold',
          portraitId: 'prologue/portraits/father/cold.webp',
          text: 'Ти запізнилася.',
          nextNodeId: 's2_response_chain',
        },
        s2_response_chain: {
          id: 's2_response_chain',
          type: 'narration',
          text: `- На хвилину.
- У тебе є розкіш думати, що хвилини нашого дому дешевші за хвилини інших?
- Ми їдемо лише у твоїх справах.

Батько підняв погляд.
- У мого дому не буває "лише справ". Уночі охорона зняла на північному маршруті двох людей із листівками повстанців. До вечора про це говоритимуть мої друзі в раді, наші конкуренти в горах і кожен, хто любить чужу слабкість більше, ніж власний прибуток.`,
          nextNodeId: 's2_table_balance',
        },
        s2_table_balance: {
          id: 's2_table_balance',
          type: 'narration',
          text: `Мати навіть не підвищила голосу.
- Тоді сьогодні нам потрібне лице без паніки. Свята Кардашян не дарма вчила: коли рід тріщить, він мусить блищати ще дорожче.

Арен усміхнувся краєм рота.
- Зручно, коли навіть святі говорять мовою ювелірів і банкірів.

Едран поклав виделку.
- Повстанці ростуть швидше там, де охорона б'є краще, ніж слухає.`,
          nextNodeId: 's2_competition_block',
        },
        s2_competition_block: {
          id: 's2_competition_block',
          type: 'narration',
          text: 'Батько навіть не подивився на Арена, коли відповів Едранові. Розмова вже перейшла до зміни варти, до цін на південні жили, до домів, які купили б паніку Торнів гуртом, якби це можна було провести через рахунки. За його сухістю чулося головне: Торни не одні в цьому світі. Достатньо однієї тріщини в дисципліні, і її відчують не тільки в горах, а й за чужими столами.',
          nextNodeId: 's2_small_choice',
        },
        s2_small_choice: {
          id: 's2_small_choice',
          type: 'choice',
          speakerId: 'mirella',
          speakerSide: 'center',
          emotion: 'thinking',
          portraitId: 'prologue/portraits/mirella/thinking.webp',
          text: 'За столом уже не говорили про манери. Тут вирішували, чия правда сьогодні коштуватиме дорожче.',
          choices: [
            {
              id: 's2_support_father',
              tone: 'duty',
              text: 'Підтримати батька: "Слабкість дому першими купують не повстанці, а сусіди."',
              effects: [
                {
                  type: 'changeStat',
                  key: 'superiority',
                  delta: 1,
                },
                {
                  type: 'changeRelationship',
                  key: 'father',
                  delta: 1,
                },
              ],
              nextNodeId: 's2_after_support_father',
            },
            {
              id: 's2_observe',
              tone: 'neutral',
              text: 'Вколоти матір: "Якщо ваша віра вчить тільки блищати, то це вже торг, не світло."',
              effects: [
                {
                  type: 'changeStat',
                  key: 'machiavellianism',
                  delta: 1,
                },
                {
                  type: 'changeRelationship',
                  key: 'mother',
                  delta: -1,
                },
              ],
              nextNodeId: 's2_after_observe',
            },
            {
              id: 's2_side_with_edran',
              tone: 'social',
              text: 'Підтримати Едрана: "Людей ламають швидше, ніж кріплення. Потім це називають порядком."',
              effects: [
                {
                  type: 'changeStat',
                  key: 'honor',
                  delta: 1,
                },
                {
                  type: 'changeRelationship',
                  key: 'edran',
                  delta: 1,
                },
                {
                  type: 'changeRelationship',
                  key: 'father',
                  delta: -1,
                },
              ],
              nextNodeId: 's2_after_side_with_edran',
            },
            {
              id: 's2_needle_aren',
              tone: 'danger',
              text: 'Підколоти Арена: "Чужим голодом легко жартувати з повною тарілкою."',
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
              nextNodeId: 's2_after_needle_aren',
            },
          ],
        },
        s2_after_support_father: {
          id: 's2_after_support_father',
          type: 'narration',
          text: `Батько не похвалив її. Лише коротко кивнув, ніби ставив підпис під уже очікуваною відповіддю.

Мати торкнулася чашки, не дивлячись на Міреллу. Едран запам’ятав її слова, і це було гірше за суперечку.`,
          nextNodeId: 's2_after_choice',
        },
        s2_after_observe: {
          id: 's2_after_observe',
          type: 'narration',
          text: `Мати вперше подивилася на неї прямо.
- Світло теж продають, Мірелло, - сказала вона рівно. - Просто багаті називають це смаком.

За столом стало тихіше, ніж після крику.`,
          nextNodeId: 's2_after_choice',
        },
        s2_after_side_with_edran: {
          id: 's2_after_side_with_edran',
          type: 'narration',
          text: `Батько підняв на Міреллу той самий спокійний погляд, яким у домі міряли не дітей, а ризики.
- Коли падає уступ, його не зупиняє моральна чистота, - сказав він. - Його зупиняє порядок.

Мати не втрутилася. Арен усміхнувся так, ніби ця тріщина його лише підбадьорила.`,
          nextNodeId: 's2_after_choice',
        },
        s2_after_needle_aren: {
          id: 's2_after_needle_aren',
          type: 'narration',
          text: `Арен тихо засміявся, але в сміху не було легкості.
- Добре, що в цьому домі голод завжди помічають у тих, хто не народився з повною тарілкою.

Мати різко поклала ніж на порцеляну, і цього вистачило, щоб він замовк.`,
          nextNodeId: 's2_after_choice',
        },
        s2_after_choice: {
          id: 's2_after_choice',
          type: 'narration',
          text: 'Після сніданку ніхто не повертався до сказаного вголос. Але кожне слово лишилося за столом, мов прибор, який ще доведеться взяти до рук. Дім одразу перейшов у ритм від’їзду. Навіть поспіх тут умів виглядати як дисципліна.',
          nextNodeId: 's3_platform',
        },
        s3_platform: {
          id: 's3_platform',
          type: 'narration',
          title: 'Східна платформа',
          backgroundId: 'prologue/backgrounds/thorn_estate_east_platform_day',
          transition: {
            type: 'fade',
            durationMs: 700,
          },
          music: {
            action: 'switch',
            musicId: 'prologue/music/over_the_ridge',
            fadeMs: 850,
            loop: true,
          },
          text: `Платформа східного крила була останнім місцем, де Торни ще виглядали як дім, а не як механізм.

Звідси Еліріон здавався зібраним, майже переконливим. Досить було підняти очі далі за міські фасади, щоб побачити іншу правду: гори, порізані шахтами, сигнальними вежами й чужими маршрутами.`,
          sfx: [
            {
              sfxId: 'prologue/sfx/mountain_wind_light',
              volume: 0.28,
            },
            {
              sfxId: 'prologue/sfx/airship_engine_low',
              delayMs: 420,
              volume: 0.24,
            },
          ],
          sceneChange: {
            stage: {
              characters: [
                {
                  speakerId: 'mirella',
                  emotion: 'composed',
                  portraitId: 'prologue/portraits/mirella/composed.webp',
                  placement: {
                    x: 12,
                    scale: 1.06,
                  },
                },
                {
                  speakerId: 'edran',
                  emotion: 'neutral',
                  portraitId: 'prologue/portraits/edran/neutral.webp',
                  placement: {
                    x: 30,
                    scale: 0.92,
                    opacity: 0.8,
                  },
                },
                {
                  speakerId: 'aren',
                  emotion: 'sharp',
                  portraitId: 'chapter-1/portraits/aren/sharp.png',
                  placement: {
                    x: 48,
                    scale: 0.95,
                    opacity: 0.84,
                  },
                },
                {
                  speakerId: 'mother',
                  emotion: 'tired',
                  portraitId: 'prologue/portraits/mother/tired.webp',
                  placement: {
                    x: 66,
                    scale: 0.98,
                    opacity: 0.9,
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
              ],
              focusCharacterId: 'mirella',
            },
          },
          nextNodeId: 's3_platform_exchange',
        },
        s3_platform_exchange: {
          id: 's3_platform_exchange',
          type: 'narration',
          text: 'Повітряний човен уже чекав. Довгий, темний, вузький, із гербом Торнів на носі. Батько перевірив список супроводу, уточнив у начальника охорони, чи подвоїли людей після останніх повстанських листівок, і наказав не гаяти часу. Мати поправила Міреллі рукавичку так, ніби це ще можна було сплутати з турботою, а не з останньою перевіркою форми.\n\nАрен криво зауважив, що в горах усі родові манери швидко замерзають. Едран відповів, що деяким це могло б навіть піти на користь.',
          nextNodeId: 's4_flight',
        },
        s4_flight: {
          id: 's4_flight',
          type: 'narration',
          title: 'Політ до хребта',
          backgroundId: 'prologue/backgrounds/airship_over_elirion_to_mountains',
          transition: {
            type: 'dissolve',
            durationMs: 800,
          },
          text: `Перші хвилини в польоті всі мовчали. Політ давав коротке перемир’я ще до того, як заговорять справжні ролі.

Еліріон плив унизу рівнями: у центрі - ще красивий, далі - важчий і чесніший. А за ним уже починалися гори, надто порізані, щоб лишатися просто краєвидом.`,
          sfx: [
            {
              sfxId: 'prologue/sfx/airship_hull_creak',
              volume: 0.18,
            },
          ],
          sceneChange: {
            stage: {
              characters: [
                {
                  speakerId: 'mirella',
                  emotion: 'thinking',
                  portraitId: 'prologue/portraits/mirella/thinking.webp',
                  placement: {
                    x: 12,
                    scale: 1.06,
                  },
                },
                {
                  speakerId: 'edran',
                  emotion: 'neutral',
                  portraitId: 'prologue/portraits/edran/neutral.webp',
                  placement: {
                    x: 30,
                    scale: 0.92,
                    opacity: 0.8,
                  },
                },
                {
                  speakerId: 'aren',
                  emotion: 'sharp',
                  portraitId: 'chapter-1/portraits/aren/sharp.png',
                  placement: {
                    x: 48,
                    scale: 0.95,
                    opacity: 0.84,
                  },
                },
                {
                  speakerId: 'mother',
                  emotion: 'tired',
                  portraitId: 'prologue/portraits/mother/tired.webp',
                  placement: {
                    x: 66,
                    scale: 0.98,
                    opacity: 0.9,
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
              ],
              focusCharacterId: 'mirella',
            },
          },
          nextNodeId: 's4_flight_dialogue',
        },
        s4_flight_dialogue: {
          id: 's4_flight_dialogue',
          type: 'narration',
          text: 'Батько говорив не про краєвид, а про охорону, маршрути поставок і про те, який лорд першим припре за столом слово "повстанці" до їхнього прізвища. Мати рахувала, кому на найближчому балі доведеться показати спокійне лице, щоб паніка не впала в ціні. Арен слухав так, ніби чужі слабкості вже можна було приміряти на себе. Едран лише раз сказав, що дім, який більше довіряє охороні, ніж людям, вирощує собі підпілля власними руками.',
          nextNodeId: 's4_flight_choice',
        },
        s4_flight_choice: {
          id: 's4_flight_choice',
          type: 'choice',
          speakerId: 'mirella',
          speakerSide: 'center',
          emotion: 'thinking',
          portraitId: 'prologue/portraits/mirella/thinking.webp',
          text: 'Мовчання в трюмі скінчилося. Мірелла могла або лишити дорослим їхній звичний театр, або врізатися в нього словами.',
          choices: [
            {
              id: 's4_power_reading',
              tone: 'duty',
              text: 'Піти за батьком: "Якщо охорона не задавить це швидко, чужі доми куплять наш страх раніше за руду."',
              effects: [
                {
                  type: 'changeStat',
                  key: 'will',
                  delta: 1,
                },
                {
                  type: 'changeRelationship',
                  key: 'father',
                  delta: 1,
                },
              ],
              nextNodeId: 's4_after_father',
            },
            {
              id: 's4_ball_as_war',
              tone: 'neutral',
              text: 'Піти за матір’ю: "Свята Кардашян образилася б на це лице. Паніка теж має виглядати дорого."',
              effects: [
                {
                  type: 'changeStat',
                  key: 'machiavellianism',
                  delta: 1,
                },
                {
                  type: 'changeRelationship',
                  key: 'mother',
                  delta: 1,
                },
              ],
              nextNodeId: 's4_after_mother',
            },
            {
              id: 's4_distance',
              tone: 'social',
              text: 'Піти за Едраном: "Повстанці не падають з неба. Їх вирощують там, де людей цінують нижче за руду."',
              effects: [
                {
                  type: 'changeStat',
                  key: 'innocence',
                  delta: 1,
                },
                {
                  type: 'changeRelationship',
                  key: 'edran',
                  delta: 1,
                },
                {
                  type: 'changeRelationship',
                  key: 'father',
                  delta: -1,
                },
              ],
              nextNodeId: 's4_after_edran',
            },
          ],
        },
        s4_after_father: {
          id: 's4_after_father',
          type: 'narration',
          text: 'Батько навіть не повернув голову повністю.\n- Саме так, - сказав він. - Страх, який не встигаєш продати сам, продають за тебе інші.\n\nУ відповідь Мірелла відчула не гордість. Лише те, наскільки легко цей дім вчить говорити його зубами.',
          nextNodeId: 's5_arrival',
        },
        s4_after_mother: {
          id: 's4_after_mother',
          type: 'narration',
          text: 'Мати подивилася на неї уважніше, ніж за весь ранок.\n- Нарешті ти слухала мене не в дзеркалі, а в житті, - сказала вона.\n\nІ саме це прозвучало найхворіше: ніби вся її віра давно звелася до правильно намальованого обличчя над прірвою.',
          nextNodeId: 's5_arrival',
        },
        s4_after_edran: {
          id: 's4_after_edran',
          type: 'narration',
          text: 'Едран перевів на неї короткий погляд і нічого не додав. Батько ж відповів одразу.\n- Людей цінують рівно настільки високо, наскільки вони не валять опори, - сказав він.\n\nПісля цього повітря в кабіні стало тіснішим, ніж сама висота.',
          nextNodeId: 's5_arrival',
        },
        s5_arrival: {
          id: 's5_arrival',
          type: 'narration',
          title: 'Прибуття до гірського комплексу',
          backgroundId: 'prologue/backgrounds/thorn_mountain_mines_upper_platform',
          transition: {
            type: 'fade',
            durationMs: 700,
          },
          music: {
            action: 'switch',
            musicId: 'prologue/music/under_the_weight',
            fadeMs: 750,
            loop: true,
          },
          text: `Гірський комплекс Торнів не просив любові. Він просив покори.

Платформа врізалася в уступ. Нижче - темні рівні, транспортні лінії, шахтні колодязі, вежі, склади, кріплення, чорні отвори в породі. Далі - чужі схили, де вже починалися або старі мертві виробітки, або чужі доми.`,
          sfx: [
            {
              sfxId: 'prologue/sfx/mountain_wind_hard',
              volume: 0.34,
            },
            {
              sfxId: 'prologue/sfx/mine_metal_groan',
              delayMs: 260,
              volume: 0.24,
            },
            {
              sfxId: 'prologue/sfx/chain_clink_far',
              delayMs: 480,
              volume: 0.16,
            },
          ],
          sceneChange: {
            stage: {
              characters: [
                {
                  speakerId: 'mirella',
                  emotion: 'composed',
                  portraitId: 'prologue/portraits/mirella/composed.webp',
                  placement: {
                    x: 14,
                    scale: 1.06,
                  },
                },
                {
                  speakerId: 'edran',
                  emotion: 'neutral',
                  portraitId: 'prologue/portraits/edran/neutral.webp',
                  placement: {
                    x: 34,
                    scale: 0.94,
                    opacity: 0.82,
                  },
                },
                {
                  speakerId: 'aren',
                  emotion: 'sharp',
                  portraitId: 'chapter-1/portraits/aren/sharp.png',
                  placement: {
                    x: 60,
                    scale: 0.98,
                    opacity: 0.88,
                  },
                },
                {
                  speakerId: 'father',
                  emotion: 'cold',
                  portraitId: 'prologue/portraits/father/cold.webp',
                  placement: {
                    x: 86,
                    scale: 1.16,
                  },
                },
              ],
              focusCharacterId: 'father',
            },
          },
          nextNodeId: 's5_arrival_body',
        },
        s5_arrival_body: {
          id: 's5_arrival_body',
          type: 'narration',
          text: 'Батько змінився одразу, як ступив вниз. У домі він був центром порядку. Тут - самим порядком.\n\nДо нього підійшли начальник сектора, майстри, охорона, писар. Усі говорили нижчими голосами, ніж говорили б деінде. Люди дивилися на Міреллу коротко: не як на дівчину, а як на доньку прізвища.',
          nextNodeId: 's6_overlook_intro',
        },
        s6_overlook_intro: {
          id: 's6_overlook_intro',
          type: 'narration',
          title: 'Огляд і Гален',
          backgroundId: 'prologue/backgrounds/thorn_mines_third_ledge_overlook',
          transition: {
            type: 'fade',
            durationMs: 650,
          },
          text: `Оглядовий майданчик висів над третім уступом, і шахта читалася звідти як розкритий орган. Металеві переходи, опори, робочі майдани, чорні вени породи, світло ламп у сітках, люди, які внизу вже були не людьми окремо, а частиною механізму.

Саме тут Мірелла вперше побачила Галена зблизька: сивий від пилу, з рукою, яку колись погано зібрали після перелому, він стояв не як бунтівник, а як людина, яка вже зрозуміла, що правота нічого не важить проти чужого порядку.`,
          sfx: [
            {
              sfxId: 'prologue/sfx/distant_pick_or_machine_hit',
              volume: 0.16,
            },
            {
              sfxId: 'prologue/sfx/wind_in_shafts',
              delayMs: 180,
              volume: 0.12,
            },
          ],
          sceneChange: {
            stage: {
              characters: [
                {
                  speakerId: 'mirella',
                  emotion: 'shaken',
                  portraitId: 'prologue/portraits/mirella/shaken.webp',
                  placement: {
                    x: 16,
                    scale: 1.08,
                  },
                },
                {
                  speakerId: 'edran',
                  emotion: 'neutral',
                  portraitId: 'prologue/portraits/edran/neutral.webp',
                  placement: {
                    x: 34,
                    scale: 0.94,
                    opacity: 0.84,
                  },
                },
                {
                  speakerId: 'aren',
                  emotion: 'sharp',
                  portraitId: 'chapter-1/portraits/aren/sharp.png',
                  placement: {
                    x: 62,
                    scale: 0.96,
                    opacity: 0.82,
                  },
                },
                {
                  speakerId: 'father',
                  emotion: 'cold',
                  portraitId: 'prologue/portraits/father/cold.webp',
                  placement: {
                    x: 86,
                    scale: 1.16,
                  },
                },
              ],
              focusCharacterId: 'father',
            },
          },
          nextNodeId: 's6_gallen_line',
        },
        s6_gallen_line: {
          id: 's6_gallen_line',
          type: 'narration',
          text: `Гален не виправдовувався довго.
- Нижній ряд уже співав. Ще півгодини - і людей засипало б.

Він сказав це без покори і без виклику. Просто так, як люди кажуть про камінь, воду або кров, коли ті вже ближче за наказ.`,
          nextNodeId: 's6_father_vs_gallen',
        },
        s6_father_vs_gallen: {
          id: 's6_father_vs_gallen',
          type: 'narration',
          text: `Для Галена це була спроба врятувати людей. Для батька - публічна тріщина в дисципліні роду, яку можуть відчути конкуренти.

- Якщо майстер може переписати наказ, бо відчув себе розумнішим за систему, - сказав батько, - завтра кожен нижчий вирішить, що має право на власну міру небезпеки.

Едран тихо кинув, що врятовані люди теж щось важать. Батько навіть не повернув голови.
- Важать доти, доки не вчать інших ламати лад.`,
          nextNodeId: 's6_punishment',
        },
        s6_punishment: {
          id: 's6_punishment',
          type: 'narration',
          text: `Наказ прозвучав тихо. Саме тому всі почули його відразу.

Охоронець збив Галена на одне коліно ударом держака під ребра. Метал під помостом відгукнувся чистіше, ніж людський звук. Гален схопив повітря, але не попросив милості.

Найгіршим було не це. Найгіршим було, що люди навколо опустили очі не від шоку, а від навченості. За кілька секунд шахта знову дихала, ніби приниження теж входило до виробничого ритму.`,
          sfx: [
            {
              sfxId: 'prologue/sfx/metal_strike_short',
              volume: 0.32,
            },
            {
              sfxId: 'prologue/sfx/body_fall_muffled',
              delayMs: 220,
              volume: 0.18,
            },
          ],
          nextNodeId: 's6_choice',
        },
        s6_choice: {
          id: 's6_choice',
          type: 'choice',
          speakerId: 'mirella',
          speakerSide: 'center',
          emotion: 'shaken',
          portraitId: 'prologue/portraits/mirella/shaken.webp',
          text: 'Найгірше було не саме покарання, а те, як швидко тіло вимагало від неї визначитися, ким бути в цю мить.',
          choices: [
            {
              id: 's6_watch',
              tone: 'danger',
              text: 'Дивитися до кінця, не дозволяючи собі відвести очі.',
              effects: [
                {
                  type: 'changeStat',
                  key: 'will',
                  delta: 1,
                },
                {
                  type: 'changeStat',
                  key: 'innocence',
                  delta: -1,
                },
              ],
              nextNodeId: 's6_after_watch',
            },
            {
              id: 's6_turn_away',
              tone: 'social',
              text: 'Відвернутися: є речі, які ще не можна впускати в себе до кінця.',
              effects: [
                {
                  type: 'changeStat',
                  key: 'innocence',
                  delta: 1,
                },
                {
                  type: 'changeRelationship',
                  key: 'father',
                  delta: -1,
                },
              ],
              nextNodeId: 's6_after_turn_away',
            },
            {
              id: 's6_store_it',
              tone: 'neutral',
              text: 'Запам’ятати все мовчки, без жодного руху назовні.',
              effects: [
                {
                  type: 'changeStat',
                  key: 'machiavellianism',
                  delta: 1,
                },
              ],
              nextNodeId: 's6_after_store_it',
            },
          ],
        },
        s6_after_watch: {
          id: 's6_after_watch',
          type: 'narration',
          text: 'Вона дивилася не на батька, а на те, як Гален не дозволив зробити з болю виставу. Від цього нудило ще сильніше.',
          nextNodeId: 's6_after_choice',
        },
        s6_after_turn_away: {
          id: 's6_after_turn_away',
          type: 'narration',
          text: 'Вона відвела очі надто пізно: звук уже встиг зайти всередину і там лишитися. Відвернутися виявилося не втечею, а лише іншим способом пам’ятати.',
          nextNodeId: 's6_after_choice',
        },
        s6_after_store_it: {
          id: 's6_after_store_it',
          type: 'narration',
          text: 'Вона запам’ятовувала не самого Галена, а порядок рухів: хто відступив, хто мовчав, хто не здригнувся. Саме так, мабуть, і збирають знання, потрібне для виживання в домі.',
          nextNodeId: 's6_after_choice',
        },
        s6_after_choice: {
          id: 's6_after_choice',
          type: 'narration',
          text: `Міреллу нудило.
І ще - майже огидно - якась частина її все ж розуміла логіку батька.
Не пробачала. Не приймала. Але розуміла.`,
          nextNodeId: 's7_betrayal',
        },
        s7_betrayal: {
          id: 's7_betrayal',
          type: 'narration',
          title: 'Зрада',
          backgroundId: 'prologue/backgrounds/thorn_mines_private_corridor_dim',
          transition: {
            type: 'fade',
            durationMs: 600,
          },
          text: `Після огляду Мірелла відстала від решти й звернула в службовий коридор. Там було тихіше, лампи горіли нижче, а метал уже не шумів відкрито, лише пам’ятав про шахту в стінах.

Саме там вона почула жіночий сміх - не вільний, а той обережний, яким люди платять старшим за коротке полегшення.

Батько стояв у напівтемній кімнаті біля металевого столу. Поруч - жінка зі сортувального відділу. Однією рукою він тримав її за талію, другою повільно поправляв на її зап’ясті службову стрічку, ніби винагороджував і привчав одночасно. Вона дякувала за переведення брата з нижнього рівня, але їхні обличчя були вже надто близько, щоб це лишалося просто розмовою.`,
          sfx: [
            {
              sfxId: 'prologue/sfx/low_metal_hum',
              volume: 0.1,
            },
            {
              sfxId: 'prologue/sfx/woman_short_laugh_far',
              delayMs: 260,
              volume: 0.14,
            },
          ],
          tags: ['betrayal', 'adult_disgust', 'adult_image_sequence'],
          sceneChange: {
            stage: null,
          },
          nextNodeId: 's7_betrayal_body',
        },
        s7_betrayal_body: {
          id: 's7_betrayal_body',
          type: 'narration',
          text: `Шоку не було.
Було гірше.
Ніби частина правди просто нарешті стала видимою.

Найгірше було не те, що батько зраджував матір. Найгірше було, що навіть тут він лишався тією самою системою: близькість як монета, ласка як ще одна форма підпорядкування.

Мірелла відступила раніше, ніж її могли помітити. Хотілося вмитися чимось дуже холодним, але тепер брудним здавалося не лише тіло. Брудною була сама механіка милості.`,
          nextNodeId: 's8_return',
        },
        s8_return: {
          id: 's8_return',
          type: 'narration',
          title: 'Повернення додому',
          backgroundId: 'prologue/backgrounds/thorn_estate_grand_hall_evening_return',
          transition: {
            type: 'fade',
            durationMs: 800,
          },
          music: {
            action: 'switch',
            musicId: 'prologue/music/house_of_form',
            fadeMs: 950,
            loop: true,
          },
          text: `На вході лакей прийняв її рукавички так, ніби день був звичайним виїздом. Десь далі вже змінювали воду у вазах. Хтось перевіряв, чи накрили до вечері правильно.

Саме ця бездоганна нормальність після гір, після Галена й після напівтемного коридору зробила дім найстрашнішим. Увесь будинок став схожим на добре натертий саркофаг: красивий, дорогий, порожній рівно настільки, щоб у ньому можна було жити роками й не визнати, що мешкаєш у мертвій формі.`,
          sfx: [
            {
              sfxId: 'prologue/sfx/empty_hall_ambience',
              volume: 0.14,
            },
          ],
          sceneChange: {
            stage: {
              characters: [
                {
                  speakerId: 'mirella',
                  emotion: 'hurt',
                  portraitId: 'prologue/portraits/mirella/hurt.webp',
                  placement: {
                    x: 18,
                    scale: 1.08,
                  },
                },
                {
                  speakerId: 'mother',
                  emotion: 'tired',
                  portraitId: 'prologue/portraits/mother/tired.webp',
                  placement: {
                    x: 82,
                    scale: 0.98,
                  },
                },
              ],
              focusCharacterId: 'mirella',
            },
          },
          nextNodeId: 's8_mother_to_orangery',
        },
        s8_mother_to_orangery: {
          id: 's8_mother_to_orangery',
          type: 'narration',
          text: 'Батько зник у кабінеті. Арен розчинився в коридорах. Едран говорив із начальником охорони. Мати пішла до оранжереї.\n\nМірелла пішла за нею.',
          nextNodeId: 's9_orangery',
        },
        s9_orangery: {
          id: 's9_orangery',
          type: 'narration',
          title: 'Оранжерея',
          backgroundId: 'prologue/backgrounds/thorn_estate_orangery_evening',
          transition: {
            type: 'fade',
            durationMs: 700,
          },
          text: `Оранжерея була єдиним місцем у домі, де форма ще іноді здавалася живою, а не лише дорогою.

Під склом трималося тепло. Рослини пахли землею й водою. У вечірньому світлі листя іноді ставало майже хворобливо гарним - так, ніби краса й тут була лише вищим різновидом контролю.

Мати стояла біля кам’яної полиці й обрізала сухий край листка маленьким ножем.`,
          sfx: [
            {
              sfxId: 'prologue/sfx/leaf_cut_small_blade',
              volume: 0.16,
            },
            {
              sfxId: 'prologue/sfx/glasshouse_drip',
              delayMs: 360,
              volume: 0.09,
            },
          ],
          sceneChange: {
            stage: {
              characters: [
                {
                  speakerId: 'mirella',
                  emotion: 'hurt',
                  portraitId: 'prologue/portraits/mirella/hurt.webp',
                  placement: {
                    x: 18,
                    scale: 1.08,
                  },
                },
                {
                  speakerId: 'mother',
                  emotion: 'tired',
                  portraitId: 'prologue/portraits/mother/tired.webp',
                  placement: {
                    x: 82,
                    scale: 0.98,
                  },
                },
              ],
              focusCharacterId: 'mirella',
            },
          },
          nextNodeId: 's9_dialogue_body',
        },
        s9_dialogue_body: {
          id: 's9_dialogue_body',
          type: 'narration',
          text: `Розмова почалася з майже буденної жорстокості.
- Ти знала.
- Я знала достатньо, щоб не ставити дурних питань у домі, який тримається на чужих ролях.
- Це не відповідь.
- Це єдина відповідь, якою можна прожити довше одного сезону.

Вона не просила зрозуміти її. І не виправдовувалася. Вона лише сказала, що хтось у цьому домі мусить рахувати не правду, а наслідки: кого не можна втратити до балу, кого треба вивести з удару, де тримати форму, щоб дім не зжер власних дітей раніше, ніж до нього доберуться чужі.`,
          nextNodeId: 's9_choice',
        },
        s9_choice: {
          id: 's9_choice',
          type: 'choice',
          speakerId: 'mirella',
          speakerSide: 'center',
          emotion: 'hurt',
          portraitId: 'prologue/portraits/mirella/hurt.webp',
          text: 'Мати дивилася так, ніби відповідь мала лишитися між ними довше, ніж сама ця розмова.',
          choices: [
            {
              id: 's9_push',
              tone: 'danger',
              text: 'Тиснути далі: назвати це не витривалістю, а покорою.',
              effects: [
                {
                  type: 'changeRelationship',
                  key: 'mother',
                  delta: -1,
                },
                {
                  type: 'changeStat',
                  key: 'honor',
                  delta: 1,
                },
              ],
              nextNodeId: 's9_after_push',
            },
            {
              id: 's9_listen',
              tone: 'social',
              text: 'Почути в ній не слабкість, а страшну дорослу витривалість.',
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
              nextNodeId: 's9_after_listen',
            },
            {
              id: 's9_leave',
              tone: 'neutral',
              text: 'Не вирішувати зараз нічого. Просто вийти з цією тріщиною в собі.',
              effects: [
                {
                  type: 'changeStat',
                  key: 'machiavellianism',
                  delta: 1,
                },
              ],
              nextNodeId: 's9_after_leave',
            },
          ],
        },
        s9_after_push: {
          id: 's9_after_push',
          type: 'narration',
          text: `Мати вперше підняла на неї по-справжньому тверезий погляд.
- Назви це покорою, якщо тобі так легше. Але коли впаде стеля, кричати про честь зазвичай починають ті, хто ніколи не тримав її руками.

Від цієї жорсткості Міреллі стало не легше, лише ясніше: мати давно навчилася різати правду так само акуратно, як листя в оранжереї.`,
          nextNodeId: 's9_after_choice',
        },
        s9_after_listen: {
          id: 's9_after_listen',
          type: 'narration',
          text: `Мати видихнула так тихо, ніби лише цього разу дозволила собі втому не як позу.
- Я не рятую цей дім, Мірелло. Я лише намагаюся залишити в ньому кілька місць, де він не зламає тебе раніше, ніж ти навчишся ходити сама.

Це було майже не ніжністю. Але вже точно не брехнею.`,
          nextNodeId: 's9_after_choice',
        },
        s9_after_leave: {
          id: 's9_after_leave',
          type: 'narration',
          text: `Мати не зупинила її.
- Коли перестанеш шукати тут чистих дорослих, повернися, - сказала вона рівно.

І саме ця рівність голосу поранила сильніше за будь-яке виправдання.`,
          nextNodeId: 's9_after_choice',
        },
        s9_after_choice: {
          id: 's9_after_choice',
          type: 'narration',
          text: 'На виході з оранжереї Мірелла вже знала головне: дорослі в цьому домі відрізнялися не чистотою, а способом, у який домовлялися з брудом.',
          nextNodeId: 'mc1_summary',
        },
        mc1_summary: {
          id: 'mc1_summary',
          type: 'narration',
          title: 'Кінець мікроглави I',
          text: `Мірелла повернулася з гір не старшою, а тріснутою.

Сила перестала бути для неї абстрактною красою роду.
Тепер вона пахла потом, металом, чужим страхом, виробничою дисципліною і милістю, яка виявляється лише ще однією формою влади.

Осі та стосунки змінилися залежно від виборів гравця в цій мікроглаві.

Моральний слід:
У великих домах суперечність не ховають.
Її полірують доти, доки до неї можна торкатися без огиди.`,
          onEnterEffects: [
            {
              type: 'setFlag',
              flagId: 'chapter1.prologue.microchapter1.completed',
              value: true,
            },
          ],
          nextSceneId: 'chapter-1/scene/intro/two-of-three',
        },
      },
    },
  },
} satisfies SceneGenerationDocument;
