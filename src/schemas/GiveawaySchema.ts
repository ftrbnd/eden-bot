import mongoose from 'mongoose';

export interface GiveawayDocument {
  _id?: string;
  prize: string;
  description: string;
  endDate: Date;
  entries?: string[]; // user ids
  imageURL?: string;
}
const GiveawaySchema = new mongoose.Schema<GiveawayDocument>(
  {
    prize: {
      type: mongoose.SchemaTypes.String,
      required: true
    },
    description: {
      type: mongoose.SchemaTypes.String,
      required: true
    },
    endDate: {
      type: mongoose.SchemaTypes.Date,
      required: true
    },
    entries: [
      {
        type: mongoose.SchemaTypes.String,
        required: false
      }
    ],
    imageURL: {
      type: mongoose.SchemaTypes.String,
      required: false
    }
  },
  { versionKey: false }
);

export default mongoose.models.Giveaway || mongoose.model<GiveawayDocument>('Giveaway', GiveawaySchema);
