import * as commentService from '../services/commentService.js';

export async function listComments(req, res, next) {
  try {
    const comments = await commentService.listComments(req.params.id);
    res.json({ data: comments });
  } catch (err) { next(err); }
}

export async function addComment(req, res, next) {
  try {
    const comment = await commentService.addComment(
      req.params.id,
      req.params.boardId,
      { id: req.user.id, name: req.user.name },
      req.body.text
    );
    res.status(201).json({ data: comment });
  } catch (err) { next(err); }
}

export async function deleteComment(req, res, next) {
  try {
    await commentService.deleteComment(req.params.commentId, req.user.id);
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function listActivity(req, res, next) {
  try {
    const activity = await commentService.listActivity(req.params.id);
    res.json({ data: activity });
  } catch (err) { next(err); }
}