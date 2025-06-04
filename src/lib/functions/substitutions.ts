import { LessonEnvelope } from "hebece/bin/types";
import { Client } from "../structures";
import config from "../../config";

export async function handleSubstitutions(client: Client) {
    const fromDate = new Date();
    const toDate = new Date(fromDate);
    toDate.setDate(fromDate.getDate() + 7);

    const changedLessons1 = (
        await client.hebece.getChangedLessons(fromDate, toDate)
    ).Envelope.filter((lesson) => !!lesson.Change);

    const changedLessons2 = (
        await client.hebece2.getChangedLessons(fromDate, toDate)
    ).Envelope.filter((lesson) => !!lesson.Change);

    const lessonsMap = new Map<number, LessonEnvelope>();
    [...changedLessons1, ...changedLessons2].forEach((lesson) => {
        lessonsMap.set(lesson.Id, lesson);
    });

    const changedLessons = Array.from(lessonsMap.values()).sort(
        (a, b) => a.Date.Timestamp - b.Date.Timestamp
    );

    changedLessons.forEach(async (lesson) => {
        if (
            await client.database.sendedSubstitutions.findOne({
                substitutionId: lesson.Substitution.Id,
            })
        )
            return;
        let text = "";

        switch (lesson.Change.Type) {
            case 1:
                text += "*Redukcja lekcji!*";
                break;
            case 2:
                text += `*Zastępstwo!*`;
                break;
            case 3:
                text += `*Przesunięta lekcja!*`;
                break;
            default:
                text += `*Zastępstwo!*`;
                break;
        }
        text += "\n\n";

        let lessonDisplay = `\`${lesson.Date.DateDisplay} ${lesson.TimeSlot.Position}.\` `;

        if (
            lesson.Substitution.TeacherPrimary &&
            !lesson.Substitution.Subject
        ) {
            lessonDisplay += `${lesson.Subject.Name} -> *${lesson.Substitution.TeacherPrimary.DisplayName}*`;
        } else if (
            lesson.Substitution.Subject &&
            !lesson.Substitution.TeacherPrimary
        ) {
            lessonDisplay += `${lesson.Subject.Name} -> *${lesson.Substitution.Subject.Name}*`;
        } else if (
            lesson.Substitution.TeacherPrimary &&
            lesson.Substitution.Subject
        ) {
            lessonDisplay += `${lesson.Subject.Name} -> *${lesson.Substitution.Subject.Name}* (*${lesson.Substitution.TeacherPrimary.DisplayName}*)`;
        } else {
            lessonDisplay += `${lesson.Subject.Name} -> *${
                lesson.Substitution.TeacherAbsenceEffectName ||
                "Toyota wypiła cały olej"
            }*`;
        }

        if (lesson.Substitution.Distribution) {
            lessonDisplay += ` (${lesson.Substitution.Distribution.Shortcut})`;
        }

        text += lessonDisplay;

        await client.telegram.sendMessage(config.telegram.chatId, text, {
            message_thread_id: config.telegram.threadId,
            parse_mode: "Markdown",
        });

        await client.database.sendedSubstitutions.create({
            substitutionId: lesson.Substitution.Id,
        });
    });
}
