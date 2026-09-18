import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  taskId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
  author:  { id: mongoose.Schema.Types.ObjectId, name: String },
  action:  { type: String, required: true },
}, { timestamps: true });

export const Activity = mongoose.model('Activity', activitySchema);