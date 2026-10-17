import { css, partSelector } from "meowcss/meowjsx";
import { riskConfirmationContract } from "../../components/risk-confirmation";
import { dialogPanelContract } from "../../components/dialog";

export const riskConfirmationStyles = css`
  ${partSelector(riskConfirmationContract, "root")} ${partSelector(dialogPanelContract, "root")} {
    display: grid;
    gap: 20px;
  }
`;
