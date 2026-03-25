import { useEffect, useState } from 'react';

import { observer } from 'mobx-react-lite';
import {
  Alert,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';

import { useGameRootStore } from '@app/providers/StoreProvider';
import { CharacterPreview } from '@ui/components/CharacterPreview';
import { EquipmentTab } from '@ui/components/character-menu/EquipmentTab';
import { InventoryTab } from '@ui/components/character-menu/InventoryTab';
import { OverviewTab } from '@ui/components/character-menu/OverviewTab';
import { PartyTab } from '@ui/components/character-menu/PartyTab';
import { StatusTab } from '@ui/components/character-menu/StatusTab';

type CharacterMenuTabId = 'overview' | 'equipment' | 'inventory' | 'party' | 'status';

function isCharacterMenuTabId(value: unknown): value is CharacterMenuTabId {
  return value === 'overview' || value === 'equipment' || value === 'inventory' || value === 'party' || value === 'status';
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

    setActiveTab(isCharacterMenuTabId(payloadTab) ? payloadTab : 'overview');
    setFeedbackMessage(null);
  }, [isOpen, party, payloadTab]);

  const selectedCharacter = party.selectedCharacter;
  const selectedCharacterTemplate = party.selectedCharacterTemplate;
  const selectedCharacterPreviewModel = party.selectedCharacterPreviewModel;
  const isReadOnly = battle.hasActiveBattle;

  return (
    <Dialog fullWidth maxWidth="xl" onClose={() => ui.closeModal()} open={isOpen}>
      <DialogTitle>Character Menu</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          {isReadOnly ? (
            <Alert severity="info">
              Battle is active. Character preview remains available, but use and equip interactions are read-only.
            </Alert>
          ) : null}
          {feedbackMessage ? <Alert severity="info">{feedbackMessage}</Alert> : null}

          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
            <Stack spacing={2} sx={{ width: { xs: '100%', lg: '38%' } }}>
              <CharacterPreview character={selectedCharacterPreviewModel} />
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: '1px solid rgba(255,255,255,0.08)',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                }}
              >
                {selectedCharacter ? (
                  <Stack spacing={0.75}>
                    <Typography data-testid="character-menu-selected-name" variant="h5">
                      {selectedCharacter.name}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      {selectedCharacterTemplate?.description ?? 'No overview is available for this party member yet.'}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      Level {selectedCharacter.level} | HP {selectedCharacter.currentHp}/{selectedCharacter.derivedStats.maxHp} | Mana {selectedCharacter.currentMana}/{selectedCharacter.derivedStats.maxMana}
                    </Typography>
                  </Stack>
                ) : (
                  <Typography color="text.secondary" variant="body2">
                    Load a party member to unlock the character management hub.
                  </Typography>
                )}
              </Box>
            </Stack>

            <Stack spacing={2} sx={{ width: { xs: '100%', lg: '62%' } }}>
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
              </Tabs>

              <Box
                sx={{
                  minHeight: 460,
                  p: { xs: 2, md: 2.5 },
                  borderRadius: 3,
                  border: '1px solid rgba(255,255,255,0.08)',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                }}
              >
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
              </Box>
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => ui.closeModal()}>Close</Button>
      </DialogActions>
    </Dialog>
  );
});
