import fs from 'fs';
import { TARGET_CHATS_FILE } from '../config/constants.js';
import { toBeautifulJSONString, isValidUsername } from '../utils/helpers.js';
import Logger from '../utils/Logger.js';

export default class ChatService {
  constructor() {
    this.logger = new Logger('ChatService');
    this.targetChats = this.loadTargetChats();
  }

  loadTargetChats() {
    try {
      if (!fs.existsSync(TARGET_CHATS_FILE)) {
        this.logger.warn(`Target chats file ${TARGET_CHATS_FILE} not found, creating empty array`);
        this.saveTargetChats([]);
        return [];
      }
      
      const data = fs.readFileSync(TARGET_CHATS_FILE, 'utf8');
      const chats = JSON.parse(data);
      
      if (!Array.isArray(chats)) {
        throw new Error('Target chats data must be an array');
      }
      
      this.logger.info(`Loaded ${chats.length} target chats`);
      return chats;
    } catch (error) {
      this.logger.error(`Error loading target chats: ${error.message}`);
      return [];
    }
  }

  saveTargetChats(chats = this.targetChats) {
    try {
      fs.writeFileSync(TARGET_CHATS_FILE, toBeautifulJSONString(chats));
      this.logger.debug('Target chats saved successfully');
    } catch (error) {
      this.logger.error(`Error saving target chats: ${error.message}`);
      throw error;
    }
  }

  addChat(chatUsername) {
    if (!isValidUsername(chatUsername)) {
      throw new Error('Invalid chat username');
    }

    if (this.targetChats.includes(chatUsername)) {
      throw new Error(`Chat ${chatUsername} already exists`);
    }

    this.targetChats.push(chatUsername);
    this.saveTargetChats();
    this.logger.info(`Added chat: ${chatUsername}`);
    return `Добавлен чат ${chatUsername}`;
  }

  deleteChat(chatUsername) {
    if (!isValidUsername(chatUsername)) {
      throw new Error('Invalid chat username');
    }

    const initialLength = this.targetChats.length;
    this.targetChats = this.targetChats.filter(chat => chat !== chatUsername);
    
    if (this.targetChats.length === initialLength) {
      throw new Error(`Chat ${chatUsername} not found`);
    }

    this.saveTargetChats();
    this.logger.info(`Deleted chat: ${chatUsername}`);
    return `Удален чат ${chatUsername}`;
  }

  getChats() {
    return toBeautifulJSONString(this.targetChats);
  }

  isChatTargeted(chatUsername) {
    return this.targetChats.includes(chatUsername);
  }
}