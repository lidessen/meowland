import { h } from "meowjsx";
import { mapSignal, signal } from "meowjsx/signal";
import { Button, Inline, Stack } from "meowtail";

export function createSession() {
  return {
    choice: signal(""),
    feedback: signal("Choose a habitat, then check your answer."),
  };
}

export function QuickCheck({ session }: { session: ReturnType<typeof createSession> }) {
  const choose = (value: string) => {
    session.choice.value = value;
    session.feedback.value = "Ready to check.";
  };
  const check = () => {
    session.feedback.value =
      session.choice.value === "forest"
        ? "Yes. Trees provide cover."
        : session.choice.value === "open"
          ? "Look again: compare the number of trees."
          : "Choose a habitat first.";
  };
  const reset = () => {
    session.choice.value = "";
    session.feedback.value = "Choose a habitat, then check your answer.";
  };
  return (
    <Stack>
      <p>Which habitat usually offers more cover from trees?</p>
      <Inline>
        <Button
          variant="outline"
          aria-pressed={mapSignal(session.choice, (value) => String(value === "forest"))}
          onClick={() => choose("forest")}
        >
          Forest
        </Button>
        <Button
          variant="outline"
          aria-pressed={mapSignal(session.choice, (value) => String(value === "open"))}
          onClick={() => choose("open")}
        >
          Open land
        </Button>
      </Inline>
      <Inline>
        <Button onClick={check}>Check</Button>
        <Button variant="quiet" onClick={reset}>
          Reset check
        </Button>
      </Inline>
      <p role="status">{session.feedback}</p>
    </Stack>
  );
}
