import { h, type Child } from "meowjsx";
import type { MaybeSignal } from "meowjsx/signal";
import {
  AppBar,
  Grid,
  NavList,
  PageFrame,
  Toolbar,
  type NavListGroup,
  type NavListItem,
} from "meowtail";

export interface WorkbenchShellProps {
  title: Child;
  status?: Child;
  actions?: Child;
  navigationLabel: string;
  /** Navigation groups are fixed for the mount. */
  navigation: readonly NavListGroup[];
  activeId?: MaybeSignal<string>;
  onSelect?: (item: NavListItem) => void;
  toolbarLabel: string;
  toolbar?: Child;
  children?: Child;
}

/** A workbench frame; the host owns navigation, actions and the main content. */
export function WorkbenchShell(props: WorkbenchShellProps) {
  return (
    <PageFrame
      variant="workspace"
      header={<AppBar title={props.title} status={props.status} actions={props.actions} />}
      toolbar={
        props.toolbar ? <Toolbar label={props.toolbarLabel}>{props.toolbar}</Toolbar> : undefined
      }
    >
      <Grid minColumnWidth="compact">
        <NavList
          label={props.navigationLabel}
          groups={props.navigation}
          activeId={props.activeId}
          onSelect={props.onSelect}
        />
        <main>{props.children}</main>
      </Grid>
    </PageFrame>
  );
}
