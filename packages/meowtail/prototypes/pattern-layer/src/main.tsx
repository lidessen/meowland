import { h, defaultRuntime } from "meowjsx";
import { render } from "meowjsx/web";
import { installMeowUI } from "meowtail";
import { meowUIComponents } from "meowtail/registry";
import { standardOptions, standardTheme } from "meowtail/theme";
import { applyTheme, mountStyles } from "meowcss/web";
import { patternStyles } from "./styles";
import { ComposerPage } from "./pages/composer-page";
import { MobilePage } from "./pages/mobile-page";

const uninstallUI = installMeowUI({ components: meowUIComponents }, defaultRuntime);

const root = document.querySelector<HTMLElement>("#app");
if (!root) throw new Error("Missing pattern-layer mount point");

const page = new URLSearchParams(location.search).get("page") === "mobile" ? "mobile" : "composer";
const restoreTheme = applyTheme(
  document.documentElement,
  standardTheme,
  standardOptions.select({ scheme: page === "composer" ? "dark" : "light" }),
);
const removeStyles = mountStyles(document, standardTheme.cssText + patternStyles.text);

const view =
  page === "mobile" ? (
    <MobilePage />
  ) : (
    <div className="pl-stage">
      <ComposerPage />
    </div>
  );

const mounted = render(view, root);

window.addEventListener(
  "pagehide",
  () => {
    mounted.unmount();
    uninstallUI();
    removeStyles();
    restoreTheme();
  },
  { once: true },
);
