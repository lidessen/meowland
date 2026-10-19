import { h, type Child, type MaybeSignal } from "meowjsx";
import { Button, type ButtonProps } from "./button";
import { Icon } from "../icons/icon";
import { Menu, type MenuEntry } from "./menu";

export interface MenuButtonProps extends Omit<ButtonProps, "id" | "onClick"> {
  id: string;
  items: readonly MenuEntry[];
  open?: MaybeSignal<boolean>;
  onOpenChange?: (open: boolean) => void;
  align?: "start" | "end";
  children?: Child;
}

/** A button that opens the existing Menu below it, including nested items. */
export function MenuButton({
  id,
  items,
  open,
  onOpenChange,
  align,
  children,
  ...button
}: MenuButtonProps): Child {
  return (
    <Menu
      id={id}
      items={items}
      open={open}
      onOpenChange={onOpenChange}
      align={align}
      trigger={(bindings) => (
        <Button {...button} {...bindings}>
          {children}
          <Icon name="chevron-down" />
        </Button>
      )}
    />
  );
}
