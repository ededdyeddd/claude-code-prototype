import { useState } from "react";
import type { Block, Turn, TurnStep } from "../data/transcripts";
import { Button, Icon } from "../ui";
import { Irregular_radiating_starburst } from "./icons/Irregular_radiating_starburst";

const CHEVRON = "";
const COPY = "";
const RETRY = "";
const THUMB_UP = "";
const THUMB_DOWN = "";

/** Renders `backtick` spans as inline code (styled by the design-system .prose rules). */
function Inline({ text }: { text: string }) {
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
        className="max-w-[85%] whitespace-pre-wrap rounded-lg bg-alpha-2 px-md py-sm text-body text-primary"
        style={{ fontFamily: "var(--font-user-message)" }}
      >
        {text}
      </div>
    </div>
  );
}

/** Collapsed "Thought for Ns" row; expands to the list of steps Claude took. */
function TurnStatus({ label, steps = [] }: { label: string; steps?: TurnStep[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div data-cds="TurnStatus" className="flex flex-col gap-xs">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="group/status -ms-1 flex w-fit items-center gap-1 rounded-sm px-1 text-body text-muted outline-none hover:text-secondary focus-visible:shadow-focus"
      >
        {label}
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
      return <CodeBlock code={block.code} />;
  }
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

/** Copy / retry / feedback actions under an assistant reply; revealed on hover like in the app. */
function MessageActions() {
  return (
    <div
      data-cds="MessageActions"
      className="-ms-1.5 flex items-center gap-0.5 opacity-0 transition-opacity duration-fast group-hover/message-row:opacity-100 focus-within:opacity-100"
    >
      <Button size="xs" icon={COPY} aria-label="Copy" />
      <Button size="xs" icon={RETRY} aria-label="Retry" />
      <Button size="xs" icon={THUMB_UP} aria-label="Good response" />
      <Button size="xs" icon={THUMB_DOWN} aria-label="Bad response" />
    </div>
  );
}

/** Chat transcript: user bubbles, assistant turns with status, prose answer and actions. */
export function Transcript({ turns }: { turns: Turn[] }) {
  return (
    <div className="flex flex-col gap-lg pt-lg pb-xl">
      {turns.map((t, i) =>
        t.role === "user" ? (
          <UserMessage key={i} text={t.text} />
        ) : (
          <div key={i} className="group/message-row flex flex-col gap-sm">
            {t.thought && <TurnStatus label={t.thought} steps={t.steps} />}
            <div className="prose font-claude-response text-body text-primary [--font-claude-response:var(--cds-font-sans)]">
              {t.blocks.map((b, j) => (
                <BlockView key={j} block={b} />
              ))}
            </div>
            <MessageActions />
          </div>
        )
      )}
      {/* Claude is idle and waiting for the next message */}
      <div className="flex h-[22px] items-center">
        <Irregular_radiating_starburst />
      </div>
    </div>
  );
}
