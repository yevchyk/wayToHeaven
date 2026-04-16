import { chapter1CharacterPromptWorkbenchData } from '@content/storybook/characterProfiles/chapter1CharacterPromptWorkbench';
import type {
  CharacterPromptEmotionNote,
  CharacterPromptSelection,
  CharacterPromptShotProfile,
  CharacterPromptStylePack,
  CharacterPromptSubjectProfile,
  CharacterPromptTargetReference,
} from '@engine/types/characterAuthoring';
import {
  buildCharacterPromptRecipe,
  matchesRenderMode,
  resolveCharacterPromptSelection,
} from '@engine/utils/buildCharacterPromptRecipe';
import { describe, expect, it } from 'vitest';

function buildProfilesIndex<T extends { id: string }>(entries: readonly T[]) {
  return Object.fromEntries(entries.map((entry) => [entry.id, entry])) as Record<string, T>;
}

function buildChapter1Profiles() {
  return {
    subjects: buildProfilesIndex(chapter1CharacterPromptWorkbenchData.subjects),
    targets: buildProfilesIndex(chapter1CharacterPromptWorkbenchData.targetReferences),
    stylePacks: buildProfilesIndex(chapter1CharacterPromptWorkbenchData.stylePacks),
    shotProfiles: buildProfilesIndex(chapter1CharacterPromptWorkbenchData.shotProfiles),
    emotionNotes: buildProfilesIndex(chapter1CharacterPromptWorkbenchData.emotionNotes),
  } satisfies {
    subjects: Record<string, CharacterPromptSubjectProfile>;
    targets: Record<string, CharacterPromptTargetReference>;
    stylePacks: Record<string, CharacterPromptStylePack>;
    shotProfiles: Record<string, CharacterPromptShotProfile>;
    emotionNotes: Record<string, CharacterPromptEmotionNote>;
  };
}

function assertDefined<T>(value: T | null | undefined, message: string): T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }

  return value;
}

describe('buildCharacterPromptRecipe', () => {
  it('builds a production-ready flat portrait prompt for standard NPC portrait sheets', () => {
    const profiles = buildChapter1Profiles();
    const subject =
      chapter1CharacterPromptWorkbenchData.subjects.find((entry) => entry.id === 'father') ??
      chapter1CharacterPromptWorkbenchData.subjects.find((entry) => entry.primaryRenderMode === 'flat-portrait');
    const targetReference =
      chapter1CharacterPromptWorkbenchData.targetReferences.find(
        (entry) => entry.subjectId === subject?.id && entry.renderMode === 'flat-portrait',
      ) ?? null;

    const resolvedSubject = assertDefined(subject, 'Expected a flat-portrait subject in chapter 1 prompt data.');
    const resolvedTarget = assertDefined(
      targetReference,
      'Expected at least one flat-portrait target for the selected subject.',
    );
    const stylePack = assertDefined(
      profiles.stylePacks[resolvedSubject.defaultStylePackId],
      `Missing style pack ${resolvedSubject.defaultStylePackId}.`,
    );
    const shotProfile = assertDefined(
      profiles.shotProfiles['dialogue-bust'],
      'Missing dialogue-bust shot profile.',
    );
    const emotionNote = targetReference?.emotionId
      ? profiles.emotionNotes[targetReference.emotionId]
      : undefined;

    const recipe = buildCharacterPromptRecipe({
      subject: resolvedSubject,
      targetReference: resolvedTarget,
      stylePack,
      shotProfile,
      emotionNote,
    });

    expect(recipe.fullPrompt).toContain('Create production-ready character art for WeyToHeaven.');
    expect(recipe.blocks.renderTarget).toContain('Create a full visual novel dialogue portrait');
    expect(recipe.blocks.renderTarget).toContain('flat portrait sheet');
    expect(recipe.blocks.emotion).toContain('Primary emotional read');
    expect(recipe.blocks.continuity).toContain(resolvedTarget.assetFieldPath);
    expect(recipe.blocks.continuity).toContain(resolvedTarget.contentFilePath);
    expect(recipe.shortPrompt).toContain(stylePack.promptBlock);
    expect(recipe.negativePrompt).toContain('No background');
  });

  it('builds a heroine head-overlay prompt instead of repainting the full body', () => {
    const profiles = buildChapter1Profiles();
    const selection: CharacterPromptSelection = {
      subjectId: 'mirella',
      targetReferenceId:
        chapter1CharacterPromptWorkbenchData.targetReferences.find(
          (entry) => entry.subjectId === 'mirella' && entry.renderMode === 'composite-head',
        )?.id ?? '',
      stylePackId: 'heroine-head-overlay',
      shotId: 'head-overlay-tight',
    };

    const resolved = resolveCharacterPromptSelection(selection, profiles);
    const resolvedSubject = assertDefined(resolved.subject, 'Expected Mirella subject to resolve.');
    const resolvedTarget = assertDefined(resolved.targetReference, 'Expected a Mirella head overlay target.');
    const stylePack = assertDefined(resolved.stylePack, 'Expected heroine-head-overlay style pack.');
    const shotProfile = assertDefined(resolved.shotProfile, 'Expected head-overlay-tight shot profile.');
    const recipe = buildCharacterPromptRecipe({
      subject: resolvedSubject,
      targetReference: resolvedTarget,
      stylePack,
      shotProfile,
      emotionNote: resolved.emotionNote,
    });

    expect(resolvedSubject.primaryRenderMode).toBe('composite-head');
    expect(recipe.blocks.renderTarget).toContain('transparent PNG head overlay');
    expect(recipe.blocks.renderTarget).toContain('Do not redraw the full body');
    expect(recipe.blocks.renderTarget).toContain(`Target layer: ${resolvedTarget.layerId}.`);
    expect(recipe.blocks.continuity).toContain(resolvedTarget.assetFieldPath);
    expect(recipe.fullPrompt).toContain('Composite-ready heroine head overlay');
    expect(recipe.negativePrompt).toContain('No full body');
  });

  it('treats rig layers as structural continuity work instead of expression sheets', () => {
    const profiles = buildChapter1Profiles();
    const rigTarget =
      chapter1CharacterPromptWorkbenchData.targetReferences.find(
        (entry) => entry.subjectId === 'mirella' && entry.renderMode === 'rig-layer',
      ) ?? null;

    const resolvedRigTarget = assertDefined(rigTarget, 'Expected at least one Mirella rig-layer target.');
    const resolvedSubject = assertDefined(profiles.subjects.mirella, 'Expected Mirella subject profile.');
    const stylePack = assertDefined(
      profiles.stylePacks['heroine-head-overlay'],
      'Expected heroine-head-overlay style pack.',
    );
    const shotProfile = assertDefined(
      profiles.shotProfiles['rig-layer-isolated'],
      'Expected rig-layer-isolated shot profile.',
    );

    const recipe = buildCharacterPromptRecipe({
      subject: resolvedSubject,
      targetReference: resolvedRigTarget,
      stylePack,
      shotProfile,
    });

    expect(recipe.blocks.renderTarget).toContain('transparent PNG rig layer');
    expect(recipe.blocks.renderTarget).toContain('Do not include other body parts');
    expect(recipe.blocks.emotion).toContain('structural rig layer');
  });
});

describe('chapter1CharacterPromptWorkbenchData', () => {
  it('keeps composite authoring exclusive to Mirella', () => {
    const compositeTargets = chapter1CharacterPromptWorkbenchData.targetReferences.filter(
      (entry) => entry.renderMode !== 'flat-portrait',
    );
    const nonHeroineCompositeTargets = compositeTargets.filter((entry) => entry.subjectId !== 'mirella');

    expect(compositeTargets.length).toBeGreaterThan(0);
    expect(nonHeroineCompositeTargets).toEqual([]);
  });

  it('keeps non-heroine subjects on flat portrait mode', () => {
    const nonHeroineSubjects = chapter1CharacterPromptWorkbenchData.subjects.filter(
      (entry) => entry.id !== 'mirella',
    );

    expect(nonHeroineSubjects.every((entry) => entry.primaryRenderMode === 'flat-portrait')).toBe(true);
    expect(chapter1CharacterPromptWorkbenchData.subjects.find((entry) => entry.id === 'mirella')?.primaryRenderMode).toBe(
      'composite-head',
    );
  });
});

describe('matchesRenderMode', () => {
  it('accepts unrestricted entries and filters incompatible render modes', () => {
    expect(matchesRenderMode({}, 'flat-portrait')).toBe(true);
    expect(
      matchesRenderMode({ compatibleRenderModes: ['composite-head', 'rig-layer'] }, 'flat-portrait'),
    ).toBe(false);
    expect(
      matchesRenderMode({ compatibleRenderModes: ['composite-head', 'rig-layer'] }, 'rig-layer'),
    ).toBe(true);
  });
});
