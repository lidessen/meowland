import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Field, SearchInput } from "meowtail";

export const SearchStory = defineStory({
  id: "search-input",
  title: "搜索 · 辨认、筛选与返回",
  group: "表单输入",
  groupOrder: 20,
  component: "SearchInput",
  variant: "筛选与返回",
  description:
    "共享搜索输入的图标、焦点与表单语义。搜索下面的本地样例，清空后恢复全部结果；不访问服务。",
  covers: ["SearchInput", "Field", "filter", "disabled", "readonly", "invalid", "native search"],
  render: () => (
    <div className="workshop-stack workshop-constrained">
      <Field
        label="在当前项目中查找"
        htmlFor="sample-search"
        description="试试“主题”或“组件”。结果仅来自下面三条本地内容。"
      >
        <SearchInput
          id="sample-search"
          name="query"
          label="在当前项目中查找"
          placeholder="输入标题中的词…"
        />
      </Field>
      <section aria-label="搜索结果" className="workshop-search-results">
        {[
          ["组件使用说明", "12 个基础组件 · 本地示例"],
          ["主题设计笔记", "MeowUI 明暗外观 · 本地示例"],
          ["图标目录", "32 个功能图形 · 本地示例"],
        ].map(([title, detail]) => (
          <article data-search-title={title}>
            <h3>{title}</h3>
            <p>{detail}</p>
          </article>
        ))}
        <p data-search-empty hidden>
          没有匹配的标题，试试更短的词。
        </p>
      </section>
      <p className="workshop-feedback" role="status" data-search-count>
        3 条本地结果
      </p>
      <section className="workshop-stack" aria-label="其他搜索状态">
        <Field label="范围已锁定" htmlFor="locked-query" description="只读文本仍可选中与复制。">
          <SearchInput id="locked-query" label="范围已锁定" value="packages/meowtail" readOnly />
        </Field>
        <Field label="等待索引" htmlFor="pending-query">
          <SearchInput
            id="pending-query"
            label="等待索引"
            placeholder="索引完成后可以搜索"
            disabled
          />
        </Field>
        <Field
          label="查询格式"
          htmlFor="invalid-query"
          error="此示例只接受标题文字，请去掉筛选表达式。"
        >
          <SearchInput id="invalid-query" label="查询格式" value="type:" />
        </Field>
      </section>
    </div>
  ),
  setup({ root, report, onCleanup }) {
    const input = root.querySelector<HTMLInputElement>("#sample-search")!;
    const rows = [...root.querySelectorAll<HTMLElement>("[data-search-title]")];
    const update = () => {
      const query = input.value.trim().toLocaleLowerCase();
      for (const row of rows)
        row.hidden = !row.dataset.searchTitle!.toLocaleLowerCase().includes(query);
      const count = rows.filter((row) => !row.hidden).length;
      root.querySelector<HTMLElement>("[data-search-empty]")!.hidden = count !== 0;
      root.querySelector<HTMLElement>("[data-search-count]")!.textContent = `${count} 条本地结果`;
      report(`本地筛选：${count} 条结果`);
    };
    input.addEventListener("input", update);
    onCleanup(() => input.removeEventListener("input", update));
  },
});
