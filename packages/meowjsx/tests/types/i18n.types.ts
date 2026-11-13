import { createI18n, defineMessages, t, type Message } from "meowjsx/i18n";
import type { MessageDescriptor } from "meowjsx/i18n";
import { auditCatalog, extractMessages, messageArguments } from "meowjsx/i18n/audit";
import type { Child } from "meowjsx";
import { derived, signal, type ReadableSignal } from "meowjsx/signal";

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

// Descriptors: a table of literals is accepted, a table of `string` values is not.
const labels = defineMessages({
  open: "Open",
  closed: { source: "Closed", context: "status", note: "Badge" },
});
const fromDescriptor: Message = t(labels.open);
const fromContextual: Message = i18n.t(labels.closed);
const fromSignal: Message = t(derived(() => labels.open));
const fromWritable: Message = t(signal(labels.closed));
const literalSource: "Open" = labels.open.source;
const descriptor: MessageDescriptor = labels.closed;
const loose: Message = t(labels.open, { anything: 1 });
// @ts-expect-error A descriptor table needs literal sources.
defineMessages({ bad: dynamic });
// @ts-expect-error A descriptor object needs a literal source too.
defineMessages({ bad: { source: dynamic } });
// @ts-expect-error A Signal of a plain string is not a descriptor Signal.
t(signal(dynamic));
// @ts-expect-error A string variable is still refused next to descriptors.
i18n.t(dynamic, { a: 1 });

// Rich messages: tag names come from the literal and every tag needs a part.
const link = (children: Child): Child => children;
const rich: ReadableSignal<Child> = t.rich("Read <link>the guide</link>", { link });
const richParams: ReadableSignal<Child> = i18n.t.rich(
  "<b>{name}</b> is <i>here</i>",
  { b: link, i: link },
  { name: "A" },
);
const richPlain: ReadableSignal<Child> = t.rich("No tags", {});
// @ts-expect-error A tag in the literal needs a part.
t.rich("Read <link>the guide</link>", {});
// @ts-expect-error A part for a tag the literal does not have.
t.rich("Read <link>the guide</link>", { link, other: link });
// @ts-expect-error Named parameters are still required.
t.rich("<b>{name}</b>", { b: link });
// @ts-expect-error A rich source is a literal.
t.rich(dynamic, {});
// @ts-expect-error A rich message is a Signal of Child, not a string.
const richText: string = t.rich("No tags", {});

// lookup takes any string; there is no ambient lookup.
const looked: Message = i18n.lookup(dynamic);
const lookedWithContext: Message = i18n.lookup("Site", { context: "title" });
// @ts-expect-error There is no ambient lookup.
const noLookup = t.lookup;

// The audit entry.
const extraction = extractMessages("t('x')", "a.ts");
const names: string[] = messageArguments("{a} <b>x</b>", { rich: true }).tags;
const audit = auditCatalog(extraction.messages, { x: "y" }, "fr", {
  extra: [{ source: dynamic }],
  extraLiteral: true,
});
const missingCount: number = audit.missing.length;

void [
  noLookup,
  fromDescriptor,
  fromContextual,
  fromSignal,
  fromWritable,
  literalSource,
  descriptor,
  loose,
  rich,
  richParams,
  richPlain,
  richText,
  looked,
  lookedWithContext,
  names,
  missingCount,
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
