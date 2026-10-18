export interface GrowthStage {
  readonly age: string;
  readonly detail: string;
  readonly source: string;
}

export interface ReadingCard {
  readonly title: string;
  readonly detail: string;
  readonly source: string;
}

export interface ReadingExcerpt {
  readonly id: string;
  readonly text: string;
  readonly source: string;
}

export const lessonTitle = "Protecting pandas";
export const readingTitle = "Xiwang in safe hands";
export const sourceLabel = "Provided Reading 1 PPT · checked reading excerpts";

export const growthStages = [
  {
    age: "At birth",
    detail: "Tiny, pink and quiet, with her eyes closed; just 100 grams.",
    source: "PPT p.7, paragraph 1; p.8 growth chart",
  },
  {
    age: "In the beginning",
    detail: "She could not see, hear or even move. She received round-the-clock care.",
    source: "PPT p.7, paragraph 2",
  },
  {
    age: "At 6 months",
    detail: "She began to eat bamboo.",
    source: "G2 · PPT p.7, paragraph 2",
  },
  {
    age: "At 12 months",
    detail: "She weighed over 35 kilograms.",
    source: "G2 · PPT p.7, paragraph 2; p.8 growth chart",
  },
  {
    age: "At 20 months",
    detail: "She learnt to look after herself.",
    source: "G3 · PPT p.7, paragraph 2",
  },
] as const satisfies readonly GrowthStage[];

export const problemCards = [
  {
    title: "Having babies",
    detail: "It is difficult to have babies. Baby pandas may easily get sick and die.",
    source: "P1 · PPT p.10, paragraph 3",
  },
  {
    title: "A place to live",
    detail: "Bamboo forests are becoming smaller and smaller.",
    source: "P2 · PPT p.10, paragraph 3",
  },
  {
    title: "Enough food",
    detail: "Pandas may not have enough food to eat.",
    source: "P3 · PPT p.10, paragraph 3",
  },
] as const satisfies readonly ReadingCard[];

export const protectionCards = [
  {
    title: "Laws",
    detail: "There are laws to protect giant pandas.",
    source: "A1 · PPT p.11, paragraph 4",
  },
  {
    title: "Nature reserves",
    detail: "There are more nature reserves for pandas to live in.",
    source: "A1 · PPT p.11, paragraph 4",
  },
  {
    title: "Scientists' work",
    detail: "Scientists are working hard to help pandas have more babies.",
    source: "A2 · PPT p.11, paragraph 4",
  },
] as const satisfies readonly ReadingCard[];

// These are checked quotations, not the full reading or teacher-written answers.
export const readingExcerpts = [
  {
    id: "G1",
    text: "Xiwang was just 100 grams when I first saw her.",
    source: "PPT p.7 · embedded reading image · paragraph 1",
  },
  {
    id: "G2",
    text: "At six months old, she began to eat bamboo. Half a year later, she weighed over 35 kilograms.",
    source: "PPT p.7 · embedded reading image · paragraph 2",
  },
  {
    id: "G3",
    text: "When she was 20 months old, she learnt to look after herself.",
    source: "PPT p.7 · embedded reading image · paragraph 2",
  },
  {
    id: "P1",
    text: "It is difficult for them to have babies. Even if baby pandas are born, they may easily get sick and die.",
    source: "PPT p.10 · embedded reading image · paragraph 3",
  },
  {
    id: "P2",
    text: "Also, they live mainly on bamboo, but the bamboo forests are becoming smaller and smaller.",
    source: "PPT p.10 · embedded reading image · paragraph 3",
  },
  {
    id: "P3",
    text: "As a result, pandas may not have a place to live or enough food to eat.",
    source: "PPT p.10 · embedded reading image · paragraph 3",
  },
  {
    id: "A1",
    text: "There are laws to protect giant pandas and more nature reserves for them to live in.",
    source: "PPT p.11 · embedded reading image · paragraph 4",
  },
  {
    id: "A2",
    text: "Moreover, scientists are working hard to help pandas have more babies.",
    source: "PPT p.11 · embedded reading image · paragraph 4",
  },
  {
    id: "M1",
    text: "But they still need our protection. We believe things will get better and better, for where there is Xiwang, there is hope.",
    source: "PPT p.12 · embedded reading image · paragraph 5",
  },
] as const satisfies readonly ReadingExcerpt[];

export const meaningReference =
  "Xiwang grew with care. The reading describes action to help pandas, but says they still need protection. Hope means continuing to help.";

export const actionFrames = [
  "I will ___ this week because the reading says ___.",
  "I can help others understand ___ by ___.",
] as const;

export const actionChecks = [
  "Name one specific action you can actually take.",
  "Connect it to a problem or idea in the reading.",
  "Explain the connection; do not claim an unproved result.",
] as const;

export const pandaImage = {
  path: "assets/panda-reading.png",
  alt: "A young giant panda resting on a mossy log in the provided reading material.",
  source: "Provided PPT p.7 · reading image photograph; see SOURCES.md",
} as const;
