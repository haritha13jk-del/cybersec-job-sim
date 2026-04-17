const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    full_name: {
      type: String,
    },
    role: {
      type: String,
      default: 'student',
    },
  },
  { timestamps: true }
);

/* ================= REGISTER ================= */
userSchema.statics.register = async function (username, email, password, fullName, role = 'student') {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await this.create({
    username,
    email,
    password: hashedPassword,
    full_name: fullName,
    role,
  });

  return user._id;
};

/* ================= FIND BY EMAIL ================= */
userSchema.statics.findByEmail = async function (email) {
  return this.findOne({ email });
};

/* ================= FIND BY ID ================= */
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password; // 🔥 hide password
  return obj;
};

userSchema.statics.getById = async function (id) {
  return this.findById(id).select('-password');
};

/* ================= VERIFY PASSWORD ================= */
userSchema.statics.verifyPassword = async function (plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
};

/* ================= UPDATE PROFILE ================= */
userSchema.statics.updateProfile = async function (userId, updates) {
  const allowedFields = ['full_name', 'username'];

  const filteredUpdates = {};
  for (const key of allowedFields) {
    if (updates[key]) {
      filteredUpdates[key] = updates[key];
    }
  }

  if (Object.keys(filteredUpdates).length === 0) {
    throw new Error('No valid fields to update');
  }

  return this.findByIdAndUpdate(userId, filteredUpdates, {
    new: true,
  }).select('-password');
};

module.exports = mongoose.model('User', userSchema);