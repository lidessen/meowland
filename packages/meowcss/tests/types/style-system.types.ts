import { defineClassValue, cx, type ClassValue, type ClassNameInput } from "meowcss";
import type { Context } from "meowjsx";
import { defineOptions } from "meowcss/meowjsx";
import { css, parts } from "meowcss/meowjsx";

const app = defineOptions("app", { density: ["compact", "normal"] });
const card = defineOptions("card", { tone: ["quiet", "loud"] });
function Card(props: { title: string }, context: Context<typeof Card>) {
  void context.parts.root;
  return props.title;
}
Card.meta = { name: "card", parts: ["root", "body"] } as const;
const cardParts = parts<typeof Card>("card");
const panel = defineClassValue("ui-p-panel", 1, "padding: 1rem;");
const background = defineClassValue("ui-bg-panel", 2, "background: white;");
const composed: ClassValue = cx(panel, background);
const input: ClassNameInput = ["host-panel", false, composed];

const cssCheck = css`
  ${cardParts.root} {
    ${composed}
  }
`;
void cssCheck;
app.select({ density: "compact" });
card.when({ tone: "quiet" });

function checkTypes() {
  // @ts-expect-error Unknown component option remains invalid.
  card.when({ color: "quiet" });
  // @ts-expect-error Unknown part is not exposed by typed meta.
  void cardParts.unknown;
  // @ts-expect-error Class values expose no generated declaration shape.
  void panel.padding;
  // @ts-expect-error A primitive number is not a class value.
  const _invalid: ClassValue = 42;
  void input;
  void checkTypes;
  void _invalid;
}
void checkTypes;
