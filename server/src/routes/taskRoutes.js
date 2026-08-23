import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { createTaskSchema, updateTaskSchema } from '../schemas/taskSchema.js';
import * as controller from '../controllers/taskController.js';

const router = Router();

router.get('/', controller.list);
router.post('/', validate(createTaskSchema), controller.create);
router.get('/:id', controller.getOne);
router.patch('/:id', validate(updateTaskSchema), controller.update);
router.delete('/:id', controller.remove);

export default router;