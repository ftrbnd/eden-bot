import mongoose from 'mongoose';

export interface MusicPermissionDocument {
  _id?: string;
  roleName: string;
  roleId: string;
}
const MusicPermissionSchema = new mongoose.Schema(
  {
    roleName: {
      type: mongoose.SchemaTypes.String,
      required: true
    },
    roleId: {
      type: mongoose.SchemaTypes.String,
      required: true
    }
  },
  { versionKey: false }
);

export default mongoose.models.MusicPermission || mongoose.model<MusicPermissionDocument>('MusicPermission', MusicPermissionSchema);
