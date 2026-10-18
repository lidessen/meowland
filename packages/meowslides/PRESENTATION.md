# Player and lifecycle contract

`meowslides` provides `Presentation`, `Reveal`, `PresentationVideo`, `PresentationAudio` and
`usePresentationActivity`; the root entry point re-exports the same implementations, keeping the same
MeowJSX/Context/theme identity. The content area uses the replaceable header/footer of
`PresentationLayout`, `1 | 2 | 3` equal-width columns or the existing named column ratios; common
title, text-image, comparison, number, process and summary compositions are in
[Presentation content layout](PRESENTATION-LAYOUTS.md).
`PresentationList items={...}` renders a native ul/li, and `as="ol"` can still pass start/reversed; it
uses the presentation body token (28px by default in the standard theme), adds no separate
size/density, and does not automatically compress infinitely long content.
Body images use `PresentationImage src alt`, defaulting to 16:9, contain and center; the caption keeps
its natural height and reuses ImagePreview's loading/failure feedback.
A numeric ratio is the preferred box ratio; `ratio="fill"` must receive space from a finite parent;
captions also count against the content budget.
cover must be chosen explicitly, and position uses the same nine points as the background; when ratios
differ, showing the whole image and filling the area trade off — prefer contain for text images.
Meowbook's `presentation-foundations` lets you actually inspect two columns, three columns, a list, a
photo cover and a text diagram contain.

The whole deck and each page can receive `background`: `"theme"` or
`{ fill?, image?, overlay?, foreground? }`, and a Signal of the same type can also be passed. `image`
accepts src, a cover/contain fit (default cover) and a nine-point position (default center);
fill/overlay accept CSS colors or gradients. When a page omits it, it inherits the deck; when the deck
omits it, it follows the theme; an explicit theme returns to the theme; an object fully overrides and
does not merge with the deck; when fill is omitted, the theme paper color is used. foreground's
light/dark refers to text color, and omitting it follows the theme.
The decorative background fills the canvas and crops itself, and does not change content edges,
scaling or step lifecycle; updating the background Signal does not remount the current content.
Updating the background on the same page does not trigger the page-change entrance animation; it only
replaces the decorative layer.
After an image fails, the base color, overlay and text light/dark remain, and the author must ensure
the page is still readable without the image; images that need description and alternative text stay
in the body.
The host installs `createMeowUI()` and `createMeowSlides()` in the same Runtime and loads the complete
`presentationTheme` from `meowslides/theme` to get the default presentation structure and visuals.
A local implementation does not mean published; the current public version and install acceptance
follow the root README and the receipt for that round.

```tsx
import { h, signal } from "meowjsx";
import { Presentation, Reveal, type SlideDefinition, type SlidePosition } from "meowslides";

// Create these once per work instance, outside each slide's render callback.
const speed = signal(20);
const position = signal<SlidePosition>({ slideId: "experiment", step: 0 });
const slides: readonly SlideDefinition[] = [
  {
    id: "experiment",
    title: "Transfer estimate",
    steps: 1,
    render: () => (
      <div>
        <h2>Change the connection speed</h2>
        <input
          type="range"
          min="1"
          max="100"
          value={speed}
          onInput={(event: Event) => {
            speed.value = Number((event.currentTarget as HTMLInputElement).value);
          }}
        />
        <Reveal at={1}>
          <p>The estimate changes with the same experiment input.</p>
        </Reveal>
      </div>
    ),
  },
];
const view = (
  <Presentation title="Image transfer" slides={slides} position={position} active={false} />
);
```

Actual works should create these values in a factory or top-level component, avoiding module-level
singletons that leak values across presentations. When `position` is provided it is the only position
source, and navigation and in-page jumps all write the same Signal as a whole; when omitted, the
component creates a local position starting at page one, step 0. Page ids must be unique and non-empty,
`steps` is the number of advances beyond step 0, and out-of-range positions and `Reveal at` fail
explicitly. Steps only update local bindings; changing pages is what unmounts the old page. Inputs,
calculation parameters and results that persist across pages are held by ordinary host signals, while
the old page's DOM, media, timers and listeners are cleaned up by their respective owners. Returning to
step 0 does not clear the experiment input.

The default logical canvas is 1280×720, fitted into the available area with contain; original-size
mode provides scrolling. Tool controls keep their own normal size. `presentationTokens` is exported
from `meowslides/theme` and can adjust presentation titles, body text, colors and page edges without
changing the work-interface control font size. Content that exceeds the canvas shows a diagnostic; you
must still actually observe the real text, fonts, media and target sizes.

The frame uses a permanently visible grouped control band: navigation and page order, the native
outline and the settings entry each have their own position. Low-frequency pause/size operations live
in the existing Popover, preserving state with native toggle buttons; after opening, focus the first
item, and Escape closes it and returns to the settings entry.
Arrangement and stretching reuse Inline/Stack/LayoutItem, and the outline moves to a full row according
to the control band's own narrow width, suiting narrow hosts in wide windows.
The `chrome*` values in `presentationTokens` control only the frame, page header and control band,
independent of the stage paper color/body font and the generic Button theme; no extra props or theme
installer are needed. Narrow screens reflow these groups, and controls keep roughly 44px touch height,
visible focus and native keyboard semantics without relying on hover.

`active` is the host runtime permission, defaulting to true, combined with document visibility, user
pause and ancestor Reveals. Review, background iframes and deterministic-state photography should pass
false from the first mount; the host then opens foreground interaction.
`usePresentationActivity()` captures a read-only Signal during synchronous component render; custom
animations respond to it through the existing `context.effect` and return a cleanup function. This
permission does not mean playing or content ready, and cannot automatically pause arbitrary child
components.
Reveal keeps geometry and local state, and hidden content is removed from the keyboard and the
accessibility tree; nested layers share the ancestor permission.
`Reveal` accepts either `at={n}` or `when={booleanOrSignal}`, not both and not neither.
`at` accumulates appearance along page steps; `when` is controlled by the work's local state and can
repeatedly show and hide without changing the slide/step.
Both entries share retained mount, geometry, focus fallback, hidden semantics, ancestor activity and
animation cleanup; they must still be used within a Presentation page.
Hints, answers and basis can each be wired to `when` through ordinary signals; works do not copy the
visibility / inert / ARIA wiring.

Work content styles use `slideClassName`: the class lands only on the current page article, so
descendant heading/form rules do not thereby select the surrounding player. `className` continues to
apply to the whole Presentation root, keeping the existing contract; neither adds a content wrapper or
isolates arbitrary global CSS. The fixed-canvas diagnostic also checks visible content and named
layout region allocation, avoiding a missed report when body text intrudes into the footer without
exceeding the whole canvas; an explicit scroll area still owns its own scrolling. The diagnostic
indicates over-capacity and does not auto-shrink type, hide body content or guarantee that arbitrary
content fits on one page.

Presentation and Reveal accept an optional `transition`: none (default), fade, slide, zoom, or
`{ effect, direction?, speed? }`. direction is left/right/up/down and means the movement direction;
slide advances to the left by default and reverses to the right by default, and Reveal defaults
upward; fade/zoom do not use direction. speed is fast/normal/slow. Page changes only bring the new page
in, and the old page unmounts immediately; Reveal only enters when already-mounted content changes from
hidden to shown, and a direct jump does not replay the entrance. Content is interactive as soon as it
appears, and hidden content is immediately inert and stops collaborative activity.
Inactivity, pause, document hidden or reduced motion cancel animations and land on the final state
without replay after recovery; without WAAPI, the final state is presented directly.

Media components require `src` and a readable `label`, with native controls, metadata preload and
user-initiated start by default. Shared actions provide Play / continue, Pause and Back to start; the
latter pauses and returns to the beginning, still waiting for the user to explicitly play.
Pausing or returning to the start invalidates an unfinished play request, and a late Promise does not
restart the media.
In a finite Stack the media picture can shrink while keeping contain, and status and actions keep
natural height; error feedback and the name are split into blocks, not squeezed into the same
paragraph. Image or video areas can use `LayoutItem grow basis={0}` to allocate the remaining space;
text must still respect the finite canvas capacity, and infinite content fitting is not promised.
Native seams such as `ref`, media events, poster and track children land on the real video/audio;
`className` is used for the outer status structure, and other native attributes land on the media
element. An explicit play button checks the asynchronous result of `play()`; the host calling play
through a native ref is equally responsible for checking the result.
Inactivity or unmount pauses, and restoring permission does not automatically unmute. The host can read
the last `currentTime` in ref cleanup and restore the seek after re-entering the metadata event; the
component first calls the host cleanup, then pauses and releases src. The host still decides the
time-invalidation rules when assets change versions.
The optional `soundtrack` slot reuses the same audio component, persists across pages, cleans up on
exit, does not mix, and does not automatically coordinate in-page media volume.

Meowbook is used for review and photography; default MDX works are generated into formal HTML, scripts
and assets by the new package CLI, and advanced consumers can also build hosts with the same JSX/theme.
This entry point has no PPT/PDF exporter, content editor or asset service. See
[authoring capability design](../../docs/designs/2026-10-17-presentation-authoring.md) for design
boundaries.
