import express from 'express';
import authRoutes from './authRoutes.js';
import gameRoutes from './gameRoutes.js';

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/game', gameRoutes);

export default router;