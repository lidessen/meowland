import { PresentationLayout, type PresentationLayoutProps } from "./presentation/layout";
import { PresentationAudio, PresentationVideo } from "./presentation/media";
import { PresentationImage } from "./presentation/image";
import { Reveal } from "./presentation/reveal";
import { h, type Context, type Props } from "meowjsx";

interface MDXSlideProps extends Props {
  title?: string;
  columns?: PresentationLayoutProps["columns"];
}

export function MDXSlide(
  { title, columns = 1, children, ref, ...props }: MDXSlideProps,
  context: Context<typeof MDXSlide>,
) {
  const parts = context.parts;
  if (title === undefined)
    return (
      <div {...props} ref={[parts.flow, ref]}>
        {children}
      </div>
    );
  return (
    <div ref={[parts.root, ref]} data-meowslides-mdx="">
      <PresentationLayout columns={columns} header={<h1>{title}</h1>}>
        {columns === 1 || columns === "single" ? <div ref={parts.flow}>{children}</div> : children}
      </PresentationLayout>
    </div>
  );
}
MDXSlide.meta = { name: "mdx-slide", parts: ["root", "flow"] } as const;

export const mdxComponents = {
  MDXDeck: ({ children }: Props) => children,
  MDXSlidePage: MDXSlide,
  MDXSlideColumn: MDXSlide,
  PresentationImage,
  PresentationVideo,
  PresentationAudio,
  Reveal,
};
