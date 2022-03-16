const dotenv = require("dotenv").config();
const mongo = require("mongoose");
const User = require("./model/user");
const func = require("./functions");

const dataUser = {
  firstName: "",
  lastName: "",
  state: "start",
};

const { Telegraf, Markup } = require("telegraf");

const text = require("./const");

const bot = new Telegraf(process.env.BOT_TOKEN);

mongo.connect(
  "mongodb+srv://Demion:qwerty123@cluster0.3d418.mongodb.net/telega-bot?retryWrites=true&w=majority",
  () => {
    console.log("MongoDB connected");
  }
);

const showStartMenu = async (ctx, text) => {
  await ctx.replyWithHTML(
    text,
    Markup.inlineKeyboard([
      [
        Markup.button.callback("Sign in", "login"),
        Markup.button.callback("Sign up", "register"),
      ],
    ])
  );
};

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

bot.start(async (ctx) => {
  showStartMenu(ctx, text.beginText);
  if (dataUser.firstName) {
    dataUser.state = "invalid";
    return;
  }
  dataUser.state = "start";
});

bot.help((ctx) => ctx.reply(text.allCommands));

bot.command("/menu", (ctx) => {
  if (!dataUser.firstName) {
    return ctx.reply("Avialible not right.Before sign in or sign up.");
  }
  showMenu(ctx);
});

bot.command("/auth", (ctx) => {
  dataUser.state = "start";

  dataUser.firstName = "";
  dataUser.lastName = "";

  showStartMenu(ctx, "Login");
});

bot.command("/begin", async (ctx) => {
  dataUser.state = "start";
  dataUser.firstName = "";
  dataUser.lastName = "";
  await ctx.reply("Data about user is removed.Sign in or Sign up again.");
});

bot.on("text", async (ctx) => {
  const text = ctx.message.text;
  switch (dataUser.state) {
    case "register":
      await func.initialUser(text.split(" "), ctx, dataUser);
      return;
    case "login":
      await func.login(ctx, text, dataUser);
      return;
    case "all_subject":
      func.writeGradeAllSubject(ctx,text, dataUser);
      return;
    case "add_subject":
      func.addSubject(ctx, text, dataUser);
     
      return;
    case "add_grade":
      func.addGrade(ctx, text, dataUser);

      return;
    case "start":
      return ctx.reply("Command is wrong.Sign in or Sign up.");
    case "invalid":
      return ctx.reply(
        "Command is invalid.Use /help for call all available command."
      );
  }
});

bot.action("all_subject", async (ctx) => {
  dataUser.state = "all_subject";

  await ctx.replyWithHTML(`
  Write as this template : subject: grade across comma
  <b>IMPORTANCE! this method clear all exist subject! </b>`);
});

bot.action("menu", (ctx) => {
  showMenu(ctx);
});

bot.action("login", async (ctx) => {
  await ctx.replyWithHTML("Input your first name");
  dataUser.state = "login";
});

bot.action("register", async (ctx) => {
  await ctx.reply("Input your first name and last name across space");
  dataUser.state = "register";
});

bot.action("back", async (ctx) => {
  showStartMenu(ctx, 'Login');
});

bot.action("add_subject", async (ctx) => {
  await ctx.reply("Write name of subject when want add.");
  dataUser.state = "add_subject";
});

bot.action("add_grade", async (ctx) => {
  await ctx.reply("Write like this template: name subject : grade or grades");
  dataUser.state = "add_grade";
});

bot.action("all_middle-score", async (ctx) => {
  dataUser.state = "invalid";
  await func.showAllMiddleScore(ctx, dataUser);
});

bot.action("total_middle_score", async (ctx) => {
  dataUser.state = "invalid";
  await func.showTotalScore(ctx, dataUser);
});

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
