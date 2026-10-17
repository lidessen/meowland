# Meowtail 组件开发

`meowtail` 是 npm 身份；既有 MeowUI API、插件名与 DOM/CSS 标记仍是实现合同，不随包目录名机械替换。

通用组件先在本包实现，在 Meowbook 查看真实内容及交互，再由应用接入。应用拥有业务状态，
组件拥有可复用结构，标准主题拥有视觉实现。先读 README 和最相近的现有组件，不另起一套尺度。
设计新组件及组合时先读本包 README、[原 MeowUI 设计规范](https://github.com/lidessen/rossovia/blob/046b044e1bfde8c79b186fab2948ba2260371790/docs/architecture/ui/meowland-ui-design.md)（历史参考），
从任务推导形式与样式；本文件补充实现归属和接线约定。

## 默认尺度与组合

- 默认设计以 DeepSeek Harness 为基准：标准按钮高 36px、紧凑按钮 28px、输入框 32px。
  信息块内部紧凑；页面边缘、独立区块和阅读区域保留充分留白。
  group / section / panel 不是页面间距的上限，不把局部紧凑扩展成整页压缩。
- 先使用 `src/theme/tokens.ts` 中 `uiTokens` 的正文、辅助文字、控件高度和三层间距。
  不在新组件里另拍一组 rem 字号、大 padding，再与现有控件拼接。标题通过语义与字重区分，
  不是所有问题、字段标签都使用页面标题字号。具体尺寸由主题决定，不把某套数值当成通用审美。
- 根据关系选间距：字段内用 group、相关区域之间用 section、独立容器边缘用 panel。
  检查父 padding、子 padding、gap 和段落 margin 的实际累计；不要只看各值单独是否合理。
- 宽度要服务于内容。短问题、少量选项与动作不默认铺满画布；相邻操作不无理由用
  `space-between` 或 `margin:auto` 拉开。阅读区域可以宽，控制组应保持可辨认的聚合关系。
- 新组件的示例与现有 Button / Input / Field / Card 同屏比较，使用“默认尺度 · 控件与组合”
  gallery 及真实应用组合入口作参照。至少实际看桌面、窄屏和相关主题，并操作选项、键盘及反馈。
  先看比例，再看局部像素。页面布局也从 DeepSeek 出发适配业务，旧页面只用于核对功能与行为。
- 主题 token 不能代替设计判断，也不要求所有组件一样大。可因长文、触摸操作或媒体等实际需要偏离，
  但在真实组合中解释和验证，不靠全局缩放、统一压小或给每个组件另加 density 开关处理。

## 复用边界

同一定位的组件只有一个实现归属：通用结构、交互和完整 Assistant 实现在 MeowUI `src/`，由应用消费；产品业务组件与状态适配留在各宿主。不得在 stories、
workshop 或 Storybook 中另写同一定位的 Composer、消息列表、导航或业务面板。

Storybook 及各模块的 stories 只提供 gallery：挂载真实组件、排列变体、传入固定数据、
驱动 props 和模拟范围外的环境。展示容器与示例 children 可以组合已有组件，但不能
承担被展示组件的结构、样式或交互实现。需要新的组合能力时，先确定通用或业务归属，
在所属 `src/` 实现并供实际消费者使用；不把演示专属假产品搬到生产目录凑归属。
退出产品的视图与历史设计样板不进入当前产品 gallery，研究资料保留在独立研究入口。

排列、对齐和语义间距优先复用 Stack / Inline / Grid，子项伸缩使用 LayoutItem；
业务宽度、断点和文本策略由应用决定，不要求所有元素额外包装。

共享组件不读取 Dashboard 状态、问题生命周期或业务接口；使用 props、children 和事件交给调用方。
默认样式在本包主题中成立，不依赖 story-only CSS 或宿主覆盖才能达到可用效果。
不为审美创建硬编码像素测试或固定评分门禁；原生语义、事件、表单和状态合同使用测试验证。

## 测试组织

测试遵循测试文件组织规范（原产品仓库历史参考）。`src/` 不放测试；
Bun 行为与合同测试在 `tests/unit/`，类型用例在 `tests/types/`，真实浏览器测试在
`tests/browser/`。unit 下按 components、chat、icons、shared、theme 归属，文件名使用
组件或合同名称，不沿用改版批次。组件结构合同归 components/chat，主题生成合同归 theme。
先审视已有用例的独立价值，再新增或拆分；相同输入和结果的重复测试合并，视觉常量不作为
审美验收。具体命令与类型检查入口见 README。

## 样式实现

CSS 模板文件统一采用 `<职责>.styles.ts`，标准主题按 components/chat/icons/shared 归属，
同一组件族的基础、状态和响应式规则归同一处。完整规则与当前组织见
样式文件组织（原产品仓库历史参考）。

通用样式机制来自 `meowcss`，不在本包维护第二套实现；typed part 组装从 `meowcss/meowjsx` 导入，DOM 主题绑定从 `meowcss/web` 导入。主题源码使用 TS 的 `css` 模板。引用 `uiTokens` 和 `partSelector(contract, part)`，
组件选项条件使用 options.when；不要手写生成变量名或另建视觉类名映射。
组件通过 contract 声明样式选项及默认值，由 `createMeowUI` 的适配器接线。
`standardTheme.cssText` 交给宿主显式组合：静态构建生成 CSS 资源，动态文档使用
`mountStyles` 并清理；根配置使用 `Theme`、`applyTheme` 或 `themeAttributes`。
导入样式模块不操作 DOM。业务布局保留在应用，样式和配置安装不替代组件注册。
