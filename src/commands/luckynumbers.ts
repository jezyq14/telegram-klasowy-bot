import { Command, getLuckyNumbersMessage } from "../lib";

new Command("luckynumbers", async (ctx) => {
    const message = await getLuckyNumbersMessage();

    await ctx.reply(message);
});
