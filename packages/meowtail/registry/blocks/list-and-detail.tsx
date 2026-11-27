import { h, type Child } from "meowjsx";
import type { MaybeSignal } from "meowjsx/signal";
import {
  ActionRow,
  DetailSection,
  Grid,
  MetaRow,
  NavList,
  SearchInput,
  Stack,
  type MetaItem,
  type NavListGroup,
  type NavListItem,
} from "meowtail";

export interface ListAndDetailProps {
  searchLabel: string;
  searchValue?: MaybeSignal<string>;
  onSearchInput?: (event: Event) => void;
  listLabel: string;
  /** Groups are fixed for the mount; the host owns filtering and remounting. */
  groups: readonly NavListGroup[];
  activeId?: MaybeSignal<string>;
  onSelect?: (item: NavListItem) => void;
  detailTitle: Child;
  metadata: MaybeSignal<readonly MetaItem[]>;
  actions?: Child;
  children?: Child;
}

/** A searchable master list alongside a host-provided detail. */
export function ListAndDetail(props: ListAndDetailProps) {
  return (
    <Grid minColumnWidth="compact">
      <Stack>
        <SearchInput
          label={props.searchLabel}
          value={props.searchValue}
          onInput={props.onSearchInput}
        />
        <NavList
          label={props.listLabel}
          groups={props.groups}
          activeId={props.activeId}
          onSelect={props.onSelect}
        />
      </Stack>
      <DetailSection title={props.detailTitle}>
        <Stack>
          <MetaRow items={props.metadata} />
          {props.children}
          {props.actions ? <ActionRow>{props.actions}</ActionRow> : null}
        </Stack>
      </DetailSection>
    </Grid>
  );
}
