import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from '../schemas/authSchema.js';
import * as controller from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.post('/register', validate(registerSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login);
router.get('/me', authenticate, controller.me);
router.patch('/me', authenticate, validate(updateProfileSchema), controller.updateProfile);
router.patch('/password', authenticate, validate(changePasswordSchema), controller.changePassword);
router.delete('/me', authenticate, controller.deleteAccount);

export default router;