import { h, signal, type Child } from "meowjsx";
import { Button } from "../../src/components/button";
import { CodeBlock } from "../../src/components/code-block";

const title = signal<Child>("connection.ts");
const caption = signal<Child>("examples/authoring · TypeScript");
const hostActions = signal<Child>(<Button size="small">Open in workbench</Button>);

const liveHeader = (
  <CodeBlock
    code={signal('const endpoint = "/api/health";')}
    language={signal("typescript")}
    title={title}
    caption={caption}
    actions={hostActions}
  />
);

const plainHeader = (
  <CodeBlock
    code="bun add meowtail"
    language="shell"
    title="Install the package"
    caption={<span>Run once in the workspace root.</span>}
    actions={
      <span>
        <Button size="small" variant="quiet">
          Package reference
        </Button>
      </span>
    }
  />
);

// Backward compatible: the original contract without header identity or host actions.
const languageOnlyHeader = (
  <CodeBlock code="const ready = true;" defaultWrap onCopy={async () => {}} />
);

// @ts-expect-error A title is rendered content or a Signal, not a configuration object.
const structuredTitle = <CodeBlock code="ready" title={{ file: "connection.ts" }} />;

void liveHeader;
void plainHeader;
void languageOnlyHeader;
void structuredTitle;
