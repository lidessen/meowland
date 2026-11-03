/**
 * What an agent must know before it follows any link in llms.txt. It is short on purpose: each
 * point is a mistake that otherwise costs a first attempt (the wrong npm channel, React habits, a
 * page without its theme), and everything else lives on the pages it links.
 */
export const AGENT_GUIDE = `## Before writing code

- Install the documented line: \`bun add meowtail@dev meowjsx@dev meowcss@dev\` (or \`npm install\` with the same arguments). The \`latest\` tags still point at 0.1.x, which predates the API on this site.
- JSX is MeowJSX, not React. Configure TypeScript with \`"jsx": "react-jsx"\` and \`"jsxImportSource": "meowjsx"\`, or with \`"jsx": "react"\`, \`"jsxFactory": "h"\`, \`"jsxFragmentFactory": "Fragment"\` and \`import { h } from "meowjsx"\` in every \`.tsx\` file. Never import \`react\` or \`react-dom\`.
- A component function runs once per mount. There is no re-render and there are no hooks: keep state in \`signal()\` from \`meowjsx/signal\`, pass the Signal itself (not \`.value\`) to a prop or child to keep it live, and compute with \`derived()\` or \`mapSignal()\`.
- A page needs three steps on one runtime: register components with \`createMeowUI({ components })\`, mount \`standardTheme.cssText\` with \`mountStyles\`, and bind the root with \`applyTheme\`. Missing any one leaves unstyled native controls. The [meowtail page](/packages/meowtail.md) has the complete entry file.
- Use the library before writing markup: \`Stack\`, \`Inline\`, \`Grid\`, \`PageFrame\` and \`Container\` for layout, \`Text\` and \`Prose\` for copy. Where Tailwind would add utility classes, compose \`ui\` class values from \`meowtail/theme\` with \`cx\` from \`meowcss\`; colors, sizes and radii come from \`uiTokens\`, never literals.
- Each component page below is Markdown with the import line, the props table and the code of every example. Read the page before using a component for the first time.
- For a coding agent, install the Meowland skill in the project with \`npx skills add lidessen/meowland --skill meowland\`, or read it at [/skills/meowland/SKILL.md](/skills/meowland/SKILL.md).`;
