import type { Child, MaybeSignal, Props } from "meowjsx";
import type { ChatAttachmentItem } from "./attachments";
import type { ChatMessageRole, ChatMessageStatus } from "./message";
import type { StatusDotState } from "../components/status-dot";

export interface AssistantAttachment extends Omit<ChatAttachmentItem, "onRemove"> {
  /** Optional local source. The component never uploads or persists files. */
  file?: File;
}

export interface AssistantDraft {
  text: string;
  attachments: readonly AssistantAttachment[];
}

export interface AssistantProcessStep {
  id: string;
  title: string;
  description?: string;
  statusText?: string;
  tone?: StatusDotState;
}

export type AssistantMessagePart =
  | { id: string; kind: "text"; text: string }
  | { id: string; kind: "code"; code: string; language?: string }
  | {
      id: string;
      kind: "process";
      title: string;
      statusText?: string;
      steps: readonly AssistantProcessStep[];
      defaultOpen?: boolean;
    }
  | { id: string; kind: "attachments"; items: readonly AssistantAttachment[] };

export interface AssistantMessage {
  id: string;
  role: ChatMessageRole;
  author: string;
  timestamp?: string;
  status?: ChatMessageStatus;
  parts: readonly AssistantMessagePart[];
}

export interface AssistantActivity {
  title: string;
  statusText: string;
  tone?: StatusDotState;
  description?: string;
  steps?: readonly AssistantProcessStep[];
}

/** Display facts supplied by the owner. Returned execution and a published reply are distinct. */
export interface AssistantWork {
  id: string;
  title: string;
  summary?: string;
  statusText: string;
  tone?: StatusDotState;
  executionText?: string;
  replyText?: string;
  detail?: string;
  readState?: "ready" | "loading" | "error" | "unavailable";
  feedback?: string;
  steps?: readonly AssistantProcessStep[];
}

export interface AssistantQuestion {
  id: string;
  title: string;
  description?: string;
  options?: readonly { value: string; label: string }[];
  state: "open" | "submitting" | "answered" | "unavailable";
  feedback?: string;
}

export interface AssistantChoice {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface AssistantViewProps extends Props {
  title?: string;
  description?: string;
  messages: MaybeSignal<readonly AssistantMessage[]>;
  /** First loading, empty, and refresh failure with retained messages are separate states. */
  readState?: MaybeSignal<"ready" | "loading" | "error">;
  readFeedback?: MaybeSignal<string>;
  activity?: MaybeSignal<AssistantActivity | undefined>;
  work?: MaybeSignal<readonly AssistantWork[]>;
  questions?: MaybeSignal<readonly AssistantQuestion[]>;
  /** Supplying draft makes the host its sole owner, even for a plain value. */
  draft?: MaybeSignal<AssistantDraft>;
  defaultDraft?: AssistantDraft;
  readOnly?: boolean;
  onDraftChange?: (draft: AssistantDraft) => void;
  /** Only an explicit accepted:true may clear an unchanged submitted snapshot. */
  onSubmit?: (draft: AssistantDraft) =>
    | { accepted: boolean }
    | Promise<{ accepted: boolean }>;
  /** Host attachment ingestion. Return normalized entries or update controlled draft. No upload is implicit. */
  onAttach?: (files: readonly File[]) =>
    | readonly AssistantAttachment[]
    | void
    | Promise<readonly AssistantAttachment[] | void>;
  /** Disable local file selection when the host supports only already-normalized attachments. */
  allowAttachments?: boolean;
  disabled?: MaybeSignal<boolean>;
  disabledReason?: MaybeSignal<string>;
  models?: MaybeSignal<readonly AssistantChoice[]>;
  model?: MaybeSignal<string>;
  onModelChange?: (value: string) => void;
  reasoningOptions?: MaybeSignal<readonly AssistantChoice[]>;
  reasoning?: MaybeSignal<string>;
  onReasoningChange?: (value: string) => void;
  onAnswer?: (questionId: string, answer: string) => void | Promise<void>;
  onDismissQuestion?: (questionId: string) => void;
  onRefreshWork?: (workId: string) => void;
  onLoadOlder?: () => void;
  loadingOlder?: MaybeSignal<boolean>;
  /** Return undefined to keep the default renderer for this one part. */
  renderPart?: (part: AssistantMessagePart, message: AssistantMessage) => Child | undefined;
  renderWorkDetail?: (work: AssistantWork) => Child | undefined;
  composerTrailing?: Child;
  headerActions?: Child;
  className?: string;
  labels?: Partial<AssistantLabels>;
}

/** Central default copy, overridable through the component's data and localized host wrappers. */
export const assistantCopy = {
  title: "Assistant",
  messages: "Messages",
  latest: "Back to latest",
  older: "Load older messages",
  loading: "Loading messages…",
  empty: "How can I help?",
  emptyDescription: "Write a message or attach a file to begin.",
  readError: "Messages could not be refreshed. Previously read messages are retained.",
  composer: "Message",
  placeholder: "Write a message…",
  send: "Send message",
  attach: "Attach files",
  model: "Model",
  reasoning: "Reasoning",
  rejected: "The message was not accepted. Your draft is retained.",
  submitError: "The message could not be sent. Your draft is retained.",
  attachError: "The files could not be attached. Your draft is retained.",
  activity: "Activity",
  close: "Close activity",
  back: "Back to activity",
  current: "Current activity",
  noActivity: "No current activity reported.",
  background: "Background work",
  noWork: "No background work reported.",
  questions: "Needs your answer",
  answer: "Answer",
  answerPlaceholder: "Write your answer…",
  dismiss: "Dismiss",
  answerError: "The answer could not be submitted. Your answer is retained.",
  questionSubmitting: "Submitting answer…",
  questionAnswered: "Answer received",
  questionUnavailable: "This question is no longer available.",
  workLoading: "Loading details…",
  workError: "Details could not be refreshed. Previously read content is retained.",
  workUnavailable: "These details are no longer available.",
  refresh: "Refresh details",
  details: "Details",
} as const;

export type AssistantLabels = { readonly [Key in keyof typeof assistantCopy]: string };
