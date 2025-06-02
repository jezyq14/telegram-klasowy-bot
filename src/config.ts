import "dotenv/config";

export default {
    token: process.env.TELEGRAM_BOT_TOKEN,
    telegram: {
        chatId: process.env.TELEGRAM_CHAT_ID,
        threadId: parseInt(process.env.TELEGRAM_THREAD_ID),
    },
    schoolWebsiteUrl: process.env.SCHOOL_WEBSITE_URL,
    vulcanApiApContent: process.env.VULCAN_API_AP_CONTENT,
    vulcanApiAp2Content: process.env.VULCAN_API_AP2_CONTENT,
};
