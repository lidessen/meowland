import { h } from "meowjsx/runtime";
import {
  Button,
  DoodleCat,
  ExternalArrowIcon,
  Field,
  GithubIcon,
  Icon,
  IconButton,
  iconNames,
  SearchInput,
  MeowlandMark,
  NotesIcon,
  PlusIcon,
  SearchIcon,
  TasksIcon,
} from "meowui";
import { defineStory } from "meowbook";

export const IconsStory = defineStory({
  id: "icons",
  title: "功能图标 · 全集",
  group: "图标与品牌",
  groupOrder: 60,
  component: "Icon",
  variant: "全部图标",
  description: "查找并选择统一 Lucide 子集中的图标。名称用于调用，形状用于辨认；所有内容仅在本地。",
  covers: ["Icon", "iconNames", "全部功能图标", "search", "selection", "keyboard"],
  render: () => (
    <div className="workshop-stack">
      <Field htmlFor="icon-search" label="查找图标" className="workshop-constrained">
        <SearchInput id="icon-search" label="查找图标" placeholder="例如 search、file、arrow…" />
      </Field>
      <p className="workshop-feedback" role="status" data-icon-feedback>
        {iconNames.length} 个图标 · 选择一个查看名称
      </p>
      <div className="workshop-icon-grid" aria-label="功能图标">
        {iconNames.map((name) => (
          <Button
            variant="quiet"
            className="workshop-icon-item"
            data-icon={name}
            aria-pressed="false"
          >
            <Icon name={name} size={20} />
            <span>{name}</span>
          </Button>
        ))}
      </div>
      <p className="workshop-note" data-icon-empty hidden>
        没有匹配的图标，试试更短的名称。
      </p>
    </div>
  ),
  setup({ root, report, onCleanup }) {
    const search = root.querySelector<HTMLInputElement>("#icon-search")!;
    const items = [...root.querySelectorAll<HTMLButtonElement>("button[data-icon]")];
    const feedback = root.querySelector<HTMLElement>("[data-icon-feedback]")!;
    const filter = () => {
      const query = search.value.trim().toLowerCase();
      for (const item of items) item.hidden = !item.dataset.icon!.includes(query);
      const count = items.filter((item) => !item.hidden).length;
      feedback.textContent = `${count} / ${items.length} 个图标`;
      root.querySelector<HTMLElement>("[data-icon-empty]")!.hidden = count !== 0;
    };
    const choose = (event: Event) => {
      const target = (event.target as Element).closest<HTMLButtonElement>("button[data-icon]");
      if (!target) return;
      for (const item of items) item.setAttribute("aria-pressed", String(item === target));
      feedback.textContent = `已选择 ${target.dataset.icon} · 用 Icon 的 name 引用`;
      report(`已选择图标 ${target.dataset.icon}`);
    };
    search.addEventListener("input", filter);
    root.addEventListener("click", choose);
    onCleanup(() => {
      search.removeEventListener("input", filter);
      root.removeEventListener("click", choose);
    });
  },
});

export const IconSizesStory = defineStory({
  id: "icon-sizes",
  title: "图标 · 尺度与文字关系",
  group: "图标与品牌",
  groupOrder: 60,
  component: "Icon",
  variant: "尺度与文字",
  description:
    "比较默认、16、20、24px 轮廓与相邻文字，并检查有名称的图像和图标按钮。尺寸与触达区域分别判断。",
  covers: [
    "Icon",
    "IconButton",
    "default / 16 / 20 / 24px",
    "theme stroke",
    "Icon.label",
    "accessible labels",
  ],
  render: () => (
    <div className="workshop-stack">
      <section className="workshop-stack" aria-label="尺寸参照">
        <h2 className="workshop-section-title">相同轮廓，不同阅读距离</h2>
        {[undefined, 16, 20, 24].map((size) => (
          <div className="workshop-row workshop-icon-scale">
            <span className="workshop-note">{size === undefined ? "默认" : `${size}px`}</span>
            <span>
              <Icon name="search" size={size} /> 查找组件
            </span>
            <span>
              <Icon name="file" size={size} /> 设计说明
            </span>
            <span>
              <Icon name="folder" size={size} /> 当前项目
            </span>
          </div>
        ))}
      </section>
      <section className="workshop-stack" aria-label="主题笔画参照">
        <h2 className="workshop-section-title">主题决定笔画和触感</h2>
        <div className="workshop-row">
          <span className="workshop-note">MeowUI 标准主题</span>
          <span className="workshop-icon-state-sample">
            <IconButton label="studio 搜索" data-icon-action="studio">
              <Icon name="search" />
            </IconButton>
            <span className="workshop-note">可用</span>
          </span>
          <span className="workshop-icon-state-sample">
            <IconButton label="studio 不可用的搜索" disabled>
              <Icon name="search" />
            </IconButton>
            <span className="workshop-note">不可用</span>
          </span>
        </div>
      </section>
      <section className="workshop-row" aria-label="独立图像名称">
        <Icon name="folder" size={24} label="项目文件夹" />
        <span className="workshop-note">独立图像可命名；按钮中的装饰图标由按钮说明动作。</span>
      </section>
      <p className="workshop-feedback" role="status" data-feedback>
        使用 Tab 与 Enter 操作图标按钮。
      </p>
    </div>
  ),
  setup({ root, report, onCleanup }) {
    const onClick = (event: Event) => {
      const button = (event.target as Element).closest<HTMLElement>("[data-icon-action]");
      if (!button) return;
      const message = `${button.dataset.iconAction} 搜索已触发`;
      root.querySelector("[data-feedback]")!.textContent = message;
      report(message);
    };
    root.addEventListener("click", onClick);
    onCleanup(() => root.removeEventListener("click", onClick));
  },
});

export const BrandIconsStory = defineStory({
  id: "brand-icons",
  title: "图形 · 品牌与便捷入口",
  group: "图标与品牌",
  groupOrder: 60,
  component: "Brand icons",
  variant: "品牌与便捷入口",
  description: "品牌与插画保留自身构形，功能图标便捷入口复用同一 Lucide 轮廓。切换明暗检查可读性。",
  covers: [
    "MeowlandMark",
    "DoodleCat",
    "GithubIcon",
    "NotesIcon",
    "TasksIcon",
    "SearchIcon",
    "PlusIcon",
    "ExternalArrowIcon",
  ],
  render: () => (
    <div className="workshop-stack">
      <section className="workshop-brand-grid" aria-label="品牌与插画">
        <figure>
          <MeowlandMark />
          <figcaption>MeowlandMark</figcaption>
        </figure>
        <figure>
          <DoodleCat />
          <figcaption>DoodleCat</figcaption>
        </figure>
        <figure>
          <GithubIcon />
          <figcaption>GithubIcon</figcaption>
        </figure>
      </section>
      <section className="workshop-row" aria-label="Meowland 品牌小尺寸">
        {[16, 24, 32].map((size) => (
          <span className="workshop-row">
            <span style={`display:inline-flex;width:${size}px;height:${size}px`}>
              <MeowlandMark />
            </span>
            <span>Meowland · {size}px</span>
          </span>
        ))}
      </section>
      <section className="workshop-stack" aria-label="功能图标便捷入口">
        <h2 className="workshop-section-title">便捷入口与 Icon 共用轮廓</h2>
        <div className="workshop-icon-grid">
          {(
            [
              ["NotesIcon", NotesIcon],
              ["TasksIcon", TasksIcon],
              ["SearchIcon", SearchIcon],
              ["PlusIcon", PlusIcon],
              ["ExternalArrowIcon", ExternalArrowIcon],
            ] as const
          ).map(([name, Graphic]) => (
            <div className="workshop-icon-item">
              <Graphic />
              <span>{name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  ),
});
