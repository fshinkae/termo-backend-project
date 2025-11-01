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

export const getUser = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({
        error: 'Unavailable Field',
        message: 'User ID not found in token'
      });
    }

    const user = User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    const status = User.getStatus(user.Status_ID);

    return res.status(200).json({
      message: 'User retrieved successfully',
      user: {
        id: user.User_Id,
        nickname: user.Nickname,
        email: user.Email,
        avatar: user.Avatar,
        status: status ? {
          statusId: status.Status_ID,
          points: status.Points,
          wins: status.Wins,
          loses: status.Loses,
          xp: status.XP,
          games: status.Games
        } : null
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while retrieving user data'
    });
  }
};

export const searchUser = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email || email.trim() === '') {
      return res.status(400).json({
        error: 'Unavailable Field',
        message: 'Email is required'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Unavailable Field',
        message: 'Invalid email format'
      });
    }

    const user = User.findByEmail(email.trim());

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    return res.status(200).json({
      message: 'User found',
      user: {
        id: user.User_Id,
        nickname: user.Nickname,
        email: user.Email,
        avatar: user.Avatar
      }
    });
  } catch (error) {
    console.error('Search user error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while searching for user'
    });
  }
};

