import { chapter1HeroineCompositeDefinition } from '@content/characters';
import { narrativeCharacterRegistry } from '@content/registries/npcRegistry';
import type {
  CharacterPromptEmotionNote,
  CharacterPromptShotProfile,
  CharacterPromptStylePack,
  CharacterPromptSubjectProfile,
  CharacterPromptTargetReference,
  CharacterPromptWorkbenchData,
} from '@engine/types/characterAuthoring';
import type { CharacterEmotion } from '@engine/types/dialogue';
import type { NarrativeCharacterData } from '@engine/types/narrative';

const compositeSourceFile = 'src/content/characters/chapter1CharacterComposites.ts';

const characterSourceFileById: Record<string, string> = {
  heroine: 'src/content/chapters/chapter-1/npcs/heroine.npc.ts',
  'gate-guard': 'src/content/chapters/chapter-1/npcs/gate-guard.npc.ts',
  'old-voice': 'src/content/chapters/chapter-1/npcs/old-voice.npc.ts',
};

const stylePacks: CharacterPromptStylePack[] = [
  {
    id: 'vn-painted-portrait',
    title: 'VN Painted Portrait',
    summary: 'Default full-portrait pack for dialogue-ready character sheets.',
    promptBlock:
      'Painterly visual novel portrait with transparent background, controlled face readability, clean silhouette separation, and enough material detail to survive dialogue-scale presentation.',
    negativePrompt:
      'No background scene, no text, no watermark, no logo, no extra characters, no UI, no cropped face accidents, no photobash collage look.',
    compatibleRenderModes: ['flat-portrait'],
  },
  {
    id: 'vn-painted-frayed',
    title: 'VN Painted Frayed',
    summary: 'Worn or emotionally damaged portrait treatment without losing readability.',
    promptBlock:
      'Painterly visual novel portrait with tired fabric logic, emotional strain, and slightly rougher material edges while keeping the face clean and readable.',
    negativePrompt:
      'No gore splash, no background, no text, no watermark, no extreme body distortion, no unreadable shadow over the face.',
    compatibleRenderModes: ['flat-portrait'],
  },
  {
    id: 'heroine-head-overlay',
    title: 'Heroine Head Overlay',
    summary: 'Composite-friendly expression pack for Mirella head swaps.',
    promptBlock:
      'Composite-ready heroine head overlay for a dark fantasy visual novel, matching an existing body rig, stage angle, and noble silhouette without repainting the whole character.',
    negativePrompt:
      'No full body, no shoulders beyond the current neck transition, no background, no text, no watermark, no new camera angle, no costume redesign.',
    compatibleRenderModes: ['composite-head', 'rig-layer'],
  },
];

const shotProfiles: CharacterPromptShotProfile[] = [
  {
    id: 'dialogue-bust',
    title: 'Dialogue Bust',
    summary: 'Safe default for most NPC and cast portraits.',
    promptBlock:
      'Bust-up visual novel framing, centered for dialogue use, transparent background, clean head-and-shoulders readability, with enough chest and collar detail to preserve costume logic.',
    compatibleRenderModes: ['flat-portrait'],
  },
  {
    id: 'dialogue-half-body',
    title: 'Dialogue Half Body',
    summary: 'Slightly wider full portrait when posture matters.',
    promptBlock:
      'Half-body dialogue portrait with transparent background, readable hands or torso gesture when needed, and enough negative space that the runtime crop still reads cleanly.',
    compatibleRenderModes: ['flat-portrait'],
  },
  {
    id: 'head-overlay-tight',
    title: 'Head Overlay Tight',
    summary: 'Precise composite framing for Mirella expression swaps.',
    promptBlock:
      'Tight head overlay framing that matches the existing heroine body rig angle and scale, preserving the same neckline, face direction, and emotional readability at VN size.',
    compatibleRenderModes: ['composite-head'],
  },
  {
    id: 'rig-layer-isolated',
    title: 'Rig Layer Isolated',
    summary: 'Use for body, clothes, hair, hand, or weapon layers.',
    promptBlock:
      'Isolated transparent rig layer matching the established heroine composite stage, with clean edges, exact camera continuity, and no unrelated body parts included.',
    compatibleRenderModes: ['rig-layer'],
  },
];

const emotionNotes: CharacterPromptEmotionNote[] = [
  {
    id: 'neutral',
    title: 'Neutral',
    promptBlock:
      'Primary emotional read: neutral. The expression should feel alive and attentive, not mannequin-flat, while remaining reusable as a canonical baseline.',
  },
  {
    id: 'thinking',
    title: 'Thinking',
    promptBlock:
      'Primary emotional read: thinking. Show inward calculation and held attention rather than theatrical confusion.',
  },
  {
    id: 'hurt',
    title: 'Hurt',
    promptBlock:
      'Primary emotional read: hurt. The face should carry fresh emotional impact without collapsing into melodrama or fully broken posture.',
  },
  {
    id: 'humiliated',
    title: 'Humiliated',
    promptBlock:
      'Primary emotional read: humiliated. Keep the shame visible in the mouth, eyes, and held tension, but preserve dignity and clear face readability.',
  },
  {
    id: 'waking',
    title: 'Waking',
    promptBlock:
      'Primary emotional read: waking. The expression should feel recently conscious, slightly vulnerable, and not yet fully composed.',
  },
  {
    id: 'shaken',
    title: 'Shaken',
    promptBlock:
      'Primary emotional read: shaken. The face should hold disturbance and recent shock while staying clean enough for dialogue repetition.',
  },
  {
    id: 'battle_ready',
    title: 'Battle Ready',
    promptBlock:
      'Primary emotional read: battle ready. Show controlled readiness and directed force, not cartoon aggression.',
  },
  {
    id: 'careful',
    title: 'Careful',
    promptBlock:
      'Primary emotional read: careful. This should read as alert social caution rather than overt fear.',
  },
  {
    id: 'soft',
    title: 'Soft',
    promptBlock:
      'Primary emotional read: soft. Keep the tenderness restrained and grounded, without pushing the character into empty sweetness.',
  },
  {
    id: 'cold',
    title: 'Cold',
    promptBlock:
      'Primary emotional read: cold. The expression should feel deliberate, emotionally withholding, and socially sharp.',
  },
  {
    id: 'mocking',
    title: 'Mocking',
    promptBlock:
      'Primary emotional read: mocking. Keep the superiority readable in the mouth and eyes without turning the face into caricature.',
  },
  {
    id: 'hunger',
    title: 'Hunger',
    promptBlock:
      'Primary emotional read: hunger. The face should feel invasive and wrong in a dark-fantasy way, not merely physically hungry.',
  },
  {
    id: 'invasion',
    title: 'Invasion',
    promptBlock:
      'Primary emotional read: invasion. Push the sense that another will or presence is forcing itself through the subject, while keeping the silhouette usable in VN framing.',
  },
  {
    id: 'broken',
    title: 'Broken',
    promptBlock:
      'Primary emotional read: broken. The face should feel collapsed and spent without losing clear identity matching to neighboring portraits.',
  },
];

const subjectOverrides: Partial<
  Record<
    string,
    Pick<CharacterPromptSubjectProfile, 'summary' | 'identityBlock' | 'continuityNotes' | 'defaultStylePackId'>
  >
> = {
  mirella: {
    summary: 'Main story heroine pipeline with composite head overlays, isolated rig layers, and fallback flat portraits for archive continuity.',
    identityBlock:
      'Main Chapter 1 story heroine. Preserve the same face identity, noble dark-fantasy bearing, and stable heroine-scale readability across head overlays, rig layers, and fallback flat portraits. This is the only approved composite character pipeline in the runtime.',
    continuityNotes: [
      'Head overlays must match the existing heroine body rig angle and neckline.',
      'Fallback flat portraits for Mirella should still look like the same woman as the composite rig.',
      'Do not redesign costume language casually between adjacent heroine states.',
    ],
    defaultStylePackId: 'heroine-head-overlay',
  },
  father: {
    summary:
      'Legacy intro alias for Lord Guy Thorn. Prompting must preserve the same man as the later lord-guy scenes instead of inventing a second father design.',
    identityBlock:
      'Lord Guy Thorn in the earlier prologue-facing registry alias. Heavy, bearded, tired, controlling, and severe; preserve the same face identity used by the later lord-guy subject so intro and chapter scenes read as the same father.',
    continuityNotes: [
      'Do not design father and lord-guy as different men.',
      'Keep the visual language grounded in dark-fantasy aristocratic authority, not modern fashion styling.',
    ],
    defaultStylePackId: 'vn-painted-portrait',
  },
  mother: {
    summary:
      'Legacy intro alias for Lady Sera Thorn. Prompting must preserve the same woman as the later lady-sera scenes instead of inventing a second mother design.',
    identityBlock:
      'Lady Sera Thorn in the earlier prologue-facing registry alias. Orange-haired, green-eyed, elegant, controlled, and visibly tired under ritual composure; preserve the same face identity used by the later lady-sera subject.',
    continuityNotes: [
      'Do not design mother and lady-sera as different women.',
      'Keep the wardrobe in a dark-fantasy noble register rather than modern casual clothing.',
    ],
    defaultStylePackId: 'vn-painted-portrait',
  },
  'lady-sera': {
    summary:
      'Primary chapter-facing version of Sera Thorn: composed noble matriarch, golden-faith surface, inward exhaustion, and dangerous emotional clarity.',
    identityBlock:
      'Lady Sera Thorn. Orange-haired, green-eyed, elegant, disciplined, and still beautiful in a controlled, aristocratic way. Her face should carry golden-faith polish, private exhaustion, and a refusal to collapse in public.',
    continuityNotes: [
      'She is the same woman as the legacy mother alias from intro scenes.',
      'Do not drift into modern casual fashion, glam pin-up posing, or soft contemporary styling.',
    ],
    defaultStylePackId: 'vn-painted-portrait',
  },
  tanya: {
    summary:
      'Personal maid to Mirella. She should read as a specific young woman, not as a generic servant placeholder.',
    identityBlock:
      'Tanya, Mirella’s personal maid. Short pink-blond hair, careful body language, anxious alertness, and quiet physical softness under servant discipline. She should feel specific, vulnerable, and observant, not like a nameless background maid.',
    continuityNotes: [
      'Keep Tanya distinct from the generic servant_girl placeholder naming used in older content.',
      'Her fear of Aren should read in posture and face tension without erasing her inner adaptability.',
    ],
    defaultStylePackId: 'vn-painted-portrait',
  },
  galen: {
    summary:
      'Mine overseer and worker truth-point for the Thorn system. He should look practical, worn, and convincing in an industrial mountain setting.',
    identityBlock:
      'Galen, an experienced mine overseer in the Thorn sector. Dust-aged, practical, physically credible, and not aristocratic. He should read as a man who knows the rock, the workers, and the cost of making the wrong call one second too late.',
    continuityNotes: [
      'Do not beautify him into a noble hero or polished officer.',
      'Keep the design grounded in mine dust, work wear, and lived physical strain.',
    ],
    defaultStylePackId: 'vn-painted-frayed',
  },
};

function getCharacterSourceFile(characterId: string) {
  return characterSourceFileById[characterId] ?? 'src/content/chapters/chapter-1/npcs/supporting-cast.npc.ts';
}

function sortByTitle<T extends { title: string }>(entries: readonly T[]) {
  return [...entries].sort((left, right) => left.title.localeCompare(right.title, 'uk'));
}

function buildGenericSummary(character: NarrativeCharacterData) {
  return character.portraitPresentation === 'composite'
    ? `${character.displayName} uses the heroine composite pipeline for primary runtime presentation.`
    : `${character.displayName} uses full flat emotion portraits for dialogue and scene staging.`;
}

function buildGenericIdentityBlock(character: NarrativeCharacterData) {
  if (character.portraitPresentation === 'composite') {
    return `Main heroine subject for Chapter 1. Preserve the same face identity, age impression, hair silhouette, and character scale across every composite-facing asset.`;
  }

  return `Recurring Chapter 1 dialogue character. Preserve ${character.displayName}'s face identity, age impression, hair silhouette, and costume logic across every flat portrait emotion.`;
}

function buildGenericContinuityNotes(character: NarrativeCharacterData) {
  if (character.portraitPresentation === 'composite') {
    return [
      'Composite-facing assets must stay aligned to the existing heroine stage and camera.',
      'Do not let head overlays drift into full-body redraws.',
    ];
  }

  return [
    'Keep the portrait on a transparent background for dialogue use.',
    'Preserve face identity between emotions instead of reimagining the character from scratch.',
  ];
}

function buildSubjectProfile(character: NarrativeCharacterData): CharacterPromptSubjectProfile {
  const override = subjectOverrides[character.id];
  const primaryRenderMode = character.portraitPresentation === 'composite' ? 'composite-head' : 'flat-portrait';

  return {
    id: character.id,
    characterId: character.id,
    chapterId: character.chapterId,
    displayName: character.displayName,
    summary: override?.summary ?? buildGenericSummary(character),
    primaryRenderMode,
    identityBlock: override?.identityBlock ?? buildGenericIdentityBlock(character),
    continuityNotes: override?.continuityNotes ?? buildGenericContinuityNotes(character),
    defaultStylePackId:
      override?.defaultStylePackId ??
      (primaryRenderMode === 'flat-portrait' ? 'vn-painted-portrait' : 'heroine-head-overlay'),
  };
}

function buildFlatTargetReferences(character: NarrativeCharacterData): CharacterPromptTargetReference[] {
  const contentFilePath = getCharacterSourceFile(character.id);
  const targets: CharacterPromptTargetReference[] = [];

  if (character.defaultPortraitId) {
    targets.push({
      id: `${character.id}::defaultPortrait`,
      subjectId: character.id,
      title: 'Default Portrait',
      summary: 'Canonical fallback portrait for dialogue runtime.',
      renderMode: 'flat-portrait',
      assetId: character.defaultPortraitId,
      contentFilePath,
      assetFieldPath: 'defaultPortraitId',
      emotionId: character.defaultEmotion,
    });
  }

  Object.entries(character.portraitRefs).forEach(([emotionId, assetId]) => {
    if (!assetId) {
      return;
    }

    targets.push({
      id: `${character.id}::emotion::${emotionId}`,
      subjectId: character.id,
      title: `Emotion · ${emotionId}`,
      summary: `Flat portrait target for the ${emotionId} emotion.`,
      renderMode: 'flat-portrait',
      assetId,
      contentFilePath,
      assetFieldPath: `portraitRefs.${emotionId}`,
      emotionId: emotionId as CharacterEmotion,
    });
  });

  Object.entries(character.outfits ?? {}).forEach(([outfitId, outfit]) => {
    if (outfit.defaultPortraitId) {
      targets.push({
        id: `${character.id}::outfit::${outfitId}::default`,
        subjectId: character.id,
        title: `Outfit · ${outfit.label}`,
        summary: `Fallback portrait for outfit ${outfit.label}.`,
        renderMode: 'flat-portrait',
        assetId: outfit.defaultPortraitId,
        contentFilePath,
        assetFieldPath: `outfits.${outfitId}.defaultPortraitId`,
        emotionId: character.defaultEmotion,
      });
    }

    Object.entries(outfit.portraitRefs ?? {}).forEach(([emotionId, assetId]) => {
      if (!assetId) {
        return;
      }

      targets.push({
        id: `${character.id}::outfit::${outfitId}::${emotionId}`,
        subjectId: character.id,
        title: `Outfit · ${outfit.label} · ${emotionId}`,
        summary: `Outfit-specific flat portrait target for the ${emotionId} emotion.`,
        renderMode: 'flat-portrait',
        assetId,
        contentFilePath,
        assetFieldPath: `outfits.${outfitId}.portraitRefs.${emotionId}`,
        emotionId: emotionId as CharacterEmotion,
      });
    });
  });

  if (targets.length === 0) {
    targets.push({
      id: `${character.id}::placeholder`,
      subjectId: character.id,
      title: 'Missing Portrait Target',
      summary: 'This character still needs a first canonical portrait asset.',
      renderMode: 'flat-portrait',
      assetId: null,
      contentFilePath,
      assetFieldPath: 'portraitRefs.<emotion>',
      note: 'No flat portrait asset is wired yet. Create the first canonical portrait here.',
    });
  }

  return targets;
}

function buildHeroineCompositeTargets(): CharacterPromptTargetReference[] {
  const targets: CharacterPromptTargetReference[] = [];
  const definition = chapter1HeroineCompositeDefinition;

  targets.push(
    {
      id: `${definition.id}::rig::body`,
      subjectId: definition.id,
      title: 'Rig Layer · body/base',
      summary: 'Stable heroine silhouette layer.',
      renderMode: 'rig-layer',
      assetId: definition.assets.body.assetId,
      sourcePath: definition.assets.body.sourcePath,
      contentFilePath: compositeSourceFile,
      assetFieldPath: 'chapter1HeroineCompositeDefinition.assets.body',
      layerId: 'body/base',
    },
    {
      id: `${definition.id}::rig::clothes`,
      subjectId: definition.id,
      title: 'Rig Layer · clothes/base',
      summary: 'Baseline heroine clothes layer.',
      renderMode: 'rig-layer',
      assetId: definition.assets.clothes?.assetId ?? null,
      sourcePath: definition.assets.clothes?.sourcePath,
      contentFilePath: compositeSourceFile,
      assetFieldPath: 'chapter1HeroineCompositeDefinition.assets.clothes',
      layerId: 'clothes/base',
    },
    {
      id: `${definition.id}::rig::hair`,
      subjectId: definition.id,
      title: 'Rig Layer · hair/base',
      summary: 'Reusable heroine hair layer.',
      renderMode: 'rig-layer',
      assetId: definition.assets.hair?.assetId ?? null,
      sourcePath: definition.assets.hair?.sourcePath,
      contentFilePath: compositeSourceFile,
      assetFieldPath: 'chapter1HeroineCompositeDefinition.assets.hair',
      layerId: 'hair/base',
    },
    {
      id: `${definition.id}::rig::left-hand`,
      subjectId: definition.id,
      title: 'Rig Layer · hands/left',
      summary: 'Left hand layer for staged heroine poses.',
      renderMode: 'rig-layer',
      assetId: definition.assets.hands?.left.assetId ?? null,
      sourcePath: definition.assets.hands?.left.sourcePath,
      contentFilePath: compositeSourceFile,
      assetFieldPath: 'chapter1HeroineCompositeDefinition.assets.hands.left',
      layerId: 'hands/left',
    },
    {
      id: `${definition.id}::rig::right-hand`,
      subjectId: definition.id,
      title: 'Rig Layer · hands/right',
      summary: 'Right hand layer for staged heroine poses.',
      renderMode: 'rig-layer',
      assetId: definition.assets.hands?.right.assetId ?? null,
      sourcePath: definition.assets.hands?.right.sourcePath,
      contentFilePath: compositeSourceFile,
      assetFieldPath: 'chapter1HeroineCompositeDefinition.assets.hands.right',
      layerId: 'hands/right',
    },
    {
      id: `${definition.id}::rig::weapon`,
      subjectId: definition.id,
      title: 'Rig Layer · weapon/base',
      summary: 'Optional heroine weapon layer.',
      renderMode: 'rig-layer',
      assetId: definition.assets.weapon?.assetId ?? null,
      sourcePath: definition.assets.weapon?.sourcePath,
      contentFilePath: compositeSourceFile,
      assetFieldPath: 'chapter1HeroineCompositeDefinition.assets.weapon',
      layerId: 'weapon/base',
    },
  );

  Object.entries(definition.assets.headByEmotion ?? {}).forEach(([emotionId, asset]) => {
    if (!asset) {
      return;
    }

    targets.push({
      id: `${definition.id}::head::${emotionId}`,
      subjectId: definition.id,
      title: `Head Overlay · ${emotionId}`,
      summary: `Composite head swap for the ${emotionId} emotion.`,
      renderMode: 'composite-head',
      assetId: asset.assetId,
      sourcePath: asset.sourcePath,
      contentFilePath: compositeSourceFile,
      assetFieldPath: `chapter1HeroineCompositeDefinition.assets.headByEmotion['${emotionId}']`,
      emotionId: emotionId as CharacterEmotion,
      layerId: `head/${emotionId}`,
    });
  });

  return targets;
}

const chapter1Characters = Object.values(narrativeCharacterRegistry)
  .filter((character) => character.chapterId === 'chapter-1')
  .sort((left, right) => left.displayName.localeCompare(right.displayName, 'uk'));

const subjects = chapter1Characters.map((character) => buildSubjectProfile(character));

const targetReferences = sortByTitle([
  ...chapter1Characters.flatMap((character) => buildFlatTargetReferences(character)),
  ...buildHeroineCompositeTargets(),
]);

export const chapter1CharacterPromptWorkbenchData: CharacterPromptWorkbenchData = {
  subjects,
  targetReferences,
  stylePacks,
  shotProfiles,
  emotionNotes,
};
