import mongoose from 'mongoose';

const columnSchema = new mongoose.Schema({
  name:      { type: String, required: true, minlength: 1 },
  boardId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  position:  { type: Number, default: 0 },
  color:     { type: String, default: '#111111' },
}, { timestamps: true });

export const Column = mongoose.model('Column', columnSchema);