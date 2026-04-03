import { Chip, Stack, Typography } from '@mui/material';

import type { GameRootStore } from '@engine/stores/GameRootStore';
import type { NarrativeProfileKey } from '@engine/types/profile';
import { PROFILE_LABELS } from '@ui/components/character-menu/narrativeProfileLabels';
import { PanelSection } from '@ui/components/shell/PanelSection';

type NarrativeProfileTabVariant = 'profile' | 'corruption';

interface NarrativeProfileTabProps {
  rootStore: GameRootStore;
  unitId: string | null;
  variant: NarrativeProfileTabVariant;
}

interface NarrativeProfileSection {
  title: string;
  description: string;
  keys: NarrativeProfileKey[];
}

const PROFILE_SECTIONS: NarrativeProfileSection[] = [
  {
    title: 'Core Axes',
    description: 'Narrative worldview markers that shape authored choices and reactions.',
    keys: ['superiority', 'simplicity', 'honor', 'machiavellianism', 'will', 'innocence'],
  },
  {
    title: 'Temperament',
    description: 'Supportive social and ethical vectors used by narrative systems.',
    keys: ['pragmatism', 'humanity', 'altruism', 'egoism'],
  },
];

const CORRUPTION_SECTIONS: NarrativeProfileSection[] = [
  {
    title: 'Corruption Pressure',
    description: 'Direct moral erosion and the pressure it puts on later choices.',
    keys: ['corruption', 'paranoia'],
  },
  {
    title: 'Control And Appetite',
    description: 'Shadow vectors tied to control, restraint, submission, and desire.',
    keys: ['submission', 'domination', 'restraint', 'lust'],
  },
];

function getSections(variant: NarrativeProfileTabVariant) {
  return variant === 'corruption' ? CORRUPTION_SECTIONS : PROFILE_SECTIONS;
}

function getEmptyStateLabel(variant: NarrativeProfileTabVariant) {
  return variant === 'corruption'
    ? 'No corruption markers are revealed yet.'
    : 'No inner profile markers are revealed yet.';
}

export function NarrativeProfileTab({ rootStore, unitId, variant }: NarrativeProfileTabProps) {
  const sections = getSections(variant);
  const hasVisibleEntries = sections.some((section) =>
    section.keys.some((key) => rootStore.profile.isUnlocked(key)),
  );
  const playerUnitId = rootStore.party.playerUnitId;
  const isPlayerPerspective = Boolean(playerUnitId) && unitId === playerUnitId;

  return (
    <Stack spacing={1}>
      {!isPlayerPerspective ? (
        <PanelSection tone="sunken">
          <Typography color="text.secondary" variant="body2">
            Narrative profile is anchored to the protagonist and does not switch with companion previews.
          </Typography>
        </PanelSection>
      ) : null}

      {hasVisibleEntries ? (
        sections.map((section) => {
          const visibleKeys = section.keys.filter((key) => rootStore.profile.isUnlocked(key));

          if (visibleKeys.length === 0) {
            return null;
          }

          return (
            <PanelSection
              key={section.title}
              description={section.description}
              title={section.title}
              tone={variant === 'corruption' ? 'accent' : 'overlay'}
            >
              <Stack direction="row" flexWrap="wrap" gap={0.75}>
                {visibleKeys.map((key) => (
                  <Chip
                    key={key}
                    label={`${PROFILE_LABELS[key]} ${rootStore.profile.getProfileValue(key)}`}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Stack>
            </PanelSection>
          );
        })
      ) : (
        <PanelSection tone="sunken">
          <Typography color="text.secondary" variant="body2">
            {getEmptyStateLabel(variant)}
          </Typography>
        </PanelSection>
      )}
    </Stack>
  );
}
