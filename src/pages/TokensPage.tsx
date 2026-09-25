import { useLayoutEffect, useMemo, useRef, useState } from "react";
import catalog from "../design-system/tokens.json";
import { Button } from "../ui";

type Token = { name: string; dark: string; light: string; compact: string };
type Group = { id: string; title: string; kind: string; note: string | null; tokens: Token[] };

const groups = catalog.groups as Group[];
const utilities = catalog.utilities as Record<string, string[]>;

type Mode = "dark" | "light";
type Density = "comfortable" | "compact";

function Segmented<T extends string>({ value, options, onChange }: { value: T; options: T[]; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex rounded-[var(--cds-radius)] bg-alpha-1 p-[2px] gap-[2px]">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className="h-[calc(var(--cds-h-control--sm)-4px)] px-sm rounded-[calc(var(--cds-radius)-2px)] text-body capitalize transition-colors"
          style={{
            background: value === o ? "var(--cds-fill-ghost-selected)" : "transparent",
            color: value === o ? "var(--cds-text-primary)" : "var(--cds-text-muted)",
            transitionDuration: "var(--cds-dur-fast)",
          }}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function Preview({ kind, name }: { kind: string; name: string }) {
  const v = `var(${name})`;
  const short = name.replace("--cds-", "");
  if (kind === "color")
    return (
      <span
        className="block size-[36px] shrink-0 rounded-[var(--cds-radius--sm)]"
        style={{ background: v, boxShadow: "inset 0 0 0 1px var(--cds-alpha-2)" }}
      />
    );
  if (kind === "font") return <span style={{ fontFamily: v, fontSize: "var(--cds-font-size-title)" }}>Aa</span>;
  if (kind === "shadow")
    return (
      <span
        className="block h-[36px] w-[56px] shrink-0 rounded-[var(--cds-radius)] bg-surface-3"
        style={{ boxShadow: v }}
      />
    );
  if (kind === "size") {
    if (short.startsWith("font-size")) return <span style={{ fontSize: v, lineHeight: 1 }}>Aa</span>;
    if (short.startsWith("radius"))
      return (
        <span
          className="block size-[36px] shrink-0 border border-strong"
          style={{ borderRadius: v, borderTopColor: "var(--cds-fill-accent)", borderRightColor: "var(--cds-fill-accent)" }}
        />
      );
    return <span className="block h-[8px] rounded-full bg-fill-accent" style={{ width: v, minWidth: 2 }} />;
  }
  if (kind === "motion")
    return <span className="block size-[10px] rounded-full bg-clay token-motion-dot" style={{ ["--dot-t" as string]: v }} />;
  return null;
}

const ICON_FONT = '"Anthropicons-Variable"';

// Scan the private-use range and keep codepoints the icon font actually has a glyph for.
function useIconGlyphs() {
  const [glyphs, setGlyphs] = useState<number[]>([]);
  useLayoutEffect(() => {
    let cancelled = false;
    document.fonts.load(`16px ${ICON_FONT}`, "\ue001").then(() => {
      // A codepoint counts as an icon if drawing it with the icon font puts ink on the canvas.
      const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
      ctx.canvas.width = ctx.canvas.height = 24;
      const found: number[] = [];
      for (let cp = 0xe000; cp <= 0xe3ff; cp++) {
        ctx.clearRect(0, 0, 24, 24);
        ctx.font = `20px ${ICON_FONT}`;
        ctx.textBaseline = "top";
        ctx.fillText(String.fromCodePoint(cp), 0, 0);
        const px = ctx.getImageData(0, 0, 24, 24).data;
        for (let i = 3; i < px.length; i += 4)
          if (px[i]) {
            found.push(cp);
            break;
          }
      }
      if (!cancelled) setGlyphs(found);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return glyphs;
}

function IconGallery({ query }: { query: string }) {
  const glyphs = useIconGlyphs();
  const [copied, setCopied] = useState<number | null>(null);
  const hex = (cp: number) => cp.toString(16).toUpperCase();
  const q = query.trim().toLowerCase().replace(/^u\+|^\\u/, "");
  const shown = q ? glyphs.filter((cp) => hex(cp).toLowerCase().includes(q)) : glyphs;
  return (
    <section id="icons" className="mb-xl scroll-mt-[96px]">
      <h2 className="text-primary" style={{ fontSize: "var(--cds-font-size-heading)", fontWeight: "var(--cds-font-weight-semibold)" }}>
        Icons (Anthropicons)
      </h2>
      <p className="mt-xs text-muted">
        {glyphs.length} glyphs in the icon font. Render as{" "}
        <code className="font-mono">{'<span data-cds="Icon">{"\\uE001"}</span>'}</code>. Click to copy the codepoint.
      </p>
      <div className="mt-sm grid gap-xs" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))" }}>
        {shown.map((cp) => (
          <button
            key={cp}
            type="button"
            title={`U+${hex(cp)}`}
            onClick={() => {
              navigator.clipboard?.writeText(`\\u${hex(cp)}`);
              setCopied(cp);
              setTimeout(() => setCopied(null), 900);
            }}
            className="flex flex-col items-center gap-[2px] rounded-[var(--cds-radius)] py-sm hover:bg-alpha-1 transition-colors"
            style={{ transitionDuration: "var(--cds-dur-fast)" }}
          >
            <span data-cds="Icon" className="text-primary" style={{ fontFamily: ICON_FONT, fontSize: 20, lineHeight: "24px" }}>
              {String.fromCodePoint(cp)}
            </span>
            <span className="font-mono text-muted" style={{ fontSize: "var(--cds-font-size-caption)" }}>
              {copied === cp ? "copied" : hex(cp)}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function ComponentsDemo() {
  const variants = ["ghost", "secondary", "primary", "accent", "danger"] as const;
  const sizes = ["xs", "sm", "md", "lg"] as const;
  return (
    <section id="components" className="mb-xl scroll-mt-[96px]">
      <h2 className="text-primary" style={{ fontSize: "var(--cds-font-size-heading)", fontWeight: "var(--cds-font-weight-semibold)" }}>
        Components
      </h2>
      <p className="mt-xs text-muted">
        Primitives from <code className="font-mono">src/ui</code>. Hover them: every color comes from a token.
      </p>
      <div className="mt-md flex flex-col gap-sm">
        {variants.map((v) => (
          <div key={v} className="flex flex-wrap items-center gap-sm">
            <span className="w-[88px] font-mono text-muted" style={{ fontSize: "var(--cds-font-size-caption)" }}>
              {v}
            </span>
            {sizes.map((s) => (
              <Button key={s} variant={v} size={s} icon={"\uE001"}>
                {`Button ${s}`}
              </Button>
            ))}
            <Button variant={v} icon={"\uE0D3"} aria-label="Search" />
            <Button variant={v} disabled>
              Disabled
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}

function TokenRow({ token, kind, value }: { token: Token; kind: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(`var(${token.name})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 900);
  };
  return (
    <button
      type="button"
      onClick={copy}
      title="Copy var()"
      className="group flex w-full items-center gap-md rounded-[var(--cds-radius)] px-sm py-xs text-left hover:bg-alpha-1 transition-colors"
      style={{ transitionDuration: "var(--cds-dur-fast)" }}
    >
      <span className="flex w-[64px] shrink-0 items-center justify-center">
        <Preview kind={kind} name={token.name} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-mono text-primary" style={{ fontSize: "var(--cds-font-size-code)" }}>
          {copied ? "Copied var()" : token.name}
        </span>
        <span className="block truncate font-mono text-muted" style={{ fontSize: "var(--cds-font-size-caption)" }}>
          {value || "—"}
        </span>
      </span>
    </button>
  );
}

export function TokensPage() {
  const [mode, setMode] = useState<Mode>("dark");
  const [density, setDensity] = useState<Density>("comfortable");
  const [query, setQuery] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const rootRef = useRef<HTMLDivElement>(null);

  // Read live computed values so the list always matches the current mode/density.
  useLayoutEffect(() => {
    const cs = getComputedStyle(rootRef.current!);
    const next: Record<string, string> = {};
    for (const g of groups) for (const t of g.tokens) next[t.name] = cs.getPropertyValue(t.name).trim();
    setValues(next);
  }, [mode, density]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groups
      .map((g) => ({ ...g, tokens: q ? g.tokens.filter((t) => t.name.includes(q)) : g.tokens }))
      .filter((g) => g.tokens.length);
  }, [query]);

  const total = groups.reduce((n, g) => n + g.tokens.length, 0);

  return (
    <div
      ref={rootRef}
      className="cds-root fixed inset-0 overflow-y-auto bg-surface-1 text-primary font-sans"
      data-mode={mode}
      data-density={density}
      data-font="anthropic"
      style={{ fontSize: "var(--cds-font-size-body)", "--cds-page-bg": "var(--cds-surface-1)" }}
    >
      <style>{`
        .token-motion-dot { transition: transform var(--dot-t) var(--cds-ease-out); }
        button:hover .token-motion-dot { transform: translateX(20px); }
      `}</style>

      <header className="sticky top-0 z-[10] border-b border-alpha-2 bg-surface-1/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-md px-lg py-md">
          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-primary" style={{ fontSize: "var(--cds-font-size-title)", lineHeight: "var(--cds-leading-title)" }}>
              Design tokens
            </h1>
            <p className="text-muted">
              {total} <code className="font-mono">--cds-*</code> tokens · click a row to copy its <code className="font-mono">var()</code>
            </p>
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter tokens…"
            className="h-control w-[220px] rounded-[var(--cds-radius)] bg-fill-field px-md text-primary outline-none placeholder:text-muted focus-visible:shadow-focus"
            style={{ boxShadow: "inset 0 0 0 1px var(--cds-fill-field-ring)" }}
          />
          <Segmented<Mode> value={mode} options={["dark", "light"]} onChange={setMode} />
          <Segmented<Density> value={density} options={["comfortable", "compact"]} onChange={setDensity} />
        </div>
      </header>

      <div className="mx-auto flex max-w-[1200px] gap-xl px-lg py-lg">
        <nav className="sticky top-[88px] hidden h-[calc(100vh-110px)] w-[200px] shrink-0 overflow-y-auto md:block">
          <a href="#components" className="block rounded-[var(--cds-radius--sm)] px-sm py-[3px] text-secondary hover:bg-alpha-1 hover:text-primary">
            Components
          </a>
          {filtered.map((g) => (
            <a
              key={g.id}
              href={`#${g.id}`}
              className="flex items-center justify-between rounded-[var(--cds-radius--sm)] px-sm py-[3px] text-secondary hover:bg-alpha-1 hover:text-primary"
            >
              <span className="truncate">{g.title}</span>
              <span className="text-muted" style={{ fontSize: "var(--cds-font-size-caption)" }}>
                {g.tokens.length}
              </span>
            </a>
          ))}
          <a href="#icons" className="block rounded-[var(--cds-radius--sm)] px-sm py-[3px] text-secondary hover:bg-alpha-1 hover:text-primary">
            Icons
          </a>
          <a href="#utilities" className="block rounded-[var(--cds-radius--sm)] px-sm py-[3px] text-secondary hover:bg-alpha-1 hover:text-primary">
            Utility classes
          </a>
        </nav>

        <main className="min-w-0 flex-1">
          {!query && <ComponentsDemo />}
          {filtered.map((g) => (
            <section key={g.id} id={g.id} className="mb-xl scroll-mt-[96px]">
              <h2 className="text-primary" style={{ fontSize: "var(--cds-font-size-heading)", fontWeight: "var(--cds-font-weight-semibold)" }}>
                {g.title}
              </h2>
              {g.note && <p className="mt-xs text-muted">{g.note}</p>}
              <div className="mt-sm grid gap-x-md" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
                {g.tokens.map((t) => (
                  <TokenRow key={t.name} token={t} kind={g.kind} value={values[t.name]} />
                ))}
              </div>
            </section>
          ))}

          <IconGallery query={query} />

          <section id="utilities" className="mb-xl scroll-mt-[96px]">
            <h2 className="text-primary" style={{ fontSize: "var(--cds-font-size-heading)", fontWeight: "var(--cds-font-weight-semibold)" }}>
              Utility classes
            </h2>
            <p className="mt-xs text-muted">
              Classes already compiled into the stylesheet that map to a token. Only classes that already exist in the CSS work.
            </p>
            {Object.entries(utilities).map(([fam, list]) => (
              <div key={fam} className="mt-md">
                <div className="text-secondary" style={{ fontWeight: "var(--cds-font-weight-medium)" }}>
                  {fam} <span className="text-muted">({list.length})</span>
                </div>
                <div className="mt-xs flex flex-wrap gap-xs">
                  {list
                    .filter((c) => !query || c.includes(query.trim().toLowerCase()))
                    .map((c) => (
                      <code key={c} className="rounded-[var(--cds-radius--xs)] bg-alpha-1 px-xs font-mono text-secondary" style={{ fontSize: "var(--cds-font-size-caption)" }}>
                        {c}
                      </code>
                    ))}
                </div>
              </div>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}
