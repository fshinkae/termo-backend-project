import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  try {
    const { nickname, email, password } = req.body;

    if (!nickname || !email || !password) {
      return res.status(400).json({ 
        error: 'Todos os campos são obrigatórios' 
      });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ 
        error: 'Email já cadastrado' 
      });
    }

    const user = await User.create({ nickname, email, password });

    const token = jwt.sign(
      { userId: user.User_id, email: user.Email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: {
        id: user.User_id,
        nickname: user.Nickname,
        email: user.Email
      },
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      error: 'Erro ao criar usuário' 
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email e senha são obrigatórios' 
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        error: 'Credenciais inválidas' 
      });
    }

    const isValidPassword = await User.comparePassword(password, user.Password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Credenciais inválidas' 
      });
    }

    const token = jwt.sign(
      { userId: user.User_id, email: user.Email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login realizado com sucesso',
      user: {
        id: user.User_id,
        nickname: user.Nickname,
        email: user.Email
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Erro ao fazer login' 
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'Usuário não encontrado' 
      });
    }

    res.json({
      user: {
        id: user.User_id,
        nickname: user.Nickname,
        email: user.Email
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar perfil' 
    });
  }
};

