import { Constants, SelectMenu, SelectMenuOptions } from "eris";
import { MessageActionRowComponentsBuilder } from "./actionRowComponent";

/**
 * a helper to build SelectMenu for eris
 */
export class MessageSelectMenuBuilder extends MessageActionRowComponentsBuilder<SelectMenu>{
  private _customId:string;
  private _disabled:boolean;
  private _maxValues:number;
  private _minValues:number;
  private _options:SelectMenuOptions[];
  private _placeholder:string;
  private _type:Constants["ComponentTypes"]["SELECT_MENU"] = Constants.ComponentTypes.SELECT_MENU;

  constructor(_data?:SelectMenu){
    super();
    if(_data){
      this._customId = _data.custom_id;
      this._disabled = _data.disabled;
      this._maxValues = _data.max_values;
      this._minValues = _data.min_values;
      this._options = _data.options.map(obj => Object.assign({}, obj));
      this._placeholder = _data.placeholder;
      this._type = _data.type;
    }
  }

  get customId(){
    return this._customId;
  }

  get disabled(){
    return this._disabled;
  }

  get maxValues(){
    return this._maxValues;
  }

  get minValues(){
    return this._minValues;
  }

  get options():Readonly<SelectMenuOptions[]>{
    return this._options;
  }

  get placeholder(){
    return this._placeholder;
  }

  get type(){
    return this._type;
  }

  addOptions(...options:SelectMenuOptions[]){
    (this._options = this._options || []).push(...options);
    return this;
  }

  setCustomId(customId:string){
    this._customId = customId;
    return this;
  }

  setDisabled(disabled:boolean = true){
    this._disabled = disabled;
    return this;
  }

  setMaxValues(maxValues:number){
    this._maxValues = maxValues;
    return this;
  }

  setMinValues(minValues:number){
    this._minValues = minValues;
    return this;
  }

  setOptions(...options:SelectMenuOptions[]){
    this._options = options;
    return this;
  }

  setPlaceholder(placeholder:string){
    this._placeholder = placeholder;
    return this;
  }

  spliceOptions(index:number, deleteCount:number, ...options:SelectMenuOptions[]){
    return this._options.splice(index, deleteCount, ...options);
  }

  toEris(): SelectMenu {
    return {
      custom_id: this._customId,
      disabled: this.disabled,
      max_values: !this._maxValues && this._minValues ? this._options.length : this._maxValues,
      min_values: this._minValues,
      options: this._options,
      placeholder: this._placeholder,
      type: this._type,
    }
  }
}