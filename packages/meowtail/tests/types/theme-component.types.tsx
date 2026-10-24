import { h } from "meowjsx";
import type { ThemedProps } from "meowcss/meowjsx";
import { buttonOptions } from "../fixtures/theme-prototype.options";
import { PrototypeButton } from "../fixtures/theme-prototype-demo";

type ThemeOptionPropName = keyof ThemedProps<typeof buttonOptions>;
const themeOptionNames = ["variant", "size"] satisfies readonly ThemeOptionPropName[];
// @ts-expect-error The builtin scheme is not a component option axis.
const builtinScheme: ThemeOptionPropName = "scheme";
// @ts-expect-error Options methods are not component option axes.
const optionsMethod: ThemeOptionPropName = "select";
void themeOptionNames;
void builtinScheme;
void optionsMethod;

// Compile-only public JSX API checks, not just standalone mapped-type checks.
<PrototypeButton variant="outline" size="small">
  Valid
</PrototypeButton>;
// @ts-expect-error Invalid variant must fail on the actual component.
<PrototypeButton variant="missing" />;
