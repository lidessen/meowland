/** Compile-only public API checks. Every expected error must remain an error. */
import { signal } from "meowjsx";
import {
  compileTokens,
  defineOptions,
  defineTokens,
  type ThemedProps,
  type TokenSet,
  defineStyleProps,
  partSelector,
} from "meowcss/meowjsx";

const app = defineOptions("app", {
  density: ["compact", "normal"],
  viewport: ["mobile", "desktop"],
});
const button = defineOptions("button", { variant: ["quiet", "outline"], size: ["small", "large"] });
defineStyleProps(button, { defaults: { variant: "quiet", size: "small" } });
// @ts-expect-error Every component option requires an instance default.
defineStyleProps(button, { defaults: { variant: "quiet" } });
// @ts-expect-error Defaults cannot introduce choices or axes.
defineStyleProps(button, { defaults: { variant: "danger", size: "small" } });
// @ts-expect-error Scheme is not a declared component prop.
defineStyleProps(button, { defaults: { variant: "quiet", size: "small", scheme: "dark" } });
const contract = { name: "button", parts: ["root", "label"] } as const;
// @ts-expect-error Part selector must belong to the supplied contract.
partSelector(contract, "missing");
const tokens = defineTokens("test", {
  surface: ["white", "black"],
  height: app.by.density(["32px", "36px"]),
  padding: app.by.viewport({ mobile: "8px", desktop: "16px" }),
  text: app.by.scheme({ light: "black", dark: "white" }),
});
tokens.surface.name satisfies string;
tokens satisfies TokenSet;
// @ts-expect-error An individual token reference is not a complete token definition.
tokens.surface satisfies TokenSet;
// @ts-expect-error Arbitrary objects cannot be compiled as token definitions.
compileTokens({}, { constants: ".theme", sources: [] });
const nestedTokens = defineTokens("nested", { color: { surface: "white" } });
// @ts-expect-error A nested reference group omits the owning definition's metadata.
compileTokens(nestedTokens.color, { constants: ".theme", sources: [] });
app.select({ scheme: "auto", density: "compact" });
button.when({ variant: "quiet", size: "small" });
const valid: ThemedProps<typeof button> = { variant: "quiet", size: "large" };
void valid;
const dynamicUnset: ThemedProps<typeof button> = {
  size: signal<"small" | "large" | undefined>(undefined),
};
void dynamicUnset;
const collisionNames = defineOptions("names", {
  by: ["yes", "no"],
  select: ["one", "two"],
  when: ["on", "off"],
});
collisionNames.by.select(["1px", "2px"]);
collisionNames.select({ by: "yes", select: "one", when: "on" });

// @ts-expect-error The builtin dimension cannot be replaced.
defineOptions("bad", { scheme: ["day", "night"] });
// @ts-expect-error Tuple requires exactly the declared number of choices.
app.by.density(["32px"]);
// @ts-expect-error Objects must provide every choice.
app.by.density({ compact: "32px" });
// @ts-expect-error Typo in option value object.
app.by.density({ compact: "32px", normal: "36px", dense: "30px" });
// @ts-expect-error No nested dimensions in branch values.
app.by.density({ compact: app.by.scheme(["1px", "2px"]), normal: "36px" });
// @ts-expect-error Naked tuple only supports light and dark.
defineTokens("bad", { color: ["a", "b", "c"] });
// @ts-expect-error Unknown token path.
void tokens.missing;
// @ts-expect-error No public access to value branches through a token reference.
void tokens.surface.dark;
// @ts-expect-error Unknown option name.
app.select({ dense: "compact" });
// @ts-expect-error Invalid choice.
app.select({ density: "dense" });
// @ts-expect-error Invalid conditional choice.
button.when({ size: "compact" });
// @ts-expect-error Builtin scheme is not an automatic component prop.
const schemeProp: ThemedProps<typeof button> = { scheme: "dark" };
// @ts-expect-error Helpers are not component props.
const methodProp: ThemedProps<typeof button> = { select: "quiet" };
// @ts-expect-error Invalid public component option.
const invalid: ThemedProps<typeof button> = { variant: "danger" };
void schemeProp;
void methodProp;
void invalid;
