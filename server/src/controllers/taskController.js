import * as taskService from '../services/taskService.js';

export async function list(req, res, next) {
  try {
    const tasks = await taskService.list(req.user.id, req.params.boardId);
    res.json({ data: tasks });
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const task = await taskService.create(
      req.body,
      req.user.id,
      req.params.boardId,
      { id: req.user.id, name: req.user.name }
    );
    res.status(201).json({ data: task });
  } catch (err) { next(err); }
}

export async function getOne(req, res, next) {
  try {
    const task = await taskService.getOne(req.params.id, req.user.id);
    res.json({ data: task });
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const task = await taskService.update(
      req.params.id,
      req.body,
      req.user.id,
      { id: req.user.id, name: req.user.name }
    );
    res.json({ data: task });
  } catch (err) { next(err); }
}

export async function reorder(req, res, next) {
  try {
    await taskService.reorder(req.params.boardId, req.user.id, req.body.orderedIds);
    res.json({ data: { message: 'Reordered' } });
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    await taskService.remove(req.params.id, req.user.id);
    res.status(204).send();
  } catch (err) { next(err); }
}