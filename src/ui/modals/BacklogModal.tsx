import { observer } from 'mobx-react-lite';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import { useGameRootStore } from '@app/providers/StoreProvider';

export const BacklogModal = observer(function BacklogModal() {
  const rootStore = useGameRootStore();
  const isOpen = rootStore.ui.activeModal?.id === 'backlog';
  const entries = rootStore.backlog.entries;

  return (
    <Dialog fullWidth maxWidth="md" onClose={() => rootStore.ui.closeModal()} open={isOpen}>
      <DialogTitle>Backlog</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.5}>
          {entries.length === 0 ? (
            <Typography color="text.secondary" variant="body2">
              Backlog ще порожній для цієї сесії.
            </Typography>
          ) : (
            entries.map((entry) => (
              <Box
                key={entry.id}
                sx={{
                  p: 1.5,
                  borderRadius: 3,
                  border: `1px solid ${alpha('#ffffff', 0.08)}`,
                  backgroundColor: alpha('#ffffff', 0.03),
                }}
              >
                <Stack spacing={0.45}>
                  <Typography sx={{ color: alpha('#f4ddb0', 0.8), fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {entry.kind}
                    {entry.speakerName ? ` · ${entry.speakerName}` : ''}
                  </Typography>
                  <Typography variant="body1">{entry.text}</Typography>
                </Stack>
              </Box>
            ))
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => rootStore.ui.closeModal()}>Close</Button>
      </DialogActions>
    </Dialog>
  );
});
