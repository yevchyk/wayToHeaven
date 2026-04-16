import { useEffect, useRef } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';

import { observer } from 'mobx-react-lite';
import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { useGameRootStore } from '@app/providers/StoreProvider';
import {
  countNarrativeVisibleCharacters,
  getNarrativePlainText,
  sanitizeNarrativeHtml,
  sliceNarrativeHtml,
} from '@engine/utils/narrativeHtml';
import { formatSpeakerLabel } from '@ui/components/dialogue/dialoguePresentation';
import { ChoiceCard } from '@ui/components/primitives/ChoiceCard';
import { NarrativeAction } from '@ui/components/primitives/NarrativeAction';
import { ScreenFrame } from '@ui/components/primitives/ScreenFrame';
import { StatusStrip } from '@ui/components/primitives/StatusStrip';
import { SystemAction } from '@ui/components/primitives/SystemAction';
import { NarrativeRichText } from '@ui/components/rich-text/NarrativeRichText';
import { PanelSection } from '@ui/components/shell/PanelSection';
import { resolveCorruptionSkin } from '@ui/components/shell/corruptionSkins';
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

    if (!character || !'.!?\u2026'.includes(character)) {
      continue;
    }

    let breakpoint = index + 1;

    while (breakpoint < pageEnd && /["'\u00bb\u201d)\]]/.test(plainText[breakpoint] ?? '')) {
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

function measureDialoguePageBreaks(
  sourceHtml: string,
  sourceElement: HTMLElement,
  maxPageHeightOverride?: number,
) {
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
  const maxLineHeight = lineHeightPx * DIALOGUE_PAGE_MAX_LINES + 1;
  const maxPageHeight = Math.max(
    lineHeightPx * 2.4,
    Math.min(
      maxLineHeight,
      Number.isFinite(maxPageHeightOverride ?? Number.NaN)
        ? Math.floor(maxPageHeightOverride ?? maxLineHeight)
        : maxLineHeight,
    ),
  );
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

function buildDialogueStatusItems(dialogue: ReturnType<typeof useGameRootStore>['dialogue']) {
  const items: Array<{ label: string; value?: string }> = [];

  if (dialogue.textPageCount > 1) {
    items.push({
      label: 'Стор.',
      value: `${dialogue.activeTextPageIndex + 1}/${dialogue.textPageCount}`,
    });
  }

  if (dialogue.autoModeEnabled) {
    items.push({
      label: 'Авто',
      value: 'Увімк.',
    });
  }

  if (dialogue.isCurrentNodeSeen) {
    items.push({
      label: 'Бачене',
    });
  }

  return items;
}

export const DialogueScreen = observer(function DialogueScreen() {
  const rootStore = useGameRootStore();
  const { dialogue } = rootStore;
  const lineShellRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const visibleChoices = dialogue.getVisibleChoices();
  const shouldRenderChoiceList = dialogue.shouldRenderChoiceList;
  const reserveText = dialogue.currentPageReserveText;
  const showChoiceGrid = shouldRenderChoiceList && visibleChoices.length > 0;
  const corruptionSkin = resolveCorruptionSkin(rootStore.profile.getProfileValue('corruption'));
  const dialogueStatusItems = buildDialogueStatusItems(dialogue);

  const handlePanelAdvanceClick = (event: ReactMouseEvent<HTMLElement>) => {
    if (shouldRenderChoiceList || isInteractiveAdvanceTarget(event.target)) {
      return;
    }

    dialogue.advanceOrReveal();
  };

  useEffect(() => {
    const measurePages = () => {
      const lineShellElement = lineShellRef.current;
      const bodyElement = bodyRef.current;
      const lineContentElement = lineShellElement?.querySelector<HTMLElement>('.dialogue-screen__line-content');

      if (!lineContentElement) {
        return;
      }

      const bodyRect = bodyElement?.getBoundingClientRect();
      const availableBodyHeight = bodyRect?.height
        ? Math.max(0, bodyRect.height - 6)
        : undefined;

      dialogue.setTextPageBreakCharacterCounts(
        measureDialoguePageBreaks(
          dialogue.currentPreparedTextHtml,
          lineContentElement,
          availableBodyHeight,
        ),
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
    if (bodyRef.current && bodyRef.current !== lineShellRef.current) {
      resizeObserver.observe(bodyRef.current);
    }

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
    };
  }, [dialogue, dialogue.currentPreparedTextHtml, dialogue.currentFontScale]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || !dialogue.isActive || rootStore.ui.isModalOpen) {
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
      <PanelSection title="\u041d\u0435\u043c\u0430\u0454 \u0430\u043a\u0442\u0438\u0432\u043d\u043e\u0433\u043e \u0434\u0456\u0430\u043b\u043e\u0433\u0443" tone="sunken">
        <Typography color="text.secondary" variant="body2">
          \u0414\u0456\u0430\u043b\u043e\u0433\u043e\u0432\u0438\u0439 runtime \u0437\u0430\u0440\u0430\u0437 \u043d\u0435\u0430\u043a\u0442\u0438\u0432\u043d\u0438\u0439.
        </Typography>
      </PanelSection>
    );
  }

  const sceneTitle = dialogue.currentSceneTitle ?? dialogue.activeDialogue?.title ?? null;
  const speakerName =
    dialogue.currentSpeakerName ??
    formatSpeakerLabel(dialogue.currentSpeakerId) ??
    '\u041e\u043f\u043e\u0432\u0456\u0434\u044c';
  const fontScale = dialogue.currentFontScale;
  const dialogueLineTextSx = {
    color: corruptionSkin.text.primary,
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
          <Stack
            className="dialogue-screen__scene-title"
            sx={{
              alignItems: 'flex-start',
              gap: 0.2,
            }}
          >
            <Typography
              sx={{
                color: alpha(corruptionSkin.text.secondary, 0.8),
                fontSize: '0.72rem',
                fontWeight: 500,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
              }}
                    >
                      Сцена
            </Typography>
            <Typography
              component="h1"
              sx={{
                color: corruptionSkin.text.primary,
                fontFamily: '"Spectral", Georgia, serif',
                fontSize: { xs: `${1.42 * fontScale}rem`, md: `${1.95 * fontScale}rem` },
                lineHeight: 1.06,
                textShadow: `0 10px 24px ${alpha('#000000', 0.34)}`,
              }}
              variant="h4"
            >
              {sceneTitle}
            </Typography>
          </Stack>
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
                border: `1px solid ${corruptionSkin.frame.border}`,
                backgroundColor: alpha('#070b10', 0.46),
                color: alpha(corruptionSkin.text.primary, 0.86),
                backdropFilter: shellTokens.blur.soft,
              }}
            >
              <Typography className="dialogue-screen__ui-hidden-label" sx={{ fontSize: '0.78rem' }}>
                \u041d\u0430\u0442\u0438\u0441\u043d\u0438, \u0449\u043e\u0431 \u043f\u043e\u0432\u0435\u0440\u043d\u0443\u0442\u0438 UI
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
                  gap: { xs: 0.7, md: 0.85 },
                  width: '100%',
                  maxWidth: 760,
                  mx: 'auto',
                }}
              >
                {visibleChoices.map((choice) => (
                  <ChoiceCard
                    key={choice.id}
                    className="dialogue-screen__choice-card"
                    html={choice.text}
                    onClick={() => dialogue.chooseChoice(choice.id)}
                    skin={corruptionSkin}
                    sx={{
                      backdropFilter: shellTokens.blur.strong,
                    }}
                  />
                ))}
              </Box>
            ) : null}

            <ScreenFrame
              className="dialogue-screen__panel"
              mode="cinematic"
              onClick={handlePanelAdvanceClick}
              skin={corruptionSkin}
              sx={{
                position: 'relative',
                width: '100%',
                height: { xs: 'clamp(248px, 36svh, 340px)', md: 'clamp(264px, 28svh, 356px)' },
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
                  p: { xs: '0.9rem', sm: '1.05rem', md: '1.15rem' },
                  rowGap: { xs: 0.8, md: 0.95 },
                  cursor: showChoiceGrid ? 'default' : 'pointer',
                }}
              >
                <Stack
                  className="dialogue-screen__panel-header"
                  direction={{ xs: 'column', md: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', md: 'center' }}
                  spacing={1}
                  sx={{ mb: 1.6 }}
                >
                  <Stack className="dialogue-screen__speaker-meta" spacing={0.3}>
                    <Typography
                      sx={{
                        color: alpha(corruptionSkin.text.muted, 0.95),
                        fontSize: '0.72rem',
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Голос
                    </Typography>
                    <Typography
                      className="dialogue-screen__speaker-name"
                      component="h2"
                      sx={{
                        color: corruptionSkin.text.primary,
                        fontFamily: '"Spectral", Georgia, serif',
                        fontSize: { xs: `${1.24 * fontScale}rem`, md: `${1.58 * fontScale}rem` },
                        lineHeight: 1.04,
                      }}
                      variant="h4"
                    >
                      {speakerName}
                    </Typography>
                  </Stack>
                  <StatusStrip items={dialogueStatusItems} skin={corruptionSkin} />
                </Stack>

                <Stack
                  className="dialogue-screen__body"
                  ref={bodyRef}
                  spacing={0.85}
                  sx={{
                    minHeight: 0,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    className="dialogue-screen__line-shell"
                    data-reserve-text={reserveText}
                    ref={lineShellRef}
                    sx={{
                      position: 'relative',
                      minHeight: 0,
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
                  justifyContent="space-between"
                  alignItems={{ xs: 'stretch', md: 'center' }}
                  spacing={{ xs: 0.75, md: 1.1 }}
                >
                  <Stack
                    className="dialogue-screen__runtime-meta dialogue-screen__controls"
                    direction="row"
                    flexWrap="wrap"
                    gap={0.65}
                  >
                    <NarrativeAction
                      className="dialogue-screen__advance"
                      emphasis="primary"
                      onClick={() => dialogue.advanceOrReveal()}
                      skin={corruptionSkin}
                      sx={{
                        minHeight: 32,
                      }}
                    >
                      {dialogue.advanceActionLabel}
                    </NarrativeAction>
                    <NarrativeAction
                      active={dialogue.autoModeEnabled}
                      onClick={() => dialogue.toggleAutoMode()}
                      skin={corruptionSkin}
                      sx={{
                        minHeight: 32,
                      }}
                    >
                      Авто
                    </NarrativeAction>
                    <SystemAction
                      onClick={() => rootStore.ui.openModal('backlog')}
                      skin={corruptionSkin}
                      sx={{
                        minHeight: 28,
                        px: 0.82,
                        py: 0.45,
                        '& .MuiTypography-root': {
                          fontSize: '0.68rem',
                        },
                      }}
                    >
                      Лог
                    </SystemAction>
                  </Stack>
                  <Stack
                    direction="row"
                    flexWrap="wrap"
                    justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                    gap={0.5}
                  >
                    <SystemAction
                      onClick={() => rootStore.ui.openModal('saves')}
                      skin={corruptionSkin}
                      tone="quiet"
                      sx={{
                        minHeight: 26,
                        px: 0.76,
                        py: 0.42,
                        '& .MuiTypography-root': {
                          fontSize: '0.66rem',
                        },
                      }}
                    >
                      Сейви
                    </SystemAction>
                    <SystemAction
                      onClick={() => rootStore.openLibrary('characters')}
                      skin={corruptionSkin}
                      tone="quiet"
                      sx={{
                        minHeight: 26,
                        px: 0.76,
                        py: 0.42,
                        '& .MuiTypography-root': {
                          fontSize: '0.66rem',
                        },
                      }}
                    >
                      Кодекс
                    </SystemAction>
                    <SystemAction
                      onClick={() => rootStore.ui.openModal('preferences')}
                      skin={corruptionSkin}
                      tone="quiet"
                      sx={{
                        minHeight: 26,
                        px: 0.76,
                        py: 0.42,
                        '& .MuiTypography-root': {
                          fontSize: '0.66rem',
                        },
                      }}
                    >
                      Налашт.
                    </SystemAction>
                    <SystemAction
                      onClick={() => rootStore.preferences.setHideUi(true)}
                      skin={corruptionSkin}
                      tone="quiet"
                      sx={{
                        minHeight: 26,
                        px: 0.76,
                        py: 0.42,
                        '& .MuiTypography-root': {
                          fontSize: '0.66rem',
                        },
                      }}
                    >
                      Сховати
                    </SystemAction>
                    <SystemAction
                      onClick={() => rootStore.ui.openModal('stats-debug')}
                      skin={corruptionSkin}
                      tone="quiet"
                      sx={{
                        minHeight: 26,
                        px: 0.76,
                        py: 0.42,
                        '& .MuiTypography-root': {
                          fontSize: '0.66rem',
                        },
                      }}
                    >
                      Стати
                    </SystemAction>
                  </Stack>
                </Stack>
              </Box>
            </ScreenFrame>
          </Stack>
        </Box>
      </Box>
    </SceneFlowPresentationShell>
  );
});
