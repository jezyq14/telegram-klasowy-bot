export * from "./SendedSubstitutions";

import { getModelForClass } from "@typegoose/typegoose";

import { SendedSubstitutions } from "./SendedSubstitutions";

export const sendedSubstitutionsModel = getModelForClass(SendedSubstitutions, {
    schemaOptions: {
        timestamps: true,
    },
});
