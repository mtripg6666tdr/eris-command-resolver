// @ts-check
const eris = require("eris");
const { Helper } = require("../dist"); // require("@mtripg6666tdr/eris-command-resolver") in installed environment

const bot = new eris.Client("YOUR TOKEN HERE");

const embed = new Helper.MessageEmbedBuilder()
  .setTitle("Hello world!")
  .setDescription("This is just a test")
  .setAuthor({
    name: "BIG BOSS"
  })
  .setColor(0xffffff)
  .setFooter({
    text: "some amazing footer"
  })
  .addField("A", "ABC")
  .addFields({
    name: "1", 
    value: "123"
  }, {
    name: "あ", 
    value: "あいう"
  })
  .toEris()
;

bot.on("messageCreate", message => message.channel instanceof eris.TextChannel && message.channel.createMessage({embeds: [embed]}));
