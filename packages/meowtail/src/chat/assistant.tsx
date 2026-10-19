import { defineComponent, derived, h, keyed, unwrap, type Signal } from "meowjsx";
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
import {
  assistantCopy as defaultAssistantCopy,
  type AssistantViewProps,
  type AssistantWork,
} from "./assistant-types";

export const assistantViewContract = {
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
  ],
} as const;

const AssistantWorkRow = defineComponent<
  {
    value: Signal<AssistantWork>;
    actionLabel: string;
    onOpen: (id: string, button: HTMLElement) => void;
  },
  "assistant-work-row",
  "root"
>({ name: "assistant-work-row", parts: ["root"] }, ({ value, onOpen, actionLabel }) =>
  h(WorkCard, {
    action: actionLabel,
    title: derived(() => value.value.title),
    state: derived(() => value.value.tone ?? "unknown"),
    status: derived(() => value.value.statusText),
    detail: derived(() =>
      [value.value.executionText, value.value.replyText].filter(Boolean).join(" · "),
    ),
    onClick: (event: MouseEvent) => onOpen(value.value.id, event.currentTarget as HTMLElement),
  }),
);

const AssistantWorkDetail = defineComponent<
  {
    value: Signal<AssistantWork | undefined>;
    options: AssistantViewProps;
  },
  "assistant-work-detail",
  "root" | "feedback" | "facts"
>(
  { name: "assistant-work-detail", parts: ["root", "feedback", "facts"] },
  ({ value, options }, context) => {
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
    const detail = h(AssistantMarkdown, {
      text: derived(() =>
        value.value?.readState === "unavailable"
          ? ""
          : (value.value?.detail ?? value.value?.summary ?? ""),
      ),
    });
    // The host detail slot may return a node. The default markdown view stays mounted otherwise.
    const custom = options.renderWorkDetail
      ? derived(() =>
          value.value && value.value.readState !== "unavailable"
            ? (options.renderWorkDetail!(value.value) ?? detail)
            : null,
        )
      : detail;
    return context.part(
      "root",
      "section",
      null,
      context.part(
        "feedback",
        "p",
        { role: "status", hidden: derived(() => !feedback.value) },
        feedback,
      ),
      context.part(
        "facts",
        "div",
        { hidden },
        h(
          "h3",
          null,
          derived(() => value.value?.title ?? ""),
        ),
        h(
          "p",
          null,
          h(StatusDot, { state: derived(() => value.value?.tone ?? "unknown") }),
          " ",
          derived(() => value.value?.statusText ?? ""),
        ),
        h(
          "p",
          null,
          derived(() => value.value?.executionText ?? ""),
        ),
        h(
          "p",
          null,
          derived(() => value.value?.replyText ?? ""),
        ),
        custom,
        h(AssistantSteps, { steps: derived(() => value.value?.steps ?? []) }),
      ),
      options.onRefreshWork
        ? h(Button, {
            variant: "outline",
            size: "small",
            onClick: () => {
              if (value.value) options.onRefreshWork!(value.value.id);
            },
            children: assistantCopy.refresh,
          })
        : null,
    );
  },
);

/** A complete default Assistant surface. Data, permissions, network and business lifetime stay with the host. */
export const AssistantView = defineComponent<
  AssistantViewProps,
  "assistant-view",
  (typeof assistantViewContract.parts)[number]
>(assistantViewContract, (options, context) => {
  const assistantCopy = { ...defaultAssistantCopy, ...options.labels };
  const messages = derived(() => unwrap(options.messages));
  const work = derived(() => unwrap(options.work ?? []));
  const questions = derived(() => unwrap(options.questions ?? []));
  const activity = derived(() => unwrap(options.activity));
  const panelOpen = context.signal(false);
  const selected = context.signal("");
  const selectedWork = derived(() => work.value.find((item) => item.id === selected.value));
  const latestHidden = context.signal(true);
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
    (value) =>
      h(AssistantMessageView, {
        value,
        renderPart: options.renderPart,
        onToolAction: options.onToolAction,
      }),
  );
  const messageRegion = context.part(
    "messages",
    "section",
    null,
    context.part(
      "viewport",
      "div",
      {
        role: "region",
        "aria-label": assistantCopy.messages,
        tabIndex: 0,
        ref: (element: HTMLElement) => {
          queueMicrotask(() => {
            if (disposed || !content) return;
            scroll = assistantScroll(element, content, (latest) => {
              latestHidden.value = latest;
            });
            let queued = false;
            const stop = messages.subscribe(() => {
              // Signal item changes patch synchronously. A microtask handles final layout once.
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
      },
      context.part(
        "content",
        "div",
        {
          ref: (element: HTMLElement) => {
            content = element;
          },
        },
        options.onLoadOlder
          ? h(Button, {
              variant: "quiet",
              size: "small",
              disabled: options.loadingOlder,
              onClick: () => {
                scroll?.beforeUpdate();
                options.onLoadOlder!();
              },
              children: assistantCopy.older,
            })
          : null,
        context.part(
          "feedback",
          "p",
          {
            role: "status",
            hidden: derived(() => unwrap(options.readState ?? "ready") === "ready"),
          },
          derived(
            () =>
              unwrap(options.readFeedback ?? "") ||
              (unwrap(options.readState ?? "ready") === "loading"
                ? assistantCopy.loading
                : assistantCopy.readError),
          ),
        ),
        context.part(
          "empty",
          "div",
          {
            hidden: derived(
              () => messages.value.length > 0 || unwrap(options.readState ?? "ready") !== "ready",
            ),
          },
          h("h2", null, assistantCopy.empty),
          h("p", null, assistantCopy.emptyDescription),
        ),
        h(ChatMessageList, { ariaLabel: assistantCopy.messages, children: transcript }),
      ),
    ),
    context.part(
      "latest",
      "div",
      { hidden: latestHidden },
      h(Button, {
        variant: "outline",
        size: "small",
        onClick: () => scroll?.latest(),
        children: assistantCopy.latest,
      }),
    ),
  );
  const activityList = context.part(
    "activityBody",
    "div",
    { hidden: bodyHidden },
    context.part(
      "section",
      "section",
      null,
      h("h3", null, assistantCopy.current),
      context.part(
        "status",
        "p",
        null,
        h(StatusDot, { state: derived(() => activity.value?.tone ?? "idle") }),
        derived(() => activity.value?.statusText ?? assistantCopy.noActivity),
      ),
      h(
        "strong",
        null,
        derived(() => activity.value?.title ?? ""),
      ),
      h(
        "p",
        null,
        derived(() => activity.value?.description ?? ""),
      ),
      h(AssistantSteps, { steps: derived(() => activity.value?.steps ?? []) }),
    ),
    context.part(
      "section",
      "section",
      null,
      h("h3", null, assistantCopy.background),
      h("p", { hidden: derived(() => work.value.length > 0) }, assistantCopy.noWork),
      keyed(
        work,
        (item) => item.id,
        (value) =>
          h(AssistantWorkRow, {
            value,
            actionLabel: assistantCopy.details,
            onOpen: (id: string, button: HTMLElement) => {
              detailOpener = button;
              selected.value = id;
              queueMicrotask(() => {
                if (!disposed && panelOpen.value && selected.value === id)
                  dialog?.querySelector<HTMLElement>("[data-assistant-back]")?.focus();
              });
            },
          }),
      ),
    ),
    context.part(
      "section",
      "section",
      { hidden: derived(() => questions.value.length === 0) },
      h("h3", null, assistantCopy.questions),
      keyed(
        questions,
        (question) => question.id,
        (value) =>
          h(AssistantQuestionView, {
            value,
            labels: options.labels,
            onAnswer: options.onAnswer,
            onDismiss: options.onDismissQuestion,
          }),
      ),
    ),
  );
  const activityPanel = h(Dialog, {
    labelledBy: undefined,
    "aria-label": assistantCopy.activity,
    "data-assistant-panel": true,
    ref: (element: HTMLDialogElement) => {
      dialog = element;
      queueMicrotask(syncDialog);
    },
    onCancel: (event: Event) => {
      event.preventDefault();
      close();
    },
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === "Escape" && !compact && !event.defaultPrevented) {
        event.preventDefault();
        close();
      }
    },
    children: [
      context.part(
        "activityHeader",
        "header",
        null,
        h(Button, {
          variant: "quiet",
          size: "small",
          "data-assistant-back": true,
          hidden: detailHidden,
          onClick: back,
          children: assistantCopy.back,
        }),
        h("h2", null, assistantCopy.activity),
        h(Button, {
          variant: "quiet",
          size: "small",
          onClick: close,
          "aria-label": assistantCopy.close,
          children: "×",
        }),
      ),
      activityList,
      context.part(
        "workDetail",
        "div",
        { hidden: detailHidden },
        h(AssistantWorkDetail, { value: selectedWork, options }),
      ),
    ],
  });
  return context.part(
    "root",
    "section",
    {
      id: options.id,
      style: options.style,
      "aria-label": options["aria-label"],
      className: options.className,
      "data-activity-open": derived(() => String(panelOpen.value)),
      ref: (element: HTMLElement) => {
        root = element;
        const observer = new ResizeObserver(syncDialog);
        observer.observe(element);
        return () => {
          observer.disconnect();
          root = undefined;
        };
      },
    },
    h(PageFrame, {
      variant: "workspace",
      header: h(ChatHeader, {
        title: options.title ?? assistantCopy.title,
        description: options.description,
        actions: [
          options.headerActions,
          h(Button, {
            variant: "quiet",
            size: "small",
            "aria-expanded": derived(() => String(panelOpen.value)),
            ref: (element: HTMLElement) => {
              activityTrigger = element;
            },
            onClick: () => {
              panelOpen.value = !panelOpen.value;
            },
            children: assistantCopy.activity,
          }),
        ],
      }),
      children: context.part(
        "layout",
        "div",
        null,
        messageRegion,
        context.part("composer", "div", null, h(AssistantComposer, { options })),
        activityPanel,
      ),
    }),
  );
});

export type {
  AssistantViewProps,
  AssistantDraft,
  AssistantAttachment,
  AssistantMessage,
  AssistantMessagePart,
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
