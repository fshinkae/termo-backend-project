import db from '../config/database.js';

class Friendship {
  static add(userId, friendId) {
    const stmt = db.prepare(
      'INSERT INTO Friendships (User_ID, Friend_ID, Status) VALUES (?, ?, ?)'
    );
    const result = stmt.run(userId, friendId, 'pending');
    return result.lastInsertRowid;
  }

  static accept(userId, friendId) {
    const updateStmt = db.prepare(
      'UPDATE Friendships SET Status = ?, Updated_At = CURRENT_TIMESTAMP WHERE User_ID = ? AND Friend_ID = ? AND Status = ?'
    );
    const result = updateStmt.run('accepted', friendId, userId, 'pending');

    if (result.changes === 0) {
      return false;
    }

    const insertStmt = db.prepare(
      'INSERT OR IGNORE INTO Friendships (User_ID, Friend_ID, Status) VALUES (?, ?, ?)'
    );
    insertStmt.run(userId, friendId, 'accepted');

    return true;
  }

  static remove(userId, friendId) {
    const stmt = db.prepare(
      'DELETE FROM Friendships WHERE (User_ID = ? AND Friend_ID = ?) OR (User_ID = ? AND Friend_ID = ?)'
    );
    const result = stmt.run(userId, friendId, friendId, userId);
    return result.changes > 0;
  }

  static block(userId, friendId) {
    const deleteStmt = db.prepare(
      'DELETE FROM Friendships WHERE User_ID = ? AND Friend_ID = ?'
    );
    deleteStmt.run(friendId, userId);

    const updateStmt = db.prepare(
      'UPDATE Friendships SET Status = ?, Updated_At = CURRENT_TIMESTAMP WHERE User_ID = ? AND Friend_ID = ?'
    );
    let result = updateStmt.run('blocked', userId, friendId);

    if (result.changes === 0) {
      const insertStmt = db.prepare(
        'INSERT INTO Friendships (User_ID, Friend_ID, Status) VALUES (?, ?, ?)'
      );
      result = insertStmt.run(userId, friendId, 'blocked');
    }

    return result.changes > 0 || result.lastInsertRowid > 0;
  }

  static getFriends(userId) {
    const stmt = db.prepare(`
      SELECT u.User_Id, u.Nickname, u.Email, u.Avatar, f.Created_At
      FROM Friendships f
      INNER JOIN Users u ON f.Friend_ID = u.User_Id
      WHERE f.User_ID = ? AND f.Status = 'accepted'
      ORDER BY u.Nickname ASC
    `);
    return stmt.all(userId);
  }

  static getPendingRequests(userId) {
    const stmt = db.prepare(`
      SELECT u.User_Id, u.Nickname, u.Email, u.Avatar, f.Created_At
      FROM Friendships f
      INNER JOIN Users u ON f.User_ID = u.User_Id
      WHERE f.Friend_ID = ? AND f.Status = 'pending'
      ORDER BY f.Created_At DESC
    `);
    return stmt.all(userId);
  }

  static getSentRequests(userId) {
    const stmt = db.prepare(`
      SELECT u.User_Id, u.Nickname, u.Email, u.Avatar, f.Created_At
      FROM Friendships f
      INNER JOIN Users u ON f.Friend_ID = u.User_Id
      WHERE f.User_ID = ? AND f.Status = 'pending'
      ORDER BY f.Created_At DESC
    `);
    return stmt.all(userId);
  }

  static getBlocked(userId) {
    const stmt = db.prepare(`
      SELECT u.User_Id, u.Nickname, u.Email, u.Avatar
      FROM Friendships f
      INNER JOIN Users u ON f.Friend_ID = u.User_Id
      WHERE f.User_ID = ? AND f.Status = 'blocked'
    `);
    return stmt.all(userId);
  }

  static exists(userId, friendId) {
    const stmt = db.prepare(
      'SELECT COUNT(*) as count FROM Friendships WHERE User_ID = ? AND Friend_ID = ?'
    );
    const result = stmt.get(userId, friendId);
    return result.count > 0;
  }

  static areFriends(userId, friendId) {
    const stmt = db.prepare(
      'SELECT COUNT(*) as count FROM Friendships WHERE User_ID = ? AND Friend_ID = ? AND Status = ?'
    );
    const result = stmt.get(userId, friendId, 'accepted');
    return result.count > 0;
  }

  static getStatus(userId, friendId) {
    const stmt = db.prepare(
      'SELECT Status FROM Friendships WHERE User_ID = ? AND Friend_ID = ?'
    );
    const result = stmt.get(userId, friendId);
    return result ? result.Status : null;
  }

  static isBlocked(userId, friendId) {
    const stmt = db.prepare(
      'SELECT COUNT(*) as count FROM Friendships WHERE User_ID = ? AND Friend_ID = ? AND Status = ?'
    );
    const result = stmt.get(userId, friendId, 'blocked');
    return result.count > 0;
  }
}

export default Friendship;

