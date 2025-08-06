import pool from '../configs/db-config.js';
import User from '../entities/user.js';

export default class UserRepository {
  async getUserByUsername(username) {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) return null;
    return new User(result.rows[0]);
  }

  async getUserByUsernameAndPassword(username, password) {
    const result = await pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);
    if (result.rows.length === 0) return null;
    return new User(result.rows[0]);
  }

  async createUser(user) {
    const result = await pool.query(
      'INSERT INTO users (first_name, last_name, username, password) VALUES ($1, $2, $3, $4) RETURNING *',
      [user.first_name, user.last_name, user.username, user.password]
    );
    return new User(result.rows[0]);
  }

  async checkUsernameExists(username) {
    const result = await pool.query('SELECT COUNT(*) FROM users WHERE username = $1', [username]);
    return result.rows[0].count > 0;
  }

  async findByUsername(username) {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) return null;
    return new User(result.rows[0]);
  }
} 