import * as boardService from '../services/boardService.js';

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