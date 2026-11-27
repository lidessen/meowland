import { h, type Child } from "meowjsx";
import { Button, type AddButtonProps } from "./button";
import { PlusIcon } from "../icons/plus";

export type { AddButtonProps } from "./button";

/**
 * @deprecated Compose an add action with `<Button><Icon name="plus" />...</Button>` instead.
 */
export function AddButton(props: AddButtonProps): Child {
  return (
    <Button {...props}>
      <PlusIcon />
      {props.children ?? "Add"}
    </Button>
  );
}
