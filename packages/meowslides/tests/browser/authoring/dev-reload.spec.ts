import { expect, test } from "@playwright/test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { devSlides } from "meowslides/build";

test("successful edits reload the browser and invalid edits preserve the last usable deck until recovery", async ({
  page,
}) => {
  test.setTimeout(45_000);
  const parent = resolve(import.meta.dir, "../../../../../artifacts/meowslides-review");
  await mkdir(parent, { recursive: true });
  const source = await mkdtemp(join(parent, "dev-reload-"));
  const entry = join(source, "slides.mdx");
  const errors: string[] = [];
  const browserErrors: string[] = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  const document = (title: string) => `import { Counter } from "./counter";
export { createSession } from "./counter";

# ${title}

<Counter session={props.session} />
`;
  const counterSource = `import { h } from "meowjsx"; import { signal } from "meowjsx/signal";
export function createSession() { return { count: signal(0) }; }
export function Counter({ session }) {
  return <button type="button" aria-label="Increment" onClick={() => { session.count.value++; }}>{session.count}</button>;
}
`;
  await writeFile(join(source, "counter.tsx"), counterSource);
  await writeFile(entry, document("Before the edit"));
  let preview: Awaited<ReturnType<typeof devSlides>> | undefined;
  try {
    preview = await devSlides({
      entry,
      port: 13040,
      onError: (error) => errors.push(error.message),
    });
    await page.goto("http://127.0.0.1:13040/");
    await expect(
      page.getByRole("article").getByRole("heading", { name: "Before the edit", exact: true }),
    ).toBeVisible();
    const counter = page.getByRole("button", { name: "Increment", exact: true });
    await counter.click();
    await expect(counter).toHaveText("1");
    await writeFile(entry, document("After the edit"));
    await expect(
      page.getByRole("article").getByRole("heading", { name: "After the edit", exact: true }),
    ).toBeVisible({
      timeout: 15_000,
    });
    await expect(counter).toHaveText("0");
    await writeFile(entry, "# Invalid edit\n\n<Unclosed>\n");
    await expect.poll(() => errors.length).toBeGreaterThan(0);
    await expect(
      page.getByRole("article").getByRole("heading", { name: "After the edit", exact: true }),
    ).toBeVisible();
    await counter.click();
    await expect(counter).toHaveText("1");
    await writeFile(entry, document("Recovered edit"));
    await expect(
      page.getByRole("article").getByRole("heading", { name: "Recovered edit", exact: true }),
    ).toBeVisible({
      timeout: 15_000,
    });
    await expect(counter).toHaveText("0");
    await writeFile(join(source, "counter.tsx"), counterSource.replace("Increment", "Add one"));
    await expect(page.getByRole("button", { name: "Add one", exact: true })).toHaveText("0", {
      timeout: 15_000,
    });
    expect(browserErrors).toEqual([]);
  } finally {
    preview?.stop();
    await rm(source, { recursive: true, force: true });
  }
});
