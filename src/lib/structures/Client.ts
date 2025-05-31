import { Telegraf } from "telegraf";
import config from "../../config";

import { getLuckyNumbers } from "..";

export class Client extends Telegraf {
    constructor() {
        if (!config.token) {
            throw new Error(
                "Telegram bot token is not provided in the configuration. Please set the TELEGRAM_BOT_TOKEN environment variable."
            );
        }

        super(config.token);

        process.once("SIGINT", () => this.stop("SIGINT"));
        process.once("SIGTERM", () => this.stop("SIGTERM"));

        this.catch((err) => {
            console.error("An error occurred:", err);
        });

        this.init();
    }

    public init() {
        this.use((ctx, next) => {
            // TODO: Implement middleware logic if needed

            return next();
        });

        try {
            this.launch();
            console.log("Bot is running...");

            this.handleLuckyNumbers();
        } catch (err) {
            console.error("Failed to launch bot:", err);
        }
    }

    public async handleLuckyNumbers() {
        if (!config.chatId) {
            throw new Error(
                "Telegram chat ID is not configured. You need to set the TELEGRAM_CHAT_ID in your environment variables."
            );
        }

        const data = await getLuckyNumbers();

        const message = `Szczęśliwe numerki na ${
            data.dayOfTheWeek
        }: ${data.luckyNumbers.join(", ")}`;

        try {
            await this.telegram.sendMessage(config.chatId, message);
            console.log("Lucky numbers sent successfully.");
        } catch (err) {
            console.error("Failed to send lucky numbers:", err);
        }
    }
}
