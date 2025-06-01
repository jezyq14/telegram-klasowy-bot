import { Context } from "telegraf";

import { client } from "../..";

type CommandData = {
    name: string;
    description?: string;
    usage?: string;
    aliases?: string[];
    category?: string;
};

export class Command {
    constructor(
        public data: CommandData,
        public run: (ctx: Context) => Promise<void | any>
    ) {
        client.command(this.data.name, async (ctx) => {
            try {
                await this.run(ctx);
            } catch (error) {
                console.error(
                    `Error executing command ${this.data.name}:`,
                    error
                );
                await ctx.reply(
                    "Code broke, very sad. Buy 2003 Toyota Corolla to fix."
                );
            }
        });
    }
}
