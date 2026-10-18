import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import { dirname, resolve } from "node:path";

interface Node {
  type: string;
  [key: string]: unknown;
}

interface MarkdownNode extends Node {
  children?: MarkdownNode[];
  position?: { start: { line: number; column: number }; end?: unknown };
}

export interface SlideMetadata {
  id: string;
  title: string;
  columns: 1 | 2 | 3 | "single" | "equal" | "wide-start" | "wide-end";
  steps: number;
  notes?: string;
}

export interface CompiledSlides {
  code: string;
  slides: readonly SlideMetadata[];
}

const identifier = (name: string): Node => ({ type: "Identifier", name });
const literal = (value: unknown): Node => ({ type: "Literal", value });
const property = (key: string, value: Node): Node => ({
  type: "Property",
  key: identifier(key),
  value,
  kind: "init",
  method: false,
  shorthand: false,
  computed: false,
});
const object = (properties: Node[]): Node => ({ type: "ObjectExpression", properties });
const member = (name: string, key: string | number): Node => ({
  type: "MemberExpression",
  object: identifier(name),
  property: typeof key === "number" ? literal(key) : identifier(key),
  computed: typeof key === "number",
  optional: false,
});
const declaration = (name: string, init: Node): Node => ({
  type: "VariableDeclaration",
  kind: "const",
  declarations: [{ type: "VariableDeclarator", id: identifier(name), init }],
});
const spread = (argument: Node): Node => ({ type: "SpreadElement", argument });
const call = (callee: Node, args: Node[]): Node => ({
  type: "CallExpression",
  callee,
  arguments: args,
  optional: false,
});
const expressionValue = (expression: Node): object => ({
  estree: {
    type: "Program",
    sourceType: "module",
    body: [{ type: "ExpressionStatement", expression }],
  },
});
const attribute = (name: string, value: string | Node): Node => ({
  type: "mdxJsxAttribute",
  name,
  value:
    typeof value === "string"
      ? value
      : {
          type: "mdxJsxAttributeValueExpression",
          value: "",
          data: expressionValue(value),
        },
});
const element = (
  name: string,
  attributes: Node[],
  children: MarkdownNode[] = [],
  inline = false,
): MarkdownNode => ({
  type: inline ? "mdxJsxTextElement" : "mdxJsxFlowElement",
  name,
  attributes,
  children,
});

function fail(message: string, node?: MarkdownNode): never {
  const location = node?.position?.start;
  throw new Error(`${message}${location ? ` (${location.line}:${location.column})` : ""}`);
}

function text(node: MarkdownNode): string {
  if (
    ![
      "heading",
      "text",
      "strong",
      "emphasis",
      "inlineCode",
      "delete",
      "link",
      "linkReference",
    ].includes(node.type)
  )
    fail("Dynamic page headings require an explicit static Slide title", node);
  return typeof node.value === "string" ? node.value : (node.children ?? []).map(text).join("");
}

function slug(title: string): string {
  return title
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
}

function staticAttribute(node: MarkdownNode, entry: Node): unknown {
  if (entry.type !== "mdxJsxAttribute")
    fail("Slide metadata does not support spread attributes", node);
  if (entry.value === null) fail("Slide metadata requires explicit static values", node);
  if (typeof entry.value === "string") return entry.value;
  const value = entry.value as { data?: { estree?: { body?: Node[] } } };
  const statement = value?.data?.estree?.body?.[0];
  const expression = statement?.expression as Node | undefined;
  if (statement?.type !== "ExpressionStatement" || expression?.type !== "Literal")
    fail("Slide metadata accepts only static string or number literals", node);
  return expression.value;
}

function metadata(page: MarkdownNode[], index: number): SlideMetadata {
  const markers = page.filter((node) => node.type === "mdxJsxFlowElement" && node.name === "Slide");
  if (markers.length > 1) fail("A page may contain only one Slide metadata node", markers[1]);
  const marker = markers[0];
  const values: Record<string, unknown> = {};
  if (marker) {
    if (page[0] !== marker || marker.children?.length)
      fail("Slide metadata must be an empty first node of its page", marker);
    for (const entry of marker.attributes as Node[]) {
      const key = String(entry.name);
      if (!["id", "title", "columns", "steps", "notes"].includes(key))
        fail(`Unknown Slide metadata: ${key}`, marker);
      if (key in values) fail(`Duplicate Slide metadata: ${key}`, marker);
      values[key] = staticAttribute(marker, entry);
    }
  }
  const heading = page.find((node) => node.type === "heading" && node.depth === 1);
  const title = values.title ?? (heading && text(heading));
  if (typeof title !== "string" || !title.trim())
    fail(
      `Page ${index + 1} requires a first-level heading or static Slide title`,
      marker ?? page[0],
    );
  const id = values.id ?? slug(title);
  if (typeof id !== "string" || !id.trim())
    fail("Slide id must be a nonempty string", marker ?? heading);
  const columns = values.columns ?? 1;
  if (![1, 2, 3, "single", "equal", "wide-start", "wide-end"].includes(columns as string | number))
    fail("Slide columns must be 1, 2, 3, single, equal, wide-start or wide-end", marker);
  const steps = values.steps ?? 0;
  if (!Number.isInteger(steps) || Number(steps) < 0)
    fail("Slide steps must be a nonnegative integer", marker);
  if (values.notes !== undefined && typeof values.notes !== "string")
    fail("Slide notes must be a static string", marker);
  return {
    id,
    title: title.trim(),
    columns: columns as SlideMetadata["columns"],
    steps: Number(steps),
    ...(values.notes === undefined ? {} : { notes: values.notes as string }),
  };
}

/** Compile trusted local MDX without importing or evaluating author modules. */
export async function compileSlides(source: string, entry: string): Promise<CompiledSlides> {
  const slides: SlideMetadata[] = [];
  const assets = new Map<string, string>();
  let sessionBinding: string | undefined;
  function remarkSlides() {
    return (unknownTree: unknown) => {
      const tree = unknownTree as MarkdownNode;
      const definitions = new Map<string, MarkdownNode>();
      function collectDefinitions(node: MarkdownNode) {
        if (node.type === "definition")
          definitions.set(String(node.identifier).toLowerCase(), node);
        for (const child of node.children ?? []) collectDefinitions(child);
      }
      collectDefinitions(tree);
      const shared = (tree.children ?? []).filter((node) => node.type === "mdxjsEsm");
      const imports = new Set<string>();
      for (const node of shared) {
        const program = (node.data as { estree: { body: Node[] } }).estree;
        for (const statement of program.body) {
          if (statement.type === "ImportDeclaration") {
            for (const specifier of statement.specifiers as Node[]) {
              const name = String((specifier.local as Node).name);
              if (
                ["createDeck", "MDXDeck", "MDXSlidePage", "MDXSlideColumn"].includes(name) ||
                name.startsWith("__meowslides")
              )
                fail(`Reserved slides compiler binding: ${name}`, node);
              imports.add(name);
            }
          } else if (statement.type === "ExportNamedDeclaration" && !statement.declaration) {
            const specifiers = statement.specifiers as Node[];
            if (
              specifiers.length !== 1 ||
              (specifiers[0]?.exported as Node)?.name !== "createSession"
            )
              fail("Only the explicit createSession export is supported in slides.mdx", node);
            const local = String((specifiers[0]!.local as Node).name);
            if (sessionBinding) fail("Duplicate createSession export", node);
            sessionBinding = local;
            if (statement.source) {
              statement.type = "ImportDeclaration";
              statement.specifiers = [
                {
                  type: "ImportSpecifier",
                  imported: identifier(local),
                  local: identifier("__meowslidesSession"),
                },
              ];
              sessionBinding = "__meowslidesSession";
            }
          } else
            fail(
              "slides.mdx supports imports and an imported createSession export; put state and components in a separate module",
              node,
            );
        }
      }
      if (
        sessionBinding &&
        sessionBinding !== "__meowslidesSession" &&
        !imports.has(sessionBinding)
      )
        fail("createSession must refer to an imported binding");
      const pages: MarkdownNode[][] = [[]];
      for (const node of tree.children ?? []) {
        if (node.type === "mdxjsEsm") continue;
        if (node.type === "thematicBreak") pages.push([]);
        else if (node.type !== "definition") pages[pages.length - 1]!.push(node);
      }
      const ids = new Set<string>();
      const rendered = pages.map((page, index) => {
        if (!page.length) fail(`Page ${index + 1} is empty`);
        const info = metadata(page, index);
        if (ids.has(info.id)) fail(`Duplicate slide id: ${info.id}`, page[0]);
        ids.add(info.id);
        slides.push(info);
        const heading = page.find((node) => node.type === "heading" && node.depth === 1);
        let body = page.filter(
          (node) =>
            node !== heading && !(node.type === "mdxJsxFlowElement" && node.name === "Slide"),
        );
        const count =
          info.columns === 1 || info.columns === "single" ? 1 : info.columns === 3 ? 3 : 2;
        if (count > 1) {
          if (
            body.length !== count ||
            body.some((node) => node.type !== "mdxJsxFlowElement" || node.name !== "div")
          )
            fail(
              `Slide ${info.id} requires exactly ${count} top-level <div> column groups`,
              page[0],
            );
          body = body.map((node) => ({ ...node, name: "MDXSlideColumn" }));
        }
        return element(
          "MDXSlidePage",
          [attribute("title", info.title), attribute("columns", literal(info.columns))],
          body,
        );
      });
      function asset(url: string): Node | string {
        if (/^(?:[a-z][a-z\d+.-]*:|\/|#)/i.test(url)) return url;
        const absolute = resolve(dirname(entry), url);
        let name = assets.get(absolute);
        if (!name) {
          name = `__meowslidesAsset${assets.size}`;
          assets.set(absolute, name);
        }
        return identifier(name);
      }
      function images(parent: MarkdownNode) {
        if (!Array.isArray(parent.children)) return;
        parent.children = parent.children.map((node) => {
          function imageValue(image: MarkdownNode): MarkdownNode | undefined {
            if (image.type === "image") return image;
            if (image.type !== "imageReference") return undefined;
            const definition = definitions.get(String(image.identifier).toLowerCase());
            if (!definition) fail(`Missing image reference: ${image.identifier}`, image);
            return { ...image, type: "image", url: definition.url, title: definition.title };
          }
          const standalone =
            node.type === "paragraph" && node.children?.length === 1
              ? imageValue(node.children[0]!)
              : undefined;
          if (standalone) {
            const image = standalone;
            return element("PresentationImage", [
              attribute("src", asset(String(image.url))),
              attribute("alt", String(image.alt ?? "")),
              ...(image.title ? [attribute("caption", String(image.title))] : []),
            ]);
          }
          const inline = imageValue(node);
          if (inline)
            return element(
              "img",
              [
                attribute("src", asset(String(inline.url))),
                attribute("alt", String(inline.alt ?? "")),
                ...(inline.title ? [attribute("title", String(inline.title))] : []),
              ],
              [],
              true,
            );
          images(node);
          return node;
        });
      }
      tree.children = [...shared, element("MDXDeck", [], rendered)];
      images(tree);
    };
  }
  function recmaSlides() {
    return (unknownTree: unknown) => {
      const tree = unknownTree as Node;
      let body = tree.body as Node[];
      const content = body.find(
        (node) =>
          node.type === "FunctionDeclaration" && (node.id as Node)?.name === "_createMdxContent",
      );
      const statements = (content?.body as Node)?.body as Node[] | undefined;
      const returned = statements?.find((node) => node.type === "ReturnStatement");
      const args = (returned?.argument as Node)?.arguments as Node[] | undefined;
      const children = (args?.[1]?.properties as Node[] | undefined)?.find(
        (node) => (node.key as Node)?.name === "children",
      )?.value as Node | undefined;
      if (!returned || !children) throw new Error("Unable to compile slide render functions");
      const expressions =
        children.type === "ArrayExpression" ? (children.elements as Node[]) : [children];
      returned.argument = {
        type: "ArrayExpression",
        elements: expressions.map((expression) => ({
          type: "ArrowFunctionExpression",
          params: [],
          body: expression,
          expression: true,
          async: false,
        })),
      };
      body = body.filter((node) => node.type !== "ExportDefaultDeclaration");
      body.unshift({
        type: "ImportDeclaration",
        source: literal("meowslides/mdx"),
        specifiers: [
          {
            type: "ImportSpecifier",
            imported: identifier("mdxComponents"),
            local: identifier("__meowslidesComponents"),
          },
        ],
      });
      for (const [path, name] of assets)
        body.unshift({
          type: "ImportDeclaration",
          source: literal(`meowslides-asset:${path}`),
          specifiers: [{ type: "ImportDefaultSpecifier", local: identifier(name) }],
        });
      const props = object([
        spread(identifier("options")),
        property(
          "components",
          object([
            spread(identifier("__meowslidesComponents")),
            spread(member("options", "components")),
          ]),
        ),
        ...(sessionBinding ? [property("session", call(identifier(sessionBinding), []))] : []),
      ]);
      body.push({
        type: "ExportNamedDeclaration",
        declaration: {
          type: "FunctionDeclaration",
          id: identifier("createDeck"),
          generator: false,
          async: false,
          params: [{ type: "AssignmentPattern", left: identifier("options"), right: object([]) }],
          body: {
            type: "BlockStatement",
            body: [
              declaration("props", props),
              declaration(
                "renderers",
                call(identifier("_createMdxContent"), [identifier("props")]),
              ),
              {
                type: "ReturnStatement",
                argument: object([
                  property("title", literal(slides[0]!.title)),
                  property("slides", {
                    type: "ArrayExpression",
                    elements: slides.map((slide, index) =>
                      object([
                        ...Object.entries(slide)
                          .filter(([key]) => key !== "columns")
                          .map(([key, value]) => property(key, literal(value))),
                        property("render", member("renderers", index)),
                      ]),
                    ),
                  }),
                ]),
              },
            ],
          },
        },
        specifiers: [],
        source: null,
      });
      tree.body = body;
    };
  }
  try {
    const result = await compile(
      { value: source, path: entry },
      {
        jsxImportSource: "meowjsx",
        development: false,
        remarkPlugins: [remarkGfm, remarkSlides],
        recmaPlugins: [recmaSlides],
      },
    );
    return { code: String(result), slides };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(message.startsWith(`${entry}:`) ? message : `${entry}: ${message}`, {
      cause: error,
    });
  }
}
