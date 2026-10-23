import { h, type Child } from "meowjsx";
import type { ThemeDefinition } from "meowcss";
import {
  Badge,
  Inline,
  Link,
  Page,
  PageHeader,
  Prose,
  ResourceLink,
  Section,
  Stack,
} from "meowtail";
import { Icon } from "meowtail/icons";
import type { ContentItem, SitePage } from "meowpress/build";
import type { StoryEntry } from "meowbook";
import type { Catalog, CatalogComponent, CatalogExample } from "./catalog";
import { renderSourceOf, type StorySource } from "./code";
import type { DocsPackage } from "./packages";
import {
  CodeSample,
  InstallLine,
  Note,
  PartList,
  Preview,
  StoryExample,
  StyleAxesTable,
} from "./parts";
import { renderDocument, SITE_DESCRIPTION, SITE_NAME, type TrailItem } from "./document";

/** Everything the page builders need that is not part of the Meowpress context. */
export interface DocsState {
  catalog: Catalog;
  packages: DocsPackage[];
  sources: Map<string, StorySource>;
}

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
  const render = renderSourceOf(source.code);
  if (!render) return { source: source.code, file: source.file, line: source.line };
  return { source: render.code, file: source.file, line: source.line + render.lineOffset };
}

/** The trail that says where the reader is. */
function trailFor(path: string, state: DocsState): TrailItem[] {
  if (path === "") return [{ label: "Overview" }];
  if (path.startsWith("packages/")) {
    const entry = state.packages.find((candidate) => candidate.path === path);
    return [{ label: "Package" }, { label: entry?.title ?? "Package" }];
  }
  if (path.startsWith("components/")) {
    const component = state.catalog.components.find((candidate) => candidate.path === path);
    return [{ label: component?.group ?? "Component" }, { label: component?.title ?? "Component" }];
  }
  const example = state.catalog.examples.find((candidate) => candidate.path === path);
  return [{ label: example?.group ?? "Example" }, { label: example?.title ?? "Example" }];
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
                    <strong>Open the workbench</strong>
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
          {state.packages.map((entry, index) => (
            <a className="docs-package-link" href={`/${entry.path}/`}>
              <span className="docs-package-number">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <strong>{entry.title}</strong>
                <p>{entry.summary}</p>
                <span className="docs-package-version">
                  {entry.version === "unpublished" ? "Unpublished" : `v${entry.version}`}
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
        <Stack gap="compact">
          <Inline gap="compact" wrap>
            <Link href="/components/button/">Browse the component reference</Link>
            <Link href="/gallery/">Open the component workbench</Link>
          </Inline>
          <Note>
            The workbench is the same gallery the library ships: every story the components declare,
            in one list.
          </Note>
        </Stack>
      </Section>
      <Section
        id="architecture"
        title="How the pieces fit"
        description="One rendering graph, one theme assembly, one set of contracts."
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
            <code>meowbook</code> turns the stories a package declares into a workbench and a live
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

function ComponentList({ state }: { state: DocsState }): Child {
  return (
    <Stack gap="relaxed">
      {state.catalog.navigation.map((group) => (
        <div className="docs-list">
          <h3 className="docs-example-title">{group.label}</h3>
          {group.entries.map((entry) => (
            <ResourceLink
              href={entry.href}
              title={entry.label}
              detail={summaryFor(state, entry.path)}
            />
          ))}
        </div>
      ))}
    </Stack>
  );
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
    { id: "install", title: "Install", children: <InstallLine name={entry.name} /> },
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
      id: "workbench",
      title: slides ? "Presentation workbench" : "Workbench",
      children: (
        <Stack gap="compact">
          <Link href={slides ? "/gallery/slides/" : "/gallery/"}>
            {slides ? "Open the presentation workbench" : "Open the component workbench"}
          </Link>
          <Note>
            {slides
              ? "The presentation workbench runs the stories the slides package declares, in the presentation theme."
              : "The workbench lists every story the library declares, grouped the way the component reference groups them."}
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
          {entry.version === "unpublished" ? "Unpublished" : `v${entry.version}`}
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
  const [primary, ...rest] = component.stories;
  const sections: ReadingSection[] = [];
  if (primary) {
    sections.push({
      id: "preview",
      title: "Preview",
      description: "The first story that shows this component.",
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
    id: "install",
    title: "Install",
    children: <InstallLine name={COMPONENT_PACKAGE} />,
  });
  if (rest.length > 0) {
    sections.push({
      id: "examples",
      title: "Examples",
      description: "The other stories that show this component.",
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
    description: "The style axes and the DOM parts of this component.",
    children: (
      <Stack gap="relaxed">
        <div>
          <h3 className="docs-example-title">Style axes</h3>
          <StyleAxesTable contract={component.contract} />
        </div>
        <div>
          <h3 className="docs-example-title">DOM parts</h3>
          <PartList contract={component.contract} />
        </div>
        <div>
          <h3 className="docs-example-title">Registry</h3>
          {component.contract ? (
            <Note>
              The component is registered as <code>{component.contract.name}</code> in the meowtail
              component registry.
            </Note>
          ) : (
            <Note>
              This component has no registry contract. It is a story that shows several components
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
      title={component.title}
      description={
        component.summary ??
        "No story covers this component yet. Its contract, style axes and DOM parts are listed below."
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
      title={example.title}
      description={example.story.description}
      width={PAGE_WIDTH}
    >
      <ReadingSections
        sections={[
          {
            id: "preview",
            title: "Preview",
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

/** The body of one page. */
export function renderPageBody(
  path: string,
  state: DocsState,
  contentBySlug: Map<string, ContentItem>,
): Child {
  if (path === "") return <HomePage state={state} />;
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

  const add = (path: string, title: string, description: string, group: string, order: number) => {
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
        title,
        description,
        trail: trailFor(path, state),
        children: renderPageBody(path, state, contentBySlug),
      }),
    });
  };

  add("", SITE_NAME, SITE_DESCRIPTION, "Overview", 0);
  for (const entry of state.packages) {
    add(entry.path, entry.title, entry.summary, "Packages", 10);
  }
  for (const component of state.catalog.components) {
    add(component.path, component.title, component.summary ?? "", component.group, 20);
  }
  for (const example of state.catalog.examples) {
    add(example.path, example.title, example.story.description ?? "", example.group, 30);
  }
  return pages;
}
