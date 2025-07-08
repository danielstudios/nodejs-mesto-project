import { Router } from 'express';
import {
  getUsers,
  getUserInfo,
  getUserById,
  updateUserProfile,
  updateUserAvatar,
} from '../controllers/users';

const router = Router();

router.get('/', getUsers);
router.get('/me', getUserInfo);
router.get('/:userId', getUserById);

router.patch('/me', updateUserProfile);
router.patch('/me/avatar', updateUserAvatar);

export default router;
