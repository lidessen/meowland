import { sitePageMarkdownFile, type ContentItem, type SitePage } from "meowpress/build";
import type { StoryEntry } from "meowbook";
import {
  styleAxes,
  type CatalogComponent,
  type CatalogExample,
  type CatalogStyleProps,
} from "./catalog";
import { splitTopLevel } from "./code";
import { displayName } from "./families";
import type { DocsPackage } from "./packages";
import {
  COMPONENT_PACKAGE,
  COMPONENTS_PATH,
  COMPONENTS_SUMMARY,
  componentInstall,
  sourceFor,
  storyLabel,
  usageFor,
  type DocsState,
} from "./pages";
import { splitSummary, type ComponentProps } from "./props";
import * as meowtail from "meowtail";
import * as meowtailIcons from "meowtail/icons";
import { SITE_DESCRIPTION, SITE_NAME } from "./document";

/**
 * The Markdown an agent reads in place of a page. Each copy says what the HTML page says, minus
 * the live previews: the import, the props and the code behind every example. The HTML stays the
 * page for people; this is the same content in the form a model reads without a browser.
 */

/** Where an agent reads a page: `/components/button.md` for `/components/button/`. */
export function markdownUrl(path: string): string {
  return `/${sitePageMarkdownFile(path)}`;
}

/** A fenced block whose fence is longer than any backtick run inside the code. */
function fence(code: string, language = ""): string {
  const longest = Math.max(2, ...[...code.matchAll(/`+/g)].map((match) => match[0].length));
  const marks = "`".repeat(longest + 1);
  return `${marks}${language}\n${code.replace(/\s+$/, "")}\n${marks}`;
}

/** Text that sits in one table cell: one line, and no bare pipe to end the cell early. */
function cell(text: string): string {
  return text.replace(/\s+/g, " ").replace(/\|/g, "\\|").trim();
}

/** A code span for a table cell, long enough for the backticks the value carries. */
function codeCell(text: string): string {
  const value = cell(text);
  return value.includes("`") ? `\`\` ${value} \`\`` : `\`${value}\``;
}

function languageOf(file?: string): string {
  const separator = file?.lastIndexOf(".") ?? -1;
  return file && separator >= 0 ? file.slice(separator + 1) : "tsx";
}

/** What a props interface inherits, in the words the HTML page uses. */
function inheritedText(extended: readonly string[]): string | undefined {
  const unions = extended
    .filter((entry) => entry.startsWith("("))
    .flatMap((entry) => splitTopLevel(entry.replace(/^\(\s*|\s*\)$/g, ""), "|"));
  const others = extended.filter(
    (entry) => entry !== "Props" && !entry.startsWith("ThemedProps<") && !entry.startsWith("("),
  );
  const element = extended.includes("Props");
  const sentences: string[] = [];
  if (element)
    sentences.push(
      "Also takes `className`, `children` and the attributes and events of its root element.",
    );
  if (others.length)
    sentences.push(
      `${element ? "It also extends" : "Also takes the props of"} ${others.map((entry) => `\`${entry}\``).join(", ")}.`,
    );
  const lines = sentences.length ? [sentences.join(" ")] : [];
  if (unions.length)
    lines.push(
      "It also takes exactly one of these shapes:",
      "",
      ...unions.map((shape) => `- \`${cell(shape)}\``),
    );
  return lines.length ? lines.join("\n") : undefined;
}

/** The props table: style axes first, then the declared props, as on the HTML page. */
export function propsMarkdown(
  style: CatalogStyleProps | undefined,
  props: ComponentProps | undefined,
): string {
  const rows: string[] = [];
  const seen = new Set<string>();
  for (const entry of styleAxes(style)) {
    seen.add(entry.axis);
    rows.push(
      `| \`${entry.axis}\` | ${codeCell(entry.choices.map((choice) => JSON.stringify(choice)).join(" | "))} | ${codeCell(JSON.stringify(entry.default))} | Style axis; the theme paints each choice. |`,
    );
  }
  for (const prop of props?.props ?? []) {
    if (prop.name === "className" || seen.has(prop.name)) continue;
    seen.add(prop.name);
    const name = prop.optional ? `\`${prop.name}\`` : `\`${prop.name}\` (required)`;
    rows.push(
      `| ${name} | ${codeCell(prop.type)} | ${prop.default === undefined ? "–" : codeCell(prop.default)} | ${prop.description ? cell(prop.description) : ""} |`,
    );
  }
  const inherited = props ? inheritedText(props.extends) : undefined;
  if (!rows.length) return inherited ?? "This component documents no props of its own.";
  return [
    "| Prop | Type | Default | Description |",
    "| --- | --- | --- | --- |",
    ...rows,
    ...(inherited ? ["", inherited] : []),
  ].join("\n");
}

/**
 * The components an example draws that a host cannot import: the story files' own scaffolding,
 * such as a specimen frame. An agent copying the example would otherwise look for them in the
 * package.
 */
export function storyHelpers(source: string): string[] {
  const local = new Set(
    [...source.matchAll(/(?:function|const|let|class)\s+([A-Z][\w$]*)/g)].map((match) => match[1]!),
  );
  const helpers = new Set<string>();
  for (const match of source.matchAll(/<([A-Z][\w$]*)[\s/>]/g)) {
    const name = match[1]!;
    if (name === "Fragment" || local.has(name)) continue;
    if (name in meowtail || name in meowtailIcons) continue;
    helpers.add(name);
  }
  return [...helpers];
}

/** The sentence that names an example's story scaffolding, when it has any. */
function helperNote(source: string): string | undefined {
  const helpers = storyHelpers(source).map((name) => `\`${name}\``);
  if (!helpers.length) return undefined;
  const names =
    helpers.length === 1
      ? helpers[0]!
      : `${helpers.slice(0, -1).join(", ")} and ${helpers[helpers.length - 1]}`;
  return `${names} ${helpers.length === 1 ? "is" : "are"} story scaffolding from the repository, not a package export; leave ${helpers.length === 1 ? "it" : "them"} out.`;
}

/** The code behind an example, with a note on anything in it the package does not export. */
function codeMarkdown(source: string | undefined, file: string | undefined): string {
  if (!source) return "The source of this story is not available.";
  const note = helperNote(source);
  return note ? `${fence(source, languageOf(file))}\n\n${note}` : fence(source, languageOf(file));
}

/** One example: its label, what it shows and the code that draws it. */
function exampleMarkdown(state: DocsState, story: StoryEntry, heading = "###"): string {
  const { source, file } = sourceFor(state, story);
  return [
    `${heading} ${storyLabel(story)}`,
    ...(story.description ? ["", story.description] : []),
    "",
    codeMarkdown(source, file),
  ].join("\n");
}

/** The Markdown copy of a component page. */
export function componentMarkdown(component: CatalogComponent, state: DocsState): string {
  const props = state.props?.get(component.title);
  const notes = props?.summary ? splitSummary(props.summary).rest : undefined;
  const borrowed = component.stories.length === 0;
  const stories = borrowed ? component.usedIn : component.stories;
  const usage = usageFor(component, state);
  const lines = [
    `# ${component.title}`,
    "",
    component.summary ??
      `${displayName(component.title)} has no summary yet; its props and DOM parts follow.`,
    ...(notes ? ["", notes] : []),
    "",
    "## Installation",
    "",
    fence(componentInstall(state), "sh"),
    "",
    `Set up the runtime and theme once per app before rendering it: see [${COMPONENT_PACKAGE}](${markdownUrl(`packages/${COMPONENT_PACKAGE}`)}).`,
  ];
  if (usage) {
    lines.push(
      "",
      "## Usage",
      "",
      fence(usage.snippet ? `${usage.importLine}\n\n${usage.snippet}` : usage.importLine, "tsx"),
    );
  }
  if (component.meta) {
    lines.push(
      "",
      `Register \`${component.title}\` on the runtime that renders it: \`createMeowUI({ components: [${component.title}] })\`, or pass the complete \`meowUIComponents\` list. Its registry name is \`${component.meta.name}\`.`,
    );
  }
  lines.push(
    "",
    "## Props",
    "",
    propsMarkdown(component.meta?.style, props),
    "",
    "## DOM parts",
    "",
    component.meta
      ? `${component.meta.parts.map((part) => `\`${part}\``).join(", ")}. A theme rule addresses them with \`parts<typeof ${component.title}>("${component.meta.name}")\` from \`meowcss/meowjsx\`; a host passes \`className\` for an instance.`
      : "This component has no registry metadata.",
  );
  if (stories.length) {
    lines.push(
      "",
      "## Examples",
      "",
      borrowed
        ? `${displayName(component.title)} has no story of its own; these stories draw it inside other components.`
        : "Each example is a story in the playground; the code is what draws it. Components come from `meowtail`, icons from `meowtail/icons` and Signals from `meowjsx/signal`.",
      "",
      stories.map((story) => exampleMarkdown(state, story)).join("\n\n"),
    );
  }
  return `${lines.join("\n")}\n`;
}

/** The Markdown copy of a composition example. */
export function compositionMarkdown(example: CatalogExample, state: DocsState): string {
  const { source, file } = sourceFor(state, example.story);
  return [
    `# ${example.name}`,
    "",
    example.story.description ?? "A story that composes several components.",
    "",
    "## Code",
    "",
    codeMarkdown(source, file),
    "",
  ].join("\n");
}

/** The component index: every group with a link to each component's Markdown and its summary. */
export function componentsIndexMarkdown(state: DocsState): string {
  const summaries = new Map(
    state.catalog.components.map((component) => [component.path, component.summary]),
  );
  return [
    "# Components",
    "",
    COMPONENTS_SUMMARY,
    "",
    `Every component is a named export of \`${COMPONENT_PACKAGE}\`. Install with \`${componentInstall(state)}\`.`,
    "",
    ...state.catalog.navigation.flatMap((group) => [
      `## ${group.label}`,
      "",
      ...group.entries.map((entry) => {
        const summary = summaries.get(entry.path);
        const name = entry.path.startsWith(`${COMPONENTS_PATH}/`)
          ? (state.catalog.components.find((component) => component.path === entry.path)?.title ??
            entry.label)
          : entry.label;
        return `- [${name}](${markdownUrl(entry.path)})${summary ? `: ${summary}` : ""}`;
      }),
      "",
    ]),
  ].join("\n");
}

/**
 * MDX content as plain Markdown: a live canvas becomes a playground link and a callout becomes a
 * quote. Code fences pass through untouched.
 */
export function plainMarkdown(body: string): string {
  const out: string[] = [];
  let fenceMarks: string | undefined;
  let callout = false;
  for (const line of body.split("\n")) {
    const marks = /^\s*(`{3,}|~{3,})/.exec(line)?.[1];
    if (fenceMarks) {
      if (marks && marks[0] === fenceMarks[0] && marks.length >= fenceMarks.length)
        fenceMarks = undefined;
      out.push(line);
      continue;
    }
    if (marks) {
      fenceMarks = marks;
      out.push(line);
      continue;
    }
    const canvas = /^\s*<StoryCanvas\b([^>]*)\/>\s*$/.exec(line);
    if (canvas) {
      const story = /story="([^"]+)"/.exec(canvas[1]!)?.[1] ?? "";
      const title = /title="([^"]+)"/.exec(canvas[1]!)?.[1] ?? story;
      out.push(`[Live example: ${title}](/gallery/?story=${encodeURIComponent(story)})`);
      continue;
    }
    if (/^\s*<Callout\b[^>]*>\s*$/.test(line)) {
      callout = true;
      continue;
    }
    if (callout && /^\s*<\/Callout>\s*$/.test(line)) {
      callout = false;
      continue;
    }
    out.push(callout ? `> ${line.trim()}`.trimEnd() : line);
  }
  return out.join("\n").trim();
}

/** The Markdown copy of a package page. */
export function packageMarkdown(entry: DocsPackage, content: ContentItem | undefined): string {
  const body = content ? plainMarkdown(content.body).replace(/^#\s+.+\n+/, "") : "";
  const lines = [
    `# ${entry.title}`,
    "",
    entry.summary,
    "",
    "## Installation",
    "",
    fence(entry.install, "sh"),
    "",
    `This page follows the workspace source (\`${entry.version}\`). The \`dev\` channel is the published line closest to it; \`latest\` may still be an earlier release with a different API.`,
  ];
  if (body) lines.push("", body);
  if (entry.name === COMPONENT_PACKAGE)
    lines.push(
      "",
      "## Components",
      "",
      `The [component index](${markdownUrl(COMPONENTS_PATH)}) lists every component with a link to its own page: the import, the props and the code behind each example.`,
    );
  return `${lines.join("\n")}\n`;
}

/** The Markdown copy of the home page. */
export function homeMarkdown(state: DocsState): string {
  return [
    `# ${SITE_NAME}`,
    "",
    SITE_DESCRIPTION,
    "",
    "## Packages",
    "",
    ...state.packages.map(
      (entry) => `- [${entry.title}](${markdownUrl(entry.path)}): ${entry.summary}`,
    ),
    "",
    "## Components",
    "",
    `${state.catalog.components.length} components, each with its own page: see the [component index](${markdownUrl(COMPONENTS_PATH)}).`,
    "",
  ].join("\n");
}

/** Attach the Markdown copy to every page the site builds. */
export function withMarkdown(
  pages: SitePage[],
  state: DocsState,
  posts: readonly ContentItem[],
): SitePage[] {
  const contentBySlug = new Map(posts.map((post) => [post.slug, post]));
  return pages.map((page) => {
    const markdown = markdownFor(page.path, state, contentBySlug);
    return markdown === undefined ? page : { ...page, markdown };
  });
}

function markdownFor(
  path: string,
  state: DocsState,
  contentBySlug: Map<string, ContentItem>,
): string | undefined {
  if (path === "") return homeMarkdown(state);
  if (path === COMPONENTS_PATH) return componentsIndexMarkdown(state);
  const entry = state.packages.find((candidate) => candidate.path === path);
  if (entry) return packageMarkdown(entry, contentBySlug.get(path));
  const component = state.catalog.components.find((candidate) => candidate.path === path);
  if (component) return componentMarkdown(component, state);
  const example = state.catalog.examples.find((candidate) => candidate.path === path);
  return example ? compositionMarkdown(example, state) : undefined;
}
