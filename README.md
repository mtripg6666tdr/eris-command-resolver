> Note: this package is mainly for my own use, but it might be useful if you use as needed  

# eris-command-resolver
By using this package, both `ComamndInteraction` and `Message` will be resolved as unified `CommandMessage` and you can code with `CommandMessage` with no considering the way the command passed.  
 ![this is what the package does](https://user-images.githubusercontent.com/56076195/157648893-e409de75-4c97-423f-8095-ddeeaca2bf21.png)
Therefore you can support Message-based-command and Interaction-based-command at once, without any verbose codes.  

## Examples
- [Quick example to handle commands](example/index.js)
- [Create embed by using EmbedBuilder](example/embed.js)
- [Create message components by using MessageComponentBuilder](example/components.js)

## API
### [`CommandMesasge`](https://web.usamyon.moe/eris-command-resolver/classes/CommandMessage.html)
  Represence the message or interaction that includes command.
- `createFromMessage(message: Message<TextChannel>, prefixLength?: number)`  
  Resolves message to CommandMessage.  
  - Return: [`CommandMesasge`](https://web.usamyon.moe/eris-command-resolver/classes/CommandMessage.html)  

- `createFromInteraction(interaction: CommandInteraction<TextableChannel>)`  
  Resolves message to CommandMessage.  
  - Return: [`CommandMesasge`](https://web.usamyon.moe/eris-command-resolver/classes/CommandMessage.html)  
  
- `reply(options: MessageOptions)`  
  Reply to the user.  
  - Return: [`ResponseMessage`](https://web.usamyon.moe/eris-command-resolver/classes/ResponseMessage.html)
  
### [`ResponseMessage`](https://web.usamyon.moe/eris-command-resolver/classes/ResponseMessage.html)
  Represence the message that is the reply to the CommandMessage.
- `edit(options: MessageContent)`  
  Edit the response message.
  - Return: Promise<[`ResponseMessage`](https://web.usamyon.moe/eris-command-resolver/classes/ResponseMessage.html)>  
  
*... and so on...*

You can see the full api document [here](https://mtripg6666tdr.github.io/eris-command-resolver/).  

## License
[LICENSE](LICENSE)
