import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title:     { type: String, required: true, minlength: 3 },
  description: { type: String, default: '' },
  assignee:  { type: String, default: 'Unassigned' },
  status:    { type: String, enum: ['todo', 'doing', 'done'], default: 'todo' },
  dueDate:   { type: Date },
  priority:  { type: String, enum: ['low', 'normal', 'high'], default: 'normal' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  boardId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
  position:  { type: Number, default: 0 },
  version:   { type: Number, default: 1 },
}, { timestamps: true });

export const Task = mongoose.model('Task', taskSchema);