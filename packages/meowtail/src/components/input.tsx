import { h, type Props, type Context } from "meowjsx";

export interface InputProps extends Props {
  type?: string;
  className?: Props["className"];
}

/** A single-line text input. */
export function Input(
  { className, type = "text", ref, ...props }: InputProps,
  context: Context<typeof Input>,
) {
  return <input {...props} type={type} className={className} ref={[context.parts.root, ref]} />;
}
Input.meta = { name: "input", parts: ["root"] } as const;
