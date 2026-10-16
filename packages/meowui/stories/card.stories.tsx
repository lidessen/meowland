import { h } from "meowjsx/runtime";
import { defineStory } from "meowbook";
import {
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Icon,
  IconButton,
  Stack,
  Container,
} from "meowui";

export const CardCompositionStory = defineStory({
  id: "card-composition",
  title: "卡片 · 项目与内嵌检查项",
  group: "基础控件",
  groupOrder: 10,
  component: "Card",
  variant: "嵌套与内容区域",
  description: "一张项目记录，内部检查项共享阅读面；独立事项可以使用自己的表面。操作只在本地回显。",
  covers: [
    "Card surface/embedded",
    "CardHeader/Title/Description/Action",
    "CardContent/Footer",
    "nested card",
    "long title",
  ],
  render: () => (
    <Container>
      <Stack gap="relaxed" data-card-example>
        <Card as="article" aria-labelledby="card-project-title">
          <CardHeader>
            <CardTitle id="card-project-title">发布前的组件检查</CardTitle>
            <CardDescription>Meowland · 本次检查保留两项需要你确认的修改。</CardDescription>
            <CardAction>
              <IconButton label="查看项目记录" data-card-action="已选中这条项目记录">
                <Icon name="eye" />
              </IconButton>
            </CardAction>
          </CardHeader>
          <CardContent>
            <Card as="section" aria-labelledby="card-reading-title">
              <CardHeader>
                <CardTitle as="h3" id="card-reading-title">
                  消息阅读与长代码预览
                </CardTitle>
                <CardDescription>正文换行与代码局部滚动已经分开处理。</CardDescription>
                <CardAction>
                  <Badge>待确认</Badge>
                </CardAction>
              </CardHeader>
              <CardContent>
                <p>请在窄屏下阅读一段完整回复，再决定是否采用新的段落间距。</p>
              </CardContent>
              <CardFooter>
                <Button variant="quiet" size="small" data-card-action="已打开阅读检查记录">
                  查看检查记录
                </Button>
              </CardFooter>
            </Card>
            <Card as="section" aria-labelledby="card-recovery-title">
              <CardHeader>
                <CardTitle as="h3" id="card-recovery-title">
                  连续输入与提交失败后的草稿恢复
                </CardTitle>
                <CardDescription>提交内容与最新草稿各自保留，失败后可以继续编辑。</CardDescription>
              </CardHeader>
              <CardContent>
                <p>复查时使用长输入，确认错误提示没有盖住主要操作。</p>
                <Card variant="surface">
                  <CardHeader>
                    <CardTitle as="h4">单独的验证环境</CardTitle>
                    <CardDescription>这项资源需要独立边界，显式保留表面。</CardDescription>
                  </CardHeader>
                </Card>
              </CardContent>
            </Card>
          </CardContent>
          <CardFooter>
            <Button data-card-action="已保存本地检查结论">保存检查结论</Button>
            <Button variant="quiet" data-card-action="已保留记录，稍后继续">
              稍后继续
            </Button>
          </CardFooter>
        </Card>
        <Card as="section" aria-labelledby="card-reference-title">
          <CardHeader>
            <CardTitle id="card-reference-title">相关参考</CardTitle>
            <CardDescription>独立事项保留自己的边界，不和上面的项目记录混为一层。</CardDescription>
          </CardHeader>
          <CardContent>
            <p>主题只改变视觉表达；内容结构与操作保持可用。</p>
          </CardContent>
        </Card>
        <p className="workshop-feedback" role="status" data-card-feedback>
          操作仅反馈到本地示例。
        </p>
      </Stack>
    </Container>
  ),
  setup({ root, onCleanup }) {
    const handleClick = (event: Event) => {
      const button = (event.target as Element).closest<HTMLElement>("[data-card-action]");
      if (button)
        root.querySelector("[data-card-feedback]")!.textContent = button.dataset.cardAction!;
    };
    root.addEventListener("click", handleClick);
    onCleanup(() => root.removeEventListener("click", handleClick));
  },
});
