# Functional icons

`Icon` renders a local subset of [Lucide](https://github.com/lucide-icons/lucide/tree/main/icons) using native MeowJSX. SVG paths were retrieved from the official repository on 2026-09-21, with no runtime dependency. The upstream [license](https://github.com/lucide-icons/lucide/blob/main/LICENSE) is preserved in `LUCIDE-LICENSE` (ISC and inherited Feather MIT).

Use `<Icon name="copy" size={16} />` beside a text label. An icon-only button needs an accessible label on the button. For a standalone meaningful image, provide `label`; otherwise the SVG is decorative. All functional icons use a 24-unit viewBox, currentColor and round joins. SVG presentation attributes provide an 18px size and 2-unit stroke when unthemed; the active theme can override sizing and optical stroke weight through CSS templates using `uiTokens.iconSize` and `uiTokens.iconStroke`. There is no inline style locking these values. Keep brand artwork separate (`MeowlandMark`, `GithubIcon`, `DoodleCat`).

`ChatAttachments` uses the shared `file` shape to identify files; `ChatToolCall` uses `chevron-right` for disclosure and `arrow-up-right` for a non-collapsible operation. They remain decorative beside descriptive text. The theme controls geometry and disclosure rotation; these components do not substitute font glyphs for icons.

Add only needed official SVG shapes to `icon.tsx`; `IconName` and `iconNames` stay in sync automatically. The UI Workshop renders that inventory. Existing named icon components remain public convenience entry points for other applications.
