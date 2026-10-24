import type { StoryEntry } from "meowbook";
import { MeowUIComponent, meowUIComponents } from "meowtail/registry";

/** The style binding of component metadata, when it declares one. */
export interface CatalogStyleProps {
  readonly options: { readonly axes: Readonly<Record<string, readonly string[]>> };
  readonly defaults: Readonly<Record<string, string>>;
}

/** The stable identity and display metadata attached to an ordinary component function. */
export interface CatalogMeta {
  readonly name: string;
  readonly parts: readonly string[];
  readonly style?: CatalogStyleProps;
}

/** A registered component as the catalog needs to display it. */
export interface CatalogRegistryEntry {
  readonly name: string;
  readonly meta: CatalogMeta;
}

/** One component the site documents. */
export interface CatalogComponent {
  /** URL segment in kebab case. */
  slug: string;
  /** Site path without a leading slash. */
  path: string;
  /** Display name, as the component registry and the stories spell it. */
  title: string;
  /** Sidebar group the component belongs to. */
  group: string;
  /** Stories that show the component. */
  stories: StoryEntry[];
  /** Stories of other components whose example draws this one, for a component without stories of its own. */
  usedIn: StoryEntry[];
  /** Component metadata, when the component is registered. */
  meta?: CatalogMeta;
  /** One line describing the component, taken from the first story that has one. */
  summary?: string;
}

/** A story that composes several components and therefore has no component of its own. */
export interface CatalogExample {
  slug: string;
  path: string;
  title: string;
  group: string;
  story: StoryEntry;
}

/** One sidebar group of components. */
export interface CatalogGroup {
  label: string;
  order: number;
  components: CatalogComponent[];
}

/** One entry of the sidebar. */
export interface NavigationEntry {
  /** Absolute path with a trailing slash. */
  href: string;
  label: string;
  /** Site path without a leading slash. */
  path: string;
}

/** One sidebar group, holding components and composition examples side by side. */
export interface NavigationGroup {
  label: string;
  order: number;
  entries: NavigationEntry[];
}

/** The whole component reference, derived from the story manifest and the registry. */
export interface Catalog {
  components: CatalogComponent[];
  examples: CatalogExample[];
  groups: CatalogGroup[];
  navigation: NavigationGroup[];
}

/** The group that holds components the stories do not cover yet. */
export const UNCATEGORIZED_GROUP = "Components without examples";

/** The group that holds stories which compose several components. */
export const EXAMPLE_GROUP = "Composition examples";

/** Turn a display name into a URL segment. */
export function kebabCase(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

/** Registered components with finite metadata, projected without importing implementation types. */
function registeredComponents(): CatalogRegistryEntry[] {
  return (
    meowUIComponents as unknown as readonly {
      meta: CatalogMeta;
    }[]
  ).map((component) => ({
    name:
      Object.entries(MeowUIComponent).find(([, name]) => name === component.meta.name)?.[0] ??
      component.meta.name,
    meta: component.meta,
  }));
}

/** The display name of a registered function, keyed by its stable metadata name. */
function displayNames(components: readonly CatalogRegistryEntry[]): Map<string, string> {
  const names = new Map<string, string>();
  for (const component of components) {
    if (!names.has(component.meta.name)) names.set(component.meta.name, component.name);
  }
  return names;
}

/** How many borrowed stories a component without stories of its own shows. */
const USED_IN_LIMIT = 3;

/**
 * The stories whose example draws a component, as JSX or through `h`, or that name it in their
 * `covers` list, which is how a story shows a registered part no public component exposes. Stories that document one
 * component come before composed scenes, then the examples that draw it most often, then the
 * shorter ones, so the first is the one where the component is easiest to see.
 */
function storiesUsing(
  title: string,
  stories: readonly StoryEntry[],
  sourceOf: (story: StoryEntry) => string | undefined,
): StoryEntry[] {
  const pattern = new RegExp(`<${title}[\\s/>]|\\bh\\(${title}\\b`, "g");
  const seen = new Set<string>();
  const matches: { story: StoryEntry; uses: number; length: number }[] = [];
  for (const story of stories) {
    if (seen.has(story.id)) continue;
    const source = sourceOf(story);
    const uses =
      (source?.match(pattern)?.length ?? 0) +
      (story.covers?.filter((entry) => entry === title).length ?? 0);
    if (uses === 0) continue;
    seen.add(story.id);
    matches.push({ story, uses, length: source?.length ?? 0 });
  }
  return matches
    .sort(
      (left, right) =>
        Number(!left.story.component) - Number(!right.story.component) ||
        right.uses - left.uses ||
        left.length - right.length,
    )
    .slice(0, USED_IN_LIMIT)
    .map((match) => match.story);
}

/** The earliest order the stories declare for a group. */
function groupOrders(stories: readonly StoryEntry[]): Map<string, number> {
  const orders = new Map<string, number>();
  for (const story of stories) {
    if (!story.group || story.groupOrder === undefined) continue;
    const current = orders.get(story.group);
    if (current === undefined || story.groupOrder < current)
      orders.set(story.group, story.groupOrder);
  }
  return orders;
}

/**
 * Build the component reference from the story manifest and ordinary component metadata. The
 * manifest decides what is shown and in which group; `.meta` supplies stable names, style axes and
 * DOM parts.
 */
export function buildCatalog(
  stories: readonly StoryEntry[],
  sourceOf: (story: StoryEntry) => string | undefined = () => undefined,
  registry: readonly CatalogRegistryEntry[] = registeredComponents(),
): Catalog {
  const byName = new Map(registry.map((component) => [component.meta.name, component]));
  const byTitle = new Map(registry.map((component) => [component.name, component]));
  const orders = groupOrders(stories);

  const components: CatalogComponent[] = [];
  const examples: CatalogExample[] = [];
  const usedSlugs = new Set<string>();
  const seen = new Set<string>();

  for (const story of stories) {
    if (!story.component) {
      const slug = kebabCase(story.id);
      if (examples.some((example) => example.slug === slug)) continue;
      examples.push({
        slug,
        path: `examples/${slug}`,
        title: story.title,
        group: story.group ?? EXAMPLE_GROUP,
        story,
      });
      continue;
    }
    if (seen.has(story.component)) continue;
    seen.add(story.component);
    const registered = byTitle.get(story.component);
    const base = registered?.meta.name ?? kebabCase(story.component);
    let slug = base;
    let suffix = 2;
    while (usedSlugs.has(slug)) slug = `${base}-${suffix++}`;
    usedSlugs.add(slug);
    components.push({
      slug,
      path: `components/${slug}`,
      title: story.component,
      group: story.group ?? UNCATEGORIZED_GROUP,
      stories: [],
      usedIn: [],
      meta: registered?.meta,
    });
  }

  const byComponent = new Map<string, CatalogComponent>();
  for (const component of components) byComponent.set(component.title, component);
  for (const story of stories) {
    if (!story.component) continue;
    byComponent.get(story.component)?.stories.push(story);
  }
  for (const component of components) {
    component.summary = component.stories.find((story) => story.description)?.description;
  }

  // Registered components the stories do not cover still have metadata worth documenting.
  const covered = new Set(components.map((component) => component.meta?.name));
  const titles = displayNames(registry);
  for (const registered of registry) {
    const name = registered.meta.name;
    if (covered.has(name)) continue;
    let slug = name;
    let suffix = 2;
    while (usedSlugs.has(slug)) slug = `${name}-${suffix++}`;
    usedSlugs.add(slug);
    const title = titles.get(name) ?? registered.name;
    const usedIn = storiesUsing(title, stories, sourceOf);
    components.push({
      slug,
      path: `components/${slug}`,
      title,
      group: usedIn[0]?.group ?? UNCATEGORIZED_GROUP,
      stories: [],
      usedIn,
      meta: byName.get(name)?.meta,
    });
  }

  const groupOrder = (group: string): number => orders.get(group) ?? Number.MAX_SAFE_INTEGER;
  const groups = new Map<string, CatalogComponent[]>();
  for (const component of components) {
    const list = groups.get(component.group);
    if (list) list.push(component);
    else groups.set(component.group, [component]);
  }
  const ordered = [...groups.entries()]
    .map(([label, list]) => ({
      label,
      order: groupOrder(label),
      components: list.sort((left, right) => left.title.localeCompare(right.title)),
    }))
    .sort((left, right) =>
      left.order === right.order ? left.label.localeCompare(right.label) : left.order - right.order,
    );

  const navigation = new Map<string, NavigationGroup>();
  const navigationGroup = (label: string): NavigationGroup => {
    const existing = navigation.get(label);
    if (existing) return existing;
    const created: NavigationGroup = { label, order: groupOrder(label), entries: [] };
    navigation.set(label, created);
    return created;
  };
  for (const group of ordered) {
    const target = navigationGroup(group.label);
    for (const component of group.components) {
      target.entries.push({
        href: `/${component.path}/`,
        label: component.title,
        path: component.path,
      });
    }
  }
  for (const example of examples) {
    const target = navigationGroup(example.group);
    target.entries.push({ href: `/${example.path}/`, label: example.title, path: example.path });
  }

  return {
    components,
    examples,
    groups: ordered,
    navigation: [...navigation.values()].sort((left, right) =>
      left.order === right.order ? left.label.localeCompare(right.label) : left.order - right.order,
    ),
  };
}

/** The style axes of component metadata, with the choices each axis allows. */
export function styleAxes(style?: CatalogStyleProps): {
  axis: string;
  choices: readonly string[];
  default: string;
}[] {
  if (!style) return [];
  return Object.entries(style.options.axes).map(([axis, choices]) => ({
    axis,
    choices,
    default: String(style.defaults[axis]),
  }));
}
