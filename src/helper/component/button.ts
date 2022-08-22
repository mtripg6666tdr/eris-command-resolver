import { Button, Constants, PartialEmoji } from "eris";
import { MessageActionRowComponentsBuilder } from "./actionRowComponent";

type ButtonStyles = 
  |"PRIMARY"
  |"SECONDARY"
  |"SUCCESS"
  |"DANGER"
  |"LINK"
;

/**
 * a helper to build Button for eris
 */
export class MessageButtonBuilder extends MessageActionRowComponentsBuilder<Button> {
  private _customId:string;
  private _disabled:boolean;
  private _emoji:Partial<PartialEmoji>;
  private _label:string;
  private _style:ButtonStyles;
  private _type:Constants["ComponentTypes"]["BUTTON"] = Constants.ComponentTypes.BUTTON;
  private _url:string;

  constructor(_data?:Button){
    super();
    if(_data){
      if(_data.style === Constants.ButtonStyles.LINK){
        this._url = _data.url;
      }else{
        this._customId = _data.custom_id;
      }
      this._disabled = _data.disabled;
      this._emoji = _data.emoji;
      this._label = _data.label;
      this._style = (Object.keys(Constants.ButtonStyles) as (keyof typeof Constants["ButtonStyles"])[]).find(key => Constants.ButtonStyles[key] === _data.style);
    }
  }

  get customId(){
    return this._customId;
  }

  get disabled(){
    return this._disabled;
  }

  get emoji(){
    return this._emoji;
  }

  get label(){
    return this._label;
  }

  get style(){
    return this._style;
  }

  get type(){
    return this._type;
  }

  get url(){
    return this._url;
  }

  setCustomId(customId:string){
    this._customId = customId;
    return this;
  }

  setDisabled(disabled:boolean = true){
    this._disabled = disabled;
    return this;
  }

  setEmoji(emoji:string|Partial<PartialEmoji>){
    if(typeof emoji === "string"){
      if(!emoji) throw new Error("invalid emoji");
      this._emoji = {
        name: emoji,
        id: null,
      }
    }else{
      if(!emoji.name) throw new Error("invalid emoji");
      this._emoji = Object.assign({
        id: null,
      }, emoji);
    }
    return this;
  }

  setLabel(label:string){
    this._label = label;
    return this;
  }

  setStyle(style:ButtonStyles){
    this._style = style;
    return this;
  }

  setUrl(url:string){
    this._url = url;
    return this;
  }

  toEris(): Button {
    if(this.style === "LINK"){
      return {
        type: this._type,
        disabled: this._disabled,
        emoji: this._emoji,
        label: this._label,
        style: Constants.ButtonStyles.LINK,
        url: this._url,
      };
    }else{
      return {
        type: this._type,
        disabled: this._disabled,
        emoji: this._emoji,
        label: this._label,
        style: Constants.ButtonStyles[this._style as Exclude<typeof this["style"], "LINK">],
        custom_id: this._customId,
      };
    }
  }
}