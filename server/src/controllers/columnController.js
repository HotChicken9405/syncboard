import * as columnService from '../services/columnService.js';

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
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const column = await columnService.update(req.params.columnId, req.user.id, req.body);
    res.json({ data: column });
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    await columnService.remove(req.params.columnId, req.user.id);
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function reorder(req, res, next) {
  try {
    await columnService.reorder(req.params.boardId, req.user.id, req.body.orderedIds);
    res.json({ data: { message: 'Reordered' } });
  } catch (err) { next(err); }
}