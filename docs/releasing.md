# 本地 npm 发布

各包独立 SemVer，由维护者或 Agent 显式确定选包、版本与依赖范围。本地唯一入口 `scripts/release.ts` 消费已验收 tarball；不自动改版本、扩展选包、build、pack、提交或推送。稳定版显式使用 `latest`，测试版必须为 `x.y.z-alpha.N` 并显式使用 `alpha`。`*-slides.*` 等其它预发行格式不会被映射为 alpha。`meowslides` 当前仍为 private，不可发布；根与 showcase 也不发布。

GitHub Actions 仅 build/lint，不承担发布或部署；本地发布不再创建 Git tag、draft/正式 Release 或上传资产，也不要求先 push。已完成的 GitHub Release、tag 与历史回执保持原样。历史流程不再是当前操作入口；[原正式发布回执](records/2026-10-17-tail-book-press-publish.md)仍保留当时的事实。

## 准备与固定输入

1. 明确受影响包及各自独立版本，更新源 manifest 与必要依赖/peer 范围。脚本使用 node-semver 正常预发行语义分别校验依赖与 peer；稳定范围通常不接受 alpha，应显式加入相应 alpha 基准范围。不会强制所有包同版或推断联动。
2. 按[开发检查](development-checks.md)完成必要检查，build/pack，并在仓库外空目录安装实际 tgz，验证公开入口、资源、CLI 和受影响行为。pack 不代表 build 已完成；本地 tgz 消费不等于 registry 消费。
3. 提交候选源码，固定候选完整 SHA 与已验收 tgz 的 SHA256。工具提交可为候选后继；候选须是工具 HEAD 的祖先。已跟踪工作区/index 须干净，origin 须与输入仓库一致。未跟踪内容（包括未知 `data/`）不参与检查，不读取或清理。
4. 在被忽略的 `artifacts/releases/<本批名称>/` 保存输入 JSON 与精确 tarball，之后不重打包、不改哈希假装同一批。

输入示例（哈希与 SHA 需替换为实际值）：

```json
{
  "repository": "lidessen/meowland",
  "commit": "完整的40位候选Git提交SHA",
  "packages": [
    {
      "name": "meowtail",
      "version": "0.2.0-alpha.0",
      "file": "./meowtail-0.2.0-alpha.0.tgz",
      "sha256": "已验收tarball的64位SHA256",
      "notes": "可选：本批说明，保存在本地输入中"
    }
  ]
}
```

`file` 相对 JSON 所在目录。`--packages` 必须再次显式选择唯一包名；只发布所选集合，不自动带上输入中的其它包。包名/版本必须同时匹配候选提交 manifest 与 tgz，公开 exports/bin 目标须齐全，不含未解析 workspace 依赖，并携带根 MIT LICENSE。内部依赖先于消费者发布，所选集合出现依赖环即失败。不会用工具后继提交中的新 manifest 替代候选 manifest。

## 三种模式

以下示例只选择 Tail；多包以逗号列出，无默认“全部”。稳定发布省略 `--channel` 或显式 `--channel stable`，并使用稳定版本输入。

```sh
# 纯本地 dry-run：不联网、不调用 npm、不读取发布凭据
bun run release --manifest artifacts/releases/ui-alpha/release-input.json --packages meowtail --channel alpha

# 只读 registry / 身份 / 账号可见写权限检查
bun run release --manifest artifacts/releases/ui-alpha/release-input.json --packages meowtail --channel alpha --check

# 仅在获得本批真实发布授权后执行
bun run release --manifest artifacts/releases/ui-alpha/release-input.json --packages meowtail --channel alpha --execute
```

`--check` 与 `--execute` 互斥；旧 `--prepare-github`、`--defer-finalize`、`--acknowledge-unpublished` 参数已移除，明确报错。默认 dry-run 输出候选/工具 SHA、按依赖排序的精确包版本、SHA256/SHA512 与阻断项；异常参数或校验失败非零退出。

两个 registry 模式只使用本地进程环境已有的 `NPM_TOKEN`。GitHub 仓库 Secret 不会自动出现在本地环境；未设置时明确失败，不回退到个人 npm 登录。不在命令参数、仓库或聊天中填写 token。`scripts/npmrc` 仅含 npm 官方支持的字面变量占位符；脚本在临时空目录运行 npm，指定该 userconfig 与空 globalconfig，移除大小写不敏感的 `npm_config_*` 环境覆盖，固定官方 registry、关闭 lifecycle scripts 和 workspaces。不会创建凭据、登录或改变 token 权限；不会转发 npm 原始诊断或账号信息。

`--check` 查询身份、账号可见包权限、当前 tags、精确版本 integrity 与未选必需内部依赖的相容版本。optional peer 不强制先发布；所选依赖即使 optional 也须相容。账号可见写权限不证明 granular token 的发包范围、2FA 条件或新包创建权；不存在的包也不代表名字可注册。认证/网络/非预期 JSON 与历史撤包均失败，不能把任意错误当作未发布。真实发布仍可能因 registry 权限或政策被拒绝；本脚本不处理 OTP 或交互登录，须在脚本外解决当前 token 条件。

## 执行与恢复

所有选包的本地、认证、registry、完整 bytes 和依赖检查完成后，才开始任何变更。每次变更前再核工具 HEAD、已跟踪状态、origin、输入及全部 tgz 哈希，且复核当前 tags 未被其它发布者改变。不要同时启动第二个发布者或修改输入。

- 未存在的精确版本：只运行 `npm publish <绝对tgz路径> --access public --tag alpha|latest --ignore-scripts`，同一 runner 固定 registry/config。
- 精确版本已存在且 SHA512 相同：跳过 publish；所选 tag 未指向该版本时只修复所选 tag。不同 bytes 直接停止，不覆盖、换哈希或自动换版本。
- 所选 tag 已指向更新版本：拒绝倒退。alpha 全程只写 `alpha`；发包和 tag 修复后均核 `latest` 与预检完全一致，包括原本不存在的情况。发现并发变化即失败，不自动反向改 `latest`。
- 每包变更后核 exact integrity 与所选 tag。某条失败即停止，不隐式重试或回滚；保留同一输入与 tgz，排除具体原因后重入。registry 的实际版本/integrity/tags 是恢复依据，不维护第二份进度 ledger。

publish 响应未知或版本暂不可见时，不因脚本退出非零就盲目重新发送。先确认官方 registry 状态；重入会检查相同 bytes 并跳过已成功版本。全部脚本成功后还需从 registry 安装精确版本做独立消费验收，才能报告真实发布与消费结果；构建、打包、dry-run 或只读检查都不等于已发布。

## 验证与依据

定向测试 `bun test scripts/release.test.ts` 使用真实临时 tarball 与隔离 Git 仓库，mock registry 边界，覆盖渠道、依赖/peer、拓扑、全选预检、部分失败恢复、同 bytes/tag 修复、latest 保护、输入变化和配置隔离。mock 通过不等于真实认证或发包通过。

官方依据：[npm publish](https://docs.npmjs.com/cli/v11/commands/npm-publish/)、[dist-tag](https://docs.npmjs.com/cli/v11/commands/npm-dist-tag/)、[npmrc 配置优先级](https://docs.npmjs.com/cli/v11/configuring-npm/npmrc/)、[变量占位符](https://docs.npmjs.com/using-private-packages-in-a-ci-cd-workflow/)、[node-semver](https://github.com/npm/node-semver)。
