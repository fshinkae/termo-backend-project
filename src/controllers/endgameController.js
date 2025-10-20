import Game from '../models/Game.js';
import History from '../models/History.js';
import Keyword from '../models/Keyword.js';
import User from '../models/User.js';

export const finishGame = async (req, res) => {
    try {
        const userId = req.userId;
        const { score, win, lose, tries = 0, keyword } = req.body;

        // 1. Verificar se usuário existe
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'User not found'
            });
        }

        // 2. SEND GAME INFO - Criar registro no Game DB
        let keywordId;
        if (keyword) {
            // Verificar se keyword já existe
            let existingKeyword = await Keyword.findByKeyword(keyword);
            if (!existingKeyword) {
                keywordId = await Keyword.create(keyword);
            } else {
                keywordId = existingKeyword.Keyword_ID;
            }
        } else {
            // Se não forneceu keyword, pegar uma aleatória
            const randomKeyword = await Keyword.getRandom();
            if (!randomKeyword) {
                return res.status(400).json({
                    error: 'Bad Request',
                    message: 'No keywords available in database'
                });
            }
            keywordId = randomKeyword.Keyword_ID;
        }

        // Calcular XP baseado no resultado
        const xp = win ? (score * 2) : (score * 0.5);
        
        const gameId = await Game.create({
            userId,
            keywordId,
            tries,
            isWin: win,
            xp: Math.floor(xp),
            points: score
        });

        // 3. SEND HISTORY STATS - Não precisa mais da tabela History
        // O histórico é diretamente por User_ID na tabela Game

        // Buscar dados completos do jogo criado
        const gameData = await Game.findById(gameId);
        const keywordData = await Keyword.findById(keywordId);

        return res.status(200).json({
            message: 'Game finished successfully',
            game: {
                id: gameId,
                keyword: keywordData.Keyword,
                tries: gameData.Tries,
                isWin: gameData.isWin === 1,
                xp: gameData.XP,
                points: gameData.Points,
                createdAt: gameData.Created_at
            }
        });

    } catch (err) {
        console.error('Error finishing game:', err);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to finish game'
        });
    }
};