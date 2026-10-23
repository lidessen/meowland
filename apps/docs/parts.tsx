import { h, type Child } from "meowjsx";
import "./runtime";
import { Badge, Card, CodeBlock, Inline, Stack, Table } from "meowtail";
import { Icon } from "meowtail/icons";
import { styleAxes, type CatalogContract } from "./catalog";

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
        src={`/gallery/canvas.html?story=${encodeURIComponent(storyId)}&embedded=1`}
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
    <Stack gap="compact" className="docs-example">
      <div className="docs-example-head">
        <h3 className="docs-example-title">{title}</h3>
        {description ? <p className="docs-note">{description}</p> : null}
      </div>
      <div className="docs-specimen">
        <Preview storyId={storyId} title={title} tall={tall} />
        {source ? <CodeSample source={source} file={file} line={line} /> : null}
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

/** The style axes of a component and the choices each axis allows. */
export function StyleAxesTable({ contract }: { contract?: CatalogContract }): Child {
  const axes = styleAxes(contract);
  if (!axes.length) {
    return <p className="docs-note">This component has no style axes.</p>;
  }
  return (
    <Table
      label="Style axes"
      columns={[
        { id: "axis", header: "Axis", resizable: false },
        { id: "choices", header: "Choices", resizable: false },
        { id: "default", header: "Default", resizable: false },
      ]}
      rows={axes.map((entry) => ({
        id: entry.axis,
        cells: [
          <code>{entry.axis}</code>,
          <Inline gap="compact" wrap>
            {entry.choices.map((choice) => (
              <Badge tone="outline" size="small">
                {choice}
              </Badge>
            ))}
          </Inline>,
          <code>{entry.default}</code>,
        ],
      }))}
    />
  );
}

/** The DOM parts a component paints. */
export function PartList({ contract }: { contract?: CatalogContract }): Child {
  if (!contract) return <p className="docs-note">This component has no registry contract.</p>;
  return (
    <Inline gap="compact" wrap>
      {contract.parts.map((part) => (
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
