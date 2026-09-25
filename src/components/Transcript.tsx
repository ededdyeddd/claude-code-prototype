import { useContext, useState } from "react";
import type { Block, Diff, LiveStatus, Turn, TurnStep } from "../data/transcripts";
import { Button, Icon } from "../ui";
import { Irregular_radiating_starburst } from "./icons/Irregular_radiating_starburst";
import { ArtifactTile, ChatTaskContext, TASK_ICON, TaskBlock } from "./ChatTask";

const CHEVRON = "";
const COPY = "\uE056"; // two overlapping squares, as in the app
const FORK = "\uE012";
const PIN = "\uE0BD";
const SPEAKER = "\uE0E4";
const RUN = "\uE0C1";
const FILE_CODE = "\uE048";
const FILES = "\uE02D";

const fmt = (n: number) => n.toLocaleString("en-US");

/** "+14 -1" in git colors. */
function DiffStat({ diff }: { diff: Diff }) {
  return (
    <span className="whitespace-nowrap tabular-nums">
      <span className="text-git-added">+{fmt(diff.added)}</span>
      <span className="text-git-removed">-{fmt(diff.removed)}</span>
    </span>
  );
}

/** Renders `backtick` spans as inline code (styled by the design-system .prose rules). */
export function Inline({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((p, i) => (p.startsWith("`") && p.endsWith("`") ? <code key={i}>{p.slice(1, -1)}</code> : p))}
    </>
  );
}

function UserMessage({ text }: { text: string }) {
  return (
    <div data-cds="UserMessage" className="flex justify-end">
      <div
        className="max-w-[85%] whitespace-pre-wrap rounded-lg bg-alpha-2 px-md py-sm text-prose text-primary"
        style={{ fontFamily: "var(--font-user-message)" }}
      >
        {text}
      </div>
    </div>
  );
}

/** Collapsed "Thought for Ns" row; expands to the list of steps Claude took. */
function TurnStatus({ label, target, diff, steps = [] }: { label: string; target?: string; diff?: Diff; steps?: TurnStep[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div data-cds="TurnStatus" className="flex flex-col gap-xs">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="group/status -ms-1 flex w-fit items-center gap-1 rounded-sm px-1 text-body text-muted outline-none hover:text-secondary focus-visible:shadow-focus"
      >
        <span>
          {label}
          {target && <span className="text-secondary"> {target}</span>}
        </span>
        {diff && <DiffStat diff={diff} />}
        <Icon
          glyph={CHEVRON}
          size="sm"
          className={"!text-current transition-transform duration-fast " + (open ? "rotate-90" : "rotate-0")}
        />
      </button>
      {open && (
        <ul className="ms-1 flex flex-col gap-1.5 border-s border-alpha-2 ps-md">
          {steps.map((s) => (
            <li key={s.label} data-cds="TurnStatusStep" className="flex items-center gap-sm text-body text-secondary">
              <Icon glyph={s.icon} className="!text-muted" />
              <span>{s.label}</span>
              {s.detail && <span className="truncate text-muted">{s.detail}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "h2":
      return (
        <h2>
          <Inline text={block.text} />
        </h2>
      );
    case "h3":
      return (
        <h3>
          <Inline text={block.text} />
        </h3>
      );
    case "p":
      return (
        <p>
          <Inline text={block.text} />
        </p>
      );
    case "verse":
      return (
        <p className="italic">
          {block.lines.map((l, i) => (
            <span key={i}>
              {l}
              {i < block.lines.length - 1 && <br />}
            </span>
          ))}
        </p>
      );
    case "ul":
      return (
        <ul>
          {block.items.map((i) => (
            <li key={i}>
              <Inline text={i} />
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol>
          {block.items.map((i) => (
            <li key={i}>
              <Inline text={i} />
            </li>
          ))}
        </ol>
      );
    case "table":
      return (
        <table>
          <thead>
            <tr>
              {block.head.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((r) => (
              <tr key={r[0]}>
                {r.map((c, i) => (
                  <td key={i}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    case "code":
      return block.lang === "bash" ? <CommandBlock code={block.code} /> : <CodeBlock code={block.code} />;
    case "status":
      return (
        <div className="not-prose">
          <TurnStatus label={block.label} target={block.target} diff={block.diff} />
        </div>
      );
    case "files":
      return <FilesCard block={block} />;
    case "brief-card":
    case "result-card":
    case "escalation-card":
    case "edit-note":
    case "question":
      return <TaskBlock block={block} />;
  }
}

/** Shell highlighter: the command name in accent, its arguments in green (as in the app). */
function highlightShell(line: string) {
  return line.split(/(\s+)/).map((tok, i) => {
    if (/^\s+$/.test(tok)) return tok;
    return (
      <span key={i} className={i === 0 ? "text-accent" : "text-git-added"}>
        {tok}
      </span>
    );
  });
}

/** Shell command with Run and Copy actions: soft filled card, no border (as in the app). */
function CommandBlock({ code }: { code: string }) {
  return (
    <div className="not-prose flex w-fit max-w-full items-center gap-6 rounded-lg bg-alpha-1 py-1.5 ps-4 pe-2">
      <pre className="min-w-0 overflow-x-auto py-0.5 font-mono text-code">
        <code>
          {code.split("\n").map((l, i) => (
            <div key={i}>{highlightShell(l)}</div>
          ))}
        </code>
      </pre>
      <div className="flex shrink-0 items-center">
        <Button size="xs" icon={RUN} aria-label="Run in terminal" className="!text-secondary" />
        <Button size="xs" icon={COPY} aria-label="Copy command" className="!text-secondary" onClick={() => navigator.clipboard?.writeText(code)} />
      </div>
    </div>
  );
}

/** "Edited N files" card with per-file diff stats. */
function FilesCard({ block }: { block: Extract<Block, { type: "files" }> }) {
  const [expanded, setExpanded] = useState(false);
  const limit = block.visible ?? block.files.length;
  const shown = expanded ? block.files : block.files.slice(0, limit);
  const hidden = block.files.length - shown.length;
  const row =
    "flex h-[var(--cds-h-control)] w-full items-center gap-sm px-md text-left text-body outline-none hover:bg-fill-ghost-hover focus-visible:bg-fill-ghost-hover cursor-[var(--cds-cursor-interactive)]";
  const chevron = <Icon glyph={CHEVRON} size="sm" className="!text-muted" />;
  return (
    <div
      className="not-prose flex flex-col overflow-hidden rounded-lg py-1"
      style={{ boxShadow: "inset 0 0 0 1px var(--cds-alpha-2)" }}
    >
      <button type="button" className={row}>
        <Icon glyph={FILES} className="!text-muted" />
        <span className="flex-1 truncate text-primary">{block.title}</span>
        <DiffStat diff={block.diff} />
        {chevron}
      </button>
      {shown.map((f) => (
        <button key={f.name} type="button" className={row}>
          <Icon glyph={FILE_CODE} className="!text-muted" />
          <span className="flex-1 truncate text-primary">{f.name}</span>
          <DiffStat diff={f.diff} />
          {chevron}
        </button>
      ))}
      {hidden > 0 && (
        <button type="button" className={row} onClick={() => setExpanded(true)}>
          <span className="w-4" />
          <span className="flex-1 text-secondary">Show {hidden} more</span>
          {chevron}
        </button>
      )}
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="not-prose relative w-fit max-w-full rounded-lg bg-alpha-1" style={{ boxShadow: "inset 0 0 0 1px var(--cds-alpha-2)" }}>
      <pre className="overflow-x-auto py-sm ps-md pe-[44px] font-mono text-code text-primary">
        <code>{code}</code>
      </pre>
      <Button
        size="xs"
        icon={COPY}
        aria-label="Copy code"
        className="!absolute top-1 end-1"
        onClick={() => navigator.clipboard?.writeText(code)}
      />
    </div>
  );
}

// Muted by default, bright on hover of the button itself (as in the app).
const ACTION = "!text-secondary hover:!text-primary";

/** Actions under an assistant reply, revealed on hover: copy, fork, pin, read aloud, and the reply time. */
function MessageActions({ time }: { time?: string }) {
  return (
    <div
      data-cds="MessageActions"
      className="-ms-1.5 flex items-center gap-0.5 opacity-0 transition-opacity duration-fast group-hover/message-row:opacity-100 focus-within:opacity-100"
    >
      <Button size="xs" icon={COPY} aria-label="Copy" className={ACTION} />
      <Button size="xs" icon={FORK} aria-label="Fork from here" className={ACTION} />
      <Button size="xs" icon={PIN} aria-label="Pin" className={ACTION} />
      <Button size="xs" icon={SPEAKER} aria-label="Read aloud" className={ACTION} />
      {time && <span className="ms-1.5 text-footnote text-muted">{time}</span>}
    </div>
  );
}

/** Chat transcript: user bubbles, assistant turns with status, prose answer and actions. */
/**
 * What a task chat is doing now, as a card like the Plan tile: the step in progress, and under it "In progress",
 * its place in the plan and the file. Opens the plan, so the link between the feed and the plan is explicit.
 */
function PlanStepRow({ live, planStep }: { live: LiveStatus; planStep: { done: number; of: number } }) {
  const { setTab } = useContext(ChatTaskContext);
  return (
    <div className="not-prose">
      <ArtifactTile
        icon={TASK_ICON}
        title={<span className="truncate">{live.step}</span>}
        // Said in words: a pulsing dot alone did not read as progress. The count is the whole plan's, the same as on
        // the Plan chip and in the plan's header ("3 of 6"), not the step's number, which read as a mismatch.
        meta={["In progress", `Plan: ${planStep.done} of ${planStep.of} steps done`, live.target].filter(Boolean).join(" · ")}
        onOpen={() => setTab("plan")}
      />
    </div>
  );
}

export function Transcript({ turns, live }: { turns: Turn[]; live?: LiveStatus }) {
  return (
    // Everything in the feed (status rows, file cards, task cards) is built with text-body; here it reads at the
    // message size, so the body token maps to the prose size for the whole feed. Footnotes stay 12px.
    <div className="flex flex-col gap-lg pt-lg pb-xl [--cds-font-size-body:var(--cds-font-size-prose)] [--cds-leading-body:var(--cds-leading-prose)]">
      {turns.map((t, i) =>
        t.role === "user" ? (
          <UserMessage key={i} text={t.text} />
        ) : (
          <div key={i} className="group/message-row flex flex-col gap-sm">
            {t.thought && <TurnStatus label={t.thought} target={t.thoughtTarget} steps={t.steps} />}
            <div className="prose font-claude-response text-prose text-primary [--font-claude-response:var(--cds-font-sans)]">
              {t.blocks.map((b, j) => (
                <BlockView key={j} block={b} />
              ))}
            </div>
            <MessageActions time={t.time} />
          </div>
        )
      )}
      {/* Running: current step row, then a pulsing spark with stats. Finished: a static spark only. */}
      {live &&
        (live.planStep ? (
          <PlanStepRow live={live} planStep={live.planStep} />
        ) : (
          <TurnStatus label={live.step} target={live.target} />
        ))}
      <div className="flex h-[22px] items-center gap-sm [&_[data-cds=Spark]]:!size-4">
        <span className="flex motion-reduce:!animate-none" style={live ? { animation: "spark-breathe 1.2s infinite", willChange: "transform" } : undefined}>
          <Irregular_radiating_starburst />
        </span>
        {live && <span className="text-footnote text-muted">{live.stats}</span>}
      </div>
    </div>
  );
}
