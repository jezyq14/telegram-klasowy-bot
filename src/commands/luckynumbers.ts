import { Command, getLuckyNumbersMessage } from "../lib";

new Command({ name: "luckynumbers" }, async (ctx) => {
    const message = await getLuckyNumbersMessage();

    await ctx.reply(message);
});
