import { GuildTextableWithThread, Message } from "eris";

export function createMessageUrl(message:Message<GuildTextableWithThread>){
  return `https://discord.com/channels/${message.channel.guild.id}/${message.channel.id}/${message.id}`;
}
