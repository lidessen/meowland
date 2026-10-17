# 本地发布

五包采用独立稳定 SemVer，各自使用 `包名@版本` Git tag，例如 `meowjsx@0.1.0`；同一轮可以显式选择多个包。维护者或 Agent 显式准备包 manifest、依赖范围和发行说明，不引入独立版本工具；本地 `scripts/release.ts` 只消费已落盘 metadata 与已验收 tarball，负责 tag、GitHub Release 和 npm 执行，不另建第二条 publish 通路。`apps/showcase` 私有，不发布。GitHub Actions 只做 build/lint，不因 tag 自动发布，不承担 npm、Release 或部署。

实现脚本不等于授权正式发布。本轮只做本地 dry-run 与外部 CLI 边界 mock；没有真实创建 tag、上传资产、登录、npm publish 或正式 Release。当前新仓库尚无 origin；根 `LICENSE` 与五包 `license: "MIT"` 字段已实际写入，许可证携带及其它发布前置仍须按本轮精确产物验收，不以文件落地替代。`meowpress` 官方 registry 为撤包存根，当前 owner/内容与发布权未知，不应据此认为名字空闲或已占用。

## 准备精确输入

流程为：人或 Agent 判断本次包集合、各包独立目标版本与发行说明，明确更新包 manifest、必要依赖范围和说明 → check/build/pack → 独立安装态验收 → 本地 release。不引入 Changesets、bumpp 或 changelogen，不自动推断版本联动、扩大选包集合，也不设每 commit/PR 必须记录的门禁或机器人。

check/build/pack 与安装态验收是人工或 Agent 先完成的前置步骤，**发布脚本不会调用这些命令**，更不会在 `--execute` 中静默重建或替换已验收 tarball。本脚本不写版本、依赖或 changelog，不为减少操作强制五包同版；它只用正式 node-semver 校验目标版本与内部依赖范围，不自研版本或范围解析算法。

完成本轮版本与安装态验收后，提交这组源码，正常推送经过验收的 commit 到该仓库默认分支。脚本不负责改版本、重建、重打包、提交代码、创建仓库或配置认证；它只检查并发布已验收的精确 tarball。

在仓库外保存一次验收输入，例如 `/tmp/release-input.json`（这不是发布进度 ledger）：

```json
{
  "repository": "lidessen/meowland",
  "commit": "完整的40位已验收Git提交SHA",
  "packages": [
    {
      "name": "meowjsx",
      "version": "0.1.0",
      "file": "./artifacts/meowjsx-0.1.0.tgz",
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
bun scripts/release.ts --manifest /tmp/release-input.json --packages meowjsx
# 工程配置的等价入口：
bun run release --manifest /tmp/release-input.json --packages meowjsx,meowcss
```

不加 `--execute` 或 `--prepare-github` 就是 dry-run：只读取本地 Git、输入、源 manifest 与 tar 目录/正文，校验 SHA256、包名/版本、公开 exports/bin 文件、workspace 依赖已重写、MIT 声明及 LICENSE；打印明确包集合、版本、tag 与 blockers。Git status 使用 no-optional-locks 并关闭 fsmonitor，不刷新 index。不会重建或打包，不调用 gh/npm/fetch，不联网、不读取 npm/GitHub 凭据、不创建临时发布状态。缺许可证、origin、工作树不净或 HEAD 不符会明确失败，非零退出；404、远端权限与认证在此阶段完全没有被验证。

异常参数、缺输入或错误包哈希也非零退出。不要用 `npm publish --dry-run` 替代这个纯本地演练：那不是本脚本的无凭据边界。

## 只准备 GitHub draft（须有远端变更授权）

npm 尚未登录时，可以先完成获准的 GitHub 工作：

```sh
bun scripts/release.ts --manifest /tmp/release-input.json --packages meowjsx,meowcss --prepare-github
```

这不是 dry-run：它会使用当前 GitHub 身份，核对仓库 push 权限、默认分支 commit、全部选包 tag、Release 正文及已有资产 bytes，再复用正式执行的同一段逻辑创建缺失 tag、推送精确 tag，并创建或补齐 draft 资产。所有本地输入和全部选包身份先通过检查才开始变更；不覆盖冲突 tag 或资产。已有公开 Release 会失败，不降级或修补。

该模式完全不调用 npm，不检查 npm 身份、名称发布权、registry 版本或未选依赖，不发布 npm，也不把 draft 转为正式 Release。因此准备成功只代表 GitHub draft 及资产已就绪，不能宣称包可发布或本轮发布完成。它和 `--execute` 互斥，两者均不能重复。之后保留同一 manifest、commit 和 tarball，用下节 `--execute` 完成原有 npm 前置核查并复用现有 tag/draft；不另存发布状态表，也不重新打包。

## 正式执行（须另有明确授权）

维护者在脚本外按各工具正式方式配置 Git/GitHub/npm 身份、2FA 等条件；脚本不登录、不索取或写入 token。确认有本轮正式发布授权后才运行：

```sh
bun scripts/release.ts --manifest /tmp/release-input.json --packages meowjsx,meowcss --execute
```

实际顺序：

1. 重新核本地条件；origin 必须严格指向输入中的 GitHub 仓库，GitHub 身份须能 push，默认分支远端 HEAD 必须等于验收 commit。查询现有本地/远端 tag（annotated tag peel 到 commit）、带权限的分页 Release 列表、npm 当前登录身份、包写权限和 exact version 的 SHA512 integrity。没有明确 not-found 的 auth/network 错误直接失败；已撤包或发布权不明不当“可抢注”。未注册名字的 404 只表示未检索到，是否能创建仍由正式 npm publish 判定，认证成功也不是名字可注册保证。
2. **所有选包前置核查完成后**才创建缺失 tag、只 push 精确 tag（不 push 分支、不 force），创建对应 GitHub draft Release 并上传精确 tarball 与验收输入。使用 `--verify-tag`，不让 gh 从默认分支自动造 tag。已有 tag 必须是同 commit，已有资产下载后必须逐 bytes 同哈希；不覆盖不同资产。若 draft 创建后上传曾中断，只补缺失资产、不 clobber。公开 Release 缺资产或身份矛盾则拒绝自动修补。
3. 全部 draft 准备好后，本地 `npm publish <exact.tgz> --registry https://registry.npmjs.org --access public --tag latest --ignore-scripts`；不在 CI 发布，不执行包生命周期脚本。所选同组内部依赖须满足版本范围；未选的必需内部依赖须已在 registry 有相容版本，optional peer 不强制先发（例如单独 MeowCSS 不要求 JSX）。发布后的 exact name/version 不可覆盖。
4. 再查询**全部选包** exact version 的 `dist.integrity`，严格等于本地 tarball SHA512，才逐个把 draft 设为正式 Release；不抢占仓库全局 Latest（`--latest=false`）。

这是单维护者本地顺序工作流，不是跨 GitHub/npm 的原子事务。执行时不要并发修改这些输入或启动第二个发布者；单条失败即非零退出，没有隐式重试、自动 rollback、强制覆写或换版本绕过未知状态。

## 中断与恢复

保留原输入、同 commit 与同 tarball，解决报告的具体错误后，用相同命令重入。状态直接来自原 Git tags、GitHub Release/资产和 npm，不另外存本地进度表。

- tag 或资产已成功：核 identity/bytes 后复用；draft 缺资产只补缺项。
- 某个 npm publish 成功、后续失败：下次先查 exact integrity；相同就跳过，不重发。若发布响应未知或 registry 暂不可读，保持失败，等明确查证后再重入，不盲目 resend。
- 所有 npm 都成功，但正式 Release 只完成一部分：重入校验全部 npm 与已有公开资产，再完成剩余 draft；不把已公开部分退回 draft。
- tag 指向不同 commit、registry 同名同版不同 bytes、资产同名不同 bytes、权限/网络失败：停止人工核查，不能 force tag、clobber 或改哈希假装同一次发布。

## 验证入口与官方依据

专用隔离测试：`bun test scripts/release.test.ts`。测试经真实发布算法，在 CLI 外部边界 mock GitHub/npm，真实读取临时 tarball；覆盖纯本地演练、第二包发布失败后恢复、draft 上传半成功、正式 Release 半成功、身份/资产/权限冲突；另有严格 semver/显式目标不匹配与 notes 传递/改写冲突的定点用例。GitHub 准备模式另核禁用全部 npm 调用、重复执行复用 draft、随后正式执行接续、第二包 tag/资产冲突时零新变更及模式互斥。mock 通过不代表真实 registry/GitHub 发布已验证。

2026-10-16 官方只读核查：[gh release create](https://cli.github.com/manual/gh_release_create) 的 draft / verify-tag / `file#label` 合同；[gh release edit](https://cli.github.com/manual/gh_release_edit) 的 `--draft=false`；[GitHub List releases](https://docs.github.com/en/rest/releases/releases#list-releases) 的有权限 draft 可见性；[npm publish](https://docs.npmjs.com/cli/v11/commands/npm-publish/) 的 exact version 不可复用与 SHA512 integrity；[npm view](https://docs.npmjs.com/cli/v11/commands/npm-view/) 的字段查询；[git ls-remote](https://git-scm.com/docs/git-ls-remote) 的 annotated tag peeled 行。[Bun semver](https://bun.com/docs/runtime/semver) 对不可解析范围容错，因此严格发布校验采用 npm 的 [node-semver](https://github.com/npm/node-semver) `valid` / `validRange` / `satisfies`。实际 CLI、服务器权限及 registry 返回仍以执行时事实为准。
