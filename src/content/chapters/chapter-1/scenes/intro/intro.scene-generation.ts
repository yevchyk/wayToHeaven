import type { SceneGenerationDocument } from '@engine/types/sceneGeneration';

export const chapter1IntroSceneGenerationDocument = {
  id: 'chapter-1/scene-generation/intro',
  schemaVersion: 1,
  title: 'Пролог - Перші мікроглави',
  meta: {
    chapterId: 'chapter-1',
    language: 'uk',
    defaultBackgroundId: 'prologue/backgrounds/thorn_estate_mirella_room_morning',
    defaultMusicId: 'prologue/music/house_of_form',
    notes:
      'VN-oriented opening prologue flow. Microchapters are authored as consecutive scene-generation scenes inside one opening document.',
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
          portraitId: 'prologue/portraits/aren/sharp.webp',
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
                  portraitId: 'prologue/portraits/aren/sharp.webp',
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
                  portraitId: 'prologue/portraits/aren/sharp.webp',
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
                  portraitId: 'prologue/portraits/aren/sharp.webp',
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
                  portraitId: 'prologue/portraits/aren/sharp.webp',
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
                  portraitId: 'prologue/portraits/aren/sharp.webp',
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
                  portraitId: 'prologue/portraits/aren/sharp.webp',
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
                  portraitId: 'prologue/portraits/aren/alert.webp',
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
