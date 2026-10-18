import { h } from "meowjsx";
/** @story {"id":"annotation/button","title":"Annotation button","props":{"label":"Submit","disabled":true}} */
export function FixtureButton(props: { label: string; disabled?: boolean }) {
  return <button disabled={props.disabled}>{props.label}</button>;
}
