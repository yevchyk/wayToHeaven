import { Box, CssBaseline, GlobalStyles, ThemeProvider } from '@mui/material';
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
        <GlobalStyles
          styles={{
            'html, body, #storybook-root': {
              minHeight: '100%',
            },
            body: {
              overflowY: 'auto',
              overflowX: 'hidden',
            },
            '#storybook-root': {
              overflow: 'visible',
            },
          }}
        />
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
