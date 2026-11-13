import { createI18n, t, type Message } from "meowjsx/i18n";
import { signal } from "meowjsx/signal";

declare const dynamic: string;

// @ts-expect-error A value of type string is refused; the source is written as a literal.
t(dynamic);
// @ts-expect-error A template literal with a runtime part has type string.
t(`Hello, ${dynamic}`);
// @ts-expect-error A simple template requires its named parameters.
t("Hello, {name}");
// @ts-expect-error Parameter names come from the literal.
t("Hello, {name}", { other: "A" });
// @ts-expect-error A required parameter cannot be omitted when the options come second.
t("Hello, {name}", undefined, { context: "greeting" });
// @ts-expect-error A template without parameters accepts none.
t("Posts", { name: "A" });

const plain: Message = t("Posts");
const named: Message = t("Hello, {name}", { name: "A" });
const reactive: Message = t("{a} of {b}", { a: signal(1), b: 2 });
const withOptions: Message = t("Open", undefined, { context: "verb", note: "Button label" });
// A plural template is not analyzed: its parameters are loose.
const plural: Message = t("{count, plural, one {# post} other {# posts}}", { count: 3 });
const pluralOther: Message = t("{count, plural, one {# post} other {# posts}}", { anything: "x" });
// An apostrophe also makes the parameters loose.
const apostrophe: Message = t("l'{name}", { name: "A" });
const unions: Message = t("Posts" as "Posts" | "Notes");
// @ts-expect-error A message is a Signal, not a string.
const text: string = t("Posts");

const i18n = createI18n({ source: "en" });
const viaInstance: Message = i18n.t("Hello, {name}", { name: "A" });
// @ts-expect-error The instance method has the same literal requirement.
i18n.t(dynamic);

void [
  plain,
  named,
  reactive,
  withOptions,
  plural,
  pluralOther,
  apostrophe,
  unions,
  text,
  viaInstance,
];
