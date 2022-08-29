// @ts-check
const eris = require("eris");
const { Helper } = require("../dist"); // require("@mtripg6666tdr/eris-command-resolver") in installed environment
const bot = new eris.Client("YOUR TOKEN HERE");

bot.on("messageCreate", message => message.channel instanceof eris.TextChannel && message.channel.createMessage({components: [
  new Helper.MessageActionRowBuilder()
    .addComponents(
      new Helper.MessageSelectMenuBuilder()
        .setCustomId("id")
        .setOptions({
          value: "1",
          label: "1"
        }),
    )
    .toEris(),
  new Helper.MessageActionRowBuilder()
    .addComponents(
      new Helper.MessageButtonBuilder()
        .setCustomId("aaaaaa")
        .setDisabled(true)
        .setLabel("HELLO")
        .setStyle("PRIMARY"),
      new Helper.MessageButtonBuilder()
        .setUrl("https://example.com")
        .setStyle("LINK")
        .setLabel("Open example site"),
    )
    .toEris()
]}));
