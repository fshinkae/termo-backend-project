import express from 'express';
import { finishGame } from '../controllers/endgameController.js';
import { validateGameFinish } from '../middlewares/validation.js';
import { authenticateToken } from '../middlewares/auth.js';
import Keyword from '../models/Keyword.js';
import History from '../models/History.js';
import User from '../models/User.js';
import db from '../config/database.js';

const router = express.Router();

// Finalizar jogo
router.put('/finish', authenticateToken, validateGameFinish, finishGame);

// Obter palavra aleatória para jogo
router.get('/random-keyword', authenticateToken, async (req, res) => {
  try {
    const keyword = await Keyword.getRandom();
    if (!keyword) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'No keywords available'
      });
    }

    res.json({
      keywordId: keyword.Keyword_ID,
      keyword: keyword.Keyword
    });
  } catch (err) {
    console.error('Error getting random keyword:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get random keyword'
    });
  }
});

// Obter ranking de jogadores
router.get('/ranking', authenticateToken, async (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        u.User_Id as id,
        u.Nickname as name,
        u.Avatar as avatar,
        s.Points as points,
        s.Games as gamesPlayed,
        s.Wins as wins,
        s.Loses as loses,
        s.XP as xp,
        CASE 
          WHEN s.Games > 0 THEN ROUND((s.Wins * 100.0 / s.Games), 0)
          ELSE 0 
        END as winRate
      FROM Users u
      INNER JOIN Status s ON u.Status_ID = s.Status_ID
      WHERE s.Games > 0
      ORDER BY s.Points DESC, s.XP DESC
    `);
    
    const players = stmt.all();

    const ranking = players.map((player, index) => ({
      id: player.id,
      name: player.name,
      avatar: player.avatar || null,
      points: player.points || 0,
      gamesPlayed: player.gamesPlayed || 0,
      wins: player.wins || 0,
      loses: player.loses || 0,
      xp: player.xp || 0,
      winRate: player.winRate || 0,
      position: index + 1
    }));

    res.json({
      message: 'Ranking retrieved successfully',
      totalPlayers: ranking.length,
      ranking
    });
  } catch (err) {
    console.error('Error getting ranking:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get ranking'
    });
  }
});

// Obter histórico de jogos do usuário
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const userGames = await History.getUserHistory(userId);

    if (!userGames || userGames.length === 0) {
      return res.json({
        message: 'No game history found',
        games: []
      });
    }

    const games = [];

    for (const game of userGames) {
      const keyword = await Keyword.findById(game.Keyword_ID);
      games.push({
        id: game.Game_ID,
        keyword: keyword?.Keyword,
        tries: game.Tries,
        isWin: game.isWin === 1,
        xp: game.XP,
        points: game.Points,
        createdAt: game.Created_at
      });
    }

    res.json({
      message: 'Game history retrieved successfully',
      totalGames: games.length,
      games: games // Já ordenados por Created_at DESC
    });
  } catch (err) {
    console.error('Error getting game history:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get game history'
    });
  }
});

export default router;
