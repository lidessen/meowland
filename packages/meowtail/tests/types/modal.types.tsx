import { h, signal, type Child } from "meowjsx";
import { Button, Modal } from "../../src/index";

const open = signal(false);
const title = signal<Child>("Rename workspace");

const controlled = (
  <Modal
    open={open}
    onOpenChange={(next) => {
      open.value = next;
    }}
    title={title}
    description={<span>The name appears in shared links.</span>}
    actions={[<Button variant="quiet">Cancel</Button>, <Button>Save name</Button>]}
    closeLabel="Dismiss rename"
    id="rename-workspace"
  >
    <p>Body copy</p>
  </Modal>
);

const minimal = (
  <Modal open={false} onOpenChange={() => {}} title="Notice">
    Body only
  </Modal>
);

const nonDismissible = (
  <Modal open={open} onOpenChange={() => {}} title="Final review" dismissible={false}>
    Locked copy
  </Modal>
);

const missingTitle = (
  // @ts-expect-error The dialog takes its accessible name from the required title.
  <Modal open={false} onOpenChange={() => {}}>
    Body
  </Modal>
);

const badOpen = (
  // @ts-expect-error open is a boolean state, not an arbitrary string.
  <Modal open="yes" onOpenChange={() => {}} title="Notice">
    Body
  </Modal>
);

void controlled;
void minimal;
void nonDismissible;
void missingTitle;
void badOpen;
