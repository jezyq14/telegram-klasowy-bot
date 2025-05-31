import { Telegraf } from "telegraf";
import cron from "node-cron";

import { sendLuckyNumbers } from "..";
import config from "../../config";
import { glob } from "glob";

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

    public async init() {
        this.use((ctx, next) => {
            // TODO: Implement middleware logic if needed

            return next();
        });

        try {
            await this.handleCommands();
            await this.handleLuckyNumbers();

            this.launch();
            console.log("Bot is running...");
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

        cron.schedule("1 18 * 1-6,9-12 1-5", async () => {
            await sendLuckyNumbers(this);
        });

        console.log("Scheduled task for lucky numbers is set up.");
    }

    public async handleCommands() {
        const files = await glob(`${__dirname}/../../commands/*.{js,ts}`);

        files.forEach(async (file) => {
            await import(file);
        });
    }
}
