import telegram from 'telegram';
import input from 'input';
import EventsTelegram from 'telegram/events/index.js';

import env from './config/environment.js';
import { CLIENT_CONFIG, MESSAGE_HISTORY_LIMIT } from './config/constants.js';

import ChatService from './services/ChatService.js';
import KeywordService from './services/KeywordService.js';
import MessageService from './services/MessageService.js';
import CommandHandler from './handlers/CommandHandler.js';
import MessageHandler from './handlers/MessageHandler.js';

import Logger from './utils/Logger.js';

const { TelegramClient } = telegram;
const { NewMessage } = EventsTelegram;

export default class TelegramBot {
  constructor() {
    this.logger = new Logger('TelegramBot');
    this.client = null;
    this.chatService = null;
    this.keywordService = null;
    this.messageService = null;
    this.commandHandler = null;
    this.messageHandler = null;
  }

  async initialize() {
    try {
      this.logger.info('Initializing Telegram bot...');
      
      // Initialize Telegram client
      this.client = new TelegramClient(
        'telegramSessionFile',
        env.apiId,
        env.apiHash,
        CLIENT_CONFIG
      );

      // Initialize services
      this.initializeServices();

      // Start client and setup event handlers
      await this.startClient();
      this.setupEventHandlers();

      // Parse initial keywords
      await this.keywordService.parseKeywords();

      this.logger.info('Telegram bot initialized successfully');
    } catch (error) {
      this.logger.error(`Failed to initialize bot: ${error.message}`);
      throw error;
    }
  }

  initializeServices() {
    this.chatService = new ChatService();
    this.keywordService = new KeywordService(this.client, env.adminChatId);
    this.messageService = new MessageService(this.client, env.adminChatId, MESSAGE_HISTORY_LIMIT);
    this.commandHandler = new CommandHandler(this.chatService, this.keywordService);
    this.messageHandler = new MessageHandler(
      env.adminChatId,
      this.commandHandler,
      this.chatService,
      this.keywordService,
      this.messageService
    );
  }

  async startClient() {
    await this.client.start({
      phoneNumber: async () => await input.text('Please enter your number: '),
      password: async () => await input.text('Please enter your password: '),
      phoneCode: async () => await input.text('Please enter the code you received: '),
      onError: (err) => this.logger.error(`Client error: ${err.message}`),
    });

    this.client.session.save();
    this.logger.info('Telegram client connected successfully');
  }

  setupEventHandlers() {
    this.client.addEventHandler(
      async (event) => await this.messageHandler.handleMessage(event),
      new NewMessage({ incoming: true })
    );

    this.logger.info('Event handlers registered');
  }

  async start() {
    try {
      await this.initialize();
      this.logger.info('Bot is running and listening for messages...');
    } catch (error) {
      this.logger.error(`Failed to start bot: ${error.message}`);
      process.exit(1);
    }
  }
}