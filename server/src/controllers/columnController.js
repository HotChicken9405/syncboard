import * as columnService from '../services/columnService.js';
import { getIO } from '../socket/io.js';
import { emitToBoard } from '../socket/socketHandler.js';

export async function list(req, res, next) {
  try {
    const columns = await columnService.list(req.params.boardId);
    res.json({ data: columns });
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const column = await columnService.create(req.params.boardId, req.user.id, req.body);
    res.status(201).json({ data: column });
    emitToBoard(getIO(), req.params.boardId, 'column:created', column);
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const column = await columnService.update(req.params.columnId, req.user.id, req.body);
    res.json({ data: column });
    emitToBoard(getIO(), req.params.boardId, 'column:updated', column);
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    await columnService.remove(req.params.columnId, req.user.id);
    res.status(204).send();
    emitToBoard(getIO(), req.params.boardId, 'column:deleted', { columnId: req.params.columnId });
  } catch (err) { next(err); }
}

export async function reorder(req, res, next) {
  try {
    await columnService.reorder(req.params.boardId, req.user.id, req.body.orderedIds);
    res.json({ data: { message: 'Reordered' } });
    emitToBoard(getIO(), req.params.boardId, 'column:reordered', { orderedIds: req.body.orderedIds });
  } catch (err) { next(err); }
}