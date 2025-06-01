import { Command, getLuckyNumbersMessage } from "../lib";

new Command(
    { name: "luckynumbers", description: "Wysyła szczęśliwe numerki" },
    async (ctx) => {
        const message = await getLuckyNumbersMessage();

        await ctx.reply(message);
    }
);
