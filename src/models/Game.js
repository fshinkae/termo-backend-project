import db from '../config/database.js';
import crypto from 'crypto';

class Game {
  static create({ userId, keywordId, tries, isWin, xp, points }) {
    const gameId = crypto.randomUUID();
    const stmt = db.prepare(`
      INSERT INTO Game (Game_ID, User_ID, Keyword_ID, Tries, isWin, XP, Points)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(gameId, userId, keywordId, tries, isWin ? 1 : 0, xp, points);
    return gameId;
  }

  static findById(id) {
    const stmt = db.prepare('SELECT * FROM Game WHERE Game_ID = ?');
    return stmt.get(id);
  }

  static findByUserId(userId) {
    const stmt = db.prepare('SELECT * FROM Game WHERE User_ID = ? ORDER BY Created_at DESC');
    return stmt.all(userId);
  }

  static findByKeywordId(keywordId) {
    const stmt = db.prepare('SELECT * FROM Game WHERE Keyword_ID = ?');
    return stmt.all(keywordId);
  }

  static getAll() {
    const stmt = db.prepare('SELECT * FROM Game ORDER BY Created_at DESC');
    return stmt.all();
  }

  static update(id, { tries, isWin, xp, points }) {
    const stmt = db.prepare(`
      UPDATE Game 
      SET Tries = ?, isWin = ?, XP = ?, Points = ?
      WHERE Game_ID = ?
    `);
    const result = stmt.run(tries, isWin ? 1 : 0, xp, points, id);
    return result.changes > 0 ? this.findById(id) : null;
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM Game WHERE Game_ID = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

export default Game;
