import { URL_PREFIX, PRICE_REGEXP } from '../config/constants.js';
import { extractPrices } from '../utils/helpers.js';
import LimitedContainer from '../utils/LimitedContainer.js';
import Logger from '../utils/Logger.js';

export default class MessageService {
  constructor(client, adminChatId, historyLimit = 1000) {
    this.client = client;
    this.adminChatId = adminChatId;
    this.messageHistory = new LimitedContainer(historyLimit);
    this.logger = new Logger('MessageService');
  }

  checkExistingAndSaveToHistory(messageText, topic) {
    const fullMessage = topic.topic.id + messageText;
    
    if (this.messageHistory.includes(fullMessage)) {
      return false;
    }
    
    this.messageHistory.add(fullMessage);
    return true;
  }

  async forwardMatchingMessages(message, matchingKeywords) {
    const messageText = message.text.toLowerCase();
    
    const validKeywords = matchingKeywords.filter(topic => 
      this.checkExistingAndSaveToHistory(messageText, topic)
    );

    if (validKeywords.length === 0) {
      this.logger.debug('No new messages to forward');
      return;
    }

    const promises = validKeywords.map(topic => 
      this.forwardMessage(message, topic)
    );

    try {
      await Promise.all(promises);
      this.logger.info(`Forwarded message to ${promises.length} topics`);
    } catch (error) {
      this.logger.error(`Error forwarding messages: ${error.message}`);
    }
  }

  async forwardMessage(message, keywordMapping) {
    const messageText = message.text.toLowerCase();
    const prices = extractPrices(messageText, PRICE_REGEXP);
    
    const forwardedMessage = this.buildForwardedMessage(message, prices);
    
    try {
      await this.client.sendMessage(this.adminChatId, {
        commentTo: keywordMapping.topic.id,
        message: forwardedMessage
      });
    } catch (error) {
      this.logger.error(`Error sending message to topic ${keywordMapping.topic.id}: ${error.message}`);
      throw error;
    }
  }

  buildForwardedMessage(message, prices) {
    const messageLink = `[(Сообщение)](${URL_PREFIX}${message.chat.username}/${message.id})`;
    const authorLink = `[(Автор)](${URL_PREFIX}@id${message.senderId})`;
    const priceInfo = prices ? `Ценник: ${prices}` : 'Ценник: не указан';
    
    return `${messageLink} ${authorLink}\n${priceInfo}\n\n${message.text}`;
  }

  async logSenderInfo(message) {
    try {
      const sender = await message.getSender();
      if (!sender) {
        this.logger.debug('No sender information available');
        return;
      }

      this.logger.debug('--------------------------');
      this.logger.debug(`Username: ${sender.username || 'N/A'}`);
      this.logger.debug(`Last Name: ${sender.lastName || 'N/A'}`);
      this.logger.debug(`First Name: ${sender.firstName || 'N/A'}`);
      this.logger.debug(`Class: ${sender.className}`);
      this.logger.debug(`Sender ID: ${message.senderId.toString()}`);
      this.logger.debug(`Message: ${message.text}`);
      this.logger.debug(`Chat Username: ${message.chat.username}`);
      this.logger.debug('--------------------------');
    } catch (error) {
      this.logger.error(`Error logging sender info: ${error.message}`);
    }
  }
}