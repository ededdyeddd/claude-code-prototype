import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { Button, Icon, Popover, Tabs } from "../ui";
import { DEFAULT_ENVELOPE, envelopeScope, type ActionColumn, type Envelope, type PathAccess } from "../data/chatTasks";
import { setEnvelope, useEnvelope } from "../data/chatTaskStore";

const CHEVRON_UP = "";
const CLOSE = "";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

const LIMITS = [6, 12, 20, 40] as const;

const ACCESS_WORD: Record<PathAccess, string> = { write: "writes", read: "reads only", never: "never" };
const NEXT_ACCESS: Record<PathAccess, PathAccess> = { write: "read", read: "never", never: "write" };

const COLUMNS: { id: ActionColumn; label: string }[] = [
  { id: "free", label: "Without asking" },
  { id: "ask", label: "Ask first" },
  { id: "never", label: "Never" },
];
const NEXT_COLUMN: Record<ActionColumn, ActionColumn> = { free: "ask", ask: "never", never: "free" };

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-sm">
      <h3 className="text-footnote text-muted">{title}</h3>
      {children}
    </section>
  );
}

/** The envelope itself: money, territory, actions. Every control edits this task's copy of the project defaults. */
function EnvelopePanel({ envelope, onChange, onClose }: { envelope: Envelope; onChange: (e: Envelope) => void; onClose: () => void }) {
  const edited = JSON.stringify(envelope) !== JSON.stringify(DEFAULT_ENVELOPE);
  return (
    <div className="flex w-[440px] flex-col gap-lg p-lg">
      <header className="flex items-start gap-sm">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h2 className="text-body font-medium text-primary">Autonomy envelope</h2>
          <p className="text-footnote text-secondary">Inside it I act quietly; at the edge I ask.</p>
        </div>
        <Button size="xs" icon={CLOSE} aria-label="Close" onClick={onClose} />
      </header>

      <Section title="Money">
        <div className="flex items-center justify-between gap-md">
          <span className="text-body text-secondary">Limit per task</span>
          <Tabs
            label="Limit per task"
            value={String(envelope.limit)}
            items={LIMITS.map((l) => ({ value: String(l), label: `$${l}` }))}
            onChange={(v) => onChange({ ...envelope, limit: Number(v) })}
          />
        </div>
        <p className="text-footnote text-muted">
          At {Math.round(envelope.askAt * 100)}% (${Math.round(envelope.limit * envelope.askAt)}) I stop and ask. The forecast appears in the plan.
        </p>
      </Section>

      <Section title="Territory">
        <div className="flex flex-wrap gap-xs">
          {envelope.paths.map((p, i) => (
            <button
              key={p.path}
              type="button"
              title="Click to change"
              onClick={() =>
                onChange({ ...envelope, paths: envelope.paths.map((q, k) => (k === i ? { ...q, access: NEXT_ACCESS[q.access] } : q)) })
              }
              className="flex h-[var(--cds-h-control--xs)] items-center gap-1.5 rounded-sm bg-alpha-2 px-sm text-footnote outline-none hover:bg-alpha-3 focus-visible:shadow-focus cursor-[var(--cds-cursor-interactive)]"
            >
              <span className={cx("font-mono", p.access === "never" ? "text-muted line-through" : "text-primary")}>{p.path}</span>
              <span className="text-muted">{ACCESS_WORD[p.access]}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Actions">
        <div className="grid grid-cols-3 gap-sm">
          {COLUMNS.map((c) => (
            <div key={c.id} className="flex min-w-0 flex-col gap-1">
              <span className="text-footnote text-secondary">{c.label}</span>
              {envelope.actions
                .filter((a) => a.column === c.id)
                .map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    title="Click to move to the next column"
                    onClick={() =>
                      onChange({ ...envelope, actions: envelope.actions.map((b) => (b.id === a.id ? { ...b, column: NEXT_COLUMN[b.column] } : b)) })
                    }
                    className={cx(
                      "min-h-[var(--cds-h-control--xs)] rounded-sm px-sm py-0.5 text-left text-footnote outline-none hover:bg-alpha-2 focus-visible:shadow-focus cursor-[var(--cds-cursor-interactive)]",
                      a.label.startsWith("--") ? "font-mono" : "",
                      c.id === "never" ? "text-muted" : "text-primary",
                    )}
                  >
                    {a.label}
                  </button>
                ))}
            </div>
          ))}
        </div>
      </Section>

      <footer className="flex items-end gap-md border-t border-alpha-2 pt-md">
        <p className="min-w-0 flex-1 text-caption text-muted">
          A behaviour boundary, not a data isolation guarantee. Defaults come from the project settings; changes here apply to this task only.
        </p>
        {edited && (
          <Button size="xs" variant="secondary" onClick={() => onChange(DEFAULT_ENVELOPE)}>
            Reset
          </Button>
        )}
      </footer>
    </div>
  );
}

/**
 * Chip in the composer chin instead of the Auto switch: "Auto · up to $12 · checkout/".
 * Setting it is never required before sending; it opens the envelope for this chat.
 */
export function EnvelopeChip({ chatId, defaultOpen = false }: { chatId: string; defaultOpen?: boolean }) {
  const envelope = useEnvelope(chatId);
  const [open, setOpen] = useState(defaultOpen);
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <>
      <Button
        ref={ref}
        size="xs"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="min-w-0 shrink"
      >
        <span className="truncate">
          Auto · up to ${envelope.limit} · <span className="font-mono">{envelopeScope(envelope)}</span>
        </span>
        <Icon glyph={CHEVRON_UP} size="sm" className="ms-1 !text-current opacity-70" />
      </Button>
      <Popover anchor={ref} open={open} onClose={() => setOpen(false)} label="Autonomy envelope">
        <EnvelopePanel envelope={envelope} onChange={(e) => setEnvelope(chatId, e)} onClose={() => setOpen(false)} />
      </Popover>
    </>
  );
}
