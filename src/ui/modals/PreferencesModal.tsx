import { observer } from 'mobx-react-lite';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Slider,
  Stack,
  Switch,
  Typography,
} from '@mui/material';

import { useGameRootStore } from '@app/providers/StoreProvider';

function PreferenceSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  formatValue,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
}) {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ mb: 0.6 }}>
        <Typography variant="body2">{label}</Typography>
        <Typography color="text.secondary" variant="body2">
          {formatValue ? formatValue(value) : value}
        </Typography>
      </Stack>
      <Slider
        max={max}
        min={min}
        onChange={(_event, nextValue) => onChange(nextValue as number)}
        step={step}
        value={value}
      />
    </Box>
  );
}

export const PreferencesModal = observer(function PreferencesModal() {
  const rootStore = useGameRootStore();
  const { preferences } = rootStore;
  const isOpen = rootStore.ui.activeModal?.id === 'preferences';

  return (
    <Dialog fullWidth maxWidth="sm" onClose={() => rootStore.ui.closeModal()} open={isOpen}>
      <DialogTitle>Shell Preferences</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.4}>
          <PreferenceSlider
            formatValue={(value) => `${Math.round(value * 100)}%`}
            label="Music volume"
            max={1}
            min={0}
            onChange={preferences.setMusicVolume}
            step={0.05}
            value={preferences.musicVolume}
          />
          <PreferenceSlider
            formatValue={(value) => `${Math.round(value * 100)}%`}
            label="SFX volume"
            max={1}
            min={0}
            onChange={preferences.setSfxVolume}
            step={0.05}
            value={preferences.sfxVolume}
          />
          <PreferenceSlider
            label="Text speed"
            max={120}
            min={10}
            onChange={preferences.setTextSpeed}
            step={1}
            value={preferences.textSpeed}
          />
          <PreferenceSlider
            formatValue={(value) => `${value}ms`}
            label="Auto delay"
            max={4000}
            min={250}
            onChange={preferences.setAutoDelayMs}
            step={50}
            value={preferences.autoDelayMs}
          />
          <PreferenceSlider
            formatValue={(value) => `${Math.round(value * 100)}%`}
            label="Font scale"
            max={1.3}
            min={0.85}
            onChange={preferences.setFontScale}
            step={0.05}
            value={preferences.fontScale}
          />
          <FormControlLabel
            control={
              <Switch
                checked={preferences.skipUnread}
                onChange={(_event, checked) => preferences.setSkipUnread(checked)}
              />
            }
            label="Allow skip on unread text"
          />
          <FormControlLabel
            control={
              <Switch
                checked={preferences.hideUi}
                onChange={(_event, checked) => preferences.setHideUi(checked)}
              />
            }
            label="Keep dialogue UI hidden"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => rootStore.ui.closeModal()}>Close</Button>
      </DialogActions>
    </Dialog>
  );
});
