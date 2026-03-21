const { mysqlPool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async register(username, email, password, fullName, role = 'student') {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `INSERT INTO users (username, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await mysqlPool.query(query, [username, email, hashedPassword, fullName, role]);
    return result.insertId;
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await mysqlPool.query(query, [email]);
    return rows[0];
  }

  static async findById(id) {
    const query = `SELECT id, username, email, full_name, role, created_at FROM users WHERE id = ?`;
    const [rows] = await mysqlPool.query(query, [id]);
    return rows[0];
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateProfile(userId, updates) {
    const allowedFields = ['full_name', 'username'];
    const updateFields = [];
    const values = [];
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value) {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    }
    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }
    values.push(userId);
    const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    await mysqlPool.query(query, values);
    return await User.findById(userId);
  }
}

module.exports = User;