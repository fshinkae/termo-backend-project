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
    
    const statusStmt = db.prepare('INSERT INTO Status (Points, Wins, Loses, Rank) VALUES (0, 0, 0, ?)');
    const statusResult = statusStmt.run('Iniciante');
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
}

export default User;


