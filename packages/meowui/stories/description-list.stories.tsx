import { h } from "meowjsx";
import { defineStory } from "meowbook";
import {
  Button,
  Container,
  DescriptionItem,
  DescriptionList,
  Inline,
  Input,
  LayoutItem,
  Stack,
} from "meowui";

const copy = {
  purpose: "同一组标签与值共用自然列；局部空间不足时上下排列，值内仍可组合阅读和操作。",
  version: "版本",
  versionValue: "2026.10.15",
  identity: "完整的工作目录引用标识",
  identityValue: "workspace:development-documentation-service-with-a-long-unbroken-identity",
  action: "核对引用",
  draft: "备注草稿",
  narrow: "相同视口中的窄区域",
};

export const DescriptionListStory = defineStory({
  id: "description-list-composition",
  title: "信息布局 · 自然标签列与局部组合",
  group: "导航与布局",
  groupOrder: 40,
  component: "DescriptionList",
  description: "只展示公共信息布局；标签、长标识与动作是固定示例，不读取业务资料。",
  covers: [
    "native description list",
    "shared label column",
    "local container width",
    "long value",
    "nested layout",
    "draft continuity",
  ],
  render: () => (
    <Container width="content">
      <Stack gap="relaxed">
        <span>{copy.purpose}</span>
        <DescriptionList aria-label="工作信息" data-description-wide>
          <DescriptionItem term={copy.version}>{copy.versionValue}</DescriptionItem>
          <DescriptionItem term={copy.identity}>
            <Inline wrap={false} gap="compact" align="start">
              <LayoutItem grow>
                <code>{copy.identityValue}</code>
              </LayoutItem>
              <LayoutItem shrink={false}>
                <Button variant="outline" size="small">
                  {copy.action}
                </Button>
              </LayoutItem>
            </Inline>
          </DescriptionItem>
          <DescriptionItem term={<label htmlFor="description-draft">{copy.draft}</label>}>
            <Input id="description-draft" placeholder="输入后调整局部宽度" />
          </DescriptionItem>
        </DescriptionList>
        <div style={{ width: "100%", maxWidth: "20rem" }} data-description-narrow>
          <Stack gap="compact">
            <strong>{copy.narrow}</strong>
            <DescriptionList aria-label="窄区域信息">
              <DescriptionItem term={copy.version}>{copy.versionValue}</DescriptionItem>
              <DescriptionItem term={copy.identity}>
                <code>{copy.identityValue}</code>
              </DescriptionItem>
            </DescriptionList>
          </Stack>
        </div>
      </Stack>
    </Container>
  ),
});
