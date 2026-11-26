import { h } from "meowjsx";
import { defineStory } from "meowbook";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Container,
  Field,
  Grid,
  Inline,
  Input,
  PageHeader,
  Progress,
  Stack,
  TerminalBlock,
} from "meowtail";
import { uiTokens } from "meowtail/theme";

export const ThemeWorkbench = defineStory({
  id: "theme-workbench",
  title: "Theme Workbench · Form and metric cards",
  group: "Composition examples",
  groupOrder: 110,
  description:
    "The same form and metric cards under any theme, without product artwork or altered components.",
  covers: ["button variants", "card surfaces", "decorative marker roles", "progress"],
  render: () => (
    <Container width="wide">
      <Stack gap="relaxed">
        <PageHeader
          title="Project workspace"
          description="Set up a form or inspect the latest activity."
        />
        <Grid minColumnWidth="normal">
          <Card>
            <CardHeader>
              <CardTitle>Survey draft</CardTitle>
            </CardHeader>
            <CardContent>
              <Field label="Survey title" htmlFor="workbench-title">
                <Input id="workbench-title" defaultValue="Getting started" />
              </Field>
              <Inline wrap>
                <Button>Save draft</Button>
                <Button variant="outline">Preview</Button>
                <Button variant="danger">Discard</Button>
              </Inline>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Response quota</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <strong>72 / 100</strong> responses
              </div>
              <Progress label="Responses used" max={100} value={72} />
              <div>Resets at the start of next month.</div>
            </CardContent>
          </Card>
        </Grid>
        <Inline gap="compact" aria-hidden="true">
          {[uiTokens.marker.blue, uiTokens.marker.ochre, uiTokens.marker.coral].map((color) => (
            <span
              style={{
                width: String(uiTokens.icon.large),
                height: String(uiTokens.icon.large),
                borderRadius: String(uiTokens.radius.full),
                border: `${uiTokens.line.width} solid ${uiTokens.line.edge}`,
                backgroundColor: String(color),
              }}
            />
          ))}
        </Inline>
      </Stack>
    </Container>
  ),
});

export const DeveloperTerminalTheme = defineStory({
  id: "developer-terminal-theme",
  title: "Developer Terminal · Install and run receipts",
  group: "Composition examples",
  groupOrder: 110,
  description: "A command preview and a failed integration check on the same terminal component.",
  covers: ["terminal palette", "ANSI spans", "exit status", "clipboard"],
  render: () => (
    <Container width="content">
      <Stack gap="relaxed">
        <PageHeader
          title="Developer setup"
          description="Install the local tools, then check the project configuration."
        />
        <TerminalBlock
          command="bun install"
          exitCode={0}
          output={"\u001b[32mInstalled\u001b[0m 14 packages\n"}
        />
        <TerminalBlock
          command="bun run verify"
          cwd="workspace"
          exitCode={1}
          output={
            "\u001b[35mproject-config\u001b[0m\n\u001b[31mMissing required setting\u001b[0m\n"
          }
        />
      </Stack>
    </Container>
  ),
});
