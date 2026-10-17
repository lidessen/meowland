import sight from "./assets/sight.svg" with { type: "file" };
import hearing from "./assets/hearing.svg" with { type: "file" };
import access from "./assets/access.svg" with { type: "file" };
import older from "./assets/older.svg" with { type: "file" };
import home from "./assets/home.svg" with { type: "file" };
import needs from "./assets/needs.svg" with { type: "file" };

// Textbook headwords; definitions and examples are original teacher adaptations.
export const vocabulary = [
  {
    word: "blind",
    phrase: "people who are blind",
    meaning: "Someone with little or no sight.",
    image: sight,
    label: "An eye symbol for sight",
  },
  {
    word: "deaf",
    phrase: "people who are deaf",
    meaning: "Someone with little or no hearing.",
    image: hearing,
    label: "An ear symbol for hearing",
  },
  {
    word: "disabled",
    phrase: "people with disabilities",
    meaning: "A person with a condition that can make some daily activities harder.",
    image: access,
    label: "An access symbol, one example of disability",
  },
  {
    word: "elderly",
    phrase: "older people",
    meaning: "An older person.",
    image: older,
    label: "An original illustration of an older person",
  },
  {
    word: "homeless",
    phrase: "people without a home",
    meaning: "Someone without a home.",
    image: home,
    label: "A house and a question mark",
  },
  {
    word: "poor",
    phrase: "people with very little money",
    meaning: "Someone with very little money for daily needs.",
    image: needs,
    label: "Hands and a coin, an illustration of daily needs",
  },
] as const;
export type VocabularyWord = (typeof vocabulary)[number]["word"];
