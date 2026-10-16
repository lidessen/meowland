---
name: jsx-css-development
description: Develop or debug MeowJSX core/Web rendering, reactive lifecycle and module identity, generic JSON descriptions, or MeowCSS generation and adapters. Not ordinary UI composition.
---

# JSX 与 CSS 机制开发

先从实际消费者的失败或新增用法定位负责层，不从文件名决定拆包。读 [MeowJSX](../../../packages/meowjsx/README.md) 或 [MeowCSS](../../../packages/meowcss/README.md) 当前合同，以及相近实现和有独立价值的用例；只涉及其中一层时不加载另一层全套材料。

## 先保住环境与身份

core 的值、响应式、Context 和目标中立 renderer seam 留在 `meowjsx` 根；DOM/event/HTML/mount 留 `meowjsx/web`。同包子路径不代表根可以回导 Web，公开声明的类型依赖也属于环境边界。

MeowCSS 根保纯 token/options、参数片段与 CSS/主题生成；`meowcss/meowjsx` 承担组件 contract/registry/carrier，`meowcss/web` 承担 DOM 生命周期。具体 UI token 值、parts 实例、主题和语义布局属于 MeowUI。不要提前把 typed fragment 转字符串来绕过类型或组件绑定。

沿真实 import 图确认根、runtime、JSX runtime、Web 以及 CSS adapters 引用同一份内部实现。相同版本的两个物理副本仍可能分裂 Context 或 token 身份；不要用全局 singleton 补救，也不要禁止合法的多个显式 Runtime。

## 按消费者验证改动

- renderer/reactive 改动检查可观察输出、更新、重排与卸载；按实际风险保留节点/焦点/Context 和 cleanup 关系，不用私有结构快照代替行为。
- 类型边界改动实际编译无 DOM 的 core/CSS 消费者及相关 Web 消费者。包的全部 typecheck 或 `--check --package` 不自动等于无 DOM 检查，准确命令与覆盖范围见[开发检查](../../../docs/development-checks.md)。
- 公开跨入口身份改变时，让真实 Signal/effect、Provider 或 TokenSet/fragment 穿过入口验证；版本列表相同不是证明。仅内部算法修正不默认要求五包重新打包。
- 通用 JSON 机制读 [MeowJSX JSON](../../../packages/meowjsx/JSON.md)：描述、校验、binding/action 引用和生命周期由现合同承接。不能从 TS 类型推断运行时 schema 已存在，不能用 eval、动态 import、任意宿主路径或 raw HTML 补缺口。具体 UI catalog 的支持集交回 [UI 开发](../ui-development/SKILL.md)。

若改变公共合同、职责或生命周期，按 [design-change](../design-change/SKILL.md) 收敛影响；既定机制的局部修正直接实施。交付说明消费者变化、环境与身份验证、必要下游影响和未验部分，不把编译通过扩写为浏览器或安装态通过。
