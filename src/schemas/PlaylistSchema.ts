import mongoose from 'mongoose';

export interface PlaylistDocument extends mongoose.Document {
  _id?: string;
  name: string;
  link: string;
}
const PlaylistSchema = new mongoose.Schema(
  {
    name: {
      type: mongoose.SchemaTypes.String,
      required: true
    },
    link: {
      type: mongoose.SchemaTypes.String,
      required: true
    }
  },
  { versionKey: false }
);

export default mongoose.models.Playlist || mongoose.model<PlaylistDocument>('Playlist', PlaylistSchema);
