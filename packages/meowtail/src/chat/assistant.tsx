import { h, keyed, type Context } from "meowjsx";
import { derived, signal, unwrap, type Signal } from "meowjsx/signal";
// Fragment is required by the classic JSX transform for header actions.
// eslint-disable-next-line no-unused-vars
import { Fragment } from "meowjsx";
import { PageFrame } from "../components/page-frame";
import { Button } from "../components/button";
import { WorkCard } from "../components/work-card";
import { StatusDot } from "../components/status-dot";
import { Dialog } from "../components/dialog";
import { ChatHeader } from "./header";
import { ChatMessageList } from "./message-list";
import { AssistantComposer } from "./assistant-composer";
import { AssistantMessageView, AssistantSteps } from "./assistant-content";
import { AssistantQuestionView } from "./assistant-question";
import { AssistantMarkdown } from "./assistant-markdown";
import { assistantScroll } from "./assistant-scroll";
import { IconButton } from "../components/icon-button";
import { Icon } from "../icons/icon";
import {
  assistantCopy as defaultAssistantCopy,
  type AssistantViewProps,
  type AssistantWork,
} from "./assistant-types";

function AssistantWorkRow({
  value,
  actionLabel,
  onOpen,
}: {
  value: Signal<AssistantWork>;
  actionLabel: string;
  onOpen: (id: string, button: HTMLElement) => void;
}) {
  return (
    <WorkCard
      action={actionLabel}
      title={derived(() => value.value.title)}
      state={derived(() => value.value.tone ?? "unknown")}
      status={derived(() => value.value.statusText)}
      detail={derived(() =>
        [value.value.executionText, value.value.replyText].filter(Boolean).join(" · "),
      )}
      onClick={(event: MouseEvent) => onOpen(value.value.id, event.currentTarget as HTMLElement)}
    />
  );
}
AssistantWorkRow.meta = { name: "assistant-work-row", parts: ["root"] } as const;

function AssistantWorkDetail(
  { value, options }: { value: Signal<AssistantWork | undefined>; options: AssistantViewProps },
  context: Context<typeof AssistantWorkDetail>,
) {
  const assistantCopy = { ...defaultAssistantCopy, ...options.labels };
  const hidden = derived(() => value.value?.readState === "unavailable");
  const feedback = derived(() => {
    const work = value.value;
    return (
      work?.feedback ||
      (work?.readState === "unavailable"
        ? assistantCopy.workUnavailable
        : work?.readState === "loading"
          ? assistantCopy.workLoading
          : work?.readState === "error"
            ? assistantCopy.workError
            : "")
    );
  });
  const detail = (
    <AssistantMarkdown
      text={derived(() =>
        value.value?.readState === "unavailable"
          ? ""
          : (value.value?.detail ?? value.value?.summary ?? ""),
      )}
    />
  );
  const custom = options.renderWorkDetail
    ? derived(() =>
        value.value && value.value.readState !== "unavailable"
          ? (options.renderWorkDetail!(value.value) ?? detail)
          : null,
      )
    : detail;
  const parts = context.parts;
  return (
    <section ref={parts.root}>
      <p role="status" hidden={derived(() => !feedback.value)} ref={parts.feedback}>
        {feedback}
      </p>
      <div hidden={hidden} ref={parts.facts}>
        <h3>{derived(() => value.value?.title ?? "")}</h3>
        <p>
          <StatusDot state={derived(() => value.value?.tone ?? "unknown")} />{" "}
          {derived(() => value.value?.statusText ?? "")}
        </p>
        <p>{derived(() => value.value?.executionText ?? "")}</p>
        <p>{derived(() => value.value?.replyText ?? "")}</p>
        {custom}
        <AssistantSteps steps={derived(() => value.value?.steps ?? [])} />
      </div>
      {options.onRefreshWork ? (
        <Button
          variant="outline"
          size="small"
          onClick={() => {
            if (value.value) options.onRefreshWork!(value.value.id);
          }}
        >
          {assistantCopy.refresh}
        </Button>
      ) : null}
    </section>
  );
}
AssistantWorkDetail.meta = {
  name: "assistant-work-detail",
  parts: ["root", "feedback", "facts"],
} as const;

/** A complete default Assistant surface. Data, permissions, network and business lifetime stay with the host. */
export function AssistantView(options: AssistantViewProps, context: Context<typeof AssistantView>) {
  const assistantCopy = { ...defaultAssistantCopy, ...options.labels };
  const messages = derived(() => unwrap(options.messages));
  const work = derived(() => unwrap(options.work ?? []));
  const questions = derived(() => unwrap(options.questions ?? []));
  const activity = derived(() => unwrap(options.activity));
  const panelOpen = signal(false);
  const selected = signal("");
  const selectedWork = derived(() => work.value.find((item) => item.id === selected.value));
  const latestHidden = signal(true);
  const historyOpen = signal(false);
  const asked = derived(() =>
    messages.value.flatMap((message) => {
      if (message.role !== "user") return [];
      const text = message.parts
        .flatMap((part) => (part.kind === "text" ? [part.text] : []))
        .join(" ")
        .trim();
      return text ? [{ id: message.id, text }] : [];
    }),
  );
  const historyEnabled = options.history !== false;
  const historyId = options.id ? `${options.id}-history` : undefined;
  let historyList: HTMLElement | undefined;
  let historyTrigger: HTMLElement | undefined;
  const closeHistory = (restoreFocus = true) => {
    if (!historyOpen.value) return;
    historyOpen.value = false;
    if (restoreFocus)
      queueMicrotask(() => {
        if (!disposed && historyTrigger?.isConnected) historyTrigger.focus({ preventScroll: true });
      });
  };
  const jumpTo = (id: string) => {
    closeHistory(false);
    scroll?.reveal(id);
  };
  const bodyHidden = derived(() => !!selected.value);
  const detailHidden = derived(() => !selected.value);
  let content: HTMLElement | undefined;
  let scroll: ReturnType<typeof assistantScroll> | undefined;
  let dialog: HTMLDialogElement | undefined;
  let root: HTMLElement | undefined;
  let activityTrigger: HTMLElement | undefined;
  let detailOpener: HTMLElement | undefined;
  let compact = false;
  let disposed = false;
  const close = () => {
    panelOpen.value = false;
    queueMicrotask(() => {
      if (!disposed && !panelOpen.value && activityTrigger?.isConnected)
        activityTrigger.focus({ preventScroll: true });
    });
  };
  const back = () => {
    selected.value = "";
    const opener = detailOpener;
    queueMicrotask(() => {
      if (!disposed && !selected.value && opener?.isConnected)
        opener.focus({ preventScroll: true });
    });
  };
  const syncDialog = () => {
    const opened = panelOpen.value;
    if (!dialog?.isConnected) return;
    const nextCompact = !!root && root.clientWidth < 760;
    const active = dialog.ownerDocument.activeElement;
    if (dialog.open && (!opened || nextCompact !== compact)) dialog.close();
    compact = nextCompact;
    if (opened && !dialog.open) {
      if (compact) dialog.showModal();
      else dialog.show();
      if (active instanceof HTMLElement && dialog.contains(active))
        active.focus({ preventScroll: true });
    }
  };
  context.effect(syncDialog);
  context.effect(() => {
    if (selected.value && !selectedWork.value) selected.value = "";
  });
  context.onCleanup(() => {
    disposed = true;
    scroll?.dispose();
    if (dialog?.open) dialog.close();
  });

  const transcript = keyed(
    messages,
    (message) => message.id,
    (value) => (
      <AssistantMessageView
        value={value}
        renderPart={options.renderPart}
        onToolAction={options.onToolAction}
        onMessageAction={options.onMessageAction}
        labels={assistantCopy}
      />
    ),
  );
  const parts = context.parts;
  const messagesRegion = (
    <section ref={parts.messages}>
      <div
        role="region"
        aria-label={assistantCopy.messages}
        tabIndex={0}
        ref={[
          parts.viewport,
          (element: HTMLElement) => {
            queueMicrotask(() => {
              if (disposed || !content) return;
              scroll = assistantScroll(element, content, (latest) => {
                latestHidden.value = latest;
              });
              let queued = false;
              const stop = messages.subscribe(() => {
                if (!queued) {
                  queued = true;
                  queueMicrotask(() => {
                    queued = false;
                    if (!disposed) scroll?.afterUpdate();
                  });
                }
              });
              context.onCleanup(stop);
            });
          },
        ]}
      >
        <div
          ref={[
            parts.content,
            (element: HTMLElement) => {
              content = element;
            },
          ]}
        >
          {options.onLoadOlder ? (
            <Button
              variant="quiet"
              size="small"
              disabled={options.loadingOlder}
              onClick={() => {
                scroll?.beforeUpdate();
                options.onLoadOlder!();
              }}
            >
              {assistantCopy.older}
            </Button>
          ) : null}
          <p
            role="status"
            hidden={derived(() => unwrap(options.readState ?? "ready") === "ready")}
            ref={parts.feedback}
          >
            {derived(
              () =>
                unwrap(options.readFeedback ?? "") ||
                (unwrap(options.readState ?? "ready") === "loading"
                  ? assistantCopy.loading
                  : assistantCopy.readError),
            )}
          </p>
          <div
            hidden={derived(
              () => messages.value.length > 0 || unwrap(options.readState ?? "ready") !== "ready",
            )}
            ref={parts.empty}
          >
            <h2>{assistantCopy.empty}</h2>
            <p>{assistantCopy.emptyDescription}</p>
          </div>
          <ChatMessageList ariaLabel={assistantCopy.messages}>{transcript}</ChatMessageList>
        </div>
      </div>
      <div hidden={latestHidden} ref={parts.latest}>
        <Button variant="outline" size="small" onClick={() => scroll?.latest()}>
          {assistantCopy.latest}
        </Button>
      </div>
      {historyEnabled ? (
        <nav
          id={historyId}
          aria-label={assistantCopy.history}
          ref={[
            parts.history,
            (element: HTMLElement) => {
              historyList = element;
            },
          ]}
          data-open={derived(() => String(historyOpen.value))}
          inert={derived(() => !historyOpen.value)}
          onClick={(event: MouseEvent) => {
            if (event.target === event.currentTarget) closeHistory();
          }}
          onKeyDown={(event: KeyboardEvent) => {
            if (event.key === "Escape") {
              event.preventDefault();
              closeHistory();
            }
          }}
        >
          <ol>
            {keyed(
              asked,
              (item) => item.id,
              (item) => (
                <li>
                  <button
                    type="button"
                    onClick={() => jumpTo(item.value.id)}
                    ref={parts.historyItem}
                  >
                    {derived(() => item.value.text)}
                  </button>
                </li>
              ),
            )}
          </ol>
        </nav>
      ) : null}
    </section>
  );
  const activityList = (
    <div hidden={bodyHidden} ref={parts.activityBody}>
      <section ref={parts.section}>
        <h3>{assistantCopy.current}</h3>
        <p ref={parts.status}>
          <StatusDot state={derived(() => activity.value?.tone ?? "idle")} />
          {derived(() => activity.value?.statusText ?? assistantCopy.noActivity)}
        </p>
        <strong>{derived(() => activity.value?.title ?? "")}</strong>
        <p>{derived(() => activity.value?.description ?? "")}</p>
        <AssistantSteps steps={derived(() => activity.value?.steps ?? [])} />
      </section>
      <section ref={parts.section}>
        <h3>{assistantCopy.background}</h3>
        <p hidden={derived(() => work.value.length > 0)}>{assistantCopy.noWork}</p>
        {keyed(
          work,
          (item) => item.id,
          (value) => (
            <AssistantWorkRow
              value={value}
              actionLabel={assistantCopy.details}
              onOpen={(id: string, button: HTMLElement) => {
                detailOpener = button;
                selected.value = id;
                queueMicrotask(() => {
                  if (!disposed && panelOpen.value && selected.value === id)
                    dialog?.querySelector<HTMLElement>("[data-assistant-back]")?.focus();
                });
              }}
            />
          ),
        )}
      </section>
      <section hidden={derived(() => questions.value.length === 0)} ref={parts.section}>
        <h3>{assistantCopy.questions}</h3>
        {keyed(
          questions,
          (question) => question.id,
          (value) => (
            <AssistantQuestionView
              value={value}
              labels={options.labels}
              onAnswer={options.onAnswer}
              onDismiss={options.onDismissQuestion}
            />
          ),
        )}
      </section>
    </div>
  );
  const activityPanel = (
    <Dialog
      labelledBy={undefined}
      aria-label={assistantCopy.activity}
      data-assistant-panel
      ref={(element: HTMLDialogElement) => {
        dialog = element;
        queueMicrotask(syncDialog);
      }}
      onCancel={(event: Event) => {
        event.preventDefault();
        close();
      }}
      onKeyDown={(event: KeyboardEvent) => {
        if (event.key === "Escape" && !compact && !event.defaultPrevented) {
          event.preventDefault();
          close();
        }
      }}
    >
      <header ref={parts.activityHeader}>
        <Button
          variant="quiet"
          size="small"
          data-assistant-back
          hidden={detailHidden}
          onClick={back}
        >
          {assistantCopy.back}
        </Button>
        <h2>{assistantCopy.activity}</h2>
        <Button variant="quiet" size="small" onClick={close} aria-label={assistantCopy.close}>
          ×
        </Button>
      </header>
      {activityList}
      <div hidden={detailHidden} ref={parts.workDetail}>
        <AssistantWorkDetail value={selectedWork} options={options} />
      </div>
    </Dialog>
  );
  const rootRef = (element: HTMLElement) => {
    root = element;
    const observer = new ResizeObserver(syncDialog);
    observer.observe(element);
    return () => {
      observer.disconnect();
      root = undefined;
    };
  };
  return (
    <section
      id={options.id}
      style={options.style}
      aria-label={options["aria-label"]}
      className={options.className}
      data-activity-open={derived(() => String(panelOpen.value))}
      data-history-open={derived(() => String(historyOpen.value))}
      ref={[parts.root, rootRef, options.ref]}
    >
      <PageFrame
        variant="workspace"
        header={
          <ChatHeader
            title={options.title ?? assistantCopy.title}
            description={options.description}
            actions={
              <>
                {options.headerActions}
                <Button
                  variant="quiet"
                  size="small"
                  aria-expanded={derived(() => String(panelOpen.value))}
                  ref={(element: HTMLElement) => {
                    activityTrigger = element;
                  }}
                  onClick={() => {
                    panelOpen.value = !panelOpen.value;
                  }}
                >
                  {assistantCopy.activity}
                </Button>
              </>
            }
          />
        }
      >
        <div ref={parts.layout}>
          {messagesRegion}
          <div
            ref={parts.composer}
            onKeyDown={(event: KeyboardEvent) => {
              if (event.key === "Escape" && historyOpen.value) {
                event.preventDefault();
                closeHistory();
              }
            }}
          >
            <AssistantComposer
              options={options}
              trailing={
                historyEnabled ? (
                  <span hidden={derived(() => asked.value.length === 0)} ref={parts.historyTrigger}>
                    <IconButton
                      label={derived(() =>
                        historyOpen.value ? assistantCopy.closeHistory : assistantCopy.history,
                      )}
                      aria-expanded={derived(() => String(historyOpen.value))}
                      aria-controls={historyId}
                      ref={(element: HTMLElement) => {
                        historyTrigger = element;
                      }}
                      onClick={() => {
                        historyOpen.value = !historyOpen.value;
                        if (historyOpen.value)
                          queueMicrotask(() => {
                            if (disposed) return;
                            const items = historyList?.querySelectorAll<HTMLElement>("button");
                            items?.[items.length - 1]?.focus({ preventScroll: true });
                          });
                      }}
                    >
                      <Icon name="history" className="assistant-history-closed" />
                      <Icon name="x" className="assistant-history-open" />
                    </IconButton>
                  </span>
                ) : undefined
              }
            />
          </div>
          {activityPanel}
        </div>
      </PageFrame>
    </section>
  );
}
AssistantView.meta = {
  name: "assistant-view",
  parts: [
    "root",
    "layout",
    "messages",
    "viewport",
    "content",
    "latest",
    "composer",
    "feedback",
    "empty",
    "activity",
    "activityHeader",
    "activityBody",
    "section",
    "workDetail",
    "status",
    "history",
    "historyItem",
    "historyTrigger",
  ],
} as const;

export type {
  AssistantViewProps,
  AssistantDraft,
  AssistantAttachment,
  AssistantMessage,
  AssistantMessagePart,
  AssistantMessageAction,
  AssistantToolPart,
  AssistantTaskPart,
  AssistantProcessStep,
  AssistantActivity,
  AssistantWork,
  AssistantQuestion,
  AssistantChoice,
  AssistantLabels,
} from "./assistant-types";
export { assistantCopy } from "./assistant-types";
