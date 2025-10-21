import db from '../config/database.js';

class History {
  static create() {
    const stmt = db.prepare(`
      INSERT INTO History (Game_IDs, Created_at)
      VALUES ('[]', CURRENT_TIMESTAMP)
    `);
    const result = stmt.run();
    return result.lastInsertRowid;
  }

  static findById(id) {
    const stmt = db.prepare('SELECT * FROM History WHERE Historic_ID = ?');
    return stmt.get(id);
  }

  static addGameId(historyId, gameId) {
    const history = this.findById(historyId);
    if (!history) {
      throw new Error(`History not found for ID: ${historyId}`);
    }

    let gameIds = JSON.parse(history.Game_IDs || '[]');
    gameIds.push(gameId);
    
    const stmt = db.prepare(`
      UPDATE History 
      SET Game_IDs = ?
      WHERE Historic_ID = ?
    `);
    const result = stmt.run(JSON.stringify(gameIds), historyId);
    return result.changes > 0;
  }

  static getGameIds(historyId) {
    const history = this.findById(historyId);
    if (!history) {
      return [];
    }
    return JSON.parse(history.Game_IDs || '[]');
  }

  static getUserHistory(userId) {
    // Buscar jogos diretamente da tabela Game por User_ID
    const stmt = db.prepare(`
      SELECT Game_ID, Keyword_ID, Tries, isWin, XP, Points, Created_at
      FROM Game 
      WHERE User_ID = ?
      ORDER BY Created_at DESC
    `);
    return stmt.all(userId);
  }

  static getAll() {
    const stmt = db.prepare('SELECT * FROM History ORDER BY Created_at DESC');
    return stmt.all();
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM History WHERE Historic_ID = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

export default History;
