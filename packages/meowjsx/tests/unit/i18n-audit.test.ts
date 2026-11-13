import { describe, expect, test } from "bun:test";
import {
  auditCatalog,
  extractMessages,
  messageArguments,
  type ExtractedMessage,
} from "../../src/i18n-audit";

const lines = (...rows: string[]): string => rows.join("\n");
const sources = (code: string) => extractMessages(code, "page.tsx").messages.map((m) => m.source);

describe("extractMessages: literals", () => {
  test("finds single, double and backtick literals and their positions", () => {
    const code = lines("t('One');", 'const x = t("Two");', "  t(`Three`);");
    const { messages, dynamic, aliases } = extractMessages(code, "a.ts");
    expect(messages.map((m) => [m.source, m.line, m.column, m.kind, m.file])).toEqual([
      ["One", 1, 1, "t", "a.ts"],
      ["Two", 2, 11, "t", "a.ts"],
      ["Three", 3, 3, "t", "a.ts"],
    ]);
    expect(dynamic).toEqual([]);
    expect(aliases).toEqual([]);
  });

  test("reads multi-line calls, i18n.t and optional chaining", () => {
    const code = lines(
      "const a = i18n.t(",
      '  "Multi line",',
      "  undefined,",
      '  { context: "menu" },',
      ");",
      'const b = i18n?.t("Optional");',
    );
    const { messages } = extractMessages(code, "a.ts");
    expect(messages.map((m) => [m.source, m.context, m.line])).toEqual([
      ["Multi line", "menu", 1],
      ["Optional", undefined, 6],
    ]);
  });

  test("reads context and note from the options object, in either order and quoting", () => {
    const code = lines(
      't("Open", undefined, { note: "Button", context: \'verb\' });',
      't("Close", undefined, { "context": `noun` });',
      't("Plain", { name: "x" });',
    );
    const { messages, dynamic } = extractMessages(code, "a.ts");
    expect(messages.map((m) => [m.source, m.context, m.note])).toEqual([
      ["Open", "verb", "Button"],
      ["Close", "noun", undefined],
      ["Plain", undefined, undefined],
    ]);
    expect(dynamic).toEqual([]);
  });

  test("a context that is not a literal makes the call dynamic", () => {
    const code = lines(
      "t('A', undefined, { context: kind });",
      "t('B', undefined, { context });",
      "t('C', undefined, options);",
      "t('D', undefined, { note: noteText });",
    );
    const { messages, dynamic } = extractMessages(code, "a.ts");
    expect(messages.map((m) => m.source)).toEqual(["D"]);
    expect(dynamic.map((d) => [d.line, d.reason])).toEqual([
      [1, "context"],
      [2, "context"],
      [3, "options"],
    ]);
  });

  test("decodes escapes so the source equals the runtime string", () => {
    const code = lines(
      String.raw`t('It\'s a\nline');`,
      String.raw`t("Say \"hi\" \\ done");`,
      String.raw`t('\u00e9\x41\u{1F600}');`,
      't("a\\',
      'b");',
      "t(`tick \\` end`);",
    );
    const found = sources(code);
    expect(found[0]).toBe("It's a\nline");
    expect(found[1]).toBe('Say "hi" \\ done');
    expect(found[2]).toBe("\u00e9A\u{1F600}");
    expect(found[4]).toBe("tick ` end");
    expect(found[3]).toBe("ab");
  });

  test("placeholders and tags come from the real parser", () => {
    const code = lines(
      't("Hi {name}, {n, plural, one {# post} other {# posts}} {kind, select, a {x} other {y}}");',
      't.rich("Read <link>the {thing}</link>", { link });',
      't("Plain <b>text</b>");',
      't("{broken");',
    );
    const { messages } = extractMessages(code, "a.ts");
    expect(messages[0]!.placeholders).toEqual(["kind", "n", "name"]);
    expect(messages[0]!.tags).toEqual([]);
    expect(messages[1]).toMatchObject({ kind: "rich", placeholders: ["thing"], tags: ["link"] });
    // Tags are only interpreted for t.rich.
    expect(messages[2]).toMatchObject({ placeholders: [], tags: [] });
    expect(messages[3]).toMatchObject({ source: "{broken", placeholders: [], tags: [] });
  });
});

describe("extractMessages: call forms", () => {
  test("finds t.rich and .t.rich with options in the fourth position", () => {
    const code = lines(
      't.rich("A <b>x</b>", { b }, undefined, { context: "one", note: "n" });',
      'i18n.t.rich("B <b>y</b>", { b });',
    );
    const { messages } = extractMessages(code, "a.ts");
    expect(messages.map((m) => [m.source, m.kind, m.context, m.note])).toEqual([
      ["A <b>x</b>", "rich", "one", "n"],
      ["B <b>y</b>", "rich", undefined, undefined],
    ]);
  });

  test("defineMessages members: strings, objects with options, and unreadable members", () => {
    const code = lines(
      "const labels = defineMessages({",
      '  open: "Open",',
      '  "closed-now": { source: "Closed", context: "status", note: "Badge" },',
      "  later: `Later`,",
      "  computed: someValue,",
      "  [dynamicKey]: 'x',",
      "  spread,",
      "  ...others,",
      "  bad: { source: variable },",
      "  badContext: { source: 'Y', context: variable },",
      "} as const);",
    );
    const { messages, dynamic } = extractMessages(code, "a.ts");
    expect(messages.map((m) => [m.source, m.kind, m.key, m.context, m.note, m.line])).toEqual([
      ["Open", "defined", "open", undefined, undefined, 2],
      ["Closed", "defined", "closed-now", "status", "Badge", 3],
      ["Later", "defined", "later", undefined, undefined, 4],
    ]);
    expect(dynamic.map((d) => [d.line, d.reason, d.callee])).toEqual([
      [5, "unreadable-member", "defineMessages"],
      [6, "unreadable-member", "defineMessages"],
      [7, "unreadable-member", "defineMessages"],
      [8, "unreadable-member", "defineMessages"],
      [9, "unreadable-member", "defineMessages"],
      [10, "context", "defineMessages"],
    ]);
    expect(dynamic[0]!.argument).toBe("computed: someValue");
    expect(extractMessages("defineMessages(table)", "a.ts").dynamic[0]).toMatchObject({
      reason: "not-an-object-literal",
      argument: "table",
    });
  });

  test("lookup with a literal is a message of kind t marked literal; otherwise it is reported", () => {
    const code = lines(
      'i18n.lookup("Site {name}");',
      "i18n.lookup(config.site.description);",
      "i18n.lookup(`a ${b}`);",
    );
    const { messages, dynamic } = extractMessages(code, "a.ts");
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({ source: "Site {name}", kind: "t", literal: true });
    expect(messages[0]!.placeholders).toEqual([]);
    expect(dynamic.map((d) => [d.line, d.callee, d.reason, d.argument])).toEqual([
      [2, ".lookup", "lookup", "config.site.description"],
      [3, ".lookup", "lookup", "`a ${b}`"],
    ]);
  });

  test("an aliased import is reported, and calls through the alias are found", () => {
    const code = lines(
      'import { createI18n, t as translate, defineMessages as define } from "meowjsx/i18n";',
      'import { t as other } from "./elsewhere";',
      'import { t } from "meowjsx/i18n";',
      'translate("Through alias");',
      'define({ a: "Defined alias" });',
    );
    const { messages, aliases } = extractMessages(code, "a.ts");
    expect(aliases).toEqual([
      {
        file: "a.ts",
        line: 1,
        column: 22,
        imported: "t",
        local: "translate",
        module: "meowjsx/i18n",
      },
      {
        file: "a.ts",
        line: 1,
        column: 38,
        imported: "defineMessages",
        local: "define",
        module: "meowjsx/i18n",
      },
    ]);
    expect(messages.map((m) => [m.source, m.kind])).toEqual([
      ["Through alias", "t"],
      ["Defined alias", "defined"],
    ]);
  });

  test("definitions and unrelated identifiers are not calls", () => {
    const code = lines(
      "function t(source) { return source; }",
      "class A { t(value) { return value; } }",
      "const split = x.split('a'); const lookup = 1; const it = 'x';",
      "import { t } from 'meowjsx/i18n';",
      "const obj = { t: 1, lookup: 2 };",
      "console.log(...t, spread.t);",
    );
    const { messages, dynamic } = extractMessages(code, "a.ts");
    expect(messages).toEqual([]);
    expect(dynamic).toEqual([]);
  });
});

describe("extractMessages: lexing", () => {
  test("an apostrophe in JSX text does not start a string and hides nothing", () => {
    const code = lines(
      "export const Page = () => (",
      "  <section>",
      "    <p>Don't panic, it's fine</p>",
      '    <a href="/x" title="It\'s">{t("After the apostrophe")}</a>',
      "    <b>{`template ${t('Inside template')}`}</b>",
      "  </section>",
      ");",
      't("Outside JSX");',
    );
    const { messages } = extractMessages(code, "page.tsx");
    expect(messages.map((m) => [m.source, m.line])).toEqual([
      ["After the apostrophe", 4],
      ["Inside template", 5],
      ["Outside JSX", 8],
    ]);
  });

  test("JSX text that looks like a call is ignored, and attributes with calls are found", () => {
    const code = lines(
      "const view = (",
      "  <>",
      '    <p aria-label={t("Label")}>t("not a call") and // not a comment</p>',
      '    <Foo render={() => <i>{t("Nested")}</i>} {...props} />',
      "  </>",
      ");",
    );
    expect(sources(code)).toEqual(["Label", "Nested"]);
  });

  test("calls inside comments and strings are ignored", () => {
    const code = lines(
      '// t("line comment")',
      '/* t("block comment") */',
      "const a = 'text with t(\"inner\") call';",
      "const b = \"another t('x') one\";",
      'const c = `template t("y") text`;',
      't("Real");',
      "/* multi",
      '   line t("hidden") */',
      't("Also real");',
    );
    expect(sources(code)).toEqual(["Real", "Also real"]);
  });

  test("template substitutions are code, and regex literals are skipped", () => {
    const code = lines(
      "const re = /t\\(\"nope\"\\)/g; const q = a / b; const r = x.replace(/'/g, '');",
      "const nested = `a ${`b ${t('Deep')} c`} d`;",
      "const cls = /[/'\"]/.test(value); t('After regex');",
    );
    expect(sources(code)).toEqual(["Deep", "After regex"]);
  });

  test("a generic arrow function and a comparison are not JSX", () => {
    const code = lines(
      "const id = <T,>(value: T) => value;",
      "if (a < b && c > d) { t('Comparison'); }",
      "const list: Array<string> = []; t('After generic');",
    );
    expect(sources(code)).toEqual(["Comparison", "After generic"]);
  });

  test("an unterminated construct does not throw", () => {
    expect(() => extractMessages("t('x'); const s = '", "a.ts")).not.toThrow();
    expect(() => extractMessages("t(`open ${", "a.ts")).not.toThrow();
    expect(() => extractMessages("const v = <div>{t('x')", "a.ts")).not.toThrow();
    expect(sources("t('kept'); const v = <div")).toEqual(["kept"]);
  });
});

describe("extractMessages: dynamic first arguments", () => {
  test("template with substitutions, concatenation, identifiers, members and calls are reported", () => {
    const code = lines(
      "const a = 1;",
      "t(`Hello, ${name}`);",
      "",
      "  t('Hello, ' + name);",
      "t(label);",
      "i18n.t(labels.open);",
      "t(getText());",
      "t();",
      "t(cond ? 'a' : 'b');",
    );
    const { messages, dynamic } = extractMessages(code, "a.ts");
    expect(messages).toEqual([]);
    expect(dynamic.map((d) => [d.line, d.column, d.callee, d.reason, d.argument])).toEqual([
      [2, 1, "t", "template-literal", "`Hello, ${name}`"],
      [4, 3, "t", "concatenation", "'Hello, ' + name"],
      [5, 1, "t", "identifier", "label"],
      [6, 6, ".t", "member-access", "labels.open"],
      [7, 1, "t", "call", "getText()"],
      [8, 1, "t", "missing-argument", ""],
      [9, 1, "t", "expression", "cond ? 'a' : 'b'"],
    ]);
    expect(dynamic.every((d) => d.file === "a.ts")).toBe(true);
  });

  test("a long argument is shortened", () => {
    const { dynamic } = extractMessages(`t(${"a".repeat(100)});`, "a.ts");
    expect(dynamic[0]!.argument).toHaveLength(60);
    expect(dynamic[0]!.argument.endsWith("...")).toBe(true);
  });
});

describe("messageArguments", () => {
  test("uses the runtime parser: names across plural, select and nesting, and rich tags", () => {
    expect(
      messageArguments("{a} {b, plural, one {# {c}} other {x}} {d, select, x {{e}} other {y}}"),
    ).toEqual({
      names: ["a", "b", "c", "d", "e"],
      tags: [],
    });
    expect(messageArguments("<a>{x}</a> <b>y</b>", { rich: true })).toEqual({
      names: ["x"],
      tags: ["a", "b"],
    });
    expect(messageArguments("<a>x</a>").tags).toEqual([]);
    // The apostrophe swallows the placeholder, exactly as at run time.
    expect(messageArguments("l'{name}").names).toEqual([]);
    expect(messageArguments("l\u2019{name}").names).toEqual(["name"]);
    expect(() => messageArguments("{unclosed")).toThrow();
    expect(() => messageArguments("<a>x", { rich: true })).toThrow("Unclosed tag");
  });
});

const message = (source: string, extra: Partial<ExtractedMessage> = {}): ExtractedMessage => ({
  source,
  kind: "t",
  file: "page.tsx",
  line: 1,
  column: 1,
  placeholders: [],
  tags: [],
  ...extra,
});

describe("auditCatalog: missing", () => {
  test("a source with no translation, or an empty one, is missing", () => {
    const result = auditCatalog(
      [
        message("Posts", { file: "a.tsx", line: 3 }),
        message("Empty"),
        message("Done", { note: "n" }),
        message("Absent", { note: "Shown in the footer" }),
      ],
      { Posts: "Articles", Empty: "", Done: "Fait" },
      "fr",
    );
    expect(result).toEqual({
      locale: "fr",
      missing: [
        { source: "Empty", file: "page.tsx", line: 1 },
        { source: "Absent", note: "Shown in the footer", file: "page.tsx", line: 1 },
      ],
      unused: [],
      invalid: [],
    });
  });

  test("context entries are matched by context, and the empty key means none", () => {
    const catalog = { Open: { "": "Ouvrir", verb: "", adjective: "Ouvert" }, Close: "Fermer" };
    const result = auditCatalog(
      [
        message("Open"),
        message("Open", { context: "adjective" }),
        message("Open", { context: "verb" }),
        message("Open", { context: "noun" }),
        message("Close"),
        message("Close", { context: "menu" }),
      ],
      catalog,
      "fr",
    );
    expect(result.missing.map((item) => [item.source, item.context])).toEqual([
      ["Open", "verb"],
      ["Open", "noun"],
      ["Close", "menu"],
    ]);
    expect(result.unused).toEqual([]);
    expect(result.invalid).toEqual([]);
  });

  test("duplicate uses are one item and own properties only are read", () => {
    const result = auditCatalog(
      [message("constructor"), message("constructor"), message("toString")],
      {},
      "fr",
    );
    expect(result.missing.map((item) => item.source)).toEqual(["constructor", "toString"]);
  });
});

describe("auditCatalog: unused", () => {
  test("entries no message refers to, with the closest missing source for an edited sentence", () => {
    const result = auditCatalog(
      [message("Read the guide now"), message("Totally new words here")],
      {
        "Read the guide": "Lisez le guide",
        "Old and removed": { "": "Ancien", menu: "Menu ancien" },
        "Read the guide now": "",
      },
      "fr",
    );
    expect(result.missing.map((item) => item.source)).toEqual([
      "Read the guide now",
      "Totally new words here",
    ]);
    expect(result.unused).toEqual([
      {
        source: "Read the guide",
        translation: "Lisez le guide",
        closest: { source: "Read the guide now" },
      },
      { source: "Old and removed", translation: "Ancien" },
      { source: "Old and removed", context: "menu", translation: "Menu ancien" },
    ]);
  });

  test("the closest pairing needs similarity above the threshold and is deterministic", () => {
    const messages = [message("Alpha beta gamma"), message("Alpha beta gamme")];
    const first = auditCatalog(messages, { "Alpha beta gammas": "x", Zzz: "y" }, "fr");
    // Equal scores pick the earlier missing source; unrelated text has no pairing.
    expect(first.unused).toEqual([
      { source: "Alpha beta gammas", translation: "x", closest: { source: "Alpha beta gamma" } },
      { source: "Zzz", translation: "y" },
    ]);
    expect(auditCatalog(messages, { "Alpha beta gammas": "x", Zzz: "y" }, "fr")).toEqual(first);
  });

  test("an empty unused translation is not reported, and used contexts are not unused", () => {
    const result = auditCatalog(
      [message("Open", { context: "verb" })],
      { Open: { verb: "Ouvrir" }, Gone: "" },
      "fr",
    );
    expect(result.unused).toEqual([]);
    expect(result.missing).toEqual([]);
  });
});

describe("auditCatalog: invalid", () => {
  test("argument names that differ, including a placeholder swallowed by an apostrophe", () => {
    const result = auditCatalog(
      [
        message("Hello, {name}"),
        message("Hi {name}, you have {count} posts"),
        message("Welcome {name}"),
        message("Fine {name}"),
        message("{n, plural, one {# post by {who}} other {# posts by {who}}}"),
      ],
      {
        "Hello, {name}": "Bonjour, l'{name}",
        "Hi {name}, you have {count} posts": "Salut {nom}, vous avez {count} articles",
        "Welcome {name}": "Bienvenue",
        "Fine {name}": "Bien, l\u2019{name}",
        "{n, plural, one {# post by {who}} other {# posts by {who}}}":
          "{n, plural, one {# article par {who}} other {# articles}}",
      },
      "fr",
    );
    expect(result.missing).toEqual([]);
    expect(result.invalid.map((item) => [item.source, item.reason])).toEqual([
      ["Hello, {name}", "argument names differ from the source; missing: name"],
      [
        "Hi {name}, you have {count} posts",
        "argument names differ from the source; missing: name; unexpected: nom",
      ],
      ["Welcome {name}", "argument names differ from the source; missing: name"],
    ]);
    expect(result.invalid[0]!.translation).toBe("Bonjour, l'{name}");
  });

  test("a translation that does not parse, and a source that does not parse", () => {
    const result = auditCatalog(
      [message("Good {n}"), message("{broken"), message("Open", { context: "verb" })],
      { "Good {n}": "Bon {n", "{broken": "{casse", Open: { verb: "Ouvrir {" } },
      "fr",
    );
    expect(
      result.invalid.map((item) => [item.source, item.context, item.reason.split(":")[0]]),
    ).toEqual([
      ["Good {n}", undefined, "the translation does not parse"],
      ["{broken", undefined, "the source does not parse"],
      ["Open", "verb", "the translation does not parse"],
    ]);
    const unparsable = auditCatalog(
      [message("{a, select, x {1}}")],
      { "{a, select, x {1}}": "{a}" },
      "fr",
    );
    expect(unparsable.invalid[0]!.reason).toContain('A select needs an "other" branch');
  });

  test("rich messages compare tag names; plain messages do not", () => {
    const result = auditCatalog(
      [
        message("Read <link>the guide</link>", { kind: "rich", tags: ["link"] }),
        message("Two <a>x</a> <b>y</b>", { kind: "rich" }),
        message("Reordered <a>x</a> <b>y</b>", { kind: "rich" }),
        message("Plain <b>bold</b>"),
      ],
      {
        "Read <link>the guide</link>": "Lisez <strong>le guide</strong>",
        "Two <a>x</a> <b>y</b>": "Deux <a>x</a>",
        "Reordered <a>x</a> <b>y</b>": "Ordre <b>y</b> <a>x</a>",
        "Plain <b>bold</b>": "Simple <i>gras</i>",
      },
      "fr",
    );
    expect(result.invalid.map((item) => [item.source, item.reason])).toEqual([
      [
        "Read <link>the guide</link>",
        "rich tags differ from the source; missing: link; unexpected: strong",
      ],
      ["Two <a>x</a> <b>y</b>", "rich tags differ from the source; missing: b"],
    ]);
  });

  test("a message used both plain and rich is audited as rich", () => {
    const result = auditCatalog(
      [message("A <b>x</b>"), message("A <b>x</b>", { kind: "rich" })],
      { "A <b>x</b>": "B <i>x</i>" },
      "fr",
    );
    expect(result.invalid).toHaveLength(1);
  });
});

describe("auditCatalog: extra literal messages", () => {
  test("config copy is missing or present as literal text, and braces are not parsed", () => {
    const extra = [
      { source: "A site about {things} and l'apostrophe", note: "site.description" },
      { source: "Plain name" },
      { source: "Missing copy {" },
    ];
    const result = auditCatalog(
      [],
      {
        "A site about {things} and l'apostrophe": "Un site sur {choses} et l'{apostrophe",
        "Plain name": "Nom simple",
        "Stale config": "Ancien",
      },
      "fr",
      { extra },
    );
    expect(result.invalid).toEqual([]);
    expect(result.missing).toEqual([{ source: "Missing copy {" }]);
    expect(result.unused).toEqual([{ source: "Stale config", translation: "Ancien" }]);
    // The same entries as ICU messages are checked.
    const parsed = auditCatalog([], { "Plain {x}": "Simple" }, "fr", {
      extra: [{ source: "Plain {x}" }],
      extraLiteral: false,
    });
    expect(parsed.invalid.map((item) => item.source)).toEqual(["Plain {x}"]);
  });

  test("a message extracted from lookup is literal", () => {
    const { messages } = extractMessages('i18n.lookup("Notes {draft} it\'s");', "a.ts");
    const result = auditCatalog(messages, { "Notes {draft} it's": "Notes {brouillon}" }, "fr");
    expect(result.invalid).toEqual([]);
    expect(result.missing).toEqual([]);
  });
});

describe("the audit works without a runtime", () => {
  test("a full extract and audit round trip needs no provider, renderer or DOM", () => {
    const code = lines(
      'import { defineMessages, t } from "meowjsx/i18n";',
      'const labels = defineMessages({ posts: "Posts" });',
      "export const Page = () => <nav>{t(labels.posts)}{t('Home')}</nav>;",
    );
    const { messages, dynamic } = extractMessages(code, "page.tsx");
    expect(messages.map((m) => m.source)).toEqual(["Posts", "Home"]);
    expect(dynamic.map((d) => d.argument)).toEqual(["labels.posts"]);
    const audit = auditCatalog(messages, { Posts: "Articles" }, "fr");
    expect(audit.missing.map((item) => item.source)).toEqual(["Home"]);
  });
});
