import { h, type Child, type Component } from "meowjsx";
import {
  AddButton,
  Badge,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogHeader,
  DialogPanel,
  EmptyState,
  Field,
  IconButton,
  Input,
  Inline,
  NavItem,
  Separator,
  Textarea,
  Toolbar,
  PageFrame,
  Drawer,
} from "../../src/components";

const button: JSX.Element = (
  <Button variant="danger" size="small" type="submit">
    Delete
  </Button>
);
const iconButton: JSX.Element = (
  <IconButton label="Close" size="small">
    ×
  </IconButton>
);
const addButton: JSX.Element = <AddButton className="toolbar-add" />;
const emptyState: JSX.Element = <EmptyState title="Empty" action={addButton} />;
const compactEmptyState: JSX.Element = <EmptyState title="Empty" size="compact" />;
// @ts-expect-error Empty-state sizes describe two supported presentation roles.
const invalidEmptyState: JSX.Element = <EmptyState title="Empty" size="tiny" />;
void compactEmptyState;
void invalidEmptyState;
const card: JSX.Element = <Card as="article">Content</Card>;
const inlineSlot: JSX.Element = <Inline as="span">Inline slot content</Inline>;
void inlineSlot;
const badge: JSX.Element = <Badge tone="accent">Demo</Badge>;
const field: JSX.Element = (
  <Field label="Name" description="Optional description">
    <Input name="name" />
  </Field>
);
const dialog: JSX.Element = (
  <Dialog labelledBy="dialog-title">
    <DialogPanel as="form" header={<DialogHeader title="Confirm" />}>
      <Textarea name="reason" />
      <DialogActions>
        <Button variant="quiet">Cancel</Button>
      </DialogActions>
    </DialogPanel>
  </Dialog>
);
const framedBody: JSX.Element = (
  <PageFrame variant="workspace" scrollOwner="layout" header={<DialogHeader title="Body" />}>
    Content
  </PageFrame>
);
const drawer: JSX.Element = (
  <Drawer
    label="Navigation"
    open={false}
    onOpenChange={() => {}}
    header={<DialogHeader title="Navigation" />}
  >
    Content
  </Drawer>
);
// @ts-expect-error Main body scrolling retains finite ownership choices.
const invalidFrame: JSX.Element = <PageFrame scrollOwner="both">Content</PageFrame>;
void framedBody;
void drawer;
void invalidFrame;
const navItem: JSX.Element = <NavItem label="Event stream" active badge="3" />;
const separator: JSX.Element = <Separator orientation="vertical" />;
const toolbar: JSX.Element = (
  <Toolbar label="Edit tools" orientation="vertical">
    {iconButton}
  </Toolbar>
);

const ComponentWithChildren: Component<{ children?: Child }> = ({ children }) => children;
const composed: JSX.Element = (
  <ComponentWithChildren>
    {button}
    {iconButton}
    {emptyState}
    {card}
    {badge}
    {field}
    {dialog}
    {navItem}
    {separator}
    {toolbar}
  </ComponentWithChildren>
);

void composed;

// @ts-expect-error IconButton requires an accessible label.
const _missingLabel = <IconButton>×</IconButton>;
