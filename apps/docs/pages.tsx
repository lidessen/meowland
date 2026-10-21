import { h, type Child } from "meowjsx";
import type { ThemeDefinition } from "meowcss";
import { Badge, Inline, Link, Page, ResourceCard, ResourceLink, Section, Stack } from "meowtail";
import type { ContentItem, SitePage } from "meowpress/build";
import type { StoryEntry } from "meowbook";
import type { Catalog, CatalogComponent, CatalogExample } from "./catalog";
import type { StorySource } from "./code";
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
  return { source: source.code, file: source.file, line: source.line };
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

function PackageCard({ entry }: { entry: DocsPackage }): Child {
  return (
    <ResourceCard
      title={
        <a className="docs-card-link" href={`/${entry.path}/`}>
          {entry.title}
        </a>
      }
      subtitle={<code>bun add {entry.name}</code>}
      description={entry.summary}
      identity={`v${entry.version}`}
    />
  );
}

function HomePage({ state }: { state: DocsState }): Child {
  const componentCount = state.catalog.components.length;
  return (
    <Page
      eyebrow={SITE_NAME}
      title="A small UI capability library"
      description={SITE_DESCRIPTION}
      width={PAGE_WIDTH}
    >
      <Section
        title="Packages"
        description="Six published packages. Each one is useful on its own and they are built to be used together."
      >
        <div className="docs-grid">
          {state.packages.map((entry) => (
            <PackageCard entry={entry} />
          ))}
        </div>
      </Section>
      <Section
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
        title="How the pieces fit"
        description="One rendering graph, one theme assembly, one set of contracts."
      >
        <div className="docs-prose">
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
        </div>
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
  return (
    <Page title={entry.title} description={entry.summary} width={PAGE_WIDTH}>
      <Inline gap="compact" wrap>
        <Badge tone="outline" size="small">
          v{entry.version}
        </Badge>
        <Badge tone="quiet" size="small">
          {entry.name}
        </Badge>
      </Inline>
      <Section title="Install">
        <InstallLine name={entry.name} />
      </Section>
      {content ? (
        <Section title="Overview">
          <div className="docs-prose" dangerouslySetInnerHTML={{ __html: content.html }} />
        </Section>
      ) : null}
      {entry.name === COMPONENT_PACKAGE ? (
        <Section
          title="Components"
          description="Every component the library publishes, with its live example and its style axes."
        >
          <ComponentList state={state} />
        </Section>
      ) : null}
      {entry.name === "meowbook" ? (
        <Section title="Workbench">
          <Stack gap="compact">
            <Inline gap="compact" wrap>
              <Link href="/gallery/">Open the component workbench</Link>
            </Inline>
            <Note>
              The workbench lists every story the library declares, grouped the way the component
              reference groups them.
            </Note>
          </Stack>
        </Section>
      ) : null}
      {entry.name === "meowslides" ? (
        <Section title="Presentation workbench">
          <Stack gap="compact">
            <Inline gap="compact" wrap>
              <Link href="/gallery/slides/">Open the presentation workbench</Link>
            </Inline>
            <Note>
              The presentation workbench runs the stories the slides package declares, in the
              presentation theme.
            </Note>
          </Stack>
        </Section>
      ) : null}
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
  return (
    <Page
      title={component.title}
      description={
        component.summary ??
        "No story covers this component yet. Its contract, style axes and DOM parts are listed below."
      }
      width={PAGE_WIDTH}
    >
      {primary ? (
        <Section title="Preview" description="The first story that shows this component.">
          <StoryExample
            storyId={primary.id}
            title={storyLabel(primary)}
            description={
              component.summary === primary.description ? undefined : primary.description
            }
            tall={isTallStory(primary)}
            {...sourceFor(state, primary)}
          />
        </Section>
      ) : null}
      <Section title="Install">
        <InstallLine name={COMPONENT_PACKAGE} />
      </Section>
      {rest.length > 0 ? (
        <Section title="Examples" description="The other stories that show this component.">
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
        </Section>
      ) : null}
      <Section
        title="API reference"
        description="The style axes and the DOM parts of this component."
      >
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
                The component is registered as <code>{component.contract.name}</code> in the
                meowtail component registry.
              </Note>
            ) : (
              <Note>
                This component has no registry contract. It is a story that shows several components
                together.
              </Note>
            )}
          </div>
        </Stack>
      </Section>
    </Page>
  );
}

function ExamplePage({ example, state }: { example: CatalogExample; state: DocsState }): Child {
  const { source, file, line } = sourceFor(state, example.story);
  return (
    <Page title={example.title} description={example.story.description} width={PAGE_WIDTH}>
      <Section title="Preview">
        <Preview storyId={example.story.id} title={example.title} tall />
      </Section>
      <Section title="Code">
        {source ? (
          <CodeSample source={source} file={file} line={line} />
        ) : (
          <Note>The source of this story is not available.</Note>
        )}
      </Section>
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
