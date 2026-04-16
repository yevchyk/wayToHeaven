import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { resolveContentImageUrl } from '@ui/components/character-composite/characterCompositeAssetResolver';
import { shellTokens } from '@ui/components/shell/shellTokens';

interface LibraryArtworkCardProps {
  title: string;
  subtitle: string;
  imageAssetId: string | null;
  imageSourcePath?: string | undefined;
}

function buildFallbackBackground(title: string) {
  const seed = title.split('').reduce((total, character) => total + character.charCodeAt(0), 0);
  const hue = seed % 360;
  const accentHue = (hue + 36) % 360;

  return `
    radial-gradient(circle at 18% 20%, hsla(${accentHue}, 78%, 72%, 0.34) 0%, transparent 34%),
    radial-gradient(circle at 78% 18%, hsla(${hue}, 72%, 64%, 0.28) 0%, transparent 28%),
    linear-gradient(180deg, hsla(${hue}, 28%, 20%, 0.94) 0%, hsla(${accentHue}, 30%, 10%, 0.98) 100%)
  `;
}

export function LibraryArtworkCard({
  title,
  subtitle,
  imageAssetId,
  imageSourcePath,
}: LibraryArtworkCardProps) {
  const imageUrl = resolveContentImageUrl(imageAssetId, imageSourcePath);

  return (
    <Box
      sx={{
        p: 1,
        borderRadius: shellTokens.radius.lg,
        border: `1px solid ${shellTokens.border.accent}`,
        background: `linear-gradient(180deg, ${alpha('#dce7f3', 0.1)} 0%, ${alpha('#0a0e14', 0.18)} 100%)`,
        backdropFilter: shellTokens.blur.medium,
        boxShadow: shellTokens.shadow.panel,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: 320, md: 420 },
          overflow: 'hidden',
          borderRadius: shellTokens.radius.md,
          border: `1px solid ${shellTokens.border.strong}`,
          background: imageUrl ? 'rgba(8, 12, 18, 0.92)' : buildFallbackBackground(title),
          boxShadow: shellTokens.shadow.inset,
        }}
      >
        {imageUrl ? (
          <Box
            alt={title}
            component="img"
            src={imageUrl}
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'saturate(1.04) contrast(1.02)',
            }}
          />
        ) : null}

        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: imageUrl
              ? 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 26%, rgba(7,10,15,0.14) 68%, rgba(7,10,15,0.62) 100%)'
              : 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 32%, rgba(7,10,15,0.54) 100%)',
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            inset: 'auto 0 0 0',
            px: 1.15,
            py: 1,
            background: 'linear-gradient(180deg, rgba(7,10,15,0) 0%, rgba(7,10,15,0.82) 100%)',
          }}
        >
          <Typography sx={{ color: shellTokens.text.primary, fontFamily: '"Spectral", Georgia, serif' }} variant="h5">
            {title}
          </Typography>
          <Typography sx={{ color: shellTokens.text.secondary }} variant="body2">
            {subtitle}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
