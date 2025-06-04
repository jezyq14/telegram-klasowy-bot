import { prop } from "@typegoose/typegoose";

export class SendedSubstitutions {
    @prop({ required: true })
    public substitutionId!: string;
}
