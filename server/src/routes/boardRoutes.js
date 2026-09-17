import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { createBoardSchema, updateBoardSchema } from '../schemas/boardSchema.js';
import * as controller from '../controllers/boardController.js';

const router = Router();

router.get('/', controller.list);
router.post('/', validate(createBoardSchema), controller.create);
router.get('/:id', controller.getOne);
router.patch('/:id', validate(updateBoardSchema), controller.update);
router.delete('/:id', controller.remove);

export default router;