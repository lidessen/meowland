# MeowSlides 开发

本包拥有演示 runtime、页/步骤/活动 Context、媒体生命周期、演示内容组件、主题与可信本地 MDX 创作工具。先读 README、根 AGENTS 及所属技能。UI、普通布局和标准 UI 主题仍由 Meowtail 提供。

- runtime 根、`/registry`、`/theme` 不导入 build、CLI、MDX 编译器、文件系统或 Meowbook；`/mdx` 只提供生成内容的运行时适配。
- 新演示 Context、contract、token 与 fragment 只有一个 owner；不得保留 Meowtail 反向导出或内联第二份 core。
- 外包消费只走 public exports。主题组装复用 `standardThemeTokens`、`standardThemeStyles` 的原对象；不要从 CSS 文本重建身份。
- MDX、配置及本地组件是可信代码；不把上传/生成文本自动执行，不把有限 JSON 变成 evaluator。
- 源码与测试英文，文档中文。stories 只消费共享组件、给数据和交互，不复制播放器。
- 单测在 `tests/unit/`，类型在 `tests/types/`，真实浏览器在 `tests/browser/`；工具侧测试在 `tests/build/`。先统一 build，再做消费型检查。
