import Logger from '../utils/Logger.js';

export default class MessageHandler {
  constructor(adminChatId, commandHandler, chatService, keywordService, messageService) {
    this.adminChatId = adminChatId;
    this.commandHandler = commandHandler;
    this.chatService = chatService;
    this.keywordService = keywordService;
    this.messageService = messageService;
    this.logger = new Logger('MessageHandler');
  }

  async handleMessage(event) {
    try {
      const message = event.message;
      const messageText = message.text.toLowerCase();

      this.logger.debug(
        `Received message: ${messageText} from chat: ${message.chatId}, username: ${message.chat?.username}`
      );

      // Handle admin commands
      if (message.chatId === this.adminChatId) {
        if (this.commandHandler.isCommand(messageText)) {
          await this.commandHandler.handleCommand(message, messageText);
        }
        return;
      }

      // Validate message and chat
      if (!this.isValidMessage(message)) {
        return;
      }

      // Process keyword matching and forwarding
      await this.processKeywordMatching(message, messageText);

      // Log sender information for debugging
      await this.messageService.logSenderInfo(message);

    } catch (error) {
      this.logger.error(`Error handling message: ${error.message}`);
    }
  }

  isValidMessage(message) {
    if (!message.chat) {
      this.logger.debug('Message has no chat information');
      return false;
    }

    if (!this.chatService.isChatTargeted(message.chat.username)) {
      this.logger.debug(`Chat ${message.chat.username} is not in target list`);
      return false;
    }

    return true;
  }

  async processKeywordMatching(message, messageText) {
    const matchingKeywords = this.keywordService.getMatchingKeywords(messageText);
    
    if (matchingKeywords.length === 0) {
      this.logger.debug('No keywords matched for this message');
      return;
    }

    this.logger.debug(`Found ${matchingKeywords.length} matching keywords`);
    await this.messageService.forwardMatchingMessages(message, matchingKeywords);
  }
}