# Meowtail 默认质量与组合边界检查

本轮沿实际 `meowtail` 名称执行，没有重命名。起点为 `bc015b4`，开始时仅存在未知未跟踪 `data/`；本轮没有读取或修改该目录，没有修改 iOS/Rossovia、独立原型、课件内容或整体配色，没有推送、发布或部署。

目标是让正确接入公开组件的作者得到可靠默认值和可组合的布局，而不是用展板 CSS 补丁或固定页面模板遮盖共享缺陷。按主题基础、移动对话、接入/示例、独立质疑分工，实施者和审查者分开。

## 两轮闭环

第一轮使用正确注册、完整标准 CSS、主题根和同一 runtime 的公开消费路径，比较无 preview CSS 的真实组件与现有 Meowbook 场景。确认普通正文与控件字体断裂、窄卡片标题被固定两列挤压、完整 Assistant 附件动作在移动输入行之外。分别修主题基线、CardHeader 和完整 Assistant 接线，并回到相同输入截图及键盘操作。

第二轮引入真实复合页面与 iOS 只读审计的最小反例：Frame 的祖先选择器与宿主 footer 同时拥有边距；普通 IIFE 下 SVG 只读属性赋值静默失败。新增会在旧版本失败的回归，独立复核，再运行统一最终构建的工程和浏览器检查。

独立质疑改变了实现选择：给 CardHeader 建尺寸容器会切断自然宽度贡献，header-only 按钮卡的宽度可从正常内容宽塌到仅剩 padding。最终采用不含 size containment 的 intrinsic grid。另一个“嵌套 Card 样式 specificity 失效”的候选被 computed style 排除，未作为缺陷或修复交付。没有把暗色透明根猜成白底问题。

## 共享修复

| 修复                       | 原问题与最终行为                                                                                                                                                                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 标准主题正文基线           | 正确安装、无 preview CSS 时，普通 p 是 Times 16px，Button/Input 是系统字体 14px。最外层主题入口现提供 font-family/body 字号/行高；嵌套主题保留作者字号，局部 appearance 重新解析文字颜色。规则低 specificity，未加入全局 margin、h/p reset 或页面背景。 |
| CardHeader 自身宽度适配    | 原 390px 场景长标题被挤为六行。复用现有列宽 token 的 auto-fit grid，在窄卡和宽窗口的窄侧栏中让动作落到说明之后；宽处仍并列。无新 wrapper、API、断点或 containment，保留无说明、Action 在前、自然宽卡及嵌套卡组合。                                      |
| AssistantComposer 附件动作 | 原完整组合使用 Button，而移动布局匹配 IconButton，附件因而多占一行。换成已有 IconButton，保持原生按钮、标签、disabled 和同步 file chooser。当前同一 story 的移动表单本体从 80px 降到 52px，桌面 98px 不变；这些是场景测量，不是 iOS 实机尺寸。          |
| Frame/Composer 唯一外缘    | Frame 的阅读边距现只作用于直属 Composer。嵌入 footer/Card 的 Composer 使用其容器内自然宽度；不再被任意祖先 Frame 再收窄。375px 的外部最小复现原为直接 x20/335px、加 footer 后 x40/295px，回归覆盖同一重复 inset 机制。README 明确包装容器的空间归属。   |
| Web renderer SVG fallback  | 普通 minified IIFE 对 getter-only `viewBox` 赋值不抛错，旧策略提前返回。现仅在 `Reflect.set` 成功时返回，false/throw 都进入原 attribute fallback。ref/style/events/null/boolean 分支未扩张，SVG 图形本身未改。                                          |

README 前置完整浏览器接入与销毁示例；ButtonsStory 使用现有 Container/Stack/Inline/LayoutItem，移除该场景对 workshop 布局类的依赖。零 preview CSS 下实看 1440、390、320 和短窗口，按钮既定 36px 尺度不变。没有为本轮新增 density 开关、自动安装器或强制 DSL。

## iOS 归因界限

iOS 审计路径为 `/Users/lidessen/Documents/Codex/2026-10-17/task-2/ios-visual-review/component-integration-audit.md`。生产确实使用 15 类公开组件并正确加载主题，body 已补系统字体、颜色与背景，所以主题基线缺口不能解释其主要视觉问题。

Frame/footer 双 inset 与库内复现吻合，是本轮直接处理的共享组合边界。逐条时间、短记录使用默认 28px turn gap、多条状态带、页头/footer 层级，以及 plain p 而非安全 Markdown 的选择，仍同时涉及库默认和宿主编排；本轮没有凭候选图泛改消息密度或伪造完整 Assistant 对 native ACK/切换/unknown 的适配结论。Composer 已有窄屏与 16px 输入适配，未宣称库没有移动支持。

SVG 缺陷独立成立，但原生产没有 Mark/avatar，不能以此解释整页外观。受控 Select 的一般 WK options/value/disabled 更新原因尚未证明，本轮未将它混入 SVG 修复。没有重新运行真实 WK、软键盘或缩放验收，也没有升级 iOS 当前锁定安装包。

## 最终检查与实际观察

统一 build 后没有再改生产实现。最终检查使用同一源码组合：`222c27c`、`64631a9`、`e23ed36`，随后仅整理既有测试归属与本文。

| 检查                          | 结果与范围                                                                                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun run build`               | 六包构建通过。                                                                                                                                                      |
| `bun run typecheck`           | 全部根定义的生产、公共类型与消费者环境通过。                                                                                                                        |
| `bun run test`                | 356/356、2295 assertions、74 文件通过。初次受 sandbox 本地 listen 限制，允许 localhost 后重跑通过，不是产品失败。                                                   |
| Meowtail Playwright           | 全部 166/166 通过，含明暗宽窄 story matrix、布局、滚动、toolbar、表单、弹层、键盘、草稿和新增反例。                                                                 |
| MeowSlides 组件 Playwright    | 29/29 通过。全 UI 首次发现 ArtText 5 项仍归 Meowtail、请求已迁出的 story；仅把原用例移到 Slides 真实展板，保留所有断言，两个套件均通过。                            |
| MeowSlides runtime Playwright | 33 项最终通过：全套 31 项先过，另两项依赖文档已说明的 13009 作品服务；补起该服务后只重跑两项，2/2 通过。未把第一次缺服务记为全套成功。                              |
| MeowJSX DOM Playwright        | 3/3，通过真实普通 IIFE、严格 IIFE 与 ESM；断言实际 strict 状态、SVG 初始/Signal 更新、HTML value/checked、事件及 ref/unmount 清理。旧普通 IIFE 稳定红，新三格式绿。 |
| 真实消费者                    | showcase 2/2；Sunshine 11/11；Panda 13/13；image-loading 4/4，均以当前库重新构建。课件内容未改。                                                                    |
| fmt / lint                    | 最终全仓支持范围通过，额外排除未知 `data/`，不读取该目录；保留工程原有忽略范围。未用整仓格式写入覆盖其他内容。                                                      |

浏览器总计 261 项通过，runtime 的两项如上分开记录。fmt/lint 是静态检查，浏览器断言与亲看原图是不同证据；本轮未做新 tgz 的独立安装验收或正式发布，也没有运行无关 MDX dev/HMR 全矩阵。

原图实际审查覆盖 Card 1440×1000、390×844、390×500、暗色窄侧栏；Assistant 宽屏、390×844、390×500；无 preview Buttons 的宽/窄/320/短；Sunshine 窄屏与 Panda 短窗口。短 Card 保持自然文档滚动，没有用 full-page 长图冒充短窗口全部内容同时可见。独立 reviewer 实际操作窄侧栏、Tab、resize 与原草稿 DOM 保持，未发现新关键阻塞。

详细可重复探针、computed facts 与未加工截图位于忽略目录 `artifacts/meowtail-default-quality/`、`artifacts/chat-mobile-review/`、`artifacts/meowtail-adoption-audit/`、`artifacts/svg-property-review/`。本轮自建服务与浏览器均已关闭，没有关闭用户已有服务。

## Library 截图

以下均已成功保存，完整 ID 可直接交付；Assistant 图是库的真实 agent-workflow 场景，不是 iOS 产品图。

| 图                                | Library ID                                 |
| --------------------------------- | ------------------------------------------ |
| Card 改前 390                     | `libfile_8236714ad4c88191a206aaf0d2698d8b` |
| Card 改后宽屏 1440                | `libfile_45148e18ef708191b88b0975c7a60b21` |
| Card 改后窄屏 390                 | `libfile_53f8031ce0a08191aa9b29ab27d5eb5f` |
| Card 改后短窗口 390×500           | `libfile_6b1065cec9b08191964105f33fca8496` |
| Assistant 改后窄屏 390            | `libfile_4c8989883dac8191a73bdc1d37af05f0` |
| Assistant 改后短窗口 390×500      | `libfile_7988656ecf208191ba5fbed1cd390670` |
| 无 preview CSS 的公开按钮组合 390 | `libfile_14142b34e4188191a77a37568070c715` |

本轮以高优先级的确定共享缺陷已修、独立两轮审查无新增关键阻塞和上述最终验证通过收敛；不把功能与几何检查当作全部产品视觉已获认可。
