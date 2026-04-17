const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/* ================= SCHEMA ================= */

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
  },
  role: {
    type: String,
    default: 'student',
  },
}, { timestamps: true });

const UserModel = mongoose.model('User', UserSchema);

/* ================= CLASS ================= */

class User {

  // ✅ Register
  static async register(username, email, password, fullName, role = 'student') {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new UserModel({
      username,
      email,
      password: hashedPassword,
      fullName,
      role,
    });

    await user.save();

    return user._id;
  }

  // ✅ Find by Email
  static async findByEmail(email) {
    return await UserModel.findOne({ email });
  }

  // ✅ Find by ID
  static async findById(id) {
    return await UserModel.findById(id).select('-password');
  }

  // ✅ Verify Password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // ✅ Update Profile
  static async updateProfile(userId, updates) {
    const allowedFields = ['fullName', 'username'];

    const updateData = {};
    for (const key of allowedFields) {
      if (updates[key]) {
        updateData[key] = updates[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('No valid fields to update');
    }

    await UserModel.findByIdAndUpdate(userId, updateData);

    return await User.findById(userId);
  }
}

module.exports = User;