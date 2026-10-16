import { h } from "meowjsx";
/** @story {"id":"annotation/button","title":"注释按钮","props":{"label":"提交","disabled":true}} */
export function FixtureButton(props: { label: string; disabled?: boolean }) {
  return <button disabled={props.disabled}>{props.label}</button>;
}
