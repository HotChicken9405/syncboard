import * as boardService from '../services/boardService.js';
import { getIO } from '../socket/io.js';
import { emitToBoard, emitToUser } from '../socket/socketHandler.js';

export async function list(req, res, next) {
  try {
    const boards = await boardService.list(req.user.id);
    res.json({ data: boards });
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const board = await boardService.create(req.body, req.user.id);
    res.status(201).json({ data: board });
  } catch (err) { next(err); }
}

export async function getOne(req, res, next) {
  try {
    const board = await boardService.getOne(req.params.id, req.user.id);
    res.json({ data: board });
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const board = await boardService.update(req.params.id, req.body, req.user.id);
    res.json({ data: board });
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    const members = await boardService.getMembers(req.params.id, req.user.id);
    await boardService.remove(req.params.id, req.user.id);
    res.status(204).send();
    emitToBoard(getIO(), req.params.id, 'board:deleted', { boardId: req.params.id });
    members.forEach(m => {
      if (String(m.userId) !== String(req.user.id)) {
        emitToUser(getIO(), String(m.userId), 'boards:refresh', {});
        emitToUser(getIO(), String(m.userId), 'board:deleted', { boardId: req.params.id });
      }
    });
  } catch (err) { next(err); }
}

export async function invite(req, res, next) {
  try {
    const { email } = req.body;
    const { notification, invitee } = await boardService.invite(
      req.params.id, req.user.id, email, req.user.name
    );
    res.status(201).json({ data: { message: `Invitation sent to ${invitee.email}` } });
    emitToUser(getIO(), String(invitee._id), 'notify:new', notification);
  } catch (err) { next(err); }
}

export async function removeMember(req, res, next) {
  try {
    const { board, notification } = await boardService.removeMember(
      req.params.id, req.user.id, req.params.userId
    );
    res.status(204).send();
    emitToUser(getIO(), req.params.userId, 'notify:new', notification);
    emitToUser(getIO(), req.params.userId, 'boards:refresh', {});
    emitToUser(getIO(), req.params.userId, 'board:deleted', { boardId: req.params.id });
    emitToBoard(getIO(), req.params.id, 'board:member_removed', {
      userId: req.params.userId,
      boardId: req.params.id,
    });
  } catch (err) { next(err); }
}

export async function getMembers(req, res, next) {
  try {
    const members = await boardService.getMembers(req.params.id, req.user.id);
    res.json({ data: members });
  } catch (err) { next(err); }
}