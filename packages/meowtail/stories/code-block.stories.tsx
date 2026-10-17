import { h } from "meowjsx";
import { CodeBlock, Stack } from "meowtail";
import { defineStory } from "meowbook";

export const CodeBlockStory = defineStory({
  id: "code-block",
  title: "代码块 · 语言、复制与换行",
  group: "内容",
  render: () => (
    <Stack>
      <CodeBlock
        language="typescript"
        code={
          'const description = "保留代码空白与长行；自动换行只改变展示，不改变复制的内容。";\nconsole.log(description);'
        }
      />
      <CodeBlock code={'<script>alert("只显示，不执行")</script>\n  保留缩进'} defaultWrap />
      <CodeBlock
        language="复制失败示例"
        code="clipboard permission denied"
        onCopy={async () => {
          throw new Error("denied");
        }}
      />
    </Stack>
  ),
});
