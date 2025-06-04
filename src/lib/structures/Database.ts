import mongoose from "mongoose";
import { sendedSubstitutionsModel } from "..";

import config from "../../config";

export class Database {
    /* Modele */
    public sendedSubstitutions = sendedSubstitutionsModel;

    public constructor() {}

    public async connectToDatabase(): Promise<void> {
        if (mongoose.connection.readyState === 1) {
            console.log("Already connected to the database");
            return;
        }

        try {
            await mongoose.connect(config.mongoUri);
            console.log("Connected to database");
        } catch (error) {
            console.error("Error connecting to database: ", error);
            throw error;
        }
    }
}
