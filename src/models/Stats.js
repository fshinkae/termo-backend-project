import db from '../config/database.js';

class Stats {
    static findById(id) {
        const stmt = db.prepare('SELECT * FROM Status WHERE Status_ID = ?');
        const playerStats = stmt.get(id);
        return playerStats;
    }

    static update(id, { points = 0, won = false, lost = false }) {
        const current = this.findById(id);
        if (!current) {
            throw new Error(`Stats not found for ID: ${id}`);
        }

        const newPoints = current.Points + points;
        const newWins = current.Wins + (won ? 1 : 0);
        const newLoses = current.Loses + (lost ? 1 : 0);

        let newRank = current.Rank;
        if (newPoints > 500) newRank = 'Mestre';
        else if (newPoints > 350) newRank = 'Especialista';
        else if (newPoints > 150) newRank = 'Profissional';
        else if (newPoints > 50) newRank = 'Amador';
        else newRank = current.Rank;

        const stmt = db.prepare('UPDATE Status SET Points = ?, Wins = ?, Loses = ?, Rank = ? WHERE Status_ID = ?');
        const result = stmt.run(newPoints, newWins, newLoses, newRank, id);

        return this.findById(id);
    }
}

export default Stats;
