import { h, keyed, type Context, type Props } from "meowjsx";
import { derived, signal, unwrap, type MaybeSignal } from "meowjsx/signal";
import { Icon, type IconName } from "../icons/icon";
import { activeElementInRoot, elementByIdInRoot } from "../shared/dom-root";
import { elementId } from "../shared/element-id";
import { ShortcutKeys } from "./shortcut-keys";

export interface CommandPaletteCommand {
  /** Unique in the list; reported to onRun. */
  id: string;
  label: string;
  /** Commands of one group are shown together, groups in order of first appearance. */
  group?: string;
  /** Extra words the query matches, such as synonyms. */
  keywords?: readonly string[];
  /** Effective key labels, owned by the host (for example ["⌘", "K"]). */
  shortcut?: readonly string[];
  icon?: IconName;
  /** Shown and skipped by the arrow keys; never runs. */
  disabled?: boolean;
}

export interface CommandPaletteProps extends Props {
  /** Required; the host owns the state and registers the shortcut that opens it. */
  open: MaybeSignal<boolean>;
  /** Called with false when the reader dismisses the palette or runs a command. */
  onOpenChange: (open: boolean) => void;
  commands: MaybeSignal<readonly CommandPaletteCommand[]>;
  /** Called after the palette has closed and focus has returned to the opener. */
  onRun: (id: string) => void;
  /** Accessible name of the dialog. */
  label?: string;
  searchLabel?: string;
  placeholder?: string;
  emptyMessage?: string;
  /** The polite count announced as the query changes. */
  resultsMessage?: (count: number) => string;
  className?: Props["className"];
}

interface CommandGroup {
  key: string;
  name: string | undefined;
  commands: readonly CommandPaletteCommand[];
}

/** Groups in order of first appearance; ungrouped commands form their own unnamed group. */
function groupCommands(commands: readonly CommandPaletteCommand[]): CommandGroup[] {
  const groups = new Map<string, CommandGroup & { commands: CommandPaletteCommand[] }>();
  for (const command of commands) {
    const key = command.group === undefined ? "" : `group:${command.group}`;
    let group = groups.get(key);
    if (!group) groups.set(key, (group = { key, name: command.group, commands: [] }));
    group.commands.push(command);
  }
  return [...groups.values()];
}

/** Every query term must appear in the label, the group or a keyword. */
export function commandMatches(command: CommandPaletteCommand, query: string): boolean {
  const text = [command.label, command.group ?? "", ...(command.keywords ?? [])]
    .join(" ")
    .toLocaleLowerCase();
  return query
    .toLocaleLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => text.includes(term));
}

/** Search the host's commands, run one, and give focus back to where the reader was. */
export function CommandPalette(
  {
    open,
    onOpenChange,
    commands,
    onRun,
    label = "Command palette",
    searchLabel = "Search commands",
    placeholder = "Type a command",
    emptyMessage = "No matching commands",
    resultsMessage = (count) => (count === 1 ? "1 command" : `${count} commands`),
    className,
    ref,
    ...props
  }: CommandPaletteProps,
  context: Context<typeof CommandPalette>,
) {
  const base = elementId("command-palette");
  const listId = `${base}-list`;
  const query = signal("");
  const chosen = signal<string | undefined>(undefined);
  let dialog: HTMLDialogElement | undefined;
  let input: HTMLInputElement | undefined;
  let opener: HTMLElement | null = null;
  let pending: string | undefined;
  let alive = true;
  context.onCleanup(() => {
    alive = false;
  });

  const groups = derived(() => groupCommands(unwrap(commands)));
  const matching = derived(() => {
    const text = query.value;
    return groups.value.flatMap((group) =>
      group.commands.filter((command) => commandMatches(command, text)),
    );
  });
  const enabled = derived(() => matching.value.filter((command) => !command.disabled));
  // The chosen command while it still matches, else the first enabled match.
  const active = derived(() => {
    const ids = enabled.value.map((command) => command.id);
    return chosen.value !== undefined && ids.includes(chosen.value) ? chosen.value : ids[0];
  });
  const optionId = (id: string) => `${base}-option-${id}`;

  const restoreOpener = () => {
    const target = opener;
    opener = null;
    if (target?.isConnected) target.focus();
  };
  const sync = () => {
    if (!alive || !dialog?.isConnected) return;
    if (unwrap(open)) {
      if (dialog.open) return;
      const focused = activeElementInRoot(dialog);
      opener = focused instanceof HTMLElement && !dialog.contains(focused) ? focused : null;
      query.value = "";
      chosen.value = undefined;
      if (input) input.value = "";
      dialog.showModal();
      input?.focus();
    } else if (dialog.open) {
      dialog.close();
    }
  };
  context.effect(() => {
    unwrap(open);
    sync();
  });

  const run = (id: string) => {
    const command = unwrap(commands).find((candidate) => candidate.id === id);
    if (!command || command.disabled || !dialog?.open) return;
    // Close first, so focus is back with the opener before the command moves it anywhere.
    pending = id;
    dialog.close();
  };
  const move = (step: 1 | -1) => {
    const ids = enabled.value.map((command) => command.id);
    if (ids.length === 0) return;
    const index = ids.indexOf(active.value ?? "");
    const next = ids[(index + step + ids.length) % ids.length]!;
    chosen.value = next;
    queueMicrotask(() => {
      if (alive && dialog)
        elementByIdInRoot(dialog, optionId(next))?.scrollIntoView?.({ block: "nearest" });
    });
  };

  return (
    <div {...props} className={className} ref={[context.parts.root, ref]}>
      <dialog
        aria-label={label}
        onCancel={(event: Event) => {
          // Dismissal goes through the owner, like Modal.
          event.preventDefault();
          if (alive) onOpenChange(false);
        }}
        onClose={() => {
          if (!alive) return;
          restoreOpener();
          if (unwrap(open)) onOpenChange(false);
          const id = pending;
          pending = undefined;
          if (id !== undefined) onRun(id);
        }}
        onClick={(event: MouseEvent) => {
          // A backdrop click targets the dialog element itself.
          if (alive && event.target === event.currentTarget) onOpenChange(false);
        }}
        ref={[
          context.parts.dialog,
          (element: HTMLDialogElement) => {
            dialog = element;
            queueMicrotask(sync);
            return () => {
              if (element.open) element.close();
              dialog = undefined;
            };
          },
        ]}
      >
        <div ref={context.parts.search}>
          <span aria-hidden="true" ref={context.parts.searchIcon}>
            <Icon name="search" />
          </span>
          <input
            type="text"
            role="combobox"
            aria-label={searchLabel}
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={derived(() =>
              active.value === undefined ? undefined : optionId(active.value),
            )}
            placeholder={placeholder}
            autoComplete="off"
            spellcheck="false"
            onInput={(event: Event) => {
              query.value = (event.currentTarget as HTMLInputElement).value;
              chosen.value = undefined;
            }}
            onKeyDown={(event: KeyboardEvent) => {
              if (event.isComposing) return;
              if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                move(event.key === "ArrowDown" ? 1 : -1);
              } else if (event.key === "Enter") {
                event.preventDefault();
                if (active.value !== undefined) run(active.value);
              }
            }}
            ref={[
              context.parts.input,
              (element: HTMLInputElement) => {
                input = element;
              },
            ]}
          />
        </div>
        <div id={listId} role="listbox" aria-label={label} ref={context.parts.list}>
          {keyed(
            groups,
            (group) => group.key,
            (group) => {
              const headingId = `${base}-${group.value.key || "ungrouped"}`;
              const visible = derived(() =>
                group.value.commands.some((command) => commandMatches(command, query.value)),
              );
              return (
                <div
                  role={group.value.name === undefined ? "presentation" : "group"}
                  aria-labelledby={group.value.name === undefined ? undefined : headingId}
                  hidden={derived(() => !visible.value)}
                  ref={context.parts.group}
                >
                  {group.value.name === undefined ? null : (
                    <div id={headingId} role="presentation" ref={context.parts.heading}>
                      {derived(() => group.value.name ?? "")}
                    </div>
                  )}
                  {keyed(
                    derived(() => group.value.commands),
                    (command) => command.id,
                    (command) => {
                      const id = command.value.id;
                      return (
                        <div
                          id={optionId(id)}
                          role="option"
                          aria-selected={derived(() => String(active.value === id))}
                          aria-disabled={derived(() =>
                            command.value.disabled ? "true" : undefined,
                          )}
                          hidden={derived(() => !commandMatches(command.value, query.value))}
                          onMouseDown={(event: MouseEvent) => event.preventDefault()}
                          onMouseMove={() => {
                            if (!command.value.disabled && active.value !== id) chosen.value = id;
                          }}
                          onClick={() => run(id)}
                          ref={context.parts.option}
                        >
                          {command.value.icon ? (
                            <span aria-hidden="true" ref={context.parts.icon}>
                              <Icon name={command.value.icon} />
                            </span>
                          ) : null}
                          <span ref={context.parts.label}>
                            {derived(() => command.value.label)}
                          </span>
                          {command.value.shortcut ? (
                            <ShortcutKeys keys={command.value.shortcut} />
                          ) : null}
                        </div>
                      );
                    },
                  )}
                </div>
              );
            },
          )}
        </div>
        <p hidden={derived(() => matching.value.length > 0)} ref={context.parts.empty}>
          {emptyMessage}
        </p>
        <p role="status" ref={context.parts.count}>
          {derived(() => resultsMessage(matching.value.length))}
        </p>
      </dialog>
    </div>
  );
}
CommandPalette.meta = {
  name: "command-palette",
  parts: [
    "root",
    "dialog",
    "search",
    "searchIcon",
    "input",
    "list",
    "group",
    "heading",
    "option",
    "icon",
    "label",
    "empty",
    "count",
  ],
} as const;
