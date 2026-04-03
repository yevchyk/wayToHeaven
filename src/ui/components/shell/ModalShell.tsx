import type { ReactNode } from 'react';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import type { DialogProps, SxProps, Theme } from '@mui/material';

import { shellTokens } from '@ui/components/shell/shellTokens';

interface ModalShellProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string | null;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: DialogProps['maxWidth'];
  fullWidth?: boolean;
  contentSx?: SxProps<Theme>;
  headerAction?: ReactNode;
}

export function ModalShell({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'md',
  fullWidth = true,
  contentSx,
  headerAction,
}: ModalShellProps) {
  return (
    <Dialog
      BackdropProps={{
        sx: {
          background:
            'linear-gradient(180deg, rgba(221, 229, 238, 0.14) 0%, rgba(14, 18, 24, 0.58) 24%, rgba(10, 14, 20, 0.78) 100%)',
          backdropFilter: 'blur(8px)',
        },
      }}
      PaperProps={{
        'aria-label': title,
        'aria-labelledby': undefined,
        sx: {
          width: 'calc(100% - 16px)',
          borderRadius: shellTokens.radius.lg,
          border: `1px solid ${shellTokens.border.strong}`,
          background:
            'linear-gradient(180deg, rgba(17, 22, 29, 0.92) 0%, rgba(10, 14, 20, 0.82) 100%)',
          boxShadow: shellTokens.shadow.floating,
          backdropFilter: shellTokens.blur.strong,
          overflow: 'hidden',
          backgroundImage:
            'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
        },
      }}
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      onClose={onClose}
      open={open}
    >
      <Box
        sx={{
          px: { xs: 1.25, md: 1.5 },
          pt: { xs: 1.1, md: 1.3 },
          pb: 1,
          borderBottom: `1px solid ${shellTokens.border.subtle}`,
          background: 'rgba(255, 255, 255, 0.02)',
        }}
      >
        <Stack alignItems="flex-start" direction="row" justifyContent="space-between" spacing={1.5}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              component="div"
              sx={{
                color: shellTokens.text.primary,
                fontFamily: '"Spectral", Georgia, serif',
                fontSize: { xs: '1.18rem', md: '1.34rem' },
                lineHeight: 1.04,
              }}
            >
              {title}
            </Typography>
            {subtitle ? (
              <Typography color="text.secondary" sx={{ fontSize: '0.84rem', mt: 0.45 }}>
                {subtitle}
              </Typography>
            ) : null}
          </Box>
          <Stack alignItems="center" direction="row" spacing={0.75}>
            {headerAction}
            <IconButton
              aria-label="Dismiss"
              onClick={onClose}
              size="small"
              sx={{
                borderRadius: shellTokens.radius.sm,
                border: `1px solid ${shellTokens.border.subtle}`,
                color: shellTokens.text.secondary,
              }}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Box>
      <DialogContent
        sx={{
          px: { xs: 1.25, md: 1.5 },
          py: { xs: 1.25, md: 1.5 },
          ...contentSx,
        }}
      >
        {children}
      </DialogContent>
      {footer ? (
        <Stack
          direction="row"
          justifyContent="flex-end"
          spacing={1}
          sx={{
            px: { xs: 1.25, md: 1.5 },
            py: 1,
            borderTop: `1px solid ${shellTokens.border.subtle}`,
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          {footer}
        </Stack>
      ) : (
        <Stack
          direction="row"
          justifyContent="flex-end"
          spacing={1}
          sx={{
            px: { xs: 1.25, md: 1.5 },
            py: 1,
            borderTop: `1px solid ${shellTokens.border.subtle}`,
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <Button onClick={onClose} variant="outlined">
            Close
          </Button>
        </Stack>
      )}
    </Dialog>
  );
}
