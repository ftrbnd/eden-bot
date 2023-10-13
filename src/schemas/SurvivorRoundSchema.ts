import mongoose from 'mongoose';

export interface SurvivorRoundDocument {
  _id?: string;
  album: string;
  tracks: string[]; // song names
  votes: {};
  standings: string[]; // song names
  lastMessageId: string;
  roundNumber: number;
}

const SurvivorRoundSchema = new mongoose.Schema<SurvivorRoundDocument>(
  {
    album: {
      type: mongoose.SchemaTypes.String,
      required: true
    },
    tracks: [
      {
        type: mongoose.SchemaTypes.String,
        required: true
      }
    ],
    votes: {
      type: mongoose.SchemaTypes.Map, // song: userId
      of: mongoose.SchemaTypes.Array,
      required: true
    },
    standings: [
      {
        type: mongoose.SchemaTypes.String,
        required: false
      }
    ],
    lastMessageId: {
      type: mongoose.SchemaTypes.String,
      required: false
    },
    roundNumber: {
      type: mongoose.SchemaTypes.Number,
      required: false
    }
  },
  { versionKey: false }
);

export default mongoose.models.SurvivorRound || mongoose.model<SurvivorRoundDocument>('SurvivorRound', SurvivorRoundSchema);
