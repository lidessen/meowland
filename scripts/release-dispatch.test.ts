import { expect, test } from "bun:test";
import { dispatch } from "./release-dispatch.ts";
import { request } from "./release-request.ts";
import type { Runner } from "./release.ts";

const commit = "a".repeat(40);
const args = ["--commit", commit, "--packages", "meowcss,meowjsx", "--channel", "alpha"];
function fixture(remote = commit) {
  const calls: string[][] = [];
  const runner: Runner = async (args) => {
    calls.push(args);
    let output = "";
    if (args[0] === "git" && args[1] === "rev-parse") output = commit;
    else if (args[0] === "git" && args[1] === "show")
      output = JSON.stringify({ name: args[2]!.split("/")[1], version: "0.1.1-alpha.0" });
    else if (args[0] === "gh" && args[1] === "api") output = remote;
    else if (!args.includes("status") && args[1] !== "workflow")
      throw new Error("Unexpected command");
    return { code: 0, stdout: new TextEncoder().encode(output), stderr: "" };
  };
  return { runner, calls };
}
test("dispatch dry-run is local, exact-source and explicit-package only", async () => {
  const { runner, calls } = fixture();
  await dispatch(args, runner);
  expect(calls.every((args) => args[0] === "git")).toBe(true);
  for (const values of [
    [],
    ["--commit", "main", "--packages", "meowjsx", "--channel", "alpha"],
    ["--commit", commit, "--packages", "meowjsx;echo bad", "--channel", "alpha"],
    ["--commit", commit, "--packages", "meowjsx,meowjsx", "--channel", "alpha"],
    [...args, "--ref", "other"],
    [...args, "--channel", "stable"],
  ])
    expect(() => request(values)).toThrow();
});
test("dispatch refuses unpublished local commits and sends only main plus validated inputs", async () => {
  const stale = fixture("b".repeat(40));
  await expect(dispatch([...args, "--execute"], stale.runner)).rejects.toThrow("Remote main");
  expect(stale.calls.some((args) => args[1] === "workflow")).toBe(false);
  const ready = fixture();
  await dispatch([...args, "--execute"], ready.runner);
  expect(ready.calls.at(-1)).toEqual([
    "gh",
    "workflow",
    "run",
    "npm-release.yml",
    "--repo",
    "lidessen/meowland",
    "--ref",
    "main",
    "-f",
    `source_sha=${commit}`,
    "-f",
    "packages=meowcss,meowjsx",
    "-f",
    "channel=alpha",
  ]);
});
test("Slides and Press can be selected explicitly without expanding a four-package request", async () => {
  const packages = "meowjsx,meowcss,meowtail,meowbook";
  const four = ["--commit", commit, "--packages", packages, "--channel", "alpha"];
  expect(request(four).packages).toEqual(packages.split(","));
  expect(
    request(["--commit", commit, "--packages", "meowslides", "--channel", "alpha"]).packages,
  ).toEqual(["meowslides"]);
  expect(
    request(["--commit", commit, "--packages", "meowpress", "--channel", "alpha"]).packages,
  ).toEqual(["meowpress"]);
  const ready = fixture();
  await dispatch([...four, "--execute"], ready.runner);
  expect(ready.calls.at(-1)).toContain(`packages=${packages}`);
  expect(ready.calls.at(-1)).not.toContain("meowslides");
  expect(ready.calls.at(-1)).not.toContain("meowpress");
});
test("workflow grants OIDC only to publication after the inspected artifact", async () => {
  const workflow = Bun.YAML.parse(
    await Bun.file(new URL("../.github/workflows/npm-release.yml", import.meta.url)).text(),
  ) as any;
  expect(Object.keys(workflow.on)).toEqual(["workflow_dispatch"]);
  expect(workflow.permissions).toEqual({ contents: "read" });
  expect(workflow.jobs.prepare.permissions?.["id-token"]).toBeUndefined();
  expect(workflow.jobs.publish.permissions).toEqual({ contents: "read", "id-token": "write" });
  expect(workflow.jobs.publish.needs).toBe("prepare");
  expect(workflow.concurrency["cancel-in-progress"]).toBe(false);
});
