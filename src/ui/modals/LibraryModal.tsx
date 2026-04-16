import { useEffect, useState } from 'react';

import { observer } from 'mobx-react-lite';
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded';
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded';
import FaceRetouchingNaturalRoundedIcon from '@mui/icons-material/FaceRetouchingNaturalRounded';
import MovieFilterRoundedIcon from '@mui/icons-material/MovieFilterRounded';
import { Box, Button, Chip, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';

import { useGameRootStore } from '@app/providers/StoreProvider';
import {
  buildCharacterLibraryEntries,
  buildLocationLibraryEntries,
  buildSceneLibraryEntries,
  type LibraryEntry,
  type LibraryTabId,
} from '@engine/systems/library/buildLibraryEntries';
import { LibraryArtworkCard } from '@ui/components/library/LibraryArtworkCard';
import { ModalShell } from '@ui/components/shell/ModalShell';
import { PanelSection } from '@ui/components/shell/PanelSection';
import { shellTokens } from '@ui/components/shell/shellTokens';

function isLibraryTabId(value: unknown): value is LibraryTabId {
  return value === 'characters' || value === 'locations' || value === 'scenes';
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function getDefaultEntryId(entries: LibraryEntry[]) {
  return entries[0]?.id ?? null;
}

function resolveSelectedEntry(entries: LibraryEntry[], selectedEntryId: string | null) {
  return entries.find((entry) => entry.id === selectedEntryId) ?? entries[0] ?? null;
}

function filterLibraryEntries(entries: LibraryEntry[], query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase('uk');

  if (!normalizedQuery) {
    return entries;
  }

  return entries.filter((entry) =>
    [entry.title, entry.subtitle, entry.description, entry.tags.join(' ')]
      .join(' ')
      .toLocaleLowerCase('uk')
      .includes(normalizedQuery),
  );
}

export const LibraryModal = observer(function LibraryModal() {
  const rootStore = useGameRootStore();
  const { ui } = rootStore;
  const isOpen = ui.activeModal?.id === 'library';
  const payloadTab = ui.activeModal?.payload?.tab;
  const payloadEntryId = isString(ui.activeModal?.payload?.entryId) ? ui.activeModal?.payload?.entryId : null;
  const showAllEntries = isBoolean(ui.activeModal?.payload?.showAll) ? ui.activeModal?.payload?.showAll : false;
  const characterEntries = buildCharacterLibraryEntries(rootStore).filter(
    (entry) => showAllEntries || rootStore.seenContent.hasDiscoveredCharacter(entry.id),
  );
  const locationEntries = buildLocationLibraryEntries(rootStore).filter(
    (entry) => showAllEntries || rootStore.seenContent.hasDiscoveredLocationEntry(entry.id),
  );
  const sceneEntries = buildSceneLibraryEntries(rootStore).filter(
    (entry) => showAllEntries || rootStore.seenContent.hasDiscoveredSceneEntry(entry.id),
  );
  const characterEntryIdsKey = characterEntries.map((entry) => entry.id).join('|');
  const locationEntryIdsKey = locationEntries.map((entry) => entry.id).join('|');
  const sceneEntryIdsKey = sceneEntries.map((entry) => entry.id).join('|');
  const [activeTab, setActiveTab] = useState<LibraryTabId>('characters');
  const [selectedEntryIds, setSelectedEntryIds] = useState<Record<LibraryTabId, string | null>>({
    characters: getDefaultEntryId(characterEntries),
    locations: getDefaultEntryId(locationEntries),
    scenes: getDefaultEntryId(sceneEntries),
  });
  const [searchByTab, setSearchByTab] = useState<Record<LibraryTabId, string>>({
    characters: '',
    locations: '',
    scenes: '',
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const nextActiveTab = isLibraryTabId(payloadTab) ? payloadTab : 'characters';

    setActiveTab(nextActiveTab);
    setSelectedEntryIds((current) => {
      const nextSelection = {
        characters: characterEntries.some((entry) => entry.id === current.characters)
          ? current.characters
          : getDefaultEntryId(characterEntries),
        locations: locationEntries.some((entry) => entry.id === current.locations)
          ? current.locations
          : getDefaultEntryId(locationEntries),
        scenes: sceneEntries.some((entry) => entry.id === current.scenes)
          ? current.scenes
          : getDefaultEntryId(sceneEntries),
      };

      if (payloadEntryId) {
        const payloadEntries = nextActiveTab === 'characters'
          ? characterEntries
          : nextActiveTab === 'locations'
            ? locationEntries
            : sceneEntries;

        if (payloadEntries.some((entry) => entry.id === payloadEntryId)) {
          nextSelection[nextActiveTab] = payloadEntryId;
        }
      }

      if (
        nextSelection.characters === current.characters &&
        nextSelection.locations === current.locations &&
        nextSelection.scenes === current.scenes
      ) {
        return current;
      }

      return nextSelection;
    });
  }, [characterEntryIdsKey, isOpen, locationEntryIdsKey, payloadEntryId, payloadTab, sceneEntryIdsKey]);

  const activeEntries = activeTab === 'characters'
    ? characterEntries
    : activeTab === 'locations'
      ? locationEntries
      : sceneEntries;
  const activeSearchQuery = searchByTab[activeTab];
  const visibleEntries = filterLibraryEntries(activeEntries, activeSearchQuery);
  const selectedEntry = resolveSelectedEntry(visibleEntries, selectedEntryIds[activeTab]);
  const totalEntryCount = activeEntries.length;
  const visibleEntryCount = visibleEntries.length;
  const hasAnyEntries = totalEntryCount > 0;
  const emptyStateMessage = activeSearchQuery.trim()
    ? 'Жоден відкритий запис не відповідає поточному фільтру.'
    : activeTab === 'characters'
      ? 'У бібліотеці поки немає відкритих персонажів. Записи додаються після реальної зустрічі в сцені або на stage.'
      : activeTab === 'locations'
        ? 'У бібліотеці поки немає відкритих локацій. Записи додаються, коли ти реально входиш у сцену, місто, маршрут або світову локацію.'
        : 'No replay scenes are unlocked yet. Replay entries appear here after the live story reaches a replay-enabled scene.';

  return (
    <ModalShell
      contentSx={{ px: { xs: 1, md: 1.25 }, py: { xs: 1, md: 1.25 }, overflow: 'hidden' }}
      maxWidth="xl"
      onClose={() => ui.closeModal()}
      open={isOpen}
      subtitle="Окремий codex-шар для перегляду персонажів і локацій без виходу з гри."
      title="Бібліотека світу"
    >
      <Stack spacing={1.1} sx={{ minHeight: { xs: 0, lg: 680 } }}>
        <Box
          sx={{
            px: 0.25,
            borderRadius: shellTokens.radius.sm,
            border: `1px solid ${shellTokens.border.subtle}`,
            background: shellTokens.surface.sunken,
          }}
        >
          <Tabs
            aria-label="Library categories"
            onChange={(_event, nextTab: LibraryTabId) => setActiveTab(nextTab)}
            value={activeTab}
            variant="scrollable"
          >
            <Tab
              icon={<FaceRetouchingNaturalRoundedIcon fontSize="small" />}
              iconPosition="start"
              label={`Персонажі · ${characterEntries.length}`}
              value="characters"
            />
            <Tab
              icon={<ExploreRoundedIcon fontSize="small" />}
              iconPosition="start"
              label={`Локації · ${locationEntries.length}`}
              value="locations"
            />
            <Tab
              icon={<MovieFilterRoundedIcon fontSize="small" />}
              iconPosition="start"
              label={`Scene Replay · ${sceneEntries.length}`}
              value="scenes"
            />
          </Tabs>
        </Box>

        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={1}
          sx={{ flex: 1, minHeight: 0 }}
        >
          <Box sx={{ width: { xs: '100%', lg: '29%' }, minWidth: 0, flexShrink: 0 }}>
            <PanelSection
              action={
                <Chip
                  label={`${visibleEntryCount}/${totalEntryCount}`}
                  size="small"
                  variant="outlined"
                />
              }
              description={
                activeTab === 'characters'
                  ? showAllEntries
                    ? 'Workbench bypass: selector показує весь narrative character registry.'
                    : 'Selector показує тільки відкритих персонажів із runtime discovery.'
                  : activeTab === 'locations'
                    ? showAllEntries
                      ? 'Workbench bypass: selector показує всі world, city, travel і scene-level entries.'
                      : 'Локаційна вкладка показує тільки відкриті записи з world, city, travel і scene-level entries.'
                    : showAllEntries
                      ? 'Workbench bypass: selector shows every replay-enabled scene.'
                      : 'Replay tab lists only scenes unlocked through the live story runtime.'
              }
              title={
                activeTab === 'characters'
                  ? 'Каталог персонажів'
                  : activeTab === 'locations'
                    ? 'Каталог локацій'
                    : 'Replay сцени'
              }
              tone="overlay"
            >
              <Stack spacing={1}>
                <TextField
                  fullWidth
                  label={
                    activeTab === 'characters'
                      ? 'Пошук персонажа'
                      : activeTab === 'locations'
                        ? 'Пошук локації'
                        : 'Search replay scene'
                  }
                  onChange={(event) =>
                    setSearchByTab((current) => ({
                      ...current,
                      [activeTab]: event.target.value,
                    }))
                  }
                  placeholder={
                    activeTab === 'characters'
                      ? 'Імʼя, глава, емоція, тег...'
                      : activeTab === 'locations'
                        ? 'Назва, chapter, тип сцени, тег...'
                        : 'Scene title, chapter, replay tag...'
                  }
                  size="small"
                  value={activeSearchQuery}
                />

                <Box
                  sx={{
                    minHeight: { xs: 220, lg: 0 },
                    maxHeight: { xs: 280, lg: 596 },
                    overflowY: 'auto',
                    pr: 0.35,
                  }}
                >
                  <Stack spacing={0.75}>
                    {visibleEntries.map((entry) => {
                      const isSelected = selectedEntry?.id === entry.id;

                      return (
                        <Button
                          aria-pressed={isSelected}
                          data-library-entry-id={entry.id}
                          key={entry.id}
                          onClick={() =>
                            setSelectedEntryIds((current) => ({
                              ...current,
                              [activeTab]: entry.id,
                            }))
                          }
                          sx={{
                            px: 1.2,
                            py: 1,
                            justifyContent: 'flex-start',
                            textAlign: 'left',
                            borderRadius: shellTokens.radius.sm,
                            borderColor: isSelected ? shellTokens.border.active : shellTokens.border.subtle,
                            background: isSelected ? shellTokens.surface.accent : shellTokens.surface.overlay,
                            color: shellTokens.text.primary,
                            boxShadow: isSelected ? shellTokens.shadow.inset : 'none',
                          }}
                          variant="outlined"
                        >
                          <Stack alignItems="flex-start" spacing={0.25} sx={{ width: '100%' }}>
                            <Typography sx={{ color: 'inherit', fontWeight: 600 }} variant="body2">
                              {entry.title}
                            </Typography>
                            <Typography sx={{ color: shellTokens.text.secondary }} variant="caption">
                              {entry.subtitle}
                            </Typography>
                          </Stack>
                        </Button>
                      );
                    })}
                  </Stack>
                </Box>
              </Stack>
            </PanelSection>
          </Box>

          {selectedEntry ? (
            <Stack direction={{ xs: 'column', xl: 'row' }} spacing={1} sx={{ flex: 1, minHeight: 0 }}>
              <Stack spacing={1} sx={{ width: { xs: '100%', xl: '34%' }, minWidth: 0 }}>
                <LibraryArtworkCard
                  imageAssetId={selectedEntry.imageAssetId}
                  imageSourcePath={selectedEntry.imageSourcePath}
                  subtitle={selectedEntry.subtitle}
                  title={selectedEntry.title}
                />

                <PanelSection
                  action={
                    <Chip
                      icon={<AutoStoriesRoundedIcon fontSize="small" />}
                      label={
                        activeTab === 'characters'
                          ? 'Codex персонажа'
                          : activeTab === 'locations'
                            ? 'Codex локації'
                            : 'Scene replay entry'
                      }
                      size="small"
                      variant="outlined"
                    />
                  }
                  description={selectedEntry.subtitle}
                  title={selectedEntry.title}
                  tone="overlay"
                >
                  <Stack direction="row" flexWrap="wrap" gap={0.75}>
                    {selectedEntry.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                  </Stack>
                  {selectedEntry.action ? (
                    <Button
                      onClick={() => {
                        if (selectedEntry.action?.type === 'previewScene') {
                          rootStore.startScenePreview(selectedEntry.action.targetId);
                        }
                      }}
                      sx={{ mt: 1 }}
                      variant="contained"
                    >
                      {selectedEntry.action.label}
                    </Button>
                  ) : null}
                </PanelSection>
              </Stack>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <PanelSection
                  description={
                    activeTab === 'characters'
                      ? 'Правий блок лишається окремим scroll-region, щоб довгі описи не ламали layout.'
                      : activeTab === 'locations'
                        ? 'Для локацій тут зберігається атмосферний опис і короткий системний контекст.'
                        : 'Replay entries describe the archived scene and launch an isolated preview runtime.'
                  }
                  title="Опис"
                >
                  <Box
                    data-testid="library-description-panel"
                    sx={{
                      minHeight: { xs: 220, lg: 0 },
                      maxHeight: { xs: 320, lg: 560 },
                      overflowY: 'auto',
                      pr: 0.5,
                    }}
                  >
                    <Typography
                      sx={{
                        color: shellTokens.text.secondary,
                        fontSize: '0.98rem',
                        lineHeight: 1.72,
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {selectedEntry.description}
                    </Typography>
                  </Box>
                </PanelSection>
              </Box>
            </Stack>
          ) : (
            <PanelSection
              title={hasAnyEntries ? 'Нічого не знайдено' : 'Бібліотека ще порожня'}
              tone="sunken"
            >
              <Typography color="text.secondary" variant="body2">
                {emptyStateMessage}
              </Typography>
            </PanelSection>
          )}
        </Stack>
      </Stack>
    </ModalShell>
  );
});
