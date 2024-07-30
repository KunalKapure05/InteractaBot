import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import User from './model/User.js';
import { config } from "dotenv";
import Event from "./model/Event.js";


config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

  



bot.start(async (ctx) => {
    const from = ctx.update.message.from;

    console.log('from', from);

    try {
        await User.findOneAndUpdate({ tgId: from.id }, {
            $setOnInsert: {
                firstName: from.first_name,
                lastName: from.last_name,
                username: from.username,
                isBot: from.isBot
            }
        }, {
            upsert: true,
            new: true
        });

        await ctx.reply(`Hey ${from.first_name}! 👋 I'm Interacta-Bot🤖, your interactive chatbot companion. I'm here to make your Telegram experience more interactive and fun! Whether you need quick answers, assistance with tasks, or just want to chat, I've got you covered.`);
    } catch (error) {
        console.error('Error in /start command:', error);
        await ctx.reply('Sorry for the inconvenience, facing some difficulties at this moment.');
    }
});



bot.on(message('text'), async (ctx) => {
    const from = ctx.update.message.from;
    const message = ctx.update.message.text;
    console.log('from:', from);
    console.log('text:', message);

    try {
        await Event.create({
            tgId: from.id,
            text: message,
        });

        const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0); // set to midnight

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999); 

        const events = await Event.find({
            tgId:from.id,
            createdAt:{
                $gte: startOfDay,
                $lte: endOfDay // today
            }
        })

         
        const safetySettings = [
            {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },

            {
            category:HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            }

        ];


        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = await genAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL,
        safetySettings ,
        systemInstruction: `You are an Interactive chatbot and you are here to make the user's experience interactive and fun. Use simple language. Use given time labels just to understand the order of the event, don't mention the time in the posts. Each post should creatively highlight the following events. Ensure the tone is conversational and impactful. Focus on engaging the respective platform audience, encouraging interaction, and driving interest in the events: ${events.map(event => event.text).join(', ')}`
    });

    const chatSession = model.startChat({
        generationConfig: {
            maxOutputTokens: 8192,
        },
    });

    const prompt = `Generate content based on: ${message}. Track and remember the texts provided by the user including: ${events.map(event => event.text).join(', ')}. Do not disclose this information to the user unless specifically asked about previous prompts and also give warning if you detect any prompt to be encouraging harrasement or any explicit malicious content.`;

    const result = await chatSession.sendMessage(prompt);
    const response = result.response;
    const text = response.text();

    if (chatSession.usage) {
        await User.findOneAndUpdate(
            { tgId: from.id },
            {
                $inc: {
                    promptTokens: chatSession.usage.prompt_tokens || 0,
                    completionTokens: chatSession.usage.completion_tokens || 0
                }
            }
        );
    }

    
    await ctx.reply(text);
        
    } catch (error) {
        console.error('Error generating response:', error);
        await ctx.reply('Server Error.');
    }
});

export default bot;
