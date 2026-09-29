import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { createBoardSchema, updateBoardSchema } from '../schemas/boardSchema.js';
import * as controller from '../controllers/boardController.js';

const router = Router();

router.get('/',                    controller.list);
router.post('/', validate(createBoardSchema), controller.create);
router.get('/:id',                 controller.getOne);
router.patch('/:id', validate(updateBoardSchema), controller.update);
router.delete('/:id',              controller.remove);

// Member routes
router.get('/:id/members',         controller.getMembers);
router.post('/:id/invite',         controller.invite);
router.delete('/:id/members/:userId', controller.removeMember);

export default router;