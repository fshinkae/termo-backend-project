import express from 'express';
import { finishGame } from '../controllers/endgameController.js';
import { validateGameFinish } from '../middlewares/validation.js';
import { fakeJWT } from '../utils/auth.js';

const router = express.Router();

router.put('/finish', fakeJWT, validateGameFinish, finishGame);

export default router;