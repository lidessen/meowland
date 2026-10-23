import { describe, expect, test } from "bun:test";
import { interfaceMembers, patternDefaults, readPropsSource } from "../props";

describe("the props reader", () => {
  test("reads members with their JSDoc, optional mark and one-line type", () => {
    const members = interfaceMembers(`
      title: Child;
      /** What the dot says; the words stay the source of truth. */
      state?: MaybeSignal<
        StatusDotState
      >;
      onSelect?(value: string): void;
      // A plain comment is not documentation.
      tone?: "quiet" | "loud";
    `);
    expect(members).toEqual([
      { name: "title", type: "Child", optional: false },
      {
        name: "state",
        type: "MaybeSignal< StatusDotState >",
        optional: true,
        description: "What the dot says; the words stay the source of truth.",
      },
      { name: "onSelect", type: "(value: string): void", optional: true },
      { name: "tone", type: '"quiet" | "loud"', optional: true },
    ]);
  });

  test("reads the defaults a destructuring pattern gives", () => {
    const defaults = patternDefaults(`title, state = "unknown", action = "Details", ...props`);
    expect([...defaults]).toEqual([
      ["state", '"unknown"'],
      ["action", '"Details"'],
    ]);
  });

  test("pairs a defineComponent with its props interface and setup defaults", () => {
    const interfaces = new Map();
    const components = new Map();
    readPropsSource(
      `export interface CardProps extends Props, ThemedProps<typeof cardOptions> {
        /** Shown above the body. */
        title?: Child;
      }
      export const Card = defineComponent<
        CardProps,
        "card"
      >(cardContract, ({ title = "Untitled", children }, context) => children);`,
      interfaces,
      components,
    );
    expect(interfaces.get("CardProps")?.extends).toEqual([
      "Props",
      "ThemedProps<typeof cardOptions>",
    ]);
    expect(components.get("Card")?.propsName).toBe("CardProps");
    expect(components.get("Card")?.defaults.get("title")).toBe('"Untitled"');
  });
});
