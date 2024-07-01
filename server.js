import { Telegraf } from "telegraf";
import {message } from "telegraf/filters";
import { config } from "dotenv";
import connectDb from "./src/config/db.js";

config();
try{
connectDb(process.env.MONGO_URI);

}
catch{
    console.error(error);
    process.kill(process.pid, 'SIGTERM');

}

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)

bot.start((ctx)=>{
    
    ctx.reply("Welcome to the bot!")
})

bot.on(message('text'), async (ctx) => {
  
    await ctx.reply(`Hello ${ctx.state.role}`)
  })


bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))