import { h, mapSignal, signal, type MaybeSignal } from "meowjsx";
import { Button, Grid, Inline, Stack } from "meowtail";
import { Presentation, Reveal, type SlideDefinition, type SlidePosition } from "meowslides";
import community from "./assets/community.svg" with { type: "file" };
import { vocabulary } from "./vocabulary";

export const lessonVersion = "sunshine-welcome-a3";
export interface LessonOptions {
  initialPosition?: SlidePosition;
  active?: MaybeSignal<boolean>;
}
const clues = [
  vocabulary[4],
  vocabulary[0],
  vocabulary[3],
  vocabulary[1],
  vocabulary[5],
  vocabulary[2],
];
export function createSunshineLesson(options: LessonOptions = {}) {
  const position = signal<SlidePosition>(
    options.initialPosition ?? { slideId: "welcome", step: 0 },
  );
  const choice = signal("");
  const reason = signal("");
  const matches = signal<string[]>(Array(6).fill(""));
  const readingChoices = signal<string[]>([]);
  const pairGroup = signal("");
  const pairIdea = signal("");
  const exitWord = signal("");
  const exitAction = signal("");
  const go = (slideId: string, step = 0) => {
    position.value = { slideId, step };
  };
  const wordCards = (start: number, end: number) => (
    <Grid columns={3} gap="relaxed">
      {vocabulary.slice(start, end).map((item) => (
        <Stack className="word-card" gap="normal" align="center">
          <img src={item.image} alt={item.label} width="150" height="130" />
          <h3>{item.word}</h3>
          <Reveal at={1}>
            <p className="word-meaning">{item.meaning}</p>
          </Reveal>
          <Reveal at={2}>
            <p className="word-phrase">{item.phrase}</p>
          </Reveal>
        </Stack>
      ))}
    </Grid>
  );
  const slides: readonly SlideDefinition[] = [
    {
      id: "welcome",
      title: "Sunshine for all",
      steps: 1,
      render: () => (
        <Grid
          columns={2}
          gap="relaxed"
          style={{ height: "100%", alignItems: "center", gridTemplateColumns: "1.35fr 1fr" }}
        >
          <Stack gap="relaxed">
            <p className="kicker">English 8B · Unit 6 · Welcome to the unit</p>
            <h1 className="lesson-title">
              Sunshine
              <br />
              for <em>all.</em>
            </h1>
            <p className="lead">
              Small acts.
              <br />A more welcoming world.
            </p>
            <Reveal at={1}>
              <p className="sun-label">Name six groups. Offer help. Explain why.</p>
            </Reveal>
            <p className="source-tag">
              Teacher-created introduction · based on the Welcome vocabulary
            </p>
          </Stack>
          <img
            className="hero-art"
            src={community}
            alt="Original illustration of neighbours greeting one another in a sunny community, including a wheelchair user"
          />
        </Grid>
      ),
    },
    {
      id: "notice",
      title: "Start with a question",
      steps: 2,
      render: () => (
        <Stack gap="relaxed">
          <header>
            <p className="kicker">01 / Notice & think</p>
            <h2 className="lesson-heading">Start with a question.</h2>
          </header>
          <Grid columns={2} gap="relaxed" style={{ alignItems: "center" }}>
            <img
              src={community}
              alt="Neighbours sharing a sunny public space"
              style={{ width: "100%", height: "330px", objectFit: "cover", borderRadius: "18px" }}
            />
            <Stack gap="relaxed">
              <p className="lead">
                What makes a place
                <br />
                <strong>welcoming for everyone?</strong>
              </p>
              <Reveal at={1}>
                <p className="feedback">
                  Think about a safe path,
                  <br />a friendly voice, or a place to stay.
                </p>
              </Reveal>
              <Reveal at={2}>
                <p className="small">
                  We cannot know every person's needs just by looking.
                  <br />
                  <strong>Ask. Listen. Then offer help.</strong>
                </p>
              </Reveal>
            </Stack>
          </Grid>
          <p className="source-tag">
            Teacher-created warm-up · open discussion, not a textbook answer
          </p>
        </Stack>
      ),
    },
    {
      id: "words-people",
      title: "Words for people",
      steps: 2,
      render: () => (
        <Stack gap="relaxed">
          <header>
            <p className="kicker">02 / Six useful words · 1 of 2</p>
            <h2 className="lesson-heading">Different people. Equal respect.</h2>
          </header>
          {wordCards(0, 3)}
          <p className="small">
            The pictures are symbols, not a test of how someone looks.
            <br />
            Not every disability is visible. Ask what support a person wants.
          </p>
          <p className="source-tag">
            Textbook headwords · definitions and phrases adapted by the teacher
          </p>
        </Stack>
      ),
    },
    {
      id: "words-life",
      title: "Different situations",
      steps: 2,
      render: () => (
        <Stack gap="relaxed">
          <header>
            <p className="kicker">02 / Six useful words · 2 of 2</p>
            <h2 className="lesson-heading">Different situations. Shared dignity.</h2>
          </header>
          {wordCards(3, 6)}
          <p className="small">
            A word does not tell a whole story. Older people do not all need help.
            <br />
            Use these words with care; do not label classmates.
          </p>
          <p className="source-tag">
            Textbook headwords · examples and respectful phrases are teacher-created
          </p>
        </Stack>
      ),
    },
    {
      id: "match",
      title: "Find the word",
      steps: 2,
      render: ({ step }) => (
        <Stack gap="normal">
          <header>
            <p className="kicker">03 / Think & match</p>
            <h2 className="lesson-heading">Match the clue. Use each word once.</h2>
          </header>
          <Grid columns={3} gap="normal">
            {clues.map((item, index) => (
              <div className="match-card">
                <label htmlFor={`clue-${index}`}>
                  <strong>{index + 1}.</strong> {item.meaning}
                </label>
                <select
                  className="lesson-field"
                  id={`clue-${index}`}
                  aria-label={`Match clue ${index + 1}`}
                  value={mapSignal(matches, (values) => values[index]!)}
                  onChange={(event: Event) => {
                    const value = (event.currentTarget as HTMLSelectElement).value;
                    matches.update((values) => values.map((old, i) => (i === index ? value : old)));
                  }}
                >
                  <option value="">Choose a word…</option>
                  {vocabulary.map((word) => (
                    <option value={word.word}>{word.word}</option>
                  ))}
                </select>
              </div>
            ))}
          </Grid>
          <Reveal at={1}>
            {mapSignal(step, (value) =>
              value === 1 ? (
                <p className="feedback">Hint: “sight” is about seeing; “hearing” is about sound.</p>
              ) : (
                <p className="feedback">
                  <strong>Reference matches:</strong> 1 homeless · 2 blind · 3 elderly · 4 deaf · 5
                  poor · 6 disabled.
                  <br />
                  <span className="small">
                    {mapSignal(matches, (values) =>
                      values.some(Boolean)
                        ? `${values.filter((word, index) => word === clues[index]!.word).length} of ${values.filter(Boolean).length} entered selections fit these clues. Compare aloud.`
                        : "No selections entered. Compare your spoken answers with the reference.",
                    )}
                  </span>
                </p>
              ),
            )}
          </Reveal>
          <Inline gap="normal">
            <Button
              variant="quiet"
              onClick={() => {
                matches.value = Array(6).fill("");
                go("match", 0);
              }}
            >
              Redo matching
            </Button>
            <Button variant="outline" onClick={() => go("words-people", 2)}>
              Revisit the words
            </Button>
          </Inline>
          <p className="source-tag">
            Teacher-created text-clue task · not the textbook picture-number answer key
          </p>
        </Stack>
      ),
    },
    {
      id: "read-talk",
      title: "Read, then talk",
      steps: 2,
      render: ({ step }) => (
        <Stack gap="normal">
          <header>
            <p className="kicker">04 / Welcome Part B · teacher adaptation</p>
            <h2 className="lesson-heading">A meal — and a safe place to stay.</h2>
          </header>
          <Grid columns={2} gap="relaxed" style={{ gridTemplateColumns: "1.1fr 1fr" }}>
            <div className="dialogue">
              <p>
                <strong>Lia</strong> How can we help people without a home?
              </p>
              <p>
                <strong>Ben</strong> We could offer food and clothes.
              </p>
              <p>
                <strong>Lia</strong> What about a safe place to stay?
              </p>
              <p>
                <strong>Ben</strong> We could write to the local government for help.
              </p>
            </div>
            <Stack gap="normal">
              <p className="lead" style={{ fontSize: "25px" }}>
                What help do they suggest?
                <br />
                <span className="small">Choose all that fit.</span>
              </p>
              {[
                ["food", "Food and clothes"],
                ["gifts", "Expensive gifts"],
                ["shelter", "Help finding a safe place to stay"],
              ].map(([value, label]) => (
                <label className="check-choice">
                  <input
                    type="checkbox"
                    checked={mapSignal(readingChoices, (values) => values.includes(value!))}
                    onChange={(event: Event) => {
                      const checked = (event.currentTarget as HTMLInputElement).checked;
                      readingChoices.update((values) =>
                        checked ? [...values, value!] : values.filter((item) => item !== value),
                      );
                    }}
                  />
                  {label}
                </label>
              ))}
              <Reveal at={1}>
                {mapSignal(step, (value) =>
                  value === 1 ? (
                    <p className="feedback">
                      Look for things people need now — and a place to live safely.
                    </p>
                  ) : (
                    <p className="feedback">
                      <strong>Suggested answers:</strong>
                      <br />
                      Food and clothes; help with a safe place to stay.
                    </p>
                  ),
                )}
              </Reveal>
            </Stack>
          </Grid>
          <p className="source-tag">
            Original short dialogue adapting the Part B topic · read aloud in pairs; no textbook
            audio
          </p>
        </Stack>
      ),
    },
    {
      id: "choose",
      title: "What could you say first?",
      steps: 3,
      render: ({ step }) => (
        <Stack gap="normal">
          <header>
            <p className="kicker">05 / Choose & explain</p>
            <h2 className="lesson-heading">What could you say first?</h2>
          </header>
          <p className="lead" style={{ fontSize: "24px" }}>
            A classmate who is blind is near a busy crossing.
          </p>
          <Grid columns={2} gap="relaxed" style={{ gridTemplateColumns: "1.15fr 1fr" }}>
            <Stack gap="normal">
              {[
                ["A", "Let me pull you across."],
                ["B", "Would you like some help?"],
                ["C", "You cannot go alone."],
              ].map(([letter, label]) => (
                <button
                  className="choice-card"
                  type="button"
                  aria-label={`Choose ${letter}: ${label}`}
                  aria-pressed={mapSignal(choice, (value) => (value === letter ? "true" : "false"))}
                  onClick={() => {
                    choice.value = letter!;
                  }}
                >
                  <span className="choice-letter">{letter}</span>
                  {label}
                </button>
              ))}
            </Stack>
            <Stack gap="normal">
              <div className="task-card">
                <label className="reason-label" htmlFor="choice-reason">
                  Give a reason
                </label>
                <textarea
                  className="lesson-field"
                  id="choice-reason"
                  aria-label="Give a reason"
                  rows={2}
                  placeholder="I choose __ because __."
                  value={reason}
                  onInput={(event: Event) => {
                    reason.value = (event.currentTarget as HTMLTextAreaElement).value;
                  }}
                />
              </div>
              <Reveal at={1}>
                {mapSignal(step, (value) =>
                  value === 1 ? (
                    <p className="feedback">
                      Which sentence asks,
                      <br />
                      instead of deciding for the person?
                    </p>
                  ) : (
                    <p className="feedback">
                      <strong>A helpful first question: B.</strong>
                      <br />
                      Ask before helping. Listen to what the person wants.
                    </p>
                  ),
                )}
              </Reveal>
              <Reveal at={3}>
                <p className="small">
                  Possible reason: “It gives the person a choice.”
                  <br />
                  Other thoughtful reasons are welcome.
                </p>
              </Reveal>
            </Stack>
          </Grid>
          <Inline gap="normal">
            <Button variant="outline" onClick={() => go("notice", 2)}>
              Revisit the idea
            </Button>
            <Button
              variant="quiet"
              onClick={() => {
                choice.value = "";
                reason.value = "";
                go("choose", 0);
              }}
            >
              Redo this task
            </Button>
          </Inline>
          <p className="source-tag">
            Teacher-created scenario · suggested wording, not a textbook question
          </p>
        </Stack>
      ),
    },
    {
      id: "pair-talk",
      title: "Make a helpful offer",
      steps: 1,
      render: () => (
        <Stack gap="relaxed">
          <header>
            <p className="kicker">06 / Work with a partner</p>
            <h2 className="lesson-heading">Make a helpful offer.</h2>
          </header>
          <Grid columns={2} gap="relaxed">
            <Stack className="task-card" gap="normal">
              <label className="reason-label" htmlFor="pair-group">
                Choose who to talk about
              </label>
              <select
                className="lesson-field"
                id="pair-group"
                aria-label="Choose who to talk about"
                value={pairGroup}
                onChange={(event: Event) => {
                  pairGroup.value = (event.currentTarget as HTMLSelectElement).value;
                }}
              >
                <option value="">Choose together…</option>
                {vocabulary.map((item) => (
                  <option value={item.word}>{item.phrase}</option>
                ))}
              </select>
              <label className="reason-label" htmlFor="pair-idea">
                Our idea and reason
              </label>
              <textarea
                className="lesson-field"
                id="pair-idea"
                aria-label="Our idea and reason"
                rows={3}
                value={pairIdea}
                placeholder="We could… because… First, we would ask…"
                onInput={(event: Event) => {
                  pairIdea.value = (event.currentTarget as HTMLTextAreaElement).value;
                }}
              />
              <p className="small">
                Imagine a situation. Ask what the person needs.
                <br />
                More than one kind of help may fit.
              </p>
            </Stack>
            <Stack gap="normal">
              <ol className="talk-steps">
                <li>Ask: “Would you like some help?”</li>
                <li>Suggest: “We could…”</li>
                <li>Explain: “…because…”</li>
                <li>Listen and respond.</li>
              </ol>
              <Reveal at={1}>
                <p className="feedback">
                  <strong>Example: people without a home</strong>
                  <br />
                  “We could collect clothes because people may need them. First, let’s ask what they
                  need.”
                </p>
              </Reveal>
            </Stack>
          </Grid>
          <p className="source-tag">
            Teacher-created speaking task · choose your own thoughtful idea; no single answer
          </p>
        </Stack>
      ),
    },
    {
      id: "take-action",
      title: "A little sunshine from us",
      steps: 1,
      render: () => (
        <Stack gap="relaxed">
          <header>
            <p className="kicker">07 / Exit ticket</p>
            <h2 className="lesson-heading">A little sunshine from us.</h2>
          </header>
          <Grid columns={2} gap="relaxed">
            <Stack className="task-card" gap="normal">
              <label className="reason-label" htmlFor="exit-word">
                One word I can use
              </label>
              <select
                className="lesson-field"
                id="exit-word"
                aria-label="One word I can use"
                value={exitWord}
                onChange={(event: Event) => {
                  exitWord.value = (event.currentTarget as HTMLSelectElement).value;
                }}
              >
                <option value="">Choose a word…</option>
                {vocabulary.map((item) => (
                  <option value={item.word}>{item.word}</option>
                ))}
              </select>
              <label className="reason-label" htmlFor="exit-action">
                One action I could offer
              </label>
              <textarea
                className="lesson-field"
                id="exit-action"
                aria-label="One action I could offer"
                rows={3}
                value={exitAction}
                placeholder="I could… First, I would ask…"
                onInput={(event: Event) => {
                  exitAction.value = (event.currentTarget as HTMLTextAreaElement).value;
                }}
              />
            </Stack>
            <Stack gap="relaxed">
              <p className="lead">
                Ask. Listen.
                <br />
                <strong>Offer — do not assume.</strong>
              </p>
              <p className="small">
                Your earlier choice:{" "}
                <strong>
                  {mapSignal(choice, (value) => (value ? `Option ${value}` : "not yet chosen"))}
                </strong>
                <br />
                Your reason:{" "}
                {mapSignal(reason, (value) => value || "Share a reason with your partner.")}
              </p>
              <Reveal at={1}>
                <p className="feedback">
                  Can you name the people,
                  <br />
                  suggest respectful help,
                  <br />
                  and explain your choice?
                </p>
              </Reveal>
              <Inline gap="normal">
                <Button variant="outline" onClick={() => go("choose", 0)}>
                  Revisit my choice
                </Button>
                <Button
                  variant="quiet"
                  onClick={() => {
                    exitWord.value = "";
                    exitAction.value = "";
                    go("take-action", 0);
                  }}
                >
                  Redo exit ticket
                </Button>
              </Inline>
            </Stack>
          </Grid>
          <p className="source-tag">
            Teacher-created reflection · personal answers are not graded automatically
          </p>
        </Stack>
      ),
    },
  ];
  return {
    view: (
      <Presentation
        slideClassName="sunshine-lesson"
        title="8B Unit 6 · Sunshine for all / Welcome"
        slides={slides}
        position={position}
        active={options.active}
      />
    ),
    position,
    choice,
    reason,
    matches,
    readingChoices,
    pairGroup,
    pairIdea,
    exitWord,
    exitAction,
    version: lessonVersion,
  };
}
