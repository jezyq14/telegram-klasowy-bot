import "dotenv/config";

export default {
    token: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
    schoolWebsiteUrl: process.env.SCHOOL_WEBSITE_URL,
};
