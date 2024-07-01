
import { config } from "dotenv";
import connectDb from "./src/config/db.js";
import bot from './src/bot.js';

config();

try {
    connectDb(process.env.MONGO_URI);
} catch (error) {
    console.error('Failed to connect to the database:', error);
    process.kill(process.pid, 'SIGTERM');
}

bot.launch().then(() => {
    console.log('Telegram bot started successfully');
})
.catch(err => {
    console.error('Failed to start Telegram bot:', err);
});

process.once('SIGINT', () => {
    bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
    bot.stop('SIGTERM');
});
