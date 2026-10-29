# Functional icons

`Icon` renders meowtail's finite semantic icon set through native MeowJSX. The SVG geometry is imported from the pinned `lucide` dependency; no paths are copied into this package, except the optical override documented below. Upstream is ISC with inherited Feather MIT icons: the license is preserved in `LUCIDE-LICENSE` and summarized in `THIRD_PARTY_NOTICES.md`.

Use `<Icon name="copy" size={16} />` beside a text label. An icon-only button needs an accessible label on the button. For a standalone meaningful image, provide `label`; otherwise the SVG is decorative. All functional icons use a 24-unit viewBox, currentColor and round joins. SVG presentation attributes provide an 18px size and 2-unit stroke when unthemed; the active theme can override sizing and optical stroke weight through CSS templates using `uiTokens.iconSize` and `uiTokens.iconStroke`. There is no inline style locking these values. Keep brand artwork separate (`MeowlandMark`, `GithubIcon`, `EmptyStack`).

## Which icon where

An icon names one intent, and one intent has one icon. Pick by what the reader is looking at or
about to do, never by which picture looks closest. Every name in `iconNames` has a row below; a
new icon joins the set together with its row, and a unit test keeps the two in step.

### Placement

- **Leading, at the start of a row:** what the thing is (its type). It stays in the secondary or
  tertiary ink in every state; a state is a dot or the state badge, never a recolored icon.
- **Trailing, at the end of a row:** what a click does (disclose, go, open elsewhere). One per row.
- **Icon-only buttons** carry an accessible name (`IconButton label`).
- **No icon** on ordinary text buttons (only add, send and attach-style actions take one), in titles,
  badges or running prose, and never the same icon repeated on every row of one list.
- **Size:** 16px beside body text, 14px in compact rows (tool rows, process steps), 18px for a
  large entry. Theme roles: `uiTokens.icon.size`, `icon.small`, `icon.large`.

### Things (leading)

| Intent                                                          | Icon             |
| --------------------------------------------------------------- | ---------------- |
| A file as an object: an attachment, a path, a file list entry   | `file`           |
| A document whose text is read: notes, records, a read tool      | `file-text`      |
| A directory or a group of items                                 | `folder`         |
| An expanded directory; browsing directories                     | `folder-open`    |
| Stored data, an index or a query tool                           | `database`       |
| A service, a connection or a network request tool               | `network`        |
| A command, a shell or a run-command tool                        | `terminal`       |
| Searching: a search field, action or tool                       | `search`         |
| A capability of unknown type (the default tool glyph)           | `box`            |
| A conversation or messages                                      | `message-square` |
| A plan, a task list or a checklist                              | `list-checks`    |
| A catalog or workbench of pages                                 | `notebook-tabs`  |
| A route or an overview map                                      | `map`            |
| A person                                                        | `user-round`     |
| Memory, knowledge or reasoning                                  | `brain`          |
| A permission or a verified policy                               | `shield-check`   |
| A meter, a budget or usage                                      | `gauge`          |
| A duration or a schedule                                        | `timer`          |
| Earlier items: message history, recent activity                 | `history`        |
| Voice input                                                     | `mic`            |
| Settings and preferences                                        | `settings`       |
| Repairing or maintaining a configuration (never a tool default) | `wrench`         |

### Actions (trailing or icon buttons)

| Intent                                                   | Icon             |
| -------------------------------------------------------- | ---------------- |
| Add                                                      | `plus`           |
| Decrease one step                                        | `minus`          |
| Close, dismiss, remove an attachment or a token          | `x`              |
| Copy                                                     | `copy`           |
| Done or chosen: copied, a checked menu item              | `check`          |
| Retry, reload, refresh                                   | `refresh-cw`     |
| Attach files                                             | `paperclip`      |
| Send                                                     | `arrow-up`       |
| Stop a running response                                  | `square`         |
| Pause                                                    | `circle-pause`   |
| Open elsewhere: a link out, a new window, a resource row | `arrow-up-right` |
| Go forward into a detail in the same view                | `arrow-right`    |
| Go back                                                  | `arrow-left`     |
| Jump to the latest, scroll down                          | `arrow-down`     |
| Preview, show                                            | `eye`            |
| Good reply                                               | `thumbs-up`      |
| Bad reply                                                | `thumbs-down`    |
| Open a navigation menu                                   | `menu`           |
| A list layout or an outline                              | `list`           |
| Show or hide the side panel                              | `panel-left`     |

### Disclosure and feedback

| Intent                                                                     | Icon            |
| -------------------------------------------------------------------------- | --------------- |
| Disclose content (the theme rotates it when open); step forward in a pager | `chevron-right` |
| Open a select or menu trigger                                              | `chevron-down`  |
| Collapse upward, step up                                                   | `chevron-up`    |
| Step back in a pager or carousel                                           | `chevron-left`  |
| Work in progress inside a control, where a dot cannot sit                  | `loader-circle` |
| A problem beside its words: a failed load, a field error notice            | `circle-alert`  |

`IconName` and `iconNames` are the finite semantic inventory used by this library and its JSON contracts. For application icons outside that set, `IconSource` renders caller-supplied structural `IconNode` data through the same frame, size, and accessibility rules:

```tsx
import { IconSource } from "meowtail/icons";
import { Bell } from "meowtail/icons/lucide";

<IconSource source={Bell} size={16} label="Notifications" />;
```

`source` is trusted developer input, never untrusted JSON or user-generated markup, and is expected to follow the same 24-unit stroked-outline contract. The pinned Lucide pass-through at `meowtail/icons/lucide` provides the full Lucide surface; its icon names and API belong to Lucide and move only when this package's pinned dependency moves. Bundlers tree-shake unused icons; a native no-bundler import loads the upstream entry as a whole.

`ChatAttachments` uses the shared `file` shape to identify files; `ChatToolCall` uses `chevron-right` for disclosure and `arrow-up-right` for a non-collapsible operation. They remain decorative beside descriptive text. The theme controls geometry and disclosure rotation; these components do not substitute font glyphs for icons.

Import a node from `lucide` in `icon.tsx` and add one key to `shapes` when the library needs a new semantic icon; `IconName` and `iconNames` stay in sync automatically. Keep the dependency version, `LUCIDE-LICENSE`, and `THIRD_PARTY_NOTICES.md` in step with that change. `settings` keeps a local optical override because the upstream gear reads larger and rounder at the standard theme's 16px icon size. The UI Workshop renders the semantic inventory. Existing named icon components remain public convenience entry points for other applications.
