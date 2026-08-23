import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, minlength: 3 },
  assignee: { type: String, default: 'Unassigned' },
  status: { type: String, enum: ['todo', 'doing', 'done'], default: 'todo' },
  dueDate: { type: Date },
  priority: { type: String, enum: ['low', 'normal', 'high'], default: 'normal' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const Task = mongoose.model('Task', taskSchema); 