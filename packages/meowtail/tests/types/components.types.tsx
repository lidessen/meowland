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
    删除
  </Button>
);
const iconButton: JSX.Element = (
  <IconButton label="关闭" size="small">
    ×
  </IconButton>
);
const addButton: JSX.Element = <AddButton className="toolbar-add" />;
const emptyState: JSX.Element = <EmptyState title="空" action={addButton} />;
const compactEmptyState: JSX.Element = <EmptyState title="空" size="compact" />;
// @ts-expect-error Empty-state sizes describe two supported presentation roles.
const invalidEmptyState: JSX.Element = <EmptyState title="空" size="tiny" />;
void compactEmptyState;
void invalidEmptyState;
const card: JSX.Element = <Card as="article">内容</Card>;
const inlineSlot: JSX.Element = <Inline as="span">Inline slot content</Inline>;
void inlineSlot;
const badge: JSX.Element = <Badge tone="accent">演示</Badge>;
const field: JSX.Element = (
  <Field label="名称" description="可选说明">
    <Input name="name" />
  </Field>
);
const dialog: JSX.Element = (
  <Dialog labelledBy="dialog-title">
    <DialogPanel as="form" header={<DialogHeader title="确认" />}>
      <Textarea name="reason" />
      <DialogActions>
        <Button variant="quiet">取消</Button>
      </DialogActions>
    </DialogPanel>
  </Dialog>
);
const framedBody: JSX.Element = (
  <PageFrame variant="workspace" scrollOwner="layout" header={<DialogHeader title="正文" />}>
    内容
  </PageFrame>
);
const drawer: JSX.Element = (
  <Drawer label="导航" open={false} onOpenChange={() => {}} header={<DialogHeader title="导航" />}>
    内容
  </Drawer>
);
// @ts-expect-error Main body scrolling retains finite ownership choices.
const invalidFrame: JSX.Element = <PageFrame scrollOwner="both">内容</PageFrame>;
void framedBody;
void drawer;
void invalidFrame;
const navItem: JSX.Element = <NavItem label="事件流" active badge="3" />;
const separator: JSX.Element = <Separator orientation="vertical" />;
const toolbar: JSX.Element = (
  <Toolbar label="编辑工具" orientation="vertical">
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
