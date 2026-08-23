import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
}, { timestamps: true });

userSchema.methods.toPublic = function() {
  return {
    id: this._id,
    email: this.email,
    name: this.name,
  };
};

export const User = mongoose.model('User', userSchema);