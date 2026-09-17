import mongoose from 'mongoose';

const boardSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 1 },
  description: { type: String, default: '' },
  color: { type: String, default: '#d52b1e' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const Board = mongoose.model('Board', boardSchema);