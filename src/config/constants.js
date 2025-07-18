export const COMMANDS = Object.freeze({
  addChat: "!чатдобавить",
  deleteChat: "!чатудалить",
  showChat: "!чатпросмотреть",
  parseKeywords: "!ключевыеслова",
  getKeywords: "!получитьслова"
});

export const TOPIC_BANLIST = ['Info', 'General', 'News'];

export const URL_PREFIX = "https://t.me/";

export const PRICE_REGEXP = /(\d+) ?(лар|л |gel|ლ|₾|\$|долл|usd|руб|rub|₽)/g;

export const MESSAGE_HISTORY_LIMIT = 1000;

export const CLIENT_CONFIG = {
  connectionRetries: 5,
};

export const TARGET_CHATS_FILE = './targetChats.json';