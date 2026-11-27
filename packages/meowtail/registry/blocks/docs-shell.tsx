import { h, type Child } from "meowjsx";
import type { MaybeSignal } from "meowjsx/signal";
import {
  AppBar,
  Grid,
  NavList,
  Page,
  Section,
  type NavListGroup,
  type NavListItem,
} from "meowtail";

export interface DocsShellProps {
  siteTitle: Child;
  siteActions?: Child;
  navigationLabel: string;
  /** Navigation and outline groups are fixed for the mount. */
  navigation: readonly NavListGroup[];
  activeId?: MaybeSignal<string>;
  onSelect?: (item: NavListItem) => void;
  title: Child;
  description?: Child;
  actions?: Child;
  sectionTitle?: Child;
  outlineLabel?: string;
  outline?: readonly NavListGroup[];
  children?: Child;
}

/** Documentation chrome with host-owned routing, page content and outline. */
export function DocsShell(props: DocsShellProps) {
  return (
    <div>
      <AppBar title={props.siteTitle} actions={props.siteActions} />
      <Grid minColumnWidth="compact">
        <NavList
          label={props.navigationLabel}
          groups={props.navigation}
          activeId={props.activeId}
          onSelect={props.onSelect}
        />
        <main>
          <Page title={props.title} description={props.description} actions={props.actions}>
            <Section title={props.sectionTitle}>{props.children}</Section>
          </Page>
        </main>
        {props.outline ? (
          <NavList label={props.outlineLabel ?? "On this page"} groups={props.outline} />
        ) : null}
      </Grid>
    </div>
  );
}
