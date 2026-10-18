import { h, type Child } from "meowjsx";
import { Search, type IconNode as LucideIconNode } from "lucide";
import { Icon, IconSource, type IconProps, type IconSourceProps } from "../../src/icons";

// Consumer icon libraries expose mutable node tuples; the public source type
// accepts them structurally without importing Lucide into meowtail's types.
const callerData: LucideIconNode = Search;
const sourceProps: IconSourceProps = { source: callerData, size: 16, label: "Search" };
export const sourceView: Child = <IconSource {...sourceProps} />;

// The finite semantic entry point keeps its extendable props interface.
export interface ExtendedIconProps extends IconProps {
  tone?: "quiet" | "strong";
}
const semanticView: Child = <Icon name="search" />;
export const iconViews: Child[] = [sourceView, semanticView];
