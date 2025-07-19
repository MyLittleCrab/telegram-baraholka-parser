import telegram from 'telegram';
import { TOPIC_BANLIST } from '../config/constants.js';
import KeywordMapping from '../models/KeywordMapping.js';
import { toBeautifulJSONString } from '../utils/helpers.js';
import Logger from '../utils/Logger.js';

const { Api } = telegram;

export default class KeywordService {
  constructor(client, adminChatId) {
    this.client = client;
    this.adminChatId = adminChatId;
    this.keywordMappings = [];
    this.logger = new Logger('KeywordService');
  }

  async parseKeywords() {
    try {
      const topicRequest = await this.getForumTopics();
      
      this.keywordMappings = topicRequest.topics
        .filter(topic => !TOPIC_BANLIST.includes(topic.title))
        .map(topic => {
          const topicKeywords = topic.title
            .toLowerCase()
            .split(' ')
            .map(word => word.trim())
            .filter(word => word);
          
          return new KeywordMapping(topic, topicKeywords);
        });

      this.logger.info(`Parsed ${this.keywordMappings.length} keyword mappings`);
      return 'Ключевые слова обновлены';
    } catch (error) {
      this.logger.error(`Error parsing keywords: ${error.message}`);
      throw new Error('Failed to parse keywords');
    }
  }

  async getForumTopics() {
    try {
      return await this.client.invoke(new Api.channels.GetForumTopics({
        channel: this.adminChatId
      }));
    } catch (error) {
      this.logger.error(`Error fetching forum topics: ${error.message}`);
      throw error;
    }
  }

  getKeywords() {
    const keywords = this.keywordMappings.map(mapping => mapping.toJSON());
    return toBeautifulJSONString(keywords);
  }

  getMatchingKeywords(messageText) {
    return this.keywordMappings.filter(mapping => 
      mapping.validateMessage(messageText)
    );
  }
}