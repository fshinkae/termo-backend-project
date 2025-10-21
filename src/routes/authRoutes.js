import express from 'express';
import { register, login, getUser } from '../controllers/authController.js';
import { validateRegister, validateLogin, validateCallerId } from '../middlewares/validation.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/user', validateCallerId, authenticateToken, getUser);

export default router;



