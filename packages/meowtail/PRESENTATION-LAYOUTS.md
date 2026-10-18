# 演示内容布局

先根据观众要读什么划分区域，再放入内容。`PresentationLayout` 是通用页面骨架，
标题、图文、对比、数字、流程和总结继续组合现有组件。可运行的六页构图在 Meowbook 的
`presentation-layouts`，不改变现有图片演示或英语课件。

## 区域与比例

从 `meowtail/presentation` 导入 `PresentationLayout`，根入口重导同一实现。
`header`、`footer` 接收普通 Child，保持自然高度；`children` 进入占剩余高度的 body。
省略任一槽不会留下空行或额外间距。骨架不另加边缘，沿用 Presentation 画布的 inset。

| 关系               | `columns`        | 适合的内容                          |
| ------------------ | ---------------- | ----------------------------------- |
| 单一阅读轴         | `single`（默认） | 标题、引用、总结，或内部继续放 Grid |
| 同等重要           | `equal`          | 两个方案、前后对比、两组依据        |
| 主要内容在逻辑起点 | `wide-start`     | 数字或主图占 2 份，旁注占 1 份      |
| 主要内容在逻辑终点 | `wide-end`       | 说明占 1 份，图或实验占 2 份        |

双列构图通常提供两个直接子项。更多区域可在 `single` 中组合 `Grid columns={3}`。
超过两项会按普通网格新增行，仍需核对有限画布的内容量。
`gap` 使用 none/compact/normal/relaxed，默认 normal；主题的 `presentationTokens.spaceGroup`、
`spaceSection`、`spacePanel` 决定组内、区域和较宽间距，与工具栏控件间距独立。

```tsx
import { Stack, LayoutItem } from "meowtail";
import { PresentationLayout } from "meowtail/presentation";

<PresentationLayout
  columns="wide-end"
  header={<h2>同一观点，配一张能解释它的图</h2>}
  footer={<small>来源、条件与必要说明</small>}
>
  <Stack justify="center">
    <p>短主张和适用条件。</p>
  </Stack>
  <Stack style={{ height: "100%" }}>
    <LayoutItem grow basis="0%">
      <img
        src={image}
        alt="说明图片表达的内容"
        aria-describedby="slide-image-caption"
        style={{ display: "block", width: "100%", height: "100%", objectFit: "contain" }}
      />
    </LayoutItem>
    <LayoutItem shrink={false}>
      <small id="slide-image-caption">说明图中应观察的关系。</small>
    </LayoutItem>
  </Stack>
</PresentationLayout>;
```

占位阶段就用 AspectRatio 确定容器；替换真实图片后再核对长宽比、contain/cover 和必要的裁切。
骨架不下载素材、不默认裁切，不把图中文字当可访问的正文。
固定高度区域若同时包含媒体和说明，先用 Stack + LayoutItem grow 把余量交给媒体，
说明保持自然高度，再由 img 的 objectFit="contain" 保留图像比例；图片可用 aria-describedby 关联说明。
不要让按列宽计算的 AspectRatio 再加一段说明后侵入 footer。AspectRatio 更适合先确定自然高度的占位区域，
并须与整页剩余高度一起检查。

## 选用构图

| 目的         | 最小组合                                                                   |
| ------------ | -------------------------------------------------------------------------- |
| 标题与主张   | single + Stack justify="center"；主标题、副标题与上下文                    |
| 图文分栏     | wide-start/wide-end + Stack + figure/AspectRatio；根据证据的重要性选主次   |
| 并列对比     | equal；使用同样的标题层级与比较轴，避免两边内容量悬殊                      |
| 重点数字     | wide-start；数字、单位与条件组成一个区域，解释与来源另放，示意数值明确标记 |
| 流程或时间线 | single + Grid/Stack 内的原生 ol/li；保留顺序语义，必要时组合 Reveal        |
| 引用或总结   | single + blockquote/Stack；区分引用、作者结论、来源与下一步                |

阅读字号来自既有 `presentationTokens.fontTitle/fontSubtitle/fontBody/fontCaption`。
确需强调的标题可使用 `PresentationText` editorial 或 marker；正文默认 plain，不需要全页艺术化。
它仍是真实文本，可选择、换行、复制；原生 contenteditable 只是接缝，不构成编辑器。
打印和 forced-colors 保留普通文字。

## 画布与重排的边界

Presentation 的逻辑画布为 1280×720。窄窗口或短窗口使用 contain 整体缩放，
不会把两栏暗中改成上下排列；本骨架的命名比例属于逻辑画布。
需要手机优先阅读页时另用 Container/Stack/Grid 自然布局，不靠演示缩放承载大量正文。
`RegionLayout` 面向工具区、命名区域与滚动 owner，不作为演示文档 schema。

有限画布容不下任意长文。长标题先领取自然高度，正文区可能因此不足；
默认不裁切、不自动缩小文字、不添加隐藏滚动，保留 Presentation 的溢出诊断。
优先精简、拆页或重新安排区域，再观察目标尺寸；原尺寸模式不能代替可读性验收。
Reveal 隐藏时保留区域几何，逐步呈现不会把相邻内容突然推开。

验证宽屏整页、窄屏、短窗以及真实图片、最长标题和最终步骤。
Meowbook ready 和静态截图不证明互动、媒体或动画合同，这些按作品实际能力另验。
