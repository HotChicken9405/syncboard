import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:      {
    type: String,
    enum: ['board_invite', 'invite_accepted', 'invite_declined', 'removed_from_board'],
    required: true,
  },
  message:   { type: String, required: true },
  boardId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Board' },
  boardName: { type: String },
  fromUser:  {
    id:   mongoose.Schema.Types.ObjectId,
    name: String,
  },
  read:      { type: Boolean, default: false },
  status:    { type: String, enum: ['pending', 'accepted', 'declined', 'none'], default: 'none' },
}, { timestamps: true });

export const Notification = mongoose.model('Notification', notificationSchema);