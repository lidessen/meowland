import { css, parts } from "meowcss/meowjsx";

import type { Status } from "../../components/status";
const statusPartRefs = parts<typeof Status>("status");
const label = statusPartRefs.label;

export const statusStyles = css`
  /* The badge itself comes from shared/state-badge.styles.ts. */
  ${label} {
    min-width: 0;
  }
`;
