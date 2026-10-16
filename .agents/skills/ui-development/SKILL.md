---
name: ui-development
description: Build, refine or review MeowUI components, complete Assistant views and the finite UI JSON catalog, using real Meowbook scenes for relevant visual and interaction evidence.
---

# UI 开发与实际走查

读 [MeowUI README](../../../packages/meowui/README.md)、[组件开发约定](../../../packages/meowui/AGENTS.md)和相近组件。先明确用户在这里读取、比较或操作什么，再判断结构、视觉与反馈；已有设计语言下的局部打磨不必重做全产品设计。

## 默认体验与实现 owner

通用结构、交互、标准主题和完整组合在 `packages/meowui/src/` 实现。story/showcase 只提供内容、状态和范围外宿主动作，不能用专属 CSS、复制 composer 或一整套假页面掩盖默认能力缺失。

沿真实主题 tokens/parts 判断阅读轴、比例、累计留白、控件关系和状态。使用 token 不自动证明协调；先修影响任务的一处关系，改后回到同一场景观察。配色或尺寸不以硬编码像素断言评定美感，交互合同仍用有意义的测试保护。

完整组合读 [Assistant 合同](../../../packages/meowui/ASSISTANT.md)：默认布局与常见交互应可直接用，slots 只替换局部。区分局部 UI 状态与宿主事实，受控/本地草稿只留一个 owner；发送接受只消费本次快照，不清后来编辑，也不把 returned 当目标完成。来源、执行、问题资格、上传和持久化仍由宿主提供。

具体 JSON 用法读 [UI catalog](../../../packages/meowui/JSON.md)。JSON 与 JSX 使用同一组件/主题，不造第二套 UI。只扩实际支持的有限字段，保 schema、catalog 与组件类型的接合；File、函数 slots 等能力按当前合同处理，不通过任意属性或 renderer 逃生口绕过限制。若要改变通用描述/引用机制，再读 [JSX/CSS 开发](../jsx-css-development/SKILL.md)，不用为每个 UI 字段重审 core。

## 选择足够的观察与回归

先在真实组件场景中查看，再到受影响组合核对；代表内容应包含会改变布局或动作的长文、错误、等待、禁用等状态，不把占位图当完整能力。按改动覆盖键盘/焦点、滚动、输入草稿与清理，不机械重跑全部场景。

实际画面、摄影与交互取证按需读 [visual-checks.md](references/visual-checks.md)。只做视觉审查时，默认不扩大成源码审计或全测试；用户要求修复时追到组件、主题或宿主 owner，修改后复验原动作。自动检查入口见[开发检查](../../../docs/development-checks.md)，其通过不替代看图和操作。

返回最重要的可见关系、改动及真实证据：对应场景/状态、实际主题和尺寸、看过的原图与操作、检查结果及未覆盖范围。纯建议、实际修复、有限浏览器行为与用户接受分别说明。
