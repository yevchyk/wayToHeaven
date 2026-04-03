import { observer } from 'mobx-react-lite';
import { Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { useGameRootStore } from '@app/providers/StoreProvider';
import { prepareDialogueNarrativeHtml } from '@engine/utils/narrativeHtml';
import { NarrativeRichText } from '@ui/components/rich-text/NarrativeRichText';
import { ModalShell } from '@ui/components/shell/ModalShell';
import { PanelSection } from '@ui/components/shell/PanelSection';

export const BacklogModal = observer(function BacklogModal() {
  const rootStore = useGameRootStore();
  const isOpen = rootStore.ui.activeModal?.id === 'backlog';
  const entries = rootStore.backlog.entries;

  return (
    <ModalShell
      onClose={() => rootStore.ui.closeModal()}
      open={isOpen}
      subtitle="Журнал останніх реплік і наративних подій поточної сесії."
      title="Backlog"
    >
      <Stack spacing={1}>
        {entries.length === 0 ? (
          <PanelSection tone="sunken">
            <Typography color="text.secondary" variant="body2">
              Backlog ще порожній для цієї сесії.
            </Typography>
          </PanelSection>
        ) : (
          entries.map((entry) => (
            <PanelSection
              key={entry.id}
              eyebrow={entry.kind}
              title={entry.speakerName ?? 'Наративний запис'}
              tone="overlay"
            >
              <NarrativeRichText
                component="div"
                html={prepareDialogueNarrativeHtml(entry.text)}
                sx={{
                  color: '#f4f7fb',
                  fontSize: '0.98rem',
                  lineHeight: 1.7,
                  '& strong': {
                    color: alpha('#ffffff', 0.96),
                  },
                }}
              />
            </PanelSection>
          ))
        )}
      </Stack>
    </ModalShell>
  );
});
