import express from 'express';
import authRoutes from './authRoutes.js';
import gameRoutes from './gameRoutes.js';
import friendRoutes from './friendRoutes.js';
import userRoutes from './userRoutes.js'
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/game', gameRoutes);
router.use('/friend', friendRoutes);
router.use('/user',userRoutes);

export default router;