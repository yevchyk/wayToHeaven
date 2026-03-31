import type { ReactNode } from 'react';

import { Box } from '@mui/material';

import { CharacterCompositeFigure } from '@ui/components/character-composite/CharacterCompositeFigure';
import type { DialoguePortraitVisual } from '@ui/components/dialogue/dialoguePresentation';

interface NarrativePortraitFigureProps {
  portrait: DialoguePortraitVisual;
  objectPosition?: string;
  sx?: Record<string, unknown>;
  renderPlaceholder?: () => ReactNode;
}

export function NarrativePortraitFigure({
  portrait,
  objectPosition = 'center bottom',
  sx,
  renderPlaceholder,
}: NarrativePortraitFigureProps) {
  if (portrait.type === 'composite') {
    return (
      <CharacterCompositeFigure
        layers={portrait.layers}
        stage={portrait.stage}
        {...(sx ? { sx } : {})}
      />
    );
  }

  if (portrait.url) {
    const imageSx = sx
      ? {
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          objectPosition,
          userSelect: 'none',
          ...sx,
        }
      : {
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          objectPosition,
          userSelect: 'none',
        };

    return (
      <Box
        alt=""
        component="img"
        src={portrait.url}
        sx={imageSx}
      />
    );
  }

  return renderPlaceholder ? <>{renderPlaceholder()}</> : null;
}
