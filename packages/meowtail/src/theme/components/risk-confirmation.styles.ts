import { css, parts } from "meowcss/meowjsx";

import type { DialogPanel } from "../../components/dialog";
import type { RiskConfirmation } from "../../components/risk-confirmation";
const dialogPanelPartRefs = parts<typeof DialogPanel>("dialog-panel");
const riskConfirmationPartRefs = parts<typeof RiskConfirmation>("risk-confirmation");
export const riskConfirmationStyles = css`
  ${riskConfirmationPartRefs.root} ${dialogPanelPartRefs.root} {
    display: grid;
    gap: 20px;
  }
`;
