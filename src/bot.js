import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { GoogleGenerativeAI } from "@google/generative-ai";
import User from './model/User.js';
import { config } from "dotenv";

config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);


bot.command('about',async(ctx)=>{
    await ctx.reply(`I am Interacta-Bot🤖, your interactive chatbot companion. I'm here to make your Telegram experience more interactive and fun! Whether you need quick answers, assistance with tasks, or just want to chat, I've got you covered.`);
})
bot.start(async (ctx) => {
    const from = ctx.update.message.from;

    console.log('from', from);

    try{
        await User.findOneAndUpdate({tgId:from.id},{
            $setOnInsert:{
                firstName:from.first_name,
                lastName:from.last_name,
                username:from.username,
                isBot:from.isBot
            }
        },{
            upsert:true,
            new:true
        })

        await ctx.reply(`Hey ${from.first_name}! 👋 I'm Interacta-Bot🤖, your interactive chatbot companion. I'm here to make your Telegram experience more interactive and fun! Whether you need quick answers, assistance with tasks, or just want to chat, I've got you covered.`);
    
    }

     catch (error) {
        console.error('Error in /start command:', error);
        await ctx.reply('Sorry for the inconvenience, facing some difficulties at this moment.');
    }
});



bot.on(message('text'), async (ctx) => {
    try {
        
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = await genAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL ,
            systemInstruction: "You are an Interactive chatbot and you are here to make the user's experience interactive and fun.Use simple language.Use given time labels just to understand the order of the event,dont mention the time in the posts.Each posts should be creatively highlight the following events. Ensure the tone is conversational and impactful. Focus on engaging the respective plaftorm audience ,encouraging the interaction, and driving the interest in the event",
        });

        console.log('gemini-model:',model.model);
    
        const generationConfig = {
            temperature: 1,
            topP: 0.95,
            topK: 64,
            maxOutputTokens: 8192,
            responseMimeType: "text/plain",
        };

    
        
        const chatSession = model.startChat(
            {
            generationConfig,
            history:[
                
            ]
        }
        )

        const prompt = ctx.message.text;
        const result = await chatSession.sendMessage(prompt.toString());
        const response = result.response 
        const text = response.text();
        console.log('text',text);

        await ctx.reply(text);
        
        console.log(text);
      
    } catch (error) {
        console.error('Error generating response:', error);
        await ctx.reply('There was an error generating the response.');
    }
});

export default bot;
