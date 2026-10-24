import { extendStandardTheme } from "meowtail/theme";
import { listRowStyles, ListRow } from "./list-row";
import { planBadgeStyles, PlanBadge } from "./plan-badge";
import { statCardStyles, StatCard } from "./stat-card";

export const appStyles = [planBadgeStyles, statCardStyles, listRowStyles] as const;

export const appComponents = [PlanBadge, StatCard, ListRow] as const;

export const appTheme = extendStandardTheme({ styles: [...appStyles] });
