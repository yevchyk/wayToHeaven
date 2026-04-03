import { describe, expect, it } from 'vitest';

import { buildBackgroundPromptRecipe } from '@engine/utils/buildBackgroundPromptRecipe';
import type {
  BackgroundGeneralVibeProfile,
  BackgroundGenerationStylePack,
  BackgroundMasterLocationProfile,
  BackgroundPromptVariant,
  BackgroundRoomProfile,
  BackgroundSceneEffectProfile,
  BackgroundSituationPreset,
} from '@engine/types/backgroundAuthoring';

describe('buildBackgroundPromptRecipe', () => {
  it('assembles separate blocks without flattening everything into one repeated paragraph', () => {
    const location: BackgroundMasterLocationProfile = {
      id: 'thorn-estate',
      title: 'Thorn Estate',
      chapterId: 'chapter-1',
      summary: 'Mountain manor.',
      locationBlock:
        'A mountain aristocratic estate with cold stone, carved wood, brass fittings, disciplined symmetry, and the feeling of old power starting to rot.',
      continuityNotes: [],
      defaultVibeId: 'aristocratic-decay',
    };
    const room: BackgroundRoomProfile = {
      id: 'thorn-estate/dining-hall',
      locationId: 'thorn-estate',
      title: 'Dining Hall',
      summary: 'Formal breakfast room.',
      locationBlock:
        'A long ceremonial dining hall with tall windows, polished table lines, servant routes, and rigid spacing between seats.',
      continuityNotes: [],
      referenceBackgroundId: 'prologue/backgrounds/thorn_estate_dining_hall_morning',
      defaultVariantId: 'intimate-interior',
      runtimeReferences: [],
    };
    const generalVibe: BackgroundGeneralVibeProfile = {
      id: 'aristocratic-decay',
      title: 'Aristocratic Decay',
      summary: 'Old wealth under pressure.',
      promptBlock:
        'Dark fantasy aristocratic pressure, restrained luxury, controlled posture, and the feeling that the house is still orderly but already cracking from within.',
    };
    const sceneEffects: BackgroundSceneEffectProfile[] = [
      {
        id: 'cold-morning-spill',
        title: 'Cold Morning Spill',
        summary: 'Pale daylight on polished surfaces.',
        promptBlock:
          'Pale morning spill from tall windows crossing silver, table edges, and disciplined architectural lines.',
        styleToken: 'cold-morning-spill',
      },
      {
        id: 'shadow-veil',
        title: 'Shadow Veil',
        summary: 'Pressure gathering in the corners.',
        promptBlock:
          'Heavy shadow pooling in the corners so the room feels watched even while it stays formal.',
        styleToken: 'shadow-veil',
      },
    ];
    const situation: BackgroundSituationPreset = {
      id: 'formal-morning',
      title: 'Formal Morning',
      summary: 'Ceremonial start of day.',
      promptBlock:
        'Morning routine before open collapse: cold daylight, prepared surfaces, domestic discipline, and emotional distance under polite behavior.',
    };
    const stylePack: BackgroundGenerationStylePack = {
      id: 'vn-painted-cinematic',
      title: 'VN Painted Cinematic',
      summary: 'Clean painted VN frame.',
      promptBlock:
        'Painterly but clean visual novel background, cinematic 16:9 frame, believable materials, strong midground readability, and safe negative space for dialogue UI.',
      negativePrompt:
        'No characters, no text, no watermark, no modern objects, no neon sci-fi elements, no fisheye distortion.',
    };
    const variant: BackgroundPromptVariant = {
      id: 'intimate-interior',
      title: 'Intimate Interior',
      summary: 'Closer room framing.',
      promptBlock:
        'Slightly closer interior composition with the room still clearly readable as a place, not a prop collage.',
    };

    const recipe = buildBackgroundPromptRecipe({
      location,
      room,
      generalVibe,
      sceneEffects,
      situation,
      stylePack,
      variant,
    });

    expect(recipe.blocks.location).toContain('Base location: Thorn Estate.');
    expect(recipe.blocks.sceneEffects).toContain('Pale morning spill from tall windows');
    expect(recipe.blocks.location).toContain('Current room or zone: Dining Hall.');
    expect(recipe.fullPrompt).toContain('Scene effects: Pale morning spill from tall windows');
    expect(recipe.fullPrompt).toContain('General vibe: Dark fantasy aristocratic pressure');
    expect(recipe.fullPrompt).toContain('Location foundation: Base location: Thorn Estate.');
    expect(recipe.shortPrompt).toContain('Heavy shadow pooling in the corners');
    expect(recipe.shortPrompt).toContain('Dark fantasy visual novel background.');
    expect(recipe.negativePrompt).toContain('No characters');
  });
});
