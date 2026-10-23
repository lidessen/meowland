/** Part identity for the complete Assistant. The view module renders code surfaces. */
export const assistantViewContract = {
  name: "assistant-view",
  parts: [
    "root",
    "layout",
    "messages",
    "viewport",
    "content",
    "latest",
    "composer",
    "feedback",
    "empty",
    "activity",
    "activityHeader",
    "activityBody",
    "section",
    "workDetail",
    "status",
    "history",
    "historyItem",
    "historyTrigger",
  ],
} as const;
