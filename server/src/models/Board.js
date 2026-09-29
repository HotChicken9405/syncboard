import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role:     { type: String, enum: ['owner', 'member'], default: 'member' },
  joinedAt: { type: Date, default: Date.now },
});

const boardSchema = new mongoose.Schema({
  name:        { type: String, required: true, minlength: 1 },
  description: { type: String, default: '' },
  color:       { type: String, default: '#d52b1e' },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members:     [memberSchema],
}, { timestamps: true });

export const Board = mongoose.model('Board', boardSchema);