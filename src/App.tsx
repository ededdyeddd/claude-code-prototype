import { useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { EmptyContainer } from "./components/EmptyContainer";
import { NotificationRegion } from "./components/NotificationRegion";
import { Sidebar } from "./components/Sidebar";
import { ChatShell } from "./components/ChatShell";
import { TokensPage } from "./pages/TokensPage";
import { RoutinesPage } from "./pages/RoutinesPage";
import { InboxPage } from "./pages/InboxPage";
import { TRANSCRIPTS } from "./data/transcripts";
import { SESSIONS } from "./data/sessions";
import { usePersistentWidth } from "./data/usePersistentWidth";
import { taskState, useInbox } from "./data/inboxStore";
import { announced, introSeen, markAnnounced, useOnboarding } from "./data/onboarding";
import { ONBOARDING_DELAY, useDelay } from "./data/useDelay";
import { Coachmarks, type Coachmark } from "./components/Coachmarks";

/** Router basename: "" locally, "/<repo>" on GitHub Pages. */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");


// Onboarding, step one: a hint on the sidebar item, not a modal. The explanation is Up next's own (intro, then tour).
const ANNOUNCE_STEPS: Coachmark[] = [
  {
    target: "nav-up-next",
    title: "New: Up next",
    body: "Which task to go to first: where an agent waits for you, what it needs and what it costs.",
    sides: ["right", "bottom"],
    action: { label: "Take a look", onClick: () => {} },
  },
];

/**
 * The app opens where it always does, and a moment later points at the new section in the sidebar.
 * "Take a look" opens Up next, where its intro and tour take over; "Not now" leaves them for when the person opens it.
 */
function UpNextAnnouncement() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  useOnboarding();
  const show = useDelay(!announced() && !introSeen() && !pathname.startsWith("/up-next"), ONBOARDING_DELAY);
  const steps = useMemo(() => [{ ...ANNOUNCE_STEPS[0], action: { label: "Take a look", onClick: () => navigate("/up-next") } }], [navigate]);
  if (!show) return null;
  return <Coachmarks steps={steps} onDone={markAnnounced} skipLabel="Not now" />;
}

/** Content of the main pane: switches with the sidebar navigation. */
function MainContent() {
  const { pathname, search } = useLocation();
  // Hooks before the early returns: the page switches on every navigation.
  const needs = useInbox();
  if (pathname.startsWith("/routines")) return <RoutinesPage />;
  // "Up next" was "Inbox": old links (with ?task=) still land on it.
  if (pathname.startsWith("/inbox")) return <Navigate to={`/up-next${search}`} replace />;
  if (pathname.startsWith("/up-next")) return <InboxPage />;
  const chatId = pathname.match(/^\/code\/([^/]+)/)?.[1];
  const session = SESSIONS.find((s) => s.id === chatId);
  // Task chats follow "Up next": blocked means the agent is not working right now, unless other steps run in parallel.
  const live = session && taskState(session.id, needs);
  const chat = session && live ? { ...session, running: live.running } : session;
  return <ChatShell name="Stranger" chat={chat} transcript={chatId ? TRANSCRIPTS[chatId] : undefined} />;
}

const SIDEBAR = { default: 288, min: 256, max: 480 };

export function AppContent() {
  const [sidebarWidth, setSidebarWidth] = usePersistentWidth("cc:sidebar-width", SIDEBAR.default);
  return (
    <>
        <div id="desktop-boot-drag-strip" className="sf-hidden" />
        <div id="root">
          <div
            className="cds-root text-primary contents"
            data-density="comfortable"
            data-mode="dark"
            data-font="anthropic"
            style={{
              fontSize: "var(--cds-font-size-body)",
              "--cds-page-bg": "var(--cds-surface-1)",
            }}
          >
            <div className="root">
              <div
                className="grid w-full overflow-hidden print:!h-auto print:overflow-visible print:block bg-surface-1"
                style={{
                  height:
                    "calc(var(--app-visual-viewport-height,100dvh) - var(--app-install-banner-height,0px) - var(--dev-dashboard-height,0px) - var(--desktop-org-banner-height,0px) - var(--desktop-config-deprecation-strip-height,0px) - var(--hold-notice-banner-height,0px) - var(--stale-session-redirect-guard-height,0px) - var(--session-expiry-banner-height,0px))",
                  "--app-content-height":
                    "calc(var(--app-visual-viewport-height,100dvh) - var(--app-install-banner-height,0px) - var(--dev-dashboard-height,0px) - var(--desktop-org-banner-height,0px) - var(--desktop-config-deprecation-strip-height,0px) - var(--hold-notice-banner-height,0px) - var(--stale-session-redirect-guard-height,0px) - var(--session-expiry-banner-height,0px))",
                  gridTemplateRows: "0px 1fr",
                  "--desktop-top-bar-row-height": "0px",
                }}
              >
                <EmptyContainer />
                <div className="flex min-h-0 min-w-0 w-full overflow-x-clip relative overflow-y-clip print:!overflow-visible">
                  <div className="pointer-events-none absolute inset-0 bg-surface-1 [background-image:linear-gradient(to_right,var(--cds-surface-0)_1px,transparent_1px),linear-gradient(to_bottom,var(--cds-surface-0)_1px,transparent_1px)] [background-size:32px_32px] task-grid-mount-reveal transition-opacity duration-500 ease-in-out motion-reduce:transition-none opacity-0" />
                  <div
                    className="dframe-root draggable-none cds-root text-primary"
                    data-web="true"
                    data-variant="web"
                    data-density="comfortable"
                    data-mode="dark"
                    data-font="anthropic"
                    data-frame-mode="code"
                    style={{
                      fontSize: "var(--cds-font-size-body)",
                      "--cds-page-bg": "var(--cds-surface-1)",
                      "--df-sidebar-width": `${sidebarWidth}px`,
                      "--df-traffic-light-spacer": "0px",
                      "--df-drag-ghost-z": "9001",
                    }}
                  >
                    <div
                      className="cds-root text-primary contents"
                      data-density="comfortable"
                      data-mode="dark"
                      data-font="anthropic"
                      style={{
                        fontSize: "var(--cds-font-size-body)",
                        "--cds-page-bg": "var(--cds-surface-1)",
                      }}
                    >
                      <Sidebar width={sidebarWidth} min={SIDEBAR.min} max={SIDEBAR.max} defaultWidth={SIDEBAR.default} onResize={setSidebarWidth} />
                    </div>
                    <main className="dframe-content">
                      <div
                        className="dframe-content-inner"
                        style={{
                          "--df-content-gutter": "0px",
                        }}
                      >
                        <div className="dframe-content-banner sf-hidden" />
                        <div
                          className="dframe-pane dframe-pane-primary flex-1 min-w-0 relative flex flex-col"
                          data-col-last="true"
                        >
                          <div className="dframe-pane-scroller flex-1 min-h-0 flex flex-col overflow-x-clip overflow-y-auto -ml-2 pl-2">
                            <div
                              className="relative flex-1 min-h-0 flex flex-col"
                              style={{
                                "--df-header-h": "0px",
                              }}
                            >
                              <div className="epitaxy-root text-body text-primary break-words contents">
                                <div
                                  className="cds-root text-primary contents"
                                  data-density="compact"
                                  data-mode="dark"
                                  data-font="anthropic"
                                  style={{
                                    fontSize: "var(--cds-font-size-body)",
                                    "--cds-page-bg": "var(--cds-surface-1)",
                                  }}
                                >
                                  <div className="epitaxy-root text-body text-primary break-words select-none h-full w-full flex flex-col">
                                    <div data-testid="pending-nav-frame" className="relative flex-1 min-h-0">
                                      <div data-testid="pending-nav-body" className="h-full w-full">
                                        <div
                                          className="relative h-full w-full"
                                          style={{
                                            "--tile-container-border": "transparent",
                                            "--tile-container-bg": "transparent",
                                            "--tile-indicator-color": "var(--cds-fill-accent)",
                                            "--tile-indicator-thickness": "3px",
                                            "--tile-resize-color": "var(--cds-alpha-3)",
                                            "--tile-resize-color-active": "var(--cds-fill-primary)",
                                            "--tile-resize-color-focus": "var(--cds-fill-accent)",
                                            "--tile-resize-color-disabled": "var(--cds-alpha-2)",
                                            "--tile-resize-thickness": "3px",
                                            "--tile-resize-length": "56px",
                                            "--tile-drag-color": "var(--cds-alpha-3)",
                                            "--tile-drag-color-active": "var(--cds-fill-primary)",
                                            "--tile-drag-color-focus": "var(--cds-fill-accent)",
                                          }}
                                        >
                                          <div
                                            className="draggable absolute top-0 left-0 right-0"
                                            style={{
                                              height: "8px",
                                            }}
                                          />
                                          <div
                                            style={{
                                              width: "100%",
                                              height: "100%",
                                              display: "flex",
                                              overflow: "clip",
                                              contain: "strict",
                                            }}
                                          >
                                            <div
                                              style={{
                                                width: "100%",
                                                height: "100%",
                                                border: "1px solid var(--tile-container-border)",
                                                background: "var(--tile-container-bg)",
                                                display: "flex",
                                                flexDirection: "column",
                                                position: "relative",
                                                alignItems: "stretch",
                                                padding: "8px 0px 8px 8px",
                                                "--tiles-padding": "8px",
                                                "--tiles-gap": "12px",
                                              }}
                                            >
                                              <div
                                                style={{
                                                  display: "flex",
                                                  position: "relative",
                                                  minWidth: "0px",
                                                  minHeight: "0px",
                                                  overflow: "visible",
                                                  flexDirection: "row",
                                                  flex: "1 1 0px",
                                                }}
                                              >
                                                <div
                                                  style={{
                                                    position: "relative",
                                                    minWidth: "100px",
                                                    minHeight: "100px",
                                                    overflow: "visible",
                                                    zIndex: "0",
                                                    flex: "1 1 0px",
                                                    container: "tile-slot/inline-size",
                                                    transform: "none",
                                                    opacity: "1",
                                                  }}
                                                >
                                                  <MainContent />
                                                  <UpNextAnnouncement />
                                                </div>
                                              </div>
                                            </div>
                                            <span
                                              id="_r_cr_-reorder-hint"
                                              className="sr-only"
                                              data-editable-text="true"
                                            >
                                              Arrow keys move the tile. Perpendicular arrows preview a split; press
                                              Enter to commit or Escape to cancel.
                                            </span>
                                            <span role="status" className="sr-only" />
                                          </div>
                                        </div>
                                      </div>
                                      <div role="status" className="sr-only" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="dframe-peek-nodrag sf-hidden" />
                    </main>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className="cds-root text-primary contents"
            data-density="comfortable"
            data-font="anthropic"
            style={{
              fontSize: "var(--cds-font-size-body)",
              "--cds-page-bg": "var(--cds-surface-1)",
            }}
          />
        </div>
        <div id="portal-root" />
        <div
          className="cds-root text-primary"
          data-density="comfortable"
          data-mode="dark"
          data-font="anthropic"
          style={{
            fontSize: "inherit",
            "--cds-page-bg": "var(--cds-surface-1)",
          }}
        />
        <div />
        <div id="_r_m_">
          <div
            className="cds-root pointer-events-auto"
            data-density="comfortable"
            data-mode="dark"
            data-font="anthropic"
            style={{
              "--cds-page-bg": "var(--cds-surface-3)",
            }}
          >
            <div
              data-cds="Toast"
              className="cds-reset pointer-events-none fixed flex w-[360px] max-w-[calc(100vw-2rem)] flex-col-reverse gap-md right-[calc(var(--launch-drawer-width,0px)_+_1rem)] bottom-[calc(max(var(--dev-dashboard-height,0px)_+_var(--session-expiry-banner-height,0px),var(--toast-clearance,0px))_+_1rem)]"
              style={{
                zIndex: "9000",
                "--cds-layer-base": "9000",
              }}
            >
              <div role="status" className="sr-only" />
              <NotificationRegion />
            </div>
          </div>
        </div>
    </>
  );
}

export function App() {
  return (
    <BrowserRouter basename={BASE} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Navigate to="/code" replace />} />
        <Route path="/tokens" element={<TokensPage />} />
        <Route path="/needs-you" element={<Navigate to="/up-next" replace />} />
        <Route path="*" element={<AppContent />} />
      </Routes>
    </BrowserRouter>
  );
}
