/** A profile link shown on the About page (e.g. a GitHub account). */
export interface SiteProfileLink {
  /** Service label, e.g. `GitHub`. */
  label: string;
  /** Visible handle, e.g. `@name`. */
  handle: string;
  href: string;
}

export interface SiteAbout {
  /** Page heading. */
  heading: string;
  paragraphs: readonly string[];
  /** Heading above the profile links. */
  linksHeading?: string;
  links?: readonly SiteProfileLink[];
}

/** Optional copy for the built-in 404 page. */
export interface SiteNotFound {
  title?: string;
  message?: string;
  homeLabel?: string;
}

/** Site-owned identity and copy. The application supplies it; the library keeps neutral defaults. */
export interface SiteIdentity {
  /** Display name used in header, footer and document titles. */
  name: string;
  /** Stable `data-site` value. */
  id: string;
  description: string;
  /** `npx skills add <package>` source for public Skills; when absent the source path is shown. */
  skillsPackage?: string;
  /** Repository tree URL that Skill source paths resolve against; when absent no source link is shown. */
  repositorySourceUrl?: string;
  /** Content directory described in the agent-facing index, e.g. `apps/blog/content`. */
  contentDirectory: string;
  /** Optional artwork paths relative to the content assets root, e.g. `images/cover.png`. */
  images?: {
    hero?: string;
    feed?: string;
    about?: string;
  };
  about?: SiteAbout;
  /**
   * Public origin of the site, without a path: `https://example.com`. It is validated and stored
   * without a trailing slash; later releases use it for absolute alternate and canonical links.
   */
  url?: string;
  /**
   * IANA time zone that turns a date with a time into a day key and an `HH:mm` label. Defaults to
   * `Asia/Shanghai`, the value earlier releases hard-coded, so existing day keys do not move.
   */
  timeZone?: string;
}

/** The time zone date keys and time labels use when a site sets none. */
export const DEFAULT_TIME_ZONE = "Asia/Shanghai";

export const DEFAULT_SITE: SiteIdentity = {
  name: "Meowpress site",
  id: "meowpress",
  description: "A mixed timeline of long-form posts and fragmentary thoughts.",
  contentDirectory: "content",
};
