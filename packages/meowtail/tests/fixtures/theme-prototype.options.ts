import { defineOptions } from "meowcss";

export const appOptions = defineOptions("prototype-app", { density: ["compact", "normal"] });
export const buttonOptions = defineOptions("prototype-button", {
  variant: ["quiet", "outline"],
  size: ["small", "default"],
});
export const paneOptions = defineOptions("prototype-pane", { tone: ["normal", "emphasis"] });
