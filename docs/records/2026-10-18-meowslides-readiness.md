# MeowSlides 首版 alpha 发布就绪审查

日期：2026-10-18。范围为公开入口、可信本地 MDX dev/build、静态交付、播放器/布局/主题/媒体/互动组合及实际 tgz 消费。没有发布、公开占位、npm trust 修改、推送或部署；没有读取未知 data、修改课件内容或 Rossovia。

## 结论与发布前最小步骤

功能实现与修复后的安装态产物可作为首版 alpha 候选，当前 manifest 和发布接线尚不能直接发布。建议首版为 `meowslides@0.1.0-alpha.0`、dist-tag `alpha`，不移动 `latest`；实际执行前重新只读核实目标版本和公开状态，并确认 trust 配置。OIDC 发布权限只能由获准执行的对应操作确认，不能由只读检查证明。

1. 新发布提交必须包含 `b583369` 的共享 ESM 发射修复。当前 `0.1.0-slides.20261018.1` 只是私有本地版本，不是拟发布版本。
2. 为 Slides 明确设置规范 alpha 版本、移除 `private: true`、补同仓库 repository 元信息，确认 corrected Meowtail alpha 的 peer 范围；同步 README 中私有候选状态。不为 alpha 增加尚无具体需求的功能。
3. 将 Slides 加入发布包白名单、显式选择校验和隔离消费验收；覆盖五个公开子路径、CLI/类型/资源、MDX 与 TSX、共享身份及原生 Node 主题导入。继续只用手动发布流程，不增加 push/tag 自动发布。
4. 从包含上述变化的全新提交 build/pack，生成新的精确 SHA/哈希发布输入，完成对应安装态验收和 dry-run。获得这份新输入的执行授权后再发布；本回执不是发布授权。

### 冻结 857 与本轮修复的区别

原四包发布输入仍为 `857c0fbb095846fd18defeab0821ebfade20eda3`，目录 `artifacts/npm-oidc-release-20261018/` 的 manifest 与四个 tgz 未改。该输入不包含 ESM 修复，也不包含 Slides；**不建议继续发布这份旧输入，不能因本轮新候选通过而触发它**。旧 Tail 主题在原生 Node 下实际加载失败，Book 同样有需纠正的发射路径。

本轮新目录 `artifacts/meowslides-esm-repair-audit-20261018T152320Z/` 明确为 non-release candidate。为比较字节保留旧版本字符串，没有替换原候选或生成新的发布授权。JSX/CSS tgz 与旧输入相同；Tail/Book/Slides 分别仅有 3/1/8 个文件补齐相对 import 的 `.js`，manifest、文档和资产未变。是否沿用尚未发布的版本号，须在新发布计划中核实 npm 状态后决定；即使沿用版本号，也必须是新提交、新哈希输入。

四包先前的 workflow_dispatch 被自动批准审查阻止，仍未执行；本轮没有重试或绕过。既有 npm trust 状态也没有变化。

## 两轮实际闭环

第一轮独立检查 runtime/registry/theme/mdx/build 的依赖方向、公共类型、主题 token/fragment 身份、按页懒渲染与 session、媒体活动许可和可信代码边界；另一个 owner 实际打包并在 `/tmp` 全新消费者安装 tgz。Bun、类型与浏览器构建正常，但原生 Node 单独加载 `/theme` 得到 `ERR_MODULE_NOT_FOUND`：共享 build 把 `.styles`/`.tokens` 当作已经完成的扩展，未补 `.js`。其他四个 Slides 入口单独 import 成功，不能把主题失败扩大成所有入口失败。

修复由独立质疑者先限定解析顺序，再落入共享构建器：显式 `.js` 不再追加；真实输出文件优先，否则只在实际目标存在时补 `.js` 或 `/index.js`。没有在 Slides 源码加补丁或内联第二份主题/runtime。新增真实 tsc 小工程再交原生 Node 加载，覆盖跨 dotted modules、重导出、动态/副作用/目录导入及同一导出身份；另保护 CSS/JSON/MJS 与显式 JS 路径。

第一轮完整播放器浏览器检查另有 2 项连接失败：测试硬访问真实作品 13009，而配置只自动管理 13019。现改为配置同时 build→serve 正式作品及启动合同服务，明确端口、不复用已有服务，结束时自动退出；未改作品内容或降低断言。

第二轮用全新五包 tgz、全新消费者重新检查，Node 五入口均可加载，Bundler 与 NodeNext 严格类型通过。统一 build 在最后显式 `.js` guard 收紧后重跑，六包所有 emitted 文件路径与字节未变，因此保留已验收 tgz。实际安装态分别运行最短两页 MDX 的 dev/static、TSX runtime 宿主，以及自制 SVG、导入 TSX、Reveal 和跨页 session 的三页 MDX；实际键盘、前后导航、焦点返回与图片解码均通过。

## 本轮验证结果与边界

- 最终源码单测全量：359 项、2247 条断言、78 个文件通过；其中新增 ESM 回归 2 项。Slides 定向 unit/build 为 30 项、267 条断言。
- 六包统一 build、根 typecheck、lint、format 检查通过；另有浏览器测试工程类型检查。
- 本轮实际重跑 Chrome 浏览器：播放器 33/33，Meowbook 组件 29/29，MDX 作者 8/8。初次播放器为 31 过、2 个服务缺失失败；配置修复后的完整 33 项通过，13009/13019 均自动退出。
- 新 tgz 安装态：26 个 Bun 公共入口、Node 五个 Slides 入口、跨包 Signal/Context/自动 JSX/主题身份、Bundler 与 NodeNext 的 core/browser/build 严格类型、已安装 CLI dev/build、独立 TSX 构建均通过。Node `/build` 只证明可 import，实际构建执行仍要求 Bun。
- 五包文件白名单、exports/types/bin 目标、MIT 与资源检查通过；Slides 61 entries，没有夹带课程、素材、fixtures、截图或已知凭据字面量模式。该模式检查不声称穷尽所有秘密。
- 本轮新候选浏览器 12 个场景通过：四种消费入口各 1440×900、390×844、844×390。15 张原图中实际打开最终 static MDX、TSX 和复合图片三个视口共 9 张；图片四边和说明完整，外围控件可达。窄窗口按固定逻辑画布缩放，不承诺自动重排或手机正文充分可读。
- 单测第一次无提权环境的 loopback server 失败，授权启动本地回环服务后同套 30 项通过，不计作实现缺陷。

本轮没有把历史课件全套验收重新算作新结果；正式图片作品仅由播放器套件重新构建并走对应外框场景。没有重跑两个英语课件的完整专属套件、完整 Showcase、实体触摸/屏幕阅读器/投影音响、Safari/Firefox 或真实 BFcache 导航矩阵。MDX 不提供不可信代码沙箱、PPT 导出、完整 MDX TS/source-map 或保留状态 HMR；这些是当前已声明边界，不作为为发布而扩功能的理由。

## 精确证据

- 首轮失败回执：`artifacts/meowslides-package-audit-20261018T151630Z/receipt.json`，附 `node-entry-matrix.json` 和 `native-node-esm-failure.json`。
- 修复后安装回执：`artifacts/meowslides-esm-repair-audit-20261018T152320Z/receipt.json`，附 `candidate-byte-diff.json`、`final-guard-rebuild-identity.json`、五包哈希与 old857 unchanged 证明。
- 修复后 Slides tgz SHA256：`ff5ec035c7a78e0a51915bacb350effcc24af644e34425e471f08cc15fce81a2`；原失败 Slides tgz 为 `37b072f759be3811bd0d286ecf9921ce0ccbd9d1ebf3f7689119e20216b87e98`。
- 安装态浏览器脚本、geometry/交互结果及 15 PNG：`artifacts/meowslides-readiness-20261018/`。
- 截图包已保存 Library：`libfile_52ee7d4b1ccc8191b77620b9f91f7e80`，文件名 `meowslides-readiness-screenshots-20261018.zip`。

代码修复提交 `b583369`；测试服务修复与本回执另作本地提交。未推送。

收尾时发现其他任务并发修改 `packages/meowtail/src/theme/chat/composer.styles.ts`，并新增 `packages/meowtail/tests/browser/chat/composer-inline-layout.spec.ts`。已保留，未读取正文或纳入本轮提交；这份回执的产物身份以审查批次、dist 哈希与修复提交为准，不把这些后来的 WIP 计入已验收产物。
