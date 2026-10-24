import { css, parts } from "meowcss/meowjsx";
import { uiTokens } from "../tokens";
import type { SegmentedControl } from "../../components/segmented-control";
import { ui } from "../utilities";
const segmentedControlPartRefs = parts<typeof SegmentedControl>("segmented-control");
export const segmentedControlStyles = css`
  ${segmentedControlPartRefs.root} {
    /* A fieldset fills its block; the track hugs its choices like any other control. */
    width: fit-content;
    max-width: 100%;
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }
  ${segmentedControlPartRefs.legend} {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
  ${segmentedControlPartRefs.options} {
    display: flex;
    gap: 2px;
    /* Same track as Tabs: one control height, concentric radii. */
    padding: ${uiTokens.control.trackInset};
    border-radius: calc(${uiTokens.radius.md} + ${uiTokens.control.trackInset});
    background: ${uiTokens.surface.fill};
  }
  ${segmentedControlPartRefs.option} {
    position: relative;
    /* Grow from each label's own width so a long label keeps its padding;
       min-width 0 still lets a narrow container wrap the text. */
    flex: 1 1 auto;
    min-width: 0;
    cursor: pointer;
  }
  ${segmentedControlPartRefs.input} {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    cursor: inherit;
  }
  ${segmentedControlPartRefs.label} {
    display: block;
    box-sizing: border-box;
    min-height: calc(${uiTokens.control.regular} - 2 * ${uiTokens.control.trackInset});
    padding: 4px 12px;
    border-radius: ${uiTokens.radius.md};
    text-align: center;
    font: ${uiTokens.type.weight.medium} ${uiTokens.type.body} / ${uiTokens.type.line.body}
      ${uiTokens.type.sans};
    color: ${uiTokens.ink.secondary};
  }
  ${segmentedControlPartRefs.input}:checked + ${segmentedControlPartRefs.label} {
    background: ${uiTokens.control.thumb};
    color: ${uiTokens.ink.primary};
    box-shadow: ${uiTokens.shadow.thumb};
  }
  ${segmentedControlPartRefs.input}:focus-visible + ${segmentedControlPartRefs.label} {
    ${ui.focus.inset}
  }
  ${segmentedControlPartRefs.input}:disabled + ${segmentedControlPartRefs.label} {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;
