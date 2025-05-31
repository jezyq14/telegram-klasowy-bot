import { Context } from "telegraf";

import { client } from "../..";

export class Command {
    constructor(
        public name: string,
        public run: (ctx: Context) => Promise<void>
    ) {
        client.command(name, async (ctx) => {
            try {
                await this.run(ctx);
            } catch (error) {
                console.error(`Error executing command ${this.name}:`, error);
                await ctx.reply(
                    "Code broke, very sad. Buy 2003 Toyota Corolla to fix."
                );
            }
        });
    }
}
