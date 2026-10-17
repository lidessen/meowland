import { defineComponent, type ComponentContract, type Props } from "meowjsx";

export const textareaContract = {
  name: "textarea",
  parts: ["root"],
} as const satisfies ComponentContract;

export interface TextareaProps extends Props {
  className?: string;
}

export const Textarea = defineComponent<
  TextareaProps,
  typeof textareaContract.name,
  (typeof textareaContract.parts)[number]
>(textareaContract, ({ children, className, ...props }, context) =>
  context.part("root", "textarea", { ...props, className }, children),
);
