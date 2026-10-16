import type {
  RegisteredComponentName,
  RegisteredComponentPart,
  ThemeRules,
} from "meowjsx";
import "meowui";

const component: RegisteredComponentName = "button";
const rootPart: RegisteredComponentPart<"button"> = "root";

const rules = {
  button: {
    root: { className: "ui-button" },
  },
  "icon-button": {
    root: { className: "ui-icon-button" },
  },
  toolbar: {
    root: { className: "ui-toolbar" },
  },
  "empty-state": {
    illustration: { className: "ui-empty-state-illustration" },
  },
} satisfies ThemeRules;

const contextualRules = {
  button: {
    root: ({ component }) => {
      const part: "root" = component.part;
      return { className: `ui-${component.component}-${part}` };
    },
  },
} satisfies ThemeRules;

const invalidRules = {
  button: {
    // @ts-expect-error Registered component rules should only expose registered parts.
    description: { className: "not-a-button-part" },
  },
} satisfies ThemeRules;

// @ts-expect-error Unknown parts should not be accepted for a registered component.
const invalidPart: RegisteredComponentPart<"button"> = "description";

void component;
void rootPart;
void rules;
void contextualRules;
void invalidRules;
void invalidPart;
