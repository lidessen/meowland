import { h, mapSignal, signal, type Child, type MaybeSignal, type WritableSignal } from "meowjsx";
import { Inline, Stack } from "meowtail";
import {
  Presentation,
  PresentationLayout,
  PresentationText,
  Reveal,
  type SlideDefinition,
  type SlidePosition,
} from "meowtail/presentation";
import { growthStages, problemCards, protectionCards, readingExcerpts } from "./content";
import panda from "./assets/panda-reading.png" with { type: "file" };

export const lessonVersion = "protecting-pandas-a3";
type TaskId = "growth" | "problems" | "protect" | "meaning" | "act";
type SupportKind = "hint" | "reference" | "evidence";
let nextInstance = 0;
export interface LessonOptions {
  initialPosition?: SlidePosition;
  active?: MaybeSignal<boolean>;
}

export function createPandaLesson(options: LessonOptions = {}) {
  const prefix = `panda-${++nextInstance}`;
  const position = signal<SlidePosition>(
    options.initialPosition ?? { slideId: "welcome", step: 0 },
  );
  const growthChoice = signal("");
  const problemChoice = signal("");
  const protectionChoice = signal("");
  const meaningChoice = signal("");
  const actionIdea = signal("");
  const pledge = signal("");
  const makeSupport = () => ({
    hint: signal(false),
    reference: signal(false),
    evidence: signal(false),
  });
  const supports = {
    growth: makeSupport(),
    problems: makeSupport(),
    protect: makeSupport(),
    meaning: makeSupport(),
    act: makeSupport(),
  };
  const selections = {
    growth: growthChoice,
    problems: problemChoice,
    protect: protectionChoice,
    meaning: meaningChoice,
    act: actionIdea,
  };
  const reset = (id: TaskId) => {
    selections[id].value = "";
    if (id === "act") pledge.value = "";
    for (const value of Object.values(supports[id])) value.value = false;
  };
  const choiceCard = (
    name: string,
    value: string,
    label: string,
    detail: string | undefined,
    selected: WritableSignal<string>,
  ) => (
    <button
      type="button"
      className="panda-option"
      aria-label={name}
      aria-pressed={mapSignal(selected, (current) => String(current === value))}
      onClick={() => {
        selected.value = value;
      }}
    >
      <span className="panda-option-mark" aria-hidden="true">
        {mapSignal(selected, (current) => (current === value ? "✓" : "○"))}
      </span>
      <span>
        <span className="panda-option-title">{label}</span>
        {detail ? <span className="panda-option-detail">{detail}</span> : null}
      </span>
    </button>
  );
  const header = (number: string, title: string, question: string) => (
    <header>
      <p className="panda-kicker">{number} / Read · think · explain</p>
      <h2>{title}</h2>
      <p className="panda-question">{question}</p>
    </header>
  );
  const reading = (id: TaskId, group: string) => (
    <section className="panda-reading" aria-label="Reading excerpts">
      <h3>Read the evidence</h3>
      {readingExcerpts
        .filter((entry) => entry.id.startsWith(group))
        .map((entry) => (
          <blockquote>
            <span className="panda-source-id">{entry.id}</span>
            <span data-evidence={mapSignal(supports[id].evidence, String)}>{entry.text}</span>
          </blockquote>
        ))}
    </section>
  );
  const footer = (id: TaskId, texts: Record<SupportKind, string>) => (
    <footer className="panda-support">
      <Inline gap="compact" wrap>
        {(
          [
            ["hint", "Hint"],
            ["reference", "Reference"],
            ["evidence", "Evidence"],
          ] as const
        ).map(([kind, label]) => (
          <button
            type="button"
            className="panda-action"
            aria-expanded={mapSignal(supports[id][kind], String)}
            aria-controls={`${prefix}-${id}-${kind}`}
            onClick={() => {
              supports[id][kind].value = !supports[id][kind].value;
            }}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          className="panda-action"
          data-secondary="true"
          onClick={() => reset(id)}
        >
          Start this task again
        </button>
      </Inline>
      <div className="panda-support-panels">
        {(
          [
            ["hint", "Hint"],
            ["reference", "Reference"],
            ["evidence", "Evidence"],
          ] as const
        ).map(([kind, label]) => (
          <Reveal when={supports[id][kind]}>
            <section
              className="panda-support-panel"
              data-kind={kind}
              id={`${prefix}-${id}-${kind}`}
              aria-label={`${label} panel`}
            >
              <h3>{label}</h3>
              <p>{texts[kind]}</p>
            </section>
          </Reveal>
        ))}
      </div>
      <p className="panda-footer-note">
        Teaching adaptation · excerpts from the supplied reading · choices and writing stay until
        you restart this task.
      </p>
    </footer>
  );
  const task = (
    id: TaskId,
    number: string,
    title: string,
    question: string,
    children: Child,
    texts: Record<SupportKind, string>,
  ) => (
    <PresentationLayout
      columns={id === "act" ? "equal" : "wide-start"}
      gap="compact"
      header={header(number, title, question)}
      footer={footer(id, texts)}
    >
      {children}
    </PresentationLayout>
  );
  const slides: readonly SlideDefinition[] = [
    {
      id: "welcome",
      title: "Protecting pandas",
      steps: 1,
      background: {
        fill: "linear-gradient(115deg, #fbf8ed 58%, #e5ebd7 100%)",
        foreground: "dark",
      },
      render: () => (
        <PresentationLayout
          columns="wide-start"
          footer={
            <p className="panda-caption">
              8A Unit 5 · Wild animals · Reading · teacher-created activities based on the supplied
              materials
            </p>
          }
        >
          <Stack gap="normal" justify="center">
            <p className="panda-kicker">Wild animals / Reading</p>
            <h1>
              <PresentationText effect="editorial">
                Protecting
                <br />
                <em>pandas.</em>
              </PresentationText>
            </h1>
            <p className="panda-lead">
              One story.
              <br />A reason to care. An action with a reason.
            </p>
            <Reveal at={1} transition="fade">
              <p className="panda-question">
                Read Xiwang’s story. Find evidence.
                <br />
                Explain what you could do.
              </p>
            </Reveal>
          </Stack>
          <Stack justify="center" gap="compact">
            <img
              className="panda-hero"
              src={panda}
              alt="A young giant panda resting on a mossy log, from the supplied reading material"
            />
            <p className="panda-image-note">
              Photo from the supplied reading · individual not independently identified
            </p>
          </Stack>
        </PresentationLayout>
      ),
    },
    {
      id: "growth",
      title: "Growing up",
      render: () =>
        task(
          "growth",
          "01",
          "A small beginning.",
          "Choose a stage. Use the reading to tell what changed.",
          [
            reading("growth", "G"),
            <div
              className="panda-options"
              data-compact="true"
              role="group"
              aria-label="Growth stages"
            >
              {growthStages
                .filter((stage) => stage.age !== "In the beginning")
                .map((stage) =>
                  choiceCard(
                    `Select stage: ${stage.age}`,
                    stage.age,
                    stage.age,
                    undefined,
                    growthChoice,
                  ),
                )}
            </div>,
          ],
          {
            hint: "Find time words and changes in size or food. Begin: First… Then… Later…",
            reference:
              "Teacher model: At six months she began eating bamboo; at twelve months she weighed over 35 kilograms.",
            evidence: "Match a card to G1–G3. Half a year after six months means twelve months.",
          },
        ),
    },
    {
      id: "problems",
      title: "Problems and consequences",
      render: () =>
        task(
          "problems",
          "02",
          "What makes survival difficult?",
          "Choose one problem. Explain what may happen, using an original sentence.",
          [
            reading("problems", "P"),
            <div className="panda-options" role="group" aria-label="Problems to explore">
              {problemCards.map((card) =>
                choiceCard(
                  `Explore problem: ${card.title}`,
                  card.title,
                  card.title,
                  undefined,
                  problemChoice,
                ),
              )}
            </div>,
          ],
          {
            hint: "Separate the difficulty from its possible consequence. Which words connect them?",
            reference:
              "Smaller bamboo forests may mean less space and food. Keep may when explaining this possibility.",
            evidence:
              "P1 describes baby pandas. P2–P3 connect forests with possible consequences. Explain the connection.",
          },
        ),
    },
    {
      id: "protect",
      title: "Protection with a purpose",
      render: () =>
        task(
          "protect",
          "03",
          "An action needs a reason.",
          "Choose a measure. Explain the problem it could address.",
          [
            reading("protect", "A"),
            <div className="panda-options" role="group" aria-label="Protection measures">
              {protectionCards.map((card) =>
                choiceCard(
                  `Choose action: ${card.title}`,
                  card.title,
                  card.title,
                  undefined,
                  protectionChoice,
                ),
              )}
            </div>,
          ],
          {
            hint: "Return to a problem. One measure may relate to more than one problem.",
            reference:
              "Reserves relate to places to live; scientific work relates to having babies. Explain other links.",
            evidence:
              "A1–A2 name three measures. The passage does not give three exclusive problem–action pairs.",
          },
        ),
    },
    {
      id: "meaning",
      title: "Safe hands, continued protection",
      render: () =>
        task(
          "meaning",
          "04",
          "Read the ending again.",
          "Why is protection still needed? Choose an idea and explain.",
          [
            reading("meaning", "M"),
            <Stack gap="normal">
              <div className="panda-options" role="group" aria-label="Ideas to discuss">
                {choiceCard(
                  "Discuss idea: Care solves every problem",
                  "finished",
                  "Care solves every problem.",
                  undefined,
                  meaningChoice,
                )}
                {choiceCard(
                  "Discuss idea: Progress still needs protection",
                  "continue",
                  "Progress still needs protection.",
                  undefined,
                  meaningChoice,
                )}
              </div>
              <p className="panda-caption">
                Discuss the reasons. A selected card is your starting point, not an automatic grade.
              </p>
            </Stack>,
          ],
          {
            hint: "Read still. What does safe hands suggest? What remains necessary?",
            reference:
              "Care gives hope while problems still need attention. Explain a link to an earlier problem.",
            evidence:
              "Connect M1 with an earlier problem. Hope is the passage’s message, not a current population statistic.",
          },
        ),
    },
    {
      id: "act",
      title: "My action, my reason",
      render: () =>
        task(
          "act",
          "05",
          "Make it specific. Make it yours.",
          "What could you do? Connect one possible action to a problem from the reading.",
          [
            <Stack gap="normal">
              <div className="panda-options" role="group" aria-label="Action starting points">
                {[
                  "Share reliable information",
                  "Care for habitats",
                  "Learn from a protection project",
                ].map((label) =>
                  choiceCard(`Use idea: ${label}`, label, label, undefined, actionIdea),
                )}
              </div>
              <p className="panda-caption">
                Teacher-created starting points. Other thoughtful actions are welcome.
              </p>
            </Stack>,
            <Stack gap="normal">
              <div>
                <label className="panda-label" htmlFor={`${prefix}-pledge`}>
                  My action and reason
                </label>
                <textarea
                  id={`${prefix}-pledge`}
                  className="panda-writing"
                  aria-label="My action and reason"
                  rows={3}
                  value={pledge}
                  placeholder="I could… because… My first step would be…"
                  onInput={(event: Event) => {
                    pledge.value = (event.currentTarget as HTMLTextAreaElement).value;
                  }}
                />
              </div>
              <p className="panda-caption">
                Partner check: Is it specific? Does the reason fit the reading?
              </p>
            </Stack>,
          ],
          {
            hint: "Say what, when or with whom. I could… because… My first step would be…",
            reference:
              "No single model pledge: name an action, a relevant reason and a clear first step.",
            evidence:
              "Return to a reading problem. Separate its facts from your proposal; do not claim an untested result.",
          },
        ),
    },
  ];
  return {
    view: (
      <Presentation
        slideClassName="panda-lesson"
        title="8A Unit 5 · Wild animals / Protecting pandas · a3"
        slides={slides}
        position={position}
        active={options.active}
        background="theme"
        transition={{ effect: "fade", speed: "fast" }}
      />
    ),
    position,
    growthChoice,
    problemChoice,
    protectionChoice,
    meaningChoice,
    actionIdea,
    pledge,
    supports,
    version: lessonVersion,
  };
}
