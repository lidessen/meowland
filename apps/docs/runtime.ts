import { installMeowUI } from "meowtail";

/**
 * The documentation chrome is made of meowtail's own components, so the one
 * default runtime has to carry their contracts before a page is rendered. The
 * install lives here, next to the code that needs it, so the guarantee travels
 * with the renderer and the app keeps one render graph.
 */
installMeowUI();
