import { h, type Child } from "meowjsx";

export interface DoodleCatProps {
  className?: string;
}

export function DoodleCat({ className = "empty-cat" }: DoodleCatProps = {}): Child {
  return (
    <svg
      className={`meow-doodle-cat ${className}`}
      viewBox="0 0 150 124"
      aria-hidden="true"
      focusable="false"
    >
      <path
        className="empty-cat-body"
        d="M35 87c-7-15-3-31 9-40l-3-23 20 17c8-3 17-3 25 1l19-18-4 25c10 9 14 24 9 38-6 18-25 27-45 25-14-1-25-9-30-25Z"
      />
      <path className="empty-cat-face" d="M56 64h.1M83 64h.1M64 77c4 3 9 3 13 0" />
      <path className="empty-cat-tail" d="M98 85c18-11 28-3 25 8-2 9-12 12-19 6" />
      <path
        className="empty-cat-whisker"
        d="M43 71c-8-2-14-3-21-3m21 10c-8 1-14 3-21 6m74-13c8-2 14-3 21-3m-21 10c8 1 14 3 21 6"
      />
    </svg>
  );
}
