import { EmptyContainer } from "./EmptyContainer";
import { ScrollFadeContainer } from "./ScrollFadeContainer";
import { ScrollToBottomButton } from "./ScrollToBottomButton";
import { EnvironmentPill } from "./EnvironmentPill";
import { HiddenInput } from "./HiddenInput";
import { AlienButton } from "./AlienButton";
import { ChatComposer } from "./ChatComposer";
import { ChatComposerChin } from "./ChatComposerChin";
import { Transcript } from "./Transcript";
import { LIVE_STATUS } from "../data/transcripts";
import type { Turn } from "../data/transcripts";
import type { Session } from "../data/sessions";
import { RepoBar } from "./RepoBar";
import { AnswerInPlanBar } from "./AnswerInPlanBar";
import { ContextUsage } from "./icons/Blue_dot_right_edge";

// Rough context estimate for the mock: characters in the transcript vs. a small window,
// so a long chat fills the ring noticeably more than a short one.
const CONTEXT_WINDOW_CHARS = 12000;
function contextUsage(turns?: Turn[]) {
  if (!turns) return 0;
  return Math.min(0.95, JSON.stringify(turns).length / CONTEXT_WINDOW_CHARS);
}

// Same column (max width + gutters) as the composer below, so messages line up with it.
// The original column is absolutely positioned and ignores the mouse; inside the scroll area it gets
// `!static !h-auto` (flows and scrolls), `!pointer-events-auto` (hover works) and `select-text`.
const TRANSCRIPT_COLUMN =
  "mx-auto [.epitaxy-chat-panel_&]:[@container_tile-slot_(max-width:560px)]:[--chat-gutter:16px] [--chat-column-gutter-start:var(--chat-gutter-start,var(--chat-gutter,32px))] [--chat-column-gutter-end:var(--chat-gutter-end,var(--chat-gutter,32px))] [[data-chat-gutter-start=shave]_&]:[--chat-column-gutter-start:var(--chat-gutter-start,calc(var(--chat-gutter)-(var(--tiles-gap)-var(--tiles-padding))))] [[data-chat-gutter-end=shave]_&]:[--chat-column-gutter-end:var(--chat-gutter-end,calc(var(--chat-gutter)-(var(--tiles-gap)-var(--tiles-padding))))] [[data-chat-gutter-end=bleed]_&]:[--chat-column-gutter-end:var(--chat-gutter-end,calc(var(--chat-gutter)+var(--tiles-padding)))] max-w-[calc(var(--max-content-width)+var(--chat-column-gutter-start)+var(--chat-column-gutter-end))] ps-[var(--chat-column-gutter-start)] pe-[var(--chat-column-gutter-end)] [[data-pane-overlay]_&]:[translate:var(--epitaxy-overlay-column-shift,none)] *:[--epitaxy-overlay-column-shift:none] [[data-pane-overlay]_&]:[transition:translate_var(--tile-overlay-duration)_var(--tile-overlay-ease)] [--max-content-width:var(--chat-column-measure,768px)] [[data-transcript-width=m]_&]:[--max-content-width:var(--chat-column-measure,960px)] [[data-transcript-width=l]_&]:[--max-content-width:var(--chat-column-measure,1280px)] pointer-events-none absolute inset-0 z-[1]";

/**
 * Empty chat: environment pills above the composer.
 * Chat with content: transcript in the scroll area, repo bar above the composer.
 */
export function ChatPanel({ transcript, chat }: { transcript?: Turn[]; chat?: Session }) {
  const hasContent = !!transcript;
  return (
    <ContextUsage.Provider value={contextUsage(transcript)}>
    <div className="contents">
      <div className="contents">
        <div className={
            "epitaxy-chat-panel-body flex-1 min-h-0 relative w-full mx-auto [.epitaxy-chat-panel_&]:[@container_tile-slot_(max-width:560px)]:[--chat-gutter:16px] [--chat-column-gutter-start:var(--chat-gutter-start,var(--chat-gutter,32px))] [--chat-column-gutter-end:var(--chat-gutter-end,var(--chat-gutter,32px))] [[data-chat-gutter-start=shave]_&]:[--chat-column-gutter-start:var(--chat-gutter-start,calc(var(--chat-gutter)-(var(--tiles-gap)-var(--tiles-padding))))] [[data-chat-gutter-end=shave]_&]:[--chat-column-gutter-end:var(--chat-gutter-end,calc(var(--chat-gutter)-(var(--tiles-gap)-var(--tiles-padding))))] [[data-chat-gutter-end=bleed]_&]:[--chat-column-gutter-end:var(--chat-gutter-end,calc(var(--chat-gutter)+var(--tiles-padding)))] max-w-[calc(var(--max-content-width)+var(--chat-column-gutter-start)+var(--chat-column-gutter-end))] ps-[var(--chat-column-gutter-start)] pe-[var(--chat-column-gutter-end)] [[data-pane-overlay]_&]:[translate:var(--epitaxy-overlay-column-shift,none)] *:[--epitaxy-overlay-column-shift:none] [[data-pane-overlay]_&]:[transition:translate_var(--tile-overlay-duration)_var(--tile-overlay-ease)] [--max-content-width:var(--chat-column-measure,768px)] [[data-transcript-width=m]_&]:[--max-content-width:var(--chat-column-measure,960px)] [[data-transcript-width=l]_&]:[--max-content-width:var(--chat-column-measure,1280px)]" +
            // With a transcript the scroll area spans the whole pane (scrollbar at the right edge);
            // the transcript column keeps the max width and gutters itself.
            (hasContent ? " !max-w-none !ps-0 !pe-0" : "")
          }>
          <ScrollFadeContainer>
            {transcript && (
              <div className={TRANSCRIPT_COLUMN + " !static !h-auto !pointer-events-auto select-text"}>
                <Transcript turns={transcript} live={chat?.running ? LIVE_STATUS[chat.id] : undefined} />
              </div>
            )}
          </ScrollFadeContainer>
          <div className="mx-auto [.epitaxy-chat-panel_&]:[@container_tile-slot_(max-width:560px)]:[--chat-gutter:16px] [--chat-column-gutter-start:var(--chat-gutter-start,var(--chat-gutter,32px))] [--chat-column-gutter-end:var(--chat-gutter-end,var(--chat-gutter,32px))] [[data-chat-gutter-start=shave]_&]:[--chat-column-gutter-start:var(--chat-gutter-start,calc(var(--chat-gutter)-(var(--tiles-gap)-var(--tiles-padding))))] [[data-chat-gutter-end=shave]_&]:[--chat-column-gutter-end:var(--chat-gutter-end,calc(var(--chat-gutter)-(var(--tiles-gap)-var(--tiles-padding))))] [[data-chat-gutter-end=bleed]_&]:[--chat-column-gutter-end:var(--chat-gutter-end,calc(var(--chat-gutter)+var(--tiles-padding)))] max-w-[calc(var(--max-content-width)+var(--chat-column-gutter-start)+var(--chat-column-gutter-end))] ps-[var(--chat-column-gutter-start)] pe-[var(--chat-column-gutter-end)] [[data-pane-overlay]_&]:[translate:var(--epitaxy-overlay-column-shift,none)] *:[--epitaxy-overlay-column-shift:none] [[data-pane-overlay]_&]:[transition:translate_var(--tile-overlay-duration)_var(--tile-overlay-ease)] [--max-content-width:var(--chat-column-measure,768px)] [[data-transcript-width=m]_&]:[--max-content-width:var(--chat-column-measure,960px)] [[data-transcript-width=l]_&]:[--max-content-width:var(--chat-column-measure,1280px)] pointer-events-none absolute inset-0 z-[1]">
            <div className="relative h-full" />
          </div>
        </div>
      </div>
      <div className="contents">
        <div className="group/approval-dock w-full mx-auto [.epitaxy-chat-panel_&]:[@container_tile-slot_(max-width:560px)]:[--chat-gutter:16px] [--chat-column-gutter-start:var(--chat-gutter-start,var(--chat-gutter,32px))] [--chat-column-gutter-end:var(--chat-gutter-end,var(--chat-gutter,32px))] [[data-chat-gutter-start=shave]_&]:[--chat-column-gutter-start:var(--chat-gutter-start,calc(var(--chat-gutter)-(var(--tiles-gap)-var(--tiles-padding))))] [[data-chat-gutter-end=shave]_&]:[--chat-column-gutter-end:var(--chat-gutter-end,calc(var(--chat-gutter)-(var(--tiles-gap)-var(--tiles-padding))))] [[data-chat-gutter-end=bleed]_&]:[--chat-column-gutter-end:var(--chat-gutter-end,calc(var(--chat-gutter)+var(--tiles-padding)))] max-w-[calc(var(--max-content-width)+var(--chat-column-gutter-start)+var(--chat-column-gutter-end))] ps-[var(--chat-column-gutter-start)] pe-[var(--chat-column-gutter-end)] [[data-pane-overlay]_&]:[translate:var(--epitaxy-overlay-column-shift,none)] *:[--epitaxy-overlay-column-shift:none] [[data-pane-overlay]_&]:[transition:translate_var(--tile-overlay-duration)_var(--tile-overlay-ease)] [--max-content-width:var(--chat-column-measure,768px)] [[data-transcript-width=m]_&]:[--max-content-width:var(--chat-column-measure,960px)] [[data-transcript-width=l]_&]:[--max-content-width:var(--chat-column-measure,1280px)] relative min-h-0 flex flex-col gap-1.5 [&>*]:shrink-0 [&_.epitaxy-approval-card]:shrink supports-[flex-basis:content]:[&_.epitaxy-approval-card]:basis-[content] supports-[flex-basis:content]:[&_.epitaxy-approval-card]:h-[var(--approval-dock-floor,144px)] [.epitaxy-chat-panel_&]:[@container_tile-slot_(max-width:500px)]:[--approval-dock-floor:208px] [contain:layout]">
          <div className="contents">
            <ScrollToBottomButton />
          </div>
          <span role="status" className="sr-only select-none" />
          {hasContent ? (
            <>
              {chat && <AnswerInPlanBar taskId={chat.id} />}
              {chat?.repo && <RepoBar repo={chat.repo} />}
            </>
          ) : (
            <div className="flex flex-wrap gap-xs pb-xs pr-[96px]">
              <EnvironmentPill dataId="0" />
              <CdsRoot />
              <EnvironmentPill dataId="1" />
              <HiddenInput />
              <span className="contents" />
            </div>
          )}
          <div className="empty:hidden sf-hidden" data-testid="composer-invite-slot" />
          <div className="contents">
            <div className="relative h-0 -mb-xs pointer-events-none">
              <EmptyContainer pointerEventsAuto={true} />
              {!hasContent && <AlienButton />}
            </div>
          </div>
          <div className="epitaxy-prompt" data-cds-shell="">
            <span role="status" className="sr-only" />
            <div
              data-cds="ChatComposer"
              className="flex w-full min-w-0 flex-col font-sans in-data-cds-dock-masked:bg-page"
            >
              <ChatComposer placeholder={hasContent ? "Type / for commands" : undefined} />
              <ChatComposerChin />
            </div>
          </div>
          <CdsRoot />
          <CdsRoot />
          <CdsRoot />
        </div>
      </div>
    </div>
    </ContextUsage.Provider>
  );
}

export function CdsRoot() {
  return (
    <div
      className="cds-root text-primary contents"
      data-density="compact"
      data-mode="dark"
      data-font="anthropic"
      style={{
        fontSize: "var(--cds-font-size-body)",
        "--cds-page-bg": "var(--cds-surface-1)",
      }}
    />
  );
}
