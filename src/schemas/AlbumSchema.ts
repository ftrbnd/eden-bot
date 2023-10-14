import mongoose from 'mongoose';

export interface AlbumDocument extends mongoose.Document {
  _id?: string;
  album: string;
  tracks: string[];
}

const AlbumSchema = new mongoose.Schema<AlbumDocument>(
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
    ]
  },
  { versionKey: false }
);

export default mongoose.models.Album || mongoose.model<AlbumDocument>('Album', AlbumSchema);
