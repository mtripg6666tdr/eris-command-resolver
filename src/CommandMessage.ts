import { CommandInteraction, Message, Client, InteractionDataOptionsWithValue, AdvancedMessageContent, ComponentInteraction, Constants, TextableChannel, GuildTextableWithThread, GuildTextableChannel } from "eris";
import type { MessageOptions } from "./messageOptions";

import { ResponseMessage } from "./ResponseMessage";
import { createMessageUrl } from "./util";

/**
 * Represents CommandInteraction or Message which contains command.
 */
export class CommandMessage {
  protected isMessage = false;
  protected _message:Message<GuildTextableWithThread> = null;
  protected _interaction:CommandInteraction<GuildTextableWithThread>|ComponentInteraction<GuildTextableWithThread> = null;
  protected _interactionReplied = false;
  protected _client:Client = null;
  protected _command:string = null;
  protected _options:string[] = null;
  protected _rawOptions:string = null;
  protected _responseMessage:ResponseMessage = null;
  protected constructor(){}

  /**
   * Initialize this from Message
   * @param message Message an user sent that contains command
   * @returns new CommandMessage instance
   */
  static createFromMessage(message:Message<GuildTextableWithThread>, prefixLength:number = 1){
    const me = new CommandMessage();
    me.isMessage = true;
    me._message = message;
    me._client = message.channel.client;
    const { command, options, rawOptions } = this.resolveCommandMessage(message.content, prefixLength);
    me._command = command;
    me._options = options;
    me._rawOptions = rawOptions;
    return me;
  }

  protected static createFromMessageWithParsed(message:Message<GuildTextableWithThread>, command:string, options:string[], rawOptions:string){
    const me = new CommandMessage();
    me.isMessage = true;
    me._message = message;
    me._client = message.channel.client;
    me._command = command;
    me._options = options;
    me._rawOptions = rawOptions;
    return me;
  }

  static createFromInteraction(interaction:CommandInteraction<GuildTextableWithThread>):CommandMessage;
  static createFromInteraction(interaction:ComponentInteraction<GuildTextableWithThread>, command:string, options:string[], rawOptions:string):CommandMessage;
  /**
   * Initialize this from interaction
   * @param interaction Interaction that contains command
   * @returns If interaction has already been defered, this will return new CommandMessage. otherwise return Promise<CommandMessage>
   */
  static createFromInteraction(interaction:CommandInteraction<GuildTextableWithThread>|ComponentInteraction<GuildTextableWithThread>, command?:string, options?:string[], rawOptions?:string){
    const me = new CommandMessage();
    me.isMessage = false;
    me._interaction = interaction;
    me._client = interaction.channel.client;
    if("name" in interaction.data){
      me._command = interaction.data.name;
      me._options = interaction.data.options?.map(arg => (arg as InteractionDataOptionsWithValue).value.toString()) || [];
      me._rawOptions = me._options.join(" ");
    }else{
      me._command = command;
      me._options = options;
      me._rawOptions = rawOptions;
    }
    return me;
  }

  /**
   * Respond to the command  
   * You can call this once  
   * @param options message content
   * @returns response message bound to this command message
   */
  async reply(options:MessageOptions):Promise<ResponseMessage>{
    if(this.isMessage){
      if(this._responseMessage){
        throw new Error("Target message was already replied");
      }
      let _opt = null as AdvancedMessageContent;
      if(typeof options === "string"){
        _opt = {
          content: options
        }
      }else{
        const copy = Object.assign({}, options);
        delete copy.files;
        delete copy.ephemeral;
        _opt = copy;
      }
      const msg = await this._client.createMessage(this._message.channel.id, Object.assign(_opt, {
        messageReference: {
          messageID: this._message.id,
          failIfNotExists: false,
          ...(_opt.messageReference || {}),
        },
        allowedMentions: {
          repliedUser: false,
          ...(_opt.allowedMentions || {}),
        }
      }), options.files);
      return this._responseMessage = ResponseMessage.createFromMessage(msg as Message<GuildTextableChannel>, this);
    }else{
      if(this._interactionReplied){
        throw new Error("Target message was already replied");
      }
      let _opt = null as MessageOptions;
      if(typeof options === "string"){
        _opt = {
          content: options
        };
      }else{
        const copy = Object.assign({}, options);
        delete copy.files;
        delete copy.ephemeral;
        _opt = copy;
      }
      let mes:Message<TextableChannel>  = null;
      if("name" in this._interaction.data){
        if(this._interaction.acknowledged){
          mes = await this._interaction.editOriginalMessage(_opt, options.files);
        }else{
          await this._interaction.createMessage(Object.assign(_opt, {
            flags: options.ephemeral ? Constants.MessageFlags.EPHEMERAL : undefined,
          }), options.files);
          mes = await this._interaction.getOriginalMessage();
        }
      }else{
        mes = await this._interaction.createFollowup(Object.assign(_opt, {
          flags: options.ephemeral ? Constants.MessageFlags.EPHEMERAL : undefined,
        }), options.files);
      }
      this._interactionReplied = true;
      return this._responseMessage = ResponseMessage.createFromInteraction(this._interaction, mes as Message<GuildTextableWithThread>, this);
    }
  }

  /**
   * Response message bound to this command message
   * @remarks Response message may be stale.
   */
  get response():ResponseMessage{
    return this._responseMessage;
  }
  
  /**
   * Set suppress of the embed of command message
   * @param suppress if true suppressed, otherwise false
   */
  async suppressEmbeds(suppress:boolean):Promise<CommandMessage>{
    if(this.isMessage){
      return CommandMessage.createFromMessageWithParsed(await this._message.edit({
        flags: suppress ? this._message.flags | 1 << 2 : this._message.flags ^ 1 << 2
      }) as Message<GuildTextableWithThread>, this._command, this._options, this._rawOptions);
    }else{
      return this;
    }
  }

  /**
   * the content of this command message
   */
  get content(){
    if(this.isMessage){
      return this._message.content;
    }else{
      return `/${this._command} ${this.rawOptions}`.trim();
    }
  }

  /**
   * the author of this command message
   */
  get author(){
    return this.isMessage ? this._message.author : this._interaction.user;
  }

  /**
   * the memeber of this command message
   */
  get member(){
    return this.isMessage ? this._message.member : this._interaction.member;
  }

  /**
   * the channel of this command message
   */
  get channel(){
    return this.isMessage ? this._message.channel : this._interaction.channel;
  }

  /**
   * the guild of this command message
   */
  get guild(){
    return this.isMessage ? this._message.channel.guild : this._interaction.channel.guild;
  }

  /**
   * the reactions of this command message
   * If this was created from CommandInteraction, this will always return null.
   */
  get reactions(){
    return this.isMessage ? this._message.reactions : null;
  }

  /**
   * the url of this command message
   * If this was created from CommandInteraction, this will always return null.
   */
  get url(){
    return this.isMessage ? createMessageUrl(this._message) : null;
  }

  /**
   * the timestamp of this command message
   */
  get createdTimestamp(){
    return this.isMessage ? this._message.createdAt : this._interaction.createdAt;
  }

  /**
   * the date time of this command message
   */
  get createdAt(){
    return new Date(this.createdTimestamp);
  }

  /**
   * the id of this command message
   */
  get id(){
    return this.isMessage ? this._message.id : this._interaction.id;
  }

  /**
   * the channel id of this command message
   */
  get channelId(){
    return this.isMessage ? this._message.channel.id : this._interaction.channel.id;
  }

  /**
   * the attatchment of this command message.
   * If this was created from CommandInteraction, this will always return empty array.
   */
  get attachments(){
    return this.isMessage ? this._message.attachments : [];
  }
  
  /**
   * Command name which was resolved
   */
  get command(){
    return this._command;
  }

  /**
   * Command arguments which was resolved
   */
  get options(){
    return this._options;
  }

  /**
   * Raw command arguments
   */
  get rawOptions(){
    return this._rawOptions;
  }

  protected static parseCommand(cmd:string, prefixLength:number, textNormalizer:((text:string)=>string)) {
    const commandString = textNormalizer(cmd).substring(prefixLength);
    const [command, ...options] = commandString.split(" ").filter(content => content.length > 0);
    const rawOptions = options.join(" ");
    return {command, options, rawOptions};
  }

  /**
   * Reslolve command and arguments from message content
   * @param content message content
   * @param prefixLength prefix length
   * @returns object contains resolved command, parsed arguments and raw argument.
   */
  static resolveCommandMessage(content:string, prefixLength:number, textNormalizer:((text:string)=>string) = v => v){
    let { command, options, rawOptions } = this.parseCommand(content, prefixLength, textNormalizer);
    command = command.toLowerCase();
    return {
      command: command, 
      rawOptions: rawOptions, 
      options: options
    };
  }
}
