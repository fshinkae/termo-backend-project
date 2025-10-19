import express from 'express';
import {
  addFriend,
  acceptFriend,
  removeFriend,
  blockUser,
  getFriends,
  getPendingRequests,
  getSentRequests,
  getBlocked
} from '../controllers/friendController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { validateFriendRequest, validateFriendId } from '../middlewares/validation.js';

const router = express.Router();

router.post('/add', authenticateToken, validateFriendRequest, addFriend);
router.post('/accept/:friendId', authenticateToken, validateFriendId, acceptFriend);
router.delete('/remove/:friendId', authenticateToken, validateFriendId, removeFriend);
router.post('/block/:friendId', authenticateToken, validateFriendId, blockUser);

router.get('/list', authenticateToken, getFriends);
router.get('/requests/pending', authenticateToken, getPendingRequests);
router.get('/requests/sent', authenticateToken, getSentRequests);
router.get('/blocked', authenticateToken, getBlocked);

export default router;

