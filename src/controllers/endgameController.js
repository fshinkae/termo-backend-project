import Stats from '../models/Stats.js';

export const finishGame = async (req, res) => {
    try {
        const userId = req.userId;
        const { score, win, lose } = req.body;

        const updatedStats = await Stats.update(userId, { points: score, win: win, lose: lose });

        if (!updatedStats) {
        return res.status(404).json({
            error: 'Not Found',
            message: 'User stats not found'
        });
        }

        return res.status(200).json(updatedStats);
    } catch (err) {
        console.error(err);
        return res.status(500).json({
        error: 'Internal Server Error'
        });
    }
};