import mongoose from 'mongoose';

export interface UserDocument extends mongoose.Document {
  _id?: string;
  discordId: string;
  username: string;
  birthday?: Date;
  timezone?: string;
  warnings?: number;
  muteEnd?: Date;
}

const UserSchema = new mongoose.Schema<UserDocument>(
  {
    discordId: {
      type: mongoose.SchemaTypes.String,
      required: true
    },
    username: {
      type: mongoose.SchemaTypes.String,
      required: true
    },
    birthday: {
      type: mongoose.SchemaTypes.Date,
      require: false
    },
    timezone: {
      type: mongoose.SchemaTypes.String,
      require: false
    },
    warnings: {
      type: mongoose.SchemaTypes.Number,
      require: false
    },
    muteEnd: {
      type: mongoose.SchemaTypes.Date,
      require: false
    }
  },
  { versionKey: false }
);

export default mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);
