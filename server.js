import { Telegraf } from "telegraf";
import {message } from "telegraf/filters";
import User from './src/model/User.js';
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

bot.start(async (ctx)=>{
    const from  = ctx.update.message.from;

    
    console.log('ctx',ctx.update.message.chat);
    
    console.log('from', from);

    try{
        await User.findOneAndUpdate({tgId:from.id},{
            $setOnInsert:{
                firstName:from.first_name,
                lastName:from.last_name,
                isBot:from.isBot
            }
        },{
            upsert:true,
            new:true
        })

        await ctx.reply(`Hey ${from.first_name}! 👋 I'm Interacta-Bot🤖, your interactive chatbot companion. I'm here to make your Telegram experience more interactive and fun! Whether you need quick answers, assistance with tasks, or just want to chat, I've got you covered.`)
    
    }
        catch(error){
            console.error('error in the/start command: ',error);
            await ctx.reply('facing some difficulties to start the bot')

        }
})
bot.on(message('text'), async (ctx) => {


  
    
  })


bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))