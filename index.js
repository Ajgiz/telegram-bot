const express = require("express");
const dotenv = require("dotenv").config();
const app = express();
const mongo = require("mongoose");
const PORT = 5000;
const axios = require("axios");
const User = require("./model/user");
const dataUser = {
  firstName: "",
  lastName: "",
};
let state = "";

let isSaved = false;
app.listen(PORT, () => {
  mongo.connect(
    "mongodb+srv://Demion:qwerty123@cluster0.3d418.mongodb.net/telega-bot?retryWrites=true&w=majority",
    () => {
      console.log("MongoDB connected");
    }
  );
  console.log(`Server started in ${PORT}`);
});

const initialUser = async (data, ctx) => {
  dataUser.firstName = data[0];
  dataUser.lastName = data[1];

  const isExist = await User.findOne({ firstName: dataUser.firstName });
  console.log(isExist);

  if (isExist) {
    ctx.reply("User with this email address already exists,repeat one more");
    return;
  }

  const user = await User.create({
    firstName: data[0],
    lastName: data[1],
    subjects: {},
  });
  await user.save();
  isSaved = true;
};

const writeGradeAllSubject = async (ctx) => {
  const obj = {};
  const allSub = ctx.message.text.split(";");
  allSub.forEach((i) => {
    const subjectName = i.split(":")[0];
    obj[subjectName] = i.split(":")[1].split(",");
  });
  const res = await User.findOne({ firstName: dataUser.firstName });
  res.subjects = obj;
  res.save();
};

const login = async (ctx, name) => {
  const user = await User.findOne({ firstName: name });
  if (user) {
    await ctx.reply("Good! We know you.");
    dataUser.firstName = user.firstName;
    dataUser.lastName = user.lastName;
  } else {
    await ctx.reply("Bad.User not found.");
    await ctx.reply("Repeat one more time.");
  }
};

const addSubject = async (name) => {
  const user = await User.findOne({ firstName: dataUser.firstName });
  const newObj = user.subjects;
  newObj[name] = [];
  const updateUser = await User.findOneAndUpdate(
    { firstName: dataUser.firstName },
    { $set: { subjects: newObj } }
  );
};

const addGrade = async (text) => {
  const nameSubject = text.split(":")[0];
  const grade = text.split(":")[1].split(",");
  const user = await User.findOne({ firstName: dataUser.firstName });
  const newObj = user.subjects;

  if (newObj.hasOwnProperty(nameSubject)) {
    newObj[nameSubject] = [...newObj[nameSubject], ...grade];
  } else {
    newObj[nameSubject] = [...grade];
  }

  const updateUser = await User.findOneAndUpdate(
    { firstName: dataUser.firstName },
    { $set: { subjects: newObj } }
  );
};
const findScore = (arr, isFinalGrade = false) => {
  const countGrade = arr.length;
  const averageScore =
    arr.reduce((prev, item) => +prev + +item, 0) / countGrade;
  if (isNaN(averageScore)) return 0;
  return isFinalGrade ? Math.round(averageScore) : averageScore.toFixed(2);
};

const showAllMiddleScore = async (ctx) => {
  const user = await User.findOne({ firstName: dataUser.firstName });
  await ctx.reply(`
 Your average scores in subjects.
      ${Object.keys(user.subjects).map((elem) => {
        return `${elem} : ${findScore(user.subjects[elem])}`;
      })}
  `);
};

const showTotalScore = async (ctx) => {
  const user = await User.findOne({ firstName: dataUser.firstName });

  const sum =
    Object.values(user.subjects).reduce(
      (prev, item) => prev + findScore(item, true),
      0
    ) / Object.keys(user.subjects).length;
  await ctx.reply(`Average score : ${sum.toFixed(1)}`);
};

const replyMessage = async (text, ctx) => {
  await ctx.reply(text);
};

const { Telegraf, Markup } = require("telegraf");

const text = require("./const");

const bot = new Telegraf(process.env.BOT_TOKEN);

const start = async () => {
  bot.start(async (ctx) => {
    await ctx.replyWithHTML(
      text.beginText,
      Markup.inlineKeyboard([
        [
          Markup.button.callback("Sign in", "login"),
          Markup.button.callback("Sign up", "register"),
        ],
      ])
    );
    
    bot.command("/menu", (ctx) => {
      showMenu(ctx);
    });

    bot.on("text", async (ctx) => {
      const text = ctx.message.text;
      switch (state) {
        case "register":
          await initialUser(text.split(" "), ctx);
          replyMessage(
            "Use command  /menu than to bring the menu or /help",
            ctx
          );
          state = "show";
          return;

        case "login":
          await login(ctx, text);
          replyMessage(
            "Use command /menu than to bring the menu or /help",
            ctx
          );
          state = "show";
          return;
        case "all_subject":
          writeGradeAllSubject(ctx);
          return;
        case "add_subject":
          addSubject(text);
          replyMessage("Good! Subject successfully added.", ctx);

          return;
        case "add_grade":
          addGrade(text);
          replyMessage("Good! Subject successfully added.", ctx);
          return;
        case "show":
          return ctx.reply("Command is wrong");
      }
    });
  });
};

start();

bot.action("all_subject", async (ctx) => {
  await ctx.replyWithHTML(`
  Write as this template :
  subject: grade across comma
  <b>It is important</b>`);
  bot.hears("hi", (ctx) => ctx.reply("test"));
});

bot.action("menu", (ctx) => {
  ctx.replyWithHTML(
    `<b>${dataUser.firstName} select one item</b>`,
    Markup.inlineKeyboard([
      [
        Markup.button.callback(
          "Record/rewrite grades in all subjects",
          "all_subject"
        ),
      ],
      [Markup.button.callback("Add subject", "add_subject")],
      [Markup.button.callback("Add grade in subject", "add_grade")],
      [
        Markup.button.callback(
          "Show average scores for each subject",
          "all_middle-score"
        ),
      ],
      [Markup.button.callback(`Show total score`, "total_middle_score")],
      [Markup.button.callback("Change user", "back")],
    ])
  );
});

const showMenu = (ctx) => {
  ctx.replyWithHTML(
    `<b>${dataUser.firstName} select one item</b>`,
    Markup.inlineKeyboard([
      [
        Markup.button.callback(
          "Record/rewrite grades in all subjects",
          "all_subject"
        ),
      ],
      [Markup.button.callback("Add subject", "add_subject")],
      [Markup.button.callback("Add grade in subject", "add_grade")],
      [
        Markup.button.callback(
          "Show average scores for each subject",
          "all_middle-score"
        ),
      ],
      [Markup.button.callback(`Show total score`, "total_middle_score")],
      [Markup.button.callback("Change user", "back")],
    ])
  );
};

bot.command("/begin", (ctx) => {
  console.log(445);

  isSaved = false;

  state = "";

  const dataUser = {
    firstName: "",
    lastName: "",
  };
});

bot.action("login", async (ctx) => {
  await ctx.replyWithHTML("Input your first name");
  state = "login";
});

bot.action("register", async (ctx) => {
  await ctx.reply("Input your first name and last name across space");
  state = "register";
});

bot.action("back", async (ctx) => {
  await ctx.replyWithHTML(
    text.beginText,
    Markup.inlineKeyboard([
      [
        Markup.button.callback("Sign in", "login"),
        Markup.button.callback("Sign up", "register"),
      ],
    ])
  );
});
bot.action("add_subject", async (ctx) => {
  await ctx.reply("Write name of subject when want add.");
  state = "add_subject";
});

bot.action("add_grade", async (ctx) => {
  await ctx.reply("Write like this template: name subject : grade or grades");
  state = "add_grade";
});

bot.action("all_middle-score", async (ctx) => {
  state = "show";
  showAllMiddleScore(ctx);
});

bot.action("total_middle_score", async (ctx) => {
  state = "show";
  await showTotalScore(ctx);
});

bot.help((ctx) => ctx.reply(text.allCommands));

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
