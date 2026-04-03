import { observer } from 'mobx-react-lite';
import {
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';

import { useGameRootStore } from '@app/providers/StoreProvider';
import type { QuestRuntimeState } from '@engine/types/quest';
import { ModalShell } from '@ui/components/shell/ModalShell';
import { PanelSection } from '@ui/components/shell/PanelSection';

interface QuestSectionProps {
  title: string;
  emptyText: string;
  states: QuestRuntimeState[];
  completed?: boolean;
}

function QuestSection({ title, emptyText, states, completed = false }: QuestSectionProps) {
  const rootStore = useGameRootStore();

  return (
    <PanelSection eyebrow="Journal" title={title} tone={completed ? 'accent' : 'default'}>
      <Stack spacing={1}>
        {states.length === 0 ? (
          <Typography color="text.secondary" variant="body2">
            {emptyText}
          </Typography>
        ) : (
          states.map((state) => {
            const definition = rootStore.quests.getQuestDefinition(state.questId);
            const ownerLabel = definition?.ownerId
              ? rootStore.getNarrativeCharacterById(definition.ownerId)?.displayName ?? definition.ownerId
              : null;
            const maxProgress = definition?.maxProgress ?? null;
            const progressLabel = maxProgress ? `${state.progress} / ${maxProgress}` : null;
            const progressValue =
              maxProgress && maxProgress > 0
                ? Math.min(100, Math.round((state.progress / maxProgress) * 100))
                : null;

            return (
              <PanelSection
                key={state.questId}
                description={definition?.description ?? 'Опис для цього квесту ще не заповнений.'}
                title={definition?.title ?? state.questId}
                tone={completed ? 'accent' : 'overlay'}
                action={
                  <Stack direction="row" flexWrap="wrap" gap={0.75}>
                    {ownerLabel ? <Chip label={ownerLabel} size="small" variant="outlined" /> : null}
                    {definition?.kind ? <Chip label={definition.kind} size="small" variant="outlined" /> : null}
                    <Chip
                      label={completed ? 'completed' : 'active'}
                      size="small"
                      variant={completed ? 'filled' : 'outlined'}
                    />
                  </Stack>
                }
              >
                {progressValue !== null ? (
                  <Stack spacing={0.45}>
                    <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
                      <Typography color="text.secondary" variant="caption">
                        Progress
                      </Typography>
                      <Typography color="text.secondary" variant="caption">
                        {progressLabel}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      aria-label={`${definition?.title ?? state.questId} progress`}
                      color={completed ? 'success' : 'primary'}
                      value={completed ? 100 : progressValue}
                      variant="determinate"
                    />
                  </Stack>
                ) : null}
              </PanelSection>
            );
          })
        )}
      </Stack>
    </PanelSection>
  );
}

export const QuestJournalModal = observer(function QuestJournalModal() {
  const rootStore = useGameRootStore();
  const isOpen = rootStore.ui.activeModal?.id === 'quests';

  return (
    <ModalShell
      onClose={() => rootStore.ui.closeModal()}
      open={isOpen}
      subtitle="Активні арки, персональні задачі та завершені лінії прогресу."
      title="Quest Journal"
    >
      <Stack spacing={1}>
        <QuestSection
          emptyText="Наразі немає активних main quest lines."
          states={rootStore.quests.activeMainQuests}
          title="Main quests"
        />
        <QuestSection
          emptyText="Наразі немає активних character quest lines."
          states={rootStore.quests.activeCharacterQuests}
          title="Character quests"
        />
        <QuestSection
          emptyText="Наразі немає активних daily quest lines."
          states={rootStore.quests.activeDailyQuests}
          title="Daily quests"
        />
        <QuestSection
          completed
          emptyText="Жоден квест ще не завершено."
          states={rootStore.quests.completedQuests}
          title="Completed"
        />
      </Stack>
    </ModalShell>
  );
});
