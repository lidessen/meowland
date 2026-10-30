import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Button, Container, Section, Stack } from "meowtail";

export const SectionStory = defineStory({
  id: "section",
  title: "Section · Plain, card, nested and footer",
  group: "Pages and layout",
  groupOrder: 10,
  component: "Section",
  variant: "Titled region presentations",
  description:
    "The same titled region in its two presentations: a plain section in the page rhythm and a card section wrapped in the existing Card surface. A nested section steps down one heading level, and a section without identity slots is only a grouping wrapper.",
  covers: [
    "plain section",
    "card section",
    "nested section",
    "actions",
    "footer",
    "grouping wrapper",
  ],
  render: () => (
    <Container width="page">
      <Container width="content">
        <Stack gap="normal">
          <Section
            title="Notifications"
            description="Choose how the project reaches you."
            actions={
              <Button variant="quiet" size="small">
                Reset
              </Button>
            }
            footer="Saved automatically when you leave the field."
          >
            <p>
              Email digests are sent once a day. The section header carries the name, one line of
              purpose and the actions for the whole region.
            </p>
          </Section>

          <Section
            title="Notification channels"
            description="A card section carries its own action row and a footer."
            variant="card"
            actions={
              <Button variant="quiet" size="small">
                Reset
              </Button>
            }
            footer={
              <Button variant="quiet" size="small">
                Manage channels
              </Button>
            }
          >
            <p>
              The card variant wraps the plain section in the existing Card surface, so the card
              keeps one visual owner and the section keeps its parts.
            </p>
            <Section title="Nested section" description="One heading level deeper inside the card.">
              <p>
                A section nested in another section renders h3; a standalone section and a section
                directly under a page both start at h2.
              </p>
            </Section>
          </Section>

          <Section>
            <p>
              A section without a title is a grouping wrapper: it renders its content only, with no
              heading, action row or footer of its own.
            </p>
          </Section>
        </Stack>
      </Container>
    </Container>
  ),
});

const longSectionCopy = {
  title: "Review the notification digest before the project switches to the new delivery schedule",
  description:
    "The title is a sentence, the description adds the constraint, and the action group has to wrap under them without covering the copy.",
  paragraph:
    "A section owns one titled region. Its header keeps the description under the title and places the actions on the heading row; when the row runs out of width the whole action group wraps below the copy rather than squeezing one line of text into a narrow column.",
  footer:
    "The footer carries a supporting note after the content: the sample that will be sent first, and who reviews it.",
};

export const SectionLongContentStory = defineStory({
  id: "section-long-content",
  title: "Section · Long headings, descriptions and wrapped actions",
  group: "Pages and layout",
  groupOrder: 10,
  component: "Section",
  variant: "Long content and narrow window",
  description:
    "The same public section under content pressure: a long heading sentence, a long description, a wrapping action row, long body copy and a long footer note at desktop and narrow widths.",
  covers: ["long title", "long description", "wrapped actions", "long body", "footer note"],
  render: () => (
    <Container width="page">
      <Container width="content">
        <Stack gap="normal">
          <Section
            title={longSectionCopy.title}
            description={longSectionCopy.description}
            actions={[
              <Button variant="quiet" size="small">
                Preview the digest
              </Button>,
              <Button variant="quiet" size="small">
                Review recipients
              </Button>,
            ]}
            footer={longSectionCopy.footer}
            variant="card"
          >
            <p>{longSectionCopy.paragraph}</p>
            <p>
              Long unbroken identifiers such as
              {` ${"notification-digest-delivery-schedule".repeat(2)} `}
              wrap inside the content column instead of widening it.
            </p>
          </Section>

          <Section
            title={longSectionCopy.title}
            description={longSectionCopy.description}
            footer={longSectionCopy.footer}
          >
            <p>{longSectionCopy.paragraph}</p>
            <Section title="A nested heading that is also a full sentence about the digest">
              <p>
                A nested section steps down one heading level and keeps the same header, action and
                footer slots.
              </p>
            </Section>
          </Section>
        </Stack>
      </Container>
    </Container>
  ),
});
