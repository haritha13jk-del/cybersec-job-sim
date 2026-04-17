const mongoose = require('mongoose');

const ScenarioSchema = new mongoose.Schema({
  title: String,
  description: String,
  role: String,
  difficulty: String,
  category: String,
  mitre_technique: String,

  scenario_data: Object,
  correct_actions: [String],
  hints: [String],

  max_score: {
    type: Number,
    default: 100
  },

  time_limit: {
    type: Number,
    default: 1800
  }

}, { timestamps: true });

const ScenarioModel = mongoose.model('Scenario', ScenarioSchema);

class Scenario {

  static async getAll(filters = {}) {
    return await ScenarioModel.find(filters).sort({ createdAt: -1 });
  }

  static async getById(id) {
    return await ScenarioModel.findById(id);
  }

  static async getByRole(role) {
    return await ScenarioModel.find({ role });
  }

  static async create(data) {
    const scenario = new ScenarioModel(data);
    await scenario.save();
    return scenario._id;
  }

  static async getRandom(role, difficulty) {
    const results = await ScenarioModel.aggregate([
      { $match: { role, difficulty } },
      { $sample: { size: 1 } }
    ]);
    return results[0] || null;
  }
}

module.exports = Scenario;