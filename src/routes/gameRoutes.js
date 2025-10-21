import express from 'express';
import { finishGame } from '../controllers/endgameController.js';
import { validateGameFinish } from '../middlewares/validation.js';
import { fakeJWT } from '../utils/auth.js';

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
