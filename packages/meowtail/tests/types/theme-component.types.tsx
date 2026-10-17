import { h } from "meowjsx";
import { PrototypeButton } from "../fixtures/theme-prototype-demo";

// Compile-only public JSX API checks, not just standalone mapped-type checks.
<PrototypeButton variant="outline" size="small">
  Valid
</PrototypeButton>;
// @ts-expect-error Invalid variant must fail on the actual component.
<PrototypeButton variant="missing" />;
// @ts-expect-error Builtin scheme is not a component prop.
<PrototypeButton scheme="dark" />;
// @ts-expect-error Options methods are not component props.
<PrototypeButton select="quiet" />;
