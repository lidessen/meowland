import { expect, test } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { buildSite, meowSite, type SiteConfig, type SiteLocales } from "meowpress/build";
import { loadSection, translationHash, type ContentLocales } from "../../src/content";
import { translationReport, formatReport, stampTranslation } from "../../src/translations";

const LOCALES: ContentLocales = { source: "en", targets: ["fr"] };

const ORIGINAL_POST = [
  "---",
  "title: First post",
  "date: 2026-09-01",
  "category: Notes",
  "tags: [Writing]",
  "---",
  "",
  "# First post",
  "",
  "The original body.",
  "",
].join("\n");

/** The body after the frontmatter, exactly as the loader sees it. */
const ORIGINAL_BODY = "# First post\n\nThe original body.\n";

/** The provenance hash a translation of `ORIGINAL_POST` records to be current. */
const ORIGINAL_HASH = translationHash({ title: "First post", body: ORIGINAL_BODY });

function translation(title: string, hash?: string): string {
  return [
    "---",
    `title: ${title}`,
    ...(hash === undefined ? [] : ["translation:", `  source: ${hash}`]),
    ...(hash === undefined ? [] : ["  reviewed: false"]),
    "---",
    "",
    `# ${title}`,
    "",
    "Le corps traduit.",
    "",
  ].join("\n");
}

async function withRoot<T>(run: (root: string) => Promise<T>): Promise<T> {
  const root = await mkdtemp(join(tmpdir(), "meowpress-translations-"));
  try {
    return await run(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

async function write(root: string, files: Record<string, string>): Promise<void> {
  for (const [path, text] of Object.entries(files)) {
    await mkdir(dirname(join(root, path)), { recursive: true });
    await writeFile(join(root, path), text);
  }
}

function config(root: string, output: string, extra: SiteConfig = {}): SiteConfig {
  return {
    content: join(root, "content"),
    skillsDirectory: root,
    outputDirectory: output,
    fonts: [],
    ...extra,
  };
}

/** The content tree with an English original and a French translation that records `hash`. */
async function writePair(root: string, hash: string | undefined): Promise<void> {
  await write(root, {
    "content/posts/first.md": ORIGINAL_POST,
    "content/posts/first.fr.md": translation("Premier billet", hash),
  });
}

const FRENCH_TARGET: SiteLocales = {
  source: "en",
  targets: { fr: { label: "Français" } },
};

test("a locale suffix pairs a translation with its original and inherits what it omits", () =>
  withRoot(async (root) => {
    await writePair(root, undefined);
    const items = await loadSection(join(root, "content"), "post", { locales: LOCALES });
    const [original] = items;
    expect(items).toHaveLength(1);
    expect(original!.slug).toBe("first");
    expect(original!.locale).toBe("en");
    expect(original!.translations.map((item) => item.locale)).toEqual(["fr"]);
    const french = original!.translations[0]!;
    expect(french.title).toBe("Premier billet");
    expect(french.original).toBe(original);
    // No recorded hash: the translation cannot be current.
    expect(french.translatedFrom).toBeUndefined();
    expect(french.translationState).toBe("stale");
    // Date, tags and category are inherited from the original.
    expect(french.dateKey).toBe("2026-09-01");
    expect(french.tags).toEqual(["Writing"]);
    expect(french.metadata.category).toBe("Notes");
    // The file name says which slug was replaced when the suffix started reading.
    expect(french.previousSlug).toBe("first.fr");
  }));

test("a suffix that is not a configured locale stays part of the slug", () =>
  withRoot(async (root) => {
    await write(root, {
      "content/posts/notes.v2.md": "# Version two\n\nBody.",
      "content/posts/notes.fr.md": "# Version française\n\nCorps.",
    });
    const items = await loadSection(join(root, "content"), "post", { locales: LOCALES });
    expect(items.map((item) => item.slug).sort()).toEqual(["notes", "notes.v2"]);
    // `notes.fr.md` is the French translation of `notes.md`; nothing claims `notes.v2.fr`.
    const notes = items.find((item) => item.slug === "notes")!;
    expect(notes.locale).toBe("fr");
    expect(notes.translations).toEqual([]);
  }));

test("a source file and its source-suffixed copy are refused", () =>
  withRoot(async (root) => {
    await write(root, {
      "content/posts/first.md": ORIGINAL_POST,
      "content/posts/first.en.md": ORIGINAL_POST,
    });
    await expect(loadSection(join(root, "content"), "post", { locales: LOCALES })).rejects.toThrow(
      'Duplicate post "first" for locale "en"',
    );
  }));

test("a set without a source original is an original in its own language", () =>
  withRoot(async (root) => {
    await write(root, { "content/posts/only-fr.fr.md": translation("Seulement français") });
    const items = await loadSection(join(root, "content"), "post", { locales: LOCALES });
    expect(items).toHaveLength(1);
    expect(items[0]!.locale).toBe("fr");
    expect(items[0]!.translations).toEqual([]);
    expect(items[0]!.translationState).toBeUndefined();
  }));

test("the provenance hash covers the resolved title and the LF body", () =>
  withRoot(async (root) => {
    await write(root, {
      "content/posts/one.md": ORIGINAL_POST,
      "content/posts/two.md": ORIGINAL_POST.replaceAll("\n", "\r\n"),
    });
    const [one, two] = await loadSection(join(root, "content"), "post");
    expect(translationHash(one!)).toBe(translationHash(two!));
    expect(translationHash(one!)).toMatch(/^[0-9a-f]{12}$/);
    expect(translationHash({ ...one!, title: "Changed" })).not.toBe(translationHash(one!));
  }));

test("a recorded matching hash is current; a changed original is stale", () =>
  withRoot(async (root) => {
    await writePair(root, ORIGINAL_HASH);
    const current = await loadSection(join(root, "content"), "post", { locales: LOCALES });
    expect(current[0]!.translations[0]!.translationState).toBe("current");
    await write(root, {
      "content/posts/first.md": ORIGINAL_POST.replace("The original body.", "A revised body."),
    });
    const stale = await loadSection(join(root, "content"), "post", { locales: LOCALES });
    expect(stale[0]!.translations[0]!.translationState).toBe("stale");
  }));

test("a translated page keeps its language, notices and links, and the manifest records it", () =>
  withRoot(async (root) => {
    await writePair(root, ORIGINAL_HASH);
    await write(root, {
      "content/thoughts/note.md": "---\ntitle: A note\ndate: 2026-09-02\n---\n\nNote body.",
    });
    const output = join(root, "dist");
    await buildSite(config(root, output, { locales: FRENCH_TARGET }));

    // The translation is published under its own tree, with a notice and a link to the original.
    const page = await Bun.file(join(output, "fr/posts/first/index.html")).text();
    expect(page).toContain('<html lang="fr"');
    expect(page).toMatch(/<h1[^>]*>Premier billet<\/h1>/);
    expect(page).toContain('data-translation="unreviewed"');
    expect(page).toContain('<a href="/posts/first/">the original</a>');
    expect(page).not.toContain('data-translation="stale"');
    expect(page).not.toContain('rel="alternate"');

    // The target archive links the translated page; the untranslated note keeps its language.
    const archive = await Bun.file(join(output, "fr/posts/index.html")).text();
    expect(archive).toContain('href="/fr/posts/first/"');
    expect(archive).toContain("Premier billet");
    expect(archive).not.toContain('href="/posts/first/"');
    const thoughts = await Bun.file(join(output, "fr/thoughts/index.html")).text();
    expect(thoughts).toContain('data-kind="thought" lang="en"');
    expect(thoughts).toContain('href="/thoughts/note/"');

    // The source page stays in English and offers the translated version through the switch.
    const source = await Bun.file(join(output, "posts/first/index.html")).text();
    expect(source).toContain('href="/fr/posts/first/" lang="fr" hreflang="fr">Français</a>');
    expect(source).not.toContain("data-translation=");

    // The manifest lists every content page with its state and hashes.
    const manifest = JSON.parse(await readFile(join(output, "translations.json"), "utf8"));
    expect(manifest.source).toBe("en");
    expect(manifest.pages).toContainEqual(
      expect.objectContaining({
        slug: "first",
        locale: "fr",
        url: "/fr/posts/first/",
        state: "current",
        original: "/posts/first/",
        translatedFrom: ORIGINAL_HASH,
      }),
    );
    expect(manifest.work.fr.content).toContainEqual(
      expect.objectContaining({
        kind: "thought",
        slug: "note",
        state: "missing",
        target: expect.objectContaining({ file: expect.stringContaining("note.fr.md") }),
      }),
    );
    // The per-locale index links the translated page, marks the untranslated one, and points at
    // its own agent guide, not the root one.
    const frenchIndex = await Bun.file(join(output, "fr/llms.txt")).text();
    expect(frenchIndex).toContain("- Premier billet: /fr/posts/first/");
    expect(frenchIndex).toContain("- A note (en): /thoughts/note/");
    expect(frenchIndex).toContain("- Agent Markdown: /fr/agents.md");
  }));

test("a stale translation says so, and stale: fail refuses the build", () =>
  withRoot(async (root) => {
    await writePair(root, ORIGINAL_HASH);
    await write(root, {
      "content/posts/first.md": ORIGINAL_POST.replace("The original body.", "A revised body."),
    });
    const output = join(root, "dist");
    await buildSite(config(root, output, { locales: FRENCH_TARGET }));
    const page = await Bun.file(join(output, "fr/posts/first/index.html")).text();
    expect(page).toContain('data-translation="stale"');
    expect(page).toContain('data-translation="unreviewed"');
    await expect(
      buildSite(
        config(root, join(root, "failed"), {
          locales: { ...FRENCH_TARGET, stale: "fail" },
        }),
      ),
    ).rejects.toThrow("Stale translation");
  }));

test("disclosure: false keeps reviewed and unreviewed translations quiet", () =>
  withRoot(async (root) => {
    await writePair(root, ORIGINAL_HASH);
    const output = join(root, "dist");
    await buildSite(config(root, output, { locales: { ...FRENCH_TARGET, disclosure: false } }));
    const page = await Bun.file(join(output, "fr/posts/first/index.html")).text();
    expect(page).not.toContain('data-translation="unreviewed"');
    expect(page).not.toContain("This is a translation");
  }));

test("site.url adds canonical and alternate links; without it the build says so once", () =>
  withRoot(async (root) => {
    await writePair(root, undefined);
    const output = join(root, "dist");
    await buildSite(
      config(root, output, {
        locales: FRENCH_TARGET,
        site: { url: "https://example.com" },
      }),
    );
    const french = await Bun.file(join(output, "fr/about/index.html")).text();
    expect(french).toContain('<link rel="canonical" href="https://example.com/fr/about/">');
    expect(french).toContain(
      '<link rel="alternate" hreflang="en" href="https://example.com/about/">',
    );
    expect(french).toContain(
      '<link rel="alternate" hreflang="fr" href="https://example.com/fr/about/">',
    );
    expect(french).toContain(
      '<link rel="alternate" hreflang="x-default" href="https://example.com/about/">',
    );

    const { spyOn } = await import("bun:test");
    const log = spyOn(console, "log").mockImplementation(() => {});
    try {
      await buildSite(config(root, join(root, "plain"), { locales: FRENCH_TARGET }));
      const lines = log.mock.calls.map((call) => String(call[0]));
      expect(lines.filter((line) => line.startsWith("Site url is not set"))).toHaveLength(1);
    } finally {
      log.mockRestore();
    }
    const plain = await Bun.file(join(root, "plain/fr/about/index.html")).text();
    expect(plain).not.toContain('rel="canonical"');
    expect(plain).not.toContain('<link rel="alternate"');
  }));

test("the work list names missing and stale content with both hashes", () =>
  withRoot(async (root) => {
    await writePair(root, ORIGINAL_HASH);
    await write(root, {
      "content/posts/second.md": ORIGINAL_POST.replace("First post", "Second post"),
      "content/thoughts/note.md": "---\ntitle: A note\n---\n\nNote body.",
    });
    const [posts, thoughts] = await Promise.all([
      loadSection(join(root, "content"), "post", { locales: LOCALES }),
      loadSection(join(root, "content"), "thought", { locales: LOCALES }),
    ]);
    const site = meowSite({
      content: join(root, "content"),
      locales: { source: "en", targets: { fr: { label: "Français" } } },
    });
    const report = translationReport({
      locales: site.locales!,
      catalogs: {},
      site: site.site,
      posts,
      thoughts,
    });
    expect(report.work.fr!.messages.missing.length).toBeGreaterThan(0);
    const missing = report.work.fr!.content;
    expect(missing.map((item) => item.slug)).toContain("second");
    expect(missing.every((item) => item.state === "missing")).toBe(true);
    expect(missing.every((item) => item.target.file.endsWith(".fr.md"))).toBe(true);
    expect(formatReport(report)).toContain("fr missing: ");

    // Revising the original makes the existing translation stale, and the list says so.
    await write(root, {
      "content/posts/first.md": ORIGINAL_POST.replace("First post", "Revised post"),
    });
    const revised = await loadSection(join(root, "content"), "post", { locales: LOCALES });
    const staleReport = translationReport({
      locales: site.locales!,
      catalogs: {},
      site: site.site,
      posts: revised,
      thoughts: [],
    });
    const stale = staleReport.work.fr!.content.find((item) => item.slug === "first")!;
    expect(stale.state).toBe("stale");
    expect(stale.translatedFrom).toBe(ORIGINAL_HASH);
    expect(stale.original.hash).not.toBe(ORIGINAL_HASH);
    expect(formatReport(staleReport)).toContain(`translated from ${ORIGINAL_HASH}`);
  }));

test("stamp writes the current hash and leaves the rest of the frontmatter alone", () =>
  withRoot(async (root) => {
    await writePair(root, undefined);
    const file = join(root, "content/posts/first.fr.md");
    const items = await loadSection(join(root, "content"), "post", { locales: LOCALES });
    const stamped = await stampTranslation(file, items);
    const hash = translationHash(items[0]!);
    expect(stamped.hash).toBe(hash);
    const text = await readFile(file, "utf8");
    expect(text).toContain(`translation:\n  source: ${hash}`);
    expect(text).toContain("title: Premier billet");
    expect(text).toContain("Le corps traduit.");
    const reloaded = await loadSection(join(root, "content"), "post", { locales: LOCALES });
    expect(reloaded[0]!.translations[0]!.translationState).toBe("current");

    // A file without frontmatter gains one.
    await write(root, {
      "content/posts/plain.md": "The plain original.\n",
      "content/posts/plain.fr.md": "Just a body.\n",
    });
    const plainItems = await loadSection(join(root, "content"), "post", { locales: LOCALES });
    const plain = plainItems
      .flatMap((item) => item.translations)
      .find((item) => item.slug === "plain")!;
    await stampTranslation(plain.sourcePath, plainItems);
    const rewritten = await readFile(plain.sourcePath, "utf8");
    expect(rewritten.startsWith("---\ntranslation:\n  source: ")).toBe(true);
    expect(rewritten.endsWith("Just a body.\n")).toBe(true);
    // An original is not a translation.
    await expect(
      stampTranslation(join(root, "content/posts/first.md"), plainItems),
    ).rejects.toThrow("Not a translation");
  }));

test("a consumer page records its language in the manifest and its Markdown copy", () =>
  withRoot(async (root) => {
    const output = join(root, "dist");
    await buildSite(
      config(root, output, {
        locales: FRENCH_TARGET,
        pages: ({ pageLocale }) => {
          // A provider builds the same locale the built-in pages use, and is told bad tags.
          const french = pageLocale("fr");
          expect(french.tag).toBe("fr");
          expect(french.segment).toBe("fr");
          expect(french.i18n.locale.value).toBe("fr");
          expect(() => pageLocale("de")).toThrow('Page locale "de" is not configured');
          return [
            {
              path: "guide",
              title: "Guide",
              html: "<!doctype html><h1>Guide</h1>",
              markdown: "# Guide\n",
              locale: "fr",
              original: "/guides/",
            },
          ];
        },
      }),
    );
    const markdown = await Bun.file(join(output, "guide.md")).text();
    expect(markdown).toBe("<!-- lang: fr; original: /guides/ -->\n\n# Guide\n");
    const manifest = JSON.parse(await readFile(join(output, "translations.json"), "utf8"));
    expect(manifest.sitePages).toEqual([{ path: "guide", locale: "fr", original: "/guides/" }]);
  }));
