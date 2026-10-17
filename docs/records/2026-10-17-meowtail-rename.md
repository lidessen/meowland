# Meowtail 独立包改名验收

日期：2026-10-17 UTC。结果：源码改名、隔离构建和本地 tarball 安装态有限验收通过；尚未推送或发布新包。

## 输入和兼容边界

基线为 `e471ef2882019edd94520a0205801c5a1a6a7b91`，改名源码本地提交为 `9ced4b9c4083ae8a9c1b80628330df857bf22256`。`packages/meowui` 移至 `packages/meowtail`，独立 npm 名称改为 `meowtail`，初始候选仍是 `0.1.0`，没有合并进 JSX 或 CSS。

旧包 382 个 tracked 文件均有明确对应，其中 297 个逐字节移动，生产 `src` 的 210 个文件全部与基线一致。其余修改限于包引用、路径、说明、场景名称和截图文件名等接入；包 manifest 仅改 name 和 description，公开 exports、依赖及 peers 保持原合同。`createMeowUI`、`installMeowUI`、插件名 `meow-ui`、既有 `data-meowui-*`、CSS token 和 Shiki 主题标识保留。

Meowbook、示例、showcase、构建和发布工具已使用新包名；lock 仅替换该 workspace 包引用，第三方解析字节不变。JSX、CSS、Press 的 tracked 包文件及重新生成的三个 tgz 均与原冻结输入逐字节一致。历史迁移回执只增加顶部注释，原正文和身份保留。

发布工具允许旧 manifest 中未选中的历史 `meowui`，但 inspect 和 release 均拒绝选择已退役名称，不把旧包、tag 或 tarball 自动映射为新包。

## 隔离构建

唯一完整检查在仓库外快照执行。`source-inputs.json` 记录 561 个明确源文件的路径、内容 SHA256 和 mode，其 SHA256 为 `ccbb91553fbec87d7d9e434e5a58ee0d42827a7208efa6b2f4ea24d59e8c8da9`。未知 `data/`、旧 artifacts、`.git`、dist 和原 node_modules 未纳入快照。

- 离线 frozen、ignore-scripts 安装成功；177 个包、688 个链接的 realpath 均在快照内。
- `bun run build`、`bun run check`、`bun run pack` 均 exit 0。
- check 包含格式、lint、类型、示例及 62 文件中的 314 个测试、1950 次断言，失败为 0。
- 检查后 561 个源输入与 live 文件和冻结清单均无漂移；打包仅写快照，原发行资产未覆盖。

新候选产物：

| 包             | 字节数 | SHA256                                                             |
| -------------- | -----: | ------------------------------------------------------------------ |
| meowtail 0.1.0 | 163307 | `c28809b605355a77eb8a7892edf5ff2f128a3c98849884c644a6a186bc4e3281` |
| meowbook 0.1.0 |  75146 | `7edef02a794f2ad149db99546028cdceee131ceb549dfe7f909c2a80f33f2ace` |

构建回执位于本机临时目录 `meowtail-rename-final-t9izfa1g/ACCEPTANCE.md`，SHA256 为 `24fdde0f17c4f37081eee6d5e831492f2747da2490e2a95993fe3d7d43b34537`。临时路径是本轮证据定位，不是仓库内可重放资产。

## 独立安装和实际画面

独立验收者从空目录安装新 Tail、Book 与原 JSX、CSS 四个精确 tgz。仅复用测试夹具文本，不复用旧 node_modules、lock 或 dist；使用已有第三方缓存离线安装，无源码 alias、根 hoist 补丁或原产品后台。

- 563 个已安装公开文件的集合与每个字节均匹配四份 tar，6 个链接无悬空或目录逃逸；未安装旧 `meowui` 或 Press。
- Node 26.12.0 的真实 ESM 消费核实同一物理 JSX core、Fragment 和 runtime；Signal、Context 穿过有限 JSON 渲染后实际更新，Tail JSON 的 AssistantView 与公开 chat 组件身份一致，越界 File 能力被拒绝。
- neutral 无 DOM、Assistant 应用、Book 工具三个严格类型配置均通过。
- 已安装的 Meowbook 公开 API `buildStories` 与 CLI list、check、capture 通过；capture 请求 1、成功 1、失败 0，390×844、DPR 1，进程自然退出。
- Chromium 153 的隔离路由场景实际验证共享 Context、长过程展开后追加保留状态和焦点、上翻追加不跳、历史前插保锚点、回最新，以及 pending 接受后保留后来新草稿和焦点。
- JSON 同组件文本动作、390×700 暗色无横向溢出及 composer 可见通过；没有后台或外部请求，page error 为 0。

独立验收者实际查看宽屏 JSX、窄屏暗色 JSON 和 Book capture 三张图；协调者另查看宽屏图。图片仅保存在本地，没有上传 Library。上述是代表场景，不是重新运行旧视觉全矩阵。

第一次夹具检查过宽地将合法 Shiki 主题字符串当成旧 import，另一个 CJS `require.resolve` 探针不适用于 ESM-only exports。修正的只有临时检查器：匹配真正 import 语法，并用 Node ESM 解析；源码、tgz、安装包没有为通过探针而改动。原失败与纠正保留在独立回执中。

独立安装回执：`/tmp/meowtail-installed-8e1hgbps/ACCEPTANCE.md`，SHA256 `e7686df73602c3afedc97ca602a6cc6d6a1eb4be433c0368d3d777392901851e`。固定源码审回执 SHA256 为 `4fe8bc55c6695d3160e07fa24ce393535b23e5046d6ad3ae77b988bf343ae172`。安装与画面结果由独立角色取得；完整 build/check/pack 由唯一构建角色取得，未重复全矩阵。

## 发布边界和未覆盖范围

新本地候选输入为 `artifacts/releases/meowtail-0.1.0/release-input.json`，SHA256 `f95eff98a01892fe62c81b88b1bddc37faf6abf4852eb123d123a0bacec9da9c`，只选择 Tail 0.1.0，绑定上述源码提交及 tgz。Book 不在该输入中。

2026-10-17 02:39:41 UTC 的匿名 npm 名称查询返回 404，只说明当时查询结果，不保证名称可注册或当前账号具有发布权。新包推送和真实发布仍需独立授权；本轮未执行。

Book 的新 0.1.0 tar 仅供本地验收。原 `meowbook@0.1.0` draft/tag 绑定旧候选 `16745c148b9e740db6815c6ad0a34fe90cd33d5b`，不能承载新字节；后续须确定新的 Book 版本，或明确授权处理旧未公开 draft/tag。本轮没有版本递增、远端删除、移动或覆盖。

JSX/CSS 已有正式发行资产不变。Press 本人发布返回 E409，先前观察窗口内精确版本和归档仍未公开，后台原因未知；本轮未重发，Press registry 消费保持 NOTRUN。

本轮通过的是本地精确 tarball 消费，不是新名称的 registry 安装；未验证原生 App、WebKit、真实业务后台、模型、全平台或 Rossovia 产品切换。用户另报的四处 Rossovia 问题单独交接，未借改名任务开始修复，也不由本轮有限验收否定。
