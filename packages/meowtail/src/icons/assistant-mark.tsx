import { h, type Child, type ClassValue } from "meowjsx";

export interface AssistantMarkProps {
  className?: ClassValue;
}

/**
 * The assistant's identity mark: a solid ink disc with the Meowland silhouette knocked out of
 * it. Monochrome and high-contrast, so it reads at avatar size; the theme flips it per scheme.
 */
export function AssistantMark({ className }: AssistantMarkProps = {}): Child {
  return (
    <svg
      className={["meow-assistant-mark", className]}
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
    >
      <circle className="assistant-mark-disc" cx="50" cy="50" r="50" />
      <path
        className="assistant-mark-glyph"
        transform="translate(20 19) scale(0.6)"
        fill-rule="evenodd"
        d="M17.5 42C15.6 34.5 16.8 25.8 19.8 19.4C21.4 16.6 24.6 16.4 26.6 18.9C30.4 23.4 35.2 26.4 40.4 28.4C46.8 26.2 53.6 26.1 60 28.2C65.2 26.2 69.8 23.1 73.4 18.6C75.4 16.1 78.8 16.3 80.3 19.3C83.2 25.8 83 35 82 42.5C87 47.5 89.8 53.2 90.3 60.2C90.6 74.5 79 86 62.4 87.5C55 88.3 45 88.2 38 87.1C20.6 85.2 9.5 73.4 10.2 59C10.4 52.6 13.2 47 17.5 42ZM26.5 52.5C30 47.5 38.5 47.8 43.5 52.8C41.5 59 34 62 28.6 59C26 57.5 25 55 26.5 52.5ZM56.5 53C61.5 48 70 47.6 73.5 52.4C75 55 74 57.6 71.4 59.1C66 62 58.5 59 56.5 53Z"
      />
    </svg>
  );
}
