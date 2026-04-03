import type {
  BackgroundGeneralVibeProfile,
  BackgroundGenerationStylePack,
  BackgroundMasterLocationProfile,
  BackgroundPromptVariant,
  BackgroundPromptWorkbenchData,
  BackgroundRoomProfile,
  BackgroundSceneEffectProfile,
  BackgroundScenePreset,
  BackgroundSituationPreset,
} from '@engine/types/backgroundAuthoring';

const contentIntroFile = 'src/content/chapters/chapter-1/scenes/intro/intro.scene-generation.ts';
const contentAwakeningFile = 'src/content/chapters/chapter-1/scenes/awakening/awakening.scene-generation.ts';
const contentCityFile = 'src/content/chapters/chapter-1/city/city-hubs.scene-generation.ts';
const contentRouteFile = 'src/content/chapters/chapter-1/travel/underground-route.scene-generation.ts';
const contentCaravanFile =
  'src/content/chapters/chapter-1/scenes/caravan-to-hugen-um/caravan-to-hugen-um.scene-generation.ts';

const locations: BackgroundMasterLocationProfile[] = [
  {
    id: 'thorn-estate',
    title: 'Thorn Estate',
    chapterId: 'chapter-1',
    summary: 'The main aristocratic seat from the prologue, with formal interiors that later rupture into open violence.',
    locationBlock:
      'A mountain aristocratic estate with cold stone walls, carved dark timber, brass fittings, high household order, old wealth, and the sense that etiquette is being used as a weapon.',
    continuityNotes: [
      'Keep Thorn Estate recognizable across rooms: cold stone, disciplined geometry, high ceilings, dark polished surfaces, and expensive restraint.',
      'Even when the house is in crisis, it should still read as the same estate rather than a generic fantasy castle.',
    ],
    defaultVibeId: 'aristocratic-decay',
  },
  {
    id: 'thorn-mines',
    title: 'Thorn Mining Complex',
    chapterId: 'chapter-1',
    summary: 'The industrial mountain reach where family prestige becomes punishment, labor, and spectacle.',
    locationBlock:
      'A severe mountain extraction complex with cut stone ledges, industrial gantries, mining machinery, exposed wind, altitude, and social brutality built into the architecture.',
    continuityNotes: [
      'These spaces should feel exposed, vertical, and punitive, not cozy underground tunnels.',
    ],
    defaultVibeId: 'industrial-sacred',
  },
  {
    id: 'black-river-underworks',
    title: 'Black River Underworks',
    chapterId: 'chapter-1',
    summary: 'The aftermath layer of chapter 1: cells, ruined temple masonry, water, and old machine roots.',
    locationBlock:
      'A drowned underworld of cracked temple stone, mineral damp, black water, ruined ritual architecture, and old machinery fused into the foundations.',
    continuityNotes: [
      'The underworks should feel sacred and industrial at once, with damp air, dark water, and antique mechanisms.',
    ],
    defaultVibeId: 'industrial-sacred',
  },
  {
    id: 'ashen-reach',
    title: 'Ashen Reach',
    chapterId: 'chapter-1',
    summary: 'The first urban survival phase after the fall, built from plazas, shrines, bars, and market corridors.',
    locationBlock:
      'A worn city of soot, pilgrims, ration trade, shrine districts, rough hospitality, and practical distrust near the edge of the route network.',
    continuityNotes: [
      'Ashen Reach should feel inhabited and transactional rather than purely majestic.',
    ],
    defaultVibeId: 'ashen-city-suspicion',
  },
  {
    id: 'caravan-road',
    title: 'Caravan Road To Hugen-Um',
    chapterId: 'chapter-1',
    summary: 'The social-survival continuation after awakening: camps, wagons, passes, ambush breaks, and distant arrival.',
    locationBlock:
      'A hard travel corridor of wagons, roadside camps, salt-cut passes, black water edges, and exhausted communal survival.',
    continuityNotes: [
      'This route should read as one continuous journey with changing stops, not disconnected postcard locations.',
    ],
    defaultVibeId: 'road-worn-survival',
  },
];

const rooms: BackgroundRoomProfile[] = [
  {
    id: 'thorn-estate/mirella-room',
    locationId: 'thorn-estate',
    title: 'Mirella Room',
    summary: 'Her private room at morning or night, with comfort that still belongs to the house hierarchy.',
    locationBlock:
      'A noble daughter’s room inside Thorn Estate: ordered furnishings, expensive textiles, restrained decoration, large windows, and privacy that still feels supervised.',
    continuityNotes: [
      'The room should stay elegant and controlled, never overly childish or cozy.',
    ],
    referenceBackgroundId: 'prologue/backgrounds/thorn_estate_mirella_room_morning',
    defaultVariantId: 'intimate-interior',
    runtimeReferences: [
      {
        id: 'intro-mirella-room-morning',
        title: 'Prologue opening',
        sceneId: 'chapter-1/scene/intro',
        backgroundId: 'prologue/backgrounds/thorn_estate_mirella_room_morning',
        contentFilePath: contentIntroFile,
      },
      {
        id: 'intro-mirella-room-night',
        title: 'Night return to room',
        sceneId: 'chapter-1/scene/intro/two-of-three',
        backgroundId: 'prologue/backgrounds/mirella_room_night',
        contentFilePath: contentIntroFile,
      },
    ],
  },
  {
    id: 'thorn-estate/dining-hall',
    locationId: 'thorn-estate',
    title: 'Dining Hall',
    summary: 'Formal dining room where family hierarchy is visible in the furniture itself.',
    locationBlock:
      'A ceremonial dining hall with a long table, formal spacing, cold daylight, disciplined service routes, and room composition built around rank.',
    continuityNotes: [
      'The room should sell social pressure before any line of dialogue appears.',
    ],
    referenceBackgroundId: 'prologue/backgrounds/thorn_estate_dining_hall_morning',
    defaultVariantId: 'intimate-interior',
    runtimeReferences: [
      {
        id: 'intro-dining-hall-morning',
        title: 'Breakfast and talk about the mountains',
        sceneId: 'chapter-1/scene/intro',
        backgroundId: 'prologue/backgrounds/thorn_estate_dining_hall_morning',
        contentFilePath: contentIntroFile,
      },
    ],
  },
  {
    id: 'thorn-estate/grand-hall',
    locationId: 'thorn-estate',
    title: 'Grand Hall',
    summary: 'The public ceremonial heart of the estate, usable as return space, prep space, or emptied aftermath.',
    locationBlock:
      'A large ceremonial hall with elevated scale, formal circulation, polished stone, vertical banners or fittings, and a sense that the family stages itself here.',
    continuityNotes: [
      'This hall must read as a public display space, not a private lounge.',
    ],
    referenceBackgroundId: 'prologue/backgrounds/thorn_estate_grand_hall_evening_return',
    defaultVariantId: 'wide-establishing',
    runtimeReferences: [
      {
        id: 'intro-grand-hall-return',
        title: 'Evening return',
        sceneId: 'chapter-1/scene/intro',
        backgroundId: 'prologue/backgrounds/thorn_estate_grand_hall_evening_return',
        contentFilePath: contentIntroFile,
      },
      {
        id: 'intro-grand-hall-prep',
        title: 'Ball preparation',
        sceneId: 'chapter-1/scene/intro/ball-and-assault',
        backgroundId: 'prologue/backgrounds/thorn_estate_grand_hall_prep_evening',
        contentFilePath: contentIntroFile,
      },
      {
        id: 'intro-grand-hall-silent',
        title: 'Evening silence',
        sceneId: 'chapter-1/scene/intro/two-of-three',
        backgroundId: 'prologue/backgrounds/thorn_estate_evening_hall_silent',
        contentFilePath: contentIntroFile,
      },
    ],
  },
  {
    id: 'thorn-estate/orangery',
    locationId: 'thorn-estate',
    title: 'Orangery',
    summary: 'Controlled life under glass: intimate, expensive, and emotionally exposed.',
    locationBlock:
      'A noble estate orangery with glasshouse structure, curated plants, humidity, filtered evening light, and quiet luxury that sharpens private conversations.',
    continuityNotes: [
      'The space should feel cultivated and soft in material, but still owned and controlled.',
    ],
    referenceBackgroundId: 'prologue/backgrounds/thorn_estate_orangery_evening',
    defaultVariantId: 'intimate-interior',
    runtimeReferences: [
      {
        id: 'intro-orangery-evening',
        title: 'Orangery confrontation',
        sceneId: 'chapter-1/scene/intro',
        backgroundId: 'prologue/backgrounds/thorn_estate_orangery_evening',
        contentFilePath: contentIntroFile,
      },
    ],
  },
  {
    id: 'thorn-estate/corridors',
    locationId: 'thorn-estate',
    title: 'Estate Corridors',
    summary: 'A flexible corridor family for transition, secrecy, or open attack.',
    locationBlock:
      'Formal estate corridors with stone walls, framed thresholds, long sightlines, household order, and enough depth to stage surveillance, secrecy, or flight.',
    continuityNotes: [
      'When switching state, keep the same aristocratic corridor DNA and only alter light, damage, debris, and emotional temperature.',
    ],
    referenceBackgroundId: 'prologue/backgrounds/thorn_estate_inner_corridor_late_afternoon',
    defaultVariantId: 'corridor-depth',
    runtimeReferences: [
      {
        id: 'intro-inner-corridor',
        title: 'Late afternoon inner corridor',
        sceneId: 'chapter-1/scene/intro/two-of-three',
        backgroundId: 'prologue/backgrounds/thorn_estate_inner_corridor_late_afternoon',
        contentFilePath: contentIntroFile,
      },
      {
        id: 'intro-cabinet-corridor',
        title: 'Outer cabinet corridor',
        sceneId: 'chapter-1/scene/intro/ball-and-assault',
        backgroundId: 'prologue/backgrounds/thorn_estate_outer_cabinet_corridor_evening',
        contentFilePath: contentIntroFile,
      },
      {
        id: 'intro-main-corridor-attack',
        title: 'Main corridor under attack',
        sceneId: 'chapter-1/scene/intro/ball-and-assault',
        backgroundId: 'prologue/backgrounds/thorn_estate_main_corridor_attack',
        contentFilePath: contentIntroFile,
      },
      {
        id: 'intro-escape-tunnel',
        title: 'Escape tunnel',
        sceneId: 'chapter-1/scene/intro/ball-and-assault',
        backgroundId: 'prologue/backgrounds/thorn_estate_escape_tunnel_dark',
        contentFilePath: contentIntroFile,
      },
    ],
  },
  {
    id: 'thorn-estate/east-platform',
    locationId: 'thorn-estate',
    title: 'East Platform',
    summary: 'Exterior overlook of the estate, readable as departure or night tension.',
    locationBlock:
      'An exterior estate platform open to the mountain air, overlooking transport access and distant space beyond the household walls.',
    continuityNotes: [
      'Keep estate materials and engineering visible so it still belongs to Thorn Estate.',
    ],
    referenceBackgroundId: 'prologue/backgrounds/thorn_estate_east_platform_day',
    defaultVariantId: 'balcony-outlook',
    runtimeReferences: [
      {
        id: 'intro-east-platform-day',
        title: 'Departure platform by day',
        sceneId: 'chapter-1/scene/intro',
        backgroundId: 'prologue/backgrounds/thorn_estate_east_platform_day',
        contentFilePath: contentIntroFile,
      },
      {
        id: 'intro-east-platform-night',
        title: 'East platform by night',
        sceneId: 'chapter-1/scene/intro/two-of-three',
        backgroundId: 'prologue/backgrounds/thorn_estate_east_platform_night',
        contentFilePath: contentIntroFile,
      },
    ],
  },
  {
    id: 'thorn-estate/upper-gallery',
    locationId: 'thorn-estate',
    title: 'Upper Gallery',
    summary: 'The elegant elevated corridor that later becomes one of the attack frames.',
    locationBlock:
      'An elevated interior gallery with formal rail lines, vertical drop or overlook, estate ornament, and enough depth to turn beauty into danger.',
    continuityNotes: [
      'This space should still feel elegant even when violence breaks it open.',
    ],
    referenceBackgroundId: 'prologue/backgrounds/thorn_estate_upper_gallery_attack',
    defaultVariantId: 'corridor-depth',
    runtimeReferences: [
      {
        id: 'intro-lower-gallery-garden',
        title: 'Lower gallery garden side',
        sceneId: 'chapter-1/scene/intro/two-of-three',
        backgroundId: 'prologue/backgrounds/thorn_estate_lower_gallery_garden',
        contentFilePath: contentIntroFile,
      },
      {
        id: 'intro-upper-gallery-attack',
        title: 'Upper gallery under attack',
        sceneId: 'chapter-1/scene/intro/ball-and-assault',
        backgroundId: 'prologue/backgrounds/thorn_estate_upper_gallery_attack',
        contentFilePath: contentIntroFile,
      },
    ],
  },
  {
    id: 'thorn-estate/ritual-rooms',
    locationId: 'thorn-estate',
    title: 'Ritual And Private Function Rooms',
    summary: 'Rooms tied to household preparation, secrecy, and sealed records.',
    locationBlock:
      'Private estate function rooms for preparation, locked access, and family ritual logistics rather than open social life.',
    continuityNotes: [
      'These rooms should feel enclosed, intentional, and controlled by household procedure.',
    ],
    referenceBackgroundId: 'prologue/backgrounds/thorn_estate_dressing_room_late_day',
    defaultVariantId: 'intimate-interior',
    runtimeReferences: [
      {
        id: 'intro-dressing-room',
        title: 'Dressing room before the ball',
        sceneId: 'chapter-1/scene/intro/ball-and-assault',
        backgroundId: 'prologue/backgrounds/thorn_estate_dressing_room_late_day',
        contentFilePath: contentIntroFile,
      },
      {
        id: 'intro-archives',
        title: 'Inner sector archives',
        sceneId: 'chapter-1/scene/intro/ball-and-assault',
        backgroundId: 'prologue/backgrounds/thorn_estate_inner_sector_archives',
        contentFilePath: contentIntroFile,
      },
    ],
  },
  {
    id: 'thorn-estate/training-yard',
    locationId: 'thorn-estate',
    title: 'Training Yard',
    summary: 'An exterior utility space for discipline, drills, and family severity.',
    locationBlock:
      'A disciplined training yard inside the estate grounds with hard surfaces, practice space, exposed evening air, and the sense that affection and instruction are never far apart.',
    continuityNotes: [
      'The yard should feel practical and noble at once, not like a public barracks.',
    ],
    referenceBackgroundId: 'prologue/backgrounds/thorn_estate_training_yard_evening',
    defaultVariantId: 'wide-establishing',
    runtimeReferences: [
      {
        id: 'intro-training-yard',
        title: 'Training yard evening',
        sceneId: 'chapter-1/scene/intro/two-of-three',
        backgroundId: 'prologue/backgrounds/thorn_estate_training_yard_evening',
        contentFilePath: contentIntroFile,
      },
    ],
  },
  {
    id: 'thorn-mines/high-ledges',
    locationId: 'thorn-mines',
    title: 'High Ledges And Platforms',
    summary: 'The exposed upper mining spaces for inspection and humiliation.',
    locationBlock:
      'High mining ledges and platforms cut into the mountain, with exposed drop, industrial rigging, wind, and labor made visible as spectacle.',
    continuityNotes: [
      'These shots should feel vertical and punishing, with distance beneath the characters.',
    ],
    referenceBackgroundId: 'prologue/backgrounds/thorn_mountain_mines_upper_platform',
    defaultVariantId: 'wide-establishing',
    runtimeReferences: [
      {
        id: 'intro-mines-upper-platform',
        title: 'Upper platform arrival',
        sceneId: 'chapter-1/scene/intro',
        backgroundId: 'prologue/backgrounds/thorn_mountain_mines_upper_platform',
        contentFilePath: contentIntroFile,
      },
      {
        id: 'intro-third-ledge-overlook',
        title: 'Third ledge overlook',
        sceneId: 'chapter-1/scene/intro',
        backgroundId: 'prologue/backgrounds/thorn_mines_third_ledge_overlook',
        contentFilePath: contentIntroFile,
      },
    ],
  },
  {
    id: 'thorn-mines/private-corridor',
    locationId: 'thorn-mines',
    title: 'Private Mine Corridor',
    summary: 'The interior service artery where status and secrecy tighten.',
    locationBlock:
      'A private mining corridor with dim industrial light, enclosed stone, mechanical hum, and a sense that the family has a hidden infrastructure beneath public order.',
    continuityNotes: [
      'The corridor should feel elite and sealed off, not like an ordinary worker passage.',
    ],
    referenceBackgroundId: 'prologue/backgrounds/thorn_mines_private_corridor_dim',
    defaultVariantId: 'corridor-depth',
    runtimeReferences: [
      {
        id: 'intro-private-mine-corridor',
        title: 'Private corridor in the mines',
        sceneId: 'chapter-1/scene/intro',
        backgroundId: 'prologue/backgrounds/thorn_mines_private_corridor_dim',
        contentFilePath: contentIntroFile,
      },
    ],
  },
  {
    id: 'black-river-underworks/cell',
    locationId: 'black-river-underworks',
    title: 'Cell And Holding Space',
    summary: 'The confinement layer after the fall, before the wider route opens.',
    locationBlock:
      'A cell or holding space carved into the black river underworks, with wet stone, rust, confinement, little comfort, and traces of old sacred infrastructure.',
    continuityNotes: [
      'This space should feel like captivity inside a much older structure, not a clean prison.',
    ],
    referenceBackgroundId: 'chapter-1/backgrounds/prison-cell',
    defaultVariantId: 'intimate-interior',
    runtimeReferences: [
      {
        id: 'prison-fall-default',
        title: 'Prison Fall default',
        sceneId: 'chapter-1/scene/prison-fall',
        backgroundId: 'chapter-1/backgrounds/prison-cell',
        contentFilePath: 'src/content/chapters/chapter-1/scenes/prison-fall/prison-fall.meta.ts',
      },
    ],
  },
  {
    id: 'black-river-underworks/temple-threshold',
    locationId: 'black-river-underworks',
    title: 'Temple Threshold',
    summary: 'The ancient temple route at the black river, usable for awakening and travel setup.',
    locationBlock:
      'Ruined temple architecture at the black river, with damp stone, broken idols, black water, mineral glow, and machine roots threaded into old sacred foundations.',
    continuityNotes: [
      'The temple threshold should read as the larger world opening after confinement.',
    ],
    referenceBackgroundId: 'chapter-1/backgrounds/ancient-temple-black-river.webp',
    defaultVariantId: 'wide-establishing',
    runtimeReferences: [
      {
        id: 'awakening-default',
        title: 'Awakening default',
        sceneId: 'chapter-1/scene/awakening',
        backgroundId: 'chapter-1/backgrounds/ancient-temple-black-river.webp',
        contentFilePath: contentAwakeningFile,
      },
      {
        id: 'underground-route-default',
        title: 'Underground Route default',
        sceneId: 'chapter-1/travel/underground-route',
        backgroundId: 'chapter-1/backgrounds/ancient-temple-black-river.webp',
        contentFilePath: contentRouteFile,
      },
    ],
  },
  {
    id: 'ashen-reach/temple-exit',
    locationId: 'ashen-reach',
    title: 'Temple Exit Plaza',
    summary: 'The first city hub at the edge of the temple quarter.',
    locationBlock:
      'A soot-lit city plaza near the temple quarter, with traffic flow, wardens, pilgrims, market spillover, and the feeling that the city reads newcomers immediately.',
    continuityNotes: [
      'Keep route access and district crossing visible in the composition.',
    ],
    referenceBackgroundId: 'chapter-1/backgrounds/temple-exit-plaza.webp',
    defaultVariantId: 'wide-establishing',
    runtimeReferences: [
      {
        id: 'city-temple-exit',
        title: 'Temple Exit Plaza hub',
        sceneId: 'chapter-1/city/temple-exit',
        backgroundId: 'chapter-1/backgrounds/temple-exit-plaza.webp',
        contentFilePath: contentCityFile,
      },
    ],
  },
  {
    id: 'ashen-reach/market-lane',
    locationId: 'ashen-reach',
    title: 'Market Lane',
    summary: 'The ration-and-rumor corridor of the city.',
    locationBlock:
      'A lantern corridor of stalls, relic hawkers, ration trade, layered awnings, and sharp-eyed people who always notice weakness.',
    continuityNotes: [
      'The frame should feel crowded and transactional, but still readable under VN UI.',
    ],
    referenceBackgroundId: 'chapter-1/backgrounds/market-lane.webp',
    defaultVariantId: 'intimate-interior',
    runtimeReferences: [
      {
        id: 'city-market-lane',
        title: 'Market Lane hub',
        sceneId: 'chapter-1/city/market-lane',
        backgroundId: 'chapter-1/backgrounds/market-lane.webp',
        contentFilePath: contentCityFile,
      },
    ],
  },
  {
    id: 'caravan-road/camps-and-breaks',
    locationId: 'caravan-road',
    title: 'Camps And Break Points',
    summary: 'The repeating rest logic of the caravan arc: wagons, dim firelight, smoke, and fragile safety.',
    locationBlock:
      'Caravan rest spaces of wagons, roadside camps, ration stops, firelight, dim cloth shelter, mud, and collective fatigue held together by routine.',
    continuityNotes: [
      'Even when the stops differ, they should read as parts of one caravan ecosystem.',
    ],
    referenceBackgroundId: 'chapter-1/backgrounds/caravan/caravan-restfire-evening.webp',
    defaultVariantId: 'wide-establishing',
    runtimeReferences: [
      {
        id: 'caravan-evening-camp',
        title: 'Evening camp',
        sceneId: 'chapter-1/scene/caravan-to-hugen-um',
        backgroundId: 'chapter-1/backgrounds/caravan/caravan-restfire-evening.webp',
        contentFilePath: contentCaravanFile,
      },
      {
        id: 'caravan-night-camp',
        title: 'Night camp',
        sceneId: 'chapter-1/scene/caravan-to-hugen-um',
        backgroundId: 'chapter-1/backgrounds/caravan/night-camp-dim.webp',
        contentFilePath: contentCaravanFile,
      },
      {
        id: 'caravan-after-ambush',
        title: 'Post-ambush smoke',
        sceneId: 'chapter-1/scene/caravan-to-hugen-um',
        backgroundId: 'chapter-1/backgrounds/caravan/post-ambush-smoke.webp',
        contentFilePath: contentCaravanFile,
      },
    ],
  },
];

const generalVibes: BackgroundGeneralVibeProfile[] = [
  {
    id: 'aristocratic-decay',
    title: 'Aristocratic Decay',
    summary: 'Old authority still looks expensive, but it is already rotting from within.',
    promptBlock:
      'Dark fantasy aristocratic pressure, controlled luxury, cold order, and the feeling that inherited power is already cracking under the surface.',
    compatibleLocationIds: ['thorn-estate'],
  },
  {
    id: 'household-tension',
    title: 'Household Tension',
    summary: 'The house is still intact, but every room is emotionally unsafe.',
    promptBlock:
      'Prestige under emotional strain, expensive restraint, sharp silence, and a household atmosphere where politeness hides danger.',
    compatibleLocationIds: ['thorn-estate'],
  },
  {
    id: 'house-under-assault',
    title: 'House Under Assault',
    summary: 'The estate has entered open violence.',
    promptBlock:
      'Sudden collapse of aristocratic order into smoke, broken light, debris, alarm, and violent interruption without losing the identity of the place.',
    compatibleLocationIds: ['thorn-estate'],
  },
  {
    id: 'industrial-sacred',
    title: 'Industrial Sacred',
    summary: 'Ritual ruins and machinery belong to the same environment.',
    promptBlock:
      'Ancient sacred architecture fused with brutal industrial remains, damp mineral air, black water, machine roots, and eerie survival pressure.',
    compatibleLocationIds: ['thorn-mines', 'black-river-underworks'],
  },
  {
    id: 'ashen-city-suspicion',
    title: 'Ashen City Suspicion',
    summary: 'The city runs on trade, watching, and low trust.',
    promptBlock:
      'A soot-marked survival city with practical distrust, small shrines, ration trade, movement, overheard rumor, and constant social reading of strangers.',
    compatibleLocationIds: ['ashen-reach'],
  },
  {
    id: 'road-worn-survival',
    title: 'Road-Worn Survival',
    summary: 'Travel is communal, exhausted, and never fully safe.',
    promptBlock:
      'Exhausted travel survival, shared hardship, smoke, mud, wagons, ration logic, and the fragile comfort of temporary camp order.',
    compatibleLocationIds: ['caravan-road'],
  },
];

const sceneEffects: BackgroundSceneEffectProfile[] = [
  {
    id: 'cold-morning-spill',
    title: 'Cold Morning Spill',
    summary: 'Pale daylight across disciplined interiors.',
    promptBlock:
      'Pale morning spill from tall windows crossing silver, polished edges, and rigid architectural lines without softening the room.',
    styleToken: 'cold-morning-spill',
    compatibleLocationIds: ['thorn-estate'],
    compatibleRoomIds: ['thorn-estate/mirella-room', 'thorn-estate/dining-hall', 'thorn-estate/grand-hall'],
  },
  {
    id: 'shadow-veil',
    title: 'Shadow Veil',
    summary: 'Darkness presses in from the frame edges.',
    promptBlock:
      'Heavy shadow pooling in the corners and frame edges so the space feels watched, compressed, or emotionally unsafe.',
    styleToken: 'shadow-veil',
    compatibleLocationIds: ['thorn-estate', 'black-river-underworks', 'caravan-road', 'ashen-reach'],
  },
  {
    id: 'blood-border',
    title: 'Blood Border',
    summary: 'Violence has touched the frame itself.',
    promptBlock:
      'Subtle blood contamination along the frame edges, like violence has reached the lens without turning the scene into gore illustration.',
    styleToken: 'blood-border',
    compatibleLocationIds: ['thorn-estate', 'thorn-mines', 'caravan-road'],
  },
  {
    id: 'smoke-haze',
    title: 'Smoke Haze',
    summary: 'Dust, smoke, and disturbed air thicken the depth.',
    promptBlock:
      'Lingering smoke and dust haze in the air, catching light and softening depth while keeping the room readable.',
    styleToken: 'smoke-haze',
    compatibleLocationIds: ['thorn-estate', 'thorn-mines', 'caravan-road'],
  },
  {
    id: 'gilded-ceremony',
    title: 'Gilded Ceremony',
    summary: 'Warm ceremonial gold gathers over polished surfaces.',
    promptBlock:
      'Warm ceremonial gold spill on brass, chandeliers, and polished surfaces, as if the house is dressing itself for ritual or display.',
    styleToken: 'gilded-ceremony',
    compatibleLocationIds: ['thorn-estate'],
    compatibleRoomIds: ['thorn-estate/dining-hall', 'thorn-estate/grand-hall', 'thorn-estate/ritual-rooms'],
  },
  {
    id: 'glass-refraction',
    title: 'Glass Refraction',
    summary: 'Reflected greenhouse light breaks over the frame.',
    promptBlock:
      'Soft greenhouse reflections, diffused humidity bloom, and pale glass glare breaking across the scene.',
    styleToken: 'glass-refraction',
    compatibleRoomIds: ['thorn-estate/orangery'],
  },
  {
    id: 'moon-slice',
    title: 'Moon Slice',
    summary: 'A narrow cold beam cuts through the dark.',
    promptBlock:
      'A narrow moonlit spill cutting across one architectural plane while the rest of the space stays in patient darkness.',
    styleToken: 'moon-slice',
    compatibleLocationIds: ['thorn-estate', 'ashen-reach'],
  },
  {
    id: 'firelight-vignette',
    title: 'Firelight Vignette',
    summary: 'Warm center light against tired dark edges.',
    promptBlock:
      'Low firelight or lamp-driven warmth concentrated near the center while the frame edges stay worn and dark.',
    styleToken: 'firelight-vignette',
    compatibleLocationIds: ['caravan-road', 'ashen-reach', 'black-river-underworks'],
  },
  {
    id: 'ash-haze',
    title: 'Ash Haze',
    summary: 'Dirty amber dust turns the air itself into atmosphere.',
    promptBlock:
      'Suspended soot, urban dust, and dirty amber air that makes the whole frame feel breathed-in, transactional, and watched.',
    styleToken: 'ash-haze',
    compatibleLocationIds: ['ashen-reach', 'caravan-road'],
  },
];

const situations: BackgroundSituationPreset[] = [
  {
    id: 'formal-morning',
    title: 'Formal Morning',
    summary: 'The day begins under routine and control.',
    promptBlock:
      'Morning light, prepared surfaces, social discipline, controlled order, and the sense that the house expects proper behavior before emotion can surface.',
    compatibleLocationIds: ['thorn-estate'],
  },
  {
    id: 'evening-return',
    title: 'Evening Return',
    summary: 'The house receives people back after exposure and damage.',
    promptBlock:
      'Late-evening return state: cooling light, weary elegance, subtle exhaustion, and the feeling that the household is trying to resume form after strain.',
    compatibleLocationIds: ['thorn-estate'],
  },
  {
    id: 'private-fracture',
    title: 'Private Fracture',
    summary: 'The space holds a conversation where trust or family form has already cracked.',
    promptBlock:
      'A private emotionally dangerous moment: controlled quiet, intimacy without safety, and visual softness that still carries pressure.',
    compatibleLocationIds: ['thorn-estate'],
  },
  {
    id: 'night-hush',
    title: 'Night Hush',
    summary: 'The room is quieter, lonelier, and more revealing after dark.',
    promptBlock:
      'Night state with sparse lamplight or moonlit spill, deep shadow, emptied circulation, and the feeling that the place is speaking more honestly after everyone withdraws.',
    compatibleLocationIds: ['thorn-estate', 'ashen-reach', 'caravan-road'],
  },
  {
    id: 'ritual-preparation',
    title: 'Ritual Preparation',
    summary: 'The house is assembling itself for performance.',
    promptBlock:
      'Preparation state: ordered objects, ceremonial readiness, clothing or hosting logistics, and pressure building under polished surfaces.',
    compatibleLocationIds: ['thorn-estate'],
  },
  {
    id: 'open-assault',
    title: 'Open Assault',
    summary: 'The scene is mid-attack, not merely threatened.',
    promptBlock:
      'Open attack in progress: broken order, smoke, disturbance, impact traces, urgent disruption, and a once-controlled environment being torn apart in real time.',
    compatibleLocationIds: ['thorn-estate'],
  },
  {
    id: 'sealed-aftermath',
    title: 'Sealed Aftermath',
    summary: 'The damage is real, but the space is briefly locked into stillness.',
    promptBlock:
      'Aftershock state: silence after violence, residue of damage, closed access, heavy stillness, and the feeling that the space is holding a secret or a wound.',
    compatibleLocationIds: ['thorn-estate', 'black-river-underworks', 'caravan-road'],
  },
  {
    id: 'inspection-exposure',
    title: 'Inspection Exposure',
    summary: 'People are being judged in a place built for labor and rank.',
    promptBlock:
      'High-pressure inspection state: exposed air, public scrutiny, harsh scale, and a location that turns status into spectacle.',
    compatibleLocationIds: ['thorn-mines'],
  },
  {
    id: 'captivity-awakening',
    title: 'Captivity And Awakening',
    summary: 'The character is trapped but the world is beginning to open into something stranger.',
    promptBlock:
      'Post-collapse captivity with awakening undertones: damp confinement, ritual residue, threat, and the first suggestion of a larger underworld beyond the cell.',
    compatibleLocationIds: ['black-river-underworks'],
  },
  {
    id: 'city-routine',
    title: 'City Routine',
    summary: 'The city is functioning, watching, and trading.',
    promptBlock:
      'Ordinary urban circulation under survival pressure: movement, stalls, traffic, practical life, and low-level suspicion rather than open panic.',
    compatibleLocationIds: ['ashen-reach'],
  },
  {
    id: 'route-fatigue',
    title: 'Route Fatigue',
    summary: 'Travel continues because it must, not because anyone is fresh.',
    promptBlock:
      'Journey fatigue: worn supplies, layered camp traces, bad sleep, persistent forward motion, and survival routines holding the group together.',
    compatibleLocationIds: ['caravan-road'],
  },
  {
    id: 'ambush-break',
    title: 'Ambush Break',
    summary: 'The route has just been torn open by violence.',
    promptBlock:
      'Travel route broken by sudden violence: churned ground, broken formation, panic traces, smoke, and the practical ugliness of an interrupted convoy.',
    compatibleLocationIds: ['caravan-road'],
  },
];

const stylePacks: BackgroundGenerationStylePack[] = [
  {
    id: 'vn-painted-cinematic',
    title: 'VN Painted Cinematic',
    summary: 'Clean painterly frame for readable visual novel backgrounds.',
    promptBlock:
      'Painterly but clean visual novel background, cinematic 16:9 frame, readable foreground and midground separation, grounded materials, atmospheric depth, and deliberate negative space for dialogue UI.',
    negativePrompt:
      'No characters, no text, no logos, no watermark, no UI, no dialogue box, no modern props, no neon sci-fi elements, no fisheye distortion, no collage look.',
  },
  {
    id: 'vn-painted-nocturne',
    title: 'VN Painted Nocturne',
    summary: 'A night-biased pack for quiet tension and loneliness.',
    promptBlock:
      'Painterly visual novel background with night-biased lighting, controlled contrast, legible darkness, quiet atmosphere, and strong silhouette reads without crushing the environment into black.',
    negativePrompt:
      'No characters, no text, no watermark, no modern lighting fixtures, no extreme bloom, no unreadable darkness, no neon cyberpunk elements.',
  },
  {
    id: 'vn-painted-crisis',
    title: 'VN Painted Crisis',
    summary: 'A pack for attack, aftermath, and unstable environments.',
    promptBlock:
      'Painterly visual novel background for crisis scenes, with dynamic but still readable staging, debris or disturbance cues, dramatic light breaks, and environment-first storytelling rather than action illustration.',
    negativePrompt:
      'No characters in focus, no freeze-frame combat poses, no comic panel framing, no text, no watermark, no excessive motion blur, no modern military gear.',
  },
];

const variants: BackgroundPromptVariant[] = [
  {
    id: 'wide-establishing',
    title: 'Wide Establishing',
    summary: 'The safest baseline for location-first shots.',
    promptBlock:
      'Wide establishing shot at eye level or slightly elevated, prioritizing room or location readability before decorative detail.',
  },
  {
    id: 'intimate-interior',
    title: 'Intimate Interior',
    summary: 'A closer room framing that still respects the environment.',
    promptBlock:
      'Slightly closer interior framing with spatial clarity, keeping the room readable as a real place rather than a prop collage.',
  },
  {
    id: 'corridor-depth',
    title: 'Corridor Depth',
    summary: 'Built for depth lines, pursuit, secrecy, and escape.',
    promptBlock:
      'Deep perspective composition using corridor or threshold lines, layered doorways, and visual pull into the distance.',
  },
  {
    id: 'balcony-outlook',
    title: 'Balcony Outlook',
    summary: 'For exterior overlooks and threshold spaces.',
    promptBlock:
      'Exterior threshold composition with open air, visible distance, and enough framing architecture to anchor the viewer to the exact place.',
  },
];

const scenePresets: BackgroundScenePreset[] = [
  {
    id: 'preset-thorn-breakfast',
    title: 'Breakfast In The Dining Hall',
    summary: 'Formal breakfast before the mines inspection.',
    sceneId: 'chapter-1/scene/intro',
    locationId: 'thorn-estate',
    roomId: 'thorn-estate/dining-hall',
    vibeId: 'aristocratic-decay',
    situationId: 'formal-morning',
    stylePackId: 'vn-painted-cinematic',
    variantId: 'intimate-interior',
    effectIds: ['cold-morning-spill'],
    referenceBackgroundId: 'prologue/backgrounds/thorn_estate_dining_hall_morning',
    contentFilePath: contentIntroFile,
  },
  {
    id: 'preset-thorn-orangery',
    title: 'Orangery Fracture',
    summary: 'Private emotional break in the orangery.',
    sceneId: 'chapter-1/scene/intro',
    locationId: 'thorn-estate',
    roomId: 'thorn-estate/orangery',
    vibeId: 'household-tension',
    situationId: 'private-fracture',
    stylePackId: 'vn-painted-cinematic',
    variantId: 'intimate-interior',
    effectIds: ['glass-refraction', 'shadow-veil'],
    referenceBackgroundId: 'prologue/backgrounds/thorn_estate_orangery_evening',
    contentFilePath: contentIntroFile,
  },
  {
    id: 'preset-thorn-room-night',
    title: 'Mirella Room At Night',
    summary: 'Night return to private space after the day has already shifted.',
    sceneId: 'chapter-1/scene/intro/two-of-three',
    locationId: 'thorn-estate',
    roomId: 'thorn-estate/mirella-room',
    vibeId: 'household-tension',
    situationId: 'night-hush',
    stylePackId: 'vn-painted-nocturne',
    variantId: 'intimate-interior',
    effectIds: ['moon-slice', 'shadow-veil'],
    referenceBackgroundId: 'prologue/backgrounds/mirella_room_night',
    contentFilePath: contentIntroFile,
  },
  {
    id: 'preset-thorn-grand-hall-prep',
    title: 'Grand Hall Preparation',
    summary: 'The estate assembling itself for ceremony before the break.',
    sceneId: 'chapter-1/scene/intro/ball-and-assault',
    locationId: 'thorn-estate',
    roomId: 'thorn-estate/grand-hall',
    vibeId: 'aristocratic-decay',
    situationId: 'ritual-preparation',
    stylePackId: 'vn-painted-cinematic',
    variantId: 'wide-establishing',
    effectIds: ['gilded-ceremony'],
    referenceBackgroundId: 'prologue/backgrounds/thorn_estate_grand_hall_prep_evening',
    contentFilePath: contentIntroFile,
  },
  {
    id: 'preset-thorn-assault-corridor',
    title: 'Main Corridor Under Assault',
    summary: 'The house’s controlled circulation breaks into chaos.',
    sceneId: 'chapter-1/scene/intro/ball-and-assault',
    locationId: 'thorn-estate',
    roomId: 'thorn-estate/corridors',
    vibeId: 'house-under-assault',
    situationId: 'open-assault',
    stylePackId: 'vn-painted-crisis',
    variantId: 'corridor-depth',
    effectIds: ['blood-border', 'shadow-veil', 'smoke-haze'],
    referenceBackgroundId: 'prologue/backgrounds/thorn_estate_main_corridor_attack',
    contentFilePath: contentIntroFile,
  },
  {
    id: 'preset-thorn-assault-gallery',
    title: 'Upper Gallery Under Assault',
    summary: 'One of the elegant estate spaces turned into a kill zone.',
    sceneId: 'chapter-1/scene/intro/ball-and-assault',
    locationId: 'thorn-estate',
    roomId: 'thorn-estate/upper-gallery',
    vibeId: 'house-under-assault',
    situationId: 'open-assault',
    stylePackId: 'vn-painted-crisis',
    variantId: 'corridor-depth',
    effectIds: ['blood-border', 'shadow-veil', 'smoke-haze'],
    referenceBackgroundId: 'prologue/backgrounds/thorn_estate_upper_gallery_attack',
    contentFilePath: contentIntroFile,
  },
  {
    id: 'preset-thorn-archives',
    title: 'Archives Aftershock',
    summary: 'The house closes around secrets after the attack.',
    sceneId: 'chapter-1/scene/intro/ball-and-assault',
    locationId: 'thorn-estate',
    roomId: 'thorn-estate/ritual-rooms',
    vibeId: 'household-tension',
    situationId: 'sealed-aftermath',
    stylePackId: 'vn-painted-nocturne',
    variantId: 'intimate-interior',
    effectIds: ['shadow-veil'],
    referenceBackgroundId: 'prologue/backgrounds/thorn_estate_inner_sector_archives',
    contentFilePath: contentIntroFile,
  },
  {
    id: 'preset-thorn-escape',
    title: 'Escape Tunnel',
    summary: 'Flight away from the estate through hidden dark infrastructure.',
    sceneId: 'chapter-1/scene/intro/ball-and-assault',
    locationId: 'thorn-estate',
    roomId: 'thorn-estate/corridors',
    vibeId: 'house-under-assault',
    situationId: 'sealed-aftermath',
    stylePackId: 'vn-painted-nocturne',
    variantId: 'corridor-depth',
    effectIds: ['shadow-veil', 'smoke-haze'],
    referenceBackgroundId: 'prologue/backgrounds/thorn_estate_escape_tunnel_dark',
    contentFilePath: contentIntroFile,
  },
  {
    id: 'preset-mines-inspection',
    title: 'Inspection At The High Ledges',
    summary: 'The mountain site where family order becomes public violence.',
    sceneId: 'chapter-1/scene/intro',
    locationId: 'thorn-mines',
    roomId: 'thorn-mines/high-ledges',
    vibeId: 'industrial-sacred',
    situationId: 'inspection-exposure',
    stylePackId: 'vn-painted-cinematic',
    variantId: 'wide-establishing',
    effectIds: ['smoke-haze'],
    referenceBackgroundId: 'prologue/backgrounds/thorn_mountain_mines_upper_platform',
    contentFilePath: contentIntroFile,
  },
  {
    id: 'preset-awakening-cell',
    title: 'Prison Fall Cell',
    summary: 'The protagonist trapped after the collapse.',
    sceneId: 'chapter-1/scene/prison-fall',
    locationId: 'black-river-underworks',
    roomId: 'black-river-underworks/cell',
    vibeId: 'industrial-sacred',
    situationId: 'captivity-awakening',
    stylePackId: 'vn-painted-nocturne',
    variantId: 'intimate-interior',
    effectIds: ['shadow-veil'],
    referenceBackgroundId: 'chapter-1/backgrounds/prison-cell',
    contentFilePath: 'src/content/chapters/chapter-1/scenes/prison-fall/prison-fall.meta.ts',
  },
  {
    id: 'preset-awakening-temple',
    title: 'Black River Temple Threshold',
    summary: 'The broader underworld opens after confinement.',
    sceneId: 'chapter-1/scene/awakening',
    locationId: 'black-river-underworks',
    roomId: 'black-river-underworks/temple-threshold',
    vibeId: 'industrial-sacred',
    situationId: 'captivity-awakening',
    stylePackId: 'vn-painted-cinematic',
    variantId: 'wide-establishing',
    effectIds: ['shadow-veil', 'firelight-vignette'],
    referenceBackgroundId: 'chapter-1/backgrounds/ancient-temple-black-river.webp',
    contentFilePath: contentAwakeningFile,
  },
  {
    id: 'preset-city-temple-exit',
    title: 'Temple Exit Plaza',
    summary: 'The first open city hub after the aftermath route.',
    sceneId: 'chapter-1/city/temple-exit',
    locationId: 'ashen-reach',
    roomId: 'ashen-reach/temple-exit',
    vibeId: 'ashen-city-suspicion',
    situationId: 'city-routine',
    stylePackId: 'vn-painted-cinematic',
    variantId: 'wide-establishing',
    effectIds: ['ash-haze'],
    referenceBackgroundId: 'chapter-1/backgrounds/temple-exit-plaza.webp',
    contentFilePath: contentCityFile,
  },
  {
    id: 'preset-city-market',
    title: 'Market Lane',
    summary: 'The city’s ration-and-rumor corridor.',
    sceneId: 'chapter-1/city/market-lane',
    locationId: 'ashen-reach',
    roomId: 'ashen-reach/market-lane',
    vibeId: 'ashen-city-suspicion',
    situationId: 'city-routine',
    stylePackId: 'vn-painted-cinematic',
    variantId: 'intimate-interior',
    effectIds: ['ash-haze', 'firelight-vignette'],
    referenceBackgroundId: 'chapter-1/backgrounds/market-lane.webp',
    contentFilePath: contentCityFile,
  },
  {
    id: 'preset-caravan-camp',
    title: 'Caravan Evening Camp',
    summary: 'The route’s shared rest state.',
    sceneId: 'chapter-1/scene/caravan-to-hugen-um',
    locationId: 'caravan-road',
    roomId: 'caravan-road/camps-and-breaks',
    vibeId: 'road-worn-survival',
    situationId: 'route-fatigue',
    stylePackId: 'vn-painted-cinematic',
    variantId: 'wide-establishing',
    effectIds: ['firelight-vignette'],
    referenceBackgroundId: 'chapter-1/backgrounds/caravan/caravan-restfire-evening.webp',
    contentFilePath: contentCaravanFile,
  },
  {
    id: 'preset-caravan-ambush',
    title: 'Caravan Ambush Break',
    summary: 'The route shattered by sudden attack.',
    sceneId: 'chapter-1/scene/caravan-to-hugen-um',
    locationId: 'caravan-road',
    roomId: 'caravan-road/camps-and-breaks',
    vibeId: 'road-worn-survival',
    situationId: 'ambush-break',
    stylePackId: 'vn-painted-crisis',
    variantId: 'wide-establishing',
    effectIds: ['blood-border', 'smoke-haze'],
    referenceBackgroundId: 'chapter-1/backgrounds/caravan/tract-ambush-break.webp',
    contentFilePath: contentCaravanFile,
  },
];

export const chapter1BackgroundPromptWorkbenchData: BackgroundPromptWorkbenchData = {
  locations,
  rooms,
  generalVibes,
  sceneEffects,
  situations,
  stylePacks,
  variants,
  scenePresets,
};
