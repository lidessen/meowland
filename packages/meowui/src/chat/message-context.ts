import { createContext } from "meowjsx";
import type { ChatMessageRole } from "./message";

export const messageRoleContext = createContext<ChatMessageRole>("assistant");
