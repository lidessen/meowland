import { Fragment, h, type Child } from "meowjsx";
import "./runtime";
import { Badge, Card, CodeBlock, Inline, Stack, Table } from "meowtail";
import { Icon } from "meowtail/icons";
import { styleAxes, type CatalogStyleProps } from "./catalog";
import { splitTopLevel } from "./code";
import type { ComponentProps } from "./props";

/** The language label of the code surface, from the source file extension. */
function languageFor(file?: string): string | undefined {
  if (!file) return undefined;
  const separator = file.lastIndexOf(".");
  return separator < 0 ? undefined : file.slice(separator + 1) || undefined;
}

/** The live example of one story. */
export function Preview({
  storyId,
  title,
  tall = false,
}: {
  storyId: string;
  title: string;
  tall?: boolean;
}): Child {
  return (
    <Card variant="surface" className="docs-preview-card">
      <iframe
        className={tall ? "docs-preview-frame docs-preview-frame-tall" : "docs-preview-frame"}
        src={`/gallery/canvas.html?story=${encodeURIComponent(storyId)}&embedded=1&theme=standard`}
        loading="lazy"
        title={title}
      />
    </Card>
  );
}

/**
 * The code behind an example. The library code surface carries the source name
 * and its location; the site only supplies the source and the file.
 */
export function CodeSample({
  source,
  file,
  line,
}: {
  source: string;
  file?: string;
  line?: number;
}): Child {
  return (
    <CodeBlock
      code={source}
      language={languageFor(file)}
      title={file}
      caption={line === undefined ? undefined : `line ${line}`}
    />
  );
}

/** One example: the live preview, then the code behind it, framed as one specimen. */
export function StoryExample({
  storyId,
  title,
  description,
  source,
  file,
  line,
  tall = false,
}: {
  storyId: string;
  title: string;
  description?: string;
  source?: string;
  file?: string;
  line?: number;
  tall?: boolean;
}): Child {
  return (
    <Stack gap="compact" className="docs-example" data-docs-tabs={source ? "" : undefined}>
      <div className="docs-example-head">
        <h3 className="docs-example-title">{title}</h3>
        {description ? <p className="docs-note">{description}</p> : null}
      </div>
      <div className="docs-example-bar">
        {/* Wired by the page script; without it the preview and its code both stay in view. */}
        {source ? (
          <div className="docs-tabs" role="tablist" aria-label={`${title}: preview or code`} hidden>
            <button type="button" role="tab" aria-selected="true" data-docs-tab="preview">
              Preview
            </button>
            <button type="button" role="tab" aria-selected="false" data-docs-tab="code">
              Code
            </button>
          </div>
        ) : null}
        <a className="docs-example-open" href={`/gallery/?story=${encodeURIComponent(storyId)}`}>
          Open in workbench
          <Icon name="arrow-right" size={14} />
        </a>
      </div>
      <div className="docs-specimen">
        <div data-docs-panel="preview">
          <Preview storyId={storyId} title={title} tall={tall} />
        </div>
        {source ? (
          <div data-docs-panel="code">
            <CodeSample source={source} file={file} line={line} />
          </div>
        ) : null}
      </div>
    </Stack>
  );
}

/** The install command for a package. */
export function InstallLine({ name }: { name: string }): Child {
  return (
    <div className="docs-install">
      <Icon name="terminal" size={14} />
      <span>bun add {name}</span>
      {/* Wired by the page script; without it the command is still selectable text. */}
      <button className="docs-install-copy" type="button" aria-label="Copy install command" hidden>
        <Icon name="copy" size={14} />
        <Icon name="check" size={14} />
      </button>
    </div>
  );
}

/** Prose with `code` spans, as JSDoc writes it. */
function inlineCode(text: string): Child[] {
  return text.split("`").map((piece, index) => (index % 2 === 1 ? <code>{piece}</code> : piece));
}

/** A note whose `code` spans, written as JSDoc does, render as code. */
export function InlineCodeNote({ text }: { text: string }): Child {
  return <p className="docs-note">{inlineCode(text)}</p>;
}

/** The shapes of a parenthesized union such as `( | { kind: "a" } | { kind: "b" } )`. */
function unionShapes(entry: string): string[] {
  return splitTopLevel(entry.replace(/^\(\s*|\s*\)$/g, ""), "|");
}

/** What the inherited part of a props interface adds, in words. */
function inheritedNote(extended: readonly string[]): Child | undefined {
  const unions = extended.filter((entry) => entry.startsWith("("));
  const others = extended.filter(
    (entry) => entry !== "Props" && !entry.startsWith("ThemedProps<") && !entry.startsWith("("),
  );
  const shapes = unions.length ? (
    <Stack gap="compact">
      <p className="docs-note">It also takes exactly one of these shapes:</p>
      {unions.flatMap(unionShapes).map((shape) => (
        <code className="docs-prop-type docs-prop-shape">{shape}</code>
      ))}
    </Stack>
  ) : null;
  const note = inheritedSentence(extended.includes("Props"), others);
  if (!note && !shapes) return undefined;
  return (
    <Stack gap="compact">
      {note}
      {shapes}
    </Stack>
  );
}

function inheritedSentence(element: boolean, others: readonly string[]): Child | undefined {
  if (!element && !others.length) return undefined;
  return (
    <Note>
      {element ? (
        <Fragment>
          Also takes <code>className</code>, <code>children</code> and the attributes and events of
          its root element.
        </Fragment>
      ) : null}
      {element && others.length ? " " : null}
      {others.length ? (
        <Fragment>
          {element ? "It also extends " : "Also takes the props of "}
          {others.map((entry, index) => (
            <Fragment>
              {index > 0 ? ", " : null}
              <code>{entry}</code>
            </Fragment>
          ))}
          .
        </Fragment>
      ) : null}
    </Note>
  );
}

/**
 * The props of a component in one table: its style axes first, then the props its interface
 * declares, each with its type, its default and the JSDoc written on it.
 */
export function PropsTable({
  style,
  props,
}: {
  style?: CatalogStyleProps;
  props?: ComponentProps;
}): Child {
  const rows: {
    name: string;
    type: string;
    default?: string;
    required?: boolean;
    note?: string;
  }[] = styleAxes(style).map((entry) => ({
    name: entry.axis,
    type: entry.choices.map((choice) => JSON.stringify(choice)).join(" | "),
    default: JSON.stringify(entry.default),
  }));
  for (const prop of props?.props ?? []) {
    if (prop.name === "className" || rows.some((row) => row.name === prop.name)) continue;
    rows.push({
      name: prop.name,
      type: prop.type,
      default: prop.default,
      required: !prop.optional,
      note: prop.description,
    });
  }
  const inherited = props ? inheritedNote(props.extends) : undefined;
  if (!rows.length) {
    return inherited ?? <Note>This component documents no props of its own.</Note>;
  }
  return (
    <Stack gap="compact">
      <Table
        label="Props"
        columns={[
          { id: "prop", header: "Prop", width: 288, resizable: false },
          { id: "type", header: "Type", width: 272, resizable: false },
          { id: "default", header: "Default", minWidth: 128, resizable: false },
        ]}
        rows={rows.map((row) => ({
          id: row.name,
          cells: [
            <div className="docs-prop">
              <span className="docs-prop-name">
                <code>{row.name}</code>
                {row.required ? <span className="docs-prop-required">Required</span> : null}
              </span>
              {row.note ? <span className="docs-prop-note">{inlineCode(row.note)}</span> : null}
            </div>,
            <code className="docs-prop-type">{row.type}</code>,
            row.default === undefined ? (
              <span className="docs-prop-none">–</span>
            ) : (
              <code className="docs-prop-type">{row.default}</code>
            ),
          ],
        }))}
      />
      {inherited ?? null}
    </Stack>
  );
}

/** The DOM parts a component paints. */
export function PartList({ meta }: { meta?: { readonly parts: readonly string[] } }): Child {
  if (!meta) return <p className="docs-note">This component has no registry metadata.</p>;
  return (
    <Inline gap="compact" wrap>
      {meta.parts.map((part) => (
        <Badge tone="quiet" size="small">
          {part}
        </Badge>
      ))}
    </Inline>
  );
}

/** A short remark under a section. */
export function Note({ children }: { children: Child }): Child {
  return <p className="docs-note">{children}</p>;
}
