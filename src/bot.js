import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import User from './model/User.js';
import { config } from "dotenv";

config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.start(async (ctx) => {
    const from = ctx.message.from;

    console.log('ctx', ctx.message.chat);
    console.log('from', from);

    try {
        await User.findOneAndUpdate({ tgId: from.id }, {
            $setOnInsert: {
                firstName: from.first_name,
                lastName: from.last_name,
                isBot: from.is_bot 
            }
        }, {
            upsert: true,
            new: true
        });

        await ctx.reply(`Hey ${from.first_name}! 👋 I'm Interacta-Bot🤖, your interactive chatbot companion. I'm here to make your Telegram experience more interactive and fun! Whether you need quick answers, assistance with tasks, or just want to chat, I've got you covered.`);
    
    } catch (error) {
        console.error('Error in /start command:', error);
        await ctx.reply('Facing some difficulties to start the bot');
    }
});

bot.on('text', async (ctx) => {
    
});

export default bot;
