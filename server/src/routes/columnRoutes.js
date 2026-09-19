import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { createColumnSchema, updateColumnSchema, reorderColumnsSchema } from '../schemas/columnSchema.js';
import * as controller from '../controllers/columnController.js';

const router = Router({ mergeParams: true });

router.get('/', controller.list);
router.post('/', validate(createColumnSchema), controller.create);
router.post('/reorder', validate(reorderColumnsSchema), controller.reorder);
router.patch('/:columnId', validate(updateColumnSchema), controller.update);
router.delete('/:columnId', controller.remove);

export default router;