import { previewStyles } from "./preview.styles";
import { languageStyles } from "./language.styles";
import { doodleFontFaces, journalFontFaces, pineFontFaces } from "./journal-fonts";
import { defaultRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { installMeowUI, meowUIComponents, Select } from "meowtail";
import { compileTokens, type TokenSet } from "meowcss";
import {
  doodleTheme,
  doodleUiTokens,
  journalTheme,
  journalUiTokens,
  meowTheme,
  meowUiTokens,
  ottrTheme,
  ottrUiTokens,
  pineTheme,
  pineUiTokens,
  standardTheme,
} from "meowtail/theme";
import { applyTheme, mountStyles } from "meowcss/web";
import { installFocusModality } from "meowtail/web";
import type { PreviewEnvironment } from "meowbook";

installMeowUI({ components: meowUIComponents }, defaultRuntime);

/** Concrete themes the gallery can paint every story with; the markup is the same for each. */
const themes = {
  standard: standardTheme,
  journal: journalTheme,
  meow: meowTheme,
  ottr: ottrTheme,
  doodle: doodleTheme,
  pine: pineTheme,
} as const;
type ThemeKey = keyof typeof themes;
const fontFaces: Partial<Record<ThemeKey, string>> = {
  journal: journalFontFaces,
  doodle: doodleFontFaces,
  pine: pineFontFaces,
};
const themeChoices = [
  ["standard", "Standard"],
  ["journal", "Journal"],
  ["meow", "Meow"],
  ["ottr", "Ottr"],
  ["doodle", "Doodle"],
  ["pine", "Pine"],
] as const;

/** A `?theme=` parameter wins, so captures and links are reproducible; otherwise the last choice. */
function chosenTheme(): ThemeKey {
  const requested = new URLSearchParams(location.search).get("theme");
  if (requested && requested in themes) return requested as ThemeKey;
  try {
    const saved = sessionStorage.getItem("meowui-preview:theme");
    if (saved && saved in themes) return saved as ThemeKey;
  } catch {
    // Storage can be unavailable in embedded or privacy-restricted previews.
  }
  return "standard";
}
/**
 * An embedded canvas is a frame inside a page that already carries its own
 * chrome. The theme toolbar would repeat in every frame, so an embedded canvas
 * leaves it out and follows the reader's system scheme.
 */
function isEmbedded(): boolean {
  return new URLSearchParams(location.search).has("embedded");
}
const embeddedThemeTokens: ReadonlyArray<readonly [Exclude<ThemeKey, "standard">, TokenSet]> = [
  ["journal", journalUiTokens],
  ["meow", meowUiTokens],
  ["ottr", ottrUiTokens],
  ["doodle", doodleUiTokens],
  ["pine", pineUiTokens],
];

function embeddedScopedThemeCss(): string {
  return embeddedThemeTokens
    .map(([name, tokens]) => {
      const selector = `[data-docs-theme="${name}"]`;
      return compileTokens(tokens, {
        constants: `:where(${selector}[data-meowui-theme-root], ${selector} [data-meowui-theme-root])`,
        sources: [
          {
            options: "scheme",
            selector: `:where(${selector}[data-meowui-scope], ${selector} [data-meowui-scope])`,
          },
        ],
      });
    })
    .join("\n");
}

const preview: PreviewEnvironment = ({ root, onCleanup }) => {
  root.classList.add("meowui-story");
  const scope = document.documentElement;
  const embedded = isEmbedded();
  const liveTheme =
    embedded &&
    scope.dataset.meowbookCapture !== "true" &&
    new URLSearchParams(location.search).get("liveTheme") === "1";
  let themeKey = chosenTheme();
  if (liveTheme && window.parent !== window) {
    try {
      const selection = window.parent.document.documentElement.getAttribute("data-docs-theme");
      themeKey = themeChoices.find(([name]) => name === selection)?.[0] ?? "standard";
    } catch {
      // A cross-origin embedding cannot supply its current selection; use the requested URL.
    }
  }
  const theme = liveTheme ? standardTheme : themes[themeKey];
  const embeddedCss = liveTheme
    ? [
        journalFontFaces,
        doodleFontFaces,
        pineFontFaces,
        theme.cssText,
        embeddedScopedThemeCss(),
      ].join("\n")
    : (fontFaces[themeKey] ?? "") + "\n" + theme.cssText;
  onCleanup(
    mountStyles(root.ownerDocument, embeddedCss + previewStyles.text + languageStyles.text),
  );
  onCleanup(applyTheme(scope, theme));
  if (liveTheme) {
    scope.dataset.docsLiveTheme = "";
    if (themeKey === "standard") scope.removeAttribute("data-docs-theme");
    else scope.setAttribute("data-docs-theme", themeKey);
    onCleanup(() => {
      scope.removeAttribute("data-docs-theme");
      delete scope.dataset.docsLiveTheme;
    });
  }
  onCleanup(installFocusModality(root.ownerDocument));
  if (scope.dataset.meowbookCapture === "true") {
    const scheme = matchMedia("(prefers-color-scheme: dark)");
    const update = () => {
      scope.dataset.meowuiColorScheme = scheme.matches ? "dark" : "light";
    };
    update();
    scheme.addEventListener("change", update);
    onCleanup(() => {
      scheme.removeEventListener("change", update);
      root.classList.remove("meowui-story");
      delete scope.dataset.meowuiColorScheme;
    });
    return defaultRuntime;
  }
  if (embedded) {
    scope.dataset.workshopEmbedded = "";
    onCleanup(() => {
      root.classList.remove("meowui-story");
      delete scope.dataset.workshopEmbedded;
    });
    return defaultRuntime;
  }
  const toolbar = document.createElement("nav");
  toolbar.className = "workshop-theme-controls";
  toolbar.setAttribute("aria-label", "Theme preview");
  const controls: { unmount(): void }[] = [];
  for (const [label, key, choices] of [
    [
      "Appearance",
      "meowuiColorScheme",
      [
        ["light", "Light"],
        ["dark", "Dark"],
        ["auto", "Follow system"],
      ],
    ],
  ] as const) {
    const field = document.createElement("label");
    field.textContent = label;
    let selected: string = choices[0][0];
    try {
      const saved = sessionStorage.getItem(`meowui-preview:${key}`);
      if (saved && choices.some(([value]) => value === saved)) selected = saved;
    } catch {
      // Storage can be unavailable in embedded or privacy-restricted previews.
    }
    scope.dataset[key] = selected;
    const onChange = (event: Event) => {
      const value = (event.currentTarget as HTMLSelectElement).value;
      scope.dataset[key] = value;
      try {
        sessionStorage.setItem(`meowui-preview:${key}`, value);
      } catch {
        // The current canvas still switches even without persistent storage.
      }
    };
    controls.push(
      createWebRenderer(defaultRuntime).render(
        h(
          Select,
          { value: selected, onChange },
          ...choices.map(([value, text]) => h("option", { value }, text)),
        ),
        field,
      ),
    );
    toolbar.append(field);
  }
  const themeField = document.createElement("label");
  themeField.textContent = "Theme";
  controls.push(
    createWebRenderer(defaultRuntime).render(
      h(
        Select,
        {
          value: themeKey,
          onChange: (event: Event) => {
            const value = (event.currentTarget as HTMLSelectElement).value;
            try {
              sessionStorage.setItem("meowui-preview:theme", value);
            } catch {
              // The URL parameter below still carries the choice.
            }
            // Theme CSS is mounted once per canvas, so a new theme reloads it.
            const url = new URL(location.href);
            url.searchParams.set("theme", value);
            location.replace(url);
          },
        },
        ...themeChoices.map(([value, text]) => h("option", { value }, text)),
      ),
      themeField,
    ),
  );
  // Theme first: Appearance stays the last control before the story in the Tab order.
  toolbar.prepend(themeField);
  root.before(toolbar);
  onCleanup(() => {
    root.classList.remove("meowui-story");
    toolbar.remove();
    for (const control of controls) control.unmount();
    delete scope.dataset.meowuiColorScheme;
  });
  return defaultRuntime;
};
export default preview;
