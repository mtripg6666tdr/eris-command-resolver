import type { CommandInteraction, ComponentInteraction, Message, MessageContent, TextChannel } from "eris";
import { CommandMessage } from "./CommandMessage";
import { MessageOptions } from "./messageOptions";
import { createMessageUrl } from "./util";

/**
 * Represents the response message from the bot bound to CommandMessage
 */
export class ResponseMessage {
  protected isMessage = false;
  protected _interaction = null as CommandInteraction|ComponentInteraction;
  protected _message = null as Message;
  protected _commandMessage = null as CommandMessage;
  protected constructor(){}

  /**
   * Initialize this from response message (Message) and CommandMessage
   * @param message Response message
   * @returns new ResponseMessage instance
   */
  static createFromMessage(message:Message, commandMessage:CommandMessage){
    if(message.author.id !== message.channel.client.user.id) 
      throw new Error("Message is not the response message");
    const me = new ResponseMessage();
    me.isMessage = true;
    me._message = message;
    me._commandMessage = commandMessage;
    return me;
  }

  /**
   * Initialize this from interaction, response message and CommandMessage
   * @param interaction interaction an user sent this must be CommandInteraction or ComponentInteraction fired by changing select menus
   * @param message response message
   * @param commandMessage CommandMessage
   * @returns new ResponseMessage instance
   */
  static createFromInteraction(interaction:CommandInteraction|ComponentInteraction, message:Message, commandMessage:CommandMessage){
    const me = new ResponseMessage();
    me.isMessage = false;
    me._interaction = interaction;
    if(message.author.id !== interaction.channel.client.user.id) 
      throw new Error("Message is not the response message");
    // @ts-ignore
    me._message = message instanceof Message ? message : new Message(client, message);
    me._commandMessage = commandMessage;
    return me;
  }

  /**
   * Edit the responce message
   * @param options message content
   * @returns Edited ResponseMessage
   */
  async edit(options:MessageContent):Promise<ResponseMessage>{
    if(this.isMessage){
      let _opt = null as MessageOptions;
      if(typeof options === "string"){
        _opt = {
          content: options
        }
      }else{
        _opt = options;
      }
      const msg = await this._message.edit(Object.assign(_opt, {
        allowedMentions: {
          repliedUser: false
        }
      }));
      const result = ResponseMessage.createFromMessage(msg, this._commandMessage);
      this._commandMessage["_responseMessage"] = result;
      return result;
    }else{
      let _opt = null as (MessageContent & { fetchReply: true});
      if(typeof options === "string"){
        _opt = {content: options, fetchReply:true}
      }else{
        _opt = {fetchReply: true};
        _opt = Object.assign(_opt, options);
      }
      const originalMessage = await this._interaction.getOriginalMessage();
      const mes  = await this._interaction.editMessage(originalMessage.id, _opt);
      const result = ResponseMessage.createFromInteraction(this._interaction, mes, this._commandMessage);
      this._commandMessage["_responseMessage"] = result;
      return result;
    }
  }

  /**
   * CommandMessage bound to this
   * @remarks CommandMessage may be stale
   */
  get command():CommandMessage{
    return this._commandMessage;
  }

  /**
   * Delete the response message
   */
  async delete(){
    return await this._message.delete();
  }

  /**
   * React to the response message
   * @param emoji reaction emoji
   * @returns message reaction
   */
  react(emoji:string){
    return this._message.addReaction(emoji);
  }

  /**
   * the message content of this response message
   */
  get content(){
    return this._message.content;
  }

  /**
   * the author of this response message
   */
  get author(){
    return this.isMessage ? this._message.author : this._interaction.user;
  }

  /**
   * the member of this response message
   */
  get member(){
    return this.isMessage ? this._message.member : (this._interaction.channel.client.getChannel(this._interaction.channel.id) as TextChannel).guild.members.get(this._interaction.user.id);
  }
  
  /**
   * the channel of this response message
   */
  get channel(){
    return this._message.channel;
  }

  /**
   * the guild of this response message
   */
  get guild(){
    return (this._message.channel as TextChannel).guild;
  }

  /**
   * the reaction of this response message
   */
  get reactions(){
    return this._message.reactions;
  }

  /**
   * the url of this response message
   */
  get url(){
    return createMessageUrl(this._message);
  }

  /**
   * the timestamp of this response message
   */
  get createdTimestamp(){
    return this._message.createdAt;
  }

  /**
   * the date time of this response message
   */
  get createdAt(){
    return new Date(this.createdTimestamp);
  }

  /**
   * the id of this response message
   */
  get id(){
    return this._message.id;
  }

  /**
   * the channel id of this response message
   */
  get channelId(){
    return this._message.channel.id;
  }

  /**
   * the attachment of this response message
   */
  get attachments(){
    return this._message.attachments;
  }

  /**
   * the embeds of this response message
   */
  get embeds(){
    return this._message.embeds;
  }

  /**
   * the components of this response message
   */
  get components(){
    return this._message.components;
  }

  /**
   * fetch message object referred by this
   * @returns new this
   */
  async fetch(){
    return ResponseMessage.createFromMessage(await this._message.channel.client.getMessage(this._message.channel.id, this._message.id), this._commandMessage)
  }
}