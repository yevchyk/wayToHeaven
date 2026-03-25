import { observer } from 'mobx-react-lite';
import BackpackOutlinedIcon from '@mui/icons-material/BackpackOutlined';
import { Button, Chip, Stack } from '@mui/material';

import { useGameRootStore } from '@app/providers/StoreProvider';

export const MetaHud = observer(function MetaHud() {
  const rootStore = useGameRootStore();
  const { activeScreen } = rootStore.ui;

  if (activeScreen === 'home' || activeScreen === 'mainMenu') {
    return null;
  }

  return (
    <Stack
      alignItems={{ xs: 'stretch', md: 'center' }}
      direction={{ xs: 'column', md: 'row' }}
      justifyContent="space-between"
      spacing={1.5}
    >
      <Stack direction="row" flexWrap="wrap" gap={1}>
        <Chip color="warning" label={`Hunger ${rootStore.meta.hunger}`} variant="outlined" />
        <Chip color="success" label={`Morale ${rootStore.meta.morale}`} variant="outlined" />
        <Chip color="info" label={`Reputation ${rootStore.meta.reputation}`} variant="outlined" />
      </Stack>
      <Button onClick={() => rootStore.openCharacterMenu()} startIcon={<BackpackOutlinedIcon />} variant="outlined">
        Character Menu
      </Button>
    </Stack>
  );
});
