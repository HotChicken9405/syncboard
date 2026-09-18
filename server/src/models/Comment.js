import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  taskId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
  author:  { id: mongoose.Schema.Types.ObjectId, name: String },
  text:    { type: String, required: true, minlength: 1 },
}, { timestamps: true });

export const Comment = mongoose.model('Comment', commentSchema);