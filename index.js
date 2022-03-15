const telegramApi = require("node-telegram-bot-api");

const token = "5294694766:AAHJOLvvm1EG-z8DZOZ79ZI8oE6fmuhCgz0";

const bot = new telegramApi(token, { polling: true });
const chats = {};
const gameOptions = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [
        { text: "1", callback_data: 1 },
        { text: "2", callback_data: 2 },
        { text: "3", callback_data: 3 },
      ],
      [
        { text: "4", callback_data: 4 },
        { text: "5", callback_data: 5 },
        { text: "6", callback_data: 6 },
      ],
      [
        { text: "7", callback_data: 7 },
        { text: "8", callback_data: 8 },
        { text: "9", callback_data: 9 },
      ],
      [{ text: "0", callback_data: 0 }],
    ],
  }),
};

const againOptions = {
  reply_markup: JSON.stringify({
    inline_keyboard: [[{ text: "again play", callback_data: "/again" }]],
  }),
};
bot.setMyCommands([
  { command: "/start", description: "Начало общения" },
  { command: "/info", description: "Информация о вас" },
  { command: "/game", description: "Игра- отгадай число" },
]);

const startGame = async (chatId) => {
  await bot.sendMessage(chatId, "Отгадай число (0-9)", gameOptions);
  const random = Math.floor(Math.random() * 10);
  chats[chatId] = random;
};

const start = () => {
  bot.on("message", async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;
    switch (text) {
      case "/start":
        await bot.sendSticker(
          chatId,
          "https://tlgrm.ru/_/stickers/b50/063/b5006369-8faa-44d7-9f02-1ca97d82cd49/1.jpg"
        );
        return bot.sendMessage(
          chatId,
          "Добро пожаловать " +
            msg.from.last_name +
            " " +
            msg.from.first_name +
            "."
        );
      case "/info":
        return bot.sendMessage(chatId, "...");
      case "/game":
        return startGame(chatId);
      default:
        return bot.sendMessage(chatId, "Я не понимаю");
    }
  });

  bot.on("callback_query", async (msg) => {
    const data = msg.data;
    const id = msg.message.chat.id;

    if (data === "/again") {
      return startGame(id);
    }
    if (data == chats[id]) {
      return await bot.sendMessage(id, "Вы угадали !", againOptions);
    } else {
      return await bot.sendMessage(
        id,
        `Неправильно, бот загадал ${chats[id]}`,
        againOptions
      );
    }
  });
};

start();
