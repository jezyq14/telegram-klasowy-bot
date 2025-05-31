import { Message } from "telegraf/typings/core/types/typegram";
import { client } from "..";
import { Command } from "../lib";

const daysOfTheWeek = [
    "Niedziela",
    "Poniedziałek",
    "Wtorek",
    "Środa",
    "Czwartek",
    "Piątek",
    "Sobota",
];

new Command("changedlessons", async (ctx) => {
    const args = (ctx.message as Message.TextMessage).text.split(" ").slice(1);

    const fromDate = args[0] ? new Date(args[0]) : new Date();
    const toDate = args[1]
        ? new Date(args[1])
        : new Date(fromDate.getTime() + 24 * 60 * 60 * 1000);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        return ctx.reply(
            "Silnik Toyoty Corolli 2003 się zepsuł. Użyj dat w formacje YYYY-MM-DD."
        );
    }

    const changedLessons = (
        await client.hebece.getChangedLessons(fromDate, toDate)
    ).Envelope.filter((lesson) => !!lesson.Change);

    const response = changedLessons.map((l) => {
        if (l.Substitution.TeacherPrimary)
            return `*${l.Date.DateDisplay} (${
                daysOfTheWeek[new Date(l.Date.Date).getDay()]
            }) lekcja ${l.TimeSlot.Position}* ${l.Subject.Name} -> ${
                l.Substitution.TeacherPrimary.DisplayName
            }`;
    });

    if (response.length > 0) {
        return ctx.reply(response.join("\n"), {
            parse_mode: "Markdown",
        });
    } else {
        return ctx.reply("W Toyocie nie ma płynu do kierunkowskazów.");
    }
});
