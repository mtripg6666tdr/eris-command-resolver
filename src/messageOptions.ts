import type { FileContent, MessageContent } from "eris";

export type MessageOptions = MessageContent & {
  files?: FileContent|FileContent[],
};
