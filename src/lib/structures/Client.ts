import { VulcanHebeCe, Keypair, VulcanJwtRegister } from "hebece";
import { Telegraf } from "telegraf";
import cron from "node-cron";
import { glob } from "glob";

import {
    sendLuckyNumbers,
    CommandData,
    Database,
    handleSubstitutions,
} from "..";
import config from "../../config";

export class Client extends Telegraf {
    public commands: Map<string, CommandData> = new Map();
    public database: Database = new Database();
    public hebece2!: VulcanHebeCe;
    public hebece!: VulcanHebeCe;

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
            /* Core */
            await this.handleCommands();
            await this.handleLuckyNumbers();

            /* HebeCE */
            await this.loginIntoHebece();

            /* Bot commands */
            await this.setBotCommands();

            /* Database */
            await this.database.connectToDatabase();

            /* Substitutions */
            await this.handleSubstitutions();

            this.launch();
            console.log("Bot is running...");
        } catch (err) {
            console.error("Failed to launch bot:", err);
        }
    }

    public async handleLuckyNumbers() {
        if (!config.telegram.chatId) {
            throw new Error(
                "Telegram chat ID is not configured. You need to set the TELEGRAM_CHAT_ID in your environment variables."
            );
        }

        cron.schedule(
            "1 18 * 1-6,9-12 1-5",
            async () => {
                await sendLuckyNumbers(this);
            },
            {
                timezone: "Europe/Warsaw",
            }
        );

        console.log("Scheduled task for lucky numbers is set up.");
    }

    public async handleCommands() {
        const files = await glob(`${__dirname}/../../commands/*.{js,ts}`);

        files.forEach(async (file) => {
            await import(file);
        });
    }

    public async setBotCommands() {
        const commands = Array.from(this.commands.values())
            .filter((cmd) => !!cmd.name && !!cmd.description)
            .map((command) => ({
                command: command.name,
                description: command.usage
                    ? `${command.usage} - ${command.description}`
                    : command.description,
            }));

        await this.telegram.setMyCommands(commands);
    }

    public async loginIntoHebece() {
        try {
            const keypair = await new Keypair().init();
            const keypair2 = await new Keypair().init();

            await new VulcanJwtRegister(
                keypair,
                config.vulcanApiApContent
            ).init();
            await new VulcanJwtRegister(
                keypair2,
                config.vulcanApiAp2Content
            ).init();

            this.hebece = new VulcanHebeCe(keypair);
            this.hebece2 = new VulcanHebeCe(keypair2);

            await this.hebece.connect();
            await this.hebece.selectStudent();

            await this.hebece2.connect();
            await this.hebece2.selectStudent();

            console.log("Logged into HebeCE successfully.");
        } catch (error) {
            console.error("Failed to log into HebeCE:", error);
            throw new Error(
                "HebeCE login failed. Please check your configuration."
            );
        }
    }

    public async handleSubstitutions() {
        /* Check every 15 minutes */
        setInterval(async () => {
            handleSubstitutions(this);
        }, 1000 * 60 * 15);
        handleSubstitutions(this);
    }
}
