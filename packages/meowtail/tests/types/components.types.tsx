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
  Alert,
  EmptyState,
  Field,
  IconButton,
  Input,
  Inline,
  Link,
  NumberInput,
  Progress,
  Slider,
  Avatar,
  Accordion,
  Table,
  MenuButton,
  ContextMenu,
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
const alert: JSX.Element = (
  <Alert tone="neutral" marker="none" layout="bar">
    Kept locally.
  </Alert>
);
void alert;
// @ts-expect-error Alert tones are neutral, info, success, warning, and danger.
const invalidAlert: JSX.Element = <Alert tone="quiet">No</Alert>;
void invalidAlert;
const emptyState: JSX.Element = <EmptyState title="Empty" action={addButton} />;
const illustratedEmptyState: JSX.Element = (
  <EmptyState title="Empty" illustration={<span>Mark</span>} />
);
const quietEmptyState: JSX.Element = <EmptyState title="Empty" illustration={null} />;
void illustratedEmptyState;
void quietEmptyState;
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
const progress: JSX.Element = <Progress label="Copying" value={1} max={4} />;
const avatar: JSX.Element = <Avatar name="Ada Lovelace" size="small" />;
const link: JSX.Element = <Link href="#docs">Docs</Link>;
const slider: JSX.Element = <Slider label="Volume" defaultValue={40} />;
const numberInput: JSX.Element = <NumberInput defaultValue={2} min={1} max={12} />;
const accordion: JSX.Element = (
  <Accordion items={[{ id: "general", summary: "General", content: "Body" }]} />
);
const table: JSX.Element = (
  <Table
    label="Files"
    columns={[{ id: "name", header: "Name", sortable: true }]}
    rows={[{ id: "a", cells: ["alpha.md"] }]}
  />
);
const menuButton: JSX.Element = (
  <MenuButton id="export" items={[{ id: "text", label: "Plain text" }]}>
    Export
  </MenuButton>
);
const contextMenu: JSX.Element = (
  <ContextMenu id="file" items={[{ id: "open", label: "Open" }]}>
    Region
  </ContextMenu>
);
void progress;
void avatar;
void link;
void slider;
void numberInput;
void accordion;
void table;
void menuButton;
void contextMenu;
// @ts-expect-error Avatar sizes are the three control scales.
const invalidAvatar: JSX.Element = <Avatar name="Ada" size="tiny" />;
void invalidAvatar;
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
