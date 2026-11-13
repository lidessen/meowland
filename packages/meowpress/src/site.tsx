import { themeAttributes, type ThemeDefinition } from "meowcss";
import { createRuntime, Fragment, h, type Child } from "meowjsx";
import { I18nProvider, type MessageDescriptor, type MessageParams } from "meowjsx/i18n";
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
import { translationRecord, withoutLeadingHeading, type ContentItem } from "./content";
import { DEFAULT_SITE, type SiteIdentity, type SiteNotFound } from "./identity";
import { contentUrl, defaultPageLocale, localePath, richMessage, type PageLocale } from "./locale";
import { themeMessages as M } from "./messages";
import { sitePageAgentUrl, type SitePage } from "./pages";
import type { Skill, SkillFile } from "./skills";
import { layoutSkillGraph, type SkillGraphNode } from "./skill-graph";

/** A link to one language version of something: a language switch entry or an alternate link. */
export interface LocaleLink {
  tag: string;
  label: string;
  href: string;
}

/**
 * The language versions of one page. `versions` holds only the locales where the page exists;
 * the language switch falls back to a locale's home page for the rest.
 */
export interface PageLanguages {
  /** The page's own route, for example "/fr/posts/first/". */
  path: string;
  versions: readonly LocaleLink[];
}

interface DocumentProps {
  theme: ThemeDefinition;
  /** The site as configured; the document shows its copy in the page locale. */
  site: SiteIdentity;
  title: string;
  description?: string;
  activePath?: string;
  styleHref: string;
  baseHref?: string;
  wide?: boolean;
  locale: PageLocale;
  /** The page's language versions; absent on a single-language site and on pages written once. */
  page?: PageLanguages;
  children: Child;
}

/** The name of the theme stylesheet the package writes by default. */
export const DEFAULT_THEME_STYLESHEET = "blog-theme.css";

function styleHref(depth: number, stylesheet: string): string {
  return `${"../".repeat(depth)}${stylesheet}`;
}

/** A path below the site root, written relative to a page `levels` directories deep. */
function assetHref(levels: number, path: string): string {
  return levels === 0 ? `./${path}` : `${"../".repeat(levels)}${path}`;
}

/** Directories a target locale's pages sit below the site root. */
function localeDepth(locale: PageLocale): number {
  return locale.isSource ? 0 : 1;
}

function slugDepth(slug: string): number {
  return slug.split("/").filter(Boolean).length;
}

/** A page's language versions when the site publishes more than one language. */
function staticPage(locale: PageLocale, path: string): PageLanguages | undefined {
  if (locale.entries.length < 2) return undefined;
  return {
    path: localePath(locale, path),
    versions: locale.entries.map((entry) => ({
      tag: entry.tag,
      label: entry.label,
      href: entry.segment === "" ? path : `/${entry.segment}${path}`,
    })),
  };
}

/** A content item's language versions: the original and every translation that exists. */
function contentPage(locale: PageLocale, item: ContentItem): PageLanguages | undefined {
  if (locale.entries.length < 2) return undefined;
  const original = item.original ?? item;
  const members = [original, ...original.translations];
  return {
    path: contentUrl(locale, item),
    versions: locale.entries.flatMap((entry) => {
      const member = members.find((candidate) => candidate.locale === entry.tag);
      return member
        ? [{ tag: entry.tag, label: entry.label, href: contentUrl(locale, member) }]
        : [];
    }),
  };
}

/**
 * A page that exists once, in the source language, such as a skill. The switch still shows every
 * locale and sends the others to their home page, so a target reader is not stranded.
 */
function sourceOnlyPage(locale: PageLocale, path: string): PageLanguages | undefined {
  if (locale.entries.length < 2) return undefined;
  return {
    path,
    versions: locale.entries
      .filter((entry) => entry.isSource)
      .map((entry) => ({ tag: entry.tag, label: entry.label, href: path })),
  };
}

/** An absolute URL for alternate and canonical links; `site.url` has no trailing slash. */
function absoluteHref(site: SiteIdentity, path: string): string {
  return site.url === undefined ? path : `${site.url}${path}`;
}

/** A theme sentence as a string. Pages are static, so the message is read once. */
function text(locale: PageLocale, message: MessageDescriptor, params?: MessageParams): string {
  return locale.i18n.t(message, params).value;
}

/** Counts are passed as text so digits stay ungrouped, as the English pages have always printed. */
function count(value: number): string {
  return String(value);
}

/** The site's own copy in the page locale. */
function siteView(site: SiteIdentity, locale: PageLocale): SiteIdentity {
  const about = site.about;
  return {
    ...site,
    name: locale.copy(site.name),
    description: locale.copy(site.description),
    about: about && {
      ...about,
      heading: locale.copy(about.heading),
      paragraphs: about.paragraphs.map(locale.copy),
      linksHeading: about.linksHeading === undefined ? undefined : locale.copy(about.linksHeading),
      links: about.links?.map((link) => ({ ...link, label: locale.copy(link.label) })),
    },
  };
}

/** Links to the same page in every language, or to a language's home page when it has none. */
function LanguageSwitch({
  locale,
  page,
}: {
  locale: PageLocale;
  page: PageLanguages | undefined;
}): Child {
  if (!page || locale.entries.length < 2) return null;
  return (
    <nav className="site-locale-switch" aria-label={text(locale, M.languages)}>
      {locale.entries.map((entry) => {
        const version = page.versions.find((candidate) => candidate.tag === entry.tag);
        const href = version?.href ?? (entry.segment === "" ? "/" : `/${entry.segment}/`);
        return (
          <a
            href={href}
            lang={entry.tag}
            hreflang={entry.tag}
            aria-current={entry.tag === locale.tag ? "true" : undefined}
          >
            {entry.label}
          </a>
        );
      })}
    </nav>
  );
}

function SiteHeader({
  activePath,
  site,
  locale,
  page,
}: {
  activePath?: string;
  site: SiteIdentity;
  locale: PageLocale;
  page?: PageLanguages;
}): Child {
  const links = [
    ["/posts/", M.posts],
    ["/thoughts/", M.thoughts],
    ["/skills/", M.skills],
    ["/about/", M.about],
  ] as const;
  return (
    <header className="site-header">
      <a className="site-name" href={localePath(locale, "/")}>
        {site.name}
      </a>
      <nav className="site-nav" aria-label={text(locale, M.primaryNavigation)}>
        {links.map(([href, label]) => (
          <a
            href={localePath(locale, href)}
            aria-current={activePath === href ? "page" : undefined}
          >
            {text(locale, label)}
          </a>
        ))}
      </nav>
      <LanguageSwitch locale={locale} page={page} />
    </header>
  );
}

function SiteFooter({ site, locale }: { site: SiteIdentity; locale: PageLocale }): Child {
  return (
    <footer className="site-footer">
      <Text variant="caption">
        {text(locale, M.footerCopyright, {
          year: String(new Date().getFullYear()),
          name: site.name,
        })}
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
  locale,
  page,
}: DocumentProps): Child {
  // Compare with the configured name before it is translated.
  const view = siteView(site, locale);
  const xDefault = page?.versions.find((version) => version.tag === locale.source)?.href;
  return (
    <html
      lang={locale.tag}
      dir={locale.direction === "rtl" ? "rtl" : undefined}
      data-meowui-page=""
      {...themeAttributes(theme)}
    >
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={description ?? view.description} />
        {baseHref ? <base href={baseHref} /> : null}
        <link rel="stylesheet" href={styleHref} />
        {/* Alternate and canonical links need the public origin; without it only the switch remains. */}
        {site.url !== undefined && page !== undefined ? (
          <Fragment>
            <link rel="canonical" href={absoluteHref(site, page.path)} />
            {page.versions.map((version) => (
              <link
                rel="alternate"
                hreflang={version.tag}
                href={absoluteHref(site, version.href)}
              />
            ))}
            <link
              rel="alternate"
              hreflang="x-default"
              href={absoluteHref(site, xDefault ?? page.path)}
            />
          </Fragment>
        ) : null}
        <title>{title === site.name ? view.name : `${title} · ${view.name}`}</title>
      </head>
      <body data-site={site.id}>
        <a className="skip-link" href="#main-content">
          {text(locale, M.skipLink)}
        </a>
        <div className="site-shell">
          <Container width={wide ? "wide" : "content"}>
            <SiteHeader activePath={activePath} site={view} locale={locale} page={page} />
            <main id="main-content" tabIndex={-1}>
              {children}
            </main>
            <SiteFooter site={view} locale={locale} />
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
  // Components below the provider may use the ambient `t`; the page functions use the instance.
  return `<!doctype html>\n${renderToHtmlWithRuntime(
    runtime,
    <I18nProvider value={props.locale.i18n}>
      <Document {...props} />
    </I18nProvider>,
  )}`;
}

function dateLabel(dateKey: string, locale: PageLocale): { date: string; weekday: string } {
  const date = new Date(`${dateKey}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return { date: text(locale, M.undated), weekday: "" };
  return {
    date: locale.i18n.date(date, { timeZone: "UTC", month: "long", day: "numeric" }).value,
    weekday: text(locale, M.dateWeekday, {
      year: String(date.getUTCFullYear()),
      weekday: locale.i18n.date(date, { timeZone: "UTC", weekday: "short" }).value,
    }),
  };
}

function itemUrl(locale: PageLocale, item: ContentItem): string {
  return contentUrl(locale, item);
}

/** An entry written in another language than the page marks it; the source tree marks nothing. */
function entryLang(item: ContentItem, locale: PageLocale): string | undefined {
  return item.locale === locale.tag ? undefined : item.locale;
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

function ThoughtCard({
  item,
  locale,
  linked = false,
}: {
  item: ContentItem;
  locale: PageLocale;
  linked?: boolean;
}): Child {
  return (
    <Entry
      className="thought"
      data-kind="thought"
      lang={entryLang(item, locale)}
      title={item.title}
      href={linked ? itemUrl(locale, item) : undefined}
      eyebrow={text(locale, M.thoughtEntryEyebrow, { when: item.timeLabel || item.dateKey })}
    >
      <Prose dangerouslySetInnerHTML={{ __html: withoutLeadingHeading(item.html) }} />
      <Tags item={item} />
    </Entry>
  );
}

function ReadingMeta({ item, locale }: { item: ContentItem; locale: PageLocale }): Child {
  return (
    <MetaRow
      items={[
        { label: item.dateKey },
        { label: text(locale, M.minRead, { minutes: count(item.readingMinutes) }) },
        { label: text(locale, M.characters, { count: count(item.characterCount) }) },
      ]}
    />
  );
}

function PostCard({ item, locale }: { item: ContentItem; locale: PageLocale }): Child {
  const category =
    typeof item.metadata.category === "string"
      ? item.metadata.category
      : text(locale, M.postFallbackCategory);
  return (
    <Entry
      size="feature"
      data-kind="post"
      lang={entryLang(item, locale)}
      title={item.title}
      href={itemUrl(locale, item)}
      eyebrow={category}
      description={item.excerpt || text(locale, M.noSummary)}
      meta={<ReadingMeta item={item} locale={locale} />}
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

function Feed({
  items,
  image,
  locale,
}: {
  items: ContentItem[];
  image?: string;
  locale: PageLocale;
}): Child {
  return (
    <div className="feed">
      {items.length === 0 ? (
        <Text variant="secondary">{text(locale, M.noContent)}</Text>
      ) : (
        [...groupByDate(items)].map(([dateKey, group]) => {
          const label = dateLabel(dateKey, locale);
          return (
            <Section className="day" title={label.date} description={label.weekday}>
              <EntryList>
                {group.map((item) =>
                  item.kind === "thought" ? (
                    <ThoughtCard item={item} locale={locale} linked />
                  ) : (
                    <PostCard item={item} locale={locale} />
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

function Filter({
  posts,
  thoughts,
  locale,
}: {
  posts: number;
  thoughts: number;
  locale: PageLocale;
}): Child {
  return (
    <Inline
      className="feed-filter"
      gap="compact"
      data-filter-group="feed"
      role="group"
      aria-label={text(locale, M.filterHome)}
    >
      {(
        [
          ["all", M.filterAll, posts + thoughts],
          ["post", M.posts, posts],
          ["thought", M.thoughts, thoughts],
        ] as const
      ).map(([value, label, total]) => (
        <Button variant="quiet" data-filter={value} aria-pressed={String(value === "all")}>
          {text(locale, label)} <span className="filter-count">{total}</span>
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
  locale: PageLocale = defaultPageLocale(),
): string {
  const view = siteView(site, locale);
  const depth = localeDepth(locale);
  return pageHtml({
    site,
    theme,
    locale,
    title: site.name,
    page: staticPage(locale, "/"),
    styleHref: styleHref(depth, stylesheet),
    children: (
      <Page
        header={
          <div className="home-heading">
            <div className="home-heading-copy">
              <Text variant="eyebrow">{text(locale, M.journal)}</Text>
              <PageHeader title={view.name} description={view.description} />
            </div>
            {site.images?.hero ? (
              <img
                className="hero-image"
                src={assetHref(depth, site.images.hero)}
                alt=""
                decoding="async"
              />
            ) : null}
          </div>
        }
        toolbar={
          <Filter
            posts={items.filter((item) => item.kind === "post").length}
            thoughts={items.filter((item) => item.kind === "thought").length}
            locale={locale}
          />
        }
      >
        <Feed
          items={items}
          locale={locale}
          image={site.images?.feed ? assetHref(depth, site.images.feed) : undefined}
        />
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
  locale: PageLocale = defaultPageLocale(),
): string {
  const isPost = kind === "post";
  const title = text(locale, isPost ? M.posts : M.thoughts);
  const path = isPost ? "/posts/" : "/thoughts/";
  return pageHtml({
    site,
    theme,
    locale,
    title,
    activePath: path,
    page: staticPage(locale, path),
    styleHref: styleHref(1 + localeDepth(locale), stylesheet),
    children: (
      <Page
        title={title}
        eyebrow={text(locale, M.archive)}
        description={text(locale, isPost ? M.postsDescription : M.thoughtsDescription)}
      >
        {items.length ? (
          <EntryList>
            {items.map((item) =>
              isPost ? (
                <PostCard item={item} locale={locale} />
              ) : (
                <ThoughtCard item={item} locale={locale} linked />
              ),
            )}
          </EntryList>
        ) : (
          <Text variant="secondary">{text(locale, M.noContent)}</Text>
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
  locale: PageLocale = defaultPageLocale(),
  localeLinks: readonly LocaleLink[] = [],
): string {
  const title = copy.title === undefined ? text(locale, M.notFoundTitle) : locale.copy(copy.title);
  const message =
    copy.message === undefined ? text(locale, M.notFoundMessage) : locale.copy(copy.message);
  const homeLabel =
    copy.homeLabel === undefined ? text(locale, M.notFoundHome) : locale.copy(copy.homeLabel);
  return pageHtml({
    site,
    theme,
    locale,
    title,
    description: message,
    styleHref: styleHref(localeDepth(locale), stylesheet),
    baseHref: locale.isSource ? "/" : `/${locale.segment}/`,
    children: (
      <Page eyebrow="404" title={title} description={message}>
        <Prose>
          <a href={localePath(locale, "/")}>{homeLabel}</a>
        </Prose>
        {localeLinks.length ? (
          <nav aria-label={text(locale, M.languages)}>
            <Inline gap="compact">
              {localeLinks.map((link) => (
                <a href={link.href} lang={link.tag} hreflang={link.tag}>
                  {link.label}
                </a>
              ))}
            </Inline>
          </nav>
        ) : null}
      </Page>
    ),
  });
}

function PostNavigation({
  item,
  posts,
  locale,
}: {
  item: ContentItem;
  posts: ContentItem[];
  locale: PageLocale;
}): Child {
  const index = posts.findIndex((post) => post.slug === item.slug);
  const older = index >= 0 ? posts[index + 1] : undefined;
  const newer = index > 0 ? posts[index - 1] : undefined;
  return (
    <nav className="post-nav" aria-label={text(locale, M.postNavigation)}>
      {older ? (
        <Entry
          eyebrow={
            <span className="site-icon-label">
              <Icon name="chevron-left" size={14} /> {text(locale, M.previousPost)}
            </span>
          }
          title={older.title}
          href={itemUrl(locale, older)}
        />
      ) : (
        <span />
      )}
      {newer ? (
        <Entry
          eyebrow={
            <span className="site-icon-label">
              {text(locale, M.nextPost)} <Icon name="chevron-right" size={14} />
            </span>
          }
          title={newer.title}
          href={itemUrl(locale, newer)}
        />
      ) : (
        <Text variant="caption">{text(locale, M.nothingNewer)}</Text>
      )}
    </nav>
  );
}

function RelatedThoughts({
  item,
  thoughts,
  locale,
}: {
  item: ContentItem;
  thoughts: ContentItem[];
  locale: PageLocale;
}): Child {
  const related = thoughts.filter((thought) => thought.dateKey === item.dateKey).slice(0, 3);
  return related.length ? (
    <Section title={text(locale, M.sameDayThoughts)}>
      <EntryList>
        {related.map((thought) => (
          <ThoughtCard item={thought} locale={locale} linked />
        ))}
      </EntryList>
    </Section>
  ) : null;
}

/**
 * What a reader is told about a translation: that the original changed since, and that nobody
 * has marked it as reviewed. Both link to the original in the source tree.
 */
function TranslationNotices({ item, locale }: { item: ContentItem; locale: PageLocale }): Child {
  const original = item.original;
  if (!original) return null;
  const href = contentUrl(locale, original);
  const parts = { link: (children: Child) => <a href={href}>{children}</a> };
  const stale = item.translationState === "stale";
  const unreviewed = locale.disclosure && translationRecord(item.metadata).reviewed !== true;
  if (!stale && !unreviewed) return null;
  return (
    <div className="translation-notices">
      {stale ? (
        <Text variant="caption">
          <span data-translation="stale">
            {richMessage(locale, M.translationStaleNotice, parts)}
          </span>
        </Text>
      ) : null}
      {unreviewed ? (
        <Text variant="caption">
          <span data-translation="unreviewed">
            {richMessage(locale, M.translationNotice, parts)}
          </span>
        </Text>
      ) : null}
    </div>
  );
}

export function postPage(
  item: ContentItem,
  posts: ContentItem[],
  thoughts: ContentItem[],
  theme: ThemeDefinition = blogTheme,
  site: SiteIdentity = DEFAULT_SITE,
  stylesheet: string = DEFAULT_THEME_STYLESHEET,
  locale: PageLocale = defaultPageLocale(),
): string {
  const category =
    typeof item.metadata.category === "string"
      ? item.metadata.category
      : text(locale, M.postFallbackCategory);
  return pageHtml({
    site,
    theme,
    locale,
    title: item.title,
    description: item.excerpt,
    activePath: "/posts/",
    page: contentPage(locale, item),
    styleHref: styleHref(1 + slugDepth(item.slug) + localeDepth(locale), stylesheet),
    children: (
      <Page title={item.title} eyebrow={category}>
        <TranslationNotices item={item} locale={locale} />
        <ReadingMeta item={item} locale={locale} />
        <Prose
          as="article"
          dangerouslySetInnerHTML={{ __html: withoutLeadingHeading(item.html) }}
        />
        <Tags item={item} />
        <RelatedThoughts item={item} thoughts={thoughts} locale={locale} />
        <PostNavigation item={item} posts={posts} locale={locale} />
      </Page>
    ),
  });
}

export function thoughtPage(
  item: ContentItem,
  theme: ThemeDefinition = blogTheme,
  site: SiteIdentity = DEFAULT_SITE,
  stylesheet: string = DEFAULT_THEME_STYLESHEET,
  locale: PageLocale = defaultPageLocale(),
): string {
  return pageHtml({
    site,
    theme,
    locale,
    title: item.title,
    description: item.excerpt,
    activePath: "/thoughts/",
    page: contentPage(locale, item),
    styleHref: styleHref(1 + slugDepth(item.slug) + localeDepth(locale), stylesheet),
    children: (
      <Page title={item.title} eyebrow={text(locale, M.thought)}>
        <TranslationNotices item={item} locale={locale} />
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
  locale: PageLocale = defaultPageLocale(),
): string {
  const view = siteView(site, locale);
  const about = view.about;
  const depth = localeDepth(locale);
  return pageHtml({
    site,
    theme,
    locale,
    title: text(locale, M.about),
    activePath: "/about/",
    page: staticPage(locale, "/about/"),
    styleHref: styleHref(1 + depth, stylesheet),
    children: (
      <Page eyebrow={text(locale, M.about)} title={about?.heading ?? view.name}>
        <div className="site-avatar" aria-hidden="true">
          {site.images?.about ? (
            <img src={assetHref(1 + depth, site.images.about)} alt="" decoding="async" />
          ) : (
            <span className="avatar-initial">{Array.from(view.name.trim())[0] ?? "M"}</span>
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
          <Section title={about.linksHeading ?? text(locale, M.findMe)}>
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

const strong = (children: Child): Child => <strong>{children}</strong>;
const code = (children: Child): Child => <code>{children}</code>;

function skillUrl(skill: Skill): string {
  return skill.scope === "public" ? `/skills/${skill.slug}/` : `/skills/project/${skill.slug}/`;
}

function skillInstallCommand(site: SiteIdentity, skill: Skill): string {
  return site.skillsPackage
    ? `npx skills add ${site.skillsPackage} --skill ${skill.slug}`
    : skill.sourceBasePath;
}

function SkillCard({
  skill,
  site,
  locale,
}: {
  skill: Skill;
  site: SiteIdentity;
  locale: PageLocale;
}): Child {
  return (
    <Entry
      href={skillUrl(skill)}
      title={skill.name}
      description={skill.description}
      eyebrow={text(
        locale,
        skill.scope === "project" ? M.projectSkillEyebrow : M.publicSkillEyebrow,
      )}
      meta={
        <MetaRow
          items={[
            { label: text(locale, M.markdownFiles, { count: count(skill.files.length) }) },
            { label: text(locale, M.references, { count: count(skill.relations.length) }) },
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

function SkillFileTree({
  skill,
  activePath,
  locale,
}: {
  skill: Skill;
  activePath: string;
  locale: PageLocale;
}): Child {
  return (
    <nav className="skill-files" aria-label={text(locale, M.fileTree, { name: skill.name })}>
      <span className="skill-files-label">{text(locale, M.files)}</span>
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

function SkillRelationGraph({
  skill,
  direction,
  locale,
}: {
  skill: Skill;
  direction: "LR" | "TB";
  locale: PageLocale;
}): Child {
  const graph = layoutSkillGraph(skill, direction);
  const markerId = `skill-arrow-${skill.slug}-${direction.toLowerCase()}`;
  return (
    <svg
      className={`skill-graph-svg skill-graph-${direction.toLowerCase()}`}
      viewBox={`0 0 ${graph.width} ${graph.height}`}
      width={graph.width}
      height={graph.height}
      aria-label={text(locale, M.fileGraph, { name: skill.name })}
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

function SkillRelations({ skill, locale }: { skill: Skill; locale: PageLocale }): Child {
  const reachableFiles = skill.files.filter((file) => file.reachable).length;
  const unreferencedFiles = skill.files.filter((file) => !file.reachable);
  const missingNodes = skill.externalNodes.filter((node) => node.kind === "missing");
  const externalNodes = skill.externalNodes.filter((node) => node.kind === "external");
  const maxDepth = Math.max(0, ...skill.files.map((file) => file.depth ?? 0));
  const hasRelations = skill.relations.length > 0;
  const compactGraph = skill.files.length + skill.externalNodes.length <= 3;
  return (
    <section className="skill-relations" data-skill-view-panel="relations" hidden>
      <div className="skill-reading-summary" aria-label={text(locale, M.summaryLabel)}>
        <span>
          {richMessage(
            locale,
            M.summaryReachable,
            { strong },
            { reachable: count(reachableFiles), total: count(skill.files.length) },
          )}
        </span>
        <span>
          {richMessage(
            locale,
            M.summaryReferences,
            { strong },
            { count: count(skill.relations.length) },
          )}
        </span>
        <span>{richMessage(locale, M.summaryDepth, { strong }, { depth: count(maxDepth) })}</span>
        <span className={missingNodes.length > 0 ? "has-issue" : ""}>
          {richMessage(locale, M.summaryMissing, { strong }, { count: count(missingNodes.length) })}
        </span>
      </div>

      {hasRelations ? (
        <Fragment>
          <div
            className={`skill-graph-canvas${compactGraph ? " compact" : ""}`}
            tabIndex={0}
            role="region"
            aria-label={text(locale, M.graphScroll)}
          >
            <SkillRelationGraph skill={skill} direction="LR" locale={locale} />
          </div>
          <section className="skill-reading-paths" aria-labelledby={`${skill.slug}-paths`}>
            <h3 id={`${skill.slug}-paths`}>{text(locale, M.whereReferences)}</h3>
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
                          {[
                            context.section,
                            ...(context.line
                              ? [text(locale, M.contextLine, { line: count(context.line) })]
                              : []),
                            ...(context.linkText !== relation.label
                              ? [text(locale, M.contextLinkText, { text: context.linkText })]
                              : []),
                            ...(!sourceFile?.reachable ? [text(locale, M.contextUnreachable)] : []),
                          ].join(" · ")}
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
          <strong>{text(locale, M.noReadingPaths)}</strong>
          <p>{richMessage(locale, M.noReadingPathsBody, { code })}</p>
        </div>
      )}

      {unreferencedFiles.length > 0 || missingNodes.length > 0 ? (
        <aside className="skill-reading-issues" aria-label={text(locale, M.issuesLabel)}>
          <strong>{text(locale, M.needsAttention)}</strong>
          {unreferencedFiles.length > 0 ? (
            <p>
              {text(locale, M.unreachableFiles)}
              {unreferencedFiles.map((file) => (
                <code>{file.path}</code>
              ))}
            </p>
          ) : null}
          {missingNodes.length > 0 ? (
            <p>
              {text(locale, M.missingTargets)}
              {missingNodes.map((node) => (
                <code>{node.path}</code>
              ))}
            </p>
          ) : null}
        </aside>
      ) : null}

      {hasRelations ? (
        <div className="skill-graph-status" data-map-status aria-live="polite">
          {text(locale, M.graphStatus, { external: count(externalNodes.length) })}
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
      copyButton.textContent = copyButton.dataset.copiedLabel;
      window.setTimeout(() => { copyButton.textContent = copyButton.dataset.copyLabel; }, 1400);
    });
  });
})();`;

export function skillsIndexPage(
  skills: Skill[],
  theme: ThemeDefinition = blogTheme,
  site: SiteIdentity = DEFAULT_SITE,
  stylesheet: string = DEFAULT_THEME_STYLESHEET,
  locale: PageLocale = defaultPageLocale(),
): string {
  const publicSkills = skills.filter((skill) => skill.scope === "public");
  const projectSkills = skills.filter((skill) => skill.scope === "project");
  return pageHtml({
    site,
    theme,
    locale,
    title: text(locale, M.skills),
    description: text(locale, M.skillsIndexDescription),
    activePath: "/skills/",
    page: sourceOnlyPage(locale, "/skills/"),
    styleHref: styleHref(1 + localeDepth(locale), stylesheet),
    children: (
      <Page
        eyebrow="~/skills"
        title={text(locale, M.skills)}
        description={text(locale, M.skillsIntro)}
      >
        <Section title={text(locale, M.publicSkills)}>
          {publicSkills.length ? (
            <EntryList>
              {publicSkills.map((skill) => (
                <SkillCard skill={skill} site={site} locale={locale} />
              ))}
            </EntryList>
          ) : (
            <Text variant="secondary">{text(locale, M.publicSkillsEmpty)}</Text>
          )}
        </Section>
        {projectSkills.length ? (
          <Section
            title={text(locale, M.projectSkills)}
            description={text(locale, M.projectSkillsDescription)}
          >
            <EntryList>
              {projectSkills.map((skill) => (
                <SkillCard skill={skill} site={site} locale={locale} />
              ))}
            </EntryList>
          </Section>
        ) : null}
        <Text variant="caption">{text(locale, M.referenceGraphNote)}</Text>
      </Page>
    ),
  });
}

export function skillPage(
  skill: Skill,
  theme: ThemeDefinition = blogTheme,
  site: SiteIdentity = DEFAULT_SITE,
  stylesheet: string = DEFAULT_THEME_STYLESHEET,
  locale: PageLocale = defaultPageLocale(),
): string {
  const firstFile = skill.files[0];
  const command =
    skill.scope === "public" ? skillInstallCommand(site, skill) : skill.sourceBasePath;
  return pageHtml({
    site,
    theme,
    locale,
    title: skill.name,
    wide: true,
    description: skill.description,
    activePath: "/skills/",
    page: sourceOnlyPage(locale, skillUrl(skill)),
    styleHref:
      skill.scope === "public"
        ? styleHref(1 + slugDepth(skill.slug) + localeDepth(locale), stylesheet)
        : styleHref(2 + slugDepth(skill.slug) + localeDepth(locale), stylesheet),
    children: (
      <Page
        width="full"
        className="skill-page"
        title={skill.name}
        eyebrow={text(locale, M.skill)}
        description={skill.description}
      >
        <a className="skill-back site-icon-label" href={localePath(locale, "/skills/")}>
          <Icon name="arrow-left" size={14} /> {text(locale, M.allSkills)}
        </a>
        <header className="skill-browser-head">
          <span className="skill-command">
            {skill.scope === "project" ? (
              <span className="skill-scope-badge">{text(locale, M.projectInternal)}</span>
            ) : null}
            <code>{command}</code>
          </span>
          <span className="skill-browser-actions">
            <button
              type="button"
              data-copy-command={command}
              data-copy-label={text(locale, M.copy)}
              data-copied-label={text(locale, M.copied)}
            >
              {text(locale, skill.scope === "public" ? M.copy : M.copyPath)}
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
          <nav className="skill-view-tabs" aria-label={text(locale, M.skillViewMode)}>
            <button type="button" data-skill-view="files" aria-pressed="true">
              {text(locale, M.fileBrowser)}
            </button>
            <button type="button" data-skill-view="relations" aria-pressed="false">
              {text(locale, M.referenceGraph)}
            </button>
          </nav>
          <div className="skill-browser" data-skill-view-panel="files">
            <SkillFileTree skill={skill} activePath={firstFile.path} locale={locale} />
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
          <SkillRelations skill={skill} locale={locale} />
        </div>
        <script dangerouslySetInnerHTML={{ __html: SKILL_BROWSER_SCRIPT }} />
      </Page>
    ),
  });
}

/**
 * One section listing the other languages' agent indexes; empty on a single-locale site. The
 * source tree's index sits at the site root, a target's under its segment.
 */
function agentLanguageLines(locale: PageLocale, file: string): string[] {
  const others = locale.entries.filter((entry) => entry.tag !== locale.tag);
  if (!others.length) return [];
  return [
    `## ${text(locale, M.languages)}`,
    "",
    ...others.map(
      (entry) =>
        `- [${entry.label}](${entry.segment === "" ? `/${file}` : `/${entry.segment}/${file}`})`,
    ),
    "",
  ];
}

export function agentMarkdown(
  posts: ContentItem[],
  thoughts: ContentItem[],
  site: SiteIdentity = DEFAULT_SITE,
  pages?: readonly SitePage[],
  mappedSections = false,
  locale: PageLocale = defaultPageLocale(),
): string {
  const view = siteView(site, locale);
  const t = (message: MessageDescriptor, params?: MessageParams) => text(locale, message, params);
  // The root index marks every original's language; a target's index marks what is not in it.
  const marks = (item: ContentItem): boolean =>
    item.locale !== locale.tag || (locale.isSource && locale.entries.length > 1);
  const languageMark = (item: ContentItem): string => (marks(item) ? ` · ${item.locale}` : "");
  const siteMap = pages
    ? pages.map((page) => `- [${page.title}](${sitePageAgentUrl(page)})`)
    : [
        `- [${t(M.home)}](${localePath(locale, "/")})`,
        `- [${t(M.posts)}](${localePath(locale, "/posts/")})`,
        `- [${t(M.thoughts)}](${localePath(locale, "/thoughts/")})`,
        `- [${t(M.skills)}](${localePath(locale, "/skills/")}) ${t(M.skillsMapNote)}`,
        `- [${t(M.about)}](${localePath(locale, "/about/")})`,
      ];
  const lines = [
    `# ${view.name}`,
    "",
    `> ${t(M.agentIndexSummary)}`,
    "",
    `## ${t(M.siteMap)}`,
    "",
    ...siteMap,
    "",
    `## ${t(M.contentModel)}`,
    "",
    mappedSections
      ? `- ${t(M.thoughtsDescribed)}`
      : `- ${t(M.thoughtsDirectory, { directory: site.contentDirectory })}`,
    mappedSections
      ? `- ${t(M.postsDescribed)}`
      : `- ${t(M.postsDirectory, { directory: site.contentDirectory })}`,
    `- ${t(M.contentFormats)}`,
    `- ${t(M.frontmatterFields)}`,
    "",
    // A consumer that owns the site map owns the routes of its content too.
    ...(pages
      ? []
      : [
          `## ${t(M.publicContent)}`,
          "",
          t(M.publicPosts, { count: count(posts.length) }),
          t(M.publicThoughts, { count: count(thoughts.length) }),
          "",
          `### ${t(M.posts)}`,
          "",
          ...posts.map(
            (post) =>
              `- [${post.title}](${contentUrl(locale, post)}) — ${post.dateKey}${languageMark(post)}`,
          ),
          "",
          `### ${t(M.thoughts)}`,
          "",
          ...thoughts.map(
            (thought) =>
              `- [${thought.title}](${contentUrl(locale, thought)}) — ${thought.dateKey}${languageMark(thought)}`,
          ),
          "",
        ]),
    ...agentLanguageLines(locale, "llms.txt"),
  ];
  return lines.join("\n");
}

export function llmText(
  posts: ContentItem[],
  thoughts: ContentItem[],
  site: SiteIdentity = DEFAULT_SITE,
  pages?: readonly SitePage[],
  agentGuide?: string,
  locale: PageLocale = defaultPageLocale(),
): string {
  // A consumer that owns the site map owns the routes of its content too, so its index follows
  // the llms.txt shape: the summary, the guide, then one section of links per page group.
  if (pages) return consumerLlmText(site, pages, agentGuide, locale);
  const view = siteView(site, locale);
  const t = (message: MessageDescriptor) => text(locale, message);
  const marks = (item: ContentItem): boolean =>
    item.locale !== locale.tag || (locale.isSource && locale.entries.length > 1);
  const languageMark = (item: ContentItem): string => (marks(item) ? ` (${item.locale})` : "");
  const languages = agentLanguageLines(locale, "llms.txt");
  return [
    `# ${view.name}`,
    `> ${view.description}`,
    "",
    `## ${t(M.pages)}`,
    `- ${t(M.home)}: ${localePath(locale, "/")}`,
    `- ${t(M.posts)}: ${localePath(locale, "/posts/")}`,
    `- ${t(M.thoughts)}: ${localePath(locale, "/thoughts/")}`,
    `- ${t(M.skills)}: ${localePath(locale, "/skills/")}`,
    `- ${t(M.about)}: ${localePath(locale, "/about/")}`,
    // A target's agent index sits next to its pages, not at the site root.
    `- ${t(M.agentMarkdown)}: ${locale.segment === "" ? "" : `/${locale.segment}`}/agents.md`,
    "",
    `## ${t(M.posts)}`,
    ...posts.map((post) => `- ${post.title}${languageMark(post)}: ${contentUrl(locale, post)}`),
    "",
    `## ${t(M.thoughts)}`,
    ...thoughts.map(
      (thought) => `- ${thought.title}${languageMark(thought)}: ${contentUrl(locale, thought)}`,
    ),
    "",
    `## ${t(M.rules)}`,
    `- ${t(M.rulePublicOnly)}`,
    `- ${t(M.ruleDrafts)}`,
    // A single-locale site keeps its old byte-for-byte index, without a trailing blank line.
    ...(languages.length ? ["", ...languages] : []),
  ].join("\n");
}

/** The pages by group, in the order each group first appears. */
function pageGroups(pages: readonly SitePage[], defaultGroup: string): [string, SitePage[]][] {
  const groups = new Map<string, SitePage[]>();
  for (const page of pages) {
    const group = page.group ?? defaultGroup;
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
  locale: PageLocale,
): string {
  const view = siteView(site, locale);
  const t = (message: MessageDescriptor) => text(locale, message);
  const full = pages.some((page) => page.markdown !== undefined);
  return [
    `# ${view.name}`,
    "",
    `> ${view.description}`,
    "",
    ...(agentGuide ? [agentGuide.trim(), ""] : []),
    ...pageGroups(pages, t(M.pages)).flatMap(([group, members]) => [
      `## ${group}`,
      "",
      ...members.map(llmLink),
      "",
    ]),
    `## ${t(M.optional)}`,
    "",
    ...(full ? [`- [${t(M.fullText)}](/llms-full.txt): ${t(M.fullTextDescription)}`] : []),
    `- [${t(M.agentMarkdown)}](/agents.md): ${t(M.agentMarkdownDescription)}`,
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
  locale: PageLocale = defaultPageLocale(),
): string | undefined {
  const view = siteView(site, locale);
  const documents = pages.flatMap((page) =>
    page.markdown === undefined
      ? []
      : [`<!-- Source: ${sitePageAgentUrl(page)} -->\n\n${page.markdown.trim()}`],
  );
  if (!documents.length) return undefined;
  return [
    `# ${view.name}`,
    "",
    `> ${view.description}`,
    "",
    ...(agentGuide ? [agentGuide.trim(), ""] : []),
    documents.join("\n\n---\n\n"),
    "",
  ].join("\n");
}
