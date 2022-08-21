import type { CommandInteraction, Message, Client, InteractionDataOptionsWithValue, AdvancedMessageContent, TextChannel } from "eris";
import type { MessageOptions } from "./messageOptions";
import { ResponseMessage } from "./ResponseMessage";
import { createMessageUrl } from "./util";

/**
 * Represents CommandInteraction or Message which contains command.
 */
export class CommandMessage {
  protected isMessage = false;
  protected _message = null as Message;
  protected _interaction = null as CommandInteraction;
  protected _interactionReplied = false;
  protected _client = null as Client;
  protected _command = null as string;
  protected _options = null as string[];
  protected _rawOptions = null as string;
  protected _responseMessage = null as ResponseMessage;
  protected constructor(){}

  /**
   * Initialize this from Message
   * @param message Message an user sent that contains command
   * @returns new CommandMessage instance
   */
  static createFromMessage(message:Message, prefixLength:number = 1){
    const me = new CommandMessage();
    me.isMessage = true;
    me._message = message;
    const { command, options, rawOptions } = this.resolveCommandMessage(message.content, prefixLength);
    me._command = command;
    me._options = options;
    me._rawOptions = rawOptions;
    return me;
  }

  protected static createFromMessageWithParsed(message:Message, command:string, options:string[], rawOptions:string){
    const me = new CommandMessage();
    me.isMessage = true;
    me._message = message;
    me._command = command;
    me._options = options;
    me._rawOptions = rawOptions;
    return me;
  }

  /**
   * Initialize this from interaction
   * @param interaction Interaction that contains command
   * @returns new CommandMessage instance
   */
  static createFromInteraction(interaction:CommandInteraction){
    const me = new CommandMessage();
    me.isMessage = false;
    me._interaction = interaction;
    if(!interaction.acknowledged) interaction.defer();
    me._client = interaction.channel.client;
    me._command = interaction.data.name;
    me._options = interaction.data.options.map(arg => (arg as InteractionDataOptionsWithValue).value.toString());
    me._rawOptions = me._options.join(" ");
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
        _opt = copy;
      }
      const msg = await this._client.createMessage(this._message.channel.id, Object.assign(_opt, {
        messageReference: {
          messageID: this._message.id,
          failIfNotExists: false,
        },
        allowedMentions: {
          repliedUser: false
        }
      }), options.files);
      return this._responseMessage = ResponseMessage.createFromMessage(msg, this);
    }else{
      if(this._interactionReplied){
        throw new Error("Target message was already replied");
      }
      let _opt = null as (MessageOptions & { fetchReply: true});
      if(typeof options === "string"){
        _opt = {content: options, fetchReply:true}
      }else{
        const copy = Object.assign({}, options, {
          fetchReply: true as const,
        });
        if(copy.files) delete copy.files;
        _opt = copy;
      }
      const mes = await this._interaction.editOriginalMessage(_opt, options.files);
      this._interactionReplied = true;
      return this._responseMessage = ResponseMessage.createFromInteraction(this._interaction, mes, this);
    }
  }

  /**
   * Response message bound to this command message
   * @remarks Response message may be stale (if you edited it).
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
      }), this._command, this._options, this._rawOptions);
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
      return ("/" + this._interaction.data.name + " " + this._interaction.data.options.map(option => (option as InteractionDataOptionsWithValue).value).join(" ")).trim();
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
    return this.isMessage ? this._message.member : (this._client.getChannel(this._interaction.channel.id) as TextChannel).guild.members.get(this._interaction.user.id);
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
    return this.isMessage ? (this._message.channel as TextChannel).guild : (this._client.getChannel(this._interaction.channel.id) as TextChannel).guild;
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
    let [command, ...options] = commandString.split(" ").filter(content => content.length > 0);
    let rawOptions = options.join(" ");
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