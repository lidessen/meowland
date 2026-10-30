import { h, type Child } from "meowjsx";
import type { ThemeDefinition } from "meowcss";
import { Badge, Link, Page, PageHeader, Prose, Section, Stack } from "meowtail";
import * as meowtail from "meowtail";
import { Icon, IconSource } from "meowtail/icons";
import type { ContentItem, SitePage } from "meowpress/build";
import type { StoryEntry } from "meowbook";
import { kebabCase, type Catalog, type CatalogComponent, type CatalogExample } from "./catalog";
import { displayName } from "./families";
import { firstElementOf, renderSourceOf, type StorySource } from "./code";
import { groupIcon, packageIcon, PAGE_ICONS } from "./icons";
import type { DocsPackage } from "./packages";
import { splitSummary, type ComponentProps } from "./props";
import {
  CodeSample,
  InlineCodeNote,
  InstallLine,
  Note,
  PartList,
  PropsTable,
  Preview,
  StoryExample,
} from "./parts";
import { renderDocument, SITE_DESCRIPTION, SITE_NAME, type TrailItem } from "./document";

/** Everything the page builders need that is not part of the Meowpress context. */
export interface DocsState {
  catalog: Catalog;
  packages: DocsPackage[];
  sources: Map<string, StorySource>;
  /** The props each component declares, by component name. */
  props?: Map<string, ComponentProps>;
}

/** The index of every component page. */
const COMPONENTS_PATH = "components";

/** The package that owns the component library. */
export const COMPONENT_PACKAGE = "meowtail";

/**
 * The docs reading column stays a host decision: `.docs-article` constrains the
 * article width, so the page fills that article instead of adding a second
 * width constraint on top of it.
 */
const PAGE_WIDTH = "full" as const;

/** The groups whose stories are composed scenes rather than a single control. */
const TALL_GROUPS = new Set([
  "Assistant",
  "Composition examples",
  "Content",
  "Conversation components",
]);

/** The story titles that describe a full board rather than one control. */
const TALL_TITLES = ["complete", "matrix", "panorama"];

/**
 * Whether a story needs the taller preview frame. The frame has a fixed height,
 * so a composed scene needs more room than a single control.
 */
export function isTallStory(story: StoryEntry): boolean {
  if (story.group && TALL_GROUPS.has(story.group)) return true;
  const label = `${story.id} ${story.title}`.toLowerCase();
  return TALL_TITLES.some((marker) => label.includes(marker));
}

/** The label of a story, without the component prefix the story title carries. */
export function storyLabel(story: StoryEntry): string {
  const separator = story.title.indexOf("·");
  if (separator < 0) return story.title;
  const label = story.title.slice(separator + 1).trim();
  return label.length > 0 ? label : story.title;
}

function sourceFor(
  state: DocsState,
  story: StoryEntry,
): { source?: string; file?: string; line?: number } {
  const source = state.sources.get(story.id);
  if (!source) return {};
  // Show what draws the example; the story's id, title and coverage notes stay in its file.
  if (source.render)
    return {
      source: source.render.code,
      file: source.file,
      line: source.render.line,
    };
  const render = renderSourceOf(source.code);
  if (!render) return { source: source.code, file: source.file, line: source.line };
  return {
    source: render.code,
    file: source.file,
    line: source.line + render.lineOffset,
  };
}

/** The trail that says where the reader is. */
function trailFor(path: string, state: DocsState): TrailItem[] {
  if (path === "") return [{ label: "Overview" }];
  if (path.startsWith("packages/")) {
    const entry = state.packages.find((candidate) => candidate.path === path);
    return [{ label: "Packages", href: "/#packages" }, { label: entry?.title ?? "Package" }];
  }
  if (path === COMPONENTS_PATH) return [{ label: "Components" }];
  if (path.startsWith("components/")) {
    const component = state.catalog.components.find((candidate) => candidate.path === path);
    return [
      { label: "Components", href: `/${COMPONENTS_PATH}/` },
      ...(component
        ? [{ label: component.group, href: `/${COMPONENTS_PATH}/#${kebabCase(component.group)}` }]
        : []),
      { label: component ? displayName(component.title) : "Component" },
    ];
  }
  const example = state.catalog.examples.find((candidate) => candidate.path === path);
  return [{ label: example?.group ?? "Example" }, { label: example?.name ?? "Example" }];
}

interface ReadingSection {
  id: string;
  title: string;
  description?: string;
  children: Child;
}

/** The same sections supply both the reading column and its static table of contents. */
function ReadingSections({ sections }: { sections: ReadingSection[] }): Child {
  const links = () => (
    <nav aria-label="On this page">
      {sections.map((section) => (
        <a href={`#${section.id}`}>{section.title}</a>
      ))}
    </nav>
  );
  return (
    <div className="docs-reading-layout">
      <aside className="docs-toc">
        <div className="docs-toc-desktop">
          <p className="docs-toc-title">On this page</p>
          {links()}
        </div>
        <details className="docs-toc-disclosure">
          <summary>
            On this page
            <Icon name="chevron-down" size={14} />
          </summary>
          {links()}
        </details>
      </aside>
      <div className="docs-sections">
        {sections.map(({ children, ...section }) => (
          <Section {...section}>{children}</Section>
        ))}
      </div>
    </div>
  );
}

function HomePage({ state }: { state: DocsState }): Child {
  const componentCount = state.catalog.components.length;
  return (
    <Page
      className="docs-home-page"
      header={
        <div className="docs-home-hero">
          <div className="docs-home-intro">
            <p className="docs-home-eyebrow">{SITE_NAME}</p>
            <PageHeader
              title="Build interfaces with Meowland"
              description="Build interfaces with a signal-driven runtime, a shared style system and components that fit together."
            />
            <div className="docs-home-actions">
              <Link className="docs-home-primary" href="/packages/meowtail/">
                Start with Meowtail
              </Link>
              <Link href="/packages/meowtail/#components">Browse components</Link>
            </div>
          </div>
          <aside className="docs-home-route" aria-label="Start building">
            <p className="docs-home-route-label">Start building</p>
            <h2>From a component to your interface</h2>
            <InstallLine name={COMPONENT_PACKAGE} />
            <ol>
              <li>
                <a href="/packages/meowtail/">
                  <span className="docs-route-step">01</span>
                  <span>
                    <strong>Set up Meowtail</strong>
                    <span>Install the library and connect its theme.</span>
                  </span>
                </a>
              </li>
              <li>
                <a href="/components/button/">
                  <span className="docs-route-step">02</span>
                  <span>
                    <strong>Explore a component</strong>
                    <span>See its live preview, source and API.</span>
                  </span>
                </a>
              </li>
              <li>
                <a href="/gallery/">
                  <span className="docs-route-step">03</span>
                  <span>
                    <strong>Open the playground</strong>
                    <span>Try the stories and composed interfaces.</span>
                  </span>
                </a>
              </li>
            </ol>
          </aside>
        </div>
      }
      width={PAGE_WIDTH}
    >
      <Section
        id="packages"
        title="Six packages"
        description="Start with the component library, or use the pieces your project needs."
      >
        <div className="docs-package-grid">
          {state.packages.map((entry) => (
            <a className="docs-package-link" href={`/${entry.path}/`}>
              <span className="docs-package-icon">
                <IconSource source={packageIcon(entry.title)} size={18} />
              </span>
              <div>
                <strong>{entry.title}</strong>
                <p>{entry.summary}</p>
                <span className="docs-package-version">
                  {entry.version === "unpublished" ? "Unpublished" : `Source v${entry.version}`}
                </span>
              </div>
            </a>
          ))}
        </div>
      </Section>
      <Section
        id="components"
        title="Components"
        description={`${componentCount} components. Each one lists its style axes and DOM parts; the ones the stories cover also show a live example and the code behind it.`}
      >
        {/* The two ways into the components, laid out like the packages above them. */}
        <div className="docs-package-grid">
          <a className="docs-package-link" href="/components/">
            <span className="docs-package-icon">
              <IconSource source={PAGE_ICONS.components} size={18} />
            </span>
            <div>
              <strong>Component reference</strong>
              <p>
                One page per component: its live examples, the code behind them, its style axes and
                its DOM parts.
              </p>
              <span className="docs-package-version">/components/</span>
            </div>
          </a>
          <a className="docs-package-link" href="/gallery/">
            <span className="docs-package-icon">
              <IconSource source={PAGE_ICONS.gallery} size={18} />
            </span>
            <div>
              <strong>Component playground</strong>
              <p>
                Every story the components declare, in one list: try each one at any width, with
                annotations and checks.
              </p>
              <span className="docs-package-version">/gallery/</span>
            </div>
          </a>
        </div>
      </Section>
      <Section
        id="architecture"
        title="How the pieces fit"
        description="One rendering graph, one theme assembly, one set of component metadata."
      >
        <Prose measure="fill">
          <p>
            <code>meowjsx</code> renders a tree of nodes and lets a component bind a signal to an
            attribute, so a later change reaches the DOM without re-rendering the tree.
            <code> meowcss</code> compiles tokens and style fragments into one stylesheet, and a
            component declares its parts and style axes instead of carrying its own CSS.
            <code> meowtail</code> is the component library those two rules produce.
          </p>
          <p>
            <code>meowbook</code> turns the stories a package declares into a playground and a live
            canvas. <code>meowslides</code> is the presentation engine on top of the same
            components. <code>meowpress</code> is the site generator that writes this page.
          </p>
        </Prose>
      </Section>
    </Page>
  );
}

/** The one-line summary of a component, when the stories wrote one. */
function summaryFor(state: DocsState, path: string): string | undefined {
  return state.catalog.components.find((component) => component.path === path)?.summary;
}

/** The component index: names and one-line summaries in two columns, without per-row icons. */
function ComponentList({ state }: { state: DocsState }): Child {
  return (
    <Stack gap="relaxed">
      {state.catalog.navigation.map((group) => (
        <div className="docs-index" id={kebabCase(group.label)}>
          <h3 className="docs-example-title docs-index-title">
            <IconSource source={groupIcon(group.label)} size={16} className="docs-nav-group-icon" />
            {group.label}
          </h3>
          <ul className="docs-index-list">
            {group.entries.map((entry) => (
              <li>
                <a href={entry.href}>{entry.label}</a>
                <span>{summaryFor(state, entry.path) ?? ""}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Stack>
  );
}

/**
 * The import line of a public component and, when an example draws it in a few lines, that
 * first use as a snippet: the code a reader copies first.
 */
function usageFor(
  component: CatalogComponent,
  state: DocsState,
): { importLine: string; snippet?: string } | undefined {
  const importLine = importLineFor(component.title);
  if (!importLine) return undefined;
  const stories = component.stories.length > 0 ? component.stories : component.usedIn;
  for (const story of stories) {
    const { source } = sourceFor(state, story);
    const snippet = source ? firstElementOf(source, component.title) : undefined;
    if (snippet) return { importLine, snippet };
  }
  return { importLine };
}

/** What a component's JSDoc says after its first sentence: the component notes. */
function notesFor(props: ComponentProps | undefined): Child {
  const rest = props?.summary ? splitSummary(props.summary).rest : undefined;
  return rest ? <InlineCodeNote text={rest} /> : null;
}

/** The line that imports a component, when its name is a public export of the package. */
function importLineFor(name: string): string | undefined {
  return /^[A-Z][A-Za-z0-9]*$/.test(name) && name in meowtail
    ? `import { ${name} } from "${COMPONENT_PACKAGE}";`
    : undefined;
}

function PackagePage({
  entry,
  content,
  state,
}: {
  entry: DocsPackage;
  content?: ContentItem;
  state: DocsState;
}): Child {
  const sections: ReadingSection[] = [
    {
      id: "installation",
      title: "Installation",
      children: (
        <Stack gap="compact">
          <InstallLine name={entry.name} />
          <Note>
            This guide follows the workspace source. The version badge comes from its package
            manifest; local candidates may include APIs absent from npm. Check the repository's{" "}
            <a href="https://github.com/lidessen/meowland#release-status">release status</a> before
            choosing an install version.
          </Note>
        </Stack>
      ),
    },
  ];
  if (content) {
    sections.push({
      id: "overview",
      title: "Overview",
      children: <Prose measure="fill" dangerouslySetInnerHTML={{ __html: content.html }} />,
    });
  }
  if (entry.name === COMPONENT_PACKAGE) {
    sections.push({
      id: "components",
      title: "Components",
      description:
        "Every component the library publishes, with its live example and its style axes.",
      children: <ComponentList state={state} />,
    });
  }
  if (entry.name === "meowbook" || entry.name === "meowslides") {
    const slides = entry.name === "meowslides";
    sections.push({
      id: "playground",
      title: slides ? "Presentation playground" : "Playground",
      children: (
        <Stack gap="compact">
          <Link href={slides ? "/gallery/slides/" : "/gallery/"}>
            {slides ? "Open the presentation playground" : "Open the component playground"}
          </Link>
          <Note>
            {slides
              ? "The presentation playground runs the stories the slides package declares, in the presentation theme."
              : "The playground lists every story the library declares, in the groups the stories themselves declare."}
          </Note>
        </Stack>
      ),
    });
  }
  return (
    <Page
      className="docs-reference-page"
      eyebrow="Package guide"
      title={entry.title}
      description={entry.summary}
      actions={
        <Badge tone="outline" size="small">
          {entry.version === "unpublished" ? "Unpublished" : `Source v${entry.version}`}
        </Badge>
      }
      width={PAGE_WIDTH}
    >
      <ReadingSections sections={sections} />
    </Page>
  );
}

function ComponentPage({
  component,
  state,
}: {
  component: CatalogComponent;
  state: DocsState;
}): Child {
  const borrowed = component.stories.length === 0;
  const [primary, ...rest] = borrowed ? component.usedIn : component.stories;
  const sections: ReadingSection[] = [];
  if (primary) {
    sections.push({
      id: "preview",
      title: "Preview",
      description: borrowed
        ? `${displayName(component.title)} has no story of its own; this one draws it as part of ${primary.component ? displayName(primary.component) : "a composed scene"}.`
        : undefined,
      children: (
        <StoryExample
          storyId={primary.id}
          title={storyLabel(primary)}
          description={component.summary === primary.description ? undefined : primary.description}
          tall={isTallStory(primary)}
          {...sourceFor(state, primary)}
        />
      ),
    });
  }
  sections.push({
    id: "installation",
    title: "Installation",
    children: <InstallLine name={COMPONENT_PACKAGE} />,
  });
  const usage = usageFor(component, state);
  if (usage) {
    sections.push({
      id: "usage",
      title: "Usage",
      description: usage.snippet ? "Taken from the examples on this page." : undefined,
      children: (
        <CodeSample
          source={usage.snippet ? `${usage.importLine}\n\n${usage.snippet}` : usage.importLine}
          file={usage.snippet ? "usage.tsx" : "usage.ts"}
        />
      ),
    });
  }
  if (rest.length > 0) {
    sections.push({
      id: "examples",
      title: "Examples",
      description: borrowed
        ? `Other stories that draw ${displayName(component.title)}.`
        : "The other stories that show this component.",
      children: (
        <Stack gap="relaxed">
          {rest.map((story) => (
            <StoryExample
              storyId={story.id}
              title={storyLabel(story)}
              description={story.description}
              tall={isTallStory(story)}
              {...sourceFor(state, story)}
            />
          ))}
        </Stack>
      ),
    });
  }
  sections.push({
    id: "api-reference",
    title: "API reference",
    children: (
      <Stack gap="relaxed">
        {notesFor(state.props?.get(component.title))}
        <div>
          <h3 className="docs-example-title">Props</h3>
          <PropsTable style={component.meta?.style} props={state.props?.get(component.title)} />
        </div>
        <div>
          <h3 className="docs-example-title">DOM parts</h3>
          <PartList meta={component.meta} />
        </div>
        <div>
          <h3 className="docs-example-title">Registry</h3>
          {component.meta ? (
            <Note>
              The component's static <code>meta</code> declares the name{" "}
              <code>{component.meta.name}</code>. Register its function with{" "}
              <code>createMeowUI({"{ components: [...] }"})</code> on the runtime that renders it.
            </Note>
          ) : (
            <Note>
              This component has no registry metadata. It is a story that shows several components
              together.
            </Note>
          )}
        </div>
      </Stack>
    ),
  });
  return (
    <Page
      className="docs-reference-page"
      eyebrow="Component reference"
      title={displayName(component.title)}
      description={
        component.summary ??
        (primary
          ? "Shown below inside the stories that use it. Its props and DOM parts follow."
          : "No story covers this component yet. Its props and DOM parts are listed below.")
      }
      width={PAGE_WIDTH}
    >
      <ReadingSections sections={sections} />
    </Page>
  );
}

function ExamplePage({ example, state }: { example: CatalogExample; state: DocsState }): Child {
  const { source, file, line } = sourceFor(state, example.story);
  return (
    <Page
      className="docs-reference-page"
      eyebrow="Composition example"
      title={example.name}
      description={example.story.description}
      width={PAGE_WIDTH}
    >
      <ReadingSections
        sections={[
          {
            id: "preview",
            title: "Preview",
            description: example.name === example.title ? undefined : storyLabel(example.story),
            // The same framed specimen as a component page; the frame grows to fit the story.
            children: (
              <div className="docs-specimen">
                <Preview storyId={example.story.id} title={example.title} />
              </div>
            ),
          },
          {
            id: "code",
            title: "Code",
            children: source ? (
              <CodeSample source={source} file={file} line={line} />
            ) : (
              <Note>The source of this story is not available.</Note>
            ),
          },
        ]}
      />
    </Page>
  );
}

const COMPONENTS_SUMMARY =
  "Every component the library publishes, grouped by what it is for. Each page has a live preview, its usage and its props.";

/** The components index: every group with its components and one line on each. */
function ComponentsPage({ state }: { state: DocsState }): Child {
  return (
    <Page
      className="docs-reference-page"
      title="Components"
      description={COMPONENTS_SUMMARY}
      width={PAGE_WIDTH}
    >
      <ComponentList state={state} />
    </Page>
  );
}

/** The body of one page. */
export function renderPageBody(
  path: string,
  state: DocsState,
  contentBySlug: Map<string, ContentItem>,
): Child {
  if (path === "") return <HomePage state={state} />;
  if (path === COMPONENTS_PATH) return <ComponentsPage state={state} />;
  if (path.startsWith("packages/")) {
    const name = path.slice("packages/".length);
    const entry = state.packages.find((candidate) => candidate.path === path);
    if (!entry) return <Note>Unknown package.</Note>;
    return (
      <PackagePage entry={entry} content={contentBySlug.get(`packages/${name}`)} state={state} />
    );
  }
  if (path.startsWith("components/")) {
    const component = state.catalog.components.find((candidate) => candidate.path === path);
    if (!component) return <Note>Unknown component.</Note>;
    return <ComponentPage component={component} state={state} />;
  }
  const example = state.catalog.examples.find((candidate) => candidate.path === path);
  if (example) return <ExamplePage example={example} state={state} />;
  return <Note>Unknown page.</Note>;
}

/** Build every page the site publishes. */
export function buildPages(
  state: DocsState,
  posts: readonly ContentItem[],
  theme: ThemeDefinition,
): SitePage[] {
  const contentBySlug = new Map(posts.map((post) => [post.slug, post]));
  const pages: SitePage[] = [];

  // The agent indexes list a component by its export name; the page itself reads it with spaces.
  const add = (
    path: string,
    title: string,
    description: string,
    group: string,
    order: number,
    pageTitle = title,
  ) => {
    pages.push({
      path,
      title,
      description,
      group,
      order,
      html: renderDocument({
        theme,
        catalog: state.catalog,
        packages: state.packages,
        path,
        title: pageTitle,
        description,
        trail: trailFor(path, state),
        children: renderPageBody(path, state, contentBySlug),
      }),
    });
  };

  add("", SITE_NAME, SITE_DESCRIPTION, "Overview", 0);
  add(COMPONENTS_PATH, "Components", COMPONENTS_SUMMARY, "Overview", 5);
  for (const entry of state.packages) {
    add(entry.path, entry.title, entry.summary, "Packages", 10);
  }
  // In sidebar order, so the indexes list each family together.
  const byPath = new Map(state.catalog.components.map((component) => [component.path, component]));
  const ordered = state.catalog.navigation.flatMap((group) =>
    group.entries.flatMap((entry) => byPath.get(entry.path) ?? []),
  );
  for (const component of ordered) {
    add(
      component.path,
      component.title,
      component.summary ?? "",
      component.group,
      20,
      displayName(component.title),
    );
  }
  for (const example of state.catalog.examples) {
    add(example.path, example.name, example.story.description ?? "", example.group, 30);
  }
  return pages;
}
