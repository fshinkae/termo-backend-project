import { db } from '../config/sqlite.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export class UserSQLite {
  static create({ nickname, email, password }) {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const userId = uuidv4();

    const stmt = db.prepare(`
      INSERT INTO Users (User_id, Nickname, Email, Password)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(userId, nickname, email, hashedPassword);

    return {
      User_id: userId,
      Nickname: nickname,
      Email: email
    };
  }

  static findByEmail(email) {
    const stmt = db.prepare('SELECT * FROM Users WHERE Email = ?');
    return stmt.get(email);
  }

  static findById(userId) {
    const stmt = db.prepare('SELECT User_id, Nickname, Email FROM Users WHERE User_id = ?');
    return stmt.get(userId);
  }

  static comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compareSync(plainPassword, hashedPassword);
  }
}

