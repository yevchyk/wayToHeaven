import { observer } from 'mobx-react-lite';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import BackpackOutlinedIcon from '@mui/icons-material/BackpackOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { Box, Button, Chip, Stack } from '@mui/material';

import { useGameRootStore } from '@app/providers/StoreProvider';
import { shellTokens } from '@ui/components/shell/shellTokens';

export const MetaHud = observer(function MetaHud() {
  const rootStore = useGameRootStore();
  const { activeScreen } = rootStore.ui;
  const storyDay = rootStore.time.day;
  const timeSegment = rootStore.time.segmentLabel;
  const mainQuestCount = rootStore.quests.activeMainQuests.length;
  const characterQuestCount = rootStore.quests.activeCharacterQuests.length;
  const dailyQuestCount = rootStore.quests.activeDailyQuests.length;

  if (activeScreen === 'home' || activeScreen === 'mainMenu') {
    return null;
  }

  return (
    <Box
      sx={{
        p: 0.75,
        borderRadius: shellTokens.radius.md,
        border: `1px solid ${shellTokens.border.subtle}`,
        background: 'linear-gradient(180deg, rgba(14, 19, 26, 0.52) 0%, rgba(10, 14, 20, 0.66) 100%)',
        backdropFilter: shellTokens.blur.medium,
      }}
    >
      <Stack
        alignItems={{ xs: 'stretch', md: 'center' }}
        direction={{ xs: 'column', xl: 'row' }}
        justifyContent="space-between"
        spacing={0.9}
      >
        <Stack direction="row" flexWrap="wrap" gap={0.75}>
          {storyDay > 0 ? <Chip color="secondary" label={`Day ${storyDay}`} variant="outlined" /> : null}
          {timeSegment ? <Chip color="secondary" label={timeSegment} variant="outlined" /> : null}
          <Chip color="warning" label={`Hunger ${rootStore.meta.hunger}`} variant="outlined" />
          <Chip color="error" label={`Safety ${rootStore.meta.safety}`} variant="outlined" />
          <Chip color="success" label={`Morale ${rootStore.meta.morale}`} variant="outlined" />
          <Chip color="info" label={`Reputation ${rootStore.meta.reputation}`} variant="outlined" />
          <Chip color="default" label={`Bad Rep ${rootStore.meta.badReputation}`} variant="outlined" />
          {mainQuestCount > 0 ? <Chip color="primary" label={`Main ${mainQuestCount}`} variant="filled" /> : null}
          {characterQuestCount > 0 ? <Chip color="primary" label={`Character ${characterQuestCount}`} variant="outlined" /> : null}
          {dailyQuestCount > 0 ? <Chip color="primary" label={`Daily ${dailyQuestCount}`} variant="outlined" /> : null}
        </Stack>
        <Stack direction="row" flexWrap="wrap" gap={0.75}>
          <Button onClick={() => rootStore.ui.openModal('quests')} startIcon={<AssignmentOutlinedIcon />} variant="outlined">
            Quests
          </Button>
          <Button onClick={() => rootStore.ui.openModal('saves')} startIcon={<SaveOutlinedIcon />} variant="outlined">
            Saves
          </Button>
          <Button onClick={() => rootStore.openLibrary('characters')} startIcon={<AutoStoriesOutlinedIcon />} variant="outlined">
            Library
          </Button>
          <Button onClick={() => rootStore.ui.openModal('stats-debug')} variant="outlined">
            Stats
          </Button>
          <Button onClick={() => rootStore.openCharacterMenu()} startIcon={<BackpackOutlinedIcon />} variant="outlined">
            Character Menu
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
});
