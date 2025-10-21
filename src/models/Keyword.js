import db from '../config/database.js';

class Keyword {
  static create(keyword) {
    const stmt = db.prepare('INSERT INTO Keyword (Keyword) VALUES (?)');
    const result = stmt.run(keyword);
    return result.lastInsertRowid;
  }

  static findById(id) {
    const stmt = db.prepare('SELECT * FROM Keyword WHERE Keyword_ID = ?');
    return stmt.get(id);
  }

  static findByKeyword(keyword) {
    const stmt = db.prepare('SELECT * FROM Keyword WHERE Keyword = ?');
    return stmt.get(keyword);
  }

  static getAll() {
    const stmt = db.prepare('SELECT * FROM Keyword ORDER BY Keyword');
    return stmt.all();
  }

  static getRandom() {
    const stmt = db.prepare('SELECT * FROM Keyword ORDER BY RANDOM() LIMIT 1');
    return stmt.get();
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM Keyword WHERE Keyword_ID = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

export default Keyword;
