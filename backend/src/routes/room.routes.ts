import { Router } from 'express';
import {
  getRooms, createRoom, joinRoom,
  getMessages, createDM, getUsers, getPublicRooms
} from '../controllers/room.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', getRooms);
router.get('/public', getPublicRooms);
router.post('/', createRoom);
router.post('/dm', createDM);
router.post('/:roomId/join', joinRoom);
router.get('/:roomId/messages', getMessages);
router.get('/users/all', getUsers);

export default router;