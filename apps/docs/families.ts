import { readFile } from "node:fs/promises";
import { join } from "node:path";

/** One public member of a component family, as the Meowtail catalog lists it. */
export interface FamilyMember {
  /** The export name. */
  name: string;
  /** The familiar task term the catalog links the member under, such as "Radio group". */
  term: string;
  /** The member this one is a part of, when its name extends another member of the same family. */
  parent?: string;
}

/** One category of the Meowtail catalog, such as "Forms and selection", with its members in order. */
export interface FamilyCategory {
  label: string;
  members: FamilyMember[];
}

/** Where the Meowtail catalog keeps the component grouping the site follows. */
export const FAMILIES_FILE = "packages/meowtail/COMPONENTS.md";

const SECTION = "## Current component families";

/**
 * Read the categories and families of the Meowtail component catalog. The catalog owns the
 * grouping; the site only follows it. Each `###` heading under "Current component families" is a
 * category, and each table row is one family: a linked task term followed by its export names.
 */
export function parseFamilies(markdown: string): FamilyCategory[] {
  const start = markdown.indexOf(SECTION);
  if (start < 0) return [];
  const body = markdown.slice(start + SECTION.length);
  const end = body.search(/^## /m);
  const section = end < 0 ? body : body.slice(0, end);

  const categories: FamilyCategory[] = [];
  for (const line of section.split("\n")) {
    const heading = /^### (.+)$/.exec(line);
    if (heading) {
      categories.push({ label: heading[1]!.trim(), members: [] });
      continue;
    }
    const category = categories.at(-1);
    if (!category || !line.startsWith("|")) continue;
    const cell = line.split("|")[1] ?? "";
    const family: FamilyMember[] = [];
    let term = "";
    for (const match of cell.matchAll(/(?:\[([^\]]+)\]\([^)]*\):\s*)?`([A-Za-z][A-Za-z0-9]*)`/g)) {
      if (match[1]) term = match[1];
      family.push({ name: match[2]!, term: term || match[2]! });
    }
    family.forEach((member, index) => {
      // A part extends the name of an owner listed before it: CardHeader belongs to Card,
      // DialogPanel to Dialog, while EntryList, listed before Entry, is not a part of it.
      const owner = family
        .slice(0, index)
        .filter((other) => member.name.startsWith(other.name))
        .sort((left, right) => right.name.length - left.name.length)[0];
      if (owner) member.parent = owner.name;
    });
    category.members.push(...family);
  }
  return categories.filter((category) => category.members.length > 0);
}

/** Read the families from the workspace; an absent catalog leaves the story groups in charge. */
export async function readFamilies(root: string): Promise<FamilyCategory[]> {
  try {
    return parseFamilies(await readFile(join(root, FAMILIES_FILE), "utf8"));
  } catch {
    return [];
  }
}

const ACRONYMS: Record<string, string> = { Json: "JSON" };

/**
 * The reading form of a component name: CardAction becomes "Card Action", output-block becomes
 * "Output Block". Names that are already phrases keep their words and gain capitals.
 */
export function displayName(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => {
      const capital = word[0]!.toUpperCase() + word.slice(1);
      return ACRONYMS[capital] ?? capital;
    })
    .join(" ");
}
