# 开发技能入口

这里的技能用于开发和维护 Meowland，不是运行时协议，也不提供额外权限。先按根 AGENTS 与包 README 确定当前合同，再选择会改变本次行动的方法。

| 自然任务                                                                    | 使用技能                                                         | 主要资料                                                                   |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 改 JSX/reactive、生命周期、Web renderer、通用 JSON 描述或 CSS 生成/适配机制 | [jsx-css-development](skills/jsx-css-development/SKILL.md)       | MeowJSX、MeowCSS README；通用 JSON 合同                                    |
| 做或修组件、完整 Assistant、有限 UI JSON catalog；检查真实布局与交互        | [ui-development](skills/ui-development/SKILL.md)                 | Meowtail 合同、Assistant/JSON 说明；按需 Meowbook 视觉取证                 |
| 改公共导出、类型、依赖、包资源、CLI，验证 tarball 或准备本地发布            | [package-delivery](skills/package-delivery/SKILL.md)             | 包 manifest/README、开发检查、本地发布合同                                 |
| 规划跨包工作、锻打职责/公共合同/生命周期等机制，选择足够的验证              | [design-change](skills/design-change/SKILL.md)                   | 本次需求、受影响合同与真实反例                                             |
| 与人共创或局部改稿浏览器演示，迭代叙事、视觉、素材与互动                    | [presentation-authoring](skills/presentation-authoring/SKILL.md) | 作品 README、[演示样例](../examples/presentation/README.md)、Meowbook 合同 |

普通按钮文案不需要包发布验收，局部实现不必先做架构设计。JSON core 的描述/引用机制归第一项，具体 UI catalog 与 Assistant 用法归第二项；跨两者的任务只补读接合处。Meowbook 工具源码按实际机制归开发任务，场景观看与截图方法归 UI 技能。

检查命令唯一入口是 [docs/development-checks.md](../docs/development-checks.md)，发布命令唯一入口是 [docs/releasing.md](../docs/releasing.md)。技能不维护第二套命令表、项目进度或发布状态；当前包名与许可等阻断去根 README 和当次回执核对，不把历史失败变成永久规则。
