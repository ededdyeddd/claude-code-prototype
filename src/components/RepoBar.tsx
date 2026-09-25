import type { Session } from "../data/sessions";
import { Button, Icon } from "../ui";

const CHEVRON_DOWN = "";
const CLOSE = "";

const fmt = (n: number) => n.toLocaleString("en-US");

/** Bar above the composer in a chat with content: repo, branch, diff stats, Create PR. */
export function RepoBar({ repo }: { repo: NonNullable<Session["repo"]> }) {
  return (
    <div className="mb-xs flex h-[var(--cds-h-control--lg)] items-center gap-sm rounded-lg bg-alpha-1 ps-md pe-xs text-body">
      <span className="text-secondary">{repo.name}</span>
      <span className="text-muted">{repo.branch}</span>
      <span className="ms-auto flex items-center gap-1.5 rounded-sm bg-alpha-1 px-1.5 font-mono text-footnote leading-5">
        <span className="text-git-added">+{fmt(repo.added)}</span>
        <span className="text-git-removed">−{fmt(repo.removed)}</span>
      </span>
      <div data-cds="SplitDropdownButton" className="flex items-center">
        <span data-cds-segment="">
          <Button size="xs" variant="secondary">
            Create PR
          </Button>
        </span>
        <span data-cds-segment="" className="border-s border-alpha-2">
          <Button size="xs" variant="secondary" aria-haspopup="menu" aria-label="More PR options" className="!w-auto px-1">
            <Icon glyph={CHEVRON_DOWN} size="sm" className="!text-current" />
          </Button>
        </span>
      </div>
      <Button size="xs" icon={CLOSE} aria-label="Dismiss" />
    </div>
  );
}
