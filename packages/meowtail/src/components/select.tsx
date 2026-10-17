import { defineComponent, type ComponentContract, type Props, type MaybeSignal } from "meowjsx";

export const selectContract = {
  name: "select",
  parts: ["root"],
} as const satisfies ComponentContract;

/** Native options, selection, keyboard interaction and form behavior. */
export interface SelectProps extends Props {
  value?: MaybeSignal<string>;
  name?: string;
  disabled?: MaybeSignal<boolean>;
  required?: boolean;
  multiple?: boolean;
  size?: number;
  onChange?: (event: Event) => void;
  className?: string;
}

export const Select = defineComponent<
  SelectProps,
  typeof selectContract.name,
  (typeof selectContract.parts)[number]
>(selectContract, ({ children, ...props }, context) =>
  context.part("root", "select", props, children),
);
