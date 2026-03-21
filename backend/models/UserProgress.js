
const { mysqlPool } = require('../config/database');

class UserProgress {
  static async saveProgress(userId, scenarioId, progressData) {
    const { score, maxScore, timeTaken, actionsTaken, hintsUsed, completed } = progressData;
    const [existing] = await mysqlPool.query(
      'SELECT MAX(attempt_number) as max_attempt FROM user_progress WHERE user_id = ? AND scenario_id = ?',
      [userId, scenarioId]
    );
    const attemptNumber = (existing[0].max_attempt || 0) + 1;
    const query = `INSERT INTO user_progress (user_id, scenario_id, score, max_score, time_taken, actions_taken, hints_used, completed, attempt_number, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
    const [result] = await mysqlPool.query(query, [
      userId, scenarioId, score, maxScore, timeTaken,
      JSON.stringify(actionsTaken), hintsUsed, completed, attemptNumber
    ]);
    await UserProgress.updateLeaderboard(userId);
    return result.insertId;
  }

  static async getUserProgress(userId) {
    try {
      const query = `
        SELECT 
          up.id, up.user_id, up.scenario_id, up.score, up.max_score, 
          up.time_taken, up.hints_used, up.completed, up.completed_at, 
          up.attempt_number,
          s.title, s.role, s.difficulty, s.category, 
          s.max_score as scenario_max_score
        FROM user_progress up
        JOIN scenarios s ON up.scenario_id = s.id
        WHERE up.user_id = ?
        ORDER BY up.completed_at DESC
      `;
      const [rows] = await mysqlPool.query(query, [userId]);
      return rows.map(row => ({
        ...row,
        actions_taken: []
      }));
    } catch (error) {
      console.error('getUserProgress error:', error);
      return [];
    }
  }

  static async getUserStats(userId) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_attempts,
          SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed_scenarios,
          AVG(CASE WHEN completed = 1 THEN score ELSE NULL END) as avg_score,
          SUM(time_taken) as total_time,
          MAX(score) as best_score
        FROM user_progress
        WHERE user_id = ?
      `;
      const [rows] = await mysqlPool.query(query, [userId]);
      return rows[0];
    } catch (error) {
      console.error('getUserStats error:', error);
      return {};
    }
  }

  static async getPerformanceByRole(userId) {
    try {
      const query = `
        SELECT 
          s.role,
          COUNT(*) as attempts,
          SUM(CASE WHEN up.completed = 1 THEN 1 ELSE 0 END) as completed,
          AVG(CASE WHEN up.completed = 1 THEN up.score ELSE NULL END) as avg_score
        FROM user_progress up
        JOIN scenarios s ON up.scenario_id = s.id
        WHERE up.user_id = ?
        GROUP BY s.role
      `;
      const [rows] = await mysqlPool.query(query, [userId]);
      return rows;
    } catch (error) {
      console.error('getPerformanceByRole error:', error);
      return [];
    }
  }

  static async updateLeaderboard(userId) {
    try {
      const [stats] = await mysqlPool.query(
        'SELECT SUM(score) as total_score, COUNT(DISTINCT scenario_id) as scenarios_completed FROM user_progress WHERE user_id = ? AND completed = 1',
        [userId]
      );
      const { total_score, scenarios_completed } = stats[0];
      await mysqlPool.query(
        'INSERT INTO leaderboard (user_id, total_score, scenarios_completed) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE total_score = VALUES(total_score), scenarios_completed = VALUES(scenarios_completed)',
        [userId, total_score || 0, scenarios_completed || 0]
      );
      await UserProgress.updateRankings();
    } catch (error) {
      console.error('updateLeaderboard error:', error);
    }
  }

  static async updateRankings() {
    try {
      const query = `
        UPDATE leaderboard l1
        JOIN (
          SELECT user_id, 
          ROW_NUMBER() OVER (ORDER BY total_score DESC, scenarios_completed DESC) as new_rank
          FROM leaderboard
        ) l2 ON l1.user_id = l2.user_id
        SET l1.rank_position = l2.new_rank
      `;
      await mysqlPool.query(query);
    } catch (error) {
      console.error('updateRankings error:', error);
    }
  }

  static async getLeaderboard(limit = 10) {
    try {
      const query = `
        SELECT 
          l.rank_position,
          u.username,
          u.full_name,
          l.total_score,
          l.scenarios_completed,
          l.last_updated
        FROM leaderboard l
        JOIN users u ON l.user_id = u.id
        ORDER BY l.rank_position
        LIMIT ?
      `;
      const [rows] = await mysqlPool.query(query, [limit]);
      return rows;
    } catch (error) {
      console.error('getLeaderboard error:', error);
      return [];
    }
  }
}

module.exports = UserProgress;