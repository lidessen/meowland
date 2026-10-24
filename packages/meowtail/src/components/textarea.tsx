import { h, type Context, type Props } from "meowjsx";

export interface TextareaProps extends Props {
  className?: Props["className"];
}

/** A multi-line text input. */
export function Textarea(
  { children, className, ref, ...props }: TextareaProps,
  context: Context<typeof Textarea>,
) {
  return (
    <textarea {...props} className={className} ref={[context.parts.root, ref]}>
      {children}
    </textarea>
  );
}
Textarea.meta = { name: "textarea", parts: ["root"] } as const;
