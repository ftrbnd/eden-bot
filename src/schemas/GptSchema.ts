import mongoose from 'mongoose';

export interface GptDocument {
  _id?: string;
  parentMessageId: string;
}

const GptSchema = new mongoose.Schema<GptDocument>(
  {
    parentMessageId: {
      type: mongoose.SchemaTypes.String,
      required: true
    }
  },
  { versionKey: false }
);

export default mongoose.models.Gpt || mongoose.model<GptDocument>('Gpt', GptSchema);
