import { css, parts } from "meowcss/meowjsx";

import type { Modal } from "../../components/modal";
const modalPartRefs = parts<typeof Modal>("modal");
/**
 * The wrapper is transparent to layout so a Modal can sit inside any arrangement;
 * the Dialog, DialogPanel, DialogHeader and DialogActions theme owns the modal look.
 */
export const modalStyles = css`
  ${modalPartRefs.root} {
    display: contents;
  }
`;
