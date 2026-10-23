// The whole host wiring: one plugin for the host's contracts, one theme assembled after the standard one.
import type { RuntimePlugin } from "meowjsx";
import { extendStandardTheme } from "meowtail/theme";
import { listRowContract, listRowStyles } from "./list-row";
import { planBadgeContract, planBadgeStyles } from "./plan-badge";
import { statCardContract, statCardStyles } from "./stat-card";

export const appStyles = [planBadgeStyles, statCardStyles, listRowStyles] as const;

/** Install after createMeowUI(); it adds contracts only and never a second style-props plugin. */
export const appComponents: RuntimePlugin = {
  name: "app-components",
  components: [planBadgeContract, statCardContract, listRowContract],
};

export const appTheme = extendStandardTheme({ styles: [...appStyles] });
