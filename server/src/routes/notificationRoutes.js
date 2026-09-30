import { Router } from 'express';
import * as controller from '../controllers/notificationController.js';

const router = Router();

router.get('/',                    controller.list);
router.patch('/read-all',          controller.markAllRead);
router.patch('/:id/read',          controller.markRead);
router.post('/:id/accept',         controller.accept);
router.post('/:id/decline',        controller.decline);

export default router;