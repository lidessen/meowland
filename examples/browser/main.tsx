import { defaultRuntime, h, signal } from "meowjsx";
import { render } from "meowjsx/web";
import { Button, Card, installMeowUI } from "meowtail";
import { standardTheme } from "meowtail/theme";
import { applyTheme, mountStyles } from "meowcss/web";

const root = document.querySelector("#app");
if (!root) throw new Error("Example mount point is missing");
const count = signal(0);
const uninstall = installMeowUI({ components: [Button, Card] }, defaultRuntime);
const restoreTheme = applyTheme(document.documentElement, standardTheme);
const removeStyles = mountStyles(document, standardTheme.cssText);
const mounted = render(
  <Card>
    <h1>Meowland package example</h1>
    <p>This page consumes only the public package entries.</p>
    <p>
      Count: <output>{count}</output>
    </p>
    <Button onClick={() => count.update((value) => value + 1)}>Increment</Button>
  </Card>,
  root,
);
window.addEventListener(
  "pagehide",
  () => {
    mounted.unmount();
    removeStyles();
    restoreTheme();
    uninstall();
  },
  { once: true },
);
