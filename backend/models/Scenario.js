const { mysqlPool } = require('../config/database');

class Scenario {
  static parseScenario(row) {
    try {
      return {
        ...row,
        scenario_data: typeof row.scenario_data === 'string' ? JSON.parse(row.scenario_data) : row.scenario_data,
        correct_actions: typeof row.correct_actions === 'string' ? JSON.parse(row.correct_actions) : row.correct_actions,
        hints: row.hints ? (typeof row.hints === 'string' ? JSON.parse(row.hints) : row.hints) : []
      };
    } catch (e) {
      return {
        ...row,
        scenario_data: {},
        correct_actions: [],
        hints: []
      };
    }
  }

  static async getAll(filters = {}) {
    let query = 'SELECT * FROM scenarios WHERE 1=1';
    const params = [];
    if (filters.role) {
      query += ' AND role = ?';
      params.push(filters.role);
    }
    if (filters.difficulty) {
      query += ' AND difficulty = ?';
      params.push(filters.difficulty);
    }
    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }
    query += ' ORDER BY difficulty, created_at DESC';
    const [rows] = await mysqlPool.query(query, params);
    return rows.map(row => Scenario.parseScenario(row));
  }

  static async getById(id) {
    const query = 'SELECT * FROM scenarios WHERE id = ?';
    const [rows] = await mysqlPool.query(query, [id]);
    if (rows.length === 0) return null;
    return Scenario.parseScenario(rows[0]);
  }

  static async getByRole(role) {
    return await Scenario.getAll({ role });
  }

  static async create(scenarioData) {
    const { title, description, role, difficulty, category, mitre_technique, scenario_data, correct_actions, hints, max_score, time_limit } = scenarioData;
    const query = `INSERT INTO scenarios (title, description, role, difficulty, category, mitre_technique, scenario_data, correct_actions, hints, max_score, time_limit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await mysqlPool.query(query, [
      title, description, role, difficulty, category, mitre_technique,
      JSON.stringify(scenario_data), JSON.stringify(correct_actions),
      hints ? JSON.stringify(hints) : null, max_score || 100, time_limit || 1800
    ]);
    return result.insertId;
  }

  static async getRandom(role, difficulty) {
    const query = `SELECT * FROM scenarios WHERE role = ? AND difficulty = ? ORDER BY RAND() LIMIT 1`;
    const [rows] = await mysqlPool.query(query, [role, difficulty]);
    if (rows.length === 0) return null;
    return Scenario.parseScenario(rows[0]);
  }
}

module.exports = Scenario;