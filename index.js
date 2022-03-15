const express = require("express");
const { Telegraf } = require("telegraf");
const dotenv = require("dotenv").config();
const token = process.env.BOT_TOKEN;

if (token === undefined) {
  throw new Error("BOT_TOKEN must be provided!");
}

const bot = new Telegraf(token);
// Set the bot response
bot.on("text", (ctx) => ctx.replyWithHTML("<b>Hello</b>"));

const secretPath = `/telegraf/${bot.secretPathComponent()}`;
console.log(secretPath);
// Set telegram webhook
// npm install -g localtunnel && lt --port 3000
bot.telegram.setWebhook(`https://----.localtunnel.me/${secretPath}`);

const app = express();
app.get("/", (req, res) => res.send("Hello World!"));
// Set the bot API endpoint
app.use(bot.webhookCallback(secretPath));

app.listen(3000, () => {
  console.log("Example app listening on port 3000!");
});
