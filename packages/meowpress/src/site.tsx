import { themeAttributes, type ThemeDefinition } from "meowcss";
import { createRuntime, Fragment, h, type Child } from "meowjsx";
import { renderToHtmlWithRuntime } from "meowjsx/web";
import {
  Button,
  Container,
  Entry,
  EntryList,
  Inline,
  MetaRow,
  Page,
  PageHeader,
  Prose,
  Section,
  Tag,
  Text,
  createMeowUI,
} from "meowtail";
import { GithubIcon, Icon } from "meowtail/icons";
import { blogTheme } from "./theme";
import { withoutLeadingHeading, type ContentItem } from "./content";
import { DEFAULT_SITE, type SiteIdentity, type SiteNotFound } from "./identity";
import { sitePageAgentUrl, type SitePage } from "./pages";
import type { Skill, SkillFile } from "./skills";
import { layoutSkillGraph, type SkillGraphNode } from "./skill-graph";

interface DocumentProps {
  theme: ThemeDefinition;
  site: SiteIdentity;
  title: string;
  description?: string;
  activePath?: string;
  styleHref: string;
  baseHref?: string;
  wide?: boolean;
  children: Child;
}

/** The name of the theme stylesheet the package writes by default. */
export const DEFAULT_THEME_STYLESHEET = "blog-theme.css";

function styleHref(depth: number, stylesheet: string): string {
  return `${"../".repeat(depth)}${stylesheet}`;
}

function slugDepth(slug: string): number {
  return slug.split("/").filter(Boolean).length;
}

function SiteHeader({ activePath, site }: { activePath?: string; site: SiteIdentity }): Child {
  const links = [
    ["/posts/", "Posts"],
    ["/thoughts/", "Thoughts"],
    ["/skills/", "Skills"],
    ["/about/", "About"],
  ] as const;
  return (
    <header className="site-header">
      <a className="site-name" href="/">
        {site.name}
      </a>
      <nav className="site-nav" aria-label="Primary navigation">
        {links.map(([href, label]) => (
          <a href={href} aria-current={activePath === href ? "page" : undefined}>
            {label}
          </a>
        ))}
      </nav>
    </header>
  );
}

function SiteFooter({ site }: { site: SiteIdentity }): Child {
  return (
    <footer className="site-footer">
      <Text variant="caption">
        © {new Date().getFullYear()} {site.name}
      </Text>
      <Inline gap="compact">
        <a href="/llm.txt">llm.txt</a>
        <a href="/agents.md">agents.md</a>
      </Inline>
    </footer>
  );
}

function Document({
  title,
  description,
  activePath,
  styleHref,
  baseHref,
  wide,
  children,
  theme,
  site,
}: DocumentProps): Child {
  return (
    <html lang="en" data-meowui-page="" {...themeAttributes(theme)}>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={description ?? site.description} />
        {baseHref ? <base href={baseHref} /> : null}
        <link rel="stylesheet" href={styleHref} />
        <title>{title === site.name ? site.name : `${title} · ${site.name}`}</title>
      </head>
      <body data-site={site.id}>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <div className="site-shell">
          <Container width={wide ? "wide" : "content"}>
            <SiteHeader activePath={activePath} site={site} />
            <main id="main-content" tabIndex={-1}>
              {children}
            </main>
            <SiteFooter site={site} />
          </Container>
        </div>
      </body>
    </html>
  );
}

function pageHtml(props: DocumentProps): string {
  // Static rendering needs the same part/option adapter as a browser mount. No hydration is needed.
  const runtime = createRuntime({
    plugins: [
      createMeowUI({
        components: [
          Button,
          Container,
          Entry,
          EntryList,
          Inline,
          MetaRow,
          Page,
          PageHeader,
          Prose,
          Section,
          Tag,
          Text,
        ],
      }),
    ],
  });
  return `<!doctype html>\n${renderToHtmlWithRuntime(runtime, <Document {...props} />)}`;
}

function dateLabel(dateKey: string): { date: string; weekday: string } {
  const date = new Date(`${dateKey}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return { date: "Undated", weekday: "" };
  return {
    date: new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      month: "long",
      day: "numeric",
    }).format(date),
    weekday: `${date.getUTCFullYear()} ${new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "short" }).format(date)}`,
  };
}

function itemUrl(item: ContentItem): string {
  return `/${item.kind}s/${item.slug}/`;
}

function Tags({ item }: { item: ContentItem }): Child {
  return item.tags.length ? (
    <Inline gap="compact">
      {item.tags.map((tag) => (
        <Tag>{tag}</Tag>
      ))}
    </Inline>
  ) : null;
}

function ThoughtCard({ item, linked = false }: { item: ContentItem; linked?: boolean }): Child {
  return (
    <Entry
      className="thought"
      data-kind="thought"
      title={item.title}
      href={linked ? itemUrl(item) : undefined}
      eyebrow={`${item.timeLabel || item.dateKey} · Thought`}
    >
      <Prose dangerouslySetInnerHTML={{ __html: withoutLeadingHeading(item.html) }} />
      <Tags item={item} />
    </Entry>
  );
}

function PostCard({ item }: { item: ContentItem }): Child {
  const category = typeof item.metadata.category === "string" ? item.metadata.category : "Post";
  return (
    <Entry
      size="feature"
      data-kind="post"
      title={item.title}
      href={itemUrl(item)}
      eyebrow={category}
      description={item.excerpt || "This post has no summary yet."}
      meta={
        <MetaRow
          items={[
            { label: item.dateKey },
            { label: `${item.readingMinutes} min read` },
            { label: `${item.characterCount} characters` },
          ]}
        />
      }
    >
      <Tags item={item} />
    </Entry>
  );
}

function groupByDate(items: ContentItem[]): Map<string, ContentItem[]> {
  const groups = new Map<string, ContentItem[]>();
  for (const item of items) {
    const current = groups.get(item.dateKey) ?? [];
    current.push(item);
    groups.set(item.dateKey, current);
  }
  return groups;
}

function Feed({ items, image }: { items: ContentItem[]; image?: string }): Child {
  return (
    <div className="feed">
      {items.length === 0 ? (
        <Text variant="secondary">No public content yet.</Text>
      ) : (
        [...groupByDate(items)].map(([dateKey, group]) => {
          const label = dateLabel(dateKey);
          return (
            <Section className="day" title={label.date} description={label.weekday}>
              <EntryList>
                {group.map((item) =>
                  item.kind === "thought" ? (
                    <ThoughtCard item={item} linked />
                  ) : (
                    <PostCard item={item} />
                  ),
                )}
              </EntryList>
            </Section>
          );
        })
      )}
      {image ? (
        <img className="feed-image" src={image} alt="" loading="lazy" decoding="async" />
      ) : null}
    </div>
  );
}

function Filter({ posts, thoughts }: { posts: number; thoughts: number }): Child {
  return (
    <Inline
      className="feed-filter"
      gap="compact"
      data-filter-group="feed"
      role="group"
      aria-label="Filter home feed"
    >
      {(
        [
          ["all", "All", posts + thoughts],
          ["post", "Posts", posts],
          ["thought", "Thoughts", thoughts],
        ] as const
      ).map(([value, label, count]) => (
        <Button variant="quiet" data-filter={value} aria-pressed={String(value === "all")}>
          {label} <span className="filter-count">{count}</span>
        </Button>
      ))}
    </Inline>
  );
}

const FILTER_SCRIPT = `(() => {
  const links = document.querySelectorAll('[data-filter-group="feed"] [data-filter]');
  const items = document.querySelectorAll('.feed [data-kind]');
  const days = document.querySelectorAll('.feed .day');
  links.forEach((link) => link.addEventListener('click', () => {
    const filter = link.dataset.filter;
    links.forEach((button) => button.setAttribute('aria-pressed', String(button === link)));
    items.forEach((item) => { item.hidden = filter !== 'all' && item.dataset.kind !== filter; });
    days.forEach((day) => { day.hidden = !Array.from(day.querySelectorAll('[data-kind]')).some((item) => !item.hidden); });
  }));
})();`;

export function homePage(
  items: ContentItem[],
  theme: ThemeDefinition = blogTheme,
  site: SiteIdentity = DEFAULT_SITE,
  stylesheet: string = DEFAULT_THEME_STYLESHEET,
): string {
  return pageHtml({
    site,
    theme,
    title: site.name,
    styleHref: styleHref(0, stylesheet),
    children: (
      <Page
        header={
          <div className="home-heading">
            <div className="home-heading-copy">
              <Text variant="eyebrow">Journal</Text>
              <PageHeader title={site.name} description={site.description} />
            </div>
            {site.images?.hero ? (
              <img className="hero-image" src={`./${site.images.hero}`} alt="" decoding="async" />
            ) : null}
          </div>
        }
        toolbar={
          <Filter
            posts={items.filter((item) => item.kind === "post").length}
            thoughts={items.filter((item) => item.kind === "thought").length}
          />
        }
      >
        <Feed items={items} image={site.images?.feed ? `./${site.images.feed}` : undefined} />
        <script dangerouslySetInnerHTML={{ __html: FILTER_SCRIPT }} />
      </Page>
    ),
  });
}

export function listPage(
  kind: "post" | "thought",
  items: ContentItem[],
  theme: ThemeDefinition = blogTheme,
  site: SiteIdentity = DEFAULT_SITE,
  stylesheet: string = DEFAULT_THEME_STYLESHEET,
): string {
  const isPost = kind === "post";
  const title = isPost ? "Posts" : "Thoughts";
  return pageHtml({
    site,
    theme,
    title,
    activePath: isPost ? "/posts/" : "/thoughts/",
    styleHref: styleHref(1, stylesheet),
    children: (
      <Page
        title={title}
        eyebrow="Archive"
        description={
          isPost
            ? "Complete arguments grown from fragments."
            : "Short, trimmed thoughts ready to show as they are."
        }
      >
        {items.length ? (
          <EntryList>
            {items.map((item) =>
              isPost ? <PostCard item={item} /> : <ThoughtCard item={item} linked />,
            )}
          </EntryList>
        ) : (
          <Text variant="secondary">No public content yet.</Text>
        )}
      </Page>
    ),
  });
}

export function notFoundPage(
  copy: SiteNotFound,
  theme: ThemeDefinition,
  site: SiteIdentity,
  stylesheet: string,
): string {
  const title = copy.title ?? "Page not found";
  const message = copy.message ?? "This page may have moved or been removed.";
  return pageHtml({
    site,
    theme,
    title,
    description: message,
    styleHref: styleHref(0, stylesheet),
    baseHref: "/",
    children: (
      <Page eyebrow="404" title={title} description={message}>
        <Prose>
          <a href="/">{copy.homeLabel ?? "Back to home"}</a>
        </Prose>
      </Page>
    ),
  });
}

function PostNavigation({ item, posts }: { item: ContentItem; posts: ContentItem[] }): Child {
  const index = posts.findIndex((post) => post.slug === item.slug);
  const older = index >= 0 ? posts[index + 1] : undefined;
  const newer = index > 0 ? posts[index - 1] : undefined;
  return (
    <nav className="post-nav" aria-label="Post navigation">
      {older ? (
        <Entry
          eyebrow={
            <span className="site-icon-label">
              <Icon name="chevron-left" size={14} /> Previous post (older)
            </span>
          }
          title={older.title}
          href={itemUrl(older)}
        />
      ) : (
        <span />
      )}
      {newer ? (
        <Entry
          eyebrow={
            <span className="site-icon-label">
              Next post (newer) <Icon name="chevron-right" size={14} />
            </span>
          }
          title={newer.title}
          href={itemUrl(newer)}
        />
      ) : (
        <Text variant="caption">Nothing newer — this is the latest post.</Text>
      )}
    </nav>
  );
}

function RelatedThoughts({
  item,
  thoughts,
}: {
  item: ContentItem;
  thoughts: ContentItem[];
}): Child {
  const related = thoughts.filter((thought) => thought.dateKey === item.dateKey).slice(0, 3);
  return related.length ? (
    <Section title="Thoughts from the same day">
      <EntryList>
        {related.map((thought) => (
          <ThoughtCard item={thought} linked />
        ))}
      </EntryList>
    </Section>
  ) : null;
}

export function postPage(
  item: ContentItem,
  posts: ContentItem[],
  thoughts: ContentItem[],
  theme: ThemeDefinition = blogTheme,
  site: SiteIdentity = DEFAULT_SITE,
  stylesheet: string = DEFAULT_THEME_STYLESHEET,
): string {
  const category = typeof item.metadata.category === "string" ? item.metadata.category : "Post";
  return pageHtml({
    site,
    theme,
    title: item.title,
    description: item.excerpt,
    activePath: "/posts/",
    styleHref: styleHref(1 + slugDepth(item.slug), stylesheet),
    children: (
      <Page title={item.title} eyebrow={category}>
        <MetaRow
          items={[
            { label: item.dateKey },
            { label: `${item.readingMinutes} min read` },
            { label: `${item.characterCount} characters` },
          ]}
        />
        <Prose
          as="article"
          dangerouslySetInnerHTML={{ __html: withoutLeadingHeading(item.html) }}
        />
        <Tags item={item} />
        <RelatedThoughts item={item} thoughts={thoughts} />
        <PostNavigation item={item} posts={posts} />
      </Page>
    ),
  });
}

export function thoughtPage(
  item: ContentItem,
  theme: ThemeDefinition = blogTheme,
  site: SiteIdentity = DEFAULT_SITE,
  stylesheet: string = DEFAULT_THEME_STYLESHEET,
): string {
  return pageHtml({
    site,
    theme,
    title: item.title,
    description: item.excerpt,
    activePath: "/thoughts/",
    styleHref: styleHref(1 + slugDepth(item.slug), stylesheet),
    children: (
      <Page title={item.title} eyebrow="Thought">
        <MetaRow
          items={[{ label: item.dateKey }, ...(item.timeLabel ? [{ label: item.timeLabel }] : [])]}
        />
        <Prose
          as="article"
          dangerouslySetInnerHTML={{ __html: withoutLeadingHeading(item.html) }}
        />
        <Tags item={item} />
      </Page>
    ),
  });
}

export function aboutPage(
  theme: ThemeDefinition = blogTheme,
  site: SiteIdentity = DEFAULT_SITE,
  stylesheet: string = DEFAULT_THEME_STYLESHEET,
): string {
  const about = site.about;
  return pageHtml({
    site,
    theme,
    title: "About",
    activePath: "/about/",
    styleHref: styleHref(1, stylesheet),
    children: (
      <Page eyebrow="About" title={about?.heading ?? site.name}>
        <div className="site-avatar" aria-hidden="true">
          {site.images?.about ? (
            <img src={`../${site.images.about}`} alt="" decoding="async" />
          ) : (
            <span className="avatar-initial">{Array.from(site.name.trim())[0] ?? "M"}</span>
          )}
        </div>
        {about ? (
          <Prose>
            {about.paragraphs.map((paragraph) => (
              <p>{paragraph}</p>
            ))}
          </Prose>
        ) : null}
        {about?.links?.length ? (
          <Section title={about.linksHeading ?? "Find me"}>
            <EntryList>
              {about.links.map((link) => (
                <Entry
                  title={
                    <a
                      className="site-icon-label"
                      href={link.href}
                      target="_blank"
                      rel="me noopener noreferrer"
                    >
                      {link.handle} <Icon name="arrow-up-right" size={16} />
                    </a>
                  }
                  eyebrow={link.label}
                />
              ))}
            </EntryList>
          </Section>
        ) : null}
      </Page>
    ),
  });
}

function skillUrl(skill: Skill): string {
  return skill.scope === "public" ? `/skills/${skill.slug}/` : `/skills/project/${skill.slug}/`;
}

function skillInstallCommand(site: SiteIdentity, skill: Skill): string {
  return site.skillsPackage
    ? `npx skills add ${site.skillsPackage} --skill ${skill.slug}`
    : skill.sourceBasePath;
}

function SkillCard({ skill, site }: { skill: Skill; site: SiteIdentity }): Child {
  return (
    <Entry
      href={skillUrl(skill)}
      title={skill.name}
      description={skill.description}
      eyebrow={skill.scope === "project" ? "Project Skill" : "Public Skill"}
      meta={
        <MetaRow
          items={[
            { label: `${skill.files.length} Markdown files` },
            { label: `${skill.relations.length} references` },
          ]}
        />
      }
    >
      <Text variant="caption">
        <code className="skill-command-text">
          {skill.scope === "public" ? skillInstallCommand(site, skill) : skill.sourceBasePath}
        </code>
      </Text>
    </Entry>
  );
}

interface SkillTreeNode {
  name: string;
  path?: string;
  children: SkillTreeNode[];
}

function skillTree(files: SkillFile[]): SkillTreeNode[] {
  const root: SkillTreeNode = { name: "", children: [] };
  for (const file of files) {
    let parent = root;
    const parts = file.path.split("/");
    for (const [index, part] of parts.entries()) {
      let node = parent.children.find((child) => child.name === part);
      if (!node) {
        node = { name: part, children: [] };
        parent.children.push(node);
      }
      if (index === parts.length - 1) node.path = file.path;
      parent = node;
    }
  }
  return root.children;
}

function SkillTreeNodes({
  nodes,
  activePath,
}: {
  nodes: SkillTreeNode[];
  activePath: string;
}): Child {
  return (
    <ul>
      {nodes.map((node) =>
        node.children.length > 0 ? (
          <li className="folder">
            <span>{node.name}/</span>
            <SkillTreeNodes nodes={node.children} activePath={activePath} />
          </li>
        ) : (
          <li className="file">
            <button
              type="button"
              className={node.path === activePath ? "active" : ""}
              data-skill-file={node.path}
              aria-pressed={node.path === activePath ? "true" : "false"}
            >
              {node.name}
            </button>
          </li>
        ),
      )}
    </ul>
  );
}

function SkillFileTree({ skill, activePath }: { skill: Skill; activePath: string }): Child {
  return (
    <nav className="skill-files" aria-label={`${skill.name} file tree`}>
      <span className="skill-files-label">Files</span>
      <SkillTreeNodes nodes={skillTree(skill.files)} activePath={activePath} />
    </nav>
  );
}

function SkillGraphNodeView({ node }: { node: SkillGraphNode }): Child {
  const width = node.width;
  const height = node.height;
  return (
    <a
      className={`skill-graph-node${node.external ? " external" : ""}${node.kind ? ` ${node.kind}` : ""}`}
      href={node.external ? "#relations" : `#${encodeURIComponent(node.path)}`}
      data-map-path={node.path}
      data-map-file={node.external ? undefined : node.path}
      data-map-detail={node.detail}
      aria-label={`${node.name}; ${node.role}`}
    >
      <rect x={node.x - width / 2} y={node.y - height / 2} width={width} height={height} rx="9" />
      <text className="skill-graph-node-name" x={node.x} y={node.y - 4}>
        {node.name}
      </text>
      <text className="skill-graph-node-role" x={node.x} y={node.y + 17}>
        {node.role}
      </text>
    </a>
  );
}

function SkillRelationGraph({ skill, direction }: { skill: Skill; direction: "LR" | "TB" }): Child {
  const graph = layoutSkillGraph(skill, direction);
  const markerId = `skill-arrow-${skill.slug}-${direction.toLowerCase()}`;
  return (
    <svg
      className={`skill-graph-svg skill-graph-${direction.toLowerCase()}`}
      viewBox={`0 0 ${graph.width} ${graph.height}`}
      width={graph.width}
      height={graph.height}
      aria-label={`${skill.name} file reference graph`}
    >
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path className="skill-graph-arrow" d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      {graph.edges.map((edge) => {
        const labelWidth = Math.max(34, edge.label.length * 13 + 12);
        return (
          <Fragment>
            <path
              className={`skill-graph-edge${edge.external ? " external" : ""}`}
              d={edge.path}
              marker-end={`url(#${markerId})`}
            />
            <g className="skill-graph-edge-label">
              <rect
                x={edge.labelX - labelWidth / 2}
                y={edge.labelY - 10}
                width={labelWidth}
                height="20"
                rx="4"
              />
              <text x={edge.labelX} y={edge.labelY + 4}>
                {edge.label}
              </text>
            </g>
          </Fragment>
        );
      })}
      {graph.nodes.map((node) => (
        <SkillGraphNodeView node={node} />
      ))}
    </svg>
  );
}

function SkillRelations({ skill }: { skill: Skill }): Child {
  const reachableFiles = skill.files.filter((file) => file.reachable).length;
  const unreferencedFiles = skill.files.filter((file) => !file.reachable);
  const missingNodes = skill.externalNodes.filter((node) => node.kind === "missing");
  const externalNodes = skill.externalNodes.filter((node) => node.kind === "external");
  const maxDepth = Math.max(0, ...skill.files.map((file) => file.depth ?? 0));
  const hasRelations = skill.relations.length > 0;
  const compactGraph = skill.files.length + skill.externalNodes.length <= 3;
  return (
    <section className="skill-relations" data-skill-view-panel="relations" hidden>
      <div className="skill-reading-summary" aria-label="Reading structure summary">
        <span>
          <strong>
            {reachableFiles}/{skill.files.length}
          </strong>
          reachable docs
        </span>
        <span>
          <strong>{skill.relations.length}</strong> references
        </span>
        <span>
          <strong>{maxDepth}</strong> max depth
        </span>
        <span className={missingNodes.length > 0 ? "has-issue" : ""}>
          <strong>{missingNodes.length}</strong> missing targets
        </span>
      </div>

      {hasRelations ? (
        <Fragment>
          <div
            className={`skill-graph-canvas${compactGraph ? " compact" : ""}`}
            tabIndex={0}
            role="region"
            aria-label="Scrollable file reference graph"
          >
            <SkillRelationGraph skill={skill} direction="LR" />
          </div>
          <section className="skill-reading-paths" aria-labelledby={`${skill.slug}-paths`}>
            <h3 id={`${skill.slug}-paths`}>Where references happen</h3>
            <ol>
              {skill.relations.map((relation) => {
                const sourceFile = skill.files.find((file) => file.path === relation.source);
                return (
                  <li className={sourceFile?.reachable ? "" : "unreachable"}>
                    <span className="skill-reading-edge">
                      <code title={relation.source}>{relation.source}</code>
                      <Icon name="arrow-right" size={14} />
                      <code title={relation.target}>{relation.target}</code>
                    </span>
                    <span className="skill-reading-context">
                      {relation.contexts.map((context) => (
                        <span>
                          {context.section}
                          {context.line ? ` · line ${context.line}` : ""}
                          {context.linkText !== relation.label ? ` · "${context.linkText}"` : ""}
                          {!sourceFile?.reachable ? " · entry unreachable" : ""}
                        </span>
                      ))}
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>
        </Fragment>
      ) : (
        <div className="skill-reading-empty">
          <strong>No cross-file reading paths</strong>
          <p>
            Once the Agent enters, it only reads <code>SKILL.md</code>. If other reference material
            must be read, link it explicitly from the relevant sections with Markdown links.
          </p>
        </div>
      )}

      {unreferencedFiles.length > 0 || missingNodes.length > 0 ? (
        <aside className="skill-reading-issues" aria-label="Information structure issues">
          <strong>Needs attention</strong>
          {unreferencedFiles.length > 0 ? (
            <p>
              Unreachable from the entry:
              {unreferencedFiles.map((file) => (
                <code>{file.path}</code>
              ))}
            </p>
          ) : null}
          {missingNodes.length > 0 ? (
            <p>
              Missing link targets:
              {missingNodes.map((node) => (
                <code>{node.path}</code>
              ))}
            </p>
          ) : null}
        </aside>
      ) : null}

      {hasRelations ? (
        <div className="skill-graph-status" data-map-status aria-live="polite">
          Select a node in the graph to see its role in the reading chain
          {externalNodes.length > 0
            ? `; ${externalNodes.length} targets outside the Skill currently`
            : ""}
          .
        </div>
      ) : null}
    </section>
  );
}

const SKILL_BROWSER_SCRIPT = `(() => {
  document.querySelectorAll('[data-skill-browser]').forEach((browser) => {
    const buttons = Array.from(browser.querySelectorAll('[data-skill-file]'));
    const panels = Array.from(browser.querySelectorAll('[data-skill-panel]'));
    const currentPath = browser.querySelector('[data-current-file]');
    const copyButton = browser.parentElement?.querySelector('[data-copy-command]');
    const viewButtons = Array.from(browser.querySelectorAll('[data-skill-view]'));
    const viewPanels = Array.from(browser.querySelectorAll('[data-skill-view-panel]'));
    const mapNodes = Array.from(browser.querySelectorAll('[data-map-path]'));
    const fileLinks = Array.from(browser.querySelectorAll('[data-skill-panel] a[href]'));
    const mapStatus = browser.querySelector('[data-map-status]');
    const updateMapStatus = (path, detail) => {
      if (!mapStatus) return;
      const code = document.createElement('code');
      code.textContent = path;
      mapStatus.replaceChildren(code, ' ' + (detail || ''));
    };
    const setView = (view) => {
      viewButtons.forEach((button) => {
        const active = button.dataset.skillView === view;
        button.setAttribute('aria-pressed', String(active));
      });
      viewPanels.forEach((panel) => {
        panel.hidden = panel.dataset.skillViewPanel !== view;
      });
    };
    const selectFile = (path, updateHash = true) => {
      if (!path || !panels.some((panel) => panel.dataset.skillPanel === path)) return;
      buttons.forEach((button) => {
        const active = button.dataset.skillFile === path;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      panels.forEach((panel) => {
        const active = panel.dataset.skillPanel === path;
        panel.hidden = !active;
        panel.classList.toggle('active', active);
      });
      mapNodes.forEach((node) => node.classList.toggle('active', node.dataset.mapPath === path));
      const selectedMapNode = mapNodes.find((node) => node.dataset.mapPath === path);
      if (selectedMapNode) updateMapStatus(path, selectedMapNode.dataset.mapDetail);
      if (currentPath) currentPath.textContent = path;
      if (updateHash) history.replaceState(null, '', '#' + encodeURIComponent(path));
    };
    buttons.forEach((button) => button.addEventListener('click', () => {
      selectFile(button.dataset.skillFile);
    }));
    viewButtons.forEach((button) => button.addEventListener('click', () => {
      setView(button.dataset.skillView);
    }));
    mapNodes.forEach((node) => node.addEventListener('click', (event) => {
      event.preventDefault();
      mapNodes.forEach((item) => item.classList.toggle('active', item.dataset.mapPath === node.dataset.mapPath));
      updateMapStatus(node.dataset.mapPath, node.dataset.mapDetail);
      if (node.dataset.mapFile) selectFile(node.dataset.mapFile);
    }));
    fileLinks.forEach((link) => link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      const source = link.closest('[data-skill-panel]')?.dataset.skillPanel;
      if (!href || !source || href.startsWith('#') || href.startsWith('/')) return;
      let target;
      try {
        const resolved = new URL(href, 'https://skill.local/' + source);
        if (resolved.origin !== 'https://skill.local') return;
        target = decodeURIComponent(resolved.pathname.slice(1));
      } catch {
        return;
      }
      if (!panels.some((panel) => panel.dataset.skillPanel === target)) return;
      event.preventDefault();
      setView('files');
      selectFile(target);
    }));
    const requested = location.hash ? decodeURIComponent(location.hash.slice(1)) : '';
    if (requested) {
      selectFile(requested, false);
      setView('files');
    } else if (window.matchMedia('(max-width: 560px)').matches) {
      setView('relations');
    }
    copyButton?.addEventListener('click', async () => {
      const command = copyButton.dataset.copyCommand;
      if (!command) return;
      await navigator.clipboard.writeText(command);
      copyButton.textContent = 'Copied';
      window.setTimeout(() => { copyButton.textContent = 'Copy'; }, 1400);
    });
  });
})();`;

export function skillsIndexPage(
  skills: Skill[],
  theme: ThemeDefinition = blogTheme,
  site: SiteIdentity = DEFAULT_SITE,
  stylesheet: string = DEFAULT_THEME_STYLESHEET,
): string {
  const publicSkills = skills.filter((skill) => skill.scope === "public");
  const projectSkills = skills.filter((skill) => skill.scope === "project");
  return pageHtml({
    site,
    theme,
    title: "Skills",
    description: "Methods and working conventions that can be handed to an Agent.",
    activePath: "/skills/",
    styleHref: styleHref(1, stylesheet),
    children: (
      <Page
        eyebrow="~/skills"
        title="Skills"
        description="Methods shared publicly and usable directly by an Agent."
      >
        <Section title="Public Skills">
          {publicSkills.length ? (
            <EntryList>
              {publicSkills.map((skill) => (
                <SkillCard skill={skill} site={site} />
              ))}
            </EntryList>
          ) : (
            <Text variant="secondary">Public Skills have no content yet.</Text>
          )}
        </Section>
        {projectSkills.length ? (
          <Section
            title="Project Skills"
            description="Development and content workflows used inside this project"
          >
            <EntryList>
              {projectSkills.map((skill) => (
                <SkillCard skill={skill} site={site} />
              ))}
            </EntryList>
          </Section>
        ) : null}
        <Text variant="caption">
          The reference graph starts from SKILL.md and is generated at build time from Markdown
          links.
        </Text>
      </Page>
    ),
  });
}

export function skillPage(
  skill: Skill,
  theme: ThemeDefinition = blogTheme,
  site: SiteIdentity = DEFAULT_SITE,
  stylesheet: string = DEFAULT_THEME_STYLESHEET,
): string {
  const firstFile = skill.files[0];
  const command =
    skill.scope === "public" ? skillInstallCommand(site, skill) : skill.sourceBasePath;
  return pageHtml({
    site,
    theme,
    title: skill.name,
    wide: true,
    description: skill.description,
    activePath: "/skills/",
    styleHref:
      skill.scope === "public"
        ? styleHref(1 + slugDepth(skill.slug), stylesheet)
        : styleHref(2 + slugDepth(skill.slug), stylesheet),
    children: (
      <Page
        width="full"
        className="skill-page"
        title={skill.name}
        eyebrow="Skill"
        description={skill.description}
      >
        <a className="skill-back site-icon-label" href="/skills/">
          <Icon name="arrow-left" size={14} /> All Skills
        </a>
        <header className="skill-browser-head">
          <span className="skill-command">
            {skill.scope === "project" ? (
              <span className="skill-scope-badge">Project Skill · Internal</span>
            ) : null}
            <code>{command}</code>
          </span>
          <span className="skill-browser-actions">
            <button type="button" data-copy-command={command}>
              {skill.scope === "public" ? "Copy" : "Copy path"}
            </button>
            {site.repositorySourceUrl ? (
              <a
                className="site-icon-label"
                href={`${site.repositorySourceUrl}/${skill.sourceBasePath}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <GithubIcon /> GitHub <Icon name="arrow-up-right" size={14} />
              </a>
            ) : null}
          </span>
        </header>
        <div className="skill-stage" data-skill-browser>
          <nav className="skill-view-tabs" aria-label="Skill view mode">
            <button type="button" data-skill-view="files" aria-pressed="true">
              File browser
            </button>
            <button type="button" data-skill-view="relations" aria-pressed="false">
              Reference graph
            </button>
          </nav>
          <div className="skill-browser" data-skill-view-panel="files">
            <SkillFileTree skill={skill} activePath={firstFile.path} />
            <section className="skill-viewer" aria-live="polite">
              <header className="skill-viewer-bar">
                <span data-current-file>{firstFile.path}</span>
                <span>Markdown</span>
              </header>
              {skill.files.map((file, index) => (
                <Prose
                  as="article"
                  className={`skill-file-panel${index === 0 ? " active" : ""}`}
                  data-skill-panel={file.path}
                  hidden={index !== 0}
                  dangerouslySetInnerHTML={{
                    // The page owns h1; file headings nest under it without dropping any content.
                    __html: Bun.markdown
                      .html(file.content, { tagFilter: true })
                      .replace(
                        /<(\/?)h([1-6])(\s[^>]*)?>/g,
                        (_, closing, level, attributes = "") =>
                          `<${closing}h${Math.min(6, Number(level) + 1)}${attributes}>`,
                      ),
                  }}
                />
              ))}
            </section>
          </div>
          <SkillRelations skill={skill} />
        </div>
        <script dangerouslySetInnerHTML={{ __html: SKILL_BROWSER_SCRIPT }} />
      </Page>
    ),
  });
}

export function agentMarkdown(
  posts: ContentItem[],
  thoughts: ContentItem[],
  site: SiteIdentity = DEFAULT_SITE,
  pages?: readonly SitePage[],
  mappedSections = false,
): string {
  const siteMap = pages
    ? pages.map((page) => `- [${page.title}](${sitePageAgentUrl(page)})`)
    : [
        "- [Home](/)",
        "- [Posts](/posts/)",
        "- [Thoughts](/thoughts/)",
        "- [Skills](/skills/) (browse files and the auto-generated Markdown reference graph)",
        "- [About](/about/)",
      ];
  const lines = [
    `# ${site.name}`,
    "",
    "> Site index and content conventions for Agents to read.",
    "",
    "## Site map",
    "",
    ...siteMap,
    "",
    "## Content model",
    "",
    mappedSections
      ? "- Thoughts are trimmed, directly presentable notes."
      : `- \`${site.contentDirectory}/thoughts/\` stores trimmed, directly presentable short thoughts.`,
    mappedSections
      ? "- Posts are full articles. Post files whose name or path segment starts with `_` are drafts."
      : `- \`${site.contentDirectory}/posts/\` stores full posts; files whose name or path segment starts with \`_\` are drafts and are not published or rendered.`,
    "- Content files support `.md` and `.mdx`, and may start with YAML frontmatter.",
    "- Frontmatter currently has no required fields; `title`, `date`, `created_at`, `category` and `tags` are recognized by the site.",
    "",
    // A consumer that owns the site map owns the routes of its content too.
    ...(pages
      ? []
      : [
          "## Public content",
          "",
          `Public posts: ${posts.length}.`,
          `Public thoughts: ${thoughts.length}.`,
          "",
          "### Posts",
          "",
          ...posts.map((post) => `- [${post.title}](${itemUrl(post)}) — ${post.dateKey}`),
          "",
          "### Thoughts",
          "",
          ...thoughts.map(
            (thought) => `- [${thought.title}](${itemUrl(thought)}) — ${thought.dateKey}`,
          ),
          "",
        ]),
  ];
  return lines.join("\n");
}

export function llmText(
  posts: ContentItem[],
  thoughts: ContentItem[],
  site: SiteIdentity = DEFAULT_SITE,
  pages?: readonly SitePage[],
  agentGuide?: string,
): string {
  // A consumer that owns the site map owns the routes of its content too, so its index follows
  // the llms.txt shape: the summary, the guide, then one section of links per page group.
  if (pages) return consumerLlmText(site, pages, agentGuide);
  return [
    `# ${site.name}`,
    `> ${site.description}`,
    "",
    "## Pages",
    "- Home: /",
    "- Posts: /posts/",
    "- Thoughts: /thoughts/",
    "- Skills: /skills/",
    "- About: /about/",
    "- Agent Markdown: /agents.md",
    "",
    "## Posts",
    ...posts.map((post) => `- ${post.title}: ${itemUrl(post)}`),
    "",
    "## Thoughts",
    ...thoughts.map((thought) => `- ${thought.title}: ${itemUrl(thought)}`),
    "",
    "## Rules",
    "- Only the public build output is considered presentable content.",
    "- Drafts whose names start with _ under posts are not published or rendered.",
  ].join("\n");
}

/** The pages by group, in the order each group first appears. */
function pageGroups(pages: readonly SitePage[]): [string, SitePage[]][] {
  const groups = new Map<string, SitePage[]>();
  for (const page of pages) {
    const group = page.group ?? "Pages";
    const members = groups.get(group);
    if (members) members.push(page);
    else groups.set(group, [page]);
  }
  return [...groups];
}

/** One llms.txt link: the page's Markdown when it has one, and its description after a colon. */
function llmLink(page: SitePage): string {
  const description = page.description?.replace(/\s+/g, " ").trim();
  return `- [${page.title}](${sitePageAgentUrl(page)})${description ? `: ${description}` : ""}`;
}

function consumerLlmText(
  site: SiteIdentity,
  pages: readonly SitePage[],
  agentGuide: string | undefined,
): string {
  const full = pages.some((page) => page.markdown !== undefined);
  return [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    ...(agentGuide ? [agentGuide.trim(), ""] : []),
    ...pageGroups(pages).flatMap(([group, members]) => [
      `## ${group}`,
      "",
      ...members.map(llmLink),
      "",
    ]),
    "## Optional",
    "",
    ...(full
      ? [
          "- [Full text](/llms-full.txt): every page linked here as Markdown, in one file; large, so fetch single pages first",
        ]
      : []),
    "- [Agent Markdown](/agents.md): the site map",
    "",
  ].join("\n");
}

/**
 * Every page's Markdown in one file, after the same summary and guide as llms.txt. Pages without
 * a Markdown copy are left out; llms.txt still links their HTML.
 */
export function llmFullText(
  site: SiteIdentity,
  pages: readonly SitePage[],
  agentGuide?: string,
): string | undefined {
  const documents = pages.flatMap((page) =>
    page.markdown === undefined
      ? []
      : [`<!-- Source: ${sitePageAgentUrl(page)} -->\n\n${page.markdown.trim()}`],
  );
  if (!documents.length) return undefined;
  return [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    ...(agentGuide ? [agentGuide.trim(), ""] : []),
    documents.join("\n\n---\n\n"),
    "",
  ].join("\n");
}
