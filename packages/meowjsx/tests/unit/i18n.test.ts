import { describe, expect, test } from "bun:test";
import { createRuntime, derived, h, isSignal, keyed, signal, type Child } from "../../src/index";
import { type RenderStrategy } from "../../src/renderer";
import { I18nProvider, createI18n, defineMessages, t, useI18n, type Message } from "../../src/i18n";
import { createWebRenderer } from "../../web/index";

type FakeNode = {
  kind: "text" | "element" | "marker";
  value: string;
  parent: FakeNode | null;
  children: FakeNode[];
  properties: Record<string, unknown>;
};

function fakeStrategy(): RenderStrategy<FakeNode> {
  const node = (kind: FakeNode["kind"], value: string): FakeNode => ({
    kind,
    value,
    parent: null,
    children: [],
    properties: {},
  });
  return {
    createText: (value) => node("text", value),
    createElement: (type) => node("element", type),
    createMarker: (kind) => node("marker", kind),
    getNextSibling(target) {
      if (!target.parent) return null;
      const index = target.parent.children.indexOf(target);
      return index >= 0 ? (target.parent.children[index + 1] ?? null) : null;
    },
    insert(parent, child, before) {
      if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1);
      if (before === undefined || before === null) parent.children.push(child);
      else parent.children.splice(parent.children.indexOf(before), 0, child);
      child.parent = parent;
    },
    remove(target) {
      if (target.parent) {
        target.parent.children.splice(target.parent.children.indexOf(target), 1);
        target.parent = null;
      }
    },
    setProperty(target, name, value) {
      target.properties[name] = value;
    },
  };
}

const text = (node: FakeNode): string =>
  node.kind === "text" ? node.value : node.children.map(text).join("");

const tick = () => new Promise<void>((resolve) => queueMicrotask(resolve));

function mount(child: Child) {
  const renderer = createRuntime().createRenderer(fakeStrategy());
  const root = renderer.createElement("root");
  const mounted = renderer.render(child, root);
  return { root, mounted };
}

const fr = { Posts: "Articles", "Primary navigation": "Navigation principale" };

function withProvider(i18n: ReturnType<typeof createI18n>, child: Child): Child {
  return h(I18nProvider, { value: i18n }, child);
}

describe("static HTML", () => {
  test("renders the provider's locale, and the source text without a provider", () => {
    const Header = () => h("nav", { "aria-label": t("Primary navigation") }, t("Posts"));
    const web = createWebRenderer(createRuntime());
    const i18n = createI18n({ source: "en", locale: "fr", catalogs: { fr } });
    expect(web.renderToHtml(withProvider(i18n, h(Header, {})))).toBe(
      '<nav aria-label="Navigation principale">Articles</nav>',
    );
    expect(web.renderToHtml(h(Header, {}))).toBe(
      '<nav aria-label="Primary navigation">Posts</nav>',
    );
    const english = createI18n({ source: "en", catalogs: { fr } });
    expect(web.renderToHtml(withProvider(english, h(Header, {})))).toBe(
      '<nav aria-label="Primary navigation">Posts</nav>',
    );
  });

  test("a component without a provider formats parameters with English plural rules", () => {
    const Count = () => h("p", {}, t("{n, plural, one {# post} other {# posts}}", { n: 1234 }));
    expect(createWebRenderer(createRuntime()).renderToHtml(h(Count, {}))).toBe(
      "<p>1,234 posts</p>",
    );
    const One = () => h("p", {}, t("{n, plural, one {# post} other {# posts}}", { n: 1 }));
    expect(createWebRenderer(createRuntime()).renderToHtml(h(One, {}))).toBe("<p>1 post</p>");
  });
});

describe("mounted trees follow the locale in place", () => {
  test("text child and attribute update without remounting", async () => {
    const i18n = createI18n({ source: "en", locale: "en", catalogs: { fr } });
    let bodies = 0;
    const Header = () => {
      bodies += 1;
      return h("nav", { "aria-label": t("Primary navigation"), className: t("Posts") }, t("Posts"));
    };
    const { root, mounted } = mount(withProvider(i18n, h(Header, {})));
    const nav = root.children[0]!;
    expect(text(nav)).toBe("Posts");
    expect(nav.properties["aria-label"]).toBe("Primary navigation");
    i18n.locale.value = "fr";
    await tick();
    expect(root.children[0]).toBe(nav);
    expect(text(nav)).toBe("Articles");
    expect(nav.properties["aria-label"]).toBe("Navigation principale");
    expect(nav.properties.className).toBe("Articles");
    expect(bodies).toBe(1);
    i18n.locale.value = "en";
    await tick();
    expect(text(nav)).toBe("Posts");
    mounted.unmount();
  });

  test("a message passes isSignal and works as a child inside static and mounted regions", () => {
    const i18n = createI18n({ source: "en" });
    expect(isSignal(i18n.t("Posts"))).toBe(true);
    const web = createWebRenderer(createRuntime());
    expect(web.renderToHtml(h("p", { className: i18n.t("Posts") }, i18n.t("Posts")))).toBe(
      '<p class="Posts">Posts</p>',
    );
  });
});

describe("lookup", () => {
  test("falls back through parent tags, then to the source text, reporting once", () => {
    const misses: unknown[] = [];
    const i18n = createI18n({
      source: "en",
      locale: "zh-Hant-TW",
      catalogs: { "zh-Hant": { Posts: "Posts (Hant)" }, zh: { Posts: "x", Home: "y" } },
      onMissing: (miss) => misses.push(miss),
    });
    expect(i18n.t("Posts").value).toBe("Posts (Hant)");
    expect(i18n.t("Home").value).toBe("y");
    expect(misses).toEqual([]);
    const unknown = i18n.t("Unknown");
    expect(unknown.value).toBe("Unknown");
    expect(unknown.value).toBe("Unknown");
    expect(i18n.t("Unknown").value).toBe("Unknown");
    expect(misses).toEqual([{ source: "Unknown", locale: "zh-Hant-TW" }]);
    expect(i18n.t("Unknown", undefined, { context: "menu" }).value).toBe("Unknown");
    expect(misses).toHaveLength(2);
    expect(misses[1]).toEqual({ source: "Unknown", context: "menu", locale: "zh-Hant-TW" });
  });

  test("the source locale and its children use the source text without a miss", () => {
    const misses: unknown[] = [];
    const i18n = createI18n({
      source: "en",
      locale: "en-GB",
      catalogs: { en: { Posts: "never used" } },
      onMissing: (miss) => misses.push(miss),
    });
    expect(i18n.t("Posts").value).toBe("Posts");
    expect(misses).toEqual([]);
  });

  test("locale tags are canonicalized and invalid tags throw", async () => {
    const i18n = createI18n({ source: "EN", locale: "zh-hant-tw", catalogs: { "ZH-hant": fr } });
    expect(i18n.locale.value).toBe("zh-Hant-TW");
    expect(i18n.t("Posts").value).toBe("Articles");
    expect(() => createI18n({ source: "en", locale: "not a tag" })).toThrow("invalid locale tag");
    expect(() => createI18n({ source: "" })).toThrow("invalid locale tag");
    await expect(i18n.setLocale("x_y")).rejects.toThrow("invalid locale tag");
    expect(i18n.locale.value).toBe("zh-Hant-TW");
  });

  test("addCatalog updates mounted messages", async () => {
    const i18n = createI18n({ source: "en", locale: "de" });
    const message = i18n.t("Posts");
    const seen: string[] = [];
    const stop = message.subscribe((value) => seen.push(value));
    expect(message.value).toBe("Posts");
    i18n.addCatalog("de", { Posts: "Beitraege" });
    await tick();
    expect(seen).toEqual(["Beitraege"]);
    stop();
  });

  test("catalog lookup uses own properties and treats empty strings as missing", () => {
    const i18n = createI18n({
      source: "en",
      locale: "fr",
      catalogs: { fr: { Empty: "", Both: "Les deux" }, "fr-CA": { Both: "" } },
    });
    expect(i18n.t("constructor").value).toBe("constructor");
    expect(i18n.t("toString").value).toBe("toString");
    expect(i18n.t("__proto__").value).toBe("__proto__");
    expect(i18n.t("Empty").value).toBe("Empty");
    const canada = createI18n({
      source: "en",
      locale: "fr-CA",
      catalogs: { fr: { Both: "Les deux" }, "fr-CA": { Both: "" } },
    });
    expect(canada.t("Both").value).toBe("Les deux");
  });

  test("context separates homographs and uses the empty key for no context", () => {
    const i18n = createI18n({
      source: "en",
      locale: "fr",
      catalogs: {
        fr: { Open: { "": "Ouvrir", adjective: "Ouvert", verb: "" }, Close: "Fermer" },
      },
    });
    expect(i18n.t("Open").value).toBe("Ouvrir");
    expect(i18n.t("Open", undefined, { context: "adjective" }).value).toBe("Ouvert");
    expect(i18n.t("Open", undefined, { context: "verb" }).value).toBe("Open");
    expect(i18n.t("Open", undefined, { context: "other" }).value).toBe("Open");
    expect(i18n.t("Close").value).toBe("Fermer");
    expect(i18n.t("Close", undefined, { context: "x" }).value).toBe("Close");
    expect(i18n.t("Close", undefined, { note: "ignored" }).value).toBe("Fermer");
  });
});

describe("message format", () => {
  test("ru count 3 selects few, =0 wins, and # is locale formatted", () => {
    const template =
      "{count, plural, =0 {No posts} one {# post} few {# posts (few)} many {# posts (many)} other {# posts (other)}}";
    const i18n = createI18n({ source: "en", locale: "ru" });
    const ru = createI18n({
      source: "en",
      locale: "ru",
      catalogs: {
        ru: {
          [template]:
            "{count, plural, =0 {None} one {# entry-one} few {# entry-few} many {# entry-many} other {# entry-other}}",
        },
      },
    });
    expect(ru.t(template, { count: 3 }).value).toBe("3 entry-few");
    expect(ru.t(template, { count: 5 }).value).toBe("5 entry-many");
    expect(ru.t(template, { count: 21 }).value).toBe("21 entry-one");
    expect(ru.t(template, { count: 0 }).value).toBe("None");
    // Russian groups digits with a no-break space; normalize it to a plain space.
    expect(ru.t(template, { count: 1234567 }).value.replace(/\s/g, " ")).toBe(
      "1 234 567 entry-many",
    );
    // The source text selects with the instance locale's rules when it is the source locale.
    const english = createI18n({ source: "en" });
    expect(english.t(template, { count: 0 }).value).toBe("No posts");
    expect(english.t(template, { count: 1 }).value).toBe("1 post");
    expect(english.t(template, { count: 1234 }).value).toBe("1,234 posts (other)");
    expect(i18n.locale.value).toBe("ru");
  });

  test("a Signal parameter updates the message", async () => {
    const count = signal(1);
    const i18n = createI18n({ source: "en" });
    const message = i18n.t("{count, plural, one {# item} other {# items}} for {who}", {
      count,
      who: "you",
    });
    const seen: string[] = [];
    const stop = message.subscribe((value) => seen.push(value));
    expect(message.value).toBe("1 item for you");
    count.value = 2;
    await tick();
    expect(seen).toEqual(["2 items for you"]);
    stop();
  });

  test("interpolated numbers use the locale's number format; missing params stay visible", () => {
    const de = createI18n({ source: "en", locale: "de" });
    expect(de.t("Total: {n}", { n: 1234.5 }).value).toBe("Total: 1.234,5");
    expect(de.t("Hello, {name}! {other}", { name: "Ada" } as never).value).toBe(
      "Hello, Ada! {other}",
    );
    expect(de.t("{count, plural, other {#}}", {} as never).value).toBe("{count}");
  });

  test("apostrophes are literal unless they precede {, } or #", () => {
    const i18n = createI18n({
      source: "en",
      locale: "fr",
      catalogs: {
        fr: {
          a: "l'{name} fin",
          b: "l''{name}",
          // U+2019 is intentional: it is the typographic apostrophe the rule leaves alone.
          c: "l\u2019{name}",
          d: "'{name}' vs {name}",
          e: "it's {name}",
          f: "'#' and ''#''",
          g: "{n, plural, other {'#' # '{x}'}}",
        },
      },
    });
    // The apostrophe starts a quoted section that swallows the placeholder up to the end.
    expect(i18n.t("a", { name: "X" } as never).value).toBe("l{name} fin");
    expect(i18n.t("b", { name: "X" } as never).value).toBe("l'X");
    expect(i18n.t("c", { name: "X" } as never).value).toBe("l\u2019X");
    expect(i18n.t("d", { name: "X" } as never).value).toBe("{name} vs X");
    expect(i18n.t("e", { name: "X" } as never).value).toBe("it's X");
    expect(i18n.t("f").value).toBe("# and '#'");
    expect(i18n.t("g", { n: 4 } as never).value).toBe("# 4 {x}");
  });

  test("a template that fails to parse throws an error naming the text", () => {
    const i18n = createI18n({
      source: "en",
      locale: "fr",
      catalogs: { fr: { Fine: "{unclosed" } },
    });
    expect(() => i18n.t("Hello, {name").value).toThrow('"Hello, {name"');
    expect(() => i18n.t("{n, plural, one {x}}", { n: 1 } as never).value).toThrow("other");
    expect(() => i18n.t("{n, number}", { n: 1 } as never).value).toThrow(
      'Unsupported argument type "number"',
    );
    expect(() => i18n.t("a } b").value).toThrow('"a } b"');
    const broken = i18n.t("Fine");
    expect(() => broken.value).toThrow('translation of "Fine" "{unclosed"');
  });
});

describe("number, date and direction", () => {
  test("number and date follow the locale and the instance time zone", () => {
    const i18n = createI18n({ source: "en", timeZone: "UTC" });
    const count = i18n.number(1234567.891, { maximumFractionDigits: 1 });
    const moment = new Date(Date.UTC(2026, 0, 31, 23, 30));
    const day = i18n.date(moment, { dateStyle: "long" });
    const shifted = i18n.date(moment, { dateStyle: "long", timeZone: "Asia/Shanghai" });
    expect(count.value).toBe("1,234,567.9");
    expect(day.value).toBe("January 31, 2026");
    expect(shifted.value).toBe("February 1, 2026");
    i18n.locale.value = "de";
    expect(count.value).toBe("1.234.567,9");
    expect(day.value).toBe("31. Januar 2026");
  });

  test("direction follows the locale's script", () => {
    const i18n = createI18n({ source: "en" });
    const seen: string[] = [];
    expect(i18n.direction.value).toBe("ltr");
    const stop = i18n.direction.subscribe((value) => seen.push(value));
    for (const [tag, expected] of [
      ["ar", "rtl"],
      ["he-IL", "rtl"],
      ["fa", "rtl"],
      ["ur", "rtl"],
      ["zh-Hant-TW", "ltr"],
      ["ru", "ltr"],
      ["az-Arab", "rtl"],
    ] as const) {
      i18n.locale.value = tag;
      expect(i18n.direction.value).toBe(expected);
    }
    stop();
  });
});

describe("setLocale", () => {
  test("loads before writing, and only the last call writes", async () => {
    const releases = new Map<string, () => void>();
    const loaded: string[] = [];
    const i18n = createI18n({
      source: "en",
      load: (tag) =>
        new Promise((resolve) => {
          loaded.push(tag);
          releases.set(tag, () => resolve({ Posts: `posts in ${tag}` }));
        }),
    });
    const slow = i18n.setLocale("fr");
    const fast = i18n.setLocale("de");
    expect(i18n.locale.value).toBe("en");
    releases.get("de")!();
    await fast;
    expect(i18n.locale.value).toBe("de");
    releases.get("fr")!();
    await slow;
    expect(i18n.locale.value).toBe("de");
    expect(i18n.t("Posts").value).toBe("posts in de");
    // The superseded catalog was still loaded and is kept.
    await i18n.setLocale("fr");
    expect(i18n.locale.value).toBe("fr");
    expect(i18n.t("Posts").value).toBe("posts in fr");
    expect(loaded).toEqual(["fr", "de"]);
  });

  test("never loads the source locale or a locale that already has a catalog", async () => {
    let loads = 0;
    const i18n = createI18n({
      source: "en",
      catalogs: { fr },
      load: async () => {
        loads += 1;
        return {};
      },
    });
    await i18n.setLocale("fr");
    await i18n.setLocale("en-GB");
    expect(loads).toBe(0);
    expect(i18n.locale.value).toBe("en-GB");
  });

  test("a failed load leaves the locale unchanged", async () => {
    const i18n = createI18n({
      source: "en",
      load: async () => {
        throw new Error("offline");
      },
    });
    await expect(i18n.setLocale("fr")).rejects.toThrow("offline");
    expect(i18n.locale.value).toBe("en");
  });

  test("adopts a locale Signal", async () => {
    const locale = signal("fr");
    const i18n = createI18n({ source: "en", locale, catalogs: { fr } });
    expect(i18n.locale).toBe(locale);
    expect(i18n.t("Posts").value).toBe("Articles");
    locale.value = "en";
    expect(i18n.t("Posts").value).toBe("Posts");
  });
});

describe("ambient t", () => {
  test("throws in a handler, a derived body, a keyed callback, after await and at top level", async () => {
    const outside = () => {
      try {
        t("Posts");
      } catch (error) {
        return (error as Error).message;
      }
      return "no error";
    };
    expect(outside()).toContain("i18n.t");
    const captured: string[] = [];
    let handler!: () => void;
    let late!: Promise<string>;
    const Probe = () => {
      handler = () => captured.push(outside());
      const inDerived = derived(() => outside());
      captured.push(inDerived.value);
      const rows = keyed(
        [1],
        (item) => item,
        () => {
          captured.push(outside());
          return "row";
        },
      );
      late = (async () => {
        await Promise.resolve();
        return outside();
      })();
      // Inside the body it works, and it works again after the throwing probes above.
      captured.push(t("Posts").value);
      return h("div", {}, rows);
    };
    createWebRenderer(createRuntime()).renderToHtml(h(Probe, {}));
    handler();
    const probes = [...captured, await late];
    expect(probes.filter((message) => message.includes("i18n.t"))).toHaveLength(4);
    expect(probes).toContain("Posts");
    const { mounted } = mount(h(Probe, {}));
    expect(captured.slice(-1)[0]).toContain("i18n.t");
    mounted.unmount();
  });

  test("throws in an effect and a flushed subscriber started inside a body", async () => {
    const errors: string[] = [];
    const guard = () => {
      try {
        t("Posts");
        errors.push("no error");
      } catch {
        errors.push("threw");
      }
    };
    const source = signal(0);
    const Body = (_props: object, context: { effect: (run: () => void) => void }) => {
      context.effect(() => {
        void source.value;
        guard();
      });
      source.subscribe(guard);
      return "x";
    };
    createRuntime().createRenderer(fakeStrategy());
    const { mounted } = mount(h(Body as never, {}));
    expect(errors).toEqual(["threw"]);
    source.value = 1;
    await tick();
    expect(errors.every((entry) => entry === "threw")).toBe(true);
    mounted.unmount();
  });

  test("a message made in the body keeps following the instance and locale", async () => {
    const i18n = createI18n({ source: "en", locale: "en", catalogs: { fr } });
    let message!: Message;
    let instance: unknown;
    const Header = () => {
      message = t("Posts");
      instance = useI18n();
      return h("nav", {}, message);
    };
    const web = createWebRenderer(createRuntime());
    expect(web.renderToHtml(withProvider(i18n, h(Header, {})))).toBe("<nav>Posts</nav>");
    expect(instance).toBe(i18n);
    // Read later, as an event handler would.
    expect(message.value).toBe("Posts");
    i18n.locale.value = "fr";
    expect(message.value).toBe("Articles");
    web.renderToHtml(h(Header, {}));
    expect(instance).toBeUndefined();
    expect(message.value).toBe("Posts");
  });

  test("the nearest provider wins and siblings do not share instances", () => {
    const french = createI18n({ source: "en", locale: "fr", catalogs: { fr } });
    const english = createI18n({ source: "en" });
    const Label = () => h("i", {}, t("Posts"));
    const html = createWebRenderer(createRuntime()).renderToHtml([
      withProvider(english, withProvider(french, h(Label, {}))),
      withProvider(french, withProvider(english, h(Label, {}))),
      h(Label, {}),
    ]);
    expect(html).toBe("<i>Articles</i><i>Posts</i><i>Posts</i>");
  });
});

describe("a message is never a string by accident", () => {
  test("template literals, concatenation and String() throw and say what to do", () => {
    const i18n = createI18n({ source: "en" });
    const message = i18n.t("Posts");
    expect(() => `${message} x`).toThrow(".value");
    expect(() => (message as unknown as string) + "b").toThrow("t(");
    expect(() => String(message)).toThrow("Signal");
    expect(() => [message].join(",")).toThrow("Signal");
    expect(() => `${i18n.number(1)}`).not.toThrow();
    expect(message.value).toBe("Posts");
  });
});

describe("select and selectordinal", () => {
  const ordinal = "{n, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}";

  test("English ordinals pick one, two, few and other", () => {
    const i18n = createI18n({ source: "en" });
    const read = (n: number) => i18n.t(ordinal, { n }).value;
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 23, 101, 111].map(read)).toEqual([
      "1st",
      "2nd",
      "3rd",
      "4th",
      "11th",
      "12th",
      "13th",
      "21st",
      "22nd",
      "23rd",
      "101st",
      "111th",
    ]);
  });

  test("selectordinal uses ordinal rules, not cardinal ones, and supports =N", () => {
    const template = "{n, selectordinal, =0 {zeroth} one {#st} other {#th}}";
    const i18n = createI18n({ source: "en" });
    // Cardinal English would select "other" for 21; ordinal rules select "one".
    expect(i18n.t(template, { n: 21 }).value).toBe("21st");
    expect(i18n.t(template, { n: 0 }).value).toBe("zeroth");
    expect(i18n.t("{n, plural, one {#st} other {#th}}", { n: 21 }).value).toBe("21th");
  });

  test("select picks the matching branch, falls back to other and keeps a missing value visible", () => {
    const template = "{gender, select, female {She} male {He} other {They}} replied";
    const i18n = createI18n({ source: "en" });
    expect(i18n.t(template, { gender: "female" }).value).toBe("She replied");
    expect(i18n.t(template, { gender: "male" }).value).toBe("He replied");
    expect(i18n.t(template, { gender: "x" }).value).toBe("They replied");
    expect(i18n.t(template, { gender: "__proto__" }).value).toBe("They replied");
    expect(i18n.t(template, {} as never).value).toBe("{gender} replied");
  });

  test("a plural nested in a select, and # inside a select inside a plural", () => {
    const nested =
      "{kind, select, post {{n, plural, one {# post} other {# posts}}} other {{n, plural, one {# item} other {# items}}}}";
    const i18n = createI18n({ source: "en" });
    expect(i18n.t(nested, { kind: "post", n: 1 }).value).toBe("1 post");
    expect(i18n.t(nested, { kind: "post", n: 1500 }).value).toBe("1,500 posts");
    expect(i18n.t(nested, { kind: "tag", n: 2 }).value).toBe("2 items");
    const pound = "{n, plural, other {{kind, select, a {# of A} other {# of other}}}}";
    expect(i18n.t(pound, { n: 3, kind: "a" }).value).toBe("3 of A");
    expect(i18n.t(pound, { n: 4, kind: "z" }).value).toBe("4 of other");
  });

  test("a select parameter may be a Signal and the translation may use its own branches", async () => {
    const template = "{state, select, on {On} other {Off}}";
    const state = signal("on");
    const i18n = createI18n({
      source: "en",
      locale: "fr",
      catalogs: { fr: { [template]: "{state, select, on {Actif} other {Inactif}}" } },
    });
    const message = i18n.t(template, { state });
    const seen: string[] = [];
    const stop = message.subscribe((value) => seen.push(value));
    expect(message.value).toBe("Actif");
    state.value = "off";
    await tick();
    expect(seen).toEqual(["Inactif"]);
    stop();
  });

  test("a select or selectordinal needs an other branch and unique selectors", () => {
    const i18n = createI18n({ source: "en" });
    expect(() => i18n.t("{a, select, x {1}}", { a: "x" } as never).value).toThrow('"other"');
    expect(() => i18n.t("{a, selectordinal, one {1}}", { a: 1 } as never).value).toThrow(
      'selectordinal needs an "other"',
    );
    expect(() => i18n.t("{a, select, x {1} x {2} other {3}}", { a: "x" } as never).value).toThrow(
      'Duplicate selector "x"',
    );
    expect(() => i18n.t("{a, select, x {1} other {3}", { a: "x" } as never).value).toThrow(
      "Unclosed",
    );
  });
});

describe("defineMessages", () => {
  const labels = defineMessages({
    open: "Open",
    closed: { source: "Closed", context: "status", note: "A badge" },
  });
  const fr = {
    Open: "Ouvert",
    Closed: { status: "Ferme", "": "Fermer" },
  };

  test("returns frozen descriptors at module level without a lookup", () => {
    expect(labels.open).toEqual({ source: "Open" });
    expect(labels.closed).toEqual({ source: "Closed", context: "status", note: "A badge" });
    expect(Object.isFrozen(labels)).toBe(true);
    expect(Object.isFrozen(labels.open)).toBe(true);
    expect(() => defineMessages({ bad: 3 } as never)).toThrow('"bad"');
    expect(() => defineMessages({ bad: { source: 1 } } as never)).toThrow("string source");
    expect(() => defineMessages({ bad: { source: "x", context: 1 } } as never)).toThrow(
      "non-string context",
    );
  });

  test("t translates a descriptor in a component and honors its own context", async () => {
    const i18n = createI18n({ source: "en", locale: "en", catalogs: { fr } });
    const Badge = () => h("p", {}, t(labels.open), "/", t(labels.closed));
    const { root, mounted } = mount(withProvider(i18n, h(Badge, {})));
    expect(text(root)).toBe("Open/Closed");
    i18n.locale.value = "fr";
    await tick();
    expect(text(root)).toBe("Ouvert/Ferme");
    // The descriptor's context wins over a context passed in the options.
    expect(i18n.t(labels.closed, undefined, { context: "other" }).value).toBe("Ferme");
    expect(i18n.t({ source: "Closed" }).value).toBe("Fermer");
    expect(i18n.t({ source: "Closed" }, undefined, { context: "status" }).value).toBe("Ferme");
    mounted.unmount();
  });

  test("a Signal of a descriptor follows both the descriptor and the locale", async () => {
    const i18n = createI18n({ source: "en", locale: "en", catalogs: { fr } });
    const status = signal<"open" | "closed">("open");
    const Badge = () => h("p", {}, t(derived(() => labels[status.value])));
    const { root, mounted } = mount(withProvider(i18n, h(Badge, {})));
    const paragraph = root.children[0]!;
    expect(text(paragraph)).toBe("Open");
    status.value = "closed";
    await tick();
    expect(text(paragraph)).toBe("Closed");
    i18n.locale.value = "fr";
    await tick();
    expect(text(paragraph)).toBe("Ferme");
    status.value = "open";
    await tick();
    expect(text(paragraph)).toBe("Ouvert");
    expect(root.children[0]).toBe(paragraph);
    mounted.unmount();
  });

  test("descriptor parameters are formatted, and a non-descriptor value throws", () => {
    const i18n = createI18n({ source: "en" });
    const messages = defineMessages({ count: "{n, plural, one {# row} other {# rows}}" });
    expect(i18n.t(messages.count, { n: 2 }).value).toBe("2 rows");
    expect(() => i18n.t({} as never).value).toThrow("descriptor");
    expect(() => i18n.t(signal(7) as never).value).toThrow("descriptor");
  });
});

describe("t.rich", () => {
  const guide = "Read <link>the guide</link> now";
  const link = (children: Child): Child => h("a", { href: "/guide/" }, children);

  test("static HTML wraps the tag content with the part", () => {
    const Page = () => h("p", {}, t.rich(guide, { link }));
    const web = createWebRenderer(createRuntime());
    expect(web.renderToHtml(h(Page, {}))).toBe('<p>Read <a href="/guide/">the guide</a> now</p>');
  });

  test("text and ICU arguments inside and outside tags are formatted", () => {
    const i18n = createI18n({ source: "en" });
    const web = createWebRenderer(createRuntime());
    const message = i18n.t.rich(
      "<b>{count, plural, one {# post} other {# posts}}</b> by {who}, <i>{n, select, a {A} other {B}}</i>",
      { b: (children) => h("b", {}, children), i: (children) => h("i", {}, children) },
      { count: 1200, who: "Ada", n: "a" },
    );
    expect(web.renderToHtml(h("p", {}, message))).toBe(
      "<p><b>1,200 posts</b> by Ada, <i>A</i></p>",
    );
  });

  test("a translation may reorder tags, move them and drop the text between", () => {
    const template = "<a>First</a> and <b>second</b>";
    const i18n = createI18n({
      source: "en",
      locale: "fr",
      catalogs: { fr: { [template]: "<b>Deuxieme</b> puis <a>premier</a>" } },
    });
    const web = createWebRenderer(createRuntime());
    const parts = {
      a: (children: Child) => h("a", {}, children),
      b: (children: Child) => h("b", {}, children),
    };
    expect(web.renderToHtml(h("p", {}, i18n.t.rich(template, parts)))).toBe(
      "<p><b>Deuxieme</b> puis <a>premier</a></p>",
    );
  });

  test("mounted rich text updates in place on a locale change", async () => {
    const i18n = createI18n({
      source: "en",
      locale: "en",
      catalogs: { fr: { [guide]: "Lisez <link>le guide</link> maintenant" } },
    });
    const Page = () => h("p", {}, t.rich(guide, { link }));
    const { root, mounted } = mount(withProvider(i18n, h(Page, {})));
    const paragraph = root.children[0]!;
    expect(text(paragraph)).toBe("Read the guide now");
    const anchor = () => paragraph.children.flatMap((child) => [child, ...child.children]);
    expect(anchor().some((node) => node.kind === "element" && node.value === "a")).toBe(true);
    i18n.locale.value = "fr";
    await tick();
    expect(text(paragraph)).toBe("Lisez le guide maintenant");
    const link2 = anchor().find((node) => node.kind === "element" && node.value === "a")!;
    expect(link2.properties.href).toBe("/guide/");
    expect(text(link2)).toBe("le guide");
    mounted.unmount();
  });

  test("a tag without a part throws, naming the tag and the source", () => {
    const i18n = createI18n({ source: "en" });
    const message = i18n.t.rich(guide, {} as never);
    expect(() => message.value).toThrow("<link>");
    expect(() => message.value).toThrow(JSON.stringify(guide));
    // A translation that introduces a tag the caller did not supply fails the same way.
    const french = createI18n({
      source: "en",
      locale: "fr",
      catalogs: { fr: { [guide]: "Lisez <strong>le guide</strong>" } },
    });
    expect(() => french.t.rich(guide, { link }).value).toThrow("<strong>");
  });

  test("malformed tags fail to parse, and an inherited part name is not a part", () => {
    const i18n = createI18n({ source: "en" });
    expect(() => i18n.t.rich("<a>x", { a: link } as never).value).toThrow("Unclosed tag <a>");
    expect(() => i18n.t.rich("<a>x</b>", { a: link } as never).value).toThrow("does not match");
    expect(() => i18n.t.rich("x</a>", {} as never).value).toThrow("Unexpected closing tag");
    expect(() => i18n.t.rich("<toString>x</toString>", {} as never).value).toThrow("<toString>");
  });

  test("ordinary text with < stays text in rich messages that are not tags", () => {
    const i18n = createI18n({ source: "en" });
    expect(i18n.t.rich("1 < 2 and 3 > 2", {}).value).toEqual(["1 < 2 and 3 > 2"]);
  });

  test("the ambient t.rich throws outside a component body, and a rich Signal refuses strings", () => {
    expect(() => t.rich("Read <link>x</link>", { link })).toThrow("t.rich()");
    const message = createI18n({ source: "en" }).t.rich(guide, { link });
    expect(() => `${message as never}`).toThrow(".value");
    expect(() => String(message)).toThrow("Signal");
  });

  test("literal < in a plain t message is text", () => {
    const i18n = createI18n({ source: "en" });
    expect(i18n.t("a <b>bold</b> claim").value).toBe("a <b>bold</b> claim");
    expect(i18n.t("x < y").value).toBe("x < y");
  });
});

describe("i18n.lookup", () => {
  test("translates config copy literally: braces and apostrophes are not parsed", () => {
    const description = "Notes {draft} on 'quoting' and l'{name} #1";
    const i18n = createI18n({
      source: "en",
      locale: "fr",
      catalogs: { fr: { [description]: "Notes {brouillon} sur 'citer' et l'{nom} #1" } },
    });
    expect(i18n.lookup(description).value).toBe("Notes {brouillon} sur 'citer' et l'{nom} #1");
    // The same text through t would be parsed; lookup must not parse it.
    expect(() => i18n.t(description).value).not.toThrow();
    expect(i18n.t(description).value).not.toBe(i18n.lookup(description).value);
  });

  test("a text with an unmatched brace does not throw, and falls back with onMissing", () => {
    const misses: unknown[] = [];
    const i18n = createI18n({
      source: "en",
      locale: "de",
      catalogs: { de: {} },
      onMissing: (miss) => misses.push(miss),
    });
    const copy = "A site {with an open brace";
    const message = i18n.lookup(copy);
    expect(message.value).toBe(copy);
    expect(message.value).toBe(copy);
    expect(misses).toEqual([{ source: copy, locale: "de" }]);
    expect(i18n.lookup(copy, { context: "title" }).value).toBe(copy);
    expect(misses).toHaveLength(2);
  });

  test("follows the locale and catalogs, uses context, and refuses string conversion", async () => {
    const i18n = createI18n({
      source: "en",
      locale: "en",
      catalogs: { fr: { "My site": { "": "Mon site", title: "Titre" } } },
    });
    const name = i18n.lookup("My site");
    const title = i18n.lookup("My site", { context: "title" });
    expect(name.value).toBe("My site");
    i18n.locale.value = "fr";
    await tick();
    expect(name.value).toBe("Mon site");
    expect(title.value).toBe("Titre");
    expect(() => `${name}`).toThrow(".value");
    const dynamicText: string = ["My", "site"].join(" ");
    expect(i18n.lookup(dynamicText).value).toBe("Mon site");
  });
});
