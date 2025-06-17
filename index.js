
import telegram from 'telegram'
import input from "input";
import EventsTelegram from "telegram/events/index.js";
import fs from 'fs'
import LimitedContainer from './LimitedContainer.js';

const Api = telegram.Api;
const TelegramClient = telegram.TelegramClient;

const NewMessage = EventsTelegram.NewMessage;

const apiId = process.env.API_ID;
const apiHash = process.env.API_HASH;

let keywordMapping = [];

const messageHistory = new LimitedContainer(1000);

const targetChatsFileName = './targetChats.json';
let targetChats = JSON.parse(fs.readFileSync(targetChatsFileName).toString());

const saveChats = () => fs.writeFileSync(targetChatsFileName, toBeautifulJSONString(targetChats));

const adminChatId = process.env.ADMIN_CHAT_ID;

const commands = Object.freeze({
  addChat: "!чатдобавить",
  deleteChat: "!чатудалить",
  showChat: "!чатпросмотреть",
  parseKeywords: "!ключевыеслова",
  getKeywords: "!получитьслова"
});

const urlPrefix = "https://t.me/";

const toBeautifulJSONString = obj => JSON.stringify(obj, null, 4);

const topicBanlist = ['Info', 'General', 'News'];

const priceRegExp = /(\d+) ?(лар|л |gel|ლ|₾|\$|долл|usd|руб|rub|₽)/g;

(async () => {
  const client = new TelegramClient("telegramSessionFile", apiId, apiHash, {
    connectionRetries: 5,
  });

  // utils functions

  const getForumTopicsRequest = () => client.invoke(new Api.channels.GetForumTopics({
    channel: adminChatId
  }))

  const parseKeywords = async () => {
    const topicRequest = await getForumTopicsRequest();
    keywordMapping = topicRequest.topics
      .filter(topic => !topicBanlist.includes(topic.title))
      .map(topic => {
        const topicKeywords = topic.title.toLowerCase().split(' ').map(word => word.trim()).filter(word => word);
        const includeWords = topicKeywords.filter(word => word[0] !== '-');
        const includeRegExps = includeWords.map(word => new RegExp(word));
        const banWords = topicKeywords.filter(word => word[0] === '-').map(word => word.replace('-', ''));
        const banRegExps = banWords.map(word => new RegExp(word));

        return {
          topic,
          includeWords,
          banWords,
          includeRegExps,
          banRegExps
        }
      });
  }
  // \utils

  await client.start({
    phoneNumber: async () => await input.text("Please enter your number: "),
    password: async () => await input.text("Please enter your password: "),
    phoneCode: async () =>
      await input.text("Please enter the code you received: "),
    onError: (err) => console.log(err),
  });

  client.session.save();
  console.log("You should now be connected.");

  client.addEventHandler(async event => {
    const message = event.message;
    const messageText = message.text.toLowerCase();

    if (message.chatId == adminChatId) {
      if (messageText.includes(commands.addChat)) {
        const content = messageText.replace(commands.addChat, '').trim();
        targetChats.push(content);
        saveChats();
        await message.reply({ message: `Добавлен чат ${content}` });

      } else if (messageText.includes(commands.deleteChat)) {
        const content = messageText.replace(commands.deleteChat, '').trim();
        targetChats = targetChats.filter(chat => chat !== content);
        saveChats();
        await message.reply({ message: `Удален чат ${content}` });

      } else if (messageText.includes(commands.showChat)) {
        await message.reply({ message: toBeautifulJSONString(targetChats) });

      } else if (messageText.includes(commands.parseKeywords)) {
        await parseKeywords();
        await message.reply({ message: `Ключевые слова обновлены` });

      } else if (messageText.includes(commands.getKeywords)) {
        await message.reply({ message: toBeautifulJSONString(keywordMapping.map(({ includeWords, banWords }) => ({ includeWords, banWords }))) });
      }

      return;
    }

    if (!message.chat) {
      return;
    }

    if (!targetChats.includes(message.chat.username)) {
      return;
    }

    const validateMessage = (msg, thread) => {
      const containsAllKeywords = thread.includeRegExps.every(re => re.test(msg));
      const containsSomeBanWords = thread.banRegExps.some(re => re.test(msg));

      return containsAllKeywords && !containsSomeBanWords;
    }

    const checkExistingAndSaveToHistory = (msg, topic) => {
      const fullMessage = topic.topic.id + msg;
      if (messageHistory.includes(fullMessage)) {
        return false;
      } else {
        messageHistory.add(fullMessage);
        return true;
      }
    }

    const promises = keywordMapping
      .filter(topic => validateMessage(messageText, topic))
      .filter(topic => checkExistingAndSaveToHistory(messageText, topic))
      .map(topic => client.sendMessage(adminChatId, {
        commentTo: topic.topic.id,
        message:
          `${urlPrefix}${message.chat.username}/${message.id}` +
          '\n' +
          `Автор: ${urlPrefix}@id${message.senderId}` +
          '\n' +
          `Ценник: ${[...messageText.matchAll(priceRegExp)].map(match => match[0]).join('; ')}` +
          '\n\n' +
          message.text
      }));

    await Promise.all(promises);

    const sender = await message.getSender();
    if (!sender) {
      return;
    }

    console.log('--------------------------');
    console.log(sender.username); // редко заполнено
    console.log(sender.lastName);  // редко заполнено
    console.log(sender.firstName); // Почти всегда заполнено

    console.log(sender.className); // user

    console.log(message.senderId.toString()) // id пользователя
    console.log(message.text);

    console.log(message.chat.username) //Здесь логин чата

    console.log('--------------------------');

  }, new NewMessage({ incoming: true }));

  await parseKeywords(false);

})();