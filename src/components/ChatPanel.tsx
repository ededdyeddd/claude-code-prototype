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
import { ContextUsage } from "./icons/Blue_dot_right_edge";
import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../ui";
import { NEW_CHAT, seeTab, sendMessage, useChatTask, type TaskTab } from "../data/chatTaskStore";
import { ONE_CLICK_PROMPT, guessLevel } from "../data/chatTasks";
import { openQuestions, useInbox } from "../data/inboxStore";
import { planProgress } from "../data/task";
import { ChatTaskContext, DecisionDock } from "./ChatTask";

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
const COLUMN =
  "mx-auto [.epitaxy-chat-panel_&]:[@container_tile-slot_(max-width:560px)]:[--chat-gutter:16px] [--chat-column-gutter-start:var(--chat-gutter-start,var(--chat-gutter,32px))] [--chat-column-gutter-end:var(--chat-gutter-end,var(--chat-gutter,32px))] [[data-chat-gutter-start=shave]_&]:[--chat-column-gutter-start:var(--chat-gutter-start,calc(var(--chat-gutter)-(var(--tiles-gap)-var(--tiles-padding))))] [[data-chat-gutter-end=shave]_&]:[--chat-column-gutter-end:var(--chat-gutter-end,calc(var(--chat-gutter)-(var(--tiles-gap)-var(--tiles-padding))))] [[data-chat-gutter-end=bleed]_&]:[--chat-column-gutter-end:var(--chat-gutter-end,calc(var(--chat-gutter)+var(--tiles-padding)))] max-w-[calc(var(--max-content-width)+var(--chat-column-gutter-start)+var(--chat-column-gutter-end))] ps-[var(--chat-column-gutter-start)] pe-[var(--chat-column-gutter-end)] [[data-pane-overlay]_&]:[translate:var(--epitaxy-overlay-column-shift,none)] *:[--epitaxy-overlay-column-shift:none] [[data-pane-overlay]_&]:[transition:translate_var(--tile-overlay-duration)_var(--tile-overlay-ease)] [--max-content-width:var(--chat-column-measure,768px)] [[data-transcript-width=m]_&]:[--max-content-width:var(--chat-column-measure,960px)] [[data-transcript-width=l]_&]:[--max-content-width:var(--chat-column-measure,1280px)]";
const TRANSCRIPT_COLUMN = COLUMN + " pointer-events-none absolute inset-0 z-[1]";

/**
 * Empty chat: environment pills above the composer.
 * Chat with content: transcript in the scroll area, repo bar above the composer.
 */
export function ChatPanel({ transcript, chat }: { transcript?: Turn[]; chat?: Session }) {
  const hasContent = !!transcript;
  const view = useChatTask(chat?.id);
  const { answers } = useInbox();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  // S2 demo: /code?scene=s2 opens the new chat with a draft typed and the envelope open.
  const scene = !hasContent ? params.get("scene") : null;
  const [draft, setDraft] = useState(scene === "s2" ? ONE_CLICK_PROMPT : "");
  const [asTask, setAsTask] = useState<boolean | undefined>(undefined);
  const guess = guessLevel(draft);
  const bigTask = asTask ?? guess.level >= 3;

  // Brief and Plan open in the pane on the right of the chat (?panel=brief|plan, see ChatShell); the feed is always the chat.
  const setTab = (t: TaskTab) => {
    if (view && t !== "chat") seeTab(view.id, t);
    setParams(
      (p) => {
        const next = new URLSearchParams(p);
        next.delete("review");
        if (t === "chat") next.delete("panel");
        else next.set("panel", t);
        return next;
      },
      { replace: true },
    );
  };
  const turns = transcript && view ? [...transcript, ...view.turns] : transcript;
  // The live row names the plan step in progress, so the feed and the plan say the same thing; the file stays as its target.
  const progress = view ? planProgress(view.live) : undefined;
  const liveBase = chat?.running ? LIVE_STATUS[chat.id] : undefined;
  const live =
    liveBase && progress?.running
      ? {
          ...liveBase,
          step: progress.running.title,
          planStep: { done: progress.done, of: progress.total },
          parallel: progress.parallel.length - 1,
          waitingForYou: !!view && openQuestions(view.live, answers).some((q) => q.blocking),
        }
      : liveBase;

  const send = (text: string) => {
    if (view) return sendMessage(view.id, text);
    // New chat: a large task opens the S3 demo (its first message is the S2 draft).
    if (!hasContent && bigTask) navigate("/code/one-click-pay");
  };

  return (
    <ChatTaskContext.Provider
      value={{
        chatId: chat?.id,
        view,
        setTab,
        openReview: (t) =>
          setParams(
            (p) => {
              const next = new URLSearchParams(p);
              next.set("review", t);
              return next;
            },
            { replace: true },
          ),
      }}
    >
    <ContextUsage.Provider value={contextUsage(transcript)}>
    <div className="contents">
      <div className="contents">
        <div className={
            "epitaxy-chat-panel-body flex-1 min-h-0 relative w-full mx-auto [.epitaxy-chat-panel_&]:[@container_tile-slot_(max-width:560px)]:[--chat-gutter:16px] [--chat-column-gutter-start:var(--chat-gutter-start,var(--chat-gutter,32px))] [--chat-column-gutter-end:var(--chat-gutter-end,var(--chat-gutter,32px))] [[data-chat-gutter-start=shave]_&]:[--chat-column-gutter-start:var(--chat-gutter-start,calc(var(--chat-gutter)-(var(--tiles-gap)-var(--tiles-padding))))] [[data-chat-gutter-end=shave]_&]:[--chat-column-gutter-end:var(--chat-gutter-end,calc(var(--chat-gutter)-(var(--tiles-gap)-var(--tiles-padding))))] [[data-chat-gutter-end=bleed]_&]:[--chat-column-gutter-end:var(--chat-gutter-end,calc(var(--chat-gutter)+var(--tiles-padding)))] max-w-[calc(var(--max-content-width)+var(--chat-column-gutter-start)+var(--chat-column-gutter-end))] ps-[var(--chat-column-gutter-start)] pe-[var(--chat-column-gutter-end)] [[data-pane-overlay]_&]:[translate:var(--epitaxy-overlay-column-shift,none)] *:[--epitaxy-overlay-column-shift:none] [[data-pane-overlay]_&]:[transition:translate_var(--tile-overlay-duration)_var(--tile-overlay-ease)] [--max-content-width:var(--chat-column-measure,768px)] [[data-transcript-width=m]_&]:[--max-content-width:var(--chat-column-measure,960px)] [[data-transcript-width=l]_&]:[--max-content-width:var(--chat-column-measure,1280px)]" +
            // With a transcript the scroll area spans the whole pane (scrollbar at the right edge);
            // the transcript column keeps the max width and gutters itself.
            (hasContent ? " !max-w-none !ps-0 !pe-0" : "")
          }>
          <ScrollFadeContainer stickToBottom={transcript ? chat?.id : undefined}>
            {transcript && (
              <div className={TRANSCRIPT_COLUMN + " !static !h-auto !pointer-events-auto select-text"}>
                <Transcript turns={turns!} live={live} />
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
              {chat && (
                // The dock sits right under the messages: its text-body matches their prose size.
                <div className="contents [--cds-font-size-body:var(--cds-font-size-prose)] [--cds-leading-body:var(--cds-leading-prose)]">
                  <DecisionDock key={chat.id} chatId={chat.id} view={view} setTab={setTab} />
                </div>
              )}
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
          {!hasContent && (
            <NewChatLine draft={draft} bigTask={bigTask} reason={asTask === undefined ? guess.reason : undefined} onAsTask={setAsTask} />
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
              <ChatComposer
                key={`composer:${chat?.id ?? NEW_CHAT}`}
                placeholder={view?.atGate ? "Edit the brief or plan…" : hasContent ? "Type / for commands" : undefined}
                initialText={scene === "s2" ? ONE_CLICK_PROMPT : undefined}
                onChange={hasContent ? undefined : (t) => (setDraft(t), t || setAsTask(undefined))}
                onSend={send}
              />
              <ChatComposerChin key={`chin:${chat?.id ?? NEW_CHAT}`} />
            </div>
          </div>
          <CdsRoot />
          <CdsRoot />
          <CdsRoot />
        </div>
      </div>
    </div>
    </ContextUsage.Provider>
    </ChatTaskContext.Provider>
  );
}

/**
 * New chat (S2), one quiet line over the composer. Empty field: who is waiting in the Inbox.
 * With a draft: the level hint ("looks like a large task") with a way out, or a way up for a plain chat.
 */
function NewChatLine({
  draft,
  bigTask,
  reason,
  onAsTask,
}: {
  draft: string;
  bigTask: boolean;
  reason?: string;
  onAsTask: (v: boolean) => void;
}) {
  const { blocked, canWait } = useInbox();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const line = "flex min-h-[var(--cds-h-control--xs)] items-center gap-sm pb-xs ps-xs text-footnote";
  if (!draft) {
    if (!blocked.length && !canWait.length) return null;
    return (
      <div className={line + " text-muted"}>
        <span className="min-w-0 truncate">
          {blocked.length} blocked on you{canWait.length > 0 && ` · ${canWait.length} can wait`}
        </span>
        <button
          type="button"
          onClick={() => navigate("/up-next", { state: { from: pathname } })}
          className="shrink-0 rounded-sm text-secondary outline-none hover:text-primary focus-visible:shadow-focus"
        >
          Up next →
        </button>
      </div>
    );
  }
  return bigTask ? (
    <div className={line + " text-secondary"}>
      <span className="min-w-0 truncate">
        {reason && reason !== "size" ? `Looks like a large task (${reason})` : "Looks like a large task"} — I'll write a brief and plan first
      </span>
      <Button size="xs" onClick={() => onAsTask(false)}>
        Skip the brief
      </Button>
    </div>
  ) : (
    <div className={line + " text-muted"}>
      <Button size="xs" onClick={() => onAsTask(true)} className="!text-secondary">
        Plan it first
      </Button>
      <span className="shrink-0">or type /plan</span>
    </div>
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
