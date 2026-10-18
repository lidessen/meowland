import { h } from "meowjsx";
import { Presentation, createMeowSlides, type PresentationProps } from "meowslides";
import { createMeowSlides as registryFactory } from "meowslides/registry";
import { presentationTheme, presentationOptions } from "meowslides/theme";

const props: PresentationProps = {
  title: "A migrated deck",
  slides: [{ id: "one", title: "One", render: () => <p>One</p> }],
};
const view = <Presentation {...props} />;
void [view, createMeowSlides, registryFactory, presentationTheme, presentationOptions];
// @ts-expect-error Presentation now belongs exclusively to MeowSlides.
import { Presentation as RemovedRootPresentation } from "meowtail";
// @ts-expect-error The removed Meowtail subpath does not reverse-export MeowSlides.
import { Presentation as RemovedSubpathPresentation } from "meowtail/presentation";
void [RemovedRootPresentation, RemovedSubpathPresentation];
