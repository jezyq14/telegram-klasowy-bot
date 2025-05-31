import { Telegraf } from "telegraf";
import config from "../../config";

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
        } catch (err) {
            console.error("Failed to launch bot:", err);
        }
    }

    public async handleLuckyNumbers() {
        // TODO: Implement the lucky numbers handler
    }
}
