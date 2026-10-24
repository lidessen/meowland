import { type Child, type Props, type Context, h } from "meowjsx";

export interface ProcessStepProps extends Props {
  icon?: Child;
  /** Duration, count or other quiet fact at the row's end. */
  meta?: Child;
  className?: Props["className"];
}

/** One row of a ProcessGroup: icon, a single truncated line, a quiet fact. */
export function ProcessStep(
  { icon, meta, children, className, ...props }: ProcessStepProps,
  context: Context<typeof ProcessStep>,
) {
  return (
    <div {...props} className={className} ref={[context.parts.root, props.ref]}>
      <span aria-hidden="true" ref={[context.parts.icon]}>
        {icon}
      </span>
      <span ref={[context.parts.label]}>{children}</span>
      {meta ? <span ref={[context.parts.meta]}>{meta}</span> : null}
    </div>
  );
}
ProcessStep.meta = { name: "process-step", parts: ["root", "icon", "label", "meta"] } as const;
