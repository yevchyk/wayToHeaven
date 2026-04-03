import { useEffect, useState } from 'react';

import { observer } from 'mobx-react-lite';
import {
  Alert,
  Box,
  Chip,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';

import { useGameRootStore } from '@app/providers/StoreProvider';
import { CharacterPreview } from '@ui/components/CharacterPreview';
import { EquipmentTab } from '@ui/components/character-menu/EquipmentTab';
import { InventoryTab } from '@ui/components/character-menu/InventoryTab';
import { NarrativeProfileTab } from '@ui/components/character-menu/NarrativeProfileTab';
import { OverviewTab } from '@ui/components/character-menu/OverviewTab';
import { PartyTab } from '@ui/components/character-menu/PartyTab';
import { StatusTab } from '@ui/components/character-menu/StatusTab';
import { ModalShell } from '@ui/components/shell/ModalShell';
import { PanelSection } from '@ui/components/shell/PanelSection';
import { shellTokens } from '@ui/components/shell/shellTokens';

type CharacterMenuTabId =
  | 'overview'
  | 'equipment'
  | 'inventory'
  | 'party'
  | 'status'
  | 'profile'
  | 'corruption';

function isCharacterMenuTabId(value: unknown): value is CharacterMenuTabId {
  return (
    value === 'overview' ||
    value === 'equipment' ||
    value === 'inventory' ||
    value === 'party' ||
    value === 'status' ||
    value === 'profile' ||
    value === 'corruption'
  );
}

export const CharacterMenuModal = observer(function CharacterMenuModal() {
  const rootStore = useGameRootStore();
  const { ui, party, battle } = rootStore;
  const isOpen = ui.activeModal?.id === 'character-menu' || ui.activeModal?.id === 'inventory';
  const payloadTab = ui.activeModal?.payload?.tab;
  const [activeTab, setActiveTab] = useState<CharacterMenuTabId>('overview');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (!party.selectedCharacterId && party.playerUnitId) {
      party.setSelectedCharacter(party.playerUnitId);
    }

    const defaultTab = ui.activeModal?.id === 'inventory' ? 'inventory' : 'overview';

    setActiveTab(isCharacterMenuTabId(payloadTab) ? payloadTab : defaultTab);
    setFeedbackMessage(null);
  }, [isOpen, party, payloadTab, ui.activeModal?.id]);

  const selectedCharacter = party.selectedCharacter;
  const selectedCharacterTemplate = party.selectedCharacterTemplate;
  const selectedCharacterPreviewModel = party.selectedCharacterPreviewModel;
  const isReadOnly = battle.hasActiveBattle;

  return (
    <ModalShell
      maxWidth="xl"
      onClose={() => ui.closeModal()}
      open={isOpen}
      subtitle="Портрет, стан загону, інвентар, спорядження та внутрішній профіль героя."
      title="Character Menu"
    >
      <Stack spacing={1}>
        {isReadOnly ? (
          <Alert severity="info">
            Battle is active. Character preview remains available, but use and equip interactions are read-only.
          </Alert>
        ) : null}
        {feedbackMessage ? <Alert severity="info">{feedbackMessage}</Alert> : null}

        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1}>
          <Stack spacing={1} sx={{ width: { xs: '100%', lg: '32%' }, minWidth: 0 }}>
            <CharacterPreview character={selectedCharacterPreviewModel} />

            <PanelSection
              description={selectedCharacterTemplate?.description ?? 'No overview is available for this party member yet.'}
              title={selectedCharacter?.name ?? 'No party member loaded'}
              tone="overlay"
              action={
                selectedCharacter ? (
                  <Stack direction="row" flexWrap="wrap" gap={0.75}>
                    <Chip label={`Level ${selectedCharacter.level}`} size="small" variant="outlined" />
                    <Chip label={`HP ${selectedCharacter.currentHp}/${selectedCharacter.derivedStats.maxHp}`} size="small" variant="outlined" />
                  </Stack>
                ) : null
              }
            >
              {selectedCharacter ? (
                <Stack spacing={0.55}>
                  <Typography data-testid="character-menu-selected-name" sx={{ color: shellTokens.text.primary }} variant="h5">
                    {selectedCharacter.name}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Mana {selectedCharacter.currentMana}/{selectedCharacter.derivedStats.maxMana} • Attack {selectedCharacter.derivedStats.physicalAttack} • Armor {selectedCharacter.derivedStats.armor}
                  </Typography>
                </Stack>
              ) : (
                <Typography color="text.secondary" variant="body2">
                  Load a party member to unlock the character management hub.
                </Typography>
              )}
            </PanelSection>
          </Stack>

          <Stack spacing={1} sx={{ width: { xs: '100%', lg: '68%' }, minWidth: 0 }}>
            <Box
              sx={{
                px: 0.25,
                borderRadius: shellTokens.radius.sm,
                border: `1px solid ${shellTokens.border.subtle}`,
                background: shellTokens.surface.sunken,
              }}
            >
              <Tabs
                aria-label="Character menu tabs"
                onChange={(_event, nextTab: CharacterMenuTabId) => setActiveTab(nextTab)}
                value={activeTab}
                variant="scrollable"
              >
                <Tab label="Overview" value="overview" />
                <Tab label="Equipment" value="equipment" />
                <Tab label="Inventory" value="inventory" />
                <Tab label="Party" value="party" />
                <Tab label="Status" value="status" />
                <Tab label="Profile" value="profile" />
                <Tab label="Corruption" value="corruption" />
              </Tabs>
            </Box>

            <Box sx={{ minHeight: 460 }}>
              {activeTab === 'overview' ? (
                <OverviewTab rootStore={rootStore} unitId={party.selectedCharacterId} />
              ) : null}
              {activeTab === 'equipment' ? (
                <EquipmentTab
                  onFeedback={setFeedbackMessage}
                  readOnly={isReadOnly}
                  rootStore={rootStore}
                  unitId={party.selectedCharacterId}
                />
              ) : null}
              {activeTab === 'inventory' ? (
                <InventoryTab
                  onFeedback={setFeedbackMessage}
                  readOnly={isReadOnly}
                  rootStore={rootStore}
                  unitId={party.selectedCharacterId}
                />
              ) : null}
              {activeTab === 'party' ? <PartyTab rootStore={rootStore} /> : null}
              {activeTab === 'status' ? (
                <StatusTab rootStore={rootStore} unitId={party.selectedCharacterId} />
              ) : null}
              {activeTab === 'profile' ? (
                <NarrativeProfileTab
                  rootStore={rootStore}
                  unitId={party.selectedCharacterId}
                  variant="profile"
                />
              ) : null}
              {activeTab === 'corruption' ? (
                <NarrativeProfileTab
                  rootStore={rootStore}
                  unitId={party.selectedCharacterId}
                  variant="corruption"
                />
              ) : null}
            </Box>
          </Stack>
        </Stack>
      </Stack>
    </ModalShell>
  );
});
