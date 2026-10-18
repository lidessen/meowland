# Functional icons

`Icon` renders meowtail's finite semantic icon set through native MeowJSX. The SVG geometry is imported from the pinned `lucide` dependency; no paths are copied into this package, except the optical override documented below. Upstream is ISC with inherited Feather MIT icons: the license is preserved in `LUCIDE-LICENSE` and summarized in `THIRD_PARTY_NOTICES.md`.

Use `<Icon name="copy" size={16} />` beside a text label. An icon-only button needs an accessible label on the button. For a standalone meaningful image, provide `label`; otherwise the SVG is decorative. All functional icons use a 24-unit viewBox, currentColor and round joins. SVG presentation attributes provide an 18px size and 2-unit stroke when unthemed; the active theme can override sizing and optical stroke weight through CSS templates using `uiTokens.iconSize` and `uiTokens.iconStroke`. There is no inline style locking these values. Keep brand artwork separate (`MeowlandMark`, `GithubIcon`, `DoodleCat`).

`IconName` and `iconNames` are the finite semantic inventory used by this library and its JSON contracts. For application icons outside that set, `IconSource` renders caller-supplied structural `IconNode` data through the same frame, size, and accessibility rules:

```tsx
import { IconSource } from "meowtail/icons";
import { Bell } from "meowtail/icons/lucide";

<IconSource source={Bell} size={16} label="Notifications" />;
```

`source` is trusted developer input, never untrusted JSON or user-generated markup, and is expected to follow the same 24-unit stroked-outline contract. The pinned Lucide pass-through at `meowtail/icons/lucide` provides the full Lucide surface; its icon names and API belong to Lucide and move only when this package's pinned dependency moves. Bundlers tree-shake unused icons; a native no-bundler import loads the upstream entry as a whole.

`ChatAttachments` uses the shared `file` shape to identify files; `ChatToolCall` uses `chevron-right` for disclosure and `arrow-up-right` for a non-collapsible operation. They remain decorative beside descriptive text. The theme controls geometry and disclosure rotation; these components do not substitute font glyphs for icons.

Import a node from `lucide` in `icon.tsx` and add one key to `shapes` when the library needs a new semantic icon; `IconName` and `iconNames` stay in sync automatically. Keep the dependency version, `LUCIDE-LICENSE`, and `THIRD_PARTY_NOTICES.md` in step with that change. `settings` keeps a local optical override because the upstream gear reads larger and rounder at the standard theme's 16px icon size. The UI Workshop renders the semantic inventory. Existing named icon components remain public convenience entry points for other applications.
