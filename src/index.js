import TelegramBot from './TelegramBot.js';

// Create and start the bot
const bot = new TelegramBot();
bot.start().catch(console.error);