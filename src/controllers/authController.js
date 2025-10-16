import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (User.exists(email)) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Email already registered'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = User.create({
      nickname: name,
      email,
      password: hashedPassword
    });

    const token = generateToken({ 
      userId: newUser.userId, 
      email: newUser.email 
    });

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.userId,
        nickname: newUser.nickname,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred during registration'
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = User.findByEmail(email);

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid credentials'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.Password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid credentials'
      });
    }

    const token = generateToken({
      userId: user.User_Id,
      email: user.Email
    });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.User_Id,
        nickname: user.Nickname,
        email: user.Email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred during login'
    });
  }
};

