import type { Review, ReviewTab } from "../data/task";
import type { ChatTaskView } from "../data/chatTaskStore";
import { Tabs } from "../ui";
import { SidePane } from "./SidePane";
import { StatusMark } from "./StatusMark";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

const TABS: { value: ReviewTab; label: string }[] = [
  { value: "changes", label: "Changes" },
  { value: "screens", label: "Screenshots" },
  { value: "checks", label: "Checks" },
];

/** A file of the change as a unified diff: git colors on the changed lines, as in chats. */
function FileDiff({ file }: { file: Review["files"][number] }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg" style={{ boxShadow: "inset 0 0 0 1px var(--cds-alpha-2)" }}>
      <div className="flex items-center gap-sm border-b border-alpha-2 px-md py-xs font-mono text-footnote">
        <span className="min-w-0 flex-1 truncate text-secondary">{file.name}</span>
        <span className="text-git-added">+{file.added}</span>
        <span className="text-git-removed">−{file.removed}</span>
      </div>
      <pre className="overflow-x-auto py-xs font-mono text-code">
        {file.lines.map((l, i) => {
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
    </div>
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
                  <StatusMark status="done" />
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
