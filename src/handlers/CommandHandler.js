import { COMMANDS } from '../config/constants.js';
import Logger from '../utils/Logger.js';

export default class CommandHandler {
  constructor(chatService, keywordService) {
    this.chatService = chatService;
    this.keywordService = keywordService;
    this.logger = new Logger('CommandHandler');
  }

  async handleCommand(message, messageText) {
    try {
      let response = '';

      if (messageText.includes(COMMANDS.addChat)) {
        const content = messageText.replace(COMMANDS.addChat, '').trim();
        response = this.chatService.addChat(content);

      } else if (messageText.includes(COMMANDS.deleteChat)) {
        const content = messageText.replace(COMMANDS.deleteChat, '').trim();
        response = this.chatService.deleteChat(content);

      } else if (messageText.includes(COMMANDS.showChat)) {
        response = this.chatService.getChats();

      } else if (messageText.includes(COMMANDS.parseKeywords)) {
        response = await this.keywordService.parseKeywords();

      } else if (messageText.includes(COMMANDS.getKeywords)) {
        response = this.keywordService.getKeywords();

      } else {
        this.logger.debug(`Unknown command in message: ${messageText}`);
        return;
      }

      await message.reply({ message: response });
      this.logger.info(`Command processed successfully: ${messageText.split(' ')[0]}`);

    } catch (error) {
      this.logger.error(`Error handling command: ${error.message}`);
      await message.reply({ message: `Ошибка: ${error.message}` });
    }
  }

  isCommand(messageText) {
    return Object.values(COMMANDS).some(command => messageText.includes(command));
  }
}