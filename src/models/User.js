import db from '../config/database.js';

class User {
  static findByEmail(email) {
    const stmt = db.prepare('SELECT * FROM Users WHERE Email = ?');
    return stmt.get(email);
  }

  static findById(id) {
    const stmt = db.prepare('SELECT * FROM Users WHERE User_Id = ?');
    return stmt.get(id);
  }

  static create(userData) {
    const { nickname, email, password } = userData;
    
    const statusStmt = db.prepare('INSERT INTO Status (Points, Wins, Loses, XP, Games) VALUES (0, 0, 0, 0, 0)');
    const statusResult = statusStmt.run();
    const statusId = statusResult.lastInsertRowid;

    const userStmt = db.prepare(
      'INSERT INTO Users (Nickname, Email, Password, Status_ID) VALUES (?, ?, ?, ?)'
    );
    const result = userStmt.run(nickname, email, password, statusId);

    return {
      userId: result.lastInsertRowid,
      nickname,
      email,
      statusId
    };
  }

  static exists(email) {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM Users WHERE Email = ?');
    const result = stmt.get(email);
    return result.count > 0;
  }

  static createHistory(userId) {
    const historyStmt = db.prepare('INSERT INTO History (Game_IDs) VALUES (?)');
    const historyResult = historyStmt.run('[]');
    const historyId = historyResult.lastInsertRowid;

    const updateUserStmt = db.prepare('UPDATE Users SET History_ID = ? WHERE User_Id = ?');
    updateUserStmt.run(historyId, userId);

    return historyId;
  }

  static getHistory(userId) {
    const user = this.findById(userId);
    if (!user || !user.History_ID) return null;

    const stmt = db.prepare('SELECT * FROM History WHERE Historic_ID = ?');
    return stmt.get(user.History_ID);
  }

  static updateHistoryId(userId, historyId) {
    const stmt = db.prepare('UPDATE Users SET History_ID = ? WHERE User_Id = ?');
    const result = stmt.run(historyId, userId);
    return result.changes > 0;
  }

  static getStatus(statusId) {
    if (!statusId) return null;
    const stmt = db.prepare('SELECT * FROM Status WHERE Status_ID = ?');
    return stmt.get(statusId);
  }
}

export default User;


