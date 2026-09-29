import * as boardService from '../services/boardService.js';
import { io } from '../server.js';
import { emitToBoard } from '../socket/socketHandler.js';

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
    await boardService.remove(req.params.id, req.user.id);
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function invite(req, res, next) {
  try {
    const { email } = req.body;
    const { member, board } = await boardService.invite(req.params.id, req.user.id, email);
    res.status(201).json({ data: member });
    emitToBoard(io, req.params.id, 'board:member_added', { member, boardId: req.params.id });
  } catch (err) { next(err); }
}

export async function removeMember(req, res, next) {
  try {
    await boardService.removeMember(req.params.id, req.user.id, req.params.userId);
    res.status(204).send();
    emitToBoard(io, req.params.id, 'board:member_removed', {
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