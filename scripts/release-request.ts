import { prerelease, valid } from "semver";
import { publishNames, type Channel } from "./release.ts";

export function request(args: string[], extra: string[] = []) {
  const values = new Map<string, string>();
  for (let index = 0; index < args.length; index++) {
    const key = args[index]!;
    if (!["--commit", "--packages", "--channel", ...extra].includes(key) || values.has(key))
      throw new Error(`Unknown or duplicate argument: ${key}`);
    const value = args[++index];
    if (!value || value.startsWith("--")) throw new Error(`Missing value: ${key}`);
    values.set(key, value);
  }
  const commit = values.get("--commit") ?? "";
  if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error("A full explicit source SHA is required");
  const packages = values.get("--packages")?.split(",") ?? [];
  if (
    !packages.length ||
    new Set(packages).size !== packages.length ||
    packages.some((name) => !publishNames.includes(name))
  )
    throw new Error("Select unique supported package names explicitly");
  const channel = values.get("--channel");
  if (channel !== "alpha" && channel !== "stable")
    throw new Error("Select alpha or stable explicitly");
  return { commit, packages, channel: channel as Channel, values };
}
export function checkVersion(name: string, version: string, channel: Channel) {
  if (
    valid(version) !== version ||
    (channel === "stable"
      ? prerelease(version) !== null
      : !/^\d+\.\d+\.\d+-alpha\.\d+$/.test(version))
  )
    throw new Error(`Invalid ${channel} version: ${name}@${version}`);
}
