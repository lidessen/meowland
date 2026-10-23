import { css, partSelector } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import { statusContract } from "../../components/status";
import { statusDotContract } from "../../components/status-dot";
import { chatToolCallContract } from "../../chat/tool-call";
import { chatTaskContract } from "../../chat/task";
import { chatStatusContract } from "../../chat/status";
import { chatMessageContract } from "../../chat/message";
import { terminalBlockContract } from "../../components/terminal-block";

/*
 * One state badge for every place a state sits on a title line: Status, a tool row, a task
 * header. A dot is the state mark and a word names it, on a soft tint of the state's ink; the
 * badge is the only color in its row. A longer account of the state is the host's fact line
 * beneath the title, never a longer badge. Each carrier writes data-tone with the StatusDot
 * state it shows.
 */
const badges = `:where(${[
  partSelector(statusContract, "root"),
  partSelector(chatToolCallContract, "status"),
  partSelector(chatTaskContract, "status"),
  partSelector(chatStatusContract, "root"),
  partSelector(chatMessageContract, "status"),
  partSelector(terminalBlockContract, "status"),
].join(", ")})`;
const dot = partSelector(statusDotContract, "root");
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
  ${badges} > ${dot} {
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
