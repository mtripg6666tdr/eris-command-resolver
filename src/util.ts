import { Message, TextChannel } from "eris";

export function createMessageUrl(message:Message){
  return `https://discord.com/channels/${(message.channel as TextChannel).guild.id}/${message.channel.id}/${message.id}`;
}
