import { css, partSelector } from "meowcss/meowjsx";
import { statusContract } from "../../components/status";

const label = partSelector(statusContract, "label");

export const statusStyles = css`
  /* The badge itself comes from shared/state-badge.styles.ts. */
  ${label} {
    min-width: 0;
  }
`;
