import { useEffect, useState, type ReactNode } from "react";
import type { Claim, ClaimSource, Review, ReviewTab } from "../data/task";
import { toggleHandCheck, type AcceptanceView, type ChatTaskView } from "../data/chatTaskStore";
import { REVEAL_EVENT, revealInReview, takeReveal } from "../data/reveal";
import { Hint, Icon, Tabs } from "../ui";
import { SidePane } from "./SidePane";
import { TaskDot } from "./StatusMark";
import { CHEVRON, CODE, FlagRow, LOCK, SectionTitle } from "./ChatTask";
import { PANE_BODY } from "./PlanPane";
import { Inline } from "./Transcript";

const CHECK = "\uE03B";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

const TABS: { value: ReviewTab; label: string }[] = [
  { value: "changes", label: "Changes" },
  { value: "screens", label: "Screenshots" },
  { value: "checks", label: "Checks" },
];

/** A file of the change as a unified diff: git colors on the changed lines, as in chats. */
function FileDiff({ file, id, note }: { file: Review["files"][number]; id?: string; note?: string }) {
  return (
    <div id={id} className="flex scroll-mt-md flex-col overflow-hidden rounded-lg" style={{ boxShadow: "inset 0 0 0 1px var(--cds-alpha-2)" }}>
      <div className="flex items-center gap-sm border-b border-alpha-2 px-md py-xs font-mono text-footnote">
        <span className="min-w-0 flex-1 truncate text-secondary">{file.name}</span>
        {note && <span className="shrink-0 font-sans text-muted">{note}</span>}
        <span className="text-git-added">+{file.added}</span>
        <span className="text-git-removed">−{file.removed}</span>
      </div>
      <DiffLines lines={file.lines} />
    </div>
  );
}

/** Unified diff lines: git colors on added and removed lines, hunk headers muted. */
function DiffLines({ lines }: { lines: string[] }) {
  return (
      <pre className="overflow-x-auto py-xs font-mono text-code">
        {lines.map((l, i) => {
          const kind = l.startsWith("@@") ? "hunk" : l[0];
          return (
            <div
              key={i}
              className={cx(
                "whitespace-pre px-md",
                kind === "+" && "bg-bg-git-added text-primary",
                kind === "-" && "bg-bg-git-removed text-primary",
                kind === "hunk" && "text-muted",
                kind === " " && "text-secondary",
              )}
            >
              {l}
            </div>
          );
        })}
      </pre>
  );
}

/**
 * A mock screenshot of the order history at a screen width, scaled to fit: before, the row does not wrap and the
 * reorder button runs off the edge; after, the total and the button move under each other on narrow screens.
 */
function OrderScreen({ width, after }: { width: number; after: boolean }) {
  const scale = 0.42;
  const row = (n: string, date: string, total: string) => (
    <div
      className={cx(
        "flex items-center gap-2 border-b border-alpha-2 py-3 text-[14px]",
        after ? "flex-wrap" : "overflow-hidden whitespace-nowrap",
      )}
    >
      <span className="text-primary">#{n}</span>
      <span className="text-muted">{date}</span>
      {after && width < 640 ? (
        <span className="ms-auto flex flex-col items-end gap-1">
          <span className="text-primary">{total}</span>
          <span className="rounded-md bg-fill-primary px-3 py-1.5 text-on-primary">Повторить заказ</span>
        </span>
      ) : (
        <>
          <span className="ms-auto text-primary">{total}</span>
          <span className="shrink-0 rounded-md bg-fill-primary px-3 py-1.5 text-on-primary">Повторить заказ</span>
        </>
      )}
    </div>
  );
  return (
    <div className="overflow-hidden rounded-md bg-surface-1" style={{ width: width * scale, height: 300 * scale, boxShadow: "inset 0 0 0 1px var(--cds-alpha-3)" }}>
      <div className="origin-top-left px-4 pt-4" style={{ width, transform: `scale(${scale})` }}>
        <div className="pb-2 text-[18px] font-medium text-primary">Мои заказы</div>
        {row("1042", "12 мая", "3 480 ₽")}
        {row("1038", "2 мая", "12 990 ₽")}
        {row("1031", "21 апр", "760 ₽")}
      </div>
    </div>
  );
}

/**
 * The review artifact of a small task's result, opened next to the chat: what changed, how it looks,
 * what was checked. It is for looking; the result is accepted in the chat's decision dock, which stays visible.
 */
export function ReviewPane({
  view,
  tab,
  onTab,
  onClose,
  width,
  maxWidth,
  onResize,
}: {
  view: ChatTaskView;
  tab: ReviewTab;
  onTab: (t: ReviewTab) => void;
  onClose: () => void;
  width: number;
  maxWidth: number;
  onResize: (w: number) => void;
}) {
  const review = view.task.result?.review;
  if (!review) return null;
  return (
    <SidePane
      title="Review"
      meta={view.task.title}
      width={width}
      maxWidth={maxWidth}
      onResize={onResize}
      onClose={onClose}
    >
      <div className="flex flex-col gap-lg px-[var(--cds-gap-lg)] pt-xs pb-[var(--cds-gap-xl)]">
        <Tabs label="Review" value={tab} items={TABS} onChange={onTab} />

        {tab === "changes" && review.files.map((f) => <FileDiff key={f.name} file={f} />)}

        {tab === "screens" && (
          <div className="flex flex-col gap-lg">
            {review.screens.map((w) => (
              <section key={w} className="flex flex-col gap-xs">
                <h3 className="text-footnote text-muted">{w}px</h3>
                <div className="flex flex-wrap gap-md">
                  {[false, true].map((after) => (
                    <figure key={String(after)} className="flex flex-col gap-1">
                      <OrderScreen width={w} after={after} />
                      <figcaption className="text-footnote text-secondary">{after ? "After" : "Before"}</figcaption>
                    </figure>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {tab === "checks" && (
          <div className="flex flex-col gap-lg">
            {review.checks.map((c) => (
              <section key={c.label} className="flex flex-col gap-xs">
                <div className="flex items-baseline gap-sm">
                  <TaskDot state="done" />
                  <span className="text-body text-primary">{c.label}</span>
                  <span className="ms-auto text-footnote tabular-nums text-secondary">{c.result}</span>
                </div>
                <ul className="flex flex-col gap-0.5 ps-[calc(12px+var(--cds-gap-sm))]">
                  {c.items.map((i) => (
                    <li key={i} className="text-footnote text-muted">
                      {i}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </SidePane>
  );
}

/* ------------------------------------------------------ Acceptance, levels 2–3 */

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

const CROSS = "\uE10F";

/**
 * Status of a claim or a test at a glance: a tick only for what an outside source proved, the ring for the agent's
 * word alone, a cross for what a source contradicts. The one place in the product with ticks (docs/CHAT_LEVELS.md §4).
 */
function StatusMark({ status, needsYou }: { status: Claim["status"]; needsYou?: boolean }) {
  if (status === "verified") return <Icon glyph={CHECK} size="sm" className="!text-secondary" />;
  if (status === "contradicted") return <Icon glyph={CROSS} size="sm" className={needsYou ? "!text-clay" : "!text-primary"} />;
  return <TaskDot state="ahead" />;
}

/** The proof in words: the source, "Only claimed", or what contradicts it. Text, not color. */
function proofText(status: Claim["status"], source?: ClaimSource) {
  if (status === "claimed" || !source) return "Only claimed";
  if (status === "contradicted") return `Contradicts: ${source.label}`;
  return source.label;
}

/** What a claim was in the round before, where it changed. */
const WAS: Record<Claim["status"], string> = { verified: "proven", claimed: "only claimed", contradicted: "contradicted" };

/** A mock screenshot of the repeat order: the one-click button with the saved card, scaled to fit. */
function PayScreen({ width }: { width: number }) {
  const scale = width > 800 ? 0.2 : 0.42;
  return (
    <figure className="flex flex-col gap-1">
      <div className="overflow-hidden rounded-md bg-surface-1" style={{ width: width * scale, height: 260 * scale, boxShadow: "inset 0 0 0 1px var(--cds-alpha-3)" }}>
        <div className="origin-top-left px-4 pt-4" style={{ width, transform: `scale(${scale})` }}>
          <div className="pb-3 text-[18px] font-medium text-primary">Заказ #1043</div>
          <div className="flex items-center justify-between border-b border-alpha-2 py-3 text-[14px] text-secondary">
            <span>Итого</span>
            <span className="text-primary">3 480 ₽</span>
          </div>
          <div className="mt-4 rounded-md bg-fill-primary px-4 py-3 text-center text-[16px] text-on-primary">Оплатить картой •• 4242</div>
          <div className="mt-2 text-center text-[13px] text-muted">Другая карта</div>
        </div>
      </div>
      <figcaption className="text-footnote text-secondary">{width}px</figcaption>
    </figure>
  );
}

/** The proof itself, opened in place under the claim: the CI log, a piece of the test diff, the screenshot, the reviewer's words. */
function Evidence({ source }: { source: ClaimSource }) {
  const lines = source.detail ?? [];
  if (source.kind === "screenshot")
    return (
      <div className="flex flex-wrap items-end gap-md">
        <PayScreen width={375} />
        <PayScreen width={1440} />
      </div>
    );
  if (source.kind === "reviewer-agent")
    return (
      <div className="flex flex-col gap-0.5 border-s-2 border-alpha-3 ps-md text-body text-secondary">
        {lines.map((l) => (
          <p key={l}>
            <Inline text={l} />
          </p>
        ))}
      </div>
    );
  return (
    <div className="overflow-hidden rounded-lg" style={{ boxShadow: "inset 0 0 0 1px var(--cds-alpha-2)" }}>
      {source.kind === "test-diff" ? (
        <DiffLines lines={lines} />
      ) : (
        <pre className="overflow-x-auto px-md py-xs font-mono text-code text-secondary">{lines.join("\n")}</pre>
      )}
    </div>
  );
}

/** A row that lights up for a moment when a link elsewhere led to it. */
const flashClass = (on: boolean) => cx("rounded transition-colors duration-slow", on && "bg-alpha-2");

/* Result tab typography and spacing, as in the plan and the brief (docs/BRIEF_AND_PLAN.md §2.7): every list is gap-sm
   apart, every row has a 12px marker slot + gap-sm, every line under a row is one Meta line (footnote, muted). */
const LIST = "flex flex-col gap-sm";
/** Content under a row's line starts where its text starts: the marker slot and its gap. */
const INDENT = "ps-[calc(12px+var(--cds-gap-sm))]";

/** A neutral list marker for rows with no status, in the same 12px slot as the status dots. */
const Dot = () => <span className="block size-1 rounded-full bg-alpha-5" />;

/** One quiet line under a row: one size, one color. */
function Meta({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx("block text-footnote text-muted", className)}>{children}</span>;
}

/**
 * One row of the Result tab: the marker in a 12px slot, the line (Body), Meta lines under it 2px apart. A row that
 * opens something is a button with no underline: the plan's chevron shows on hover and turns when the row is open.
 */
function Row({ mark, meta, onClick, open, children }: { mark: ReactNode; meta?: ReactNode; onClick?: () => void; open?: boolean; children: ReactNode }) {
  const body = (
    <>
      <span className="mt-[5px] flex size-3 shrink-0 items-center justify-center">{mark}</span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        {children}
        {meta}
      </span>
    </>
  );
  if (!onClick) return <div className="flex items-start gap-sm">{body}</div>;
  return (
    <button
      type="button"
      aria-expanded={open}
      onClick={onClick}
      className="group/row flex w-full items-start gap-sm rounded-sm text-left outline-none focus-visible:shadow-focus cursor-[var(--cds-cursor-interactive)]"
    >
      {body}
      <Icon
        glyph={CHEVRON}
        size="sm"
        className={cx(
          "mt-[3px] shrink-0 !text-muted transition-[opacity,transform] duration-fast motion-reduce:transition-none",
          open ? "rotate-90" : "opacity-0 group-hover/row:opacity-100 group-focus-visible/row:opacity-100",
        )}
      />
    </button>
  );
}

/**
 * The acceptance review of a level 2–3 result: the Result and Diff tabs of the task pane beside the chat, next to
 * Plan and Brief. Proof first, the diff last. Where the agent's word ends and a check by someone else begins is
 * the point: only an outside source makes a claim proven. The decision is in the chat's dock; here the person
 * only ticks their own checks by hand.
 */
export function AcceptanceTab({
  view,
  acc,
  tab,
  onTab,
}: {
  view: ChatTaskView;
  acc: AcceptanceView;
  tab: "result" | "diff";
  /** Switches the task pane's tab: a link to a file opens Diff, one to a claim or criterion opens Result. */
  onTab: (t: "result" | "diff") => void;
}) {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [flash, setFlash] = useState<string | null>(null);
  const toggle = (id: string) => setOpen((s) => (s.has(id) ? new Set([...s].filter((x) => x !== id)) : new Set([...s, id])));

  // A link from the dock or the banner opens the pane at one row: the claim unfolds, the file's tab opens.
  useEffect(() => {
    const run = () => {
      const target = takeReveal();
      if (!target) return;
      const [kind, ...rest] = target.split(":");
      const id = rest.join(":");
      if (kind === "file") onTab("diff");
      else onTab("result");
      if (kind === "claim") setOpen((s) => new Set([...s, id]));
      window.setTimeout(() => {
        document.getElementById(`review-${kind}-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
        setFlash(`${kind}:${id}`);
        window.setTimeout(() => setFlash(null), 1200);
      }, 60);
    };
    run();
    window.addEventListener(REVEAL_EVENT, run);
    return () => window.removeEventListener(REVEAL_EVENT, run);
  }, [onTab]);

  const changed = acc.changedSince;
  const outsideNote = (file: string) => (acc.flags.some((f) => f.kind === "file-outside-brief" && f.ref === file) ? "outside the brief · read only" : undefined);
  const skipped = acc.tests.skippedOrDeleted.filter((t) => t.kind === "skipped").length;
  const deleted = acc.tests.skippedOrDeleted.length - skipped;
  // Which round this is, over both tabs: the pane's header is shared with the plan and the brief.
  // Accepted, the review stays to read, and says the task is done.
  const round = view.accepted
    ? `Round ${acc.iteration} · accepted · PR description ready`
    : view.sentBack
      ? `Round ${acc.iteration} · sent back · the agent is fixing it`
      : changed && `Round ${acc.iteration} · ${plural(changed.files.length, "file", "files")} changed since you last looked`;
  return (
    <div id="review-pane">
      {round && <p className="px-[var(--cds-gap-lg)] pt-xs text-body text-secondary">{round}</p>}
      {tab === "diff" ? (
        <div className={cx("flex flex-col gap-lg", PANE_BODY)}>
          {acc.files.map((f) => (
            <FileDiff
              key={f.name}
              id={`review-file-${f.name}`}
              file={f}
              note={outsideNote(f.name) ?? (changed?.files.includes(f.name) ? "changed since you last looked" : undefined)}
            />
          ))}
        </div>
      ) : (
        <div className={cx("flex flex-col gap-[var(--cds-gap-lg)]", PANE_BODY, CODE)}>
          {/* What the system found on its own, as rows like risky assumptions: the clay dot says "needs you", not a
              clay frame. Each row opens its file. */}
          {acc.flags.length > 0 && (
            <section className="flex flex-col gap-xs">
              <SectionTitle>Found {plural(acc.flags.length, "thing", "things")} the agent didn't mention</SectionTitle>
              <ul className="flex flex-col gap-xs">
                {acc.flags.map((f) => (
                  <li key={f.id}>
                    <FlagRow flag={f} onOpen={() => revealInReview(`file:${f.ref}`)} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* The brief's criteria with the same count as the brief: ring — not yet, dot — met with proof, a broken locked one in clay. */}
          <Section title="Done when" aside={`${acc.met} of ${acc.criteria.length} met`}>
            <ul className={LIST}>
              {acc.criteria.map((c) => {
                const brokenLocked = c.state === "broken" && c.locked;
                return (
                  <li key={c.id} id={`review-criterion-${c.id}`} className={cx("scroll-mt-md", flashClass(flash === `criterion:${c.id}`))}>
                    <Row
                      mark={<TaskDot state={c.state === "met" ? "done" : brokenLocked ? "blocked" : "ahead"} />}
                      meta={
                        c.state === "met" ? (
                          <Meta>{c.proof}</Meta>
                        ) : c.state === "broken" ? (
                          <Meta className={brokenLocked ? "!text-clay" : undefined}>
                            Broken: <Inline text={c.broken ?? ""} />
                          </Meta>
                        ) : undefined
                      }
                    >
                      {/* The lock sits right after its criterion, as in the brief. */}
                      <span className={cx("text-body", c.state === "met" ? "text-secondary" : "text-primary")}>
                        <Inline text={c.text} />
                        {c.locked && (
                          <Hint text="Locked: the agent can't loosen or skip this" className="ms-xs inline-flex align-[-2px] text-muted">
                            <Icon glyph={LOCK} size="sm" className="!text-muted" />
                          </Hint>
                        )}
                      </span>
                    </Row>
                  </li>
                );
              })}
            </ul>
          </Section>

          {/* Claims under the plan step they belong to, drawn as the plan draws steps: a dot on a rail, the title, the
              area as a Meta line; the step's claims nest under it, each with its proof as a Meta line. Riskiest area first. */}
          <Section
            title="Claims"
            aside={[
              acc.counts.verified && `${acc.counts.verified} proven`,
              acc.counts.claimed && `${acc.counts.claimed} only claimed`,
              acc.counts.contradicted && `${acc.counts.contradicted} contradicted`,
            ]
              .filter(Boolean)
              .join(" · ")}
          >
            <ol className="flex flex-col gap-md">
              {acc.groups.map((g) => {
                return (
                  // A step is a heading over its claims, no mark and no rail of its own: the only marks are the claims' statuses.
                  <li key={g.step.id} className="flex flex-col">
                    <div className="flex min-w-0 flex-1 flex-col gap-xs">
                      <div className="flex flex-col gap-0.5">
                        <h3 className="text-body text-primary">
                          <Inline text={g.step.title} />
                        </h3>
                        {g.zone && (
                          <Meta>
                            {g.zone}
                            {g.level === "high" && " · high risk"}
                          </Meta>
                        )}
                      </div>
                      <ul className={LIST}>
                        {g.claims.map((c) => {
                          const was = acc.was(c.id);
                          const isOpen = open.has(c.id);
                          return (
                            <li key={c.id} id={`review-claim-${c.id}`} className={cx("flex scroll-mt-md flex-col gap-xs", flashClass(flash === `claim:${c.id}`))}>
                              <Row
                                mark={<StatusMark status={c.status} />}
                                onClick={c.source ? () => toggle(c.id) : undefined}
                                open={isOpen}
                                meta={
                                  <>
                                    <Meta>
                                      <Inline text={proofText(c.status, c.source)} />
                                    </Meta>
                                    {was && <Meta>Was: {WAS[was]}</Meta>}
                                  </>
                                }
                              >
                                <span className="text-body text-primary">
                                  <Inline text={c.text} />
                                </span>
                              </Row>
                              {isOpen && c.source && (
                                <div className={cx(INDENT, "pb-xs")}>
                                  <Evidence source={c.source} />
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Section>

          {/* Totals in the title; the CI run that counted them opens its log in place; then which tests passed, file by
              file, with a skipped or deleted test under its file, crossed in clay: the system found it, it needs you. */}
          <Section
            title="Tests"
            aside={[`${acc.tests.passed} passed`, skipped && `${skipped} skipped`, deleted && `${deleted} deleted`, acc.tests.added && `${acc.tests.added} new`]
              .filter(Boolean)
              .join(" · ")}
          >
            <ul className={LIST}>
              {acc.tests.ci && (
                <li className="flex flex-col gap-xs">
                  <Row mark={<Dot />} onClick={() => toggle("tests-ci")} open={open.has("tests-ci")} meta={<Meta>Open the log</Meta>}>
                    <span className="text-body text-primary">{acc.tests.ci.label}</span>
                  </Row>
                  {open.has("tests-ci") && (
                    <div className={cx(INDENT, "pb-xs")}>
                      <Evidence source={acc.tests.ci} />
                    </div>
                  )}
                </li>
              )}
              {(acc.tests.byFile ?? []).map((f) => {
                const problems = acc.tests.skippedOrDeleted.filter((t) => t.file === f.file);
                const inDiff = acc.files.some((d) => d.name === f.file);
                return (
                  <li key={f.file} className="flex flex-col gap-xs">
                    <Row
                      mark={<StatusMark status={problems.length ? "contradicted" : "verified"} />}
                      onClick={inDiff ? () => revealInReview(`file:${f.file}`) : undefined}
                      meta={
                        <Meta>
                          {[f.added && "new", `${f.passed} passed`, f.skipped && `${f.skipped} skipped`, f.deleted && `${f.deleted} deleted`].filter(Boolean).join(" · ")}
                        </Meta>
                      }
                    >
                      <span className="font-mono text-footnote text-primary">{f.file}</span>
                    </Row>
                    {problems.map((t) => (
                      <div key={t.name} className={INDENT}>
                        <Row mark={<StatusMark status="contradicted" needsYou />} meta={<Meta>{t.kind === "skipped" ? "Skipped" : "Deleted"}</Meta>}>
                          <span className="text-body text-primary">{t.name}</span>
                        </Row>
                      </div>
                    ))}
                  </li>
                );
              })}
            </ul>
          </Section>

          {/* Honest about the gaps: no marks, nothing to tick. */}
          <Section title="Nobody checked">
            <ul className={LIST}>
              {acc.unverified.map((u) => (
                <li key={u}>
                  <Row mark={<Dot />}>
                    <span className="text-body text-secondary">
                      <Inline text={u} />
                    </span>
                  </Row>
                </li>
              ))}
            </ul>
          </Section>

          {/* The one place the person ticks things: their own checks, not the agent's. The 16px box sits centred in the 12px marker slot. */}
          <Section title="Check by hand" aside={`${acc.handChecks.length} of ${acc.manualChecks.length} checked`}>
            <ul className={LIST}>
              {acc.manualChecks.map((m) => {
                const done = acc.handChecks.includes(m.id);
                return (
                  <li key={m.id}>
                    <label className="flex items-start gap-sm cursor-[var(--cds-cursor-interactive)]">
                      <span className="mt-[5px] flex size-3 shrink-0 items-center justify-center">
                        <span className="relative flex size-4 shrink-0">
                          <input
                            type="checkbox"
                            checked={done}
                            onChange={() => toggleHandCheck(view.id, m.id)}
                            className="peer size-4 cursor-[var(--cds-cursor-interactive)] appearance-none rounded-sm border border-alpha-5 outline-none checked:border-transparent checked:bg-fill-primary focus-visible:shadow-focus"
                          />
                          {/* Only when ticked: Icon is inline-flex, which a `hidden` class does not reliably override. */}
                          {done && <Icon glyph={CHECK} size="sm" className="pointer-events-none absolute inset-0 m-auto !text-on-primary" />}
                        </span>
                      </span>
                      <span className={cx("min-w-0 text-body", done ? "text-secondary" : "text-primary")}>
                        <Inline text={m.text} />
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </Section>

          {/* One area per row: its name as the line, the count and the risk as Meta, in words. */}
          <Section title="Risk by area">
            <ul className={LIST}>
              {acc.riskZones.map((z) => (
                <li key={z.zone}>
                  <Row
                    mark={<Dot />}
                    meta={
                      <>
                        <Meta>
                          {plural(z.files, "file", "files")} · {z.outsideBrief ? "outside the brief" : `${z.level} risk`}
                        </Meta>
                        {/* Which files: each opens in the Diff tab. */}
                        {z.paths.map((path) => (
                          <button
                            key={path}
                            type="button"
                            onClick={() => revealInReview(`file:${path}`)}
                            className="w-fit rounded-sm text-left font-mono text-footnote text-muted outline-none hover:text-primary focus-visible:shadow-focus cursor-[var(--cds-cursor-interactive)]"
                          >
                            {path}
                          </button>
                        ))}
                      </>
                    }
                  >
                    <span className="text-body text-primary">{z.label}</span>
                  </Row>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Why I chose this">
            <ul className={LIST}>
              {acc.why.map((w) => (
                <li key={w}>
                  <Row mark={<Dot />}>
                    <span className="text-body text-secondary">
                      <Inline text={w} />
                    </span>
                  </Row>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-xs">
      <SectionTitle aside={aside}>{title}</SectionTitle>
      {children}
    </section>
  );
}
