const { TextChannel, Constants } = require("eris");
const eris = require("eris");
const { CommandMessage } = require("../dist"); // require("@mtripg6666tdr/eris-command-resolver") in installed environment

const bot = new eris.Client("NzAxNDI3ODUyNzg0MDQyMDU0.XpxVmA.uyerzAOR40XXUSIQtsemR4tMVUQ", {
  // additional args here
});

// only one command definition
/** @type {(message:import("../dist/CommandMessage").CommandMessage)=>Promise} */
const pingPongCommand = message => message.reply("pong!");

// and only one command handler
/** @type {(message:import("../dist/CommandMessage").CommandMessage)=>Promise} */
const commandHandler = commandMessage => {
  switch(commandMessage.command){
    case "ping":
      return pingPongCommand(commandMessage);
    default:
      return commandMessage.reply("no command found");
  }
}

bot.on("ready", async () => {
  const commands = await bot.getCommands();
  if(!commands.some(command => command.name === "ping")){
    bot.createCommand({
      name: "ping",
      description: "do ping pong",
      type: Constants.ApplicationCommandTypes.CHAT_INPUT,
    });
  }
});

bot.on("messageCreate", message => {
  if(message.member.bot) return; // ignore messages sent by bots
  if(!(message.channel instanceof eris.TextChannel)) return; // ignore other than guilds
  if(!message.content.startsWith("!")) return; // do nothing to messages without prefix
  const commandMessage = CommandMessage.createFromMessage(message, 1);
  commandHandler(commandMessage);
});

bot.on("interactionCreate", async interaction => {
  if(interaction instanceof eris.CommandInteraction){
    if(!(interaction.channel instanceof TextChannel)) return;
    const commandMessage = await CommandMessage.createFromInteraction(interaction);
    commandHandler(commandMessage);
  }
});

bot.on("error", console.error);

bot.connect();
