import { supabase, dbType } from '../config/database.js';
import { UserSQLite } from './UserSQLite.js';
import bcrypt from 'bcryptjs';

export class User {
  static async create({ nickname, email, password }) {
    if (dbType === 'sqlite') {
      return UserSQLite.create({ nickname, email, password });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('Users')
      .insert([
        {
          Nickname: nickname,
          Email: email,
          Password: hashedPassword
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async findByEmail(email) {
    if (dbType === 'sqlite') {
      return UserSQLite.findByEmail(email);
    }

    const { data, error } = await supabase
      .from('Users')
      .select('*')
      .eq('Email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async findById(userId) {
    if (dbType === 'sqlite') {
      return UserSQLite.findById(userId);
    }

    const { data, error } = await supabase
      .from('Users')
      .select('User_id, Nickname, Email')
      .eq('User_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  static async comparePassword(plainPassword, hashedPassword) {
    if (dbType === 'sqlite') {
      return UserSQLite.comparePassword(plainPassword, hashedPassword);
    }

    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

