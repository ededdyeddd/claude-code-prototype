import { ResizeHandle } from "./ResizeHandle";
import { IconButton } from "./IconButton";
import { ClaudeCodeLogo } from "./ClaudeCodeLogo";
import { SegmentedControlThumb } from "./SegmentedControlThumb";
import { ModeRadio } from "./ModeRadio";
import { HiddenRadio } from "./HiddenRadio";
import { SearchField } from "./SearchField";
import { NewNavigationRow } from "./NewNavigationRow";
import { NavigationRow } from "./NavigationRow";
import { MoreNavigationButton } from "./MoreNavigationButton";
import { Spacer } from "./Spacer";
import { Contents } from "./Contents";
import { UserMenuButton } from "./UserMenuButton";
import { BudgetLine } from "./BudgetLine";
import { NavigationEntry } from "./NavigationEntry";
import { SidebarContents } from "./SidebarContents";
import { useInbox } from "../data/inboxStore";

export function Sidebar(resize: { width: number; min: number; max: number; defaultWidth: number; onResize: (w: number) => void }) {
  // The counter is what is urgent: blocked tasks and results that cannot be accepted.
  const { blocked, urgentReview } = useInbox();
  return (
    <aside className="dframe-sidebar df-hub-rail" data-variant="web" data-density="comfortable">
      <ResizeHandle {...resize} />
      <div className="df-titlebar draggable h-11 shrink-0 flex items-center px-2">
        <div className="draggable-none static-composer-boot-fade flex shrink-0 justify-center w-[32px]">
          <div className="df-sidebar-hover-reveal flex">
            <IconButton dataId="0" />
          </div>
        </div>
        <div
          data-wordmark-size="20"
          className="df-titlebar-brand-col draggable-none ml-2 flex min-w-0 flex-col items-start"
        >
          <div className="df-titlebar-brand -m-1 flex min-w-0 items-center gap-1.5 self-stretch p-1 [overflow:clip]">
            <ClaudeCodeLogo />
          </div>
        </div>
        <div className="draggable-none static-composer-boot-fade ml-auto flex items-center df-titlebar-switch">
          <div className="df-app-switch flex">
            <div
              role="radiogroup"
              data-cds="SegmentedControl"
              data-size="sm"
              className="relative inline-flex w-fit shrink-0 items-stretch h-control font-sans rounded bg-[var(--cds-segmented-control-track)] p-px"
            >
              <SegmentedControlThumb />
              <ModeRadio id="base-ui-_r_c_" mode="cowork" checked={false} />
              <HiddenRadio id="_r_9_" value="cowork" />
              <ModeRadio id="base-ui-_r_i_" mode="code" checked={true} />
              <HiddenRadio id="_r_f_" value="code" checked={true} />
            </div>
          </div>
        </div>
      </div>
      <div
        id="frame-peek-popover"
        data-testid="sidebar"
        className="dframe-sidebar-body flex flex-col flex-1 min-h-0 gap-2 px-2 pt-3 pb-1.5 [overflow:clip]"
      >
        <div
          className="static-composer-boot-fade flex flex-col flex-1 min-h-0"
          style={{
            "--df-nav-scrollbar-lane": "11px",
          }}
        >
          <div className="shrink-0 pr-[max(0px,calc(var(--df-nav-scrollbar-lane,0px)-8px))]">
            <div className="mb-2">
              <SearchField />
            </div>
            <div className="contents">
              <NewNavigationRow />
            </div>
            <div className="h-1 shrink-0" />
          </div>
          <div className="dframe-nav-scroll relative flex flex-col flex-1 min-h-0 overflow-y-auto overflow-x-hidden pl-1 pt-1 pb-2 -ml-1 -mt-1 -mr-2 pr-[max(0px,calc(8px-var(--df-nav-scrollbar-lane,0px)))] [scrollbar-gutter:stable]">
            <div data-testid="nav-pin-rows" className="-mt-1">
              <NavigationRow label="Up next" icon={"\uE0C9"} variant="standard" to="/up-next" count={blocked.length + urgentReview.length} coach="nav-up-next" />
              <NavigationEntry />
              <NavigationRow label="Routines" icon="" variant="standard" to="/routines" />
              <NavigationRow label="Customize" icon="" variant="standard" />
              <MoreNavigationButton />
              <Spacer />
            </div>
            <div className="dframe-recents-by-mode contents" data-mode="code">
              <Contents cowork={true} />
              <SidebarContents />
            </div>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-0" />
          </div>
        </div>
        <div className="static-composer-boot-fade df-bottom-tray shrink-0">
          <BudgetLine />
          <div className="df-footer-row shrink-0 flex items-center gap-[var(--df-footer-gap)]">
            <div className="min-w-0 flex-1">
              <UserMenuButton />
            </div>
            <div className="df-footer-aux ml-auto flex shrink-0 items-center">
              <span tabIndex={0} className="inline-flex" id="_r_cg_">
                <IconButton dataId="5" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
