import config from "../../config";
import * as cheerio from "cheerio";
import { Client } from "../structures";

export interface GetLuckyNumbersData {
    luckyNumbers: number[];
    dayOfTheWeek: string;
}

export const getLuckyNumbers = async (): Promise<GetLuckyNumbersData> => {
    if (!config.schoolWebsiteUrl) {
        throw new Error(
            "School website URL is not configured. You need to set the SCHOOL_WEBSITE_URL in your environment variables."
        );
    }

    const html = await fetch(config.schoolWebsiteUrl).then((response) =>
        response.text()
    );

    const $ = cheerio.load(html);

    const output: GetLuckyNumbersData = {
        luckyNumbers: [],
        dayOfTheWeek: "",
    };

    $("#rest .date .day").each((index, element) => {
        output.luckyNumbers.push(parseInt($(element).text()));
    });

    output.dayOfTheWeek = $("#rest .date .month").first().text().trim();

    return output;
};

export const sendLuckyNumbers = async (
    client: Client,
    chatId: string = config.chatId
): Promise<void> => {
    const message = await getLuckyNumbersMessage();

    try {
        await client.telegram.sendMessage(chatId, message);
        console.log("Lucky numbers sent successfully.");
    } catch (err) {
        console.error("Failed to send lucky numbers:", err);
    }
};

export const getLuckyNumbersMessage = async () => {
    const data = await getLuckyNumbers();

    return `Szczęśliwe numerki na ${
        data.dayOfTheWeek
    }: ${data.luckyNumbers.join(", ")}`;
};
