import { defineComponent, type ComponentContract, type Props } from "meowjsx";

export const inputContract = {
  name: "input",
  parts: ["root"],
} as const satisfies ComponentContract;

export interface InputProps extends Props {
  type?: string;
  className?: string;
}

export const Input = defineComponent<
  InputProps,
  typeof inputContract.name,
  (typeof inputContract.parts)[number]
>(inputContract, ({ className, type = "text", ...props }, context) =>
  context.part("root", "input", { ...props, type, className }),
);
