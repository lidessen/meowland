import { defineMessages } from "meowjsx/i18n";

/**
 * Every user-visible sentence of the built-in theme, in English. The theme's interface source
 * language is always `en`; a site fills `locales/<tag>.json` for every other locale it publishes.
 *
 * Add a sentence here before using it: the theme refuses, at build time, a message that is not
 * in this table (see `createThemeI18n`). Counts are passed as strings so digits stay ungrouped,
 * exactly as the English pages have always printed them; a translation may still use `plural`.
 */
export const themeMessages = defineMessages({
  // Chrome
  skipLink: {
    source: "Skip to content",
    note: "Skip link for keyboard and screen reader users; moves focus to the main content.",
  },
  primaryNavigation: {
    source: "Primary navigation",
    note: "Accessible name of the main site navigation, not visible on screen.",
  },
  languages: {
    source: "Languages",
    note: "Accessible name of the list of links to the site in other languages.",
  },
  home: { source: "Home", note: "Link to the front page of the site." },
  posts: { source: "Posts", note: "Long-form articles. Also the name of the posts archive." },
  thoughts: {
    source: "Thoughts",
    note: "Short notes, shorter than posts. Also the name of the thoughts archive.",
  },
  skills: { source: "Skills", note: "Agent skills: documented methods an AI agent can follow." },
  about: { source: "About", note: "Page about the site author. Also its small heading label." },
  footerCopyright: {
    source: "© {year} {name}",
    note: "Footer line. The year is a plain number, the name is the site name.",
  },

  // Home and archives
  journal: { source: "Journal", note: "Small label above the site name on the front page." },
  filterHome: {
    source: "Filter home feed",
    note: "Accessible name of the buttons that filter the front page by content type.",
  },
  filterAll: { source: "All", note: "Filter button that shows every kind of entry." },
  noContent: { source: "No public content yet.", note: "Shown when a list has no entries." },
  undated: { source: "Undated", note: "Heading of entries that have no usable date." },
  dateWeekday: {
    source: "{year} {weekday}",
    note: "Line under a day heading: the year and the abbreviated weekday, for example 2026 Tue.",
  },
  archive: { source: "Archive", note: "Small label above the title of a list page." },
  postsDescription: {
    source: "Complete arguments grown from fragments.",
    note: "Subtitle of the posts archive.",
  },
  thoughtsDescription: {
    source: "Short, trimmed thoughts ready to show as they are.",
    note: "Subtitle of the thoughts archive.",
  },

  // Entries and articles
  thoughtEntryEyebrow: {
    source: "{when} · Thought",
    note: "Small line above a thought in a list: a time or a date, then the kind of entry.",
  },
  thought: { source: "Thought", note: "Kind of entry: one short note." },
  postFallbackCategory: {
    source: "Post",
    context: "content type",
    note: "Used as the category label of a post that sets none; a noun, not a verb.",
  },
  noSummary: {
    source: "This post has no summary yet.",
    note: "Placeholder for a missing excerpt.",
  },
  minRead: {
    source: "{minutes} min read",
    note: "Reading time. The number is passed as text; use plural forms if the language needs them.",
  },
  characters: {
    source: "{count} characters",
    note: "Length of a post in characters. The number is passed as text; use plural forms if needed.",
  },
  postNavigation: {
    source: "Post navigation",
    note: "Accessible name of the links to the previous and next post.",
  },
  previousPost: {
    source: "Previous post (older)",
    note: "Link label: the post published before this one.",
  },
  nextPost: { source: "Next post (newer)", note: "Link label: the post published after this one." },
  nothingNewer: {
    source: "Nothing newer — this is the latest post.",
    note: "Shown instead of a next-post link on the newest post.",
  },
  sameDayThoughts: {
    source: "Thoughts from the same day",
    note: "Heading above short notes written on the date of a post.",
  },

  // About and 404
  findMe: {
    source: "Find me",
    note: "Default heading above the author's profile links, for example GitHub.",
  },
  notFoundTitle: { source: "Page not found", note: "Title of the 404 page." },
  notFoundMessage: {
    source: "This page may have moved or been removed.",
    note: "Explanation on the 404 page.",
  },
  notFoundHome: { source: "Back to home", note: "Link on the 404 page to the front page." },

  // Skills index
  skillsIndexDescription: {
    source: "Methods and working conventions that can be handed to an Agent.",
    note: "Meta description of the skills index page.",
  },
  skillsIntro: {
    source: "Methods shared publicly and usable directly by an Agent.",
    note: "Subtitle of the skills index page.",
  },
  publicSkills: { source: "Public Skills", note: "Heading of skills published for anyone." },
  publicSkillsEmpty: {
    source: "Public Skills have no content yet.",
    note: "Shown when there are no public skills.",
  },
  projectSkills: { source: "Project Skills", note: "Heading of skills used inside this project." },
  projectSkillsDescription: {
    source: "Development and content workflows used inside this project",
    note: "Subtitle under the project skills heading.",
  },
  referenceGraphNote: {
    source:
      "The reference graph starts from SKILL.md and is generated at build time from Markdown links.",
    note: "Footnote of the skills index. SKILL.md is a file name and stays as written.",
  },
  publicSkillEyebrow: { source: "Public Skill", note: "Kind label on a skill card." },
  projectSkillEyebrow: { source: "Project Skill", note: "Kind label on a skill card." },
  markdownFiles: {
    source: "{count} Markdown files",
    note: "Number of Markdown files in a skill. The number is passed as text.",
  },
  references: {
    source: "{count} references",
    note: "Number of links between the files of a skill. The number is passed as text.",
  },

  // Skill page
  skill: { source: "Skill", note: "Small label above the title of a skill page." },
  allSkills: { source: "All Skills", note: "Link from a skill page back to the skills index." },
  projectInternal: {
    source: "Project Skill · Internal",
    note: "Badge on a skill that belongs to the project and is not published for install.",
  },
  copy: {
    source: "Copy",
    context: "button",
    note: "Button that copies the install command to the clipboard; a verb.",
  },
  copyPath: {
    source: "Copy path",
    note: "Button that copies the source path of a project skill to the clipboard.",
  },
  copied: {
    source: "Copied",
    note: "Feedback shown on the copy button for a moment after it copied; past tense.",
  },
  skillViewMode: {
    source: "Skill view mode",
    note: "Accessible name of the tabs that switch between the file browser and the graph.",
  },
  fileBrowser: { source: "File browser", note: "Tab: browse the files of a skill." },
  referenceGraph: { source: "Reference graph", note: "Tab: show which file links to which." },
  files: { source: "Files", note: "Label above the file tree of a skill." },
  fileTree: {
    source: "{name} file tree",
    note: "Accessible name of the file tree; the name is the skill name.",
  },
  fileGraph: {
    source: "{name} file reference graph",
    note: "Accessible name of the graph drawing; the name is the skill name.",
  },
  graphScroll: {
    source: "Scrollable file reference graph",
    note: "Accessible name of the scrollable region that holds the graph.",
  },
  summaryLabel: {
    source: "Reading structure summary",
    note: "Accessible name of the four counts above the graph.",
  },
  summaryReachable: {
    source: "<strong>{reachable}/{total}</strong>reachable docs",
    note: "Count of files an agent can reach from SKILL.md out of all files. Keep the tag around the numbers.",
  },
  summaryReferences: {
    source: "<strong>{count}</strong> references",
    note: "Count of links between files. Keep the tag around the number.",
  },
  summaryDepth: {
    source: "<strong>{depth}</strong> max depth",
    note: "Deepest chain of links from SKILL.md. Keep the tag around the number.",
  },
  summaryMissing: {
    source: "<strong>{count}</strong> missing targets",
    note: "Count of links that point to files which do not exist. Keep the tag around the number.",
  },
  whereReferences: {
    source: "Where references happen",
    note: "Heading above the list of links between files.",
  },
  contextLine: {
    source: "line {line}",
    note: "Position of a link inside a file; the number is a line number.",
  },
  contextLinkText: {
    source: '"{text}"',
    note: "The visible text of a link, shown in quotation marks; use the quotation marks of the language.",
  },
  contextUnreachable: {
    source: "entry unreachable",
    note: "Marks a link found in a file that cannot be reached from SKILL.md.",
  },
  noReadingPaths: {
    source: "No cross-file reading paths",
    note: "Heading shown when no file of the skill links to another file.",
  },
  noReadingPathsBody: {
    source:
      "Once the Agent enters, it only reads <code>SKILL.md</code>. If other reference material must be read, link it explicitly from the relevant sections with Markdown links.",
    note: "Keep the code tag around the file name SKILL.md.",
  },
  issuesLabel: {
    source: "Information structure issues",
    note: "Accessible name of the box that lists problems found in a skill.",
  },
  needsAttention: { source: "Needs attention", note: "Heading of the box that lists problems." },
  unreachableFiles: {
    source: "Unreachable from the entry:",
    note: "Followed by file names that SKILL.md does not link to, directly or indirectly.",
  },
  missingTargets: {
    source: "Missing link targets:",
    note: "Followed by file names that are linked but do not exist.",
  },
  graphStatus: {
    source:
      "Select a node in the graph to see its role in the reading chain{external, plural, =0 {} other {; {external} targets outside the Skill currently}}.",
    note: "Status line under the graph. The part after the semicolon appears only when links leave the skill.",
  },

  // Markdown indexes for agents
  agentIndexSummary: {
    source: "Site index and content conventions for Agents to read.",
    note: "Opening line of agents.md, written for an AI agent.",
  },
  siteMap: { source: "Site map", note: "Heading of the list of site sections in agents.md." },
  skillsMapNote: {
    source: "(browse files and the auto-generated Markdown reference graph)",
    note: "Parenthetical remark after the Skills link in agents.md; keep the parentheses.",
  },
  contentModel: {
    source: "Content model",
    note: "Heading of the section describing content files.",
  },
  thoughtsDescribed: {
    source: "Thoughts are trimmed, directly presentable notes.",
    note: "Content model line when the content directories are mapped by the host.",
  },
  postsDescribed: {
    source:
      "Posts are full articles. Post files whose name or path segment starts with `_` are drafts.",
    note: "Content model line when the content directories are mapped by the host. Keep the backticks.",
  },
  thoughtsDirectory: {
    source: "`{directory}/thoughts/` stores trimmed, directly presentable short thoughts.",
    note: "Content model line. The directory is a path and stays as written; keep the backticks.",
  },
  postsDirectory: {
    source:
      "`{directory}/posts/` stores full posts; files whose name or path segment starts with `_` are drafts and are not published or rendered.",
    note: "Content model line. The directory is a path and stays as written; keep the backticks.",
  },
  contentFormats: {
    source: "Content files support `.md` and `.mdx`, and may start with YAML frontmatter.",
    note: "Content model line. Keep the backticks and the file extensions.",
  },
  frontmatterFields: {
    source:
      "Frontmatter currently has no required fields; `title`, `date`, `created_at`, `category` and `tags` are recognized by the site.",
    note: "Content model line. The field names in backticks are code and stay as written.",
  },
  publicContent: { source: "Public content", note: "Heading of the list of published entries." },
  publicPosts: {
    source: "Public posts: {count}.",
    note: "Number of published posts. The number is passed as text.",
  },
  publicThoughts: {
    source: "Public thoughts: {count}.",
    note: "Number of published thoughts. The number is passed as text.",
  },
  pages: {
    source: "Pages",
    note: "Heading of the list of pages in llms.txt, and the name of the default group of pages.",
  },
  agentMarkdown: {
    source: "Agent Markdown",
    note: "Name of the agents.md file: the site map written for AI agents.",
  },
  rules: { source: "Rules", note: "Heading of the list of rules in llm.txt." },
  rulePublicOnly: {
    source: "Only the public build output is considered presentable content.",
    note: "A rule in llm.txt for AI agents.",
  },
  ruleDrafts: {
    source: "Drafts whose names start with _ under posts are not published or rendered.",
    note: "A rule in llm.txt for AI agents. The underscore is a literal character.",
  },
  optional: {
    source: "Optional",
    note: "Heading of the list of less important links in llms.txt.",
  },
  fullText: {
    source: "Full text",
    note: "Name of llms-full.txt: every page as Markdown in one file.",
  },
  fullTextDescription: {
    source: "every page linked here as Markdown, in one file; large, so fetch single pages first",
    note: "Description after the Full text link in llms.txt, written for an AI agent.",
  },
  agentMarkdownDescription: {
    source: "the site map",
    note: "Description after the Agent Markdown link in llms.txt.",
  },
});

/** One declared theme message. */
export type ThemeMessage = (typeof themeMessages)[keyof typeof themeMessages];
