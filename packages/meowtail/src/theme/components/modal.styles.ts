import { css, partSelector } from "meowcss/meowjsx";
import { modalContract } from "../../components/modal";

/**
 * The wrapper is transparent to layout so a Modal can sit inside any arrangement;
 * the Dialog, DialogPanel, DialogHeader and DialogActions theme owns the modal look.
 */
export const modalStyles = css`
  ${partSelector(modalContract, "root")} {
    display: contents;
  }
`;
