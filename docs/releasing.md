# 本地发布

五包采用独立稳定 SemVer，各自使用 `包名@版本` Git tag，例如 `meowjsx@0.1.0`；同一轮可以显式选择多个包。维护者或 Agent 显式准备包 manifest、依赖范围和发行说明，不引入独立版本工具；本地 `scripts/release.ts` 只消费已落盘 metadata 与已验收 tarball，负责 tag、GitHub Release 和 npm 执行，不另建第二条 publish 通路。`apps/showcase` 私有，不发布。GitHub Actions 只做 build/lint，不因 tag 自动发布，不承担 npm、Release 或部署。

实现脚本不等于授权正式发布，GitHub draft、registry 发包及消费验收须分别记录。根 `LICENSE` 与五包 `license: "MIT"` 字段已实际写入，许可证携带及其它发布前置仍须按本轮精确产物验收，不以文件落地替代。`meowpress` 官方 registry 曾返回撤包存根，当前 owner/内容与发布权须另行核实，不应据此认为名字空闲或已占用；未获该包发布授权时不把它加入命令。

## 准备精确输入

当前发行名为 `meowjsx`、`meowcss`、`meowtail`、`meowbook`、`meowpress`。`meowui` 已退出新的选包集合；工具只容许它作为旧验收输入中的未选历史条目存在，不能选中发布，也不会把旧名、tag 或 tarball 静默映射为新名。因此原 `initial-0.1.0` 输入仍可只选 Press 接续核查，原输入 bytes 不改。新 UI 使用独立的 `meowtail-0.1.0` 输入与 tarball，不混入旧候选身份。

已正式发布的 JSX/CSS `0.1.0` 不重新打包覆盖原发行资产。Book 的本地新 `0.1.0` 包只供安装态验收，不能沿用绑定旧候选的 `meowbook@0.1.0` draft/tag。安全的发布方案是另行确定例如 `0.1.1` 的新 Book 版本并保留旧记录；若要保留 `0.1.0`，须先获明确授权处理旧未公开 draft/tag。未获授权时不删除、移动或覆盖远端记录。新 UI 输入暂不选入这个待定的 Book 发行版本。

流程为：人或 Agent 判断本次包集合、各包独立目标版本与发行说明，明确更新包 manifest、必要依赖范围和说明 → check/build/pack → 独立安装态验收 → 本地 release。不引入 Changesets、bumpp 或 changelogen，不自动推断版本联动、扩大选包集合，也不设每 commit/PR 必须记录的门禁或机器人。

check/build/pack 与安装态验收是人工或 Agent 先完成的前置步骤，**发布脚本不会调用这些命令**，更不会在 `--execute` 中静默重建或替换已验收 tarball。本脚本不写版本、依赖或 changelog，不为减少操作强制五包同版；它只用正式 node-semver 校验目标版本与内部依赖范围，不自研版本或范围解析算法。

完成本轮版本与安装态验收后，提交这组源码，正常推送到该仓库默认分支。输入的 `commit` 是包的候选提交，也是 tag 和 Release 正文始终使用的身份；发布工具可以来自它的后继提交，不能为了更新工具而移动旧 tag、改写原输入或重新打包。工具 HEAD 必须包含候选提交，已跟踪工作区与 index 干净，并且远端默认分支等于实际运行的工具提交。脚本通过 `git show <候选commit>:<path>` 读取候选 LICENSE 与包 manifest，不把工具提交里的后继包源码当本次候选。脚本不负责改版本、重建、重打包、提交代码、创建仓库或配置认证。

将一次验收输入与已验 tarball 保存在稳定的本地目录，例如被忽略的 `artifacts/releases/meowtail-0.1.0/release-input.json`（这不是发布进度 ledger）：

```json
{
  "repository": "lidessen/meowland",
  "commit": "完整的40位已验收Git提交SHA",
  "packages": [
    {
      "name": "meowtail",
      "version": "0.1.0",
      "file": "./artifacts/meowtail-0.1.0.tgz",
      "sha256": "独立验收所核对的64位tarball哈希",
      "notes": "可选：由维护者确定的本次发行说明"
    }
  ]
}
```

`file` 相对输入 JSON 所在目录；输入中可列同组五包，但 `--packages` 必须再次明确本次要发布的唯一包名集合，不提供默认“全部”。每项 `version` 就是显式目标版本，必须与源 package manifest 及 tgz 完全相同；只接受稳定 `x.y.z`，不处理预发行渠道，不自动执行版本准备。可选 `notes` 是普通字符串，会进入该包 GitHub Release 正文；未提供时保留包名、commit、哈希的技术说明。notes 和其它字段一起被原验收输入 bytes 绑定，恢复时不能改说明后覆盖同 tag 的旧 draft。

保留这份 JSON 和 tarball 原 bytes，以便恢复；不要为了推进进度重写哈希或重新打包。输入与 tarball 将成为对应 draft 的资产，资产名使用各自文件名，输入名应保持不变，不能与 tarball 同名。文件路径不含 `#`，避免 gh 将其解析成资产显示 label。

## 只读演练

在仓库根执行：

```sh
bun scripts/release.ts --help
bun run release --manifest artifacts/releases/meowtail-0.1.0/release-input.json --packages meowtail
# 工程配置的等价入口：
bun run release --manifest artifacts/releases/meowtail-0.1.0/release-input.json --packages meowtail
```

不加 `--execute` 或 `--prepare-github` 就是 dry-run：只读取本地 Git、输入、候选提交的 manifest 与 tar 目录/正文，校验 SHA256、包名/版本、公开 exports/bin 文件、workspace 依赖已重写、MIT 声明及 LICENSE；分别打印候选与工具 commit、明确包集合、版本、tag 与 blockers。Git status 使用 no-optional-locks、关闭 fsmonitor 并只核已跟踪文件及 index，不刷新 index。除显式选定的输入与 tarball 外，未跟踪文件不参与发布；不会读取、删除或提交任意 `data/`。不会重建或打包，不调用 gh/npm/fetch，不联网、不读取 npm/GitHub 凭据、不创建临时发布状态。缺许可证、origin、候选不是工具提交祖先或已跟踪内容有未提交修改会明确失败，非零退出；404、远端权限与认证在此阶段完全没有被验证。

异常参数、缺输入或错误包哈希也非零退出。不要用 `npm publish --dry-run` 替代这个纯本地演练：那不是本脚本的无凭据边界。

## 只准备 GitHub draft（须有远端变更授权）

npm 尚未登录时，可以先完成获准的 GitHub 工作：

```sh
bun run release --manifest artifacts/releases/meowtail-0.1.0/release-input.json --packages meowtail --prepare-github
```

这不是 dry-run：它会使用当前 GitHub 身份，核对仓库 push 权限、默认分支 commit、全部选包 tag、Release 正文及已有资产 bytes，再复用正式执行的同一段逻辑创建缺失 tag、推送精确 tag，并创建或补齐 draft 资产。所有本地输入和全部选包身份先通过检查才开始变更；不覆盖冲突 tag 或资产。已有公开 Release 会失败，不降级或修补。

该模式完全不调用 npm，不检查 npm 身份、名称发布权、registry 版本或未选依赖，不发布 npm，也不把 draft 转为正式 Release。因此准备成功只代表 GitHub draft 及资产已就绪，不能宣称包可发布或本轮发布完成。它和 `--execute` 互斥，两者均不能重复，也不能加 `--defer-finalize`。之后保留同一 manifest、候选 commit 和 tarball，用下节 `--execute` 完成原有 npm 前置核查并复用现有 tag/draft；不另存发布状态表，也不重新打包。

## 正式执行（须另有明确授权）

维护者在脚本外按各工具正式方式配置 Git/GitHub/npm 身份、2FA 等条件；脚本不登录、不索取或写入 token。确认有本轮正式发布授权后才运行：

```sh
bun run release --manifest artifacts/releases/meowtail-0.1.0/release-input.json --packages meowtail --execute --defer-finalize
```

实际顺序：

1. 重新核本地条件；origin 必须严格指向输入中的 GitHub 仓库，GitHub 身份须能 push，默认分支远端 HEAD 必须等于已检查的工具 commit。查询现有本地/远端 tag（annotated tag peel 到候选 commit）、带权限的分页 Release 列表、npm 当前登录身份、包写权限和 exact version 的 SHA512 integrity。没有明确 not-found 的 auth/network 错误直接失败；已撤包或发布权不明不当“可抢注”。未注册名字的 404 只表示未检索到，是否能创建仍由正式 npm publish 判定，认证成功也不是名字可注册保证。
2. **所有选包前置核查完成后**才创建缺失 tag、只 push 精确 tag（不 push 分支、不 force），创建对应 GitHub draft Release 并上传精确 tarball 与验收输入。使用 `--verify-tag`，不让 gh 从默认分支自动造 tag。已有 tag 必须是同 commit，已有资产下载后必须逐 bytes 同哈希；不覆盖不同资产。若 draft 创建后上传曾中断，只补缺失资产、不 clobber。公开 Release 缺资产或身份矛盾则拒绝自动修补。
3. 全部 draft 准备好后，本地 `npm publish <exact.tgz> --registry https://registry.npmjs.org --access public --tag latest --ignore-scripts`；只有该命令继承运行者终端的 stdin/stdout/stderr，npm 自己显示并处理本人网页登录、OTP 或其它 2FA 交互，脚本不索取、捕获或转交验证码。请在本人真实终端执行，不把 OTP 放入参数、环境变量或聊天；其它元数据命令仍捕获输出供结构化核验。非零退出保留 npm 原生终端诊断并使脚本失败，不自动重试。不在 CI 发布，不执行包生命周期脚本。所选同组内部依赖须满足版本范围；未选的必需内部依赖须已在 registry 有相容版本，optional peer 不强制先发（例如单独 MeowCSS 不要求 JSX）。发布后的 exact name/version 不可覆盖。
4. 再查询**全部选包** exact version 的 `dist.integrity`，严格等于本地 tarball SHA512。加 `--defer-finalize` 时到此成功退出，保留 draft，尚未宣称完整发布完成。该 flag 只可与 `--execute` 一起使用且不可重复；没有该 flag 时才逐个把 draft 设为正式 Release，不抢占仓库全局 Latest（`--latest=false`）。

首次发包建议如上先停 draft，在仓库外从 registry 实际安装本次选中的精确版本，独立核包文件、公开入口、必要 CLI/资源及受影响行为；不能用本地 tgz 安装替代 registry 消费验收。通过后，保留同一输入与包，在本人终端用同一条命令去掉 `--defer-finalize` 接续：

```sh
bun run release --manifest artifacts/releases/meowtail-0.1.0/release-input.json --packages meowtail --execute
```

重新核全部 registry integrity，相同版本会跳过 npm publish，只正式化剩余 draft。脚本不自动判定独立消费者验收，也不维护第二份验收 ACK；执行这一步的维护者或 Agent 必须先核当次真实消费证据。这里示例只选定新 UI 包，不隐式发布 manifest 中其余包。

这是单维护者本地顺序工作流，不是跨 GitHub/npm 的原子事务。执行时不要并发修改这些输入或启动第二个发布者；单条失败即非零退出，没有隐式重试、自动 rollback、强制覆写或换版本绕过未知状态。

## 中断与恢复

### 已撤包名称的显式确认

默认执行仍会拒绝历史撤包。只有本次明确获准尝试所选包，且接受当前发布权仍未知时，才使用包级确认，例如：

```sh
bun run release --manifest artifacts/releases/initial-0.1.0/release-input.json --packages meowpress --execute --defer-finalize --acknowledge-unpublished meowpress
```

`--acknowledge-unpublished` 接收一次逗号分隔的唯一已选包名集合，只可与 `--execute` 使用；不对未选包、其它权限或错误生效。它不声明 owner 或 write access，不把名字判为空闲，而是让已明确历史撤包的选定包沿原生 npm publish 取得 registry 的真实裁定。active package 仍须原有写权限；认证、网络、非法 metadata 和同版本不同 integrity 均会失败。

对明确的结构化撤包时间和历史版本继续检查：24 小时内或目标版本曾被撤回都拒绝；缺失或非法结构化字段不能伪装为政策已满足。npm 对 root lookup 返回严格 `E404 / Unpublished on <ISO时间>` 时，核其撤包时间并只承接为发布权未知。exact version lookup 只有在同包 root 已确认撤包、时间一致且显式确认时才可承接同类结果；不把任意 E404、错误正文或查询失败当作拥有发布权。历史版本信息仍可能不完整，真实 registry 可以拒绝本次尝试。

服务器拒绝、OTP/2FA 未完成或发包后的 integrity 查询失败都会非零退出；确认不能掩盖这些结果，不自动重试、不换身份/版本、不新增 raw npm 路线。成功后仍按 defer → 独立 registry 消费 → 同输入 execute 正式化接续，后续也携带相同包级确认；原候选 tag、验收输入及 tgz 不变。

保留原输入、同候选 commit 与同 tarball，解决报告的具体错误后，用相同命令重入。工具可在正常提交并推送的小修后继续使用，但候选必须仍是工具提交祖先，tag、Release 正文、已上传输入与包 bytes 都不得替换。创建远端变更前再次核工具 HEAD、已跟踪工作区、origin、manifest 与包哈希，防止前置检查后输入变化。状态直接来自原 Git tags、GitHub Release/资产和 npm，不另外存本地进度表。

- tag 或资产已成功：核 identity/bytes 后复用；draft 缺资产只补缺项。
- 某个 npm publish 成功、后续失败：下次先查 exact integrity；相同就跳过，不重发。若发布响应未知或 registry 暂不可读，保持失败，等明确查证后再重入，不盲目 resend。
- 所有 npm 都成功，但正式 Release 只完成一部分：重入校验全部 npm 与已有公开资产，再完成剩余 draft；不把已公开部分退回 draft。
- tag 指向不同 commit、registry 同名同版不同 bytes、资产同名不同 bytes、权限/网络失败：停止人工核查，不能 force tag、clobber 或改哈希假装同一次发布。

## 验证入口与官方依据

专用隔离测试：`bun test scripts/release.test.ts`。测试经真实发布算法，在 CLI 外部边界 mock GitHub/npm，真实读取临时 tarball；覆盖纯本地演练、第二包发布失败后恢复、draft 上传半成功、正式 Release 半成功、身份/资产/权限冲突；另有严格 semver/显式目标不匹配与 notes 传递/改写冲突的定点用例。GitHub 准备模式另核禁用全部 npm 调用、重复执行复用 draft、随后正式执行接续、第二包 tag/资产冲突时零新变更及模式互斥。工具/候选分离使用真实临时 Git 提交核 ancestry、精确候选文件与未跟踪文件隔离；工具变动、defer 接续和非法 flag 有独立目标。原生 stdio 测试执行隔离的假 npm executable，不登录或发布，在 TTY 中运行同一目标可验证继承 TTY。mock 通过不代表真实 registry/GitHub 发布已验证。

2026-10-16 官方只读核查：[gh release create](https://cli.github.com/manual/gh_release_create) 的 draft / verify-tag / `file#label` 合同；[gh release edit](https://cli.github.com/manual/gh_release_edit) 的 `--draft=false`；[GitHub List releases](https://docs.github.com/en/rest/releases/releases#list-releases) 的有权限 draft 可见性；[npm publish](https://docs.npmjs.com/cli/v11/commands/npm-publish/) 的 exact version 不可复用与 SHA512 integrity；[npm view](https://docs.npmjs.com/cli/v11/commands/npm-view/) 的字段查询；[git ls-remote](https://git-scm.com/docs/git-ls-remote) 的 annotated tag peeled 行。[Bun semver](https://bun.com/docs/runtime/semver) 对不可解析范围容错，因此严格发布校验采用 npm 的 [node-semver](https://github.com/npm/node-semver) `valid` / `validRange` / `satisfies`。实际 CLI、服务器权限及 registry 返回仍以执行时事实为准。
