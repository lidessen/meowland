import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";

import type { ChatMessage } from "../../chat/message";
import type { ChatStatus } from "../../chat/status";
import type { ChatTask } from "../../chat/task";
import type { ChatToolCall } from "../../chat/tool-call";
import type { Status } from "../../components/status";
import type { StatusDot } from "../../components/status-dot";
import type { TerminalBlock } from "../../components/terminal-block";
import { selectorForPart } from "../selectors";
const chatMessagePartRefs = parts<typeof ChatMessage>("chat-message");
const chatStatusPartRefs = parts<typeof ChatStatus>("chat-status");
const chatTaskPartRefs = parts<typeof ChatTask>("chat-task");
const chatToolCallPartRefs = parts<typeof ChatToolCall>("chat-tool-call");
const statusPartRefs = parts<typeof Status>("status");
const statusDotPartRefs = parts<typeof StatusDot>("status-dot");
const terminalBlockPartRefs = parts<typeof TerminalBlock>("terminal-block");
/*
 * One state badge for every place a state sits on a title line: Status, a tool row, a task
 * header. A dot is the state mark and a word names it, on a soft tint of the state's ink; the
 * badge is the only color in its row. A longer account of the state is the host's fact line
 * beneath the title, never a longer badge. Each carrier writes data-tone with the StatusDot
 * state it shows.
 */
const badges = `:where(${[
  selectorForPart(statusPartRefs.root),
  selectorForPart(chatToolCallPartRefs.status),
  selectorForPart(chatTaskPartRefs.status),
  selectorForPart(chatStatusPartRefs.root),
  selectorForPart(chatMessagePartRefs.status),
  selectorForPart(terminalBlockPartRefs.status),
].join(", ")})`;
const dot = statusDotPartRefs.root;
const tone = (name: string) => `:where(${badges}[data-tone="${name}"])`;

export const stateBadgeStyles = css`
  ${badges} {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex: 0 0 auto;
    box-sizing: border-box;
    /* A badge hugs its words wherever it is placed, never stretching with a stack. */
    width: fit-content;
    max-width: 100%;
    min-height: 20px;
    padding: 2px 8px;
    /* Half the one-line height: a pill on one line, a soft block if a long label wraps. */
    border-radius: ${uiTokens.radius.lg};
    background: ${uiTokens.surface.fill};
    color: ${uiTokens.ink.secondary};
    font: ${uiTokens.type.weight.medium} ${uiTokens.type.micro} / ${uiTokens.type.line.micro}
      ${uiTokens.type.sans};
    letter-spacing: 0;
    overflow-wrap: anywhere;
  }
  ${badges} > ${selectorForPart(dot)} {
    flex: 0 0 auto;
    align-self: flex-start;
    width: 6px;
    height: 6px;
    margin-top: 5px;
  }
  ${tone("processing")},
  ${tone("busy")} {
    background: ${uiTokens.accent.soft};
    color: ${uiTokens.accent.ink};
  }
  ${tone("success")},
  ${tone("returned")},
  ${tone("online")} {
    background: color-mix(in srgb, ${uiTokens.status.success} 10%, transparent);
    color: ${uiTokens.status.success};
  }
  ${tone("warning")},
  ${tone("waiting")} {
    background: color-mix(in srgb, ${uiTokens.status.warning} 12%, transparent);
    color: ${uiTokens.status.warning};
  }
  ${tone("danger")},
  ${tone("error")} {
    background: color-mix(in srgb, ${uiTokens.status.danger} 10%, transparent);
    color: ${uiTokens.status.danger};
  }
  ${tone("idle")} {
    color: ${uiTokens.ink.tertiary};
  }
`;
