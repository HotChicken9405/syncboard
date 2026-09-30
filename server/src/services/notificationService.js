import { Notification } from '../models/Notification.js';

export async function create(data) {
  return Notification.create(data);
}

export async function list(userId) {
  return Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(50);
}

export async function markRead(userId, notificationId) {
  return Notification.updateOne(
    { _id: notificationId, userId },
    { read: true }
  );
}

export async function markAllRead(userId) {
  return Notification.updateMany({ userId, read: false }, { read: true });
}

export async function getOne(notificationId, userId) {
  return Notification.findOne({ _id: notificationId, userId });
}

export async function updateStatus(notificationId, status) {
  return Notification.updateOne({ _id: notificationId }, { status, read: true });
}