import { Router } from 'express';
import { updateUserAvatar } from '../controllers/userController.js';
import { authenticate } from '../middleware/authenticate.js';
import { upload } from '../middleware/multer.js';
export const router = Router();

// PATCH /users/me/avatar
router.patch(
  '/users/me/avatar',
  authenticate,
  upload.single('avatar'), //назва поля з name
  updateUserAvatar,
);

export default router;
