import { useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SectionLabel } from "./SectionLabel";
import { SessionEntry } from "./SessionEntry";
import { buildGroups, DEFAULT_FILTERS, SESSIONS } from "../data/sessions";
import { taskState, useInbox } from "../data/inboxStore";
import type { NavFilters, NavGroup } from "../data/sessions";
import { Button, Menu, MenuCheckboxItem, MenuSelectItem, MenuSeparator } from "../ui";

const PLUS = "";
const FILTER = "";

/** Header row of a group; same markup/classes as the original "Recents" label row. */
function GroupHeader({
  label,
  collapsed,
  onToggle,
  actions,
  compact = false,
}: {
  label: string;
  collapsed: boolean;
  /** Follows a collapsed group: drop the section gap so collapsed groups stack like rows. */
  compact?: boolean;
  onToggle: () => void;
  actions?: ReactNode;
}) {
  return (
    <div
      className={
        "group/labelrow df-label-inset flex w-full items-center gap-[var(--df-row-gap)] pr-[calc((var(--df-row-h)-24px)/2)] pb-1 text-[length:var(--df-group-font)] leading-4 text-muted " +
        (compact
          ? "pt-1 min-h-[var(--df-row-h)]"
          : "pt-[var(--df-group-pt)] min-h-[calc(var(--df-group-pt)+(var(--df-row-h)-8px)+4px)]")
      }
    >
      <SectionLabel label={label} collapsed={collapsed} onClick={onToggle} />
      {actions && <div className="flex items-center gap-1">{actions}</div>}
    </div>
  );
}

/** Filter / grouping menu opened from the top group header. */
function NavFilterButton({
  filters,
  onChange,
  open,
  setOpen,
}: {
  filters: NavFilters;
  onChange: (f: NavFilters) => void;
  // Open state lives in ProjectNav: the button moves when the top group changes, the menu must stay open.
  open: boolean;
  setOpen: (v: boolean | ((o: boolean) => boolean)) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const set = <K extends keyof NavFilters>(k: K, v: NavFilters[K]) => onChange({ ...filters, [k]: v });
  return (
    <>
      <Button
        ref={ref}
        size="xs"
        icon={FILTER}
        aria-label="Filter and group chats"
        aria-haspopup="menu"
        aria-expanded={open}
        className={open ? "bg-alpha-2 rounded" : undefined}
        onClick={() => setOpen((o) => !o)}
      />
      <Menu anchor={ref} open={open} onClose={() => setOpen(false)} placement="bottom-end" minWidth={196}>
        <MenuSelectItem
          label="Status"
          value={filters.status}
          onChange={(v) => set("status", v)}
          options={[
            { value: "active", label: "Active" },
            { value: "archived", label: "Archived" },
            { value: "all", label: "All" },
          ]}
        />
        <MenuSelectItem
          label="Environment"
          value={filters.env}
          onChange={(v) => set("env", v)}
          options={[
            { value: "all", label: "All" },
            { value: "local", label: "Local" },
            { value: "cloud", label: "Cloud" },
          ]}
        />
        <MenuSeparator />
        <MenuSelectItem
          label="Group by"
          value={filters.groupBy}
          onChange={(v) => set("groupBy", v)}
          options={[
            { value: "folder", label: "Folder" },
            { value: "none", label: "None" },
          ]}
        />
        <MenuSelectItem
          label="Sort by"
          value={filters.sortBy}
          onChange={(v) => set("sortBy", v)}
          options={[
            { value: "activity", label: "Last activity" },
            { value: "created", label: "Created" },
            { value: "title", label: "Title" },
          ]}
        />
        <MenuSeparator />
        <MenuCheckboxItem checked={filters.showEmptyGroups} onChange={(v) => set("showEmptyGroups", v)}>
          Show empty groups
        </MenuCheckboxItem>
      </Menu>
    </>
  );
}

/** Sidebar chat list grouped by project, with a "+" CTA per project and filters on the top group. */
export function ProjectNav() {
  const [filters, setFilters] = useState<NavFilters>(DEFAULT_FILTERS);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [hovered, setHovered] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const groups = useMemo(() => buildGroups(SESSIONS, filters), [filters]);
  const needs = useInbox();

  const canCreate = (g: NavGroup) => g.kind === "project" || g.kind === "none";

  return (
    <div className="flex flex-col">
      {groups.map((g, i) => {
        const isCollapsed = !!collapsed[g.key];
        // A collapsed project still signals: one clay dot if a task inside is blocked on you, however many.
        const blockedInside = isCollapsed && g.sessions.some((sess) => taskState(sess.id, needs)?.waiting === "blocked");
        // The dot holds the actions' place until the header is hovered, like the dot on the Inbox row.
        const showDot = blockedInside && hovered !== g.key;
        const afterCollapsed = i > 0 && !!collapsed[groups[i - 1].key];
        return (
          <div
            key={g.key}
            // design-system.css adds a 10px gap between sections; the header's top padding is enough.
            className="group/section flex flex-col gap-px mt-0!"
            {...(hovered === g.key ? { "data-hover-within": "" } : {})}
            onMouseEnter={() => setHovered(g.key)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="df-drag-shiftable">
              <GroupHeader
                label={g.label}
                collapsed={isCollapsed}
                compact={afterCollapsed}
                onToggle={() => setCollapsed((c) => ({ ...c, [g.key]: !isCollapsed }))}
                actions={
                  showDot ? (
                    // Centered in a box the size of the "+" button, so the dot sits in the same column as the "+" icons.
                    <span role="img" aria-label="A task here is waiting for you" className="flex size-[var(--cds-h-control--xs)] shrink-0 items-center justify-center">
                      <span className="size-[6px] rounded-full bg-clay" />
                    </span>
                  ) : (
                    <>
                      {canCreate(g) && (
                        <Button size="xs" icon={PLUS} aria-label={`New chat in ${g.label}`} onClick={() => navigate("/code")} />
                      )}
                      {i === 0 && <NavFilterButton filters={filters} onChange={setFilters} open={filterOpen} setOpen={setFilterOpen} />}
                    </>
                  )
                }
              />
            </div>
            {!isCollapsed &&
              g.sessions.map((s) => (
                <SessionEntry
                  key={s.id}
                  title={s.title}
                  running={taskState(s.id, needs)?.running ?? s.running}
                  waiting={taskState(s.id, needs)?.waiting}
                  selected={pathname === `/code/${s.id}`}
                  onOpen={() => navigate(`/code/${s.id}`)}
                />
              ))}
            {!isCollapsed && g.sessions.length === 0 && (
              <div className="px-[var(--df-row-px)] h-[var(--df-row-h)] flex items-center text-[length:var(--df-row-font)] text-muted opacity-70">
                No chats
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
