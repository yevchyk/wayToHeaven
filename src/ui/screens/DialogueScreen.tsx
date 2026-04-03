import { useEffect, useRef } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';

import { observer } from 'mobx-react-lite';
import { Box, Button, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { useGameRootStore } from '@app/providers/StoreProvider';
import {
  countNarrativeVisibleCharacters,
  getNarrativePlainText,
  sanitizeNarrativeHtml,
  sliceNarrativeHtml,
} from '@engine/utils/narrativeHtml';
import { formatSpeakerLabel } from '@ui/components/dialogue/dialoguePresentation';
import { NarrativeRichText } from '@ui/components/rich-text/NarrativeRichText';
import { PanelSection } from '@ui/components/shell/PanelSection';
import { shellTokens } from '@ui/components/shell/shellTokens';
import { SceneFlowPresentationShell } from '@ui/components/scene-flow/SceneFlowPresentationShell';

const DIALOGUE_PAGE_MAX_LINES = 6;
const DIALOGUE_PAGE_BREAK_SEARCH_WINDOW = 96;

function consumeBreakWhitespace(plainText: string, breakpoint: number, pageEnd: number) {
  let nextBreakpoint = breakpoint;

  while (nextBreakpoint < pageEnd && /\s/.test(plainText[nextBreakpoint] ?? '')) {
    nextBreakpoint += 1;
  }

  return nextBreakpoint;
}

function findLastParagraphBreak(plainText: string, pageStart: number, pageEnd: number) {
  for (let index = pageEnd - 1; index > pageStart; index -= 1) {
    if (plainText[index] !== '\n') {
      continue;
    }

    let previousIndex = index - 1;

    while (previousIndex > pageStart && /\s/.test(plainText[previousIndex] ?? '') && plainText[previousIndex] !== '\n') {
      previousIndex -= 1;
    }

    if (plainText[previousIndex] === '\n') {
      return consumeBreakWhitespace(plainText, index + 1, pageEnd);
    }
  }

  return -1;
}

function findLastSentenceBreak(plainText: string, pageStart: number, pageEnd: number, minBreakpoint: number) {
  for (let index = pageEnd - 1; index > pageStart; index -= 1) {
    const character = plainText[index];

    if (!character || !'.!?…'.includes(character)) {
      continue;
    }

    let breakpoint = index + 1;

    while (breakpoint < pageEnd && /["'»”)\]]/.test(plainText[breakpoint] ?? '')) {
      breakpoint += 1;
    }

    breakpoint = consumeBreakWhitespace(plainText, breakpoint, pageEnd);

    if (breakpoint >= minBreakpoint) {
      return breakpoint;
    }
  }

  return -1;
}

function findLastLineBreak(plainText: string, pageStart: number, pageEnd: number, minBreakpoint: number) {
  for (let index = pageEnd - 1; index > pageStart; index -= 1) {
    if (plainText[index] !== '\n') {
      continue;
    }

    const breakpoint = consumeBreakWhitespace(plainText, index + 1, pageEnd);

    if (breakpoint >= minBreakpoint) {
      return breakpoint;
    }
  }

  return -1;
}

function findLastWhitespaceBreak(plainText: string, pageStart: number, pageEnd: number) {
  for (let index = pageEnd - 1; index > pageStart; index -= 1) {
    if (!/\s/.test(plainText[index] ?? '')) {
      continue;
    }

    const breakpoint = consumeBreakWhitespace(plainText, index + 1, pageEnd);

    if (breakpoint > pageStart) {
      return breakpoint;
    }
  }

  return -1;
}

export function getPreferredDialoguePageBreak(
  plainText: string,
  pageStart: number,
  candidatePageEnd: number,
) {
  const searchStart = Math.max(pageStart + 1, candidatePageEnd - DIALOGUE_PAGE_BREAK_SEARCH_WINDOW);
  const minPreferredBreakpoint = pageStart + Math.floor((candidatePageEnd - pageStart) * 0.55);
  const paragraphBreak = findLastParagraphBreak(plainText, pageStart, candidatePageEnd);

  if (paragraphBreak >= minPreferredBreakpoint) {
    return paragraphBreak;
  }

  const sentenceBreak = findLastSentenceBreak(plainText, searchStart, candidatePageEnd, minPreferredBreakpoint);

  if (sentenceBreak !== -1) {
    return sentenceBreak;
  }

  const lineBreak = findLastLineBreak(plainText, searchStart, candidatePageEnd, minPreferredBreakpoint);

  if (lineBreak !== -1) {
    return lineBreak;
  }

  const whitespaceBreak = findLastWhitespaceBreak(plainText, pageStart, candidatePageEnd);

  return whitespaceBreak > pageStart ? whitespaceBreak : candidatePageEnd;
}

function measureDialoguePageBreaks(sourceHtml: string, sourceElement: HTMLElement) {
  const visibleCharacterCount = countNarrativeVisibleCharacters(sourceHtml);

  if (visibleCharacterCount === 0) {
    return [];
  }

  const sourceRect = sourceElement.getBoundingClientRect();
  const computedStyle = window.getComputedStyle(sourceElement);
  const lineHeightPx = Number.parseFloat(computedStyle.lineHeight);

  if (!Number.isFinite(lineHeightPx) || sourceRect.width <= 0) {
    return [];
  }

  const plainText = getNarrativePlainText(sourceHtml);
  const maxPageHeight = lineHeightPx * DIALOGUE_PAGE_MAX_LINES + 1;
  const measureElement = sourceElement.cloneNode(false) as HTMLElement;
  const breakpoints: number[] = [];

  measureElement.style.position = 'absolute';
  measureElement.style.left = '-99999px';
  measureElement.style.top = '0';
  measureElement.style.width = `${sourceRect.width}px`;
  measureElement.style.visibility = 'hidden';
  measureElement.style.pointerEvents = 'none';
  measureElement.style.height = 'auto';
  measureElement.style.maxHeight = 'none';
  measureElement.style.overflow = 'visible';
  measureElement.removeAttribute('aria-hidden');
  document.body.append(measureElement);

  let pageStart = 0;

  try {
    while (pageStart < visibleCharacterCount) {
      measureElement.innerHTML = sanitizeNarrativeHtml(
        sliceNarrativeHtml(sourceHtml, pageStart, visibleCharacterCount),
      );

      if (measureElement.getBoundingClientRect().height <= maxPageHeight) {
        break;
      }

      let low = pageStart + 1;
      let high = visibleCharacterCount;
      let bestPageEnd = pageStart + 1;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);

        measureElement.innerHTML = sanitizeNarrativeHtml(sliceNarrativeHtml(sourceHtml, pageStart, mid));

        if (measureElement.getBoundingClientRect().height <= maxPageHeight) {
          bestPageEnd = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      const preferredPageEnd = getPreferredDialoguePageBreak(plainText, pageStart, bestPageEnd);
      const nextPageEnd = preferredPageEnd > pageStart ? preferredPageEnd : bestPageEnd;

      breakpoints.push(nextPageEnd);
      pageStart = nextPageEnd;
    }
  } finally {
    measureElement.remove();
  }

  return breakpoints.filter((breakpoint) => breakpoint > 0 && breakpoint < visibleCharacterCount);
}

function isInteractiveAdvanceTarget(target: EventTarget | null) {
  return target instanceof Element &&
    Boolean(
      target.closest(
        'button, a, input, select, textarea, summary, [role="button"], [data-dialogue-ignore-advance="true"]',
      ),
    );
}

export const DialogueScreen = observer(function DialogueScreen() {
  const rootStore = useGameRootStore();
  const { dialogue } = rootStore;
  const lineShellRef = useRef<HTMLDivElement | null>(null);
  const visibleChoices = dialogue.getVisibleChoices();
  const shouldRenderChoiceList = dialogue.shouldRenderChoiceList;
  const reserveText = dialogue.currentPageReserveText;
  const showChoiceGrid = shouldRenderChoiceList && visibleChoices.length > 0;

  const handlePanelAdvanceClick = (event: ReactMouseEvent<HTMLElement>) => {
    if (shouldRenderChoiceList || isInteractiveAdvanceTarget(event.target)) {
      return;
    }

    dialogue.advanceOrReveal();
  };

  useEffect(() => {
    const measurePages = () => {
      const lineShellElement = lineShellRef.current;
      const lineContentElement = lineShellElement?.querySelector<HTMLElement>('.dialogue-screen__line-content');

      if (!lineContentElement) {
        return;
      }

      dialogue.setTextPageBreakCharacterCounts(
        measureDialoguePageBreaks(dialogue.currentPreparedTextHtml, lineContentElement),
      );
    };

    const frameId = window.requestAnimationFrame(measurePages);

    if (typeof ResizeObserver === 'undefined' || !lineShellRef.current) {
      return () => window.cancelAnimationFrame(frameId);
    }

    const resizeObserver = new ResizeObserver(() => {
      measurePages();
    });

    resizeObserver.observe(lineShellRef.current);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
    };
  }, [dialogue, dialogue.currentPreparedTextHtml, dialogue.currentFontScale]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || !dialogue.isActive) {
        return;
      }

      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        dialogue.advanceOrReveal();

        return;
      }

      if (event.key.toLowerCase() === 'a') {
        event.preventDefault();
        dialogue.toggleAutoMode();

        return;
      }

      if (event.key.toLowerCase() === 'h') {
        event.preventDefault();
        rootStore.preferences.setHideUi(!dialogue.isUiHidden);

        return;
      }

      if (event.key.toLowerCase() === 'b') {
        event.preventDefault();
        rootStore.ui.openModal('backlog');

        return;
      }

      if (event.key.toLowerCase() === 'l') {
        event.preventDefault();
        rootStore.ui.openModal('saves');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dialogue, rootStore.preferences, rootStore.ui]);

  if (!dialogue.currentNodeId) {
    return (
      <PanelSection title="Немає активного діалогу" tone="sunken">
        <Typography color="text.secondary" variant="body2">
          Діалоговий runtime зараз неактивний.
        </Typography>
      </PanelSection>
    );
  }

  const sceneTitle = dialogue.currentSceneTitle ?? dialogue.activeDialogue?.title ?? null;
  const speakerName =
    dialogue.currentSpeakerName ??
    formatSpeakerLabel(dialogue.currentSpeakerId) ??
    'Оповідь';
  const fontScale = dialogue.currentFontScale;
  const dialogueLineTextSx = {
    color: '#f5f8fb',
    fontSize: { xs: `${1 * fontScale}rem`, md: `${1.1 * fontScale}rem` },
    lineHeight: { xs: 1.72, md: 1.8 },
    textWrap: 'pretty',
    whiteSpace: 'normal',
  } as const;

  return (
    <SceneFlowPresentationShell
      contentClassName="dialogue-screen"
      contentSx={{ isolation: 'isolate' }}
      header={
        sceneTitle ? (
          <Typography
            className="dialogue-screen__scene-title"
            component="h1"
            sx={{
              color: '#f6f9fc',
              fontFamily: '"Spectral", Georgia, serif',
              fontSize: { xs: `${1.46 * fontScale}rem`, md: `${2.05 * fontScale}rem` },
              lineHeight: 1.06,
              textShadow: '0 10px 24px rgba(0, 0, 0, 0.34)',
            }}
            variant="h4"
          >
            {sceneTitle}
          </Typography>
        ) : null
      }
      stageSx={{
        px: { xs: '0.45rem', sm: '0.8rem', md: '1.15rem', xl: '1.6rem' },
        pt: { xs: '0.5rem', md: '0.9rem' },
        pb: { xs: 'clamp(15.5rem, 35svh, 21rem)', md: 'clamp(12.5rem, 25svh, 16rem)' },
      }}
    >
      <Box
        className="dialogue-screen__scene"
        sx={{
          position: 'relative',
          minHeight: '100%',
        }}
      >
        {dialogue.isUiHidden ? (
          <Box
            className="dialogue-screen__ui-hidden-hitbox"
            onClick={() => dialogue.advanceOrReveal()}
            sx={{
              position: 'absolute',
              inset: 0,
              zIndex: 5,
              cursor: 'pointer',
            }}
          >
            <Box
              className="dialogue-screen__ui-hidden-pill"
              sx={{
                position: 'absolute',
                right: { xs: 12, md: 18 },
                bottom: { xs: 12, md: 18 },
                px: 1.1,
                py: 0.55,
                borderRadius: shellTokens.radius.pill,
                border: `1px solid ${alpha('#ffffff', 0.12)}`,
                backgroundColor: alpha('#070b10', 0.42),
                color: alpha('#f7f9fc', 0.82),
                backdropFilter: shellTokens.blur.soft,
              }}
            >
              <Typography className="dialogue-screen__ui-hidden-label" sx={{ fontSize: '0.78rem' }}>
                Натисни, щоб повернути UI
              </Typography>
            </Box>
          </Box>
        ) : null}

        <Box
          className="dialogue-screen__ui-layer"
          sx={{
            position: 'absolute',
            insetInline: 0,
            bottom: { xs: 10, md: 14 },
            zIndex: 4,
            px: { xs: 1, sm: 1.2, md: 1.6, xl: 2 },
            opacity: dialogue.isUiHidden ? 0 : 1,
            transition: 'opacity 180ms ease',
            pointerEvents: dialogue.isUiHidden ? 'none' : 'auto',
          }}
        >
          <Stack
            className="dialogue-screen__hud-stack"
            sx={{
              maxWidth: 1200,
              mx: 'auto',
              width: '100%',
              gap: { xs: 0.8, md: 1 },
            }}
          >
            {showChoiceGrid ? (
              <Box
                className="dialogue-screen__choice-grid"
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: { xs: 0.7, md: 0.9 },
                  width: { xs: '100%', md: '60%' },
                  ml: { xs: 0, md: 'auto' },
                }}
              >
                {visibleChoices.map((choice) => (
                  <Button
                    key={choice.id}
                    className="dialogue-screen__choice-card"
                    fullWidth
                    onClick={() => dialogue.chooseChoice(choice.id)}
                    sx={{
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      px: 1.5,
                      py: 1.5,
                      borderRadius: shellTokens.radius.sm,
                      border: `1px solid ${alpha('#eef4fb', 0.22)}`,
                      background:
                        'linear-gradient(180deg, rgba(14, 20, 28, 0.34) 0%, rgba(9, 13, 18, 0.54) 100%)',
                      color: '#f7fbff',
                      textAlign: 'left',
                      backdropFilter: shellTokens.blur.strong,
                      boxShadow: '0 14px 34px rgba(0, 0, 0, 0.22)',
                    }}
                    variant="outlined"
                  >
                    <Stack alignItems="flex-start" spacing={0.3} sx={{ width: '100%' }}>
                      <NarrativeRichText
                        component="div"
                        html={choice.text}
                        sx={{
                          color: 'inherit',
                          fontSize: { xs: `${0.95 * fontScale}rem`, md: `${1.02 * fontScale}rem` },
                          lineHeight: 1.56,
                          textAlign: 'left',
                          width: '100%',
                        }}
                      />
                    </Stack>
                  </Button>
                ))}
              </Box>
            ) : null}

            <Box
              className="dialogue-screen__panel"
              onClick={handlePanelAdvanceClick}
              sx={{
                position: 'relative',
                width: '100%',
                p: { xs: '0.85rem', sm: '1rem', md: '1.1rem' },
                height: { xs: 'clamp(248px, 36svh, 340px)', md: 'clamp(264px, 28svh, 356px)' },
                border: `1px solid ${shellTokens.border.strong}`,
                borderRadius: shellTokens.radius.md,
                background:
                  'linear-gradient(180deg, rgba(12, 17, 23, 0.28) 0%, rgba(9, 13, 18, 0.52) 24%, rgba(7, 10, 15, 0.74) 100%)',
                backdropFilter: shellTokens.blur.strong,
                boxShadow: '0 18px 46px rgba(0, 0, 0, 0.28)',
                overflow: 'hidden',
                cursor: showChoiceGrid ? 'default' : 'pointer',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: '0 0 auto 0',
                  height: 1,
                  background:
                    'linear-gradient(90deg, rgba(240, 246, 252, 0) 0%, rgba(240, 246, 252, 0.4) 50%, rgba(240, 246, 252, 0) 100%)',
                },
              }}
            >
              <Box
                className="dialogue-screen__panel-grid"
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  display: 'grid',
                  gridTemplateRows: 'auto minmax(0, 1fr) auto',
                  height: '100%',
                  rowGap: { xs: 0.8, md: 0.95 },
                }}
              >
                <Stack
                  className="dialogue-screen__panel-header"
                  direction={{ xs: 'column', md: 'row' }}
                  justifyContent="flex-start"
                  spacing={1}
                  sx={{ mb: 3 }}
                >
                  <Stack className="dialogue-screen__speaker-meta" spacing={0.25} sx={{ mb: 1 }}>
                    <Typography
                      className="dialogue-screen__speaker-name"
                      component="h2"
                      sx={{
                        color: alpha('#eef4fb', 0.84),
                        fontFamily: '"Spectral", Georgia, serif',
                        fontSize: { xs: `${1.3 * fontScale}rem`, md: `${1.7 * fontScale}rem` },
                        lineHeight: 1.04,
                      }}
                      variant="h4"
                    >
                      {speakerName}
                    </Typography>
                  </Stack>
                </Stack>

                <Stack
                  className="dialogue-screen__body"
                  spacing={0.85}
                  sx={{
                    minHeight: 0,
                    overflowY: 'auto',
                    overflowAnchor: 'none',
                    pr: 0.25,
                    mr: -0.25,
                    scrollbarGutter: 'stable',
                  }}
                >
                  <Box
                    className="dialogue-screen__line-shell"
                    data-reserve-text={reserveText}
                    ref={lineShellRef}
                    sx={{
                      position: 'relative',
                      minHeight: '5lh',
                      '&::before': {
                        content: 'attr(data-reserve-text)',
                        display: 'block',
                        color: 'transparent',
                        whiteSpace: 'pre-wrap',
                        visibility: 'hidden',
                        pointerEvents: 'none',
                        userSelect: 'none',
                        fontSize: dialogueLineTextSx.fontSize,
                        lineHeight: dialogueLineTextSx.lineHeight,
                      },
                    }}
                  >
                    <Box
                      className="dialogue-screen__line-reveal"
                      sx={{
                        position: 'absolute',
                        inset: 0,
                      }}
                    >
                      <NarrativeRichText
                        className="dialogue-screen__line-content"
                        component="div"
                        html={dialogue.displayedPageTextHtml}
                        sx={dialogueLineTextSx}
                      />
                    </Box>
                  </Box>
                </Stack>

                <Stack
                  className="dialogue-screen__footer"
                  direction={{ xs: 'column', md: 'row' }}
                  justifyContent="flex-start"
                  alignItems={{ xs: 'stretch', md: 'center' }}
                  spacing={0.9}
                >
                  <Stack className="dialogue-screen__runtime-meta dialogue-screen__controls" direction="row" flexWrap="wrap" gap={0.75}>
                    <Button
                      className="dialogue-screen__advance"
                      onClick={() => dialogue.advanceOrReveal()}
                      size="small"
                      variant="outlined"
                    >
                      {dialogue.advanceActionLabel}
                    </Button>
                    <Button onClick={() => dialogue.toggleAutoMode()} size="small" variant={dialogue.autoModeEnabled ? 'contained' : 'outlined'}>
                      Auto
                    </Button>
                    <Button onClick={() => rootStore.ui.openModal('backlog')} size="small" variant="outlined">
                      Backlog
                    </Button>
                    <Button onClick={() => rootStore.ui.openModal('preferences')} size="small" variant="outlined">
                      Shell
                    </Button>
                    <Button onClick={() => rootStore.ui.openModal('saves')} size="small" variant="outlined">
                      Saves
                    </Button>
                    <Button onClick={() => rootStore.preferences.setHideUi(true)} size="small" variant="outlined">
                      Hide UI
                    </Button>
                    <Button onClick={() => rootStore.openLibrary('characters')} size="small" variant="outlined">
                      Library
                    </Button>
                    <Button onClick={() => rootStore.ui.openModal('stats-debug')} size="small" variant="outlined">
                      Stats
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Box>
          </Stack>
        </Box>
      </Box>
    </SceneFlowPresentationShell>
  );
});
