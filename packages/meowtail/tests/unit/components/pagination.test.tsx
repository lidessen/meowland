import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { Pagination, installMeowUI, meowUIComponents, paginationEntries } from "../../../src/index";
import { mountComponent } from "./mount";

function runtime() {
  const value = createRuntime();
  installMeowUI({ components: meowUIComponents }, value);
  return value;
}

function labels(page: number, count: number, siblings?: number) {
  return paginationEntries(page, count, siblings).map((entry) =>
    entry.kind === "page" ? entry.page : "…",
  );
}

test("a known total keeps first, last, the current window and gaps at a constant count", () => {
  expect(labels(1, 5)).toEqual([1, 2, 3, 4, 5]);
  expect(labels(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  expect(labels(1, 20)).toEqual([1, 2, 3, 4, 5, "…", 20]);
  expect(labels(4, 20)).toEqual([1, 2, 3, 4, 5, "…", 20]);
  expect(labels(5, 20)).toEqual([1, "…", 4, 5, 6, "…", 20]);
  expect(labels(17, 20)).toEqual([1, "…", 16, 17, 18, 19, 20]);
  expect(labels(20, 20)).toEqual([1, "…", 16, 17, 18, 19, 20]);
  expect(labels(10, 20, 2)).toEqual([1, "…", 8, 9, 10, 11, 12, "…", 20]);
  expect(labels(1, 0)).toEqual([]);
  // A page past a shrunken total keeps the window on the last pages instead of throwing.
  expect(labels(30, 20)).toEqual([1, "…", 16, 17, 18, 19, 20]);
});

test("invalid page facts are rejected rather than guessed", () => {
  expect(() => paginationEntries(0, 5)).toThrow(RangeError);
  expect(() => paginationEntries(1.5, 5)).toThrow(RangeError);
  expect(() => paginationEntries(1, -1)).toThrow(RangeError);
  expect(() => paginationEntries(1, 5, -1)).toThrow(RangeError);
});

test("known total renders a labeled landmark with the current page marked", () => {
  const mounted = mountComponent(
    <Pagination label="Run pages" page={1} pageCount={3} onPageChange={() => {}} />,
    runtime(),
  );
  const nav = mounted.host.querySelector("nav")!;
  expect(nav.getAttribute("aria-label")).toBe("Run pages");
  expect(nav.getAttribute("data-meowui-part")).toBe("pagination/root");
  const pages = [...nav.querySelectorAll('[data-meowui-part="pagination/page"]')];
  expect(pages.map((button) => button.textContent)).toEqual(["1", "2", "3"]);
  expect(pages[0]!.getAttribute("aria-current")).toBe("page");
  expect(pages[0]!.getAttribute("aria-label")).toBe("Page 1");
  expect(pages[1]!.hasAttribute("aria-current")).toBe(false);
  // The theme shows this fact in place of the numbers when the bar is narrow.
  expect(nav.querySelector('[data-meowui-part="pagination/status"]')!.textContent).toBe(
    "Page 1 of 3",
  );
  const previous = nav.querySelector('[data-meowui-part="pagination/previous"]')!;
  expect(previous.getAttribute("aria-disabled")).toBe("true");
  // aria-disabled, not native disabled, so focus survives reaching a boundary.
  expect(previous.hasAttribute("disabled")).toBe(false);
  mounted.unmount();
});

test("clicks report the target page and the host decides; boundaries and busy do not report", async () => {
  const page = signal(1);
  const busy = signal(false);
  const calls: number[] = [];
  const mounted = mountComponent(
    <Pagination
      page={page}
      pageCount={10}
      busy={busy}
      onPageChange={(next) => {
        calls.push(next);
      }}
    />,
    runtime(),
  );
  const part = (name: string) =>
    mounted.host.querySelector<HTMLButtonElement>(`[data-meowui-part="pagination/${name}"]`)!;
  part("previous").click();
  part("next").click();
  // The component does not move by itself: the host still holds page 1.
  expect(calls).toEqual([2]);
  expect(part("page").getAttribute("aria-current")).toBe("page");

  page.value = 10;
  await Promise.resolve();
  const pages = () => [
    ...mounted.host.querySelectorAll<HTMLButtonElement>('[data-meowui-part="pagination/page"]'),
  ];
  expect(pages().map((button) => button.textContent)).toEqual(["1", "6", "7", "8", "9", "10"]);
  expect(part("next").getAttribute("aria-disabled")).toBe("true");
  part("next").click();
  pages()[0]!.click();
  expect(calls).toEqual([2, 1]);

  busy.value = true;
  await Promise.resolve();
  expect(mounted.host.querySelector("nav")!.getAttribute("aria-busy")).toBe("true");
  expect(part("previous").getAttribute("aria-disabled")).toBe("true");
  part("previous").click();
  pages()[0]!.click();
  expect(calls).toEqual([2, 1]);
  mounted.unmount();
});

test("an unknown total shows the page fact and lets the host say whether a later page exists", async () => {
  const page = signal(2);
  const hasNext = signal(true);
  const calls: number[] = [];
  const mounted = mountComponent(
    <Pagination
      page={page}
      hasNext={hasNext}
      pageStatus={(value, total) => `Page ${value} of ${total ?? "many"}`}
      onPageChange={(next) => {
        calls.push(next);
      }}
    />,
    runtime(),
  );
  const part = (name: string) =>
    mounted.host.querySelector<HTMLButtonElement>(`[data-meowui-part="pagination/${name}"]`);
  expect(part("list")).toBeNull();
  expect(part("status")!.textContent).toBe("Page 2 of many");
  part("next")!.click();
  part("previous")!.click();
  expect(calls).toEqual([3, 1]);
  hasNext.value = false;
  page.value = 3;
  await Promise.resolve();
  expect(part("status")!.textContent).toBe("Page 3 of many");
  expect(part("next")!.getAttribute("aria-disabled")).toBe("true");
  part("next")!.click();
  expect(calls).toEqual([3, 1]);
  mounted.unmount();
});
