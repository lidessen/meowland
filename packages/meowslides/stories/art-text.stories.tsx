import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Stack } from "meowtail";
import { Presentation, PresentationText, type SlideDefinition } from "meowslides";

const effects = ["editorial", "marker", "plain"] as const;

export const ArtTextStory = defineStory({
  id: "presentation-art-text",
  title: "演示排印 · 克制的标题",
  component: "PresentationText",
  group: "演示与媒体",
  description: "同一份真实文字比较排印与轻标记；字号、字体与阅读范围沿用演示画布。",
  render() {
    const slides: SlideDefinition[] = effects.map((effect, index) => ({
      id: effect,
      title: effect,
      steps: 0,
      render: () => (
        <Stack gap="relaxed" justify="center" style={{ height: "100%", maxWidth: "1000px" }}>
          <small>{`FIELD NOTES / 0${index + 1} · ${effect}`}</small>
          <PresentationText as="h1" effect={effect}>
            把复杂讲清楚。
            <br />
            Make the idea clear.
          </PresentationText>
          <p>让文字有分量，也给想法留出呼吸的空间。</p>
        </Stack>
      ),
    }));
    slides.push({
      id: "long-title",
      title: "长标题与真实文本",
      steps: 0,
      render: () => (
        <Stack gap="relaxed">
          <small>LONG FORM / 长标题与多行</small>
          <PresentationText as="h1" effect="editorial">
            用更清楚的结构，承载不断增长的想法与真实的长标题
          </PresentationText>
          <PresentationText as="h2" effect="marker">
            A thoughtful title can grow across lines without becoming a picture.
          </PresentationText>
          <PresentationText as="p" effect="marker">
            PresentationTypographyRemainsSelectableAndWrapsEvenWhenAWordHasNoBreaksAtAnyPresentationScaleWithoutRequiringAuthoredPixels
          </PresentationText>
        </Stack>
      ),
    });
    slides.push({
      id: "editable",
      title: "原生文本接缝",
      steps: 0,
      render: () => (
        <Stack gap="relaxed">
          <small>NATIVE TEXT / 选择与修改</small>
          <PresentationText
            as="h1"
            effect="marker"
            contentEditable
            role="textbox"
            aria-label="可修改的演示标题"
            aria-multiline="true"
          >
            Edit this title / 修改标题
          </PresentationText>
          <p>原生编辑只属于这个示例；组件不维护第二份文本或编辑状态。</p>
        </Stack>
      ),
    });
    return (
      <div style={{ height: "min(760px, 100dvh)", minHeight: "0" }}>
        <Presentation title="Presentation typography" slides={slides} active={false} />
      </div>
    );
  },
});
