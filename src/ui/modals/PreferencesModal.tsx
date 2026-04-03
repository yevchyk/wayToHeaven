import { observer } from 'mobx-react-lite';
import {
  Box,
  FormControlLabel,
  Slider,
  Stack,
  Switch,
  Typography,
} from '@mui/material';

import { useGameRootStore } from '@app/providers/StoreProvider';
import { ModalShell } from '@ui/components/shell/ModalShell';
import { PanelSection } from '@ui/components/shell/PanelSection';

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
      <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ mb: 0.4 }}>
        <Typography sx={{ fontSize: '0.9rem' }} variant="body2">
          {label}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: '0.82rem' }} variant="body2">
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
    <ModalShell
      maxWidth="sm"
      onClose={() => rootStore.ui.closeModal()}
      open={isOpen}
      subtitle="Компактні налаштування shell, читання й темпу подачі."
      title="Shell Preferences"
    >
      <Stack spacing={1}>
        <PanelSection description="Гучність музики та ефектів поточної сесії." title="Audio">
          <Stack spacing={1.25}>
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
          </Stack>
        </PanelSection>

        <PanelSection description="Швидкість тексту, авто-програвання та масштаб шрифту." title="Reading">
          <Stack spacing={1.25}>
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
          </Stack>
        </PanelSection>

        <PanelSection description="Поведінка ховання HUD." title="Behaviour" tone="sunken">
          <Stack spacing={0.35}>
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
        </PanelSection>
      </Stack>
    </ModalShell>
  );
});
