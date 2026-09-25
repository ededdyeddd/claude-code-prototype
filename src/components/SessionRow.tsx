import { Icon } from "../ui";
const PR_ICON = "\uE07A";
const PR_COLOR = { open: "var(--cds-text-git-opened)", merged: "var(--cds-text-git-merged)", draft: "var(--cds-text-git-draft)" };

export function SessionRow({
  title,
  running = false,
  pr,
  selected = false,
  onClick,
}: {
  title: string;
  running?: boolean;
  pr?: "open" | "merged" | "draft";
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
      }}
      {...(selected ? { "data-selected": "focused" } : {})}
      draggable="false"
      className="w-full shrink-0 border-none text-left text-[length:var(--df-row-font)] text-secondary flex pl-[calc(var(--df-row-px)+var(--df-row-indent,0px))] pr-[var(--df-row-px)] items-center gap-[var(--df-row-gap)] h-[var(--df-row-h)] hide-focus-ring focus-visible:shadow-[inset_0_0_0_1px_var(--cds-fill-accent),0_0_6px_0_color-mix(in_srgb,var(--cds-fill-accent)_20%,transparent)] rounded-[var(--df-radius-pill)] data-[selected=focused]:text-primary touch:group-data-[touch-menu]:pr-[calc(var(--df-row-px)+var(--df-row-ctl)+4px)]"
    >
      <span className="df-leading-slot text-secondary">
        <span role="img" className="flex min-h-3.5 min-w-3.5 shrink-0 items-center justify-center">
          {running ? (
            <span className="block size-[6px] rounded-full bg-clay" />
          ) : (
            <span className="block size-[6px] rounded-full border border-current text-muted opacity-50" />
          )}
        </span>
      </span>
      <span className="flex-1 min-w-0">
        <span
          className="dframe-fade-label block w-full min-w-0 whitespace-nowrap overflow-hidden group-hover:[mask-image:linear-gradient(to_right,black_calc(100%_-_44px),transparent_calc(100%_-_20px))] group-focus-visible:[mask-image:linear-gradient(to_right,black_calc(100%_-_44px),transparent_calc(100%_-_20px))] group-has-[:focus-visible]:[mask-image:linear-gradient(to_right,black_calc(100%_-_44px),transparent_calc(100%_-_20px))] group-data-[menu-open=true]:[mask-image:linear-gradient(to_right,black_calc(100%_-_44px),transparent_calc(100%_-_20px))]"
         
        >
          <span className="inline-block whitespace-nowrap align-top">{title}</span>
        </span>
      </span>
      {pr && (
        <span title={`PR ${pr}`} className="flex shrink-0">
          <Icon glyph={PR_ICON} size="sm" style={{ color: PR_COLOR[pr] }} />
        </span>
      )}
    </a>
  );
}
