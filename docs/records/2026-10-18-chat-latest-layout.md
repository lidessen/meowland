# 回到最新：历史阅读与正常流布局

本轮从 `c495707` 继续处理共享默认遮挡问题。只修改 Meowtail 的对话组合、主题、文档和回归场景；没有修改 iOS/Rossovia、未知 `data/`、课件或依赖版本，没有推送、发布或部署。

## 复现与选择

iOS 线程提供了普通浏览器最小复现：`/Users/lidessen/Documents/Codex/2026-10-17/task-2/ios-visual-review/evidence/component-audit/latest/README.md`。本轮只读该证据，没有在其工作树运行构建或写文件。

在本库当前 public exports 上重新复现：375px、900px 两种宽度，公共 `ChatConversationLatest` 片段和完整 `ChatConversation` 均遮挡历史正文。独立审查又在真实 `assistant-complete` 场景确认同因问题，因此一并修复完整 Assistant 的默认组合。旧 dist 的六个回归全部在真实文字行相交断言上失败。

测量通过文本节点的 `Range.getClientRects()`，将文字行裁到实际 viewport，再检查与按钮的交集，没有拿整个段落外框或视口外的文字推断遮挡。375px 的公共片段和完整 Conversation 改前各有两处交集，Assistant 采样有四处；改后为零。改前、改后使用相同内容和尺寸，原图与几何 JSON 保留在 `artifacts/chat-latest-review/`。

独立审查同意最小方案：让返回动作参与正常布局，显示时取得自然高度，隐藏后归还空间。不能用内容末端 padding 保护任意历史位置，也不添加 iOS offset、第二个 scroll controller 或新的布局 DSL。

## 实现与合同

- `ChatConversationLatest` 默认是正常流按钮，保留原生按钮、hidden、事件和 children 合同；允许长文案自然换行。
- 完整 `ChatConversation` 使用列布局，唯一 viewport 领取剩余空间；移除 viewport 内联 `height:100%` 与旧的 40px 内容末端补偿。根、viewport、content 和 latest parts 均保留，原 append-only controller 不变。
- 完整 `AssistantView` 的消息区域也改为列布局；latest wrapper 取得自然高度，并由原 `latestHidden` 控制整行显隐。原按钮的样式与动作保留，长文案约束仅作用于这一个局部 Button，不改全局 Button。
- README 给出 public Stack/LayoutItem/Latest 的公共片段组合：有限高度、唯一滚动视口与兄弟动作行。宿主已有控制器继续负责显隐、跟随、保位、返回末端和焦点；片段不会自动补齐任意宿主的高度或定位布局。完整组件的默认行为不需要调用方额外接管滚动。
- 现有 Conversation story 使用同一共享实现，说明返回动作位于正文视口之后；没有用 story-only CSS 代替组件修复。

## 实际验证

生产代码统一 build 后未再变更，执行与结果如下：

| 检查                                         | 结果                                                                                                    |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `bun run build`                              | 六包构建通过。                                                                                          |
| `bun run typecheck`                          | 根命令覆盖的全部类型环境通过；另有 Meowtail 包整体 tsc 通过。                                           |
| `bun test packages/meowtail/tests/unit/chat` | 43/43、289 assertions，通过现有 controller、SSR 与对话合同。                                            |
| 新 `conversation-latest-layout.spec.ts`      | 8/8，包含三种公共组合的 375/900 历史阅读与键盘返回，以及长文案。                                        |
| 既有相关 Playwright                          | 14/14：Conversation、Assistant、Agent Assistant、Composer 布局、RegionLayout 和 workspace composition。 |
| Meowtail fmt / lint                          | 整包支持范围通过；本文另作格式与 diff 检查，未扫描未知 `data/`。                                        |

新浏览器回归验证 Enter/Space 返回末端、viewport 获焦、动作隐藏；完整组合的历史追加与缩容保位、回底后继续跟随；24px 阈值两侧连续 12 帧显隐稳定；短窗口无文字交集。Assistant 在后台追加与 844→500px 缩容时保持草稿值和输入焦点，不因内容或尺寸变化主动夺焦。

独立复验使用当前 dist：375×600→375×500，Assistant 的历史 `scrollTop=140` 在追加和缩容后保持；按钮顶部始终在消息 viewport 底部之后，Enter 返回距离末端为零且交回焦点。独立长中英/无空格文案的布局 probe 无横向溢出或文字交叠；该 probe 直接改可见文字，只证明布局，未冒充 props 生命周期测试。

作者、协调者和独立审查者已实际打开改前/改后原图，覆盖窄屏、宽屏与 375×500 短窗口。短窗截图是实际 viewport，不以 full-page 长图冒充。完整 Assistant gallery 还有示例控制区、页头和多行草稿，500px 时阅读区较小；该宿主预算没有被宣称为新库缺陷或整屏视觉定稿。长动作按自然高度进一步缩小阅读区是有限空间分配的结果，本轮没有改成覆盖正文的浮层来掩盖它。

这是 Chromium/Chrome 与缩小可用空间的验收，不是 iOS/WK 真实软键盘、视觉视口或系统缩放验收。本轮没有重跑无关 Slides/课件、全仓单测或新 tgz 安装矩阵，也没有升级 iOS 当前消费包。自建服务和浏览器均已关闭，未操作用户已有服务。

## Library 原图

| 图                        | 完整 Library ID                            |
| ------------------------- | ------------------------------------------ |
| Conversation 改前 375     | `libfile_a2e03d2590cc8191a4c6aecc95321955` |
| Conversation 改后 375     | `libfile_ac33c657fb848191b1f443aeb9a81e06` |
| Conversation 改后 900     | `libfile_8953c90235508191b7ce50ed0cc173a8` |
| Conversation 改后 375×500 | `libfile_070e0a29543c8191bc80ac2712402130` |
| Latest 片段改后 375×500   | `libfile_879a5bcc40a8819180b2e0bbd05891ad` |
| Assistant 改前 375        | `libfile_439e42fe38a481919a298537343e1b88` |
| Assistant 改后 375        | `libfile_252cae2b23608191ad2caa47f1125c56` |

图片均为本库本地 fixture，不能当作 iOS 产品截图。默认组合的确定遮挡、独立审查和上述定向回归已闭环；宿主自定义绝对定位或额外 controller 的效果仍需由该宿主验证。
