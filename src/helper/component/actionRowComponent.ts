import type { ActionRowComponents } from "eris";
import { HelperBase } from "../base";

export abstract class MessageActionRowComponentsBuilder<T extends ActionRowComponents> extends HelperBase<ActionRowComponents>{
  abstract override toEris():T;
}
