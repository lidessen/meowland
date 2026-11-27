# Component contract status

This status table reflects Phase 2 (0 liveness / 0 DOM state violations) and Phase 3 (dedicated stories added for 19 standalone components).

The inventory has 149 entries: 142 registered components plus seven public wrappers or parts not separately registered. There are 74 tracked findings: 0 prop liveness mismatches, 0 legacy DOM state attributes, and 74 missing dedicated story files (mostly sub-parts or components covered in shared stories).

See [the baseline](tests/unit/contract-baseline.json) for machine-readable findings and [the contract](CONTRACT.md) for the target.

| Component                   | Tier | Tracked findings                                       |
| --------------------------- | ---- | ------------------------------------------------------ |
| `accordion`                 | Beta | None detected                                          |
| `action-rail`               | Beta | None detected                                          |
| `action-row`                | Beta | None detected                                          |
| `add-button`                | Beta | Missing story: `add-button.stories.tsx`                |
| `alert`                     | Beta | None detected                                          |
| `app-bar`                   | Beta | None detected                                          |
| `aspect-ratio`              | Beta | Missing story: `aspect-ratio.stories.tsx`              |
| `assistant-composer`        | Beta | Missing story: `assistant-composer.stories.tsx`        |
| `assistant-markdown`        | Beta | Missing story: `assistant-markdown.stories.tsx`        |
| `assistant-question`        | Beta | Missing story: `assistant-question.stories.tsx`        |
| `assistant-steps`           | Beta | Missing story: `assistant-steps.stories.tsx`           |
| `assistant-view`            | Beta | Missing story: `assistant-view.stories.tsx`            |
| `autocomplete`              | Beta | None detected                                          |
| `avatar`                    | Beta | None detected                                          |
| `badge`                     | Beta | Missing story: `badge.stories.tsx`                     |
| `breadcrumb`                | Beta | None detected                                          |
| `button`                    | Beta | Missing story: `button.stories.tsx`                    |
| `card`                      | Beta | None detected                                          |
| `card-action`               | Beta | Missing story: `card-action.stories.tsx`               |
| `card-content`              | Beta | Missing story: `card-content.stories.tsx`              |
| `card-description`          | Beta | Missing story: `card-description.stories.tsx`          |
| `card-footer`               | Beta | Missing story: `card-footer.stories.tsx`               |
| `card-header`               | Beta | Missing story: `card-header.stories.tsx`               |
| `card-title`                | Beta | Missing story: `card-title.stories.tsx`                |
| `chart`                     | Beta | None detected                                          |
| `chat-attachments`          | Beta | Missing story: `chat-attachments.stories.tsx`          |
| `chat-bubble`               | Beta | Missing story: `chat-bubble.stories.tsx`               |
| `chat-composer`             | Beta | Missing story: `chat-composer.stories.tsx`             |
| `chat-conversation`         | Beta | Missing story: `chat-conversation.stories.tsx`         |
| `chat-conversation-latest`  | Beta | Missing story: `chat-conversation-latest.stories.tsx`  |
| `chat-frame`                | Beta | Missing story: `chat-frame.stories.tsx`                |
| `chat-header`               | Beta | None detected                                          |
| `chat-message`              | Beta | None detected                                          |
| `chat-message-actions`      | Beta | Missing story: `chat-message-actions.stories.tsx`      |
| `chat-message-list`         | Beta | Missing story: `chat-message-list.stories.tsx`         |
| `chat-message-list-content` | Beta | Missing story: `chat-message-list-content.stories.tsx` |
| `chat-message-list-date`    | Beta | Missing story: `chat-message-list-date.stories.tsx`    |
| `chat-message-list-item`    | Beta | Missing story: `chat-message-list-item.stories.tsx`    |
| `chat-process`              | Beta | Missing story: `chat-process.stories.tsx`              |
| `chat-question`             | Beta | None detected                                          |
| `chat-reasoning`            | Beta | Missing story: `chat-reasoning.stories.tsx`            |
| `chat-sources`              | Beta | Missing story: `chat-sources.stories.tsx`              |
| `chat-status`               | Beta | Missing story: `chat-status.stories.tsx`               |
| `chat-task`                 | Beta | Missing story: `chat-task.stories.tsx`                 |
| `chat-tool-call`            | Beta | Missing story: `chat-tool-call.stories.tsx`            |
| `checkbox`                  | Beta | Missing story: `checkbox.stories.tsx`                  |
| `choice-group`              | Beta | Missing story: `choice-group.stories.tsx`              |
| `choice-select`             | Beta | None detected                                          |
| `code-block`                | Beta | None detected                                          |
| `command-palette`           | Beta | None detected                                          |
| `composer-panel`            | Beta | None detected                                          |
| `container`                 | Beta | Missing story: `container.stories.tsx`                 |
| `context-menu`              | Beta | None detected                                          |
| `credential-source`         | Beta | None detected                                          |
| `description-item`          | Beta | Missing story: `description-item.stories.tsx`          |
| `description-list`          | Beta | None detected                                          |
| `detail-section`            | Beta | Missing story: `detail-section.stories.tsx`            |
| `dialog`                    | Beta | Missing story: `dialog.stories.tsx`                    |
| `dialog-actions`            | Beta | Missing story: `dialog-actions.stories.tsx`            |
| `dialog-header`             | Beta | Missing story: `dialog-header.stories.tsx`             |
| `dialog-panel`              | Beta | Missing story: `dialog-panel.stories.tsx`              |
| `diff-block`                | Beta | None detected                                          |
| `disclosure`                | Beta | None detected                                          |
| `drawer`                    | Beta | None detected                                          |
| `empty-state`               | Beta | Missing story: `empty-state.stories.tsx`               |
| `entry`                     | Beta | Missing story: `entry.stories.tsx`                     |
| `entry-list`                | Beta | None detected                                          |
| `field`                     | Beta | None detected                                          |
| `field-group`               | Beta | Missing story: `field-group.stories.tsx`               |
| `form`                      | Beta | None detected                                          |
| `grid`                      | Beta | Missing story: `grid.stories.tsx`                      |
| `hover-card`                | Beta | None detected                                          |
| `icon-button`               | Beta | Missing story: `icon-button.stories.tsx`               |
| `icon-rail`                 | Beta | None detected                                          |
| `image-lightbox`            | Beta | None detected                                          |
| `image-preview`             | Beta | None detected                                          |
| `inline`                    | Beta | Missing story: `inline.stories.tsx`                    |
| `input`                     | Beta | Missing story: `input.stories.tsx`                     |
| `item`                      | Beta | None detected                                          |
| `json-block`                | Beta | None detected                                          |
| `json-tree`                 | Beta | None detected                                          |
| `layout-item`               | Beta | Missing story: `layout-item.stories.tsx`               |
| `link`                      | Beta | None detected                                          |
| `list-group`                | Beta | None detected                                          |
| `list-row`                  | Beta | Missing story: `list-row.stories.tsx`                  |
| `markdown`                  | Beta | None detected                                          |
| `menu`                      | Beta | None detected                                          |
| `menu-button`               | Beta | None detected                                          |
| `mermaid-diagram`           | Beta | None detected                                          |
| `meta-row`                  | Beta | None detected                                          |
| `modal`                     | Beta | None detected                                          |
| `nav-item`                  | Beta | Missing story: `nav-item.stories.tsx`                  |
| `nav-list`                  | Beta | None detected                                          |
| `number-input`              | Beta | None detected                                          |
| `output-block`              | Beta | Missing story: `output-block.stories.tsx`              |
| `page`                      | Beta | None detected                                          |
| `page-frame`                | Beta | Missing story: `page-frame.stories.tsx`                |
| `page-header`               | Beta | Missing story: `page-header.stories.tsx`               |
| `pagination`                | Beta | None detected                                          |
| `path-label`                | Beta | Missing story: `path-label.stories.tsx`                |
| `path-picker`               | Beta | None detected                                          |
| `pill`                      | Beta | None detected                                          |
| `popover`                   | Beta | None detected                                          |
| `process-group`             | Beta | None detected                                          |
| `process-step`              | Beta | Missing story: `process-step.stories.tsx`              |
| `progress`                  | Beta | None detected                                          |
| `prose`                     | Beta | Missing story: `prose.stories.tsx`                     |
| `rail-item`                 | Beta | Missing story: `rail-item.stories.tsx`                 |
| `rail-section`              | Beta | Missing story: `rail-section.stories.tsx`              |
| `read-block`                | Beta | Missing story: `read-block.stories.tsx`                |
| `region-layout`             | Beta | None detected                                          |
| `resource-card`             | Beta | Missing story: `resource-card.stories.tsx`             |
| `resource-link`             | Beta | None detected                                          |
| `risk-confirmation`         | Beta | None detected                                          |
| `search-block`              | Beta | None detected                                          |
| `search-input`              | Beta | Missing story: `search-input.stories.tsx`              |
| `section`                   | Beta | None detected                                          |
| `segmented-control`         | Beta | Missing story: `segmented-control.stories.tsx`         |
| `select`                    | Beta | Missing story: `select.stories.tsx`                    |
| `separator`                 | Beta | Missing story: `separator.stories.tsx`                 |
| `shortcut-keys`             | Beta | Missing story: `shortcut-keys.stories.tsx`             |
| `skeleton`                  | Beta | None detected                                          |
| `skeleton-boundary`         | Beta | None detected                                          |
| `slider`                    | Beta | None detected                                          |
| `spinner`                   | Beta | None detected                                          |
| `stack`                     | Beta | Missing story: `stack.stories.tsx`                     |
| `stat`                      | Beta | None detected                                          |
| `state-dot`                 | Beta | Missing story: `state-dot.stories.tsx`                 |
| `status`                    | Beta | None detected                                          |
| `status-dot`                | Beta | None detected                                          |
| `switch`                    | Beta | None detected                                          |
| `table`                     | Beta | None detected                                          |
| `tabs`                      | Beta | None detected                                          |
| `tag`                       | Beta | None detected                                          |
| `task-list`                 | Beta | Missing story: `task-list.stories.tsx`                 |
| `terminal-block`            | Beta | Missing story: `terminal-block.stories.tsx`            |
| `text`                      | Beta | Missing story: `text.stories.tsx`                      |
| `text-shimmer`              | Beta | None detected                                          |
| `textarea`                  | Beta | None detected                                          |
| `timeline`                  | Beta | None detected                                          |
| `timeline-item`             | Beta | Missing story: `timeline-item.stories.tsx`             |
| `toast`                     | Beta | None detected                                          |
| `token-field`               | Beta | None detected                                          |
| `toolbar`                   | Beta | Missing story: `toolbar.stories.tsx`                   |
| `tooltip`                   | Beta | Missing story: `tooltip.stories.tsx`                   |
| `tree-view`                 | Beta | None detected                                          |
| `web-block`                 | Beta | None detected                                          |
| `window-title-bar`          | Beta | None detected                                          |
| `work-card`                 | Beta | None detected                                          |
