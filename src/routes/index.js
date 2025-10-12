import express from 'express';
import userRoutes from './userRoutes.js';

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

router.use('/users', userRoutes);

export default router;

