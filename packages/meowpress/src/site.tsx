import { themeAttributes, type ThemeDefinition } from "meowcss";
import { blogTheme } from "./theme";
import { Fragment, h, type Child } from "meowjsx/runtime";
import { renderToHtml } from "meowjsx/web";
import { withoutLeadingHeading, type ContentItem } from "./content";
import { DEFAULT_SITE, type SiteIdentity } from "./identity";
import type { Skill, SkillFile } from "./skills";
import { layoutSkillGraph, type SkillGraphNode } from "./skill-graph";

interface DocumentProps {
  theme: ThemeDefinition;
  site: SiteIdentity;
  title: string;
  description?: string;
  activePath?: string;
  styleHref: string;
  children: Child;
}

function SiteHeader({ activePath, site }: { activePath?: string; site: SiteIdentity }): Child {
  return (
    <header className="site">
      <a className="site-name" href="/">
        {site.name}
      </a>
      <nav className="site-nav" aria-label="主导航">
        <a className={activePath === "/skills/" ? "active" : ""} href="/skills/">
          Skills
        </a>
        <a className={activePath === "/about/" ? "active" : ""} href="/about/">
          关于
        </a>
      </nav>
    </header>
  );
}

function SiteFooter({ site }: { site: SiteIdentity }): Child {
  return (
    <footer className="site">
      <span className="brand">
        © {new Date().getFullYear()} {site.name}
      </span>
      <span>
        <a href="/llm.txt">llm.txt</a> · <a href="/agents.md">agents.md</a>
      </span>
    </footer>
  );
}

function Document({
  title,
  description,
  activePath,
  styleHref,
  children,
  theme,
  site,
}: DocumentProps): Child {
  const documentTitle = title === site.name ? site.name : `${title} · ${site.name}`;
  return (
    <html lang="zh-CN" {...themeAttributes(theme)}>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={description ?? site.description} />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#faf8f3" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#191816" />
        <link rel="stylesheet" href={styleHref} />
        <title>{documentTitle}</title>
      </head>
      <body data-site={site.id}>
        <div className="container">
          <SiteHeader activePath={activePath} site={site} />
          {children}
          <SiteFooter site={site} />
        </div>
      </body>
    </html>
  );
}

function pageHtml(props: DocumentProps): string {
  return `<!doctype html>\n${renderToHtml(<Document {...props} />)}`;
}

function dateLabel(dateKey: string): { date: string; weekday: string } {
  if (dateKey === "undated") return { date: "未标日期", weekday: "" };
  const date = new Date(`${dateKey}T00:00:00+08:00`);
  return {
    date: new Intl.DateTimeFormat("zh-CN", {
      timeZone: "Asia/Shanghai",
      month: "long",
      day: "numeric",
    }).format(date),
    weekday: new Intl.DateTimeFormat("zh-CN", {
      timeZone: "Asia/Shanghai",
      weekday: "short",
      year: "numeric",
    }).format(date),
  };
}

function itemUrl(item: ContentItem): string {
  return `/${item.kind}s/${item.slug}/`;
}

function Hero({ image }: { image?: string }): Child {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <h1 id="hero-title">
          一万年太久，
          <br />
          <em>只真朝夕。</em>
        </h1>
      </div>
      <div className="hero-work" aria-hidden="true">
        <svg className="hero-doodle" viewBox="0 0 260 190">
          <path
            className="doodle-loop"
            d="M24 96C20 45 58 18 122 20c72 2 116 33 114 84-2 48-48 70-113 68-65-2-96-27-99-76Z"
          />
          <circle className="doodle-sun" cx="194" cy="55" r="27" />
          <path className="doodle-page" d="M47 100c28-9 57-5 83 11v49c-24-13-52-16-83-7Z" />
          <path className="doodle-page" d="M130 111c24-15 52-19 82-9v51c-31-7-58-4-82 7Z" />
          <path className="doodle-spine" d="M130 111v49" />
          <path
            className="doodle-writing"
            d="M61 118c18-3 36-1 53 5M61 132c17-2 32 0 46 5M148 119c17-4 33-5 50-1M148 133c14-3 29-3 44 0"
          />
          <circle className="doodle-dot" cx="41" cy="61" r="5" />
          <path className="doodle-spark" d="M72 44v12M66 50h12" />
        </svg>
        {image ? <img className="hero-image" src={image} alt="" decoding="async" /> : null}
      </div>
    </section>
  );
}

function DoodleGithubIcon(): Child {
  return (
    <svg className="github-icon" viewBox="0 0 48 48" aria-hidden="true">
      <path
        className="github-icon-ring"
        d="M24 3.8C11.7 3.5 4.2 11.2 4.6 24.1c.3 12.1 7.8 20.1 19.6 20 12.2-.1 19.4-7.7 19.2-20C43.2 11.7 36.2 4.1 24 3.8Z"
      />
      <path
        className="github-icon-cat"
        d="M14.3 18.8c-.7-2.4-.3-5.1.8-7.1 3.2.1 5.4 1.3 6.6 2.2 1.5-.4 3.1-.6 4.8-.4 1.4-1 3.7-1.9 6.7-1.8 1 2.2 1.3 4.9.5 7.1 1.5 1.8 2.2 4.1 2 6.8-.4 5.2-3.2 8.2-8.2 8.8.8.7 1.3 1.9 1.3 3.8v4.3c-1.5.4-3.1.6-4.8.6-1.4 0-2.8-.1-4.2-.5v-3.4c0-1.8.5-3.1 1.4-4-4.8-.6-7.7-3.5-8.2-8.7-.3-2.7.4-5 1.3-6.7Z"
      />
      <path
        className="github-icon-face"
        d="M20.2 24.3h.1M29.2 24.3h.1M21.2 28.9c2.2 1.4 4.5 1.4 6.8 0"
      />
    </svg>
  );
}

function DoodleExternalArrow(): Child {
  return (
    <svg className="external-arrow" viewBox="0 0 28 28" aria-hidden="true">
      <path d="M7 21 21 7M12 7h9v9" />
    </svg>
  );
}

function Tags({ item }: { item: ContentItem }): Child {
  if (item.tags.length === 0) return null;
  return (
    <div className="tags">
      {item.tags.map((tag) => (
        <span>#{tag}</span>
      ))}
    </div>
  );
}

function ThoughtCard({ item, linked = false }: { item: ContentItem; linked?: boolean }): Child {
  const body = (
    <Fragment>
      <div className="time">
        <span className="t">{item.timeLabel || item.dateKey}</span> · 想法
      </div>
      <div
        className="body"
        dangerouslySetInnerHTML={{ __html: withoutLeadingHeading(item.html) }}
      />
      <Tags item={item} />
    </Fragment>
  );
  if (!linked)
    return (
      <article className="thought" data-kind="thought">
        {body}
      </article>
    );
  return (
    <article className="thought" data-kind="thought">
      <a className="thought-link" href={itemUrl(item)}>
        {body}
      </a>
    </article>
  );
}

function PostCard({ item }: { item: ContentItem }): Child {
  const category = typeof item.metadata.category === "string" ? item.metadata.category : "文章";
  return (
    <a className="post-card" href={itemUrl(item)} data-kind="post">
      <div className="card-top">
        <span className="kind">{category}</span>
        <span className="meta">
          约 {item.readingMinutes} 分钟 · {item.characterCount} 字
        </span>
      </div>
      <h3>{item.title}</h3>
      <p className="excerpt">{item.excerpt || "这篇文章还没有摘要。"}</p>
      <Tags item={item} />
    </a>
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

function FeedDecor({ image }: { image?: string }): Child {
  return (
    <div className="feed-decor" aria-hidden="true">
      <svg className="yarn-doodle" viewBox="0 0 88 70">
        <path
          className="yarn-tail"
          d="M42 48c-10 7-17 4-22 9-5 4-2 9 4 8 8-1 11-8 18-6 6 1 10 6 16 4"
        />
        <circle className="yarn-fill" cx="48" cy="34" r="22" />
        <path
          className="yarn-line"
          d="M31 23c11 1 22 7 34 18M28 34c12-7 24-9 39-5M34 49c7-14 16-24 28-31M28 42c13 1 24 5 33 12"
        />
      </svg>
      <svg className="paw-trail" viewBox="0 0 130 82">
        <g className="paw-print" transform="translate(12 54) rotate(-18)">
          <ellipse cx="9" cy="11" rx="6" ry="5" />
          <circle cx="3" cy="3" r="2.5" />
          <circle cx="9" cy="1" r="2.5" />
          <circle cx="15" cy="3" r="2.5" />
        </g>
        <g className="paw-print" transform="translate(45 37) rotate(8)">
          <ellipse cx="9" cy="11" rx="6" ry="5" />
          <circle cx="3" cy="3" r="2.5" />
          <circle cx="9" cy="1" r="2.5" />
          <circle cx="15" cy="3" r="2.5" />
        </g>
        <g className="paw-print" transform="translate(79 19) rotate(-12)">
          <ellipse cx="9" cy="11" rx="6" ry="5" />
          <circle cx="3" cy="3" r="2.5" />
          <circle cx="9" cy="1" r="2.5" />
          <circle cx="15" cy="3" r="2.5" />
        </g>
        <g className="paw-print paw-print-accent" transform="translate(111 5) rotate(11)">
          <ellipse cx="7" cy="9" rx="5" ry="4" />
          <circle cx="2" cy="2" r="2" />
          <circle cx="7" cy="1" r="2" />
          <circle cx="12" cy="2" r="2" />
        </g>
      </svg>
      {image ? <img className="feed-image" src={image} alt="" decoding="async" /> : null}
    </div>
  );
}

function Feed({ items, image }: { items: ContentItem[]; image?: string }): Child {
  if (items.length === 0) {
    return (
      <main className="feed feed-empty">
        <p className="empty-state">还没有公开内容。</p>
        <FeedDecor image={image} />
      </main>
    );
  }

  return (
    <main className="feed">
      {[...groupByDate(items)].map(([dateKey, group]) => {
        const label = dateLabel(dateKey);
        return (
          <section className="day">
            <h2 className="day-header">
              {label.date} <span className="weekday">{label.weekday}</span>
            </h2>
            {group.map((item) =>
              item.kind === "thought" ? (
                <ThoughtCard item={item} linked />
              ) : (
                <PostCard item={item} />
              ),
            )}
          </section>
        );
      })}
      <FeedDecor image={image} />
    </main>
  );
}

function Filter({ posts, thoughts }: { posts: number; thoughts: number }): Child {
  const total = posts + thoughts;
  return (
    <div className="tag-filter" data-filter-group="feed" role="group" aria-label="筛选首页内容">
      <button type="button" data-filter="all" className="active" aria-pressed="true">
        全部<i>{total}</i>
      </button>
      <button type="button" data-filter="post" aria-pressed="false">
        文章<i>{posts}</i>
      </button>
      <button type="button" data-filter="thought" aria-pressed="false">
        想法<i>{thoughts}</i>
      </button>
    </div>
  );
}

const FILTER_SCRIPT = `(() => {
  const links = document.querySelectorAll('[data-filter-group="feed"] [data-filter]');
  const items = document.querySelectorAll('.feed [data-kind]');
  const days = document.querySelectorAll('.feed .day');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduced) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    days.forEach((day) => observer.observe(day));
  } else {
    days.forEach((day) => day.classList.add('in'));
  }
  links.forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    const filter = link.dataset.filter;
    links.forEach((item) => {
      const active = item === link;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    items.forEach((item) => {
      item.style.display = filter === 'all' || item.dataset.kind === filter ? '' : 'none';
    });
    days.forEach((day) => {
      const visible = Array.from(day.querySelectorAll('[data-kind]'))
        .some((item) => item.style.display !== 'none');
      day.style.display = visible ? '' : 'none';
      if (!visible) day.classList.remove('in');
    });
    if (!reduced) {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        days.forEach((day) => {
          if (day.style.display !== 'none') day.classList.add('in');
        });
      }));
    }
  }));
})();`;

export function homePage(
  items: ContentItem[],
  theme: ThemeDefinition = blogTheme,
  site: SiteIdentity = DEFAULT_SITE,
): string {
  return pageHtml({
    site,
    theme,
    title: site.name,
    styleHref: "./blog-theme.css",
    children: (
      <Fragment>
        <Hero image={site.images?.hero ? `./${site.images.hero}` : undefined} />
        <Filter
          posts={items.filter((item) => item.kind === "post").length}
          thoughts={items.filter((item) => item.kind === "thought").length}
        />
        <Feed items={items} image={site.images?.feed ? `./${site.images.feed}` : undefined} />
        <script dangerouslySetInnerHTML={{ __html: FILTER_SCRIPT }} />
      </Fragment>
    ),
  });
}

export function listPage(
  kind: "post" | "thought",
  items: ContentItem[],
  theme: ThemeDefinition = blogTheme,
  site: SiteIdentity = DEFAULT_SITE,
): string {
  const isPost = kind === "post";
  return pageHtml({
    site,
    theme,
    title: isPost ? "文章" : "想法",
    activePath: isPost ? "/posts/" : "/thoughts/",
    styleHref: "../blog-theme.css",
    children: (
      <main className="listing">
        <header className="listing-head">
          <span className="kind">{isPost ? "Posts" : "Thoughts"}</span>
          <h1>{isPost ? "文章" : "想法"}</h1>
          <p>{isPost ? "从碎片里长出来的完整论述。" : "经过剪裁、可以直接展示的短想法。"}</p>
        </header>
        <div className={isPost ? "post-list" : "thought-list"}>
          {items.length === 0 ? (
            <p className="empty-state">还没有公开内容。</p>
          ) : (
            items.map((item) =>
              isPost ? <PostCard item={item} /> : <ThoughtCard item={item} linked />,
            )
          )}
        </div>
      </main>
    ),
  });
}

function PostNavigation({ item, posts }: { item: ContentItem; posts: ContentItem[] }): Child {
  const index = posts.findIndex((post) => post.slug === item.slug);
  const older = index >= 0 ? posts[index + 1] : undefined;
  const newer = index > 0 ? posts[index - 1] : undefined;
  return (
    <nav className="post-nav" aria-label="文章导航">
      {older ? (
        <a href={itemUrl(older)}>
          <span className="label">← 上一篇（更早）</span>
          {older.title}
        </a>
      ) : (
        <span />
      )}
      {newer ? (
        <a className="next" href={itemUrl(newer)}>
          <span className="label">下一篇（更新）→</span>
          {newer.title}
        </a>
      ) : (
        <span className="next">
          <span className="label">下一篇（更新）→</span>没有了，这是最新的一篇
        </span>
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
  if (related.length === 0) return null;
  return (
    <aside className="related-thoughts">
      <h2>同一天的想法</h2>
      {related.map((thought) => (
        <ThoughtCard item={thought} linked />
      ))}
    </aside>
  );
}

export function postPage(
  item: ContentItem,
  posts: ContentItem[],
  thoughts: ContentItem[],
  theme: ThemeDefinition = blogTheme,
  site: SiteIdentity = DEFAULT_SITE,
): string {
  const category = typeof item.metadata.category === "string" ? item.metadata.category : "文章";
  return pageHtml({
    site,
    theme,
    title: item.title,
    description: item.excerpt,
    activePath: "/posts/",
    styleHref: "../../blog-theme.css",
    children: (
      <main>
        <article>
          <header className="post-head">
            <span className="kind">{category}</span>
            <h1>{item.title}</h1>
            <div className="meta">
              {item.dateKey} · 约 {item.readingMinutes} 分钟 · {item.characterCount} 字
            </div>
          </header>
          <div className="prose" dangerouslySetInnerHTML={{ __html: item.html }} />
          <RelatedThoughts item={item} thoughts={thoughts} />
          <PostNavigation item={item} posts={posts} />
        </article>
      </main>
    ),
  });
}

export function thoughtPage(
  item: ContentItem,
  theme: ThemeDefinition = blogTheme,
  site: SiteIdentity = DEFAULT_SITE,
): string {
  return pageHtml({
    site,
    theme,
    title: item.title,
    description: item.excerpt,
    activePath: "/thoughts/",
    styleHref: "../../blog-theme.css",
    children: (
      <main>
        <article>
          <header className="post-head">
            <span className="kind">想法</span>
            <h1>{item.title}</h1>
            <div className="meta">
              {item.dateKey}
              {item.timeLabel ? ` · ${item.timeLabel}` : ""}
            </div>
          </header>
          <div className="prose" dangerouslySetInnerHTML={{ __html: item.html }} />
        </article>
      </main>
    ),
  });
}

export function aboutPage(
  theme: ThemeDefinition = blogTheme,
  site: SiteIdentity = DEFAULT_SITE,
): string {
  const about = site.about;
  return pageHtml({
    site,
    theme,
    title: "关于",
    activePath: "/about/",
    styleHref: "../blog-theme.css",
    children: (
      <main className="about">
        <div className="avatar" aria-hidden="true">
          {site.images?.about ? (
            <img src={`../${site.images.about}`} alt="" decoding="async" />
          ) : (
            <span className="avatar-initial">{Array.from(site.name.trim())[0] ?? "M"}</span>
          )}
        </div>
        {about ? (
          <Fragment>
            <h1>{about.heading}</h1>
            {about.paragraphs.map((paragraph) => (
              <p>{paragraph}</p>
            ))}
            {about.links && about.links.length > 0 ? (
              <Fragment>
                <h2>{about.linksHeading ?? "找到我"}</h2>
                {about.links.map((link) => (
                  <a
                    className="github-link"
                    href={link.href}
                    target="_blank"
                    rel="me noopener noreferrer"
                  >
                    <DoodleGithubIcon />
                    <span className="github-copy">
                      <span>{link.label}</span>
                      <strong>{link.handle}</strong>
                    </span>
                    <DoodleExternalArrow />
                  </a>
                ))}
              </Fragment>
            ) : null}
          </Fragment>
        ) : (
          <h1>{site.name}</h1>
        )}
      </main>
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
    <a
      className={`skill-card${skill.scope === "project" ? " project-skill" : ""}`}
      href={skillUrl(skill)}
    >
      <span className="skill-card-source">
        <span className="skill-card-path">
          {skill.scope === "public" ? skillInstallCommand(site, skill) : skill.sourceBasePath}
        </span>
        {skill.scope === "project" ? <span className="skill-scope-badge">项目 Skill</span> : null}
      </span>
      <span className="skill-card-main">
        <strong>{skill.name}</strong>
        <span>{skill.description}</span>
      </span>
      <span className="skill-card-foot">
        <span>
          {skill.files.length} 个 Markdown · {skill.relations.length} 条引用
        </span>
        <span className="skill-open">打开目录&nbsp; →</span>
      </span>
    </a>
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
    <nav className="skill-files" aria-label={`${skill.name} 文件目录`}>
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
      aria-label={`${node.name}，${node.role}`}
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
      aria-label={`${skill.name} 文件引用关系`}
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
      <div className="skill-reading-summary" aria-label="阅读结构摘要">
        <span>
          <strong>
            {reachableFiles}/{skill.files.length}
          </strong>
          可达文档
        </span>
        <span>
          <strong>{skill.relations.length}</strong>引用关系
        </span>
        <span>
          <strong>{maxDepth}</strong>最深层级
        </span>
        <span className={missingNodes.length > 0 ? "has-issue" : ""}>
          <strong>{missingNodes.length}</strong>缺失目标
        </span>
      </div>

      {hasRelations ? (
        <Fragment>
          <div className={`skill-graph-canvas${compactGraph ? " compact" : ""}`}>
            <SkillRelationGraph skill={skill} direction="LR" />
            <SkillRelationGraph skill={skill} direction="TB" />
          </div>
          <section className="skill-reading-paths" aria-labelledby={`${skill.slug}-paths`}>
            <h3 id={`${skill.slug}-paths`}>引用发生在哪里</h3>
            <ol>
              {skill.relations.map((relation) => {
                const sourceFile = skill.files.find((file) => file.path === relation.source);
                return (
                  <li className={sourceFile?.reachable ? "" : "unreachable"}>
                    <span className="skill-reading-edge">
                      <code title={relation.source}>{relation.source}</code>
                      <span aria-hidden="true">→</span>
                      <code title={relation.target}>{relation.target}</code>
                    </span>
                    <span className="skill-reading-context">
                      {relation.contexts.map((context) => (
                        <span>
                          {context.section}
                          {context.line ? ` · 第 ${context.line} 行` : ""}
                          {context.linkText !== relation.label ? ` · “${context.linkText}”` : ""}
                          {!sourceFile?.reachable ? " · 入口不可达" : ""}
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
          <strong>没有跨文件阅读路径</strong>
          <p>
            Agent 进入后只会读取 <code>SKILL.md</code>。如果还有必须阅读的参考材料，需要从相关章节用
            Markdown 链接明确引出。
          </p>
        </div>
      )}

      {unreferencedFiles.length > 0 || missingNodes.length > 0 ? (
        <aside className="skill-reading-issues" aria-label="信息结构问题">
          <strong>需要留意</strong>
          {unreferencedFiles.length > 0 ? (
            <p>
              入口无法到达：
              {unreferencedFiles.map((file) => (
                <code>{file.path}</code>
              ))}
            </p>
          ) : null}
          {missingNodes.length > 0 ? (
            <p>
              链接目标不存在：
              {missingNodes.map((node) => (
                <code>{node.path}</code>
              ))}
            </p>
          ) : null}
        </aside>
      ) : null}

      {hasRelations ? (
        <div className="skill-graph-status" data-map-status aria-live="polite">
          点击图中的节点查看它在阅读链路中的作用
          {externalNodes.length > 0 ? `；当前有 ${externalNodes.length} 个 Skill 外部目标` : ""}。
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
      copyButton.textContent = '已复制';
      window.setTimeout(() => { copyButton.textContent = '复制'; }, 1400);
    });
  });
})();`;

export function skillsIndexPage(
  skills: Skill[],
  theme: ThemeDefinition = blogTheme,
  site: SiteIdentity = DEFAULT_SITE,
): string {
  const publicSkills = skills.filter((skill) => skill.scope === "public");
  const projectSkills = skills.filter((skill) => skill.scope === "project");
  return pageHtml({
    site,
    theme,
    title: "Skills",
    description: "可以交给 Agent 使用的方法与工作约定。",
    activePath: "/skills/",
    styleHref: "../blog-theme.css",
    children: (
      <main className="skills-index">
        <header className="skills-head">
          <span className="skill-path">~/skills</span>
          <h1>Skills</h1>
          <p>公开分享、可以直接交给 Agent 使用的方法。</p>
        </header>
        <section className="skill-group" aria-labelledby="public-skills-heading">
          <header className="skill-group-head">
            <h2 id="public-skills-heading">公开 Skills</h2>
            <span>公开内容</span>
          </header>
          {publicSkills.length > 0 ? (
            <div className="skill-list">
              {publicSkills.map((skill) => (
                <SkillCard skill={skill} site={site} />
              ))}
            </div>
          ) : (
            <p className="skill-group-empty">公开 Skills 目前还没有内容。</p>
          )}
        </section>
        {projectSkills.length > 0 ? (
          <section className="skill-group project-skills" aria-labelledby="project-skills-heading">
            <header className="skill-group-head">
              <div>
                <h2 id="project-skills-heading">项目 Skills</h2>
                <small>本项目内部使用的开发与内容工作流</small>
              </div>
              <span>.agents/skills/</span>
            </header>
            <div className="skill-list">
              {projectSkills.map((skill) => (
                <SkillCard skill={skill} site={site} />
              ))}
            </div>
          </section>
        ) : null}
        <p className="skills-prototype-note">
          引用关系图从 SKILL.md 出发，根据 Markdown 链接在构建时自动生成。
        </p>
      </main>
    ),
  });
}

export function skillPage(
  skill: Skill,
  theme: ThemeDefinition = blogTheme,
  site: SiteIdentity = DEFAULT_SITE,
): string {
  const firstFile = skill.files[0];
  const command =
    skill.scope === "public" ? skillInstallCommand(site, skill) : skill.sourceBasePath;
  return pageHtml({
    site,
    theme,
    title: skill.name,
    description: skill.description,
    activePath: "/skills/",
    styleHref: skill.scope === "public" ? "../../blog-theme.css" : "../../../blog-theme.css",
    children: (
      <main className="skill-page">
        <a className="skill-back" href="/skills/">
          ← 所有 Skills
        </a>
        <header className="skill-browser-head">
          <span className="skill-command">
            {skill.scope === "project" ? (
              <span className="skill-scope-badge">项目 Skill · 内部</span>
            ) : null}
            <code>{command}</code>
          </span>
          <span className="skill-browser-actions">
            <button type="button" data-copy-command={command}>
              {skill.scope === "public" ? "复制" : "复制路径"}
            </button>
            {site.repositorySourceUrl ? (
              <a
                href={`${site.repositorySourceUrl}/${skill.sourceBasePath}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub ↗
              </a>
            ) : null}
          </span>
        </header>
        <div className="skill-stage" data-skill-browser>
          <nav className="skill-view-tabs" aria-label="Skill 浏览方式">
            <button type="button" data-skill-view="files" aria-pressed="true">
              文件浏览
            </button>
            <button type="button" data-skill-view="relations" aria-pressed="false">
              引用关系图
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
                <article
                  className={`skill-file-panel prose${index === 0 ? " active" : ""}`}
                  data-skill-panel={file.path}
                  hidden={index !== 0}
                  dangerouslySetInnerHTML={{
                    __html: Bun.markdown.html(file.content, { tagFilter: true }),
                  }}
                />
              ))}
            </section>
          </div>
          <SkillRelations skill={skill} />
        </div>
        <script dangerouslySetInnerHTML={{ __html: SKILL_BROWSER_SCRIPT }} />
      </main>
    ),
  });
}

export function agentMarkdown(
  posts: ContentItem[],
  thoughts: ContentItem[],
  site: SiteIdentity = DEFAULT_SITE,
): string {
  const lines = [
    `# ${site.name}`,
    "",
    "> 给 Agent 读取的站点索引与内容约定。",
    "",
    "## Site map",
    "",
    "- [首页](/)",
    "- [文章](/posts/)",
    "- [想法](/thoughts/)",
    "- [Skills](/skills/)（可浏览文件与自动生成的 Markdown 引用关系）",
    "- [关于](/about/)",
    "",
    "## Content model",
    "",
    `- \`${site.contentDirectory}/thoughts/\` 保存经过剪裁、可直接展示的短想法。`,
    `- \`${site.contentDirectory}/posts/\` 保存完整文章；文件名或路径组件以 \`_\` 开头的文件是 draft，不公开、不渲染。`,
    "- 内容文件支持 `.md` 和 `.mdx`，开头可使用 YAML Frontmatter。",
    "- 目前 Frontmatter 没有强制字段；`title`、`date`、`created_at`、`category`、`tags` 会被站点识别。",
    "",
    "## Public content",
    "",
    `公开文章：${posts.length} 篇。`,
    `公开想法：${thoughts.length} 条。`,
    "",
    "### Posts",
    "",
    ...posts.map((post) => `- [${post.title}](${itemUrl(post)}) — ${post.dateKey}`),
    "",
    "### Thoughts",
    "",
    ...thoughts.map((thought) => `- [${thought.title}](${itemUrl(thought)}) — ${thought.dateKey}`),
    "",
  ];
  return lines.join("\n");
}

export function llmText(
  posts: ContentItem[],
  thoughts: ContentItem[],
  site: SiteIdentity = DEFAULT_SITE,
): string {
  return [
    `# ${site.name}`,
    `> ${site.description}`,
    "",
    "## Pages",
    "- 首页: /",
    "- 文章: /posts/",
    "- 想法: /thoughts/",
    "- Skills: /skills/",
    "- 关于: /about/",
    "- Agent Markdown: /agents.md",
    "",
    "## Posts",
    ...posts.map((post) => `- ${post.title}: ${itemUrl(post)}`),
    "",
    "## Thoughts",
    ...thoughts.map((thought) => `- ${thought.title}: ${itemUrl(thought)}`),
    "",
    "## Rules",
    "- 只把公开构建产物视为可展示内容。",
    "- posts 中以 _ 开头的 draft 不公开、不渲染。",
  ].join("\n");
}
