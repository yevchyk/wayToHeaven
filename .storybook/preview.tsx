import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import type { Preview } from '@storybook/react-vite';

import { theme } from '../src/app/theme/theme';

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            px: { xs: 2, md: 3 },
            py: 3,
            background:
              'radial-gradient(circle at top, rgba(201,164,92,0.12), transparent 30%), #110f14',
          }}
        >
          <Story />
        </Box>
      </ThemeProvider>
    ),
  ],
};

export default preview;
