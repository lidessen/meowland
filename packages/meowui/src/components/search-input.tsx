import { defineComponent, h, type ComponentContract, type MaybeSignal, type Props } from "meowjsx";
import { Icon } from "../icons/icon";

export const searchInputContract = {
  name: "search-input",
  parts: ["root", "icon", "control"],
} as const satisfies ComponentContract;

export interface SearchInputProps extends Props {
  /** Accessible name; placeholder text is only a hint. */
  label: string;
  value?: MaybeSignal<string>;
  name?: string;
  disabled?: boolean;
  readOnly?: boolean;
  onInput?: (event: Event) => void;
  className?: string;
  inputClassName?: string;
}

/** Native search editing and form semantics; filtering belongs to the consumer. */
export const SearchInput = defineComponent<
  SearchInputProps,
  typeof searchInputContract.name,
  (typeof searchInputContract.parts)[number]
>(
  searchInputContract,
  ({ label, className, inputClassName, children: _children, ...props }, context) =>
    context.part(
      "root",
      "div",
      { className },
      context.part("icon", "span", { "aria-hidden": "true" }, h(Icon, { name: "search" })),
      context.part("control", "input", {
        ...props,
        type: "search",
        "aria-label": label,
        className: inputClassName,
      }),
    ),
);
