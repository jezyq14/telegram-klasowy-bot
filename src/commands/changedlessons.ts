import { Message } from "telegraf/typings/core/types/typegram";
import { client } from "..";
import { Command } from "../lib";
import { LessonEnvelope } from "hebece/bin/types";

const daysOfTheWeek = [
    "niedziela",
    "poniedziałek",
    "wtorek",
    "środa",
    "czwartek",
    "piątek",
    "sobota",
];

const getLessonDisplay = (lesson: LessonEnvelope) => {
    const l = lesson;

    let lessonDisplay = `\`${lesson.TimeSlot.Position}.\``;

    /* Zmiana nauczyciela */
    if (l.Substitution.TeacherPrimary && !l.Substitution.Subject)
        lessonDisplay += `${l.Subject.Name} -> *${l.Substitution.TeacherPrimary.DisplayName}*`;
    /* Zmiana przedmiotu */ else if (
        l.Substitution.Subject &&
        !l.Substitution.TeacherPrimary
    )
        lessonDisplay += `${l.Subject.Name} -> *${l.Substitution.Subject.Name}*`;
    /* Zmiana nauczyciela i przedmiotu */ else if (
        l.Substitution.TeacherPrimary &&
        l.Substitution.Subject
    )
        lessonDisplay += `${l.Subject.Name} (${l.TeacherPrimary.DisplayName}) -> *${l.Substitution.Subject.Name}* (*${l.Substitution.TeacherPrimary.DisplayName}*)`;
    /* Pozostałe */ else {
        lessonDisplay += `${l.Subject.Name} -> *${l.Substitution.TeacherAbsenceEffectName}*`;
    }

    if (l.Substitution.Distribution) {
        lessonDisplay += ` (${l.Substitution.Distribution.Shortcut})`;
    }

    return lessonDisplay;
};

new Command({ name: "changedlessons" }, async (ctx) => {
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
    ).Envelope.filter((lesson) => !!lesson.Change).sort(
        (a, b) => a.Date.Timestamp - b.Date.Timestamp
    );

    const lessonsByDate = changedLessons.reduce((acc, lesson) => {
        const dateKey = `${lesson.Date.DateDisplay},${lesson.Date.Date}`;

        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }

        acc[dateKey].push(lesson);
        return acc;
    }, {} as Record<string, LessonEnvelope[]>);

    const response = Object.entries(lessonsByDate).map(([date, lessons]) => {
        const splittedDate = date.split(",");

        const displayDate = splittedDate[0];
        const dateObj = new Date(splittedDate[1]);
        const dayOfWeek = daysOfTheWeek[dateObj.getDay()];

        const lessonsDisplay = lessons.map(getLessonDisplay).join("\n");
        return `*${displayDate} (${dayOfWeek})*\n${lessonsDisplay}`;
    });

    if (response.length > 0) {
        return ctx.reply(response.join("\n\n"), {
            parse_mode: "Markdown",
        });
    } else {
        return ctx.reply("W Toyocie nie ma płynu do kierunkowskazów.");
    }
});
