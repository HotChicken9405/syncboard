import { Router } from 'express';
import * as controller from '../controllers/commentController.js';

const router = Router({ mergeParams: true });

router.get('/comments', controller.listComments);
router.post('/comments', controller.addComment);
router.delete('/comments/:commentId', controller.deleteComment);
router.get('/activity', controller.listActivity);

export default router;