import { useEffect } from 'react';

import { observer } from 'mobx-react-lite';
import {
  Alert,
  Button,
  Divider,
  Stack,
  Typography,
} from '@mui/material';

import { useGameRootStore } from '@app/providers/StoreProvider';
import { ModalShell } from '@ui/components/shell/ModalShell';
import { PanelSection } from '@ui/components/shell/PanelSection';

function formatSavedAt(value: string) {
  try {
    return new Intl.DateTimeFormat('uk-UA', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export const SavesModal = observer(function SavesModal() {
  const rootStore = useGameRootStore();
  const isOpen = rootStore.ui.activeModal?.id === 'saves';

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    void rootStore.saves.refreshSummaries();
  }, [isOpen, rootStore.saves]);

  return (
    <ModalShell
      onClose={() => rootStore.ui.closeModal()}
      open={isOpen}
      subtitle="Керування слотами збережень і швидким відновленням сесії."
      title="Save / Load"
    >
      <Stack spacing={1}>
        <PanelSection description="`F6` creates a quick save. `F9` loads the last quick save." title="Quick slots" tone="sunken" />

        {rootStore.saves.errorMessage ? <Alert severity="error">{rootStore.saves.errorMessage}</Alert> : null}

        {rootStore.saves.slotEntries.map((entry, index) => (
          <PanelSection
            key={entry.slotId}
            description={
              entry.summary
                ? `${entry.summary.activeRuntimeLayer}${entry.summary.flowId ? ` • ${entry.summary.flowId}` : ''}${entry.summary.nodeId ? ` • ${entry.summary.nodeId}` : ''}`
                : 'Empty slot'
            }
            title={entry.label}
            tone="overlay"
            action={
              <Stack direction="row" flexWrap="wrap" gap={0.75}>
                {entry.kind !== 'auto' ? (
                  <Button
                    disabled={rootStore.saves.isBusy}
                    onClick={() => void rootStore.saves.saveToSlot(entry.slotId)}
                    variant="contained"
                  >
                    Save
                  </Button>
                ) : null}
                <Button
                  disabled={rootStore.saves.isBusy || !entry.summary}
                  onClick={() =>
                    void rootStore.saves.loadFromSlot(entry.slotId).then(() => {
                      rootStore.ui.closeModal();
                    })
                  }
                  variant="outlined"
                >
                  Load
                </Button>
                <Button
                  color="inherit"
                  disabled={rootStore.saves.isBusy || !entry.summary}
                  onClick={() => void rootStore.saves.deleteSlot(entry.slotId)}
                  variant="text"
                >
                  Delete
                </Button>
              </Stack>
            }
          >
            <Typography color="text.secondary" variant="body2">
              {entry.summary ? formatSavedAt(entry.summary.savedAt) : 'Ще немає збереженого стану для цього слота.'}
            </Typography>
            {index < rootStore.saves.slotEntries.length - 1 ? <Divider sx={{ mt: 1 }} /> : null}
          </PanelSection>
        ))}
      </Stack>
    </ModalShell>
  );
});
