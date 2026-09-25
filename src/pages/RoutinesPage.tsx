import { useState } from "react";
import { Button, CardGrid, EmptyState, ListCard, PageHeader, StopwatchIllustration, Tabs, WavyDivider } from "../ui";

// Anthropicons codepoints (see /tokens#icons)
const I = {
  search: "",
  filter: "",
  sort: "",
  chevronDown: "",
  clock: "",
  pullRequest: "",
  sun: "",
  mailbox: "",
  chart: "",
  checklist: "",
  shield: "",
  scroll: "",
  flask: "",
};

type Template = { icon: string; title: string; description: string; metaIcon: string; meta: string };

const TEMPLATES: Template[] = [
  { icon: I.sun, title: "Briefing", description: "Summary of your calendar, emails, and messages.", metaIcon: I.clock, meta: "Weekdays at 2:18 PM" },
  { icon: I.mailbox, title: "Email triage", description: "Categorize and prioritize your inbox, with draft responses for urgent items.", metaIcon: I.clock, meta: "Weekdays at 4:52 PM" },
  { icon: I.chart, title: "System health check", description: "Monitor infrastructure and services for errors, outages, and performance issues.", metaIcon: I.clock, meta: "Daily at 1:47 PM" },
  { icon: I.checklist, title: "Issue triage", description: "Review and categorize incoming issues, bugs, and feature requests.", metaIcon: I.clock, meta: "Weekdays at 5:23 PM" },
  { icon: I.pullRequest, title: "PR review digest", description: "Overview of open PRs, review status, and what needs attention.", metaIcon: I.clock, meta: "Weekdays at 7:49 PM" },
  { icon: I.shield, title: "Dependency update check", description: "Scan for outdated packages, security patches, and breaking changes.", metaIcon: I.clock, meta: "Every Monday at 8:16 PM" },
  { icon: I.scroll, title: "Release notes drafter", description: "Draft user-facing release notes each time a PR merges to the main branch.", metaIcon: I.pullRequest, meta: "Triggered by pull request closed" },
  { icon: I.flask, title: "Flaky test tracker", description: "Find tests that pass and fail intermittently across recent CI runs.", metaIcon: I.clock, meta: "Every Monday at 5:54 PM" },
];

type Tab = "yours" | "templates";

export function RoutinesPage() {
  const [tab, setTab] = useState<Tab>("yours");

  const templates = (
    <CardGrid>
      {TEMPLATES.map((t) => (
        <ListCard key={t.title} {...t} />
      ))}
    </CardGrid>
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex w-full max-w-[800px] flex-col gap-lg px-xl pt-[52px] pb-xl">
        <PageHeader
          title="Routines"
          tabs={
            <Tabs<Tab>
              label="Routines"
              value={tab}
              onChange={setTab}
              items={[
                { value: "yours", label: "Yours" },
                { value: "templates", label: "Templates" },
              ]}
            />
          }
          actions={
            <>
              <Button size="sm" icon={I.search} aria-label="Search" />
              <Button size="sm" icon={I.filter} aria-label="Filter" />
              <Button size="sm" icon={I.sort} aria-label="Sort" />
              <Button size="sm" variant="primary" trailingIcon={I.chevronDown} className="ms-1.5" aria-haspopup="menu">
                New routine
              </Button>
            </>
          }
        />

        {tab === "yours" ? (
          <>
            <EmptyState illustration={<StopwatchIllustration />}>No routines yet.</EmptyState>
            <WavyDivider />
            {templates}
          </>
        ) : (
          templates
        )}
      </div>
    </div>
  );
}
