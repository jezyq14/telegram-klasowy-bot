import config from "../../config";
import * as cheerio from "cheerio";

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
