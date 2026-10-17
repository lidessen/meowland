# UI Improvement · MeowUI 实验

真实 MeowUI 组件、标准主题及 Meowbook 的独立场景副本。baseline 保留2026-10-04
开始前的选择、弹窗与布局场景；trial 用于独立 Agent 按技能诊断、修改和复验。
不进入正式 stories 默认目录，不接真实服务，不是另一个主题或组件库。

从仓库根启动普通 Web 预览：

```sh
bunx --no-install meowbook serve --config packages/meowtail/prototypes/skill-trial/baseline.config.ts --port 13015
bunx --no-install meowbook serve --config packages/meowtail/prototypes/skill-trial/trial.config.ts --port 13016
```

独立画布为 `/canvas.html?story=<id>`。原始 id：select-states、dialog-form、
layout-composition、layout-stack、layout-inline、layout-grid、layout-container。
trial 另含 delivery-choice，演示具体选择用途，保留原生选择能力对照。
源码改变后重启服务；`story-state[data-status=ready]` 是视觉隐藏状态节点。

```sh
bunx --no-install meowbook check --config packages/meowtail/prototypes/skill-trial/trial.config.ts --json
```

完整任务与当时证据见 [Rossovia 历史实验](https://github.com/lidessen/rossovia/blob/046b044e1bfde8c79b186fab2948ba2260371790/docs/tooling/ui-meowui-trial-2026-10-04/brief.md)，不依赖相邻产品 checkout。
组件本体与主题没有因本试验改变；试作结果需独立核对，不能替代真实应用接线或用户接受。
