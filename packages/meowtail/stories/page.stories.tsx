import { h } from "meowjsx";
import { defineStory } from "meowbook";
import {
  Alert,
  Badge,
  Button,
  Container,
  Icon,
  ListGroup,
  ListRow,
  Page,
  Section,
  Toolbar,
} from "meowtail";

export const PageStory = defineStory({
  id: "page",
  title: "Page · Documentation page with sections",
  group: "Pages and layout",
  groupOrder: 10,
  component: "Page",
  variant: "Content page composition",
  description:
    "One content page inside a host region: identity, page tools, a status row and the section rhythm. The outer Container stands in for the host shell's page area; Page itself owns no viewport and no scrolling.",
  covers: [
    "page header",
    "eyebrow",
    "description",
    "page actions",
    "toolbar",
    "notice",
    "section rhythm",
    "card section",
    "nested section",
  ],
  render: () => (
    <Container width="page">
      <Page
        eyebrow="Guide · Composition"
        title="Build a page from regions"
        description="Page arranges the page identity, optional tools and the content rhythm; Section names one part of that content and keeps its heading level."
        actions={[
          <Button variant="outline">Copy page link</Button>,
          <Button variant="quiet">Edit this page</Button>,
        ]}
        toolbar={
          <Toolbar label="Page tools">
            <Button variant="quiet" size="small">
              <Icon name="list-checks" />
              Filters
            </Button>
            <Button variant="quiet" size="small">
              <Icon name="list" />
              Outline
            </Button>
          </Toolbar>
        }
        notice={
          <Alert
            layout="bar"
            tone="info"
            actions={
              <Button variant="quiet" size="small">
                View source
              </Button>
            }
          >
            This guide is generated from the authoring templates; only the local controls run here.
          </Alert>
        }
      >
        <Section title="Overview" description="What the two compositions own.">
          <p>
            The page owns the identity block and the spacing between its sections; each section owns
            one titled region. Both arrangements compose primitives that already exist, so the page
            keeps one visual language instead of starting another one.
          </p>
        </Section>

        <Section
          title="Compose the identity"
          description="Eyebrow, title, description and actions form one block."
          actions={
            <Button variant="quiet" size="small">
              Open example
            </Button>
          }
        >
          <p>
            PageHeader renders the h1 and its supporting copy. The eyebrow names the area the page
            belongs to, and the actions act on the page rather than on one section.
          </p>
          <ListGroup>
            <ListRow
              title="Eyebrow"
              description="A small label for the area the page belongs to."
              status="Optional"
            />
            <ListRow
              title="Actions"
              description="Controls that act on the whole page, aligned with the title."
            />
            <ListRow
              title="Notice"
              description="A status row between the identity and the content."
              status={[<Badge tone="accent">Current</Badge>]}
            />
          </ListGroup>
        </Section>

        <Section
          title="Keep one section rhythm"
          description="Sections stack at the page's spacing step."
          actions={
            <Button variant="quiet" size="small">
              Reset
            </Button>
          }
          footer="A nested section steps down one heading level."
          variant="card"
        >
          <p>
            The card variant wraps the same section in the existing Card surface, so a card section
            and a plain section stay one visual language.
          </p>
          <Section title="Nested section">
            <p>
              A section inside a page renders h2; a section nested in another section renders h3.
              The heading level comes from the surrounding region rather than from the caller.
            </p>
          </Section>
        </Section>

        <Section title="Escapes stay available" description="Custom chrome replaces identity only.">
          <p>
            A host that already renders its own header passes the header slot: the toolbar, notice
            and content stay, and the identity block is replaced rather than duplicated. Genuinely
            custom regions can still drop to PageFrame, Card or a layout primitive.
          </p>
        </Section>
      </Page>
    </Container>
  ),
});

const longPageCopy = {
  eyebrow: "Guide · Authoring composition and host integration",
  title: "Keep a page readable when the title, description and action row are all long",
  description:
    "A long page identity stays inside the content column, the page tools wrap to their own row, and a long notice does not push the sections out of the reading order.",
  actionA: "Copy the permanent link to this page",
  actionB: "Open the source for this page",
  notice:
    "This page is rendered from fixed example content, so the notice can carry its longest status line without moving the content column.",
  overviewTitle: "The content column remains the reading column at every width",
  overviewDescription:
    "Width is chosen by the host shell: the page forwards narrow, content, wide or full to the existing Container and never insets the content a second time.",
  sectionTitle: "Sections stay readable when their headings are sentences rather than labels",
  sectionDescription:
    "The heading row keeps the description under the title and lets the action group wrap below it, so no control covers text on a narrow window.",
  paragraph:
    "A page is a region inside an application shell, not a shell of its own. The host owns the rail, the window bar and the scroll position; the page owns the identity, the tools, the status row and the rhythm between sections. Keeping that split means a page can be dropped into a documentation reader, a settings column or a standalone window without a second layout.",
};

export const PageLongContentStory = defineStory({
  id: "page-long-content",
  title: "Page · Long identity, tools and notice",
  group: "Pages and layout",
  groupOrder: 10,
  component: "Page",
  variant: "Long content and narrow window",
  description:
    "The same public page composition under content pressure: long eyebrow, title, description, actions and notice, then long section copy. No business request is simulated.",
  covers: ["long title", "long description", "action row", "toolbar", "notice", "narrow window"],
  render: () => (
    <Container width="page">
      <Page
        eyebrow={longPageCopy.eyebrow}
        title={longPageCopy.title}
        description={longPageCopy.description}
        actions={[
          <Button variant="outline">{longPageCopy.actionA}</Button>,
          <Button variant="quiet">{longPageCopy.actionB}</Button>,
        ]}
        toolbar={
          <Toolbar label="Page view tools">
            <Button variant="quiet" size="small">
              <Icon name="list" />
              Reading width: content
            </Button>
            <Button variant="quiet" size="small">
              <Icon name="settings" />
              Appearance: follow system
            </Button>
          </Toolbar>
        }
        notice={
          <Alert
            layout="bar"
            tone="warning"
            actions={
              <Button variant="quiet" size="small">
                Review the change
              </Button>
            }
          >
            {longPageCopy.notice}
          </Alert>
        }
      >
        <Section title={longPageCopy.overviewTitle} description={longPageCopy.overviewDescription}>
          <p>{longPageCopy.paragraph}</p>
        </Section>
        <Section
          title={longPageCopy.sectionTitle}
          description={longPageCopy.sectionDescription}
          actions={[
            <Button variant="quiet" size="small">
              Previous
            </Button>,
            <Button variant="quiet" size="small">
              Next
            </Button>,
          ]}
          footer="The footer keeps a supporting note in a smaller line after the content."
        >
          <p>{longPageCopy.paragraph}</p>
          <p>
            Long words such as
            {` ${"authoring-composition-with-regions".repeat(2)} `}
            wrap instead of forcing the content column wider than the host allows.
          </p>
        </Section>
      </Page>
    </Container>
  ),
});
