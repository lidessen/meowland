import { h, type Child, type ClassValue } from "meowjsx";

export interface EmptyStackProps {
  className?: ClassValue;
}

/**
 * EmptyState's default artwork: three receding cards with one placeholder entry on the front
 * card. Shapes carry classes only; the theme paints them from the surface ladder, so the art
 * follows the scheme and a host theme without edits here.
 */
export function EmptyStack({ className }: EmptyStackProps = {}): Child {
  return (
    <svg
      className={["meow-empty-stack", className]}
      viewBox="0 0 128 96"
      aria-hidden="true"
      focusable="false"
    >
      <rect className="empty-stack-back" x="32" y="6.5" width="64" height="44" rx="10" />
      <rect className="empty-stack-middle" x="20" y="17.5" width="88" height="50" rx="12" />
      <rect className="empty-stack-front" x="8.5" y="31.5" width="111" height="58" rx="14" />
      <rect className="empty-stack-tile" x="21" y="46" width="28" height="28" rx="8" />
      <path
        className="empty-stack-spark"
        d="M35 52.5c.7 4.4 2.1 5.8 6.5 6.5-4.4.7-5.8 2.1-6.5 6.5-.7-4.4-2.1-5.8-6.5-6.5 4.4-.7 5.8-2.1 6.5-6.5Z"
      />
      <rect className="empty-stack-line" x="59" y="51" width="46" height="7" rx="3.5" />
      <rect className="empty-stack-line is-short" x="59" y="63" width="30" height="7" rx="3.5" />
    </svg>
  );
}
