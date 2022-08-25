import type { MessageActionRowComponentsBuilder } from "./actionRowComponent";

import { ActionRow, Constants } from "eris";
import { HelperBase } from "../base";

type AnyMessageActionRowComponentsBuilder = MessageActionRowComponentsBuilder<any>;

/**
 * a helper to build ActionRow for eris
 */
export class MessageActionRowBuilder extends HelperBase<ActionRow>{
  private readonly _type:number = Constants.ComponentTypes.ACTION_ROW;
  private _components:AnyMessageActionRowComponentsBuilder[] = [];

  get components():Readonly<AnyMessageActionRowComponentsBuilder[]>{
    return this._components;
  }

  get type(){
    return this._type;
  }

  addComponents(...components:AnyMessageActionRowComponentsBuilder[]){
    this._components.push(...components);
    return this;
  }

  setComponents(...components:AnyMessageActionRowComponentsBuilder[]){
    this._components = components;
    return this;
  }

  spliceComponents(index:number, deleteCount:number, ...components:AnyMessageActionRowComponentsBuilder[]){
    return this._components.splice(index, deleteCount, ...components);
  }

  toEris():ActionRow{
    return {
      type: this._type as Constants["ComponentTypes"]["ACTION_ROW"],
      components: this._components.map(component => component.toEris()),
    };
  }
}
