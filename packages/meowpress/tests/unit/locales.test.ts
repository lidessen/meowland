import { expect, spyOn, test } from "bun:test";
import { signal } from "meowjsx/signal";
import type { MessageDescriptor } from "meowjsx/i18n";
import { mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { buildSite, meowSite, type SiteConfig } from "meowpress/build";
import { loadSection } from "../../src/content";
import { createPageLocale, localePath } from "../../src/locale";
import { themeMessages } from "../../src/messages";
import { createThemeI18n } from "../../src/locale";
import { listTextFiles, normalizeOutput, writeFixtureSite } from "../fixtures/site";

/** A catalog that translates the chrome of the French tree and a few site-owned strings. */
const FRENCH = {
  Posts: "Articles",
  Thoughts: "Pensées",
  Skills: "Compétences",
  About: "À propos",
  "Primary navigation": "Navigation principale",
  "Skip to content": "Aller au contenu",
  Archive: "Archives",
  "My site": "Mon site",
  "A site for tests.": "Un site pour les tests.",
};

async function withSite<T>(run: (root: string, output: string) => Promise<T>): Promise<T> {
  const root = await mkdtemp(join(tmpdir(), "meowpress-locales-"));
  try {
    await writeFixtureSite(root);
    return await run(root, join(root, "dist"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

function config(root: string, output: string, extra: SiteConfig = {}): SiteConfig {
  return {
    content: join(root, "content"),
    skillsDirectory: root,
    outputDirectory: output,
    localesDirectory: join(root, "locales"),
    site: {
      name: "My site",
      description: "A site for tests.",
      images: { hero: "images/site.svg", feed: "images/site.svg", about: "images/site.svg" },
      about: {
        heading: "About me",
        paragraphs: ["I write things."],
        linksHeading: "Elsewhere",
        links: [{ label: "GitHub", handle: "@me", href: "https://github.com/me" }],
      },
    },
    ...extra,
  };
}

async function read(output: string, path: string): Promise<string> {
  return Bun.file(join(output, path)).text();
}

async function files(directory: string): Promise<string[]> {
  const found: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) found.push(...(await files(path)));
    else found.push(path);
  }
  return found.sort();
}

test("a target locale publishes its own tree with translated chrome and honest fallbacks", async () => {
  await withSite(async (root, output) => {
    await buildSite(
      config(root, output, {
        locales: { source: "en", targets: { fr: { label: "Français" } }, catalogs: { fr: FRENCH } },
      }),
    );
    const home = await read(output, "fr/index.html");
    expect(home).toContain('<html lang="fr"');
    expect(home).not.toContain("dir=");
    expect(home).toContain('aria-label="Navigation principale"');
    expect(home).toContain('href="#main-content">Aller au contenu</a>');
    expect(home).toContain('<a class="site-name" href="/fr/">Mon site</a>');
    expect(home).toContain("<title>Mon site</title>");
    expect(home).toContain('content="Un site pour les tests."');
    // Links stay inside the tree, except the routes that exist only in the source tree.
    expect(home).toContain('<a href="/fr/posts/">Articles</a>');
    expect(home).toContain('<a href="/fr/thoughts/">Pensées</a>');
    expect(home).toContain('<a href="/skills/">Compétences</a>');
    expect(home).toContain('<a href="/fr/about/">À propos</a>');
    // A sentence without a translation shows the English source.
    expect(home).toContain('aria-label="Filter home feed"');
    // The stylesheet, hero and feed images resolve from the nested file.
    const stylesheet = home.match(/rel="stylesheet" crossorigin href="([^"]+)"/)![1]!;
    expect(stylesheet.startsWith("../")).toBe(true);
    expect(await Bun.file(join(output, "fr", stylesheet)).exists()).toBe(true);
    for (const image of home.matchAll(/<img[^>]*src="([^"]+)"/g)) {
      expect(image[1]!.startsWith("../")).toBe(true);
      expect(await Bun.file(join(output, "fr", image[1]!)).exists()).toBe(true);
    }
    // Every entry is an untranslated original: marked with its language, linked to the source URL.
    const entries = [...home.matchAll(/<li data-kind="(post|thought)"([^>]*)>/g)];
    expect(entries).toHaveLength(4);
    for (const entry of entries) expect(entry[2]).toContain('lang="en"');
    expect(home).toContain('href="/posts/first/"');
    expect(home).toContain('href="/thoughts/note/"');
    expect(home).not.toContain('href="/fr/posts/first/"');
    expect(home).not.toContain('href="/fr/thoughts/note/"');
    // Dates follow the page locale through the instance, even where the sentences fall back.
    expect(home).toContain(">3 septembre</h2>");
    expect(home).toContain("2026 jeu.");
    expect(await read(output, "index.html")).toContain(">September 3</h2>");

    const posts = await read(output, "fr/posts/index.html");
    expect(posts).toContain("<title>Articles · Mon site</title>");
    expect(posts).toContain('<a href="/fr/posts/" aria-current="page">Articles</a>');
    expect(posts).toContain("Archives");
    expect(await Bun.file(join(output, "fr/posts/index.html")).exists()).toBe(true);
    const about = await read(output, "fr/about/index.html");
    expect(about).toContain('src="../../');

    // Posts, thoughts and skills pages are not duplicated under the prefix.
    const written = (await files(join(output, "fr"))).map((file) => relative(output, file));
    expect(written.sort()).toEqual([
      "fr/404.html",
      "fr/about/index.html",
      "fr/agents.md",
      "fr/index.html",
      "fr/llm.txt",
      "fr/llms.txt",
      "fr/posts/index.html",
      "fr/thoughts/index.html",
    ]);
  });
});

test("omit leaves untranslated originals out of the target tree", async () => {
  await withSite(async (root, output) => {
    await buildSite(
      config(root, output, {
        locales: {
          source: "en",
          targets: { fr: { label: "Français" } },
          untranslated: "omit",
          catalogs: { fr: FRENCH },
        },
      }),
    );
    for (const path of ["fr/index.html", "fr/posts/index.html", "fr/thoughts/index.html"]) {
      const page = await read(output, path);
      expect(page).not.toContain('data-kind="post"');
      expect(page).not.toContain('data-kind="thought"');
      expect(page).not.toContain("First post");
      expect(page).toContain("No public content yet.");
    }
    // The source tree is untouched by the target's policy.
    expect(await read(output, "index.html")).toContain("First post");
  });
});

test("adding targets changes the source tree only in the language switch and index links", async () => {
  await withSite(async (root, output) => {
    const plain = join(root, "plain");
    await buildSite(config(root, plain));
    await buildSite(
      config(root, output, {
        locales: { source: "en", targets: { fr: { label: "Français" } }, catalogs: { fr: FRENCH } },
      }),
    );
    // Every page of the source tree keeps its content; a multilingual site adds the switch to
    // the header, marks each original's language in agents.md, and ends the agent indexes with
    // one link per other language.
    const sourceView = (text: string): string =>
      text
        .replace(/<nav class="site-locale-switch"[\s\S]*?<\/nav>/, "")
        .replace(/ · [a-z][a-z-]*$/gm, "")
        .replace(/ \([a-z][a-z-]*\):/g, ":")
        .split("\n## Languages\n")[0]!
        .replace(/\n+$/, "");
    const compared: string[] = [];
    for (const file of await listTextFiles(plain)) {
      const path = relative(plain, file);
      compared.push(path);
      const before = normalizeOutput(await Bun.file(file).text());
      const after = normalizeOutput(await read(output, path));
      if (path === "404.html") {
        expect(after).not.toBe(before);
        expect(after).toContain('<a href="/fr/" lang="fr" hreflang="fr">Français</a>');
        expect(after).toContain('<nav aria-label="Languages">');
        expect(before).not.toContain("hreflang");
      } else {
        expect(sourceView(after)).toBe(sourceView(before));
      }
    }
    expect(compared).toContain("index.html");
    expect(compared).toContain("posts/first/index.html");
    expect(compared).toContain("llms.txt");
    expect(compared).toContain("agents.md");
    // The switch marks the current language and points at the same page in the other tree.
    const about = await read(output, "about/index.html");
    expect(about).toContain(
      '<nav class="site-locale-switch" aria-label="Languages"><a href="/about/" lang="en" hreflang="en" aria-current="true">en</a><a href="/fr/about/" lang="fr" hreflang="fr">Français</a></nav>',
    );
    // The root indexes end with a link to each target's own index.
    expect(await read(output, "llms.txt")).toContain("## Languages\n\n- [Français](/fr/llms.txt)");
    expect(await read(output, "agents.md")).toContain("- [Français](/fr/llms.txt)");
    // A skills page exists once, in the source tree; its switch sends the target home.
    const skillsPage = await read(output, "skills/index.html");
    expect(skillsPage).toContain('<nav class="site-locale-switch"');
    expect(skillsPage).toContain('<a href="/fr/" lang="fr" hreflang="fr">Français</a>');
    const frenchIndex = await read(output, "fr/llms.txt");
    expect(frenchIndex).toContain("- Articles: /fr/posts/");
    // A target's index points back at the source index, never at itself.
    expect(frenchIndex).toContain("- [en](/llms.txt)");
    expect(frenchIndex).not.toContain("/fr/llms.txt");
    // The per-locale 404 links home inside its tree and sets its own base.
    const notFound = await read(output, "fr/404.html");
    expect(notFound).toContain('<base href="/fr/">');
    expect(notFound).toContain('<a href="/fr/">Back to home</a>');
    expect(notFound).not.toContain("hreflang");
  });
});

test("a catalog on disk fills the interface and an inline catalog wins over it", async () => {
  await withSite(async (root, output) => {
    await mkdir(join(root, "locales"), { recursive: true });
    await writeFile(
      join(root, "locales/fr.json"),
      JSON.stringify({ Posts: "Depuis le disque", Thoughts: "Pensées du disque" }),
    );
    await buildSite(
      config(root, output, {
        locales: {
          source: "en",
          targets: { fr: { label: "Français" } },
          catalogs: { fr: { Posts: "En ligne" } },
        },
      }),
    );
    const home = await read(output, "fr/index.html");
    expect(home).toContain('<a href="/fr/posts/">En ligne</a>');
    expect(home).toContain('<a href="/fr/thoughts/">Pensées du disque</a>');
    expect(home).not.toContain("Depuis le disque");
  });
});

test("an invalid catalog file fails the build and names the file", async () => {
  await withSite(async (root, output) => {
    await mkdir(join(root, "locales"), { recursive: true });
    const file = join(root, "locales/fr.json");
    const locales = { source: "en", targets: { fr: { label: "Français" } } };
    await writeFile(file, "{ not json");
    await expect(buildSite(config(root, output, { locales }))).rejects.toThrow(file);
    await writeFile(file, '["a list"]');
    await expect(buildSite(config(root, output, { locales }))).rejects.toThrow(file);
    await writeFile(file, '{ "Posts": 3 }');
    await expect(buildSite(config(root, output, { locales }))).rejects.toThrow(file);
  });
});

test("site-owned copy goes through the catalog for a target and stays as written in the source tree", async () => {
  await withSite(async (root, output) => {
    await buildSite(
      config(root, output, {
        notFound: { title: "Gone", message: "Nothing here.", homeLabel: "Go home" },
        locales: {
          source: "en",
          targets: { fr: { label: "Français" } },
          catalogs: {
            fr: {
              ...FRENCH,
              "About me": "À mon sujet",
              "I write things.": "J’écris des choses.",
              Elsewhere: "Ailleurs",
              GitHub: "GitHub (profil)",
              Gone: "Disparu",
              "Nothing here.": "Rien ici.",
              "Go home": "Retour",
            },
          },
        },
      }),
    );
    const about = await read(output, "fr/about/index.html");
    expect(about).toContain(">À mon sujet</h1>");
    expect(about).toContain("<p>J’écris des choses.</p>");
    expect(about).toContain(">Ailleurs</h2>");
    expect(about).toContain("GitHub (profil)");
    const notFound = await read(output, "fr/404.html");
    expect(notFound).toContain("<title>Disparu · Mon site</title>");
    expect(notFound).toContain("Rien ici.");
    expect(notFound).toContain('<a href="/fr/">Retour</a>');
    // The title is compared with the configured name before translation.
    expect(await read(output, "fr/index.html")).toContain("<title>Mon site</title>");
    // The source tree prints the configured copy untouched.
    const rootAbout = await read(output, "about/index.html");
    expect(rootAbout).toContain(">About me</h1>");
    expect(rootAbout).toContain("<p>I write things.</p>");
    expect(await read(output, "404.html")).toContain("Nothing here.");
    expect(await read(output, "index.html")).toContain("<title>My site</title>");
  });
});

test("a single-locale site whose source is not English translates its chrome without a prefixed tree", async () => {
  await withSite(async (root, output) => {
    await buildSite(
      config(root, output, {
        locales: {
          source: "fr",
          catalogs: { fr: { ...FRENCH, "My site": "NE DOIT PAS ETRE UTILISE" } },
        },
      }),
    );
    const home = await read(output, "index.html");
    expect(home).toContain('<html lang="fr"');
    expect(home).toContain('<a href="/posts/">Articles</a>');
    expect(home).toContain('aria-label="Navigation principale"');
    // Site copy is written in the source locale, so it is not looked up.
    expect(home).toContain("<title>My site</title>");
    expect(home).not.toContain("NE DOIT PAS ETRE UTILISE");
    // Source-tree entries carry no language mark.
    expect(home).not.toContain('lang="en"');
    expect(await Bun.file(join(output, "fr/index.html")).exists()).toBe(false);
    expect(await read(output, "agents.md")).toContain("- [Articles](/posts/)");
    expect(await read(output, "llm.txt")).toContain("- Articles: /posts/");
  });
});

test("each locale that falls back to English is reported once, and a site without locales prints nothing", async () => {
  const lines = async (extra: SiteConfig, run?: (root: string) => Promise<void>) =>
    withSite(async (root, output) => {
      await run?.(root);
      const log = spyOn(console, "log").mockImplementation(() => {});
      try {
        await buildSite(config(root, output, extra));
        return log.mock.calls
          .map((call) => String(call[0]))
          .filter((line) => line.startsWith("Locale "));
      } finally {
        log.mockRestore();
      }
    });
  const targets = { fr: { label: "Français" }, de: { label: "Deutsch" } };
  const empty = await lines({ locales: { source: "en", targets } });
  expect(empty).toHaveLength(2);
  const count = (line: string) => Number(line.match(/^Locale \w+: (\d+) messages/)![1]);
  const french = empty.find((line) => line.startsWith("Locale fr:"))!;
  expect(french).toContain("fr.json");
  expect(empty.some((line) => line.startsWith("Locale de:"))).toBe(true);
  // Translating two sentences the pages use removes exactly two misses.
  const partial = await lines({
    locales: {
      source: "en",
      targets,
      catalogs: { fr: { Posts: "Articles", Thoughts: "Pensées" } },
    },
  });
  expect(count(partial.find((line) => line.startsWith("Locale fr:"))!)).toBe(count(french) - 2);
  expect(count(partial.find((line) => line.startsWith("Locale de:"))!)).toBe(
    count(empty.find((line) => line.startsWith("Locale de:"))!),
  );
  expect(await lines({})).toEqual([]);
  expect(await lines({ locales: { source: "en" } })).toEqual([]);
});

test("a right-to-left locale sets dir on its own pages only", async () => {
  await withSite(async (root, output) => {
    await buildSite(
      config(root, output, {
        locales: {
          source: "en",
          targets: { ar: { label: "Al-Arabiyya" }, "zh-Hant": { label: "Zhongwen Fanti" } },
          catalogs: { ar: { Posts: "Al-maqalat" } },
        },
      }),
    );
    const arabic = await read(output, "ar/index.html");
    expect(arabic).toContain('<html lang="ar" dir="rtl"');
    expect(arabic).toContain('<a href="/ar/posts/">Al-maqalat</a>');
    expect(await read(output, "index.html")).not.toContain("dir=");
    // The URL segment is the lower-cased canonical tag; <html lang> keeps the canonical case.
    const chinese = await read(output, "zh-hant/index.html");
    expect(chinese).toContain('<html lang="zh-Hant"');
    expect(chinese).not.toContain("dir=");
    expect(chinese).toContain('<a href="/zh-hant/posts/"');
    expect(await read(output, "404.html")).toContain(
      '<a href="/zh-hant/" lang="zh-Hant" hreflang="zh-Hant">',
    );
  });
});

test("locale configuration is validated and canonicalized", () => {
  const locales = (extra: object) => ({ locales: { source: "en", ...extra } });
  expect(() => meowSite(locales({ targets: { en: { label: "English" } } }))).toThrow(
    "source locale",
  );
  expect(() => meowSite(locales({ targets: { EN: { label: "English" } } }))).toThrow(
    "source locale",
  );
  expect(() => meowSite(locales({ targets: { fr: { label: "A" }, FR: { label: "B" } } }))).toThrow(
    "after canonicalisation",
  );
  expect(() => meowSite(locales({ targets: { "not a tag": { label: "x" } } }))).toThrow(
    "Invalid locale tag",
  );
  expect(() => meowSite({ locales: { source: "x_y" } })).toThrow("Invalid locale tag");
  expect(() => meowSite(locales({ targets: { fr: { label: " " } } }))).toThrow("label");
  expect(() => meowSite(locales({ untranslated: "hide" as "link" }))).toThrow("untranslated");
  // "posts" is a well-formed language subtag, so it can only be refused as a route.
  expect(() => meowSite(locales({ targets: { posts: { label: "Posts" } } }))).toThrow(
    'Locale "posts"',
  );
  expect(() => meowSite(locales({ targets: { Skills: { label: "Skills" } } }))).toThrow("/skills/");
  const resolved = meowSite(
    locales({
      targets: { "zh-hant": { label: "Zhongwen Fanti" } },
      stale: "fail",
      disclosure: false,
      untranslated: "omit",
    }),
  ).locales!;
  expect(resolved.targets).toEqual([
    { tag: "zh-Hant", segment: "zh-hant", label: "Zhongwen Fanti" },
  ]);
  expect([resolved.stale, resolved.disclosure, resolved.untranslated]).toEqual([
    "fail",
    false,
    "omit",
  ]);
  expect(meowSite({}).locales).toBeUndefined();
  // A resolved config can be handed to buildSite, which resolves it again.
  expect(meowSite({ locales: resolved }).locales).toEqual(resolved);
});

test("a target that collides with something the build produces is refused during the build", async () => {
  await withSite(async (root, output) => {
    const locales = { source: "en", targets: { fr: { label: "Français" } } };
    // A top-level content asset directory.
    await mkdir(join(root, "content/assets/fr"), { recursive: true });
    await writeFile(join(root, "content/assets/fr/logo.txt"), "logo");
    await expect(buildSite(config(root, output, { locales }))).rejects.toThrow('Locale "fr"');
    await rm(join(root, "content/assets/fr"), { recursive: true });
    // A consumer page path.
    await expect(
      buildSite(
        config(root, output, {
          locales,
          pages: () => [{ path: "fr/guide", title: "Guide", html: "<!doctype html><p>x</p>" }],
        }),
      ),
    ).rejects.toThrow('Locale "fr"');
    // A slug prefix at the top level.
    await expect(
      buildSite(
        config(root, output, {
          content: [{ directory: join(root, "content"), slugPrefix: "fr/docs" }],
          locales,
        }),
      ),
    ).rejects.toThrow('Locale "fr"');
  });
});

test("a pages provider owns the site map: no locale tree is written and it receives the locales", async () => {
  await withSite(async (root, output) => {
    let received: unknown;
    await buildSite(
      config(root, output, {
        locales: { source: "en", targets: { fr: { label: "Français" } } },
        pages: (context) => {
          received = context.locales;
          return [{ path: "", title: "Home", html: "<!doctype html><h1>Home</h1>" }];
        },
      }),
    );
    expect(await Bun.file(join(output, "fr/index.html")).exists()).toBe(false);
    expect(await Bun.file(join(output, "fr")).exists()).toBe(false);
    expect(received).toMatchObject({
      source: "en",
      targets: [{ tag: "fr", segment: "fr", label: "Français" }],
      untranslated: "link",
    });
  });
});

test("site.url is an origin, site.timeZone is an IANA zone", () => {
  expect(meowSite({ site: { url: "https://example.com/" } }).site.url).toBe("https://example.com");
  expect(meowSite({ site: { url: "http://localhost:8080" } }).site.url).toBe(
    "http://localhost:8080",
  );
  expect(meowSite({}).site.url).toBeUndefined();
  for (const url of [
    "https://example.com/blog",
    "https://example.com/?q=1",
    "https://example.com/#top",
    "example.com",
    "ftp://example.com",
    "https://user@example.com",
  ]) {
    expect(() => meowSite({ site: { url } })).toThrow("site.url");
  }
  expect(meowSite({}).site.timeZone).toBe("Asia/Shanghai");
  expect(meowSite({ site: { timeZone: "America/New_York" } }).site.timeZone).toBe(
    "America/New_York",
  );
  expect(() => meowSite({ site: { timeZone: "Mars/Olympus" } })).toThrow("site.timeZone");
});

test("site.timeZone decides the day of a date that has no calendar date in its text", async () => {
  const root = await mkdtemp(join(tmpdir(), "meowpress-timezone-"));
  try {
    const content = join(root, "content");
    await mkdir(join(content, "posts"), { recursive: true });
    await mkdir(join(content, "thoughts"), { recursive: true });
    // 23:30 UTC on the 1st is already the 2nd in Shanghai and still the 1st in New York.
    await writeFile(
      join(content, "posts/late.md"),
      '---\ntitle: Late\ndate: "September 1, 2026 23:30:00 UTC"\n---\n\nBody.\n',
    );
    const key = async (timeZone?: string) =>
      (await loadSection(content, "post", timeZone === undefined ? {} : { timeZone }))[0]!.dateKey;
    expect(await key()).toBe("2026-09-02");
    expect(await key("Asia/Shanghai")).toBe("2026-09-02");
    expect(await key("UTC")).toBe("2026-09-01");
    expect(await key("America/New_York")).toBe("2026-09-01");
    // The same through a build: the agent index lists the day key.
    const index = async (site: SiteConfig["site"]) => {
      const output = join(root, "dist");
      await buildSite({ content, skillsDirectory: root, outputDirectory: output, fonts: [], site });
      return Bun.file(join(output, "agents.md")).text();
    };
    expect(await index({})).toContain("— 2026-09-02");
    expect(await index({ timeZone: "UTC" })).toContain("— 2026-09-01");
    // A thought without a date text prints its time in the configured zone.
    await writeFile(join(content, "thoughts/untimed.md"), "---\ntitle: Untimed\n---\n\nHi.\n");
    const thought = async (timeZone: string) =>
      (await loadSection(content, "thought", { timeZone }))[0]!.timeLabel;
    expect(await thought("UTC")).not.toBe(await thought("Asia/Kolkata"));
    expect(await thought("UTC")).toMatch(/^\d{2}:\d{2}$/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("the theme refuses a sentence that is not in the message table", () => {
  const i18n = createThemeI18n({
    source: "en",
    locale: "fr",
    catalogs: { fr: { Posts: "Articles" } },
  });
  expect(i18n.t(themeMessages.posts).value).toBe("Articles");
  // The same source written inline is accepted only because the table declares it.
  expect(i18n.t("Posts").value).toBe("Articles");
  expect(() => i18n.t("An inline sentence")).toThrow(
    /not declared in themeMessages.*An inline sentence/,
  );
  expect(() => i18n.t({ source: "Posts", context: "wrong context" })).toThrow(/themeMessages/);
  // A declared source with the wrong context is a different message.
  expect(() => i18n.t("Post")).toThrow(/themeMessages/);
  expect(i18n.t("Post", undefined, { context: "content type" }).value).toBe("Post");
  expect(() => i18n.t.rich("Use <b>bold</b> here", { b: (children) => children })).toThrow(
    /Use <b>bold<\/b> here/,
  );
  // A Signal of a descriptor is checked when it is read.
  const status = signal<MessageDescriptor>(themeMessages.posts);
  const followed = i18n.t(status);
  expect(followed.value).toBe("Articles");
  status.value = { source: "Not in the table" };
  expect(() => followed.value).toThrow(/themeMessages/);
  // Site-owned copy is not part of the table.
  expect(i18n.lookup("Anything the site says").value).toBe("Anything the site says");
});

test("an unknown sentence cannot reach the theme through a rendered page either", () => {
  const locale = createPageLocale({ tag: "fr", source: "en", segment: "fr", catalogs: {} });
  expect(() => locale.i18n.t("Hard-coded sentence")).toThrow("themeMessages");
});

test("localePath prefixes only the routes a target tree has", () => {
  const source = createPageLocale({ tag: "en", source: "en", segment: "", catalogs: {} });
  const french = createPageLocale({ tag: "fr", source: "en", segment: "fr", catalogs: {} });
  for (const route of ["/", "/posts/", "/about/", "/skills/", "/posts/first/"]) {
    expect(localePath(source, route)).toBe(route);
  }
  expect(localePath(french, "/")).toBe("/fr/");
  expect(localePath(french, "/posts/")).toBe("/fr/posts/");
  expect(localePath(french, "/thoughts/")).toBe("/fr/thoughts/");
  expect(localePath(french, "/about/")).toBe("/fr/about/");
  expect(localePath(french, "/skills/")).toBe("/skills/");
  expect(localePath(french, "/posts/first/")).toBe("/posts/first/");
  expect(localePath(french, "/llm.txt")).toBe("/llm.txt");
});
