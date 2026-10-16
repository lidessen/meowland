import { defineComponent, h, keyed, unwrap, type Child, type Signal } from "meowjsx";
import { PageFrame } from "../components/page-frame";
import { Button } from "../components/button";
import { WorkCard } from "../components/work-card";
import { StatusDot } from "../components/status-dot";
import { Dialog } from "../components/dialog";
import { ChatHeader } from "./header";
import { ChatMessageList } from "./message-list";
import { AssistantComposer } from "./assistant-composer";
import { AssistantMessageView, AssistantSteps, assistantDerived } from "./assistant-content";
import { AssistantQuestionView } from "./assistant-question";
import { AssistantMarkdown } from "./assistant-markdown";
import { assistantScroll } from "./assistant-scroll";
import { assistantCopy as defaultAssistantCopy, type AssistantViewProps, type AssistantWork } from "./assistant-types";

export const assistantViewContract = {
  name: "assistant-view",
  parts: ["root", "layout", "messages", "viewport", "content", "latest", "composer", "feedback", "empty", "activity", "activityHeader", "activityBody", "section", "workDetail", "status"],
} as const;

const AssistantWorkRow = defineComponent<{ value: Signal<AssistantWork>; actionLabel: string; onOpen: (id: string, button: HTMLElement) => void }, "assistant-work-row", "root">(
  { name: "assistant-work-row", parts: ["root"] },
  ({ value, onOpen, actionLabel }, context) => h(WorkCard, {
    action: actionLabel,
    title: assistantDerived(context, () => value.value.title),
    state: assistantDerived(context, () => value.value.tone ?? "unknown"),
    status: assistantDerived(context, () => value.value.statusText),
    detail: assistantDerived(context, () => [value.value.executionText, value.value.replyText].filter(Boolean).join(" · ")),
    onClick: (event: MouseEvent) => onOpen(value.value.id, event.currentTarget as HTMLElement),
  }),
);

const AssistantWorkDetail = defineComponent<{
  value: Signal<AssistantWork | undefined>;
  options: AssistantViewProps;
}, "assistant-work-detail", "root" | "feedback" | "facts">(
  { name: "assistant-work-detail", parts: ["root", "feedback", "facts"] },
  ({ value, options }, context) => {
    const assistantCopy = { ...defaultAssistantCopy, ...options.labels };
    const hidden = assistantDerived(context, () => value.value?.readState === "unavailable");
    const feedback = assistantDerived(context, () => {
      const work = value.value;
      return work?.feedback || (work?.readState === "unavailable" ? assistantCopy.workUnavailable : work?.readState === "loading" ? assistantCopy.workLoading : work?.readState === "error" ? assistantCopy.workError : "");
    });
    const detail = h(AssistantMarkdown, { text: assistantDerived(context, () => value.value?.readState === "unavailable" ? "" : value.value?.detail ?? value.value?.summary ?? "") });
    const custom = options.renderWorkDetail ? assistantDerived(context, () => value.value && value.value.readState !== "unavailable" ? options.renderWorkDetail!(value.value) ?? detail : null) : detail;
    return context.part("root", "section", null,
      context.part("feedback", "p", { role: "status", hidden: assistantDerived(context, () => !feedback.value) }, feedback),
      context.part("facts", "div", { hidden },
        h("h3", null, assistantDerived(context, () => value.value?.title ?? "")),
        h("p", null, h(StatusDot, { state: assistantDerived(context, () => value.value?.tone ?? "unknown") }), " ", assistantDerived(context, () => value.value?.statusText ?? "")),
        h("p", null, assistantDerived(context, () => value.value?.executionText ?? "")),
        h("p", null, assistantDerived(context, () => value.value?.replyText ?? "")),
        custom,
        h(AssistantSteps, { steps: assistantDerived(context, () => value.value?.steps ?? []) }),
      ),
      options.onRefreshWork ? h(Button, { variant: "outline", size: "small", onClick: () => { if (value.value) options.onRefreshWork!(value.value.id); }, children: assistantCopy.refresh }) : null,
    );
  },
);

/** A complete default Assistant surface. Data, permissions, network and business lifetime stay with the host. */
export const AssistantView = defineComponent<AssistantViewProps, "assistant-view", (typeof assistantViewContract.parts)[number]>(
  assistantViewContract,
  (options, context) => {
    const assistantCopy = { ...defaultAssistantCopy, ...options.labels };
    const messages = assistantDerived(context, () => unwrap(options.messages));
    const work = assistantDerived(context, () => unwrap(options.work ?? []));
    const questions = assistantDerived(context, () => unwrap(options.questions ?? []));
    const activity = assistantDerived(context, () => unwrap(options.activity));
    const panelOpen = context.signal(false);
    const selected = context.signal("");
    const selectedWork = assistantDerived(context, () => work.value.find((item) => item.id === selected.value));
    const latestHidden = context.signal(true);
    const bodyHidden = assistantDerived(context, () => !!selected.value);
    const detailHidden = assistantDerived(context, () => !selected.value);
    let viewport: HTMLElement | undefined;
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
        if (!disposed && !selected.value && opener?.isConnected) opener.focus({ preventScroll: true });
      });
    };
    const syncDialog = () => {
      if (!dialog?.isConnected) return;
      const opened = panelOpen.value;
      const nextCompact = !!root && root.clientWidth < 760;
      const active = dialog.ownerDocument.activeElement;
      if (dialog.open && (!opened || nextCompact !== compact)) dialog.close();
      compact = nextCompact;
      if (opened && !dialog.open) {
        if (compact) dialog.showModal();
        else dialog.show();
        if (active instanceof HTMLElement && dialog.contains(active)) active.focus({ preventScroll: true });
      }
    };
    context.effect(() => { panelOpen.value; syncDialog(); });
    context.effect(() => {
      if (selected.value && !selectedWork.value) selected.value = "";
    });
    context.onCleanup(() => { disposed = true; scroll?.dispose(); if (dialog?.open) dialog.close(); });

    const transcript = keyed(messages, (message) => message.id, (value) => h(AssistantMessageView, { value, renderPart: options.renderPart }));
    const messageRegion = context.part("messages", "section", null,
      context.part("viewport", "div", {
        role: "region", "aria-label": assistantCopy.messages, tabIndex: 0,
        ref: (element: HTMLElement) => {
          viewport = element;
          queueMicrotask(() => {
            if (disposed || !content) return;
            scroll = assistantScroll(element, content, (latest) => { latestHidden.value = latest; });
            let queued = false;
            const stop = messages.subscribe(() => {
              // Signal item changes patch synchronously. A microtask handles final layout once.
              if (!queued) { queued = true; queueMicrotask(() => { queued = false; if (!disposed) scroll?.afterUpdate(); }); }
            });
            context.onCleanup(stop);
          });
        },
      },
        context.part("content", "div", { ref: (element: HTMLElement) => { content = element; } },
          options.onLoadOlder ? h(Button, { variant: "quiet", size: "small", disabled: options.loadingOlder, onClick: () => { scroll?.beforeUpdate(); options.onLoadOlder!(); }, children: assistantCopy.older }) : null,
          context.part("feedback", "p", { role: "status", hidden: assistantDerived(context, () => unwrap(options.readState ?? "ready") === "ready") },
            assistantDerived(context, () => unwrap(options.readFeedback ?? "") || (unwrap(options.readState ?? "ready") === "loading" ? assistantCopy.loading : assistantCopy.readError)),
          ),
          context.part("empty", "div", { hidden: assistantDerived(context, () => messages.value.length > 0 || unwrap(options.readState ?? "ready") !== "ready") },
            h("h2", null, assistantCopy.empty), h("p", null, assistantCopy.emptyDescription),
          ),
          h(ChatMessageList, { ariaLabel: assistantCopy.messages, children: transcript }),
        ),
      ),
      context.part("latest", "div", null,
        h(Button, { variant: "outline", size: "small", hidden: latestHidden, onClick: () => scroll?.latest(), children: assistantCopy.latest }),
      ),
    );
    const activityList = context.part("activityBody", "div", { hidden: bodyHidden },
      context.part("section", "section", null,
        h("h3", null, assistantCopy.current),
        context.part("status", "p", null,
          h(StatusDot, { state: assistantDerived(context, () => activity.value?.tone ?? "idle") }),
          assistantDerived(context, () => activity.value?.statusText ?? assistantCopy.noActivity),
        ),
        h("strong", null, assistantDerived(context, () => activity.value?.title ?? "")),
        h("p", null, assistantDerived(context, () => activity.value?.description ?? "")),
        h(AssistantSteps, { steps: assistantDerived(context, () => activity.value?.steps ?? []) }),
      ),
      context.part("section", "section", null,
        h("h3", null, assistantCopy.background),
        h("p", { hidden: assistantDerived(context, () => work.value.length > 0) }, assistantCopy.noWork),
        keyed(work, (item) => item.id, (value) => h(AssistantWorkRow, { value, actionLabel: assistantCopy.details, onOpen: (id: string, button: HTMLElement) => {
          detailOpener = button; selected.value = id;
          queueMicrotask(() => {
            if (!disposed && panelOpen.value && selected.value === id)
              dialog?.querySelector<HTMLElement>("[data-assistant-back]")?.focus();
          });
        } })),
      ),
      context.part("section", "section", { hidden: assistantDerived(context, () => questions.value.length === 0) },
        h("h3", null, assistantCopy.questions),
        keyed(questions, (question) => question.id, (value) => h(AssistantQuestionView, { value, labels: options.labels, onAnswer: options.onAnswer, onDismiss: options.onDismissQuestion })),
      ),
    );
    const activityPanel = h(Dialog, {
      labelledBy: undefined, "aria-label": assistantCopy.activity,
      "data-assistant-panel": true,
      ref: (element: HTMLDialogElement) => { dialog = element; queueMicrotask(syncDialog); },
      onCancel: (event: Event) => { event.preventDefault(); close(); },
      onKeyDown: (event: KeyboardEvent) => {
        if (event.key === "Escape" && !compact && !event.defaultPrevented) { event.preventDefault(); close(); }
      },
      children: [
        context.part("activityHeader", "header", null,
          h(Button, { variant: "quiet", size: "small", "data-assistant-back": true, hidden: detailHidden, onClick: back, children: assistantCopy.back }),
          h("h2", null, assistantCopy.activity),
          h(Button, { variant: "quiet", size: "small", onClick: close, "aria-label": assistantCopy.close, children: "×" }),
        ),
        activityList,
        context.part("workDetail", "div", { hidden: detailHidden }, h(AssistantWorkDetail, { value: selectedWork, options })),
      ],
    });
    return context.part("root", "section", {
      id: options.id,
      style: options.style,
      "aria-label": options["aria-label"],
      className: options.className,
      "data-activity-open": assistantDerived(context, () => String(panelOpen.value)),
      ref: (element: HTMLElement) => {
        root = element;
        const observer = new ResizeObserver(syncDialog);
        observer.observe(element);
        return () => { observer.disconnect(); root = undefined; };
      },
    },
      h(PageFrame, { variant: "workspace", header: h(ChatHeader, {
        title: options.title ?? assistantCopy.title, description: options.description,
        actions: [options.headerActions, h(Button, {
          variant: "quiet", size: "small", "aria-expanded": assistantDerived(context, () => String(panelOpen.value)),
          ref: (element: HTMLElement) => { activityTrigger = element; },
          onClick: () => { panelOpen.value = !panelOpen.value; }, children: assistantCopy.activity,
        })],
      }),
        children: context.part("layout", "div", null,
          messageRegion,
          context.part("composer", "div", null, h(AssistantComposer, { options })),
          activityPanel,
        ),
      }),
    );
  },
);

export type { AssistantViewProps, AssistantDraft, AssistantAttachment, AssistantMessage, AssistantMessagePart, AssistantProcessStep, AssistantActivity, AssistantWork, AssistantQuestion, AssistantChoice, AssistantLabels } from "./assistant-types";
export { assistantCopy } from "./assistant-types";
