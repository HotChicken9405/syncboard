import * as notificationService from '../services/notificationService.js';
import * as boardService from '../services/boardService.js';
import * as notifService from '../services/notificationService.js';
import { getIO } from '../socket/io.js';
import { emitToUser } from '../socket/socketHandler.js';

export async function list(req, res, next) {
  try {
    const notifications = await notificationService.list(req.user.id);
    res.json({ data: notifications });
  } catch (err) { next(err); }
}

export async function markRead(req, res, next) {
  try {
    await notificationService.markRead(req.user.id, req.params.id);
    res.json({ data: { message: 'Marked as read' } });
  } catch (err) { next(err); }
}

export async function markAllRead(req, res, next) {
  try {
    await notificationService.markAllRead(req.user.id);
    res.json({ data: { message: 'All marked as read' } });
  } catch (err) { next(err); }
}

export async function accept(req, res, next) {
  try {
    const notif = await notificationService.getOne(req.params.id, req.user.id);
    if (!notif || notif.type !== 'board_invite') {
      return res.status(404).json({ error: { message: 'Invitation not found' } });
    }
    if (notif.status !== 'pending') {
      return res.status(400).json({ error: { message: 'Invitation already responded to' } });
    }

    await boardService.acceptInvite(notif.boardId, req.user.id);
    await notificationService.updateStatus(notif._id, 'accepted');

    const ownerNotif = await notifService.create({
      userId:    notif.fromUser.id,
      type:      'invite_accepted',
      message:   `accepted your invitation to ${notif.boardName}`,
      boardId:   notif.boardId,
      boardName: notif.boardName,
      fromUser:  { id: req.user.id, name: req.user.name },
      status:    'none',
    });

    emitToUser(getIO(), String(notif.fromUser.id), 'notify:new', ownerNotif);
    emitToUser(getIO(), String(req.user.id), 'boards:refresh', {});

    getIO().to(String(notif.boardId)).emit('board:member_added', {
      member: { userId: req.user.id, name: req.user.name, role: 'member' },
    });

    res.json({ data: { message: 'Invitation accepted' } });
  } catch (err) { next(err); }
}

export async function decline(req, res, next) {
  try {
    const notif = await notificationService.getOne(req.params.id, req.user.id);
    if (!notif || notif.type !== 'board_invite') {
      return res.status(404).json({ error: { message: 'Invitation not found' } });
    }
    if (notif.status !== 'pending') {
      return res.status(400).json({ error: { message: 'Invitation already responded to' } });
    }

    await boardService.declineInvite(notif.boardId, req.user.id);
    await notificationService.updateStatus(notif._id, 'declined');

    const ownerNotif = await notifService.create({
      userId:    notif.fromUser.id,
      type:      'invite_declined',
      message:   `declined your invitation to ${notif.boardName}`,
      boardId:   notif.boardId,
      boardName: notif.boardName,
      fromUser:  { id: req.user.id, name: req.user.name },
      status:    'none',
    });

    emitToUser(getIO(), String(notif.fromUser.id), 'notify:new', ownerNotif);

    res.json({ data: { message: 'Invitation declined' } });
  } catch (err) { next(err); }
}